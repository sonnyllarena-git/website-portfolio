import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { pixelToWorldOnPlane } from '../utils/ndcToWorldOnPlane';

// Playable z-depth of the jar — unrelated to screen coverage (the shared
// "framewire" ask is about x/y matching the real screen, not z), so this
// stays fixed rather than being derived from the arena. Exported so
// RobotProxyBody's collider can span the same z-range instead of only
// contacting keycaps that happen to share one exact z.
export const JAR_Z_HALF_DEPTH = 3.5;
const WALL_THICKNESS = 0.5;
const WALL_HEIGHT = 40; // no ceiling — tall enough that off-screen-above spawns always clear it
const FLOOR_Z_HALF_EXTENT = 6; // a bit more generous than the z-walls' own containment, unchanged from before

// Fallback for consumers that need a value before the first live
// measurement resolves (see KeyPhysicsOverlay's floor mesh/ContactShadows).
export const FLOOR_Y = -6;

// Converts the shared arena's real screen-pixel bounds into THIS camera's
// world-space floor/wall extents via raycasting (the same technique
// KeyCap.jsx already uses for drag), replacing the old fixed ±12/-6 guesses
// that had no relationship to the real screen. Exported so KeyPhysicsOverlay
// can size its visible floor mesh/ContactShadows to match — both call sites
// derive from this one implementation instead of two independent copies.
export function useJarFloorBounds(arena) {
  const { camera, size } = useThree();

  return useMemo(() => {
    const left = pixelToWorldOnPlane(arena.left, size.height / 2, size.width, size.height, camera, 0);
    const right = pixelToWorldOnPlane(arena.right, size.height / 2, size.width, size.height, camera, 0);
    const bottom = pixelToWorldOnPlane(size.width / 2, arena.bottom, size.width, size.height, camera, 0);
    const floorY = bottom?.y ?? FLOOR_Y;
    const leftX = left?.x ?? -12;
    const rightX = right?.x ?? 12;
    return { floorY, leftX, rightX, halfWidth: (rightX - leftX) / 2, centerX: (rightX + leftX) / 2 };
  }, [arena, camera, size]);
}

// Invisible box that keeps thrown keycaps inside the shared "framewire" —
// wall/floor x and y positions come from useJarFloorBounds() above. No
// ceiling — keycaps spawn above the visible frame and fall into view; a
// ceiling at the arena's top would block that entirely.
// Named so KeyCap's onCollisionEnter can tell which surface it hit — only
// the x-axis (left/right) walls get the electric wall-collision effect,
// matching the roaming robot's screen-space wall visual; the floor is
// normal resting contact and front/back depth walls are skipped for the
// same reason the robot skips its z bounds.
const ScreenJar = ({ arena }) => {
  const { floorY, leftX, rightX, halfWidth, centerX } = useJarFloorBounds(arena);

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        name="jar-floor"
        args={[halfWidth, WALL_THICKNESS, FLOOR_Z_HALF_EXTENT]}
        position={[centerX, floorY, 0]}
      />
      <CuboidCollider
        name="jar-wall-x"
        args={[WALL_THICKNESS, WALL_HEIGHT, JAR_Z_HALF_DEPTH]}
        position={[leftX, 0, 0]}
      />
      <CuboidCollider
        name="jar-wall-x"
        args={[WALL_THICKNESS, WALL_HEIGHT, JAR_Z_HALF_DEPTH]}
        position={[rightX, 0, 0]}
      />
      <CuboidCollider
        name="jar-wall-z"
        args={[halfWidth, WALL_HEIGHT, WALL_THICKNESS]}
        position={[centerX, 0, -(JAR_Z_HALF_DEPTH + WALL_THICKNESS)]}
      />
      <CuboidCollider
        name="jar-wall-z"
        args={[halfWidth, WALL_HEIGHT, WALL_THICKNESS]}
        position={[centerX, 0, JAR_Z_HALF_DEPTH + WALL_THICKNESS]}
      />
    </RigidBody>
  );
};

export default ScreenJar;
