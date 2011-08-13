// Stress test

function main() {

  var collisionConfiguration = new btDefaultCollisionConfiguration();
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
    var localInertia = new btVector3(0, 0, 0);
    var myMotionState = new btDefaultMotionState(groundTransform);
    var rbInfo = new btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
    var body = new btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  })();

  var sphereShape = new btSphereShape(1);
  var boxShape = new btBoxShape(new btVector3(1, 1, 1));

  [sphereShape, boxShape, boxShape, boxShape, sphereShape, boxShape].forEach(function(shape, i) {
    print('creating dynamic shape ' + i);

    var startTransform = new btTransform();
    startTransform.setIdentity();
    var mass = 1;
    var localInertia = new btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass,localInertia);

    startTransform.setOrigin(new btVector3(2+i*0.01, 10+i*2.1, 0));
  
    var myMotionState = new btDefaultMotionState(startTransform);
    var rbInfo = new btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
    var body = new btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  });

  var trans = new btTransform(); // taking this out of the loop below us reduces the leaking

  var startTime = Date.now();

  for (var i = 0; i < 450; i++) {
    dynamicsWorld.stepSimulation(1/60, 10);
    
    bodies.forEach(function(body, i) {
      if (body.getMotionState()) {
        body.getMotionState().getWorldTransform(trans);
        print(i + ' : ' + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);
      }
    });
  }

  print('total time: ' + ((Date.now()-startTime)/1000).toFixed(3));
}

main();

