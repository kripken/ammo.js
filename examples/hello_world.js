// WIP - does not work yet

load('../bullet/build/libbullet.js');
load('../bullet/build/libbullet.names.js');

var Bullet = Module._ = ModuleNames;

// Adapted from HelloWorld.cpp in Bullet

var collisionConfiguration = Bullet.btDefaultCollisionConfiguration.__new__();
var dispatcher = new Bullet.btCollisionDispatcher.__new__(collisionConfiguration);
var overlappingPairCache = Bullet.btDbvtBroadphase.__new__();
var solver = Bullet.btSequentialImpulseConstraintSolver.__new__();
var dynamicsWorld = Bullet.btDiscreteDynamicsWorld.__new__(dispatcher, overlappingPairCache, solver, collisionConfiguration);
Bullet.btDiscreteDynamicsWorld.setGravity(dynamicsWorld, Bullet.btVector3.__new__1(0, -10, 0)); // vector leak?

var groundShape = Bullet.btBoxShape.__new__(Bullet.btVector3.__new__1(50, 50, 50));
var collisionShapes = [groundShape];

var groundTransform = Bullet.btTransform.__new__();
Bullet.btTransform.setIdentity(groundTransform);
Bullet.btTransform.setOrigin(groundTransform, Bullet.btVector3.__new__1(0, -56, 0));

var localInertia = Bullet.btVector3.__new__1(0, 0, 0);
Bullet.btBoxShape.calculateLocalInertia(groundShape, 0, localInertia);

var myMotionState = Bullet.btDefaultMotionState.__new__(groundTransform); // this fails XXX why isn't btDefaultMotionState compiled into the .ll?
var rbInfo = Bullet.btRigidBody.btRigidBodyConstructionInfo.__new__(mass, myMotionState, groundShape, localInertia);
var body = Bullet.btRigidBody.__new__(rbInfo);

Bullet.btDiscreteDynamicsWorld.addRigidBody(dynamicsWorld, body);

/*
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
*/

