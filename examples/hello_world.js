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

  var collisionShapes = [];
  collisionShapes.push(groundShape);

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
  })();

  (function() {
    var colShape = new btSphereShape(1);
    collisionShapes.push(colShape);

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
  })();

/*

/// Do some simulation



  for (i=0;i<135;i++) // XXX Emscripten
  {
    dynamicsWorld->stepSimulation(1.f/60.f,10);
    
    //print positions of all objects
    for (int j=dynamicsWorld->getNumCollisionObjects()-1; j>=0 ;j--)
    {
      btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[j];
      btRigidBody* body = btRigidBody::upcast(obj);
      if (body && body->getMotionState())
      {
        btTransform trans;
        body->getMotionState()->getWorldTransform(trans);
        printf("world pos = %.2f,%.2f,%.2f\n",float(trans.getOrigin().getX()),float(trans.getOrigin().getY()),float(trans.getOrigin().getZ())); // XXX Emscripten
      }
    }
  }


  //cleanup in the reverse order of creation/initialization

  //remove the rigidbodies from the dynamics world and delete them
  for (i=dynamicsWorld->getNumCollisionObjects()-1; i>=0 ;i--)
  {
    btCollisionObject* obj = dynamicsWorld->getCollisionObjectArray()[i];
    btRigidBody* body = btRigidBody::upcast(obj);
    if (body && body->getMotionState())
    {
      delete body->getMotionState();
    }
    dynamicsWorld->removeCollisionObject( obj );
    delete obj;
  }

  //delete collision shapes
  for (int j=0;j<collisionShapes.size();j++)
  {
    btCollisionShape* shape = collisionShapes[j];
    collisionShapes[j] = 0;
    delete shape;
  }

  //delete dynamics world
  delete dynamicsWorld;

  //delete solver
  delete solver;

  //delete broadphase
  delete overlappingPairCache;

  //delete dispatcher
  delete dispatcher;

  delete collisionConfiguration;

  //next line is optional: it will be cleared by the destructor when the array goes out of scope
  collisionShapes.clear();
*/
}

main();

