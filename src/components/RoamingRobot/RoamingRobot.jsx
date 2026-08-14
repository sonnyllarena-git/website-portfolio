import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import { Vector3 } from 'three';
import RobotModel from '../ChatRobot/RobotModel';
import RobotPhysics from './RobotPhysics';
import { useKeycapAvoidance } from '../../context/KeycapAvoidanceContext';
import { useRobotPosition } from '../../context/RobotPositionContext';
import { WallCollisionEffect } from '../effects/WallCollisionEffect';
import { useSceneArena } from '../../utils/sceneBounds';

const CAMERA_FOV = 50;
const ROBOT_SCALE = 0.28;
const BEAM_END_Z = 1.4; // near the "screen surface" so the shot reads as hitting the button
const UP_AXIS = new Vector3(0, 1, 0);
const BULLET_LAUNCH_FRACTION = 0.4; // fraction of fireHitAt spent on recoil/aim before the bullet leaves the barrel
const BULLET_RADIUS = 0.055;
const BULLET_TRAIL_LENGTH = 0.35; // world units — length of the tracer streak behind the bullet

// The robot's layer always renders behind <main> (z-20 in App.jsx), on every
// page — page content stays the front-most layer everywhere; Navbar/Footer/
// Chat stay above both regardless.
const BEHIND_LAYER_Z = 15;

// Confines the robot's vertical wander range to the bottom band of the
// content area (where the keycaps settle on the floor) instead of the full
// navbar-to-footer height, so it visibly roams alongside them in the
// foreground rather than wandering up near the page's headline text.
const FLOOR_BAND_FRACTION = 0.32;

// pos.z is the model's real distance from a camera at the origin, so the
// PerspectiveCamera's own projection gives correct "far = small" perspective
// — no manual screen-space math needed like a 2D-canvas approach would.
function worldFromPhysics(pos, camera) {
  const vFov = (CAMERA_FOV * Math.PI) / 180;
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

const RoamingScene = forwardRef(function RoamingScene(_props, ref) {
  const physicsRef = useRef(new RobotPhysics());
  const groupRef = useRef();
  const gunTipRef = useRef();
  const bulletRef = useRef();
  const bulletTrailRef = useRef();
  const avoidanceRef = useKeycapAvoidance();
  const [robotState, setRobotState] = useState('idle');
  const [bulletImpacts, setBulletImpacts] = useState([]);
  const [chatMessage, setChatMessage] = useState(null);
  const [chatMessageId, setChatMessageId] = useState(0);
  const hitIdRef = useRef(0);
  const lastPhaseRef = useRef('roaming');
  const lastChatMessageIdRef = useRef(0);
  const facingAngleRef = useRef(0);
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

  // Recomputes the roaming box from the real navbar/footer screen edges,
  // restricted to the bottom FLOOR_BAND_FRACTION of that range so the robot
  // shares the same foreground band the keycaps settle in.
  useEffect(() => {
    const floorBandTop = arena.bottom - (arena.bottom - arena.top) * FLOOR_BAND_FRACTION;
    const boundsX = [pixelToNDC(arena.left, 0).x, pixelToNDC(arena.right, 0).x];
    const boundsY = [pixelToNDC(0, arena.bottom).y, pixelToNDC(0, floorBandTop).y];
    physicsRef.current.updateBounds(boundsX, boundsY);
  }, [arena]);

  useImperativeHandle(ref, () => ({
    fireLaserAt(px, py, onHit) {
      fireCallbackRef.current = onHit;
      fireTargetNDCRef.current = pixelToNDC(px, py);
      physicsRef.current.fireAt(fireTargetNDCRef.current);
    },
    showMessage(text) {
      physicsRef.current.setMessage(text);
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

    const phase = physicsRef.current.state;
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      setRobotState(phase === 'firing' ? 'firing' : phase === 'avoidance' ? 'excited' : 'idle');
    }

    facingAngleRef.current = physicsRef.current.facingAngle;

    const liveChatMessageId = physicsRef.current.chatMessageId;
    if (liveChatMessageId !== lastChatMessageIdRef.current) {
      lastChatMessageIdRef.current = liveChatMessageId;
      setChatMessage(physicsRef.current.chatMessage);
      setChatMessageId(liveChatMessageId);
    }

    if (groupRef.current) {
      const [x, y, z] = worldFromPhysics(physicsRef.current.pos, state.camera);
      groupRef.current.position.set(x, y, z);

      // Publishes the robot's real, camera-projected screen NDC so
      // RobotProxyBody — inside the keycap jar's own, differently-projected
      // camera — can track where the robot actually is on screen.
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
      <group ref={groupRef}>
        <group scale={ROBOT_SCALE}>
          <RobotModel robotState={robotState} gunTipRef={gunTipRef} facingAngleRef={facingAngleRef} />
          {chatMessage && (
            <Html position={[0, 2.2, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="relative -translate-y-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={chatMessageId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="w-max max-w-[280px] whitespace-normal break-words rounded-md bg-[#2a2a2a] px-3.5 py-1.5 text-left text-sm leading-[1.4] text-white shadow-lg"
                  >
                    {chatMessage}
                  </motion.div>
                </AnimatePresence>
                <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#2a2a2a]" />
              </div>
            </Html>
          )}
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
// current page (dodging the keycaps) and, on command, aims and fires a
// bullet at a given screen point — used to make the chat button open only
// once the bullet actually lands (see App.jsx / ChatButton.jsx's
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
    showMessage(text) {
      sceneRef.current?.showMessage(text);
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
        <pointLight position={[-3, -2, -3]} color="#FF4D4D" intensity={0.25} />
        <RoamingScene ref={sceneRef} />
      </Canvas>
    </div>
  );
});

export default RoamingRobot;
