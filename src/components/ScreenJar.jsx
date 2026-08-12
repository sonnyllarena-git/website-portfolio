import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export const FLOOR_Y = -6;

// Invisible box that keeps thrown keycaps inside the canvas viewport.
// No ceiling — keycaps spawn above the visible frame and fall into view.
// Floor sits above -8 so the resting pile doesn't end up hidden/unclickable
// under the page's fixed footer bar.
const ScreenJar = () => (
  <RigidBody type="fixed" colliders={false}>
    <CuboidCollider args={[12, 0.5, 6]} position={[0, FLOOR_Y, 0]} />
    <CuboidCollider args={[0.5, 40, 6]} position={[-12, 0, 0]} />
    <CuboidCollider args={[0.5, 40, 6]} position={[12, 0, 0]} />
    <CuboidCollider args={[12, 40, 0.5]} position={[0, 0, -4]} />
    <CuboidCollider args={[12, 40, 0.5]} position={[0, 0, 4]} />
  </RigidBody>
);

export default ScreenJar;
