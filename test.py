import os, sys, re, json
from subprocess import Popen, PIPE, STDOUT

exec(open(os.path.expanduser('~/.emscripten'), 'r').read())

print Popen(SPIDERMONKEY_ENGINE + ['examples/hello_world.js']).communicate()

