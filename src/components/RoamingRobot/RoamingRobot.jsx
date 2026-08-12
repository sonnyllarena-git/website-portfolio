import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import RobotModel from '../ChatRobot/RobotModel';
import RobotPhysics, { BASE_BOUNDS, computeDynamicBounds } from './RobotPhysics';
import { useKeycapAvoidance } from '../../context/KeycapAvoidanceContext';
import { WallCollisionEffect } from '../effects/WallCollisionEffect';
import { EYE_LEVEL_FROM_TOP } from '../../utils/perspective';

const CAMERA_FOV = 50;
const ROBOT_SCALE = 0.28;
const BEAM_END_Z = 1.4; // near the "screen surface" so the beam reads as hitting the button
const UP_AXIS = new Vector3(0, 1, 0);
const MAX_WALL_HIT_EFFECTS = 6; // caps runaway spawns if the robot gets pinned

// The robot's layer always renders behind <main> (z-20 in App.jsx), on every
// page — it used to swap in front of content when close enough, but that
// meant it (and its wall-collision flashes) could land directly on top of
// body text on pages denser than Home, obscuring it. Page content stays the
// front-most layer everywhere; Navbar/Footer/Chat stay above both regardless.
const BEHIND_LAYER_Z = 15;

// pos.z is the model's real distance from a camera at the origin, so the
// PerspectiveCamera's own projection gives correct "far = small" perspective
// — no manual screen-space math needed like a 2D-canvas approach would.
// Uses the nominal CAMERA_FOV constant rather than the live camera.fov,
// which applyEyeLevelShift() below deliberately inflates — see its comment.
function worldFromPhysics(pos, camera) {
  const vFov = (CAMERA_FOV * Math.PI) / 180;
  const halfHeight = Math.tan(vFov / 2) * pos.z;
  const halfWidth = halfHeight * camera.aspect;
  return [pos.x * halfWidth, pos.y * halfHeight, -pos.z];
}

// Shifts the rendered frame so "straight ahead" (where every depth
// converges on screen, i.e. the robot scene's vanishing point) lands at
// EYE_LEVEL_FROM_TOP instead of dead center (0.5) — matching the
// floor-perspective grid on the About page (src/utils/perspective.js)
// instead of an independently-tuned view. Done by rendering a taller
// virtual frame and outputting only an off-center slice of it (the same
// tilt-shift/perspective-control technique architecture photographers use
// to move a horizon without keystoning), rather than pitching the camera,
// which would tilt verticals too. camera.fov is inflated to cover that
// taller virtual frame — worldFromPhysics/sampleWallEdge deliberately use
// the nominal CAMERA_FOV constant instead, since that's the true output FOV
// once this off-center slice is taken.
function applyEyeLevelShift(camera, width, height) {
  if (!width || !height) return;

  const fullHeight = 2 * (1 - EYE_LEVEL_FROM_TOP) * height;
  const offsetY = fullHeight - height;

  const halfFov = (CAMERA_FOV * Math.PI) / 180 / 2;
  const compensatedHalfFov = Math.atan(Math.tan(halfFov) * (fullHeight / height));
  camera.fov = (compensatedHalfFov * 180) / Math.PI * 2;
  camera.setViewOffset(width, fullHeight, 0, offsetY, width, height);
  camera.updateProjectionMatrix();
}

// How far applyEyeLevelShift's projection shift moves the vanishing point in
// output-NDC-y terms. pixelToNDC must subtract this so a target pixel (e.g.
// the chat button's screen position) still round-trips through
// worldFromPhysics to the same real screen position once the camera's
// projection is off-center — without it the fired beam would visibly land
// above or below its intended target by the eye-level shift amount.
const EYE_LEVEL_NDC_SHIFT = 1 - 2 * EYE_LEVEL_FROM_TOP;

function pixelToNDC(px, py) {
  return {
    x: (px / window.innerWidth) * 2 - 1,
    y: -(py / window.innerHeight) * 2 + 1 - EYE_LEVEL_NDC_SHIFT,
  };
}

// Invisible-until-touched wireframe boundary walls — stay fully transparent
// until the robot hits one, then that specific wall flashes in as a
// force-field grid and fades back out, instead of an invisible clamp with
// no visual at all. Built from the exact computeDynamicBounds curve across
// the z range (the boundary shrinks toward center with depth, so it's a
// tapering funnel, not a flat box) and rendered as thin converging lines —
// a solid filled surface was tried first and just washed the screen in flat
// cyan once the near and far ends of all four walls overlapped; a wireframe
// reads as a receding 3D tunnel instead, the same way any sci-fi force-field
// grid does, without covering the screen.
const WALL_COLOR = '#00FFFF';
const WALL_AMBIENT_OPACITY = 0; // fully invisible at rest — see file header comment
const WALL_FLASH_PEAK_OPACITY = 0.5;
const WALL_FLASH_DECAY = 0.6; // seconds for a flash to fade back out
const WALL_RAIL_SEGMENTS = 20; // resolution of the two long rails tracing each wall's edges
const WALL_RUNG_COUNT = 7; // cross-sectional rungs, like ribs down a funnel
const WALL_SIDES = ['left', 'right', 'top', 'bottom'];
// Maps a physics collision's axis+direction to the wall side it represents.
const WALL_SIDE_BY_HIT = { 'x:min': 'left', 'x:max': 'right', 'y:max': 'top', 'y:min': 'bottom' };

// Returns the two edge points (in world space) of the given wall side at a
// given z — e.g. for 'left', the top-left and bottom-left corners of the
// confinement box at that depth.
function sampleWallEdge(side, z, camera) {
  const bounds = computeDynamicBounds(z);
  if (side === 'left' || side === 'right') {
    const x = side === 'left' ? bounds.x[0] : bounds.x[1];
    return [worldFromPhysics({ x, y: bounds.y[1], z }, camera), worldFromPhysics({ x, y: bounds.y[0], z }, camera)];
  }
  const y = side === 'top' ? bounds.y[1] : bounds.y[0];
  return [worldFromPhysics({ x: bounds.x[1], y, z }, camera), worldFromPhysics({ x: bounds.x[0], y, z }, camera)];
}

// Two rails (continuous lines tracing each edge from near to far — the
// converging lines that read as "receding into the distance") plus several
// rungs (cross-sections at fixed depths, like the ribs of a funnel).
function buildWallWireframe(side, camera) {
  const [zMin, zMax] = BASE_BOUNDS.z;
  const verts = [];
  let prev = null;
  for (let i = 0; i <= WALL_RAIL_SEGMENTS; i++) {
    const z = zMin + ((zMax - zMin) * i) / WALL_RAIL_SEGMENTS;
    const [a, b] = sampleWallEdge(side, z, camera);
    if (prev) {
      verts.push(...prev[0], ...a);
      verts.push(...prev[1], ...b);
    }
    prev = [a, b];
  }
  for (let i = 0; i <= WALL_RUNG_COUNT; i++) {
    const z = zMin + ((zMax - zMin) * i) / WALL_RUNG_COUNT;
    const [a, b] = sampleWallEdge(side, z, camera);
    verts.push(...a, ...b);
  }
  return new Float32Array(verts);
}

// flashRef: mutable { left, right, top, bottom } 0..1 decay values, bumped
// to 1 by RoamingScene on a matching collision and decayed here every
// frame — avoids per-hit React state since the walls themselves are static,
// persistent meshes that only need their material opacity animated.
function BoundaryWalls({ flashRef }) {
  const { camera } = useThree();
  // Computed once at mount from the camera's current aspect — a resize
  // would leave this very slightly out of sync with the real bounds, an
  // acceptable approximation for a decorative boundary visualization.
  const geometries = useMemo(() => Object.fromEntries(WALL_SIDES.map((side) => [side, buildWallWireframe(side, camera)])), []); // eslint-disable-line react-hooks/exhaustive-deps
  const materialRefs = useRef({});

  useFrame((_, delta) => {
    const flash = flashRef.current;
    for (const side of WALL_SIDES) {
      flash[side] = Math.max(0, flash[side] - delta / WALL_FLASH_DECAY);
      const mat = materialRefs.current[side];
      if (mat) mat.opacity = WALL_AMBIENT_OPACITY + flash[side] * (WALL_FLASH_PEAK_OPACITY - WALL_AMBIENT_OPACITY);
    }
  });

  return (
    <>
      {WALL_SIDES.map((side) => (
        <lineSegments key={side}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[geometries[side], 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={(m) => (materialRefs.current[side] = m)}
            color={WALL_COLOR}
            transparent
            opacity={WALL_AMBIENT_OPACITY}
            toneMapped={false}
            depthWrite={false}
          />
        </lineSegments>
      ))}
    </>
  );
}

const RoamingScene = forwardRef(function RoamingScene(_props, ref) {
  const physicsRef = useRef(new RobotPhysics());
  const groupRef = useRef();
  const gunTipRef = useRef();
  const beamRef = useRef();
  const avoidanceRef = useKeycapAvoidance();
  const [robotState, setRobotState] = useState('idle');
  const [wallHitEffects, setWallHitEffects] = useState([]);
  const hitIdRef = useRef(0);
  const wallFlashRef = useRef({ left: 0, right: 0, top: 0, bottom: 0 });
  const lastPhaseRef = useRef('roaming');
  const fireCallbackRef = useRef(null);
  const fireTargetNDCRef = useRef({ x: 0, y: 0 });
  const startVecRef = useRef(new Vector3());
  const endVecRef = useRef(new Vector3());
  const dirVecRef = useRef(new Vector3());
  const { camera, size } = useThree();

  useEffect(() => {
    applyEyeLevelShift(camera, size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size.width, size.height]);

  useImperativeHandle(ref, () => ({
    fireLaserAt(px, py, onHit) {
      fireCallbackRef.current = onHit;
      fireTargetNDCRef.current = pixelToNDC(px, py);
      physicsRef.current.fireAt(fireTargetNDCRef.current);
    },
  }));

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05); // guards against a huge first-frame delta
    const keycaps = (avoidanceRef?.current || []).filter(Boolean);
    const hit = physicsRef.current.update(delta, keycaps);
    if (hit?.hit) {
      fireCallbackRef.current?.();
      fireCallbackRef.current = null;
    }

    const wallHits = physicsRef.current.wallCollisionEvents;
    if (wallHits.length) {
      for (const wallHit of wallHits) {
        const side = WALL_SIDE_BY_HIT[`${wallHit.axis}:${wallHit.direction}`];
        if (side) wallFlashRef.current[side] = 1;
      }
      setWallHitEffects((prev) => {
        const additions = wallHits.map((wallHit) => ({
          id: hitIdRef.current++,
          position: worldFromPhysics(wallHit.pos, state.camera),
        }));
        const next = [...prev, ...additions];
        return next.length > MAX_WALL_HIT_EFFECTS ? next.slice(next.length - MAX_WALL_HIT_EFFECTS) : next;
      });
    }

    const phase = physicsRef.current.state;
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      setRobotState(phase === 'firing' ? 'firing' : phase === 'avoidance' ? 'excited' : 'idle');
    }

    if (groupRef.current) {
      const [x, y, z] = worldFromPhysics(physicsRef.current.pos, state.camera);
      groupRef.current.position.set(x, y, z);
    }

    if (!beamRef.current) return;

    if (phase !== 'firing' || !gunTipRef.current) {
      beamRef.current.visible = false;
      return;
    }

    const { fireTimer, fireDuration, fireHitAt } = physicsRef.current;
    const visible = fireTimer >= fireHitAt * 0.4;
    beamRef.current.visible = visible;
    if (!visible) return;

    const start = startVecRef.current;
    const end = endVecRef.current;
    gunTipRef.current.getWorldPosition(start);
    const endNDC = fireTargetNDCRef.current;
    const [ex, ey, ez] = worldFromPhysics({ x: endNDC.x, y: endNDC.y, z: BEAM_END_Z }, state.camera);
    end.set(ex, ey, ez);

    const dir = dirVecRef.current.subVectors(end, start);
    const length = dir.length() || 0.001;
    dir.normalize();

    beamRef.current.position.copy(start).add(end).multiplyScalar(0.5);
    beamRef.current.quaternion.setFromUnitVectors(UP_AXIS, dir);
    beamRef.current.scale.set(1, length, 1);

    const fadeStart = fireDuration * 0.6;
    beamRef.current.material.opacity =
      fireTimer > fadeStart ? Math.max(0, 1 - (fireTimer - fadeStart) / (fireDuration - fadeStart)) : 1;
  });

  return (
    <>
      <BoundaryWalls flashRef={wallFlashRef} />
      <group ref={groupRef}>
        <group scale={ROBOT_SCALE}>
          <RobotModel robotState={robotState} gunTipRef={gunTipRef} />
        </group>
      </group>
      <mesh ref={beamRef} visible={false}>
        <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={1} toneMapped={false} />
      </mesh>
      {wallHitEffects.map((effect) => (
        <WallCollisionEffect
          key={effect.id}
          position={effect.position}
          onExpire={() => setWallHitEffects((prev) => prev.filter((w) => w.id !== effect.id))}
        />
      ))}
    </>
  );
});

// Persistent, full-viewport, click-through 3D layer: the robot roams the
// current page (dodging the Home page's keycaps) and, on command, aims and
// fires a laser at a given screen point — used to make the chat button open
// only once the robot's shot actually lands (see App.jsx / ChatButton.jsx's
// data-chat-launcher attribute).
const RoamingRobot = forwardRef(function RoamingRobot(_, ref) {
  const sceneRef = useRef(null);
  const [skip] = useState(
    () => window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useImperativeHandle(ref, () => ({
    fireLaserAt(px, py, onHit) {
      if (skip || !sceneRef.current) {
        onHit?.();
        return;
      }
      sceneRef.current.fireLaserAt(px, py, onHit);
    },
  }));

  if (skip) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: BEHIND_LAYER_Z }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: CAMERA_FOV, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent', pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 6, 4]} intensity={1.1} />
        <pointLight position={[-3, -2, -3]} color="#FF6B00" intensity={0.25} />
        <RoamingScene ref={sceneRef} />
      </Canvas>
    </div>
  );
});

export default RoamingRobot;
