import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import RobotModel from '../ChatRobot/RobotModel';
import RobotPhysics from './RobotPhysics';
import { useKeycapAvoidance } from '../../context/KeycapAvoidanceContext';

const CAMERA_FOV = 50;
const ROBOT_SCALE = 0.28;
const BEAM_END_Z = 1.4; // near the "screen surface" so the beam reads as hitting the button
const UP_AXIS = new Vector3(0, 1, 0);

// The scene is one flat canvas layer, so "passing behind" the page content
// is a binary z-index swap rather than true per-pixel depth sorting. The two
// layers straddle <main>'s z-20 (see App.jsx); Navbar/Footer/Chat stay above
// both at z-30/z-50 regardless. Enter/exit thresholds are offset (rather than
// a single focal plane) so noise-driven jitter near the boundary can't flap
// the layer back and forth every frame.
const FRONT_LAYER_Z = 25;
const BEHIND_LAYER_Z = 15;
const FOCAL_ENTER_FRONT_Z = 6.5; // closer than this -> in front of content
const FOCAL_EXIT_FRONT_Z = 8.0; // farther than this -> behind content

// pos.z is the model's real distance from a camera at the origin, so the
// PerspectiveCamera's own projection gives correct "far = small" perspective
// — no manual screen-space math needed like a 2D-canvas approach would.
function worldFromPhysics(pos, camera) {
  const vFov = (camera.fov * Math.PI) / 180;
  const halfHeight = Math.tan(vFov / 2) * pos.z;
  const halfWidth = halfHeight * camera.aspect;
  return [pos.x * halfWidth, pos.y * halfHeight, -pos.z];
}

function pixelToNDC(px, py) {
  return {
    x: (px / window.innerWidth) * 2 - 1,
    y: -(py / window.innerHeight) * 2 + 1,
  };
}

const RoamingScene = forwardRef(function RoamingScene({ layerRef }, ref) {
  const physicsRef = useRef(new RobotPhysics());
  const groupRef = useRef();
  const gunTipRef = useRef();
  const beamRef = useRef();
  const avoidanceRef = useKeycapAvoidance();
  const [robotState, setRobotState] = useState('idle');
  const lastPhaseRef = useRef('roaming');
  const depthLayerRef = useRef('behind');
  const fireCallbackRef = useRef(null);
  const fireTargetNDCRef = useRef({ x: 0, y: 0 });
  const startVecRef = useRef(new Vector3());
  const endVecRef = useRef(new Vector3());
  const dirVecRef = useRef(new Vector3());

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

    const phase = physicsRef.current.state;
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      setRobotState(phase === 'firing' ? 'firing' : phase === 'avoidance' ? 'excited' : 'idle');
    }

    if (groupRef.current) {
      const [x, y, z] = worldFromPhysics(physicsRef.current.pos, state.camera);
      groupRef.current.position.set(x, y, z);
    }

    if (layerRef?.current) {
      const depthZ = physicsRef.current.pos.z;
      if (depthLayerRef.current === 'behind' && depthZ < FOCAL_ENTER_FRONT_Z) {
        depthLayerRef.current = 'front';
        layerRef.current.style.zIndex = FRONT_LAYER_Z;
      } else if (depthLayerRef.current === 'front' && depthZ > FOCAL_EXIT_FRONT_Z) {
        depthLayerRef.current = 'behind';
        layerRef.current.style.zIndex = BEHIND_LAYER_Z;
      }
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
      <group ref={groupRef}>
        <group scale={ROBOT_SCALE}>
          <RobotModel robotState={robotState} gunTipRef={gunTipRef} />
        </group>
      </group>
      <mesh ref={beamRef} visible={false}>
        <cylinderGeometry args={[0.018, 0.018, 1, 6]} />
        <meshBasicMaterial color="#00FFFF" transparent opacity={1} toneMapped={false} />
      </mesh>
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
  const layerRef = useRef(null);
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
      ref={layerRef}
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
        <RoamingScene ref={sceneRef} layerRef={layerRef} />
      </Canvas>
    </div>
  );
});

export default RoamingRobot;
