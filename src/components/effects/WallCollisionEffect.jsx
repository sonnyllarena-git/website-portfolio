import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// Cyan spark burst shown at the exact point something (the roaming robot, a
// keycap) touches an invisible physics boundary — the "signature" localized
// impact feedback, layered on top of the boundary's own persistent ambient
// wall glow (see BoundaryWalls.jsx / KeyPhysicsOverlay's wall meshes), which
// brightens separately on the same collision. Shared between RoamingRobot
// (NDC-space robot physics) and the keycap jar (Rapier rigid bodies).
export const WALL_HIT_DURATION = 0.5; // seconds — the spark's fade timing
const WALL_HIT_COLOR = '#00FFFF';
const SPARK_ARMS = 8;
const SPARK_ARM_LENGTH = 0.16;

function buildSparkPositions() {
  const verts = [];
  for (let i = 0; i < SPARK_ARMS; i++) {
    const angle = (i / SPARK_ARMS) * Math.PI * 2;
    verts.push(0, 0, 0, Math.cos(angle) * SPARK_ARM_LENGTH, Math.sin(angle) * SPARK_ARM_LENGTH, 0);
  }
  return new Float32Array(verts);
}

// Shared by every instance — the spark shape never changes, only its fade.
const sparkPositions = buildSparkPositions();

// position: [x, y, z] world position of the collision, in the consuming
// scene's own coordinate space.
export function WallCollisionEffect({ position, onExpire }) {
  const ageRef = useRef(0);
  const sparkMaterialRef = useRef();

  useFrame((_, delta) => {
    ageRef.current += delta;
    const progress = ageRef.current / WALL_HIT_DURATION;
    if (progress >= 1) {
      onExpire();
      return;
    }
    if (sparkMaterialRef.current) sparkMaterialRef.current.opacity = 1 - progress;
  });

  return (
    <group position={position}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sparkPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={WALL_HIT_COLOR} transparent opacity={1} toneMapped={false} ref={sparkMaterialRef} />
      </lineSegments>
    </group>
  );
}

export default WallCollisionEffect;
