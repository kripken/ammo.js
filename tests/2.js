const test = require('ava');
const loadAmmo = require('./helpers/load-ammo.js');

// Initialize global Ammo once for all tests:
test.before(async t => loadAmmo())

test('ClosestRayResultCallback', t => {

  var rayCallback = new Ammo.ClosestRayResultCallback(new Ammo.btVector3(0, 0, 0), new Ammo.btVector3(1, 3, 17));
  t.log(rayCallback.hasHit());

  // Test setters/getters
  rayCallback.set_m_collisionObject(Ammo.wrapPointer(195));
  t.is(typeof rayCallback.get_m_collisionObject(), 'object');

  t.is(rayCallback.get_m_rayToWorld().x(), 1);
  t.is(rayCallback.get_m_rayToWorld().y(), 3);
  t.is(rayCallback.get_m_rayToWorld().z(), 17);
});
