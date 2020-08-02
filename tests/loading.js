const test = require('ava');
const loadAmmo = require('./helpers/load-ammo.js');

test('loading should assign global Ammo', async t => {
  await loadAmmo()
  t.assert(Ammo)
})
