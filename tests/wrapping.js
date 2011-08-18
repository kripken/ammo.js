
// tests for caching, comparing, wrapping, etc.

var vec1 = new Ammo.btVector3(0, 0, 0);
var vec2 = new Ammo.btVector3(1, 3, 17);
assert(Ammo.compare(vec1, vec1), 'Same');
assert(Ammo.compare(vec2, vec2), 'Same');
assert(!Ammo.compare(vec1, vec2), 'Different');

var vec3 = Ammo.wrapPointer(Ammo.getPointer(vec1), Ammo.btVector3);
assert(Ammo.compare(vec1, vec3), 'Cached, so same');

print('ok.')

