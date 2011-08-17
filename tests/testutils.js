function assert(x, msg) {
  if (!x) {
    throw 'Assertion: ' + (msg || 'Failure');
  }
}

function assertEq(x, y, msg) {
  assert(x === y, (msg ? msg + ' : ' : '') + x + ' should be equal to ' + y + '.');
}

function getClosureMapping() {
  var raw = read('../builds/ammo.vars');
  var ret = {};
  raw.split('\n').forEach(function(line) {
    var parts = line.split(':');
    ret[parts[0]] = parts[1];
  });
  return ret;
}

