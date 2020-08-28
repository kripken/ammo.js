const test = require('ava')
const createUnitBox = require('./helpers/create-unit-box.js')
const createDiscreteDynamicsWorld = require('./helpers/create-discrete-dynamics-world.js')
const loadAmmo = require('./helpers/load-ammo.js')

const CF_CUSTOM_MATERIAL_CALLBACK = 8

// Load global Ammo once for all tests:
test.before(async t => await loadAmmo())


// Test contact callbacks serially:
// Each btManifoldResult callback is a global extern in bullet, however ammo
// has made these available via instance method on btDiscreteDynamicsWorld
// Since all instances share the same global, concurrent testing is unsafe.
const testContactCallback = test.serial.cb

testContactCallback('btDiscreteDynamicsWorld.prototype.setContactAddedCallback should work like a charm', t => {

  const world = createDiscreteDynamicsWorld()
  const timestep = 1
  const maxSubsteps = 0

  // Place two boxes at the origin to generate a collision:
  const bodyA = createUnitBox()
  bodyA.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  world.addRigidBody(bodyA)

  const bodyB = createUnitBox()
  bodyB.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  world.addRigidBody(bodyB)

  // Set up the callback
  let expectedInvocations = 4
  const callback = (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) => {
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

    if (--expectedInvocations < 1) t.end()
  }
  callback.pointer = Ammo.addFunction(callback, Ammo.CONTACT_ADDED_CALLBACK_SIGNATURE)
  world.setContactAddedCallback(callback.pointer)
  t.teardown(() => world.setContactAddedCallback(null))

  // Step the simulation and assert the behavior:
  world.stepSimulation(timestep, maxSubsteps)
})


testContactCallback('btDiscreteDynamicsWorld.prototype.setContactDestroyedCallback should work like a charm', t => {

  const world = createDiscreteDynamicsWorld()
  const timestep = 1
  const maxSubsteps = 0

  // Place two boxes at the origin to generate a collision
  const bodyA = createUnitBox()
  bodyA.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  world.addRigidBody(bodyA)

  const bodyB = createUnitBox()
  bodyB.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  world.addRigidBody(bodyB)

  // Set up the callback:
  const expectedUserPersistentData = []
  let expectedInvocations = 4
  const callback = (userPersistentData) => {
    t.assert(expectedUserPersistentData.includes(userPersistentData))
    if (--expectedInvocations < 1) t.end()
  }
  callback.pointer = Ammo.addFunction(callback, Ammo.CONTACT_DESTROYED_CALLBACK_SIGNATURE)
  world.setContactDestroyedCallback(callback.pointer)
  t.teardown(() => world.setContactDestroyedCallback(null))

  // Step the simulation to start the collision:
  world.stepSimulation(timestep, maxSubsteps)

  // Assign user persistent data to trigger the destroy callback:
  // In bullet, contact manifold user persistent data can be any void*
  // ammo does not have a way to create pointers to javascript data,
  // but you can abuse the void* to store a simple int value.
  // Here we create some random integers for testing the callback:
  const dispatcher = world.getDispatcher()
  for (let i = 0, manifold; i < dispatcher.getNumManifolds(); i++) {
    manifold = dispatcher.getManifoldByIndexInternal(i)
    for (let j = 0, point; j < manifold.getNumContacts(); j++) {
      point = manifold.getContactPoint(j)
      point.m_userPersistentData = Math.floor(Math.random() * 100)
      expectedUserPersistentData.push(point.m_userPersistentData)
    }
  }

  // Separate the boxes to end the collision:
  bodyA.getWorldTransform().getOrigin().setValue(10, 10, 10)

  // Step the simulation and assert the behavior:
  world.stepSimulation(timestep, maxSubsteps)
})


testContactCallback('btDiscreteDynamicsWorld.prototype.setContactProcessedCallback should work like a charm', t => {

  const world = createDiscreteDynamicsWorld()
  const timestep = 1
  const maxSubsteps = 0

  // Place two boxes at the origin to generate a collision:
  const bodyA = createUnitBox()
  bodyA.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  world.addRigidBody(bodyA)

  const bodyB = createUnitBox()
  bodyB.setCollisionFlags(CF_CUSTOM_MATERIAL_CALLBACK)
  world.addRigidBody(bodyB)

  // Set up the callback:
  let expectedInvocations = 4
  const callback = (cp, body0, body1) => {
    t.not(cp, undefined)

    body0 = Ammo.wrapPointer(body0, Ammo.btCollisionObject)
    t.assert(Ammo.compare(body0, bodyA))

    body1 = Ammo.wrapPointer(body1, Ammo.btCollisionObject)
    t.assert(Ammo.compare(body1, bodyB))

    if (--expectedInvocations < 1) t.end()
  }
  const callbackPointer = Ammo.addFunction(callback, Ammo.CONTACT_PROCESSED_CALLBACK_SIGNATURE)
  world.setContactProcessedCallback(callbackPointer)
  t.teardown(() => world.setContactProcessedCallback(null))

  // Step the simulation and assert the behavior:
  world.stepSimulation(timestep, maxSubsteps)
})


test.cb('btDynamicsWorld.prototype.setInternalTickCallback should work like a charm', t => {

  const world = createDiscreteDynamicsWorld()
  const timestep = 1 // integer is easy to assert
  const maxSubsteps = 0 // required for a stable callback timestep

  // Set up the callback:
  let expectedInvocations = 1
  const callback = (_world, _timestep) => {
    _world = Ammo.wrapPointer(_world, Ammo.btDiscreteDynamicsWorld)
    t.assert(Ammo.compare(_world, world))
    t.is(_timestep, timestep)
    if (--expectedInvocations < 1) t.end()
  }
  callback.pointer = Ammo.addFunction(callback, Ammo.INTERNAL_TICK_CALLBACK_SIGNATURE)
  world.setInternalTickCallback(callback.pointer)
  t.teardown(() => world.setInternalTickCallback(null))

  // Step the simulation and assert the behavior:
  world.stepSimulation(timestep, maxSubsteps)
})
