#!/usr/bin/python

DEBUG = 0
DEMANGLE = 1
LLVM_OPT_OPTS = [] # ['-globalopt', '-ipsccp', '-deadargelim', '-simplifycfg', '-prune-eh', '-inline', '-functionattrs', '-argpromotion', '-simplify-libcalls', '-jump-threading', '-simplifycfg', '-tailcallelim', '-simplifycfg', '-reassociate', '-loop-rotate', '-licm', '-loop-unswitch', '-indvars', '-loop-deletion', '-loop-unroll', '-memcpyopt', '-sccp', '-jump-threading', '-correlated-propagation', '-dse', '-adce', '-simplifycfg', '-strip-dead-prototypes', '-deadtypeelim', '-globaldce', '-constmerge']
EMSCRIPTEN_SETTINGS ={
  'SKIP_STACK_IN_SMALL': 1, # use 0 for debugging, debugging output can be big
  'OPTIMIZE': 1,
  'RELOOP': 0, # Very important for performance, but very slow to compile
  'USE_TYPED_ARRAYS': 0, # TODO: Test if this helps or hurts
  'SAFE_HEAP': 0,
  'ASSERTIONS': 0,
  'INIT_STACK': 0,

  'AUTO_OPTIMIZE': 0,

  'CHECK_OVERFLOWS': 0,
  'CHECK_SIGNED_OVERFLOWS': 0,
  'CORRECT_OVERFLOWS': 0,

  'CHECK_SIGNS': 0,
  'CORRECT_SIGNS': 0,

  'QUANTUM_SIZE': 4, # It is possible to use 1, but requires manual correction FIXME
}

#========================================================

import os, sys
from subprocess import Popen, PIPE, STDOUT

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

try:
  EMSCRIPTEN_ROOT
except:
  print "ERROR: Missing EMSCRIPTEN_ROOT (which should be equal to emscripten's root dir) in ~/.emscripten"
  sys.exit(1)

exec(open(os.path.join(EMSCRIPTEN_ROOT, 'tools', 'shared.py'), 'r').read())

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

try:
  this_dir = os.getcwd()
  os.chdir('bullet')
  if not os.path.exists('build'):
    os.makedirs('build')
  os.chdir('build')

  stage('Build Bullet')

  env = os.environ.copy()
  env['EMMAKEN_COMPILER'] = CLANG
  if DEBUG:
    env['CFLAGS'] = '-g'
  env['CC'] = env['CXX'] = env['RANLIB'] = env['AR'] = os.path.join(EMSCRIPTEN_ROOT, 'tools', 'emmaken.py')
  if not os.path.exists('config.h'):
    Popen(['../configure', '--disable-demos','--disable-dependency-tracking'], env=env).communicate()
  Popen(['make'], env=env).communicate()

  stage('Link')

  Popen([LLVM_LINK, os.path.join('src', '.libs', 'libBulletCollision.a'),
                    os.path.join('src', '.libs', 'libBulletDynamics.a'),
                    os.path.join('src', '.libs', 'libLinearMath.a'), '-o', 'libbullet.bc']).communicate()

  assert os.path.exists('libbullet.bc'), 'Failed to create client'

  if LLVM_OPT_OPTS:
    stage('LLVM optimizations')

    shutil.move('libbullet.bc', '')
    output = Popen([LLVM_OPT, 'libbullet.bc.pre'] + LLVM_OPT_OPTS + ['-o=libbullet.bc'], stdout=PIPE, stderr=STDOUT).communicate()

  stage('LLVM binary => LL assembly')

  Popen([LLVM_DIS] + LLVM_DIS_OPTS + ['libbullet.bc', '-o=libbullet.ll']).communicate()

  assert os.path.exists('libbullet.ll'), 'Failed to create assembly code'

  stage('Emscripten: LL assembly => JavaScript')

  settings = EMSCRIPTEN_SETTINGS

  Popen(['python', os.path.join(EMSCRIPTEN_ROOT, 'emscripten.py'), 'libbullet.ll', str(EMSCRIPTEN_SETTINGS).replace("'", '"')], stdout=open('libbullet.js', 'w'), stderr=STDOUT).communicate()

  assert os.path.exists('libbullet.js'), 'Failed to create script code'

  if DEMANGLE:
    stage('Generate demangled names')

    Popen(['python', os.path.join(EMSCRIPTEN_ROOT, 'third_party', 'demangler.py'), 'libbullet.js'], stdout=open('libbullet.names', 'w')).communicate()

finally:
  os.chdir(this_dir);

