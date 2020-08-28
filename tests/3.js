const test = require('ava');
const loadAmmo = require('./helpers/load-ammo.js');

// Initialize global Ammo once for all tests:
test.before(async t => loadAmmo())

test('Issue 3: Ammo.btSweepAxis3 doesn\'t seem to work', t => {

  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
  var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);



  // XXX interesting part
  var maxProxies = 16384;
  var aabbmin = new Ammo.btVector3(-1000,-1000,-1000); // world size
  var aabbmax = new Ammo.btVector3(1000,1000,1000);
  var overlappingPairCache = new Ammo.btAxisSweep3(aabbmin, aabbmax, maxProxies);
  // XXX interesting part



  var solver = new Ammo.btSequentialImpulseConstraintSolver();
  var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

  var groundShape = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50));

  var bodies = [];

  var groundTransform = new Ammo.btTransform();
  groundTransform.setIdentity();
  groundTransform.setOrigin(new Ammo.btVector3(0, -56, 0));

  (function() {
    var mass = 0;
    var isDynamic = mass !== 0;
    var localInertia = new Ammo.btVector3(0, 0, 0);

    if (isDynamic)
      groundShape.calculateLocalInertia(mass, localInertia);

    var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, groundShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  })();

  t.pass();
});
