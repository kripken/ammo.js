/*
Additional manually-written binding code.
*/

// btVector3 and 4 have float references as parameters - why? :(

var bindingCache = [0, 1, 2, 3, 4].map(function() { return _malloc(Runtime.getNativeFieldSize('float')) });

var btVector3_old = btVector3;
btVector3 = function(x, y, z) {
  setValue(bindingCache[0], x || 0, 'float');
  setValue(bindingCache[1], y || 0, 'float');
  setValue(bindingCache[2], z || 0, 'float');
  return new btVector3_old(bindingCache[0], bindingCache[1], bindingCache[2]);
}
btVector3.prototype = btVector3_old.prototype;

var btVector3_setValue_old = btVector3;
btVector3.prototype.setValue = function(x, y, z) {
  setValue(bindingCache[0], x || 0, 'float');
  setValue(bindingCache[1], y || 0, 'float');
  setValue(bindingCache[2], z || 0, 'float');
  return btVector3_setValue_old.call(this, bindingCache[0], bindingCache[1], bindingCache[2]);
}

var btVector3_x_old = btVector3.prototype.x;
btVector3.prototype.x = function() {
  return getValue(btVector3_x_old.call(this), 'float');
}

var btVector3_y_old = btVector3.prototype.y;
btVector3.prototype.y = function() {
  return getValue(btVector3_y_old.call(this), 'float');
}

var btVector3_z_old = btVector3.prototype.z;
btVector3.prototype.z = function() {
  return getValue(btVector3_z_old.call(this), 'float');
}

// btVector4

var btVector4_old = btVector4;
btVector4 = function(x, y, z, w) {
  setValue(bindingCache[0], x || 0, 'float');
  setValue(bindingCache[1], y || 0, 'float');
  setValue(bindingCache[2], z || 0, 'float');
  setValue(bindingCache[3], w || 0, 'float');
  return new btVector4_old(bindingCache[0], bindingCache[1], bindingCache[2], bindingCache[3]);
}
btVector4.prototype = btVector4_old.prototype;

var btVector4_setValue_old = btVector4;
btVector4.prototype.setValue = function(x, y, z, w) {
  setValue(bindingCache[0], x || 0, 'float');
  setValue(bindingCache[1], y || 0, 'float');
  setValue(bindingCache[2], z || 0, 'float');
  setValue(bindingCache[3], w || 0, 'float');
  return btVector4_setValue_old.call(this, bindingCache[0], bindingCache[1], bindingCache[2], bindingCache[3]);
}

var btVector4_w_old = btVector4.prototype.w;
btVector4.prototype.w = function() {
  return getValue(btVector4_w_old.call(this), 'float');
}

