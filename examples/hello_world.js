Ammo().then(function(Ammo) {
  // Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

  function main() {
    var collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver(),
        dynamicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    var groundShape     = new Ammo.btBoxShape(new Ammo.btVector3(50, 50, 50)),
        bodies          = [],
        groundTransform = new Ammo.btTransform();

    groundTransform.setIdentity();
    groundTransform.setOrigin(new Ammo.btVector3(0, -56, 0));

    (function() {
      var mass          = 0,
          isDynamic     = (mass !== 0),
          localInertia  = new Ammo.btVector3(0, 0, 0);

      if (isDynamic)
        groundShape.calculateLocalInertia(mass, localInertia);

      var myMotionState = new Ammo.btDefaultMotionState(groundTransform),
          rbInfo        = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, groundShape, localInertia),
          body          = new Ammo.btRigidBody(rbInfo);

      dynamicsWorld.addRigidBody(body);
      bodies.push(body);
    })();


    (function() {
      var colShape        = new Ammo.btSphereShape(1),
          startTransform  = new Ammo.btTransform();

      startTransform.setIdentity();

      var mass          = 1,
          isDynamic     = (mass !== 0),
          localInertia  = new Ammo.btVector3(0, 0, 0);

      if (isDynamic)
        colShape.calculateLocalInertia(mass,localInertia);

      startTransform.setOrigin(new Ammo.btVector3(2, 10, 0));

      var myMotionState = new Ammo.btDefaultMotionState(startTransform),
          rbInfo        = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia),
          body          = new Ammo.btRigidBody(rbInfo);

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
    // we'll free the objects in reversed order as they were created via 'new' to avoid the 'dead' object links
    Ammo.destroy(dynamicsWorld);
    Ammo.destroy(solver);
    Ammo.destroy(overlappingPairCache);
    Ammo.destroy(dispatcher);
    Ammo.destroy(collisionConfiguration);

    print('ok.')
  }

  main();
});
