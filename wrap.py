import os, sys

with open(sys.argv[1], "r+") as file:
    wrapped = '''
// This is ammo.js, a port of Bullet Physics to JavaScript. zlib licensed.
''' + file.read()
    file.seek(0)
    file.write(wrapped)
