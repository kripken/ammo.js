const test = require('ava')
const loadAmmo = require('./helpers/load-ammo.js');

// Initialize global Ammo once for all tests:
test.before(async t => loadAmmo())

test('compound shape', t => {

  var compoundShape = new Ammo.btCompoundShape();

  var transform = new Ammo.btTransform();
  transform.setIdentity();

  var vec = new Ammo.btVector3();
  var quat = new Ammo.btQuaternion();
  quat.setValue(0, 0, 0 , 1);

  var margin = 0.01;
  var delta = 0.00001;

  // Create box shape
  vec.setValue(0.5, 0.75, 1.25);
  var boxShape = new Ammo.btBoxShape(vec);
  boxShape.setMargin(margin);
  t.assert(Math.abs(boxShape.getMargin() - margin) < delta, "boxShape margin" );
  vec.setValue(0, 0, 0);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  compoundShape.addChildShape(transform, boxShape);

  // Create sphere shape
  var sphereRadius = 0.3;
  var sphereShape = new Ammo.btSphereShape(sphereRadius);
  sphereShape.setMargin(margin);
  // Note: the sphere shape is different from the others, it always returns its radius as the margin.
  t.assert(Math.abs(sphereShape.getMargin() - sphereRadius) < delta, "sphereShape margin must be equal to the radius" );
  vec.setValue(1, 0, 0);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  compoundShape.addChildShape(transform, sphereShape);

  // Create cylinder shape
  vec.setValue(0.3, 0.4, 0.3);
  var cylinderShape = new Ammo.btCylinderShape(vec);
  cylinderShape.setMargin(margin);
  t.assert(Math.abs(cylinderShape.getMargin() - margin) < delta, "cylinderShape margin" );
  vec.setValue(-1, 0, 0);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  compoundShape.addChildShape(transform, cylinderShape);

  // Create cone shape
  var coneShape = new Ammo.btConeShape(0.3, 0.5);
  vec.setValue(0, 1, 0);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  compoundShape.addChildShape(transform, coneShape);

  // Create capsule shape
  var capsuleShape = new Ammo.btCapsuleShape(0.4, 0.5);
  capsuleShape.setMargin(margin);
  t.assert(Math.abs(capsuleShape.getMargin() - margin) < delta, "capsuleShape margin" );
  vec.setValue(0, -1, 0);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  compoundShape.addChildShape(transform, capsuleShape);

  // Create convex hull shape
  var convexHullShape = new Ammo.btConvexHullShape();
  vec.setValue(1, 1, 1);
  convexHullShape.addPoint(vec);
  vec.setValue(-1, 1, 1);
  convexHullShape.addPoint(vec);
  vec.setValue(1, -1, 1);
  convexHullShape.addPoint(vec);
  vec.setValue(0, 1, -1);
  convexHullShape.addPoint(vec);
  vec.setValue(0, -2, -1);
  convexHullShape.setMargin(margin);
  t.assert(Math.abs(convexHullShape.getMargin() - margin) < delta, "convexHullShape margin" );
  transform.setOrigin(vec);
  transform.setRotation(quat);
  compoundShape.addChildShape(transform, convexHullShape);

  compoundShape.setMargin(margin);
  t.assert(Math.abs(compoundShape.getMargin() - margin) < delta, "compoundShape margin" );

  // Test number of shapes
  t.is(compoundShape.getNumChildShapes(), 6, "compoundShape.getNumChildShapes() should return 6")

  // Create convex hull with ShapeHull
  vec.setValue(0.5, 0.75, 1.25);
  var boxShape = new Ammo.btBoxShape(vec);
  boxShape.setMargin(0);
  var shapeHull = new Ammo.btShapeHull(boxShape);
  t.assert(shapeHull.buildHull(0), "shapeHull.buildHull should return true");
  var convexHullShape = new Ammo.btConvexHullShape(shapeHull.getVertexPointer(), shapeHull.numVertices());
  t.is(convexHullShape.getNumVertices(), 8, "convexHullShape.getNumVertices() should return 8");

  // Create rigid body
  vec.setValue(10, 5, 2);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  var motionState = new Ammo.btDefaultMotionState(transform);
  var mass = 15;
  compoundShape.calculateLocalInertia(mass, vec);
  var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, compoundShape, vec);
  var rigidBody = new Ammo.btRigidBody(rbInfo);

  // Set new motion state
  vec.setValue(-30, 50, -10);
  transform.setOrigin(vec);
  transform.setRotation(quat);
  var newMotionState = new Ammo.btDefaultMotionState(transform);
  rigidBody.setMotionState(newMotionState);

  // Destroy everything
  for (var shapeIndex = compoundShape.getNumChildShapes() - 1; shapeIndex >= 0; shapeIndex--) {
      var subShape = compoundShape.getChildShape(shapeIndex);
      compoundShape.removeChildShapeByIndex(shapeIndex);
      Ammo.destroy(subShape);
  }

  Ammo.destroy(rigidBody.getCollisionShape());
  Ammo.destroy(rigidBody.getMotionState());
  Ammo.destroy(motionState);
  Ammo.destroy(rigidBody);
  Ammo.destroy(rbInfo);
  Ammo.destroy(vec);
  Ammo.destroy(quat);
  Ammo.destroy(transform);
});
