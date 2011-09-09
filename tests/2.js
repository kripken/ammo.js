var rayCallback = new Ammo.ClosestRayResultCallback(new Ammo.btVector3(0, 0, 0), new Ammo.btVector3(1, 3, 17));
print(rayCallback.hasHit());

// Test setters/getters
rayCallback.set_m_collisionObject(Ammo.wrapPointer(195));
assertEq(typeof rayCallback.get_m_collisionObject(), 'object');

assertEq(rayCallback.get_m_rayToWorld().x(), 1);
assertEq(rayCallback.get_m_rayToWorld().y(), 3);
assertEq(rayCallback.get_m_rayToWorld().z(), 17);

print('ok.')

