const test = require('ava');
const loadAmmo = require('./helpers/load-ammo.js');

// Initialize global Ammo once for all tests:
test.before(async t => loadAmmo())

test('tests for caching, comparing, wrapping, etc.', t => {

  var vec1 = new Ammo.btVector3(0, 0, 0);
  var vec2 = new Ammo.btVector3(1, 3, 17);
  t.assert(Ammo.compare(vec1, vec1), 'Same');
  t.assert(Ammo.compare(vec2, vec2), 'Same');
  t.assert(!Ammo.compare(vec1, vec2), 'Different');

  var vec3 = Ammo.wrapPointer(Ammo.getPointer(vec1), Ammo.btVector3);
  t.assert(Ammo.compare(vec1, vec3), 'Cached, so same');
  t.is(Ammo.getPointer(vec1), Ammo.getPointer(vec3));
  t.is(vec1, vec3, 'Direct comparison should work, since the same class');
  t.is(Ammo.getClass(vec3), Ammo.btVector3, 'Class must be as expected');

  vec1.more = 23;
  t.is(vec1.more, 23);
  t.not(vec2.more, 23);
  t.is(vec3.more, 23);
  vec2.more = 44;
  t.is(vec1.more, 23);
  t.not(vec1.more, 44);
  t.is(vec2.more, 44);
  t.is(vec3.more, 23);
  t.not(vec3.more, 44);

  vec1.something = 55;
  t.is(vec1.something, 55, 'Just put there');
  var vec1ptr = Ammo.getPointer(vec1);
  t.is(Ammo.wrapPointer(vec1ptr, Ammo.btVector3), vec1, 'Same object in cache');
  t.is(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, 55, 'Still there in cache');
  t.not(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, undefined, 'Still there in cache (sanity check)');
  Ammo.destroy(vec1); // should remove it from the cache, so |something| should vanish
  t.not(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, 55, 'Still there in cache'); // not a valid pointer, but whatever
  t.is(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, undefined, 'Still there in cache (sanity check)');

  // Upcasting
  (function() {
    var groundTransform = new Ammo.btTransform();
    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -56, 0));
    var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50));

    var mass = 0;
    var localInertia = new Ammo.btVector3(0, 0, 0);
    var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);
    body.info = 1230;
    t.is(Ammo.getClass(body), Ammo.btRigidBody);
    t.is(body.info, 1230);

    var asCollision = Ammo.castObject(body, Ammo.btCollisionObject);
    t.not(asCollision.info, 1230);
    t.is(Ammo.getClass(asCollision), Ammo.btCollisionObject);
    t.not(body, asCollision, 'Not the same yet - different class');
    t.assert(Ammo.compare(body, asCollision), 'But has the same pointer');

    var upcasted = Ammo.castObject(asCollision, Ammo.btRigidBody);
    t.is(body, upcasted, 'Must be the exactly same object now, as the class is the same');
    t.is(upcasted.info, 1230);

    var upcastUpcasted = Ammo.btRigidBody.prototype.upcast(asCollision);
    t.is(body, upcastUpcasted, 'Must be the exactly same object now, as the class is the same');
    t.is(upcastUpcasted.info, 1230);
    t.assert(Ammo.getPointer(upcastUpcasted) !== 0);
  })();

  // Callbacks from C++ to JS

  // not supported in asm
  (function() {
    var calledBack = false;
    var callback = new Ammo.ConcreteContactResultCallback();
    callback.addSingleResult = function(cp, etc) {
      calledBack = true;
    };
    t.assert(!calledBack);
    callback.addSingleResult(Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL);
    t.assert(calledBack);
  })();
});
