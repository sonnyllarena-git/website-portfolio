import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import RobotModel from '../ChatRobot/RobotModel';
import RobotPhysics, { computeDynamicBounds } from './RobotPhysics';
import { useKeycapAvoidance } from '../../context/KeycapAvoidanceContext';
import { useRobotPosition } from '../../context/RobotPositionContext';
import { WallCollisionEffect } from '../effects/WallCollisionEffect';
import { EYE_LEVEL_FROM_TOP } from '../../utils/perspective';
import { useSceneArena } from '../../utils/sceneBounds';

const CAMERA_FOV = 50;
const ROBOT_SCALE = 0.28;
const BEAM_END_Z = 1.4; // near the "screen surface" so the shot reads as hitting the button
const UP_AXIS = new Vector3(0, 1, 0);
const MAX_WALL_HIT_EFFECTS = 6; // caps runaway spawns if the robot gets pinned
const BULLET_LAUNCH_FRACTION = 0.4; // fraction of fireHitAt spent on recoil/aim before the bullet leaves the barrel
const BULLET_RADIUS = 0.055;
const BULLET_TRAIL_LENGTH = 0.35; // world units — length of the tracer streak behind the bullet

// The robot's layer always renders behind <main> (z-20 in App.jsx), on every
// page — it used to swap in front of content when close enough, but that
// meant it (and its wall-collision flashes) could land directly on top of
// body text on pages denser than Home, obscuring it. Page content stays the
// front-most layer everywhere; Navbar/Footer/Chat stay above both regardless.
const BEHIND_LAYER_Z = 15;

// applyEyeLevelShift() below crops the taller virtual frame vertically only
// (offsetX is always 0, view width == fullWidth) — so the camera's actual
// horizontal frustum is never cropped back down the way the vertical one is,
// and it scales directly off the INFLATED fov via `aspect`. Concretely: the
// real projection's half-width at depth z works out to
// nominalHalfHeight(z) * aspect * (fullHeight/height), i.e. the nominal
// half-width inflated by the same factor the vertical fov was inflated by.
// EYE_LEVEL_WIDTH_INFLATION reproduces that factor (fullHeight/height
// reduces to this constant, independent of actual pixel dimensions) so a
// target NDC x still round-trips through the real camera to the same value
// — without it, worldFromPhysics under-scales x and every fired shot lands
// short of its horizontal target (confirmed by reprojecting a computed world
// point back through camera.project() and comparing to the intended pixel).
const EYE_LEVEL_WIDTH_INFLATION = 2 * (1 - EYE_LEVEL_FROM_TOP);

// pos.z is the model's real distance from a camera at the origin, so the
// PerspectiveCamera's own projection gives correct "far = small" perspective
// — no manual screen-space math needed like a 2D-canvas approach would.
// Uses the nominal CAMERA_FOV constant for y (matching the cropped output
// frame — see applyEyeLevelShift), scaled by EYE_LEVEL_WIDTH_INFLATION for x
// (which is never cropped, so it tracks the inflated fov instead).
function worldFromPhysics(pos, camera) {
  const vFov = (CAMERA_FOV * Math.PI) / 180;
  const halfHeight = Math.tan(vFov / 2) * pos.z;
  const halfWidth = halfHeight * camera.aspect * EYE_LEVEL_WIDTH_INFLATION;
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
// taller virtual frame — worldFromPhysics/sampleWallEdge account for that by
// using the nominal CAMERA_FOV for y (the true output FOV once this
// off-center slice is taken) and EYE_LEVEL_WIDTH_INFLATION for x (which is
// never cropped, so it stays tied to the inflated fov — see that constant's
// comment above).
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
// confinement box at that depth. `bounds` is the live roaming bounds (see
// RobotPhysics.updateBounds) — passed explicitly rather than defaulted so
// the drawn wireframe can never silently drift from the bounds actually
// enforced by the physics sim.
function sampleWallEdge(side, z, camera, bounds) {
  const dynamicBounds = computeDynamicBounds(z, bounds);
  if (side === 'left' || side === 'right') {
    const x = side === 'left' ? dynamicBounds.x[0] : dynamicBounds.x[1];
    return [
      worldFromPhysics({ x, y: dynamicBounds.y[1], z }, camera),
      worldFromPhysics({ x, y: dynamicBounds.y[0], z }, camera),
    ];
  }
  const y = side === 'top' ? dynamicBounds.y[1] : dynamicBounds.y[0];
  return [
    worldFromPhysics({ x: dynamicBounds.x[1], y, z }, camera),
    worldFromPhysics({ x: dynamicBounds.x[0], y, z }, camera),
  ];
}

// Two rails (continuous lines tracing each edge from near to far — the
// converging lines that read as "receding into the distance") plus several
// rungs (cross-sections at fixed depths, like the ribs of a funnel).
function buildWallWireframe(side, camera, bounds) {
  const [zMin, zMax] = bounds.z;
  const verts = [];
  let prev = null;
  for (let i = 0; i <= WALL_RAIL_SEGMENTS; i++) {
    const z = zMin + ((zMax - zMin) * i) / WALL_RAIL_SEGMENTS;
    const [a, b] = sampleWallEdge(side, z, camera, bounds);
    if (prev) {
      verts.push(...prev[0], ...a);
      verts.push(...prev[1], ...b);
    }
    prev = [a, b];
  }
  for (let i = 0; i <= WALL_RUNG_COUNT; i++) {
    const z = zMin + ((zMax - zMin) * i) / WALL_RUNG_COUNT;
    const [a, b] = sampleWallEdge(side, z, camera, bounds);
    verts.push(...a, ...b);
  }
  return new Float32Array(verts);
}

// flashRef: mutable { left, right, top, bottom } 0..1 decay values, bumped
// to 1 by RoamingScene on a matching collision and decayed here every
// frame — avoids per-hit React state since the walls themselves are static,
// persistent meshes that only need their material opacity animated.
function BoundaryWalls({ flashRef, bounds }) {
  const { camera } = useThree();
  // Rebuilt whenever the live bounds change (e.g. a window resize recomputes
  // them from the real navbar/footer edges — see RoamingRobot's useSceneArena
  // usage), so the drawn wireframe always matches what's actually enforced.
  const geometries = useMemo(
    () => Object.fromEntries(WALL_SIDES.map((side) => [side, buildWallWireframe(side, camera, bounds)])),
    [camera, bounds]
  );
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
  const bulletRef = useRef();
  const bulletTrailRef = useRef();
  const avoidanceRef = useKeycapAvoidance();
  const [robotState, setRobotState] = useState('idle');
  const [wallHitEffects, setWallHitEffects] = useState([]);
  const [bulletImpacts, setBulletImpacts] = useState([]);
  const hitIdRef = useRef(0);
  const wallFlashRef = useRef({ left: 0, right: 0, top: 0, bottom: 0 });
  const lastPhaseRef = useRef('roaming');
  const fireCallbackRef = useRef(null);
  const fireTargetNDCRef = useRef({ x: 0, y: 0 });
  const startVecRef = useRef(new Vector3());
  const endVecRef = useRef(new Vector3());
  const dirVecRef = useRef(new Vector3());
  const bulletPosVecRef = useRef(new Vector3());
  const trailMidVecRef = useRef(new Vector3());
  const projectedPosVecRef = useRef(new Vector3());
  const robotPositionRef = useRobotPosition();
  const arena = useSceneArena();
  const [robotBounds, setRobotBounds] = useState(() => physicsRef.current.bounds);
  const { camera, size } = useThree();

  useEffect(() => {
    applyEyeLevelShift(camera, size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size.width, size.height]);

  // Recomputes the roaming box from the real navbar/footer screen edges
  // (see App.jsx for those elements) whenever the arena changes — replaces
  // the old hand-tuned BASE_BOUNDS.y approximation with an exact one, and
  // widens x to (nearly) the full viewport width, per the shared "framewire"
  // both this box and the keycap jar's walls (ScreenJar.jsx) now derive from.
  useEffect(() => {
    const boundsX = [pixelToNDC(arena.left, 0).x, pixelToNDC(arena.right, 0).x];
    const boundsY = [pixelToNDC(0, arena.bottom).y, pixelToNDC(0, arena.top).y];
    physicsRef.current.updateBounds(boundsX, boundsY);
    setRobotBounds(physicsRef.current.bounds);
  }, [arena]);

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

      const endNDC = fireTargetNDCRef.current;
      const impactPos = worldFromPhysics({ x: endNDC.x, y: endNDC.y, z: BEAM_END_Z }, state.camera);
      setBulletImpacts((prev) => [...prev, { id: hitIdRef.current++, position: impactPos }]);
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

      // Publishes the robot's real, camera-projected screen NDC (not the
      // raw physicsRef.current.pos, which is pre-scaled for THIS camera's
      // eye-level-shift correction and would land wrong through any other
      // camera) so RobotProxyBody — inside the keycap jar's own, differently
      // -projected camera — can track where the robot actually is on screen.
      if (robotPositionRef) {
        projectedPosVecRef.current.copy(groupRef.current.position).project(state.camera);
        robotPositionRef.current.x = projectedPosVecRef.current.x;
        robotPositionRef.current.y = projectedPosVecRef.current.y;
        robotPositionRef.current.active = true;
      }
    }

    if (!bulletRef.current || !bulletTrailRef.current) return;

    if (phase !== 'firing' || !gunTipRef.current) {
      bulletRef.current.visible = false;
      bulletTrailRef.current.visible = false;
      return;
    }

    // The bullet leaves the barrel partway into the fire sequence (letting
    // the recoil/aim pose read first), then travels start→target arriving
    // exactly at fireHitAt — the same instant updateFiring() above reports
    // the hit, so the chat only opens once the bullet visibly lands.
    const { fireTimer, fireHitAt } = physicsRef.current;
    const launchAt = fireHitAt * BULLET_LAUNCH_FRACTION;
    const traveling = fireTimer >= launchAt && fireTimer < fireHitAt;
    bulletRef.current.visible = traveling;
    bulletTrailRef.current.visible = traveling;
    if (!traveling) return;

    const start = startVecRef.current;
    const end = endVecRef.current;
    gunTipRef.current.getWorldPosition(start);
    const endNDC = fireTargetNDCRef.current;
    const [ex, ey, ez] = worldFromPhysics({ x: endNDC.x, y: endNDC.y, z: BEAM_END_Z }, state.camera);
    end.set(ex, ey, ez);

    const dir = dirVecRef.current.subVectors(end, start);
    const totalLength = dir.length() || 0.001;
    dir.normalize();

    const progress = Math.min(Math.max((fireTimer - launchAt) / (fireHitAt - launchAt), 0), 1);
    const traveled = totalLength * progress;
    const bulletPos = bulletPosVecRef.current.copy(start).addScaledVector(dir, traveled);
    bulletRef.current.position.copy(bulletPos);

    const trailLength = Math.min(BULLET_TRAIL_LENGTH, traveled);
    const trailMid = trailMidVecRef.current.copy(bulletPos).addScaledVector(dir, -trailLength / 2);
    bulletTrailRef.current.position.copy(trailMid);
    bulletTrailRef.current.quaternion.setFromUnitVectors(UP_AXIS, dir);
    bulletTrailRef.current.scale.set(1, trailLength, 1);
  });

  return (
    <>
      <BoundaryWalls flashRef={wallFlashRef} bounds={robotBounds} />
      <group ref={groupRef}>
        <group scale={ROBOT_SCALE}>
          <RobotModel robotState={robotState} gunTipRef={gunTipRef} />
        </group>
      </group>
      <mesh ref={bulletRef} visible={false}>
        <sphereGeometry args={[BULLET_RADIUS, 10, 10]} />
        <meshBasicMaterial color="#00FFFF" toneMapped={false} />
      </mesh>
      <mesh ref={bulletTrailRef} visible={false}>
        <cylinderGeometry args={[0.02, 0.002, 1, 6]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={0.5} toneMapped={false} depthWrite={false} />
      </mesh>
      {wallHitEffects.map((effect) => (
        <WallCollisionEffect
          key={effect.id}
          position={effect.position}
          onExpire={() => setWallHitEffects((prev) => prev.filter((w) => w.id !== effect.id))}
        />
      ))}
      {bulletImpacts.map((effect) => (
        <WallCollisionEffect
          key={effect.id}
          position={effect.position}
          onExpire={() => setBulletImpacts((prev) => prev.filter((b) => b.id !== effect.id))}
        />
      ))}
    </>
  );
});

// Persistent, full-viewport, click-through 3D layer: the robot roams the
// current page (dodging the Home page's keycaps) and, on command, aims and
// fires a bullet at a given screen point — used to make the chat button open
// only once the bullet actually lands (see App.jsx / ChatButton.jsx's
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
