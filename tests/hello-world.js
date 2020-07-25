const test = require('ava');
const { readFileSync } = require('fs');
const Ammo = require('../builds/ammo.js');

test('hello world', async t => {
  const source = readFileSync(`${__dirname}/../examples/hello_world.js`);

  // Inject a return statement for handling the top-level promise:
  const helloWorld = new Function(`return ${source}`);
  global.print = t.log;
  global.Ammo = Ammo;

  await helloWorld();

  t.pass();
})
