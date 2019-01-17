#!/usr/bin/python

import os, sys, re, json, shutil, multiprocessing
from subprocess import Popen, PIPE, STDOUT

# Definitions

INCLUDES = ['btBulletDynamicsCommon.h',
os.path.join('BulletCollision', 'CollisionShapes', 'btHeightfieldTerrainShape.h'),
os.path.join('BulletCollision', 'CollisionShapes', 'btConvexPolyhedron.h'),
os.path.join('BulletCollision', 'CollisionShapes', 'btShapeHull.h'),
os.path.join('BulletCollision', 'CollisionDispatch', 'btGhostObject.h'),

os.path.join('BulletDynamics', 'Character', 'btKinematicCharacterController.h'),

os.path.join('BulletSoftBody', 'btSoftBody.h'),
os.path.join('BulletSoftBody', 'btSoftRigidDynamicsWorld.h'), os.path.join('BulletSoftBody', 'btDefaultSoftBodySolver.h'),
os.path.join('BulletSoftBody', 'btSoftBodyRigidBodyCollisionConfiguration.h'),
os.path.join('BulletSoftBody', 'btSoftBodyHelpers.h'),

os.path.join('..', '..', 'idl_templates.h')]

# Startup

stage_counter = 0

def which(program):
  for path in os.environ["PATH"].split(os.pathsep):
    exe_file = os.path.join(path, program)
    if os.path.exists(exe_file):
      return exe_file
  return None

def build():
  EMSCRIPTEN_ROOT = os.environ.get('EMSCRIPTEN')
  if not EMSCRIPTEN_ROOT:
    emcc = which('emcc')
    EMSCRIPTEN_ROOT = os.path.dirname(emcc)

  if not EMSCRIPTEN_ROOT:
    print "ERROR: EMSCRIPTEN_ROOT environment variable (which should be equal to emscripten's root dir) not found"
    sys.exit(1)

  sys.path.append(EMSCRIPTEN_ROOT)
  import tools.shared as emscripten

  # Settings

  '''
            Settings.INLINING_LIMIT = 0
            Settings.DOUBLE_MODE = 0
            Settings.PRECISE_I64_MATH = 0
            Settings.CORRECT_SIGNS = 0
            Settings.CORRECT_OVERFLOWS = 0
            Settings.CORRECT_ROUNDINGS = 0
  '''

  wasm = 'wasm' in sys.argv
  closure = 'closure' in sys.argv

  args = '-O3 --llvm-lto 1 -s NO_EXIT_RUNTIME=1 -s NO_FILESYSTEM=1 -s EXPORTED_RUNTIME_METHODS=["Pointer_stringify"]'
  if not wasm:
    args += ' -s WASM=0 -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s ELIMINATE_DUPLICATE_FUNCTIONS=1 -s SINGLE_FILE=1 -s LEGACY_VM_SUPPORT=1'
  else:
    args += ''' -s WASM=1 -s BINARYEN_IGNORE_IMPLICIT_TRAPS=1 -s BINARYEN_TRAP_MODE="clamp"'''
  if closure:
    args += ' --closure 1 -s IGNORE_CLOSURE_COMPILER_ERRORS=1' # closure complains about the bullet Node class (Node is a DOM thing too)
  else:
    args += ' -s NO_DYNAMIC_EXECUTION=1'

  emcc_args = args.split(' ')

  emcc_args += ['-s', 'TOTAL_MEMORY=%d' % (64*1024*1024)] # default 64MB. Compile with ALLOW_MEMORY_GROWTH if you want a growable heap (slower though).
  #emcc_args += ['-s', 'ALLOW_MEMORY_GROWTH=1'] # resizable heap, with some amount of slowness

  emcc_args += '-s EXPORT_NAME="Ammo" -s MODULARIZE=1'.split(' ')

  target = 'ammo.js' if not wasm else 'ammo.wasm.js'

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

    Popen([emscripten.PYTHON, os.path.join(EMSCRIPTEN_ROOT, 'tools', 'webidl_binder.py'), os.path.join(this_dir, 'ammo.idl'), 'glue']).communicate()
    assert os.path.exists('glue.js')
    assert os.path.exists('glue.cpp')

    stage('Build bindings')

    args = ['-I../src', '-c']
    for include in INCLUDES:
      args += ['-include', include]
    emscripten.Building.emcc('glue.cpp', args, 'glue.bc')
    assert(os.path.exists('glue.bc'))

    # Configure with CMake on Windows, and with configure on Unix.
    cmake_build = emscripten.WINDOWS

    if cmake_build:
      if not os.path.exists('CMakeCache.txt'):
        stage('Configure via CMake')
        emscripten.Building.configure([emscripten.PYTHON, os.path.join(EMSCRIPTEN_ROOT, 'emcmake'), 'cmake', '..', '-DBUILD_DEMOS=OFF', '-DBUILD_EXTRAS=OFF', '-DBUILD_CPU_DEMOS=OFF', '-DUSE_GLUT=OFF', '-DCMAKE_BUILD_TYPE=Release'])
    else:
      if not os.path.exists('config.h'):
        stage('Configure (if this fails, run autogen.sh in bullet/ first)')
        emscripten.Building.configure(['../configure', '--disable-demos','--disable-dependency-tracking'])

    stage('Make')

    CORES = multiprocessing.cpu_count()

    if emscripten.WINDOWS:
      emscripten.Building.make(['mingw32-make', '-j', str(CORES)])
    else:
      emscripten.Building.make(['make', '-j', str(CORES)])

    stage('Link')

    if cmake_build:
      bullet_libs = [os.path.join('src', 'BulletSoftBody', 'libBulletSoftBody.a'),
                    os.path.join('src', 'BulletDynamics', 'libBulletDynamics.a'),
                    os.path.join('src', 'BulletCollision', 'libBulletCollision.a'),
                    os.path.join('src', 'LinearMath', 'libLinearMath.a')]
    else:
      bullet_libs = [os.path.join('src', '.libs', 'libBulletSoftBody.a'),
                    os.path.join('src', '.libs', 'libBulletDynamics.a'),
                    os.path.join('src', '.libs', 'libBulletCollision.a'),
                    os.path.join('src', '.libs', 'libLinearMath.a')]

    emscripten.Building.link(['glue.bc'] + bullet_libs, 'libbullet.bc')
    assert os.path.exists('libbullet.bc')

    stage('emcc: ' + ' '.join(emcc_args))

    temp = os.path.join('..', '..', 'builds', target)
    emscripten.Building.emcc('libbullet.bc', emcc_args + ['--js-transform', 'python %s' % os.path.join('..', '..', 'bundle.py')],
                            temp)

    assert os.path.exists(temp), 'Failed to create script code'

    stage('wrap')

    wrapped = '''
  // This is ammo.js, a port of Bullet Physics to JavaScript. zlib licensed.
  ''' + open(temp).read()

    open(temp, 'w').write(wrapped)

  finally:
    os.chdir(this_dir);

if __name__ == '__main__':
  build()

