ammo.js
=======

ammo.js is a direct port of the Bullet physics engine to JavaScript, using Emscripten. The source code is translated directly to JavaScript, without human rewriting, so functionality should be identical to the original Bullet.

AMMO might stand for "Avoided Making My Own js physics engine by compiling bullet from C++" ;) credit to ccliffe for the name.

ammo.js is zlib licensed, just like Bullet.

Discussion takes place on IRC at #emscripten on Mozilla's server (irc.mozilla.org)


Status
------

ammo.js works, see a demo at

  http://syntensity.com/static/bullet.html

But see later down about usage.


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

The most straightforward thing is if you want to write your code
in C++, and run that on the web.

If so, then compile your code into LLVM, link it with bullet,
and compile that to JavaScript using emscripten. (The easiest way
to link it is to add your .bc file to the llvm-link command in
build.py.)

If, on the other hand, you want to write code in JavaScript,
then work remains to be done. You get demangled names in
libbullet.names and libbullet.names.js, but using them is still
quite annoying. This should be improved upon. See

  examples/

for some WIP examples.

