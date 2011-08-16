var rayCallback = new Ammo.ClosestRayResultCallback(new Ammo.btVector3(0, 0, 0), new Ammo.btVector3(1, 3, 17));
print(rayCallback.hasHit());

print('ok.')

