import { Canvas } from '@react-three/fiber';
import RobotModel from './RobotModel';

// Tight head-only crop used as the chat header avatar.
export default function RobotCanvas({ robotState = 'idle' }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 1.9], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <pointLight position={[-3, -2, -3]} color="#FF6B00" intensity={0.3} />

      <group position={[0, -1.05, 0]} scale={1.3}>
        <RobotModel robotState={robotState} />
      </group>
    </Canvas>
  );
}
