var vec = new Ammo.btVector3(4, 5, 6);
assertEq([vec.x(), vec.y(), vec.z()].toString(), '4,5,6');
var quat = new Ammo.btVector4(14, 25, 36, 77);
assertEq([quat.x(), quat.y(), quat.z(), quat.w()].toString(), '14,25,36,77');

var trans = new Ammo.btTransform(quat, vec);
assertEq([!!trans.getOrigin(), !!trans.getRotation()].toString(), 'true,true');
assertEq([trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()].toString(), '4,5,6');
assertEq([trans.getRotation().x().toFixed(2), trans.getRotation().y().toFixed(2), trans.getRotation().z().toFixed(2), trans.getRotation().w().toFixed(2)].toString(), '0.16,0.28,0.40,0.86');

var cl = new Ammo.ClosestRayResultCallback(vec, vec); // Make sure it is not an abstract base class (regression check)
var found = false;
for (var x in cl) { found = true; } // closure compiler can rename .ptr
if (!found) throw('zz no wrapped pointer!');
assertEq(typeof Ammo.ClosestRayResultCallback, 'function'); // make sure it was exposed

(function() {
  var mass = 0;
  var localInertia = new Ammo.btVector3(0, 0, 0);
  var startTransform = new Ammo.btTransform();
  startTransform.setIdentity();
  var myMotionState = new Ammo.btDefaultMotionState(startTransform);
  var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50));
  var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
  var body = new Ammo.btRigidBody(rbInfo);
  new Ammo.btPoint2PointConstraint(body, new Ammo.btVector3(0, 0, 0)); // make sure we have the 2-param version of this

})();

(function() {
  // operators
  var a = new Ammo.btVector3(5, 6, 7);
  assertEq(5, a.x()); assertEq(6, a.y()); assertEq(7, a.z());
  var result = a.op_mul(3);
  assertEq(15, a.x()); assertEq(18, a.y()); assertEq(21, a.z());
  assert(Ammo.compare(a, result));
})();

print('ok.');

