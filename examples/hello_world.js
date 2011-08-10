// Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

function main() {
  var collisionConfiguration = new btDefaultCollisionConfiguration(); // every single |new| currently leaks...
  var dispatcher = new btCollisionDispatcher(collisionConfiguration);
  var overlappingPairCache = new btDbvtBroadphase();
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

  (function() {
    var colShape = new btSphereShape(1);

    var startTransform = new btTransform();
    startTransform.setIdentity();

    var mass = 1;
    var isDynamic = (mass != 0);

    var localInertia = new btVector3(0, 0, 0);
    if (isDynamic)
      colShape.calculateLocalInertia(mass,localInertia);

    startTransform.setOrigin(new btVector3(2, 10, 0));
  
    var myMotionState = new btDefaultMotionState(startTransform);
    var rbInfo = new btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia);
    var body = new btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  })();

  var trans = new btTransform(); // taking this out of the loop below us reduces the leaking

  for (var i = 0; i < 135; i++) {
    dynamicsWorld.stepSimulation(1/60, 10);
    
    bodies.forEach(function(body) {
      if (body.getMotionState()) {
        body.getMotionState().getWorldTransform(trans);
        print("world pos = " + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);
      }
    });
  }
}

main();

