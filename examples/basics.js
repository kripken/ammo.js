var vec = new Ammo.btVector3(4, 5, 6);
print('vec:' + [vec.x(), vec.y(), vec.z()]);
var quat = new Ammo.btVector4(14, 25, 36, 77);
print('quat:' + [quat.x(), quat.y(), quat.z(), quat.w()]);

var trans = new Ammo.btTransform(quat, vec);
print('trans:' + [!!trans.getOrigin(), !!trans.getRotation()]);
print('tvec:' + [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()]);
print('tquat:' + [trans.getRotation().x().toFixed(2), trans.getRotation().y().toFixed(2), trans.getRotation().z().toFixed(2), trans.getRotation().w().toFixed(2)]);

var cl = new Ammo.ClosestRayResultCallback(vec, vec); // Make sure it is not an abstract base class (regression check)
var found = false;
for (var x in cl) { found = true; } // closure compiler can rename .ptr
if (!found) print('zz no wrapped pointer!');
print('ClosestRayResultCallback: ' + typeof Ammo.ClosestRayResultCallback); // make sure it was exposed

