function createUnitBox(mass = 1.0) {
  const motionState = new Ammo.btDefaultMotionState()
  const halfExtents = new Ammo.btVector3(1, 1, 1).op_mul(0.5)
  const shape = new Ammo.btBoxShape(halfExtents)
  const localInertia = new Ammo.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, localInertia)
  const info = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  const body = new Ammo.btRigidBody(info)
  return body
}

module.exports = createUnitBox
