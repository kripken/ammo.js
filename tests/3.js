// Issue 3: btSweepAxis3 doesn't seem to work

var collisionConfiguration = new btDefaultCollisionConfiguration();
var dispatcher = new btCollisionDispatcher(collisionConfiguration);



// XXX interesting part
var maxProxies = 16384;
var aabbmin = new btVector3(-1000,-1000,-1000); // world size
var aabbmax = new btVector3(1000,1000,1000);
var overlappingPairCache = new btAxisSweep3(aabbmin, aabbmax, maxProxies);
// XXX interesting part



var solver = new btSequentialImpulseConstraintSolver();
var dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
dynamicsWorld.setGravity(new btVector3(0, -10, 0));

var groundShape = new btBoxShape(new btVector3(50, 50, 50));

var bodies = [];

var groundTransform = new btTransform();
groundTransform.setIdentity();
groundTransform.setOrigin(new btVector3(0, -56, 0));

(function() {
  var mass = 0;
  var isDynamic = mass !== 0;
  var localInertia = new btVector3(0, 0, 0);

  if (isDynamic)
    groundShape.calculateLocalInertia(mass, localInertia);

  var myMotionState = new btDefaultMotionState(groundTransform);
  var rbInfo = new btRigidBodyConstructionInfo(mass, myMotionState, groundShape, localInertia);
  var body = new btRigidBody(rbInfo);

  dynamicsWorld.addRigidBody(body);
  bodies.push(body);
})();

print('ok.')

