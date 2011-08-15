import os, sys, re, json
from subprocess import Popen, PIPE, STDOUT

# By default use builds/ammo.new.js. Or the commandline argument can override that.
build = os.path.join('builds', 'ammo.new.js')
if len(sys.argv) > 1:
  build = sys.argv[1]
print 'Using build:', build

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

def run(filename):
  return Popen(SPIDERMONKEY_ENGINE + ['-e', 'load("' + build + '")', filename], stdout=PIPE).communicate()[0]

print '0. basics'

output = run(os.path.join('examples', 'basics.js'))
assert '''
vec:4,5,6
quat:14,25,36,77
trans:true,true
tvec:4,5,6
tquat:0.16,0.28,0.40,0.86
ClosestRayResultCallback: function
''' in output, output

print '1. hello world'

output = run(os.path.join('examples', 'hello_world.js'))
assert '''world pos = 0.00,-56.00,0.00
world pos = 2.00,10.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.99,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.99,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.97,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.96,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.94,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.92,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.90,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.88,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.85,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.82,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.79,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.75,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.71,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.67,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.62,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.58,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.53,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.47,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.42,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.36,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.30,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.24,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.17,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.10,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,9.03,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.95,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.87,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.79,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.71,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.62,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.54,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.44,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.35,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.25,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.15,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,8.05,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.94,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.84,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.72,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.61,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.49,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.37,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.25,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.13,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,7.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.87,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.74,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.60,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.46,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.32,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.17,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,6.03,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,5.88,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,5.72,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,5.57,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,5.41,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,5.25,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,5.09,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,4.92,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,4.75,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,4.58,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,4.40,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,4.22,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,4.04,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,3.86,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,3.67,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,3.49,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,3.29,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,3.10,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,2.90,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,2.70,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,2.50,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,2.29,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,2.09,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,1.87,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,1.66,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,1.44,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,1.22,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,1.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,0.78,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,0.55,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,0.32,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,0.09,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-0.15,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-0.39,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-0.63,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-0.88,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-1.12,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-1.37,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-1.63,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-1.88,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-2.14,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-2.40,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-2.66,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-2.93,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-3.20,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-3.47,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-3.75,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.03,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.31,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.59,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.88,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.16,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.46,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.10,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.07,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.05,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.03,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.01,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.99,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.97,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.96,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.96,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.95,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.95,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.95,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.95,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.96,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.96,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.97,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-4.99,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.01,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.01,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00
world pos = 0.00,-56.00,0.00
world pos = 2.00,-5.00,0.00''' in output, output

# Stress - tests QUANTUM == 1 stuff

print '2. stress'

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

