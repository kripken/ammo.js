// Stress test

var TEST_MEMORY = 0;

var readMemoryCeiling, malloc;
if (TEST_MEMORY) {
  (function() {
    try {
      STATICTOP;
      readMemoryCeiling = function() { return STATICTOP + _sbrk.DATASIZE }
      malloc = _malloc;
    } catch(e) {
      var mapping = getClosureMapping();
      var key = '0';
      readMemoryCeiling = eval('(function() { return ' + mapping['STATICTOP'] + ' + ' + mapping['_sbrk$DATASIZE'] + ' })');
      malloc = eval(mapping['_malloc']);
    }
  })();
}

function benchmark() {
  var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
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
    var localInertia = new Ammo.btVector3(0, 0, 0);
    var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, groundShape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  })();

  var sphereShape = new Ammo.btSphereShape(1);
  var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(1, 1, 1));
  var coneShape = new Ammo.btConeShape(1, 1); // XXX TODO: add cylindershape too

  [sphereShape, boxShape, coneShape, boxShape, sphereShape, coneShape].forEach(function(shape, i) {
    print('creating dynamic shape ' + i);

    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    var mass = 1;
    var localInertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(mass,localInertia);

    startTransform.setOrigin(new Ammo.btVector3(2+i*0.01, 10+i*2.1, 0));
  
    var myMotionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
    var body = new Ammo.btRigidBody(rbInfo);

    dynamicsWorld.addRigidBody(body);
    bodies.push(body);
  });

  var memoryStart;

  var trans = new Ammo.btTransform(); // taking this out of the loop below us reduces the leaking

  var startTime = Date.now();

  if (TEST_MEMORY) malloc(5*1024*1024); // stress memory usage

  var NUM = 150000;

  for (var i = 0; i < NUM; i++) {
    if (i === 250 && TEST_MEMORY) memoryStart = readMemoryCeiling();

    dynamicsWorld.stepSimulation(1/60, 10);
    
    bodies.forEach(function(body, j) {
      if (body.getMotionState()) {
        body.getMotionState().getWorldTransform(trans);
        if (i === NUM-1) print(j + ' : ' + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);
      }
    });
  }

  var endTime = Date.now();

  if (TEST_MEMORY) assertEq(readMemoryCeiling(), memoryStart, 'Memory ceiling must remain stable!');

  print('total time: ' + ((endTime-startTime)/1000).toFixed(3));
}

function testDestroy() {
  var NUM = 1000; // enough to force an increase in the memory ceiling
  var vec = new Ammo.btVector3(4, 5, 6);
  var memoryStart = readMemoryCeiling();
  for (var i = 0; i < NUM; i++) {
    Ammo.destroy(vec);
    vec = new Ammo.btVector3(4, 5, 6);
  }
  Ammo.destroy(vec);
  assertEq(readMemoryCeiling(), memoryStart, 'Memory ceiling must remain stable!');
  for (var i = 0; i < NUM; i++) {
    vec = new Ammo.btVector3(4, 5, 6);
  }
  assertNeq(readMemoryCeiling(), memoryStart, 'Memory ceiling must increase without destroy()!');
}

benchmark();
if (TEST_MEMORY) testDestroy();

print('ok.')

