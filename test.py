import os, sys, re, json
from subprocess import Popen, PIPE, STDOUT

# By default use builds/ammo.new.js. Or the commandline argument can override that.
build = os.path.join('builds', 'ammo.new.js')
if len(sys.argv) > 1:
  build = sys.argv[1]
print 'Using build:', build

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

def run(filename):
  return Popen(SPIDERMONKEY_ENGINE + ['-e', 'load("' + build + '");load("' + os.path.join('tests', 'testutils.js') + '")', filename], stdout=PIPE).communicate()[0]

__counter = 0
def stage(text):
  global __counter
  print __counter, ':', text
  __counter += 1

stage('basics')

output = run(os.path.join('examples', 'basics.js'))
assert '''
vec:4,5,6
quat:14,25,36,77
trans:true,true
tvec:4,5,6
tquat:0.16,0.28,0.40,0.86
ClosestRayResultCallback: function
''' in output, output

stage('hello world')

output = run(os.path.join('examples', 'hello_world.js'))
assert open(os.path.join('examples', 'hello_world.txt')).read() in output, output

stage('regression tests')

for test in [2, 3]:
  name = str(test)+'.js'
  print '     ', name
  fullname = os.path.join('tests', name)
  output = run(fullname)
  assert 'ok.' in output, output

stage('stress')

output = run(os.path.join('examples', 'stress.js'))
assert '''
0 : 0.00,-56.00,0.00
1 : 13.03,-5.00,-5.24
2 : 2.43,-5.00,-3.49
3 : -6.77,-5.54,-0.77
4 : -2.55,-5.00,2.84
5 : 11.75,-5.00,11.25
6 : 2.35,-5.61,0.12
total time:''' in output, output
print '   stress benchmark: ' + output.split('\n')[-2]

print
print 'ok.'

