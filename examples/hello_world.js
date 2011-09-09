// Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

function main() {
  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
  var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  var overlappingPairCache = new Ammo.btDbvtBroadphase();
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

  (function() {
    var colShape = new Ammo.btSphereShape(1);

    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();

    var mass = 1;
    var isDynamic = (mass != 0);

    var localInertia = new Ammo.btVector3(0, 0, 0);
    if (isDynamic)
      colShape.calculateLocalInertia(mass,localInertia);

    startTransform.setOrigin(new Ammo.btVector3(2, 10, 0));
  
    var myMotionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  })();

  var trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

  for (var i = 0; i < 135; i++) {
    dynamicsWorld.stepSimulation(1/60, 10);
    
    bodies.forEach(function(body) {
      if (body.getMotionState()) {
        body.getMotionState().getWorldTransform(trans);
        print("world pos = " + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);
      }
    });
  }

  // Delete objects we created through |new|. We just do a few of them here, but you should do them all if you are not shutting down ammo.js
  Ammo.destroy(collisionConfiguration);
  Ammo.destroy(dispatcher);
  Ammo.destroy(overlappingPairCache);
  Ammo.destroy(solver);
  //Ammo.destroy(dynamicsWorld); // XXX gives an error for some reason, |getBroadphase()->getOverlappingPairCache()->cleanProxyFromPairs(bp,m_dispatcher1);| in btCollisionWorld.cpp throws a 'pure virtual' failure

  print('ok.')
}

main();

