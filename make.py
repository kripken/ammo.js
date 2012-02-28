#!/usr/bin/python

import os, sys, re, json, shutil
from subprocess import Popen, PIPE, STDOUT

# Startup

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

try:
  EMSCRIPTEN_ROOT
except:
  print "ERROR: Missing EMSCRIPTEN_ROOT (which should be equal to emscripten's root dir) in ~/.emscripten"
  sys.exit(1)

sys.path.append(EMSCRIPTEN_ROOT)
import tools.shared as emscripten

# Settings

'''
-O3 stuff:
          Settings.CORRECT_SIGNS = 0
          Settings.CORRECT_OVERFLOWS = 0
          Settings.CORRECT_ROUNDINGS = 0
          Settings.I64_MODE = 0
          Settings.DOUBLE_MODE = 0
'''
# -O2 works
# -O3 -s I64_MODE=1 -s DOUBLE_MODE=1 -s CORRECT_SIGNS=1 works
# -O3 -s I64_MODE=1 -s DOUBLE_MODE=1 almost ok, but they stay active forever
# -O2 -s I64_MODE=0 -s DOUBLE_MODE=0 fails
# -O3 fails
emcc_args = sys.argv[1:] or '-O3 -s DOUBLE_MODE=1 -s CORRECT_SIGNS=1 -s INLINING_LIMIT=0'.split(' ')

print
print '--------------------------------------------------'
print 'Building ammo.js, build type:', emcc_args
print '--------------------------------------------------'
print

'''
import os, sys, re

infile = open(sys.argv[1], 'r').read()
outfile = open(sys.argv[2], 'w')

t1 = infile
while True:
  t2 = re.sub(r'\(\n?!\n?1\n?\+\n?\(\n?!\n?1\n?\+\n?(\w)\n?\)\n?\)', lambda m: '(!1+' + m.group(1) + ')', t1)
  print len(infile), len(t2)
  if t1 == t2: break
  t1 = t2

outfile.write(t2)
'''

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

  Popen(['cpp', '-x', 'c++', '-I../src', '../../root.h'], stdout=open('headers.pre.h', 'w')).communicate()

  print 'Cleaning...'

  header_data = open('headers.pre.h', 'r').read()
  header_data = header_data.replace(' = btVector3(btScalar(0), btScalar(0), btScalar(0))', '') \
                           .replace('const btVehicleTuning& tuning', 'const btRaycastVehicle::btVehicleTuning& tuning') \
                           .replace('( void )', '()') \
                           .replace('(void)', '()') \
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
                           .replace('RaycastInfo&', 'btWheelInfo::RaycastInfo') \
                           .replace('btScalar', 'float') \
                           .replace('typedef float float;', '') \
                           .replace('STAGECOUNT+1', '17') \
                           .replace('BP_FP_INT_TYPE', 'double') \
                           .replace('Handle*', 'btAxisSweep3Internal<double>::Handle*') \
                           .replace(' = btTransform::getIdentity()', ' = btTransform::getIdentity') # This will not compile, but can be headerparsed
                           #.replace('BP_FP_INT_TYPE', 'int') \
  header_data = re.sub(r'struct ([\w\d :\n]+){', r'class \1 { public: ', header_data)

  h = open('headers.clean.h', 'w')
  h.write(header_data)
  h.close()

  print 'Processing...'

  Popen([emscripten.BINDINGS_GENERATOR, 'bindings', 'headers.clean.h', '--',
         # Ignore some things that CppHeaderParser has problems
         '{ "ignored": "btMatrix3x3::setFromOpenGLSubMatrix,btMatrix3x3::getOpenGLSubMatrix,btAlignedAllocator,btHashKey,btHashKeyPtr,'
         'btSortedOverlappingPairCache,btSimpleBroadphase::resetPool,btHashKeyPtr,btOptimizedBvh::setTraversalMode,btAlignedObjectArray,'
         'btDbvt,btMultiSapBroadphase,std,btHashedOverlappingPairCache,btDefaultSerializer,btWheelInfo::m_raycastInfo,btAABB,'
         'btContactArray,btPairCachingGhostObject::getOverlappingPairs,btGhostObject::getOverlappingPairs,Edge,Handle,'
         'btDbvtAabbMm::NotEqual,btDbvtAabbMm::Merge,btDbvtAabbMm::Select,btDbvtAabbMm::Proximity,btDbvtAabbMm::Intersect",'
         ''' "type_processor": "lambda t: t.replace('const float', 'float').replace('float &', 'float').replace('float&', 'float')",''' # Make our bindings use float and not float&
         ''' "export": 1 }'''],
        stdout=open('o', 'w'), stderr=STDOUT).communicate()

  #1/0.

  stage('Build bindings')

  emscripten.Building.make([emscripten.EMCC, '-I../src', '-include', '../../root.h', 'bindings.cpp', '-c', '-o', 'bindings.bc'])

  #1/0.

  if not os.path.exists('config.h'):
    stage('Configure')

    emscripten.Building.configure(['../configure', '--disable-demos','--disable-dependency-tracking'])

  stage('Make')

  emscripten.Building.make(['make', '-j', '2'])

  assert(os.path.exists('bindings.bc'))

  stage('Link')

  emscripten.Building.link(['bindings.bc',
                            os.path.join('src', '.libs', 'libBulletCollision.so'),
                            os.path.join('src', '.libs', 'libBulletDynamics.so'),
                            os.path.join('src', '.libs', 'libLinearMath.so')],
                           'libbullet.bc')

  assert os.path.exists('libbullet.bc'), 'Failed to create client'

  stage('emcc')

  emscripten.Building.emcc('libbullet.bc', emcc_args + ['--js-transform', 'python %s' % os.path.join('..', '..', 'bundle.py')],
                           os.path.join('..', '..', 'builds', 'ammo.js'))

  assert os.path.exists(os.path.join('..', '..', 'builds', 'ammo.js')), 'Failed to create script code'

finally:
  os.chdir(this_dir);

