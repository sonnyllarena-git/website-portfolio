import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 55;

const VERTEX_SHADER = `
  uniform float uTime;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;
  varying float vTwinkle;

  void main() {
    float pulse = sin(uTime * aSpeed + aPhase) * 0.5 + 0.5;
    vTwinkle = pow(pulse, 5.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (0.85 + vTwinkle * 0.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying float vTwinkle;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    float alpha = smoothstep(0.5, 0.0, dist) * (0.35 + vTwinkle * 0.65);
    vec3 color = vec3(0.62, 0.34, 0.98);
    gl_FragColor = vec4(color, alpha);
  }
`;

function buildGlitterGeometry() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  const phases = new Float32Array(COUNT);
  const speeds = new Float32Array(COUNT);
  const sizes = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.4 + Math.random() * 1.4;
    sizes[i] = 1.6 + Math.random() * 1.6;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  return geometry;
}

export default function Glitter() {
  const pointsRef = useRef(null);
  const uniforms = useRef({ uTime: { value: 0 } });
  const geometry = useMemo(buildGlitterGeometry, []);

  useFrame(({ camera, clock }) => {
    if (pointsRef.current) {
      pointsRef.current.position.x = camera.position.x;
    }
    uniforms.current.uTime.value = clock.elapsedTime;
  });

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0, -5]}>
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
