import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Sphere, Torus, Capsule } from '@react-three/drei';
import * as THREE from 'three';

const JUMP_DURATION = 0.6;

// robotState: 'idle' | 'excited' | 'jumping' | 'peering' | 'sad'
const RobotModel = ({ robotState = 'idle', cursorPosition = null }) => {
  const rootRef = useRef();
  const headRef = useRef();
  const bodyRef = useRef();
  const armLeftRef = useRef();
  const armRightRef = useRef();
  const legLeftRef = useRef();
  const legRightRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const antennaRef = useRef();

  // Kept in a ref (not state) so per-frame updates skip React's render cycle.
  const clockRef = useRef({
    time: 0,
    blinkTimer: 0,
    nextBlinkAt: 2.5 + Math.random() * 1.5,
    lastState: robotState,
    stateTime: 0,
  });

  useFrame((_, delta) => {
    const clock = clockRef.current;
    clock.time += delta;
    clock.blinkTimer += delta;

    if (robotState !== clock.lastState) {
      clock.lastState = robotState;
      clock.stateTime = 0;
    } else {
      clock.stateTime += delta;
    }

    const t = clock.time;
    const st = clock.stateTime;

    // Blink is independent of robotState — a robot keeps blinking no matter its mood.
    if (clock.blinkTimer > clock.nextBlinkAt) {
      // Clamped so a large one-off delta (e.g. the canvas's first frame) can't
      // push progress past 1 and make THREE.MathUtils.lerp extrapolate the
      // eye's scale into a giant stretched sliver instead of a quick blink.
      const blinkProgress = Math.min((clock.blinkTimer - clock.nextBlinkAt) / 0.15, 1);
      const blinkScale =
        blinkProgress < 0.5
          ? THREE.MathUtils.lerp(1, 0.05, blinkProgress * 2)
          : THREE.MathUtils.lerp(0.05, 1, (blinkProgress - 0.5) * 2);

      if (eyeLeftRef.current) eyeLeftRef.current.scale.y = blinkScale;
      if (eyeRightRef.current) eyeRightRef.current.scale.y = blinkScale;

      if (blinkProgress >= 1) {
        clock.blinkTimer = 0;
        clock.nextBlinkAt = 2.5 + Math.random() * 1.5;
      }
    } else {
      // Outside the blink window the eyes must always be at rest scale —
      // otherwise a stray bad value from the branch above would persist forever.
      if (eyeLeftRef.current) eyeLeftRef.current.scale.y = 1;
      if (eyeRightRef.current) eyeRightRef.current.scale.y = 1;
    }

    // Breathing runs underneath every state.
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.025;
      bodyRef.current.scale.x = 1 - Math.sin(t * 1.5) * 0.01;
    }
    if (antennaRef.current) {
      antennaRef.current.rotation.z = Math.sin(t * 2.5) * 0.12;
    }

    switch (robotState) {
      case 'excited': {
        if (rootRef.current) {
          rootRef.current.position.y = Math.sin(t * 4) * 0.12;
          rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, 0, 6, delta);
        }
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(t * 3) * 0.15;
          headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, 0, 6, delta);
          headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, 0, 6, delta);
        }
        if (legLeftRef.current && legRightRef.current) {
          legLeftRef.current.rotation.x = Math.sin(t * 3) * 0.2;
          legRightRef.current.rotation.x = Math.sin(t * 3 + Math.PI) * 0.2;
        }
        if (armLeftRef.current && armRightRef.current) {
          armLeftRef.current.rotation.z = -0.3 + Math.sin(t * 3) * 0.15;
          armRightRef.current.rotation.z = 0.3 - Math.sin(t * 3) * 0.15;
        }
        break;
      }

      case 'jumping': {
        const progress = Math.min(st / JUMP_DURATION, 1);
        if (rootRef.current) {
          rootRef.current.position.y = Math.sin(progress * Math.PI) * 0.45;
          rootRef.current.rotation.y += delta * 6;
          rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, 0, 6, delta);
        }
        if (headRef.current) {
          headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, 0, 6, delta);
          headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, 0, 6, delta);
          headRef.current.rotation.z = THREE.MathUtils.damp(headRef.current.rotation.z, 0, 6, delta);
        }
        if (armLeftRef.current && armRightRef.current) {
          armLeftRef.current.rotation.z = THREE.MathUtils.damp(armLeftRef.current.rotation.z, -1.1, 8, delta);
          armRightRef.current.rotation.z = THREE.MathUtils.damp(armRightRef.current.rotation.z, 1.1, 8, delta);
        }
        if (legLeftRef.current && legRightRef.current) {
          legLeftRef.current.rotation.x = THREE.MathUtils.damp(legLeftRef.current.rotation.x, 0.3, 8, delta);
          legRightRef.current.rotation.x = THREE.MathUtils.damp(legRightRef.current.rotation.x, -0.3, 8, delta);
        }
        break;
      }

      case 'peering': {
        if (rootRef.current) {
          rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, 0, 6, delta);
          rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, 0.3, 5, delta);
          rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, 0, 5, delta);
        }
        if (headRef.current) {
          headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, -0.1, 5, delta);
          headRef.current.rotation.y = Math.sin(t * 0.6) * 0.1;
          headRef.current.rotation.z = Math.sin(t * 1.2) * 0.04;
        }
        if (armLeftRef.current && armRightRef.current) {
          armLeftRef.current.rotation.z = THREE.MathUtils.damp(armLeftRef.current.rotation.z, -0.6, 5, delta);
          armRightRef.current.rotation.z = THREE.MathUtils.damp(armRightRef.current.rotation.z, 0.6, 5, delta);
        }
        break;
      }

      case 'sad': {
        if (rootRef.current) {
          rootRef.current.position.y = THREE.MathUtils.damp(rootRef.current.position.y, -0.08, 5, delta);
          rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, 0, 5, delta);
          rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, 0, 5, delta);
        }
        if (headRef.current) {
          headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, 0.35, 5, delta);
          headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, 0, 5, delta);
          headRef.current.rotation.z = Math.sin(t * 1.5) * 0.03;
        }
        if (armLeftRef.current && armRightRef.current) {
          armLeftRef.current.rotation.z = THREE.MathUtils.damp(armLeftRef.current.rotation.z, -0.05, 5, delta);
          armRightRef.current.rotation.z = THREE.MathUtils.damp(armRightRef.current.rotation.z, 0.05, 5, delta);
        }
        if (legLeftRef.current && legRightRef.current) {
          legLeftRef.current.rotation.x = THREE.MathUtils.damp(legLeftRef.current.rotation.x, 0, 5, delta);
          legRightRef.current.rotation.x = THREE.MathUtils.damp(legRightRef.current.rotation.x, 0, 5, delta);
        }
        break;
      }

      case 'idle':
      default: {
        if (rootRef.current) {
          rootRef.current.position.y = Math.sin(t * 1.8) * 0.05;
          rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, 0, 6, delta);
          rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, 0, 6, delta);
        }
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(t * 0.8) * 0.06;
          if (cursorPosition) {
            const targetX = THREE.MathUtils.clamp(cursorPosition.x * 0.3, -0.3, 0.3);
            const targetY = THREE.MathUtils.clamp(cursorPosition.y * 0.2, -0.2, 0.2);
            headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, targetX, 4, delta);
            headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, -targetY, 4, delta);
          } else {
            headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, 0, 4, delta);
            headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, 0, 4, delta);
          }
        }
        if (legLeftRef.current && legRightRef.current) {
          legLeftRef.current.rotation.x = Math.sin(t * 1.2) * 0.15;
          legRightRef.current.rotation.x = Math.sin(t * 1.2 + Math.PI) * 0.15;
        }
        if (armLeftRef.current && armRightRef.current) {
          armLeftRef.current.rotation.z = -0.3 + Math.sin(t * 1.0) * 0.08;
          armRightRef.current.rotation.z = 0.3 - Math.sin(t * 1.0) * 0.08;
        }
        break;
      }
    }
  });

  return (
    <group ref={rootRef}>
      {/* ── HEAD GROUP ── */}
      <group ref={headRef} position={[0, 1.05, 0]}>
        <RoundedBox args={[1.2, 1.0, 1.0]} radius={0.15} smoothness={6}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.45} metalness={0.05} />
        </RoundedBox>

        <RoundedBox args={[0.85, 0.52, 0.06]} radius={0.08} smoothness={4} position={[0, 0, 0.52]}>
          <meshPhysicalMaterial
            color="#001515"
            emissive="#002222"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.3}
          />
        </RoundedBox>

        <group ref={eyeLeftRef} position={[-0.22, 0.06, 0.56]}>
          <Sphere args={[0.11, 16, 16]}>
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1.8} />
          </Sphere>
        </group>

        <group ref={eyeRightRef} position={[0.22, 0.06, 0.56]}>
          <Sphere args={[0.11, 16, 16]}>
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1.8} />
          </Sphere>
        </group>

        <Torus args={[0.17, 0.025, 8, 16, Math.PI]} position={[0, -0.15, 0.56]} rotation={[0, 0, Math.PI]}>
          <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1.5} />
        </Torus>

        <group ref={antennaRef} position={[0, 0.55, 0]}>
          <mesh>
            <cylinderGeometry args={[0.025, 0.025, 0.45, 8]} />
            <meshStandardMaterial color="#1A1A1A" />
          </mesh>
          <Sphere args={[0.08, 12, 12]} position={[0, 0.28, 0]}>
            <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={0.9} />
          </Sphere>
        </group>
      </group>

      {/* ── BODY ── */}
      <group ref={bodyRef}>
        <RoundedBox args={[1.1, 1.2, 0.9]} radius={0.25} smoothness={6}>
          <meshStandardMaterial color="#FFFFFF" roughness={0.45} metalness={0.05} />
        </RoundedBox>

        <mesh position={[0, 0.05, 0.46]}>
          <boxGeometry args={[0.55, 0.07, 0.05]} />
          <meshStandardMaterial color="#FF6B00" emissive="#FF6B00" emissiveIntensity={0.4} />
        </mesh>

        <mesh position={[0, -0.08, 0.46]}>
          <boxGeometry args={[0.4, 0.03, 0.05]} />
          <meshStandardMaterial color="#1A1A1A" />
        </mesh>
      </group>

      {/* ── ARMS ── */}
      <group ref={armLeftRef} position={[-0.88, 0.12, 0]}>
        <Capsule args={[0.15, 0.5, 8, 16]} rotation={[0, 0, 0.3]}>
          <meshStandardMaterial color="#E8E8E8" roughness={0.5} metalness={0.05} />
        </Capsule>
      </group>

      <group ref={armRightRef} position={[0.88, 0.12, 0]}>
        <Capsule args={[0.15, 0.5, 8, 16]} rotation={[0, 0, -0.3]}>
          <meshStandardMaterial color="#E8E8E8" roughness={0.5} metalness={0.05} />
        </Capsule>
      </group>

      {/* ── LEGS ── */}
      <group ref={legLeftRef} position={[-0.28, -0.72, 0]}>
        <Capsule args={[0.14, 0.32, 8, 16]}>
          <meshStandardMaterial color="#1A1A1A" />
        </Capsule>
      </group>

      <group ref={legRightRef} position={[0.28, -0.72, 0]}>
        <Capsule args={[0.14, 0.32, 8, 16]}>
          <meshStandardMaterial color="#1A1A1A" />
        </Capsule>
      </group>

      <pointLight position={[0, 1.05, 0.8]} color="#00FFFF" intensity={0.4} distance={1.5} />
      <pointLight position={[0, 1.85, 0]} color="#FF6B00" intensity={0.25} distance={1} />
    </group>
  );
};

export default RobotModel;
