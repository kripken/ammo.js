function assert(x, msg) {
  if (!x) {
    throw 'Assertion: ' + (msg || 'Failure');
  }
}

function assertEq(x, y, msg) {
  assert(x === y, (msg ? msg + ' : ' : '') + x + ' should be equal to ' + y + '.');
}

