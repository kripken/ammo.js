/*
 Written by Xuchen Han <xuchenhan2015@u.northwestern.edu>
 
 Bullet Continuous Collision Detection and Physics Library
 Copyright (c) 2019 Google Inc. http://bulletphysics.org
 This software is provided 'as-is', without any express or implied warranty.
 In no event will the authors be held liable for any damages arising from the use of this software.
 Permission is granted to anyone to use this software for any purpose,
 including commercial applications, and to alter it and redistribute it freely,
 subject to the following restrictions:
 1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
 2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
 3. This notice may not be removed or altered from any source distribution.
 */

#include "btDeformableContactConstraint.h"
/* ================   Deformable Node Anchor   =================== */
btDeformableNodeAnchorConstraint::btDeformableNodeAnchorConstraint(const btSoftBody::DeformableNodeRigidAnchor& a)
: m_anchor(&a)
, btDeformableContactConstraint(a.m_cti.m_normal)
{
}

btDeformableNodeAnchorConstraint::btDeformableNodeAnchorConstraint(const btDeformableNodeAnchorConstraint& other)
: m_anchor(other.m_anchor)
, btDeformableContactConstraint(other)
{
}

btVector3 btDeformableNodeAnchorConstraint::getVa() const
{
    const btSoftBody::sCti& cti = m_anchor->m_cti;
    btVector3 va(0, 0, 0);
    if (cti.m_colObj->hasContactResponse())
    {
        btRigidBody* rigidCol = 0;
        btMultiBodyLinkCollider* multibodyLinkCol = 0;
        
        // grab the velocity of the rigid body
        if (cti.m_colObj->getInternalType() == btCollisionObject::CO_RIGID_BODY)
        {
            rigidCol = (btRigidBody*)btRigidBody::upcast(cti.m_colObj);
            va = rigidCol ? (rigidCol->getVelocityInLocalPoint(m_anchor->m_c1)) : btVector3(0, 0, 0);
        }
        else if (cti.m_colObj->getInternalType() == btCollisionObject::CO_FEATHERSTONE_LINK)
        {
            multibodyLinkCol = (btMultiBodyLinkCollider*)btMultiBodyLinkCollider::upcast(cti.m_colObj);
            if (multibodyLinkCol)
            {
                const int ndof = multibodyLinkCol->m_multiBody->getNumDofs() + 6;
                const btScalar* J_n = &m_anchor->jacobianData_normal.m_jacobians[0];
                const btScalar* J_t1 = &m_anchor->jacobianData_t1.m_jacobians[0];
                const btScalar* J_t2 = &m_anchor->jacobianData_t2.m_jacobians[0];
                const btScalar* local_v = multibodyLinkCol->m_multiBody->getVelocityVector();
                const btScalar* local_dv = multibodyLinkCol->m_multiBody->getDeltaVelocityVector();
                // add in the normal component of the va
                btScalar vel = 0.0;
                for (int k = 0; k < ndof; ++k)
                {
                    vel += (local_v[k]+local_dv[k]) * J_n[k];
                }
                va = cti.m_normal * vel;
                // add in the tangential components of the va
                vel = 0.0;
                for (int k = 0; k < ndof; ++k)
                {
                    vel += (local_v[k]+local_dv[k]) * J_t1[k];
                }
                va += m_anchor->t1 * vel;
                vel = 0.0;
                for (int k = 0; k < ndof; ++k)
                {
                    vel += (local_v[k]+local_dv[k]) * J_t2[k];
                }
                va += m_anchor->t2 * vel;
            }
        }
    }
    return va;
}

btScalar btDeformableNodeAnchorConstraint::solveConstraint()
{
    const btSoftBody::sCti& cti = m_anchor->m_cti;
    btVector3 va = getVa();
    btVector3 vb = getVb();
    btVector3 vr = (vb - va);
    // + (m_anchor->m_node->m_x - cti.m_colObj->getWorldTransform() * m_anchor->m_local) * 10.0
    const btScalar dn = btDot(vr, cti.m_normal);
    // dn is the normal component of velocity diffrerence. Approximates the residual. // todo xuchenhan@: this prob needs to be scaled by dt
    btScalar residualSquare = dn*dn;
    btVector3 impulse = m_anchor->m_c0 * vr;
    // apply impulse to deformable nodes involved and change their velocities
    applyImpulse(impulse);
    
    // apply impulse to the rigid/multibodies involved and change their velocities
    if (cti.m_colObj->getInternalType() == btCollisionObject::CO_RIGID_BODY)
    {
        btRigidBody* rigidCol = 0;
        rigidCol = (btRigidBody*)btRigidBody::upcast(cti.m_colObj);
        if (rigidCol)
        {
            rigidCol->applyImpulse(impulse, m_anchor->m_c1);
        }
    }
    else if (cti.m_colObj->getInternalType() == btCollisionObject::CO_FEATHERSTONE_LINK)
    {
        btMultiBodyLinkCollider* multibodyLinkCol = 0;
        multibodyLinkCol = (btMultiBodyLinkCollider*)btMultiBodyLinkCollider::upcast(cti.m_colObj);
        if (multibodyLinkCol)
        {
            const btScalar* deltaV_normal = &m_anchor->jacobianData_normal.m_deltaVelocitiesUnitImpulse[0];
            // apply normal component of the impulse
            multibodyLinkCol->m_multiBody->applyDeltaVeeMultiDof2(deltaV_normal, impulse.dot(cti.m_normal));
            // apply tangential component of the impulse
            const btScalar* deltaV_t1 = &m_anchor->jacobianData_t1.m_deltaVelocitiesUnitImpulse[0];
            multibodyLinkCol->m_multiBody->applyDeltaVeeMultiDof2(deltaV_t1, impulse.dot(m_anchor->t1));
            const btScalar* deltaV_t2 = &m_anchor->jacobianData_t2.m_deltaVelocitiesUnitImpulse[0];
            multibodyLinkCol->m_multiBody->applyDeltaVeeMultiDof2(deltaV_t2, impulse.dot(m_anchor->t2));
        }
    }
    return residualSquare;
}

btVector3 btDeformableNodeAnchorConstraint::getVb() const
{
    return m_anchor->m_node->m_v;
}

void btDeformableNodeAnchorConstraint::applyImpulse(const btVector3& impulse)
{
    btVector3 dv = impulse * m_anchor->m_c2;
    m_anchor->m_node->m_v -= dv;
}

/* ================   Deformable vs. Rigid   =================== */
btDeformableRigidContactConstraint::btDeformableRigidContactConstraint(const btSoftBody::DeformableRigidContact& c)
: m_contact(&c)
, btDeformableContactConstraint(c.m_cti.m_normal)
{
    m_total_normal_dv.setZero();
    m_total_tangent_dv.setZero();
    // penetration is non-positive. The magnitude of penetration is the depth of penetration.
    m_penetration = btMin(btScalar(0), c.m_cti.m_offset);
}

btDeformableRigidContactConstraint::btDeformableRigidContactConstraint(const btDeformableRigidContactConstraint& other)
: m_contact(other.m_contact)
, btDeformableContactConstraint(other)
, m_penetration(other.m_penetration)
{
    m_total_normal_dv = other.m_total_normal_dv;
    m_total_tangent_dv = other.m_total_tangent_dv;
}


btVector3 btDeformableRigidContactConstraint::getVa() const
{
    const btSoftBody::sCti& cti = m_contact->m_cti;
    btVector3 va(0, 0, 0);
    if (cti.m_colObj->hasContactResponse())
    {
        btRigidBody* rigidCol = 0;
        btMultiBodyLinkCollider* multibodyLinkCol = 0;
        
        // grab the velocity of the rigid body
        if (cti.m_colObj->getInternalType() == btCollisionObject::CO_RIGID_BODY)
        {
            rigidCol = (btRigidBody*)btRigidBody::upcast(cti.m_colObj);
            va = rigidCol ? (rigidCol->getVelocityInLocalPoint(m_contact->m_c1)) : btVector3(0, 0, 0);
        }
        else if (cti.m_colObj->getInternalType() == btCollisionObject::CO_FEATHERSTONE_LINK)
        {
            multibodyLinkCol = (btMultiBodyLinkCollider*)btMultiBodyLinkCollider::upcast(cti.m_colObj);
            if (multibodyLinkCol)
            {
                const int ndof = multibodyLinkCol->m_multiBody->getNumDofs() + 6;
                const btScalar* J_n = &m_contact->jacobianData_normal.m_jacobians[0];
                const btScalar* J_t1 = &m_contact->jacobianData_t1.m_jacobians[0];
                const btScalar* J_t2 = &m_contact->jacobianData_t2.m_jacobians[0];
                const btScalar* local_v = multibodyLinkCol->m_multiBody->getVelocityVector();
                const btScalar* local_dv = multibodyLinkCol->m_multiBody->getDeltaVelocityVector();
                // add in the normal component of the va
                btScalar vel = 0.0;
                for (int k = 0; k < ndof; ++k)
                {
                    vel += (local_v[k]+local_dv[k]) * J_n[k];
                }
                va = cti.m_normal * vel;
                // add in the tangential components of the va
                vel = 0.0;
                for (int k = 0; k < ndof; ++k)
                {
                    vel += (local_v[k]+local_dv[k]) * J_t1[k];
                }
                va += m_contact->t1 * vel;
                vel = 0.0;
                for (int k = 0; k < ndof; ++k)
                {
                    vel += (local_v[k]+local_dv[k]) * J_t2[k];
                }
                va += m_contact->t2 * vel;
            }
        }
    }
    return va;
}

btScalar btDeformableRigidContactConstraint::solveConstraint()
{
    const btSoftBody::sCti& cti = m_contact->m_cti;
    btVector3 va = getVa();
    btVector3 vb = getVb();
    btVector3 vr = vb - va;
    const btScalar dn = btDot(vr, cti.m_normal);
    // dn is the normal component of velocity diffrerence. Approximates the residual. // todo xuchenhan@: this prob needs to be scaled by dt
    btScalar residualSquare = dn*dn;
    btVector3 impulse = m_contact->m_c0 * vr;
    const btVector3 impulse_normal = m_contact->m_c0 * (cti.m_normal * dn);
    btVector3 impulse_tangent = impulse - impulse_normal;
    btVector3 old_total_tangent_dv = m_total_tangent_dv;
    // m_c2 is the inverse mass of the deformable node/face
    m_total_normal_dv -= impulse_normal * m_contact->m_c2;
    m_total_tangent_dv -= impulse_tangent * m_contact->m_c2;

    if (m_total_normal_dv.dot(cti.m_normal) < 0)
    {
        // separating in the normal direction
        m_static = false;
        m_total_tangent_dv = btVector3(0,0,0);
        impulse_tangent.setZero();
    }
    else
    {
        if (m_total_normal_dv.norm() * m_contact->m_c3 < m_total_tangent_dv.norm())
        {
            // dynamic friction
            // with dynamic friction, the impulse are still applied to the two objects colliding, however, it does not pose a constraint in the cg solve, hence the change to dv merely serves to update velocity in the contact iterations.
            m_static = false;
            if (m_total_tangent_dv.safeNorm() < SIMD_EPSILON)
            {
                m_total_tangent_dv = btVector3(0,0,0);
            }
            else
            {
                m_total_tangent_dv = m_total_tangent_dv.normalized() * m_total_normal_dv.safeNorm() * m_contact->m_c3;
            }
            impulse_tangent = -btScalar(1)/m_contact->m_c2 * (m_total_tangent_dv - old_total_tangent_dv);
        }
        else
        {
            // static friction
            m_static = true;
        }
    }
    impulse = impulse_normal + impulse_tangent;
    // apply impulse to deformable nodes involved and change their velocities
    applyImpulse(impulse);
    // apply impulse to the rigid/multibodies involved and change their velocities
    if (cti.m_colObj->getInternalType() == btCollisionObject::CO_RIGID_BODY)
    {
        btRigidBody* rigidCol = 0;
        rigidCol = (btRigidBody*)btRigidBody::upcast(cti.m_colObj);
        if (rigidCol)
        {
            rigidCol->applyImpulse(impulse, m_contact->m_c1);
        }
    }
    else if (cti.m_colObj->getInternalType() == btCollisionObject::CO_FEATHERSTONE_LINK)
    {
        btMultiBodyLinkCollider* multibodyLinkCol = 0;
        multibodyLinkCol = (btMultiBodyLinkCollider*)btMultiBodyLinkCollider::upcast(cti.m_colObj);
        if (multibodyLinkCol)
        {
            const btScalar* deltaV_normal = &m_contact->jacobianData_normal.m_deltaVelocitiesUnitImpulse[0];
            // apply normal component of the impulse
            multibodyLinkCol->m_multiBody->applyDeltaVeeMultiDof2(deltaV_normal, impulse.dot(cti.m_normal));
            if (impulse_tangent.norm() > SIMD_EPSILON)
            {
                // apply tangential component of the impulse
                const btScalar* deltaV_t1 = &m_contact->jacobianData_t1.m_deltaVelocitiesUnitImpulse[0];
                multibodyLinkCol->m_multiBody->applyDeltaVeeMultiDof2(deltaV_t1, impulse.dot(m_contact->t1));
                const btScalar* deltaV_t2 = &m_contact->jacobianData_t2.m_deltaVelocitiesUnitImpulse[0];
                multibodyLinkCol->m_multiBody->applyDeltaVeeMultiDof2(deltaV_t2, impulse.dot(m_contact->t2));
            }
        }
    }
    return residualSquare;
}

btScalar btDeformableRigidContactConstraint::solveSplitImpulse(const btContactSolverInfo& infoGlobal)
{
    const btSoftBody::sCti& cti = m_contact->m_cti;
    const btScalar dn = m_penetration;
    if (dn != 0)
    {
        const btVector3 impulse = (m_contact->m_c0 * (cti.m_normal * dn / infoGlobal.m_timeStep));
        // one iteration of the position impulse corrects all the position error at this timestep
        m_penetration -= dn;
        // apply impulse to deformable nodes involved and change their position
        applySplitImpulse(impulse);
        // apply impulse to the rigid/multibodies involved and change their position
        if (cti.m_colObj->getInternalType() == btCollisionObject::CO_RIGID_BODY)
        {
            btRigidBody* rigidCol = 0;
            rigidCol = (btRigidBody*)btRigidBody::upcast(cti.m_colObj);
            if (rigidCol)
            {
                rigidCol->applyPushImpulse(impulse, m_contact->m_c1);
            }
        }
        else if (cti.m_colObj->getInternalType() == btCollisionObject::CO_FEATHERSTONE_LINK)
        {
            // todo xuchenhan@
        }
        return (m_penetration/infoGlobal.m_timeStep) * (m_penetration/infoGlobal.m_timeStep);
    }
    return 0;
}

/* ================   Node vs. Rigid   =================== */
btDeformableNodeRigidContactConstraint::btDeformableNodeRigidContactConstraint(const btSoftBody::DeformableNodeRigidContact& contact)
    : m_node(contact.m_node)
    , btDeformableRigidContactConstraint(contact)
    {
    }

btDeformableNodeRigidContactConstraint::btDeformableNodeRigidContactConstraint(const btDeformableNodeRigidContactConstraint& other)
: m_node(other.m_node)
, btDeformableRigidContactConstraint(other)
{
}

btVector3 btDeformableNodeRigidContactConstraint::getVb() const
{
    return m_node->m_v;
}


btVector3 btDeformableNodeRigidContactConstraint::getDv(const btSoftBody::Node* node) const
{
    return m_total_normal_dv + m_total_tangent_dv;
}

void btDeformableNodeRigidContactConstraint::applyImpulse(const btVector3& impulse)
{
    const btSoftBody::DeformableNodeRigidContact* contact = getContact();
    btVector3 dv = impulse * contact->m_c2;
    contact->m_node->m_v -= dv;
}

void btDeformableNodeRigidContactConstraint::applySplitImpulse(const btVector3& impulse)
{
    const btSoftBody::DeformableNodeRigidContact* contact = getContact();
    btVector3 dv = impulse * contact->m_c2;
    contact->m_node->m_vsplit -= dv;
};

/* ================   Face vs. Rigid   =================== */
btDeformableFaceRigidContactConstraint::btDeformableFaceRigidContactConstraint(const btSoftBody::DeformableFaceRigidContact& contact)
: m_face(contact.m_face)
, btDeformableRigidContactConstraint(contact)
{
}

btDeformableFaceRigidContactConstraint::btDeformableFaceRigidContactConstraint(const btDeformableFaceRigidContactConstraint& other)
: m_face(other.m_face)
, btDeformableRigidContactConstraint(other)
{
}

btVector3 btDeformableFaceRigidContactConstraint::getVb() const
{
    const btSoftBody::DeformableFaceRigidContact* contact = getContact();
    btVector3 vb = m_face->m_n[0]->m_v * contact->m_bary[0] + m_face->m_n[1]->m_v * contact->m_bary[1] + m_face->m_n[2]->m_v * contact->m_bary[2];
    return vb;
}


btVector3 btDeformableFaceRigidContactConstraint::getDv(const btSoftBody::Node* node) const
{
    btVector3 face_dv = m_total_normal_dv + m_total_tangent_dv;
    const btSoftBody::DeformableFaceRigidContact* contact = getContact();
    if (m_face->m_n[0] == node)
    {
        return face_dv * contact->m_weights[0];
    }
    if (m_face->m_n[1] == node)
    {
        return face_dv * contact->m_weights[1];
    }
    btAssert(node == m_face->m_n[2]);
    return face_dv * contact->m_weights[2];
}

void btDeformableFaceRigidContactConstraint::applyImpulse(const btVector3& impulse)
{
    const btSoftBody::DeformableFaceRigidContact* contact = getContact();
    btVector3 dv = impulse * contact->m_c2;
    btSoftBody::Face* face = contact->m_face;
    
    btVector3& v0 = face->m_n[0]->m_v;
    btVector3& v1 = face->m_n[1]->m_v;
    btVector3& v2 = face->m_n[2]->m_v;
    const btScalar& im0 = face->m_n[0]->m_im;
    const btScalar& im1 = face->m_n[1]->m_im;
    const btScalar& im2 = face->m_n[2]->m_im;
    if (im0 > 0)
        v0 -= dv * contact->m_weights[0];
    if (im1 > 0)
        v1 -= dv * contact->m_weights[1];
    if (im2 > 0)
        v2 -= dv * contact->m_weights[2];
    
    // apply strain limiting to prevent undamped modes
    btScalar m01 = (btScalar(1)/(im0 + im1));
    btScalar m02 = (btScalar(1)/(im0 + im2));
    btScalar m12 = (btScalar(1)/(im1 + im2));
    
    btVector3 dv0 = im0 * (m01 * (v1-v0) + m02 * (v2-v0));
    btVector3 dv1 = im1 * (m01 * (v0-v1) + m12 * (v2-v1));
    btVector3 dv2 = im2 * (m12 * (v1-v2) + m02 * (v0-v2));
    
    v0 += dv0;
    v1 += dv1;
    v2 += dv2;
}

void btDeformableFaceRigidContactConstraint::applySplitImpulse(const btVector3& impulse)
{
    const btSoftBody::DeformableFaceRigidContact* contact = getContact();
    btVector3 dv = impulse * contact->m_c2;
    btSoftBody::Face* face = contact->m_face;

    btVector3& v0 = face->m_n[0]->m_vsplit;
    btVector3& v1 = face->m_n[1]->m_vsplit;
    btVector3& v2 = face->m_n[2]->m_vsplit;
    const btScalar& im0 = face->m_n[0]->m_im;
    const btScalar& im1 = face->m_n[1]->m_im;
    const btScalar& im2 = face->m_n[2]->m_im;
    if (im0 > 0)
        v0 -= dv * contact->m_weights[0];
    if (im1 > 0)
        v1 -= dv * contact->m_weights[1];
    if (im2 > 0)
        v2 -= dv * contact->m_weights[2];
}

/* ================   Face vs. Node   =================== */
btDeformableFaceNodeContactConstraint::btDeformableFaceNodeContactConstraint(const btSoftBody::DeformableFaceNodeContact& contact)
: m_node(contact.m_node)
, m_face(contact.m_face)
, m_contact(&contact)
, btDeformableContactConstraint(contact.m_normal)
{
    m_total_normal_dv.setZero();
    m_total_tangent_dv.setZero();
}

btVector3 btDeformableFaceNodeContactConstraint::getVa() const
{
    return m_node->m_v;
}

btVector3 btDeformableFaceNodeContactConstraint::getVb() const
{
    const btSoftBody::DeformableFaceNodeContact* contact = getContact();
    btVector3 vb = m_face->m_n[0]->m_v * contact->m_bary[0] + m_face->m_n[1]->m_v * contact->m_bary[1] + m_face->m_n[2]->m_v * contact->m_bary[2];
    return vb;
}

btVector3 btDeformableFaceNodeContactConstraint::getDv(const btSoftBody::Node* n) const
{
    btVector3 dv = m_total_normal_dv + m_total_tangent_dv;
    if (n == m_node)
        return dv;
    const btSoftBody::DeformableFaceNodeContact* contact = getContact();
    if (m_face->m_n[0] == n)
    {
        return dv * contact->m_weights[0];
    }
    if (m_face->m_n[1] == n)
    {
        return dv * contact->m_weights[1];
    }
    btAssert(n == m_face->m_n[2]);
    return dv * contact->m_weights[2];
}

btScalar btDeformableFaceNodeContactConstraint::solveConstraint()
{
    btVector3 va = getVa();
    btVector3 vb = getVb();
    btVector3 vr = vb - va;
    const btScalar dn = btDot(vr, m_contact->m_normal);
    // dn is the normal component of velocity diffrerence. Approximates the residual. // todo xuchenhan@: this prob needs to be scaled by dt
    btScalar residualSquare = dn*dn;
    btVector3 impulse = m_contact->m_c0 * vr;
    const btVector3 impulse_normal = m_contact->m_c0 * (m_contact->m_normal * dn);
    btVector3 impulse_tangent = impulse - impulse_normal;
    
    btVector3 old_total_tangent_dv = m_total_tangent_dv;
    // m_c2 is the inverse mass of the deformable node/face
    if (m_node->m_im > 0)
    {
        m_total_normal_dv -= impulse_normal * m_node->m_im;
        m_total_tangent_dv -= impulse_tangent * m_node->m_im;
    }
    else
    {
        m_total_normal_dv -= impulse_normal * m_contact->m_imf;
        m_total_tangent_dv -= impulse_tangent *  m_contact->m_imf;
    }
    
    if (m_total_normal_dv.dot(m_contact->m_normal) > 0)
    {
        // separating in the normal direction
        m_static = false;
        m_total_tangent_dv = btVector3(0,0,0);
        impulse_tangent.setZero();
    }
    else
    {
        if (m_total_normal_dv.norm() * m_contact->m_friction < m_total_tangent_dv.norm())
        {
            // dynamic friction
            // with dynamic friction, the impulse are still applied to the two objects colliding, however, it does not pose a constraint in the cg solve, hence the change to dv merely serves to update velocity in the contact iterations.
            m_static = false;
            if (m_total_tangent_dv.safeNorm() < SIMD_EPSILON)
            {
                m_total_tangent_dv = btVector3(0,0,0);
            }
            else
            {
                m_total_tangent_dv = m_total_tangent_dv.normalized() * m_total_normal_dv.safeNorm() * m_contact->m_friction;
            }
            impulse_tangent = -btScalar(1)/m_node->m_im * (m_total_tangent_dv - old_total_tangent_dv);
        }
        else
        {
            // static friction
            m_static = true;
        }
    }
    impulse = impulse_normal + impulse_tangent;
    // apply impulse to deformable nodes involved and change their velocities
    applyImpulse(impulse);
    return residualSquare;
}

void btDeformableFaceNodeContactConstraint::applyImpulse(const btVector3& impulse)
{
    const btSoftBody::DeformableFaceNodeContact* contact = getContact();
    btVector3 dva = impulse * contact->m_node->m_im;
    btVector3 dvb = impulse * contact->m_imf;
    if (contact->m_node->m_im > 0)
    {
        contact->m_node->m_v += dva;
    }
    
    btSoftBody::Face* face = contact->m_face;
    btVector3& v0 = face->m_n[0]->m_v;
    btVector3& v1 = face->m_n[1]->m_v;
    btVector3& v2 = face->m_n[2]->m_v;
    const btScalar& im0 = face->m_n[0]->m_im;
    const btScalar& im1 = face->m_n[1]->m_im;
    const btScalar& im2 = face->m_n[2]->m_im;
    if (im0 > 0)
    {
        v0 -= dvb * contact->m_weights[0];
    }
    if (im1 > 0)
    {
        v1 -= dvb * contact->m_weights[1];
    }
    if (im2 > 0)
    {
        v2 -= dvb * contact->m_weights[2];
    }
    // todo: Face node constraints needs more work
//    btScalar m01 = (btScalar(1)/(im0 + im1));
//    btScalar m02 = (btScalar(1)/(im0 + im2));
//    btScalar m12 = (btScalar(1)/(im1 + im2));
//
//    btVector3 dv0 = im0 * (m01 * (v1-v0) + m02 * (v2-v0));
//    btVector3 dv1 = im1 * (m01 * (v0-v1) + m12 * (v2-v1));
//    btVector3 dv2 = im2 * (m12 * (v1-v2) + m02 * (v0-v2));
//    v0 += dv0;
//    v1 += dv1;
//    v2 += dv2;
}
