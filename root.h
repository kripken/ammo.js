#include "bullet/src/btBulletDynamicsCommon.h"

#include "bullet/src/BulletCollision/CollisionDispatch/btGhostObject.h"
#include "bullet/src/BulletCollision/CollisionShapes/btHeightfieldTerrainShape.h"

/*
#include "bullet/src/BulletCollision/Gimpact/btBoxCollision.h"
#include "bullet/src/BulletCollision/Gimpact/btClipPolygon.h"
#include "bullet/src/BulletCollision/Gimpact/btContactProcessing.h"
#include "bullet/src/BulletCollision/Gimpact/btGenericPoolAllocator.h"
#include "bullet/src/BulletCollision/Gimpact/btGeometryOperations.h"
#include "bullet/src/BulletCollision/Gimpact/btGImpactBvh.h"
#include "bullet/src/BulletCollision/Gimpact/btGImpactCollisionAlgorithm.h"
#include "bullet/src/BulletCollision/Gimpact/btGImpactMassUtil.h"
#include "bullet/src/BulletCollision/Gimpact/btGImpactQuantizedBvh.h"
#include "bullet/src/BulletCollision/Gimpact/btGImpactShape.h"
#include "bullet/src/BulletCollision/Gimpact/btQuantization.h"
#include "bullet/src/BulletCollision/Gimpact/btTriangleShapeEx.h"
*/

// Additions

class ConcreteContactResultCallback : public btCollisionWorld::ContactResultCallback // for JS callbacks through vtable customization
{
public:
  ConcreteContactResultCallback() {};
  virtual btScalar addSingleResult(btManifoldPoint& cp,	const btCollisionObjectWrapper* colObj0Wrap,int partId0,int index0,const btCollisionObjectWrapper* colObj1Wrap,int partId1,int index1) { return 0; };
};


