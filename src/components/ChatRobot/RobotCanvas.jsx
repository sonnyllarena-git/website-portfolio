import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import RobotModel from './RobotModel';

// variant 'full': whole-body mascot standing on the chat button.
// variant 'face': tight head-only crop used as the chat header avatar.
export default function RobotCanvas({ robotState = 'idle', cursorPosition = null, variant = 'full' }) {
  const isFace = variant === 'face';

  return (
    <Canvas
      camera={isFace ? { position: [0, 0, 1.9], fov: 32 } : { position: [0, 0.15, 4.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[-3, -2, -3]} color="#FF6B00" intensity={0.3} />

      {!isFace && (
        <ContactShadows position={[0, -1.55, 0]} opacity={0.35} blur={2.2} scale={4} far={2} />
      )}

      <group position={isFace ? [0, -1.05, 0] : [0, -0.3, 0]} scale={isFace ? 1.3 : 0.82}>
        <RobotModel robotState={robotState} cursorPosition={cursorPosition} />
      </group>
    </Canvas>
  );
}
