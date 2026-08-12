import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

// Invisible box that keeps thrown keycaps inside the canvas viewport.
// No ceiling — keycaps spawn above the visible frame and fall into view.
const ScreenJar = () => (
  <RigidBody type="fixed" colliders={false}>
    <CuboidCollider args={[12, 0.5, 6]} position={[0, -8, 0]} />
    <CuboidCollider args={[0.5, 40, 6]} position={[-12, 0, 0]} />
    <CuboidCollider args={[0.5, 40, 6]} position={[12, 0, 0]} />
    <CuboidCollider args={[12, 40, 0.5]} position={[0, 0, -4]} />
    <CuboidCollider args={[12, 40, 0.5]} position={[0, 0, 4]} />
  </RigidBody>
);

export default ScreenJar;
