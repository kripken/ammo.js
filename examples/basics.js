print('');

var vec = new btVector3(4, 5, 6);
print('vec:' + [vec.x(), vec.y(), vec.z()]);
var quat = new btVector4(14, 25, 36, 77);
print('quat:' + [quat.x(), quat.y(), quat.z(), quat.w()]);

var trans = new btTransform(quat, vec);
print('trans:' + [!!trans.getOrigin(), !!trans.getRotation()]);
print('tvec:' + [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()]);
print('tquat:' + [trans.getRotation().x().toFixed(2), trans.getRotation().y().toFixed(2), trans.getRotation().z().toFixed(2), trans.getRotation().w().toFixed(2)]);

print('ClosestRayResultCallback: ' + typeof ClosestRayResultCallback); // make sure it was exposed

