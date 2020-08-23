function createDiscreteDynamicsWorld() {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new Ammo.btDbvtBroadphase()
  const solver = new Ammo.btSequentialImpulseConstraintSolver()
  const world = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  )
  return world
}

module.exports = createDiscreteDynamicsWorld
