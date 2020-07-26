const test = require('ava');
const { readFileSync } = require('fs');
const loadAmmo = require('./helpers/load-ammo.js');

test('hello world', async t => {
  const source = readFileSync(`${__dirname}/../examples/hello_world.js`);

  // Inject a return statement for handling the top-level promise:
  const helloWorld = new Function(`return ${source}`);
  global.print = t.log;
  global.Ammo = loadAmmo;

  await helloWorld();

  t.pass();
})
