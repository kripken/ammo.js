#!/usr/bin/python

'''
Wraps in a closure. Run this after closure compiler.
'''

import os, sys

infile = os.path.join('builds', 'ammo.cc.js') if len(sys.argv) < 2 else sys.argv[1]
print 'Input:', infile

outfile = os.path.join('builds', 'ammo.js') if len(sys.argv) < 3 else sys.argv[2]
print 'Output:', outfile

bundle = open(outfile, 'w')
bundle.write('''
// This is ammo.js, a port of Bullet to JavaScript. zlib licensed.
var Ammo = (function() {
  var Module = this;

''')
bundle.write(open(infile, 'r').read())
bundle.write('''

  return this;
}).call({});
''')
bundle.close()

