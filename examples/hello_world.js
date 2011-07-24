// WIP - does not work yet
// Adapted from HelloWorld.cpp, Copyright (c) 2003-2007 Erwin Coumans  http://continuousphysics.com/Bullet/

load('bullet/build/libbullet.js');
load('bullet/build/binding.js');

function main() {
  var collisionConfiguration = new btDefaultCollisionConfiguration();
  var dispatcher = new btCollisionDispatcher(collisionConfiguration);

  var overlappingPairCache = new btDbvtBroadphase();
/*

  ///the default constraint solver. For parallel processing you can use a different solver (see Extras/BulletMultiThreaded)
  btSequentialImpulseConstraintSolver* solver = new btSequentialImpulseConstraintSolver;

  btDiscreteDynamicsWorld* dynamicsWorld = new btDiscreteDynamicsWorld(dispatcher,overlappingPairCache,solver,collisionConfiguration);

  dynamicsWorld->setGravity(btVector3(0,-10,0));

  ///create a few basic rigid bodies
  btCollisionShape* groundShape = new btBoxShape(btVector3(btScalar(50.),btScalar(50.),btScalar(50.)));

  //keep track of the shapes, we release memory at exit.
  //make sure to re-use collision shapes among rigid bodies whenever possible!
  btAlignedObjectArray<btCollisionShape*> collisionShapes;

  collisionShapes.push_back(groundShape);

  btTransform groundTransform;
  groundTransform.setIdentity();
  groundTransform.setOrigin(btVector3(0,-56,0));

  {
    btScalar mass(0.);

    //rigidbody is dynamic if and only if mass is non zero, otherwise static
    bool isDynamic = (mass != 0.f);

    btVector3 localInertia(0,0,0);
    if (isDynamic)
      groundShape->calculateLocalInertia(mass,localInertia);

    //using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
    btDefaultMotionState* myMotionState = new btDefaultMotionState(groundTransform);
    btRigidBody::btRigidBodyConstructionInfo rbInfo(mass,myMotionState,groundShape,localInertia);
    btRigidBody* body = new btRigidBody(rbInfo);

    //add the body to the dynamics world
    dynamicsWorld->addRigidBody(body);
  }


  {
    //create a dynamic rigidbody

    //btCollisionShape* colShape = new btBoxShape(btVector3(1,1,1));
    btCollisionShape* colShape = new btSphereShape(btScalar(1.));
    collisionShapes.push_back(colShape);

    /// Create Dynamic Objects
    btTransform startTransform;
    startTransform.setIdentity();

    btScalar  mass(1.f);

    //rigidbody is dynamic if and only if mass is non zero, otherwise static
    bool isDynamic = (mass != 0.f);

    btVector3 localInertia(0,0,0);
    if (isDynamic)
      colShape->calculateLocalInertia(mass,localInertia);

      startTransform.setOrigin(btVector3(2,10,0));
    
      //using motionstate is recommended, it provides interpolation capabilities, and only synchronizes 'active' objects
      btDefaultMotionState* myMotionState = new btDefaultMotionState(startTransform);
      btRigidBody::btRigidBodyConstructionInfo rbInfo(mass,myMotionState,colShape,localInertia);
      btRigidBody* body = new btRigidBody(rbInfo);

      dynamicsWorld->addRigidBody(body);
  }



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

