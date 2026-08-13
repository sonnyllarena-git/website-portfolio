import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useRobotPosition } from '../context/RobotPositionContext';
import { ndcToWorldOnPlane } from '../utils/ndcToWorldOnPlane';
import { JAR_Z_HALF_DEPTH } from './ScreenJar';

// How far (in real screen pixels) the robot's collision footprint reaches
// left/right and up/down — converted into this camera's world units below,
// so the collider scales sensibly with viewport size instead of being a
// fixed jar-world constant.
const FOOTPRINT_RADIUS_PX = 60;

// Caps how far the proxy body can move in a single frame (world units) —
// guards against a resize-triggered bounds jump teleporting it straight
// through a resting keycap in one step, the same spirit as KeyCap.jsx's
// MAX_DRAG_SPEED clamp on drag velocity.
const MAX_STEP = 0.6;

// A kinematic Rapier body, inside the keycap jar's own physics world, that
// tracks the roaming robot's real screen position every frame (published by
// RoamingRobot — a completely different Canvas/camera — into
// RobotPositionContext) and converts it into this jar's world space via
// raycasting against the resting z=0 plane. Kinematic bodies push dynamic
// bodies (the keycaps) out of the way without being pushed back themselves —
// real Rapier collision, without merging the two systems' renderers or
// cameras. Spans the jar's full z-depth (JAR_Z_HALF_DEPTH) rather than one
// exact z — there's no "real" z for the robot in this coordinate system —
// so it contacts keycaps resting anywhere across that depth, not just ones
// that happen to share a single z.
const RobotProxyBody = () => {
  const rigidBodyRef = useRef();
  const robotPositionRef = useRobotPosition();
  const { camera, size } = useThree();
  const targetVecRef = useRef(new Vector3());
  const currentVecRef = useRef(new Vector3());
  const initializedRef = useRef(false);

  useFrame(() => {
    const body = rigidBodyRef.current;
    const robotPos = robotPositionRef?.current;
    if (!body || !robotPos?.active) return;

    const hit = ndcToWorldOnPlane(robotPos.x, robotPos.y, camera, 0, targetVecRef.current);
    if (!hit) return;

    const current = currentVecRef.current;
    if (!initializedRef.current) {
      current.copy(hit);
      initializedRef.current = true;
    } else {
      const delta = hit.clone().sub(current);
      const dist = delta.length();
      if (dist > MAX_STEP) delta.multiplyScalar(MAX_STEP / dist);
      current.add(delta);
    }

    body.setNextKinematicTranslation({ x: current.x, y: current.y, z: current.z });
  });

  // A fixed pixel footprint converted through this camera at the resting
  // plane, recomputed on resize (RigidBody/CuboidCollider args changes are
  // reactive in @react-three/rapier — no remount needed).
  const radius = useMemo(() => {
    const center = ndcToWorldOnPlane(0, 0, camera, 0);
    const edge = ndcToWorldOnPlane(FOOTPRINT_RADIUS_PX / (size.width / 2), 0, camera, 0);
    if (!center || !edge) return 1.2;
    return Math.max(0.4, Math.abs(edge.x - center.x));
  }, [camera, size]);

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders={false}>
      <CuboidCollider name="robot-proxy" args={[radius, radius, JAR_Z_HALF_DEPTH]} />
    </RigidBody>
  );
};

export default RobotProxyBody;
