const { readFileSync } = require('fs');

function getClosureMapping() {
  var raw = readFileSync('../builds/ammo.vars');
  var ret = {};
  raw.split('\n').forEach(function(line) {
    var parts = line.split(':');
    ret[parts[0]] = parts[1];
  });
  return ret;
}

module.exports = getClosureMapping;
