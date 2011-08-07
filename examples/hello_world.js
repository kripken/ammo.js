// WIP - does not work yet
// Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

load('bullet/build/libbullet.js');
load('bullet/build/bindings.js');
load('manual/bindings.js');

function main() {

  // not part of HelloWorld.cpp
  var vec = new btVector3(4, 5, 6);
  print('vec:' + [vec.x(), vec.y(), vec.z()]);
  // not part of HelloWorld.cpp

  var collisionConfiguration = new btDefaultCollisionConfiguration();
  var dispatcher = new btCollisionDispatcher(collisionConfiguration);
  var overlappingPairCache = new btDbvtBroadphase();
  var solver = new btSequentialImpulseConstraintSolver();
  var dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
  dynamicsWorld.setGravity(new btVector3(0,-10,0)); // XXX leak

  var groundShape = new btBoxShape(new btVector3(50,50,50));

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

  for (var i = 0; i < 135; i++) {
    dynamicsWorld.stepSimulation(1/60, 10);
    
    bodies.forEach(function(body) {
      if (body.getMotionState()) {
        var trans = new btTransform();
        body.getMotionState().getWorldTransform(trans);
        print("world pos = " + [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()]);
      }
    });
  }
}

main();

