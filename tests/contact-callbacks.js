const test = require('ava')
const createUnitBox = require('./helpers/create-unit-box.js')
const loadAmmo = require('./helpers/load-ammo.js')

const CF_CUSTOM_MATERIAL_CALLBACK = 8
const DISABLE_DEACTIVATION = 4


function shouldTest(t, Ammo) {
  if (Ammo.addFunction) return true
  t.log(`Passed '${t.title}' without testing (requires ammo with addFunction support)`)
  t.pass()
  return false
}


test('Ammo.addFunction should return a function pointer', async t => {
  const Ammo = await loadAmmo()

  if (!shouldTest(t, Ammo)) return

  const functi0n = () => true
  const pointer = Ammo.addFunction(functi0n)
  t.assert(pointer)
})


test('btDiscreteDynamicsWorld.prototype.setContactAddedCallback should work like a charm', async t => {
  const Ammo = await loadAmmo()

  if (!shouldTest(t, Ammo)) return

  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new Ammo.btDbvtBroadphase()
  const solver = new Ammo.btSequentialImpulseConstraintSolver()
  const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    broadphase,
    solver,
    collisionConfiguration
  )

  // Place two boxes at the origin to generate a collision:
  const bodyA = createUnitBox()
  bodyA.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  dynamicsWorld.addRigidBody(bodyA)

  const bodyB = createUnitBox()
  bodyB.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  dynamicsWorld.addRigidBody(bodyB)

  // Set up the callback:
  let callbackInvocationCount = 0
  const callback = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
    callbackInvocationCount++

    t.not(cp, undefined)
    t.not(colObj0Wrap, undefined)
    t.not(partId0, undefined)
    t.not(index0, undefined)
    t.not(colObj1Wrap, undefined)
    t.not(partId1, undefined)
    t.not(index1, undefined)

    colObj0Wrap = Ammo.wrapPointer(colObj0Wrap, Ammo.btCollisionObjectWrapper)
    colObj0 = colObj0Wrap.getCollisionObject()
    t.assert(Ammo.compare(colObj0, bodyA))

    colObj1Wrap = Ammo.wrapPointer(colObj1Wrap, Ammo.btCollisionObjectWrapper)
    colObj1 = colObj1Wrap.getCollisionObject()
    t.assert(Ammo.compare(colObj1, bodyB))
  }
  const callbackPointer = Ammo.addFunction(callback)
  dynamicsWorld.setContactAddedCallback(callbackPointer)

  // Step the simulation and assert the behavior:
  dynamicsWorld.stepSimulation(1)
  t.is(callbackInvocationCount, 4)
})
