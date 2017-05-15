
project(ammo)

if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin" OR
    ${CMAKE_SYSTEM_NAME} MATCHES "Emscripten")
  add_compile_options(
    -std=c++11 -Wno-error -Wall
  )
endif()

# -stdlib=libc++ is the default on Emscripten, and it doesn't even expect to
# see the argument, which causes problems with ccache.
if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")
  add_compile_options(
    -stdlib=libc++
  )
endif()

if (${CMAKE_SYSTEM_NAME} MATCHES "Emscripten")
  execute_process(COMMAND /bin/bash -c "emcc -v 2> /dev/null | head -1 | sed 's/.* //'" OUTPUT_VARIABLE EMCC_VERSION)
  message("EMCC_VERSION ${EMCC_VERSION}")
  if (${EMCC_VERSION} MATCHES "1.34.0")
    add_compile_options(-Wno-warn-absolute-paths)
  endif()
  add_compile_options(-s USE_SDL=2)
endif()

set(AMMO_SRC ${UNIVERSE_DIR}/brokenarrow/emscripten/third-party/ammo.js/bullet/src)

add_library(ammo OBJECT
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btAxisSweep3.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btBroadphaseProxy.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btDbvt.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btDbvtBroadphase.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btDispatcher.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btMultiSapBroadphase.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btOverlappingPairCache.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btQuantizedBvh.cpp
            ${AMMO_SRC}/BulletCollision/BroadphaseCollision/btSimpleBroadphase.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btActivatingCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btBox2dBox2dCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btBoxBoxCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btBoxBoxDetector.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btCollisionDispatcher.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btCollisionObject.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btCollisionWorld.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btCompoundCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btCompoundCompoundCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btConvex2dConvex2dAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btConvexConcaveCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btConvexConvexAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btConvexPlaneCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btDefaultCollisionConfiguration.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btEmptyCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btGhostObject.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btHashedSimplePairCache.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btInternalEdgeUtility.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btManifoldResult.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btSimulationIslandManager.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btSphereBoxCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btSphereSphereCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btSphereTriangleCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/btUnionFind.cpp
            ${AMMO_SRC}/BulletCollision/CollisionDispatch/SphereTriangleDetector.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btBox2dShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btBoxShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btBvhTriangleMeshShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btCapsuleShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btCollisionShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btCompoundShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConcaveShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConeShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvex2dShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvexHullShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvexInternalShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvexPointCloudShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvexPolyhedron.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvexShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btConvexTriangleMeshShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btCylinderShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btEmptyShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btHeightfieldTerrainShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btMinkowskiSumShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btMultimaterialTriangleMeshShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btMultiSphereShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btOptimizedBvh.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btPolyhedralConvexShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btScaledBvhTriangleMeshShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btShapeHull.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btSphereShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btStaticPlaneShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btStridingMeshInterface.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTetrahedronShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTriangleBuffer.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTriangleCallback.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTriangleIndexVertexArray.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTriangleIndexVertexMaterialArray.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTriangleMesh.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btTriangleMeshShape.cpp
            ${AMMO_SRC}/BulletCollision/CollisionShapes/btUniformScalingShape.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btContactProcessing.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btGenericPoolAllocator.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btGImpactBvh.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btGImpactCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btGImpactQuantizedBvh.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btGImpactShape.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/btTriangleShapeEx.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/gim_box_set.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/gim_contact.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/gim_memory.cpp
            ${AMMO_SRC}/BulletCollision/Gimpact/gim_tri_collision.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btContinuousConvexCollision.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btConvexCast.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btGjkConvexCast.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btGjkEpa2.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btGjkEpaPenetrationDepthSolver.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btGjkPairDetector.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btMinkowskiPenetrationDepthSolver.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btPersistentManifold.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btPolyhedralContactClipping.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btRaycastCallback.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btSubSimplexConvexCast.cpp
            ${AMMO_SRC}/BulletCollision/NarrowPhaseCollision/btVoronoiSimplexSolver.cpp
            ${AMMO_SRC}/BulletDynamics/Character/btKinematicCharacterController.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btConeTwistConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btContactConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btFixedConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btGearConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btGeneric6DofConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btGeneric6DofSpringConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btHinge2Constraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btHingeConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btPoint2PointConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btSequentialImpulseConstraintSolver.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btSliderConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btSolve2LinearConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btTypedConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/ConstraintSolver/btUniversalConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/Dynamics/btDiscreteDynamicsWorld.cpp
            ${AMMO_SRC}/BulletDynamics/Dynamics/btRigidBody.cpp
            ${AMMO_SRC}/BulletDynamics/Dynamics/btSimpleDynamicsWorld.cpp
            ${AMMO_SRC}/BulletDynamics/Dynamics/Bullet-C-API.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBody.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBodyConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBodyConstraintSolver.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBodyDynamicsWorld.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBodyJointLimitConstraint.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBodyJointMotor.cpp
            ${AMMO_SRC}/BulletDynamics/Featherstone/btMultiBodyPoint2Point.cpp
            ${AMMO_SRC}/BulletDynamics/MLCPSolvers/btDantzigLCP.cpp
            ${AMMO_SRC}/BulletDynamics/MLCPSolvers/btMLCPSolver.cpp
            ${AMMO_SRC}/BulletDynamics/Vehicle/btRaycastVehicle.cpp
            ${AMMO_SRC}/BulletDynamics/Vehicle/btWheelInfo.cpp
            ${AMMO_SRC}/BulletSoftBody/btDefaultSoftBodySolver.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftBody.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftBodyConcaveCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftBodyHelpers.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftBodyRigidBodyCollisionConfiguration.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftRigidCollisionAlgorithm.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftRigidDynamicsWorld.cpp
            ${AMMO_SRC}/BulletSoftBody/btSoftSoftCollisionAlgorithm.cpp
            ${AMMO_SRC}/LinearMath/btAlignedAllocator.cpp
            ${AMMO_SRC}/LinearMath/btConvexHull.cpp
            ${AMMO_SRC}/LinearMath/btConvexHullComputer.cpp
            ${AMMO_SRC}/LinearMath/btGeometryUtil.cpp
            ${AMMO_SRC}/LinearMath/btPolarDecomposition.cpp
            ${AMMO_SRC}/LinearMath/btQuickprof.cpp
            ${AMMO_SRC}/LinearMath/btSerializer.cpp
            ${AMMO_SRC}/LinearMath/btVector3.cpp)

target_include_directories(ammo PUBLIC
  ${AMMO_SRC}
  ${COMMON_INCLUDE_PATHS}
)
