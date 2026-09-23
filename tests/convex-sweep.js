const test = require('ava');
const loadAmmo = require('./helpers/load-ammo.js');
const createDiscreteDynamicsWorld = require('./helpers/create-discrete-dynamics-world.js');

// Initialize global Ammo once for all tests:
test.before(async t => loadAmmo())

function createStaticBox(x, userIndex) {
  var transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(x, 0, 0));
  var motionState = new Ammo.btDefaultMotionState(transform);
  var shape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
  var info = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, new Ammo.btVector3(0, 0, 0));
  var body = new Ammo.btRigidBody(info);
  body.setUserIndex(userIndex);
  return body;
}

function sweep(world, fromVec, toVec, callback) {
  var shape = new Ammo.btSphereShape(0.25);
  var from = new Ammo.btTransform();
  from.setIdentity();
  from.setOrigin(fromVec);
  var to = new Ammo.btTransform();
  to.setIdentity();
  to.setOrigin(toVec);
  world.convexSweepTest(shape, from, to, callback, 0);
}

function hitUserIndices(callback) {
  var objects = callback.get_m_collisionObjects();
  var indices = [];
  for (var i = 0; i < objects.size(); i++) {
    indices.push(objects.at(i).getUserIndex());
  }
  indices.sort(function (a, b) { return a - b; });
  return indices;
}

test('AllHitsConvexResultCallback reports every body along a convex sweep', t => {
  var world = createDiscreteDynamicsWorld();
  world.addRigidBody(createStaticBox(0, 0));
  world.addRigidBody(createStaticBox(4, 1));
  world.addRigidBody(createStaticBox(8, 2));

  var from = new Ammo.btVector3(-3, 0, 0);
  var to = new Ammo.btVector3(12, 0, 0);

  var closest = new Ammo.ClosestConvexResultCallback(from, to);
  sweep(world, from, to, closest);
  t.true(closest.hasHit());
  t.is(closest.get_m_hitCollisionObject().getUserIndex(), 0);
  t.true(closest.get_m_closestHitFraction() < 1);

  var all = new Ammo.AllHitsConvexResultCallback(from, to);
  sweep(world, from, to, all);
  t.true(all.hasHit());
  // The sweep must not narrow to the closest hit, unlike ClosestConvexResultCallback.
  t.is(all.get_m_closestHitFraction(), 1);
  t.deepEqual(hitUserIndices(all), [0, 1, 2]);

  var objects = all.get_m_collisionObjects();
  var normals = all.get_m_hitNormalWorld();
  var points = all.get_m_hitPointWorld();
  var fractions = all.get_m_hitFractions();
  t.is(normals.size(), objects.size());
  t.is(points.size(), objects.size());
  t.is(fractions.size(), objects.size());

  for (var i = 0; i < objects.size(); i++) {
    var fraction = fractions.at(i);
    t.true(fraction > 0 && fraction < 1);
    var normal = normals.at(i);
    t.true(normal.x() < -0.5);
    var point = points.at(i);
    var boxX = objects.at(i).getUserIndex() * 4;
    t.true(point.x() < boxX);
    t.true(point.x() > -3);
  }

  var aboveFrom = new Ammo.btVector3(-3, 5, 0);
  var aboveTo = new Ammo.btVector3(12, 5, 0);
  var miss = new Ammo.AllHitsConvexResultCallback(aboveFrom, aboveTo);
  sweep(world, aboveFrom, aboveTo, miss);
  t.false(miss.hasHit());
  t.is(miss.get_m_collisionObjects().size(), 0);
  t.is(miss.get_m_hitFractions().size(), 0);
});
