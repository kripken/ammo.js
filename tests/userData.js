const test = require('ava');
const loadAmmo = require('./helpers/load-ammo.js');

// Initialize global Ammo once for all tests:
test.before(async t => loadAmmo())

// Skipped to reflect current state
test.skip('userData', t => {

  var transform = new Ammo.btTransform();
  transform.setIdentity();

  var vec = new Ammo.btVector3();
  var quat = new Ammo.btQuaternion();
  quat.setValue(0, 0, 0 , 1);

  // Create box shape
  vec.setValue(0.5, 0.5, 0.5);
  var boxShape = new Ammo.btBoxShape(vec);

  // Create rigid body
  vec.setValue(0, 0, 0);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  var motionState = new Ammo.btDefaultMotionState(transform);
  var mass = 10;
  boxShape.calculateLocalInertia(mass, vec);
  var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, boxShape, vec);
  var rigidBody = new Ammo.btRigidBody(rbInfo);

  // Note that in bullet, the user pointer and index are in an union.

  var theValue = 1234;

  rigidBody.setUserPointer(theValue);
  var userPointer1 = rigidBody.getUserPointer();
  t.assert(userPointer1.ptr == theValue, "User pointer is not the same" );

  theValue = 4567;

  rigidBody.setUserIndex(theValue);
  var userIndex1 = rigidBody.getUserIndex();
  t.assert(userIndex1 == theValue, "User index is not the same" );

  Ammo.destroy(rigidBody.getCollisionShape());
  Ammo.destroy(motionState);
  Ammo.destroy(rigidBody);
  Ammo.destroy(rbInfo);
  Ammo.destroy(vec);
  Ammo.destroy(quat);
  Ammo.destroy(transform);
});
