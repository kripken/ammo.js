#!/usr/bin/python

FAST = 0 # Change this to 1 to generate an optimized build. Very slow to create.


DEBUG = 0
LLVM_OPT_OPTS = [] # ['-globalopt', '-ipsccp', '-deadargelim', '-simplifycfg', '-prune-eh', '-inline', '-functionattrs', '-argpromotion', '-simplify-libcalls', '-jump-threading', '-simplifycfg', '-tailcallelim', '-simplifycfg', '-reassociate', '-loop-rotate', '-licm', '-loop-unswitch', '-indvars', '-loop-deletion', '-loop-unroll', '-memcpyopt', '-sccp', '-jump-threading', '-correlated-propagation', '-dse', '-adce', '-simplifycfg', '-strip-dead-prototypes', '-deadtypeelim', '-globaldce', '-constmerge']
EMSCRIPTEN_SETTINGS = {
  'SKIP_STACK_IN_SMALL': 1, # use 0 for debugging, debugging output can be big
  'OPTIMIZE': 1,
  'RELOOP': FAST,
  'USE_TYPED_ARRAYS': 0, # TODO: Test if this helps or hurts
  'SAFE_HEAP': not FAST,
  'ASSERTIONS': not FAST,
  'INIT_STACK': 0,

  'AUTO_OPTIMIZE': 0,

  'CHECK_OVERFLOWS': 0,
  'CHECK_SIGNED_OVERFLOWS': 0,
  'CORRECT_OVERFLOWS': 0,

  'CHECK_SIGNS': 0,
  'CORRECT_SIGNS': 0,

  #CORRECT_ROUNDINGS?

  'QUANTUM_SIZE': 1 if FAST else 4,
}

#========================================================

import os, sys, re, json, shutil
from subprocess import Popen, PIPE, STDOUT

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

try:
  EMSCRIPTEN_ROOT
except:
  print "ERROR: Missing EMSCRIPTEN_ROOT (which should be equal to emscripten's root dir) in ~/.emscripten"
  sys.exit(1)

sys.path.append(EMSCRIPTEN_ROOT)
import tools.shared as shared

# Prep

if EMSCRIPTEN_SETTINGS['SAFE_HEAP']:
  # Ignore bitfield warnings
  EMSCRIPTEN_SETTINGS['SAFE_HEAP'] = 3
  EMSCRIPTEN_SETTINGS['SAFE_HEAP_LINES'] = ['btVoronoiSimplexSolver.h:40', 'btVoronoiSimplexSolver.h:41',
                                            'btVoronoiSimplexSolver.h:42', 'btVoronoiSimplexSolver.h:43']
  DEBUG = 1

# Utilities

stage_counter = 0
def stage(text):
  global stage_counter
  stage_counter += 1
  text = 'Stage %d: %s' % (stage_counter, text)
  print
  print '=' * len(text)
  print text
  print '=' * len(text)
  print

# Main

try:
  this_dir = os.getcwd()
  os.chdir('bullet')
  if not os.path.exists('build'):
    os.makedirs('build')
  os.chdir('build')

  stage('Generate bindings')

  print 'Preprocessing...'

  Popen(['cpp', '-x', 'c++', '-I../src', '../src/btBulletDynamicsCommon.h'], stdout=open('headers.pre.h', 'w')).communicate()

  print 'Cleaning...'

  header_data = open('headers.pre.h', 'r').read()
  header_data = header_data.replace(' = btVector3(btScalar(0), btScalar(0), btScalar(0))', '') \
                           .replace('const btVehicleTuning& tuning', 'const btRaycastVehicle::btVehicleTuning& tuning') \
                           .replace('( void )', '') \
                           .replace('(void)', '') \
                           .replace('btTraversalMode', 'btQuantizedBvh::btTraversalMode') \
                           .replace('btConstraintInfo1*', 'btTypedConstraint::btConstraintInfo1*') \
                           .replace('btConstraintInfo2*', 'btTypedConstraint::btConstraintInfo2*') \
                           .replace('btConstraintInfo2 *', 'btTypedConstraint::btConstraintInfo2*') \
                           .replace('btVehicleRaycasterResult&', 'btVehicleRaycaster::btVehicleRaycasterResult&') \
                           .replace('btRigidBodyConstructionInfo&', 'btRigidBody::btRigidBodyConstructionInfo&') \
                           .replace('RayResultCallback&', 'btCollisionWorld::RayResultCallback&') \
                           .replace('ContactResultCallback&', 'btCollisionWorld::ContactResultCallback&') \
                           .replace('ConvexResultCallback&', 'btCollisionWorld::ConvexResultCallback&') \
                           .replace('LocalShapeInfo*', 'btCollisionWorld::LocalShapeInfo*') \
                           .replace('IWriter*', 'btDbvt::IWriter*') \
                           .replace('=btVector3(0,0,0)', '=btVector3') \
                           .replace('RaycastInfo&', 'btWheelInfo::RaycastInfo^') \
                           .replace('btScalar', 'float') \
                           .replace('typedef float float;', '') \
                           .replace(' = btTransform::getIdentity()', ' = btTransform::getIdentity') # This will not compile, but can be headerparsed
  header_data = re.sub(r'struct ([\w\d :\n]+){', r'class \1 { public: ', header_data)

  h = open('headers.clean.h', 'w')
  h.write(header_data)
  h.close()

  print 'Processing...'

  Popen([shared.BINDINGS_GENERATOR, 'bindings', 'headers.clean.h', '--',
         # Ignore some things that CppHeaderParser has problems
         '{ "ignored": "btMatrix3x3::setFromOpenGLSubMatrix,btMatrix3x3::getOpenGLSubMatrix,btAlignedAllocator,btAxisSweep3Internal,btHashKey,btHashKeyPtr,'
         'btSortedOverlappingPairCache,btSimpleBroadphase::resetPool,btHashKeyPtr,btOptimizedBvh::setTraversalMode,btAlignedObjectArray,'
         'btDbvt,btMultiSapBroadphase,std,btHashedOverlappingPairCache,btDefaultSerializer",'
         ''' "type_processor": "lambda t: t.replace('const float', 'float').replace('float &', 'float').replace('float&', 'float')",''' # Make our bindings use float and not float&
         ''' "export": 1 }'''],
        stdout=open('o', 'w'), stderr=STDOUT).communicate()

  #1/0.

  stage('Build Bullet')

  env = os.environ.copy()
  env['EMMAKEN_COMPILER'] = shared.CLANG
  if DEBUG:
    env['CFLAGS'] = '-g'
  env['CC'] = env['CXX'] = env['RANLIB'] = env['AR'] = os.path.join(EMSCRIPTEN_ROOT, 'tools', 'emmaken.py')
  if not os.path.exists('config.h'):
    Popen(['../configure', '--disable-demos','--disable-dependency-tracking'], env=env).communicate()
  Popen(['make', '-j', '2'], env=env).communicate()

  stage('Build bindings')

  print Popen([env['EMMAKEN_COMPILER'], '-I../src', '-include', 'btBulletDynamicsCommon.h', 'bindings.cpp', '-emit-llvm', '-c', '-o', 'bindings.bc']).communicate()

  #1/0.

  assert(os.path.exists('bindings.bc'))

  stage('Link')

  Popen([shared.LLVM_LINK, os.path.join('src', '.libs', 'libBulletCollision.a'),
                           os.path.join('src', '.libs', 'libBulletDynamics.a'),
                           os.path.join('src', '.libs', 'libLinearMath.a'),
                           'bindings.bc',
                           '-o', 'libbullet.bc']).communicate()

  assert os.path.exists('libbullet.bc'), 'Failed to create client'

  if LLVM_OPT_OPTS:
    stage('LLVM optimizations')

    shutil.move('libbullet.bc', 'libbullet.bc.pre')
    output = Popen([shared.LLVM_OPT, 'libbullet.bc.pre'] + LLVM_OPT_OPTS + ['-o=libbullet.bc'], stdout=PIPE, stderr=STDOUT).communicate()

  stage('LLVM binary => LL assembly')

  Popen([shared.LLVM_DIS] + shared.LLVM_DIS_OPTS + ['libbullet.bc', '-o=libbullet.ll']).communicate()

  assert os.path.exists('libbullet.ll'), 'Failed to create assembly code'

  stage('Emscripten: LL assembly => JavaScript')

  settings = ['-s %s=%s' % (k, json.dumps(v)) for k, v in EMSCRIPTEN_SETTINGS.items()]

  Popen(['python', os.path.join(EMSCRIPTEN_ROOT, 'emscripten.py'), 'libbullet.ll'] + settings, stdout=open('libbullet.js', 'w'), stderr=STDOUT).communicate()

  assert os.path.exists('libbullet.js'), 'Failed to create script code'

finally:
  os.chdir(this_dir);

stage('Bundle')

bundle = open(os.path.join('builds', 'ammo.new.js'), 'w')
bundle.write(open(os.path.join('bullet', 'build', 'libbullet.js'), 'r').read())
bundle.write(open(os.path.join('bullet', 'build', 'bindings.js'), 'r').read())
bundle.close()

# Recommended: Also do closure compiler: java -jar /home/alon/Dev/closure-compiler-read-only/build/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --variable_map_output_file builds/ammo.vars --js builds/ammo.new.js --js_output_file builds/ammo.js

