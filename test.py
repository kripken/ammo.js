import os, sys, re, json
from subprocess import Popen, PIPE, STDOUT

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

output = Popen(SPIDERMONKEY_ENGINE + ['examples/hello_world.js'], stdout=PIPE, stderr=STDOUT).communicate()[0]
print '==========='
print output
print '==========='

assert 'vec:4,5,6' in output

print 'ok.'

