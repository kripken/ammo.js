
// tests for caching, comparing, wrapping, etc.

var vec1 = new Ammo.btVector3(0, 0, 0);
var vec2 = new Ammo.btVector3(1, 3, 17);
assert(Ammo.compare(vec1, vec1), 'Same');
assert(Ammo.compare(vec2, vec2), 'Same');
assert(!Ammo.compare(vec1, vec2), 'Different');

var vec3 = Ammo.wrapPointer(Ammo.getPointer(vec1), Ammo.btVector3);
assert(Ammo.compare(vec1, vec3), 'Cached, so same');
assertEq(Ammo.getPointer(vec1), Ammo.getPointer(vec3));
assertEq(vec1, vec3, 'Direct comparison should work, since the same class');
assertEq(Ammo.getClass(vec3), Ammo.btVector3, 'Class must be as expected');

vec1.more = 23;
assertEq(vec1.more, 23);
assertNeq(vec2.more, 23);
assertEq(vec3.more, 23);
vec2.more = 44;
assertEq(vec1.more, 23);
assertNeq(vec1.more, 44);
assertEq(vec2.more, 44);
assertEq(vec3.more, 23);
assertNeq(vec3.more, 44);

vec1.something = 55;
assertEq(vec1.something, 55, 'Just put there');
var vec1ptr = Ammo.getPointer(vec1);
assertEq(Ammo.wrapPointer(vec1ptr, Ammo.btVector3), vec1, 'Same object in cache');
assertEq(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, 55, 'Still there in cache');
assertNeq(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, undefined, 'Still there in cache (sanity check)');
Ammo.destroy(vec1); // should remove it from the cache, so |something| should vanish
assertNeq(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, 55, 'Still there in cache'); // not a valid pointer, but whatever
assertEq(Ammo.wrapPointer(vec1ptr, Ammo.btVector3).something, undefined, 'Still there in cache (sanity check)');

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
  assertEq(Ammo.getClass(body), Ammo.btRigidBody);
  assertEq(body.info, 1230);

  var asCollision = Ammo.castObject(body, Ammo.btCollisionObject);
  assertNeq(asCollision.info, 1230);
  assertEq(Ammo.getClass(asCollision), Ammo.btCollisionObject);
  assertNeq(body, asCollision, 'Not the same yet - different class');
  assert(Ammo.compare(body, asCollision), 'But has the same pointer');

  var upcasted = Ammo.btRigidBody.prototype.upcast(asCollision);
  assertEq(body, upcasted, 'Must be the exactly same object now, as the class is the same');
  assertEq(upcasted.info, 1230);
})();

// Callbacks from C++ to JS

(function() {
  var calledBack = false;
  var callback = new Ammo.ConcreteContactResultCallback();
  Ammo.customizeVTable(callback, [{
    original: Ammo.ConcreteContactResultCallback.prototype.addSingleResult,
    replacement: function(cp, etc) {
      calledBack = true;
    }
  }]);
  assert(!calledBack);
  callback.addSingleResult(Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL, Ammo.NULL);
  assert(calledBack);
})();

print('ok.')

