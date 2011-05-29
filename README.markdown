ammo.js
=======

ammo.js is a direct port of the Bullet physics engine to JavaScript, using Emscripten. The source code is translated directly to JavaScript, without human rewriting, so functionality should be identical to the original Bullet.

AMMO might stand for "Avoided Making My Own js physics engine by compiling bullet from C++" ;) credit to ccliffe for the name.

ammo.js is zlib licensed, just like Bullet.


Status
------

ammo.js works, see a demo at

  http://syntensity.com/static/bullet.html

The main challenge at this point is to make a convenient API.


Instructions
------------

 * Get Emscripten

      http://emscripten.org

   and set it up. See

      https://github.com/kripken/emscripten/wiki/Getting-started

 * Run the build script,

      ./build.py

   which should generate build/libbullet.js and libbullet.names.


Usage
-----

As mentioned above, using ammo.js is not as convenient as it should
be. You can see the translations of mangled names to the originals
in libbullet.names, and call those functions that way. You do need
to do C/C++-style memory management, passing around integers that
represent pointers, etc. This should be improved upon (the
emscripten namespacer tool is a very small step forward in that
regard).

