import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export const FLOOR_Y = -6;

// Invisible box that keeps thrown keycaps inside the canvas viewport.
// No ceiling — keycaps spawn above the visible frame and fall into view.
// Floor sits above -8 so the resting pile doesn't end up hidden/unclickable
// under the page's fixed footer bar.
// Named so KeyCap's onCollisionEnter can tell which surface it hit — only
// the x-axis (left/right) walls get the electric wall-collision effect,
// matching the roaming robot's screen-space wall visual; the floor is
// normal resting contact and front/back depth walls are skipped for the
// same reason the robot skips its z bounds.
const ScreenJar = () => (
  <RigidBody type="fixed" colliders={false}>
    <CuboidCollider name="jar-floor" args={[12, 0.5, 6]} position={[0, FLOOR_Y, 0]} />
    <CuboidCollider name="jar-wall-x" args={[0.5, 40, 6]} position={[-12, 0, 0]} />
    <CuboidCollider name="jar-wall-x" args={[0.5, 40, 6]} position={[12, 0, 0]} />
    <CuboidCollider name="jar-wall-z" args={[12, 40, 0.5]} position={[0, 0, -4]} />
    <CuboidCollider name="jar-wall-z" args={[12, 40, 0.5]} position={[0, 0, 4]} />
  </RigidBody>
);

export default ScreenJar;
