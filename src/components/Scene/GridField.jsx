import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

const VERTEX_SHADER = `
  uniform vec3 uPointer;
  uniform float uTime;
  uniform float uHoverStrength;
  uniform float uSpeedBoost;
  uniform float uSquish;
  varying float vGlow;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    float distToPointer = distance(position, uPointer);

    // Ambient hologram flicker/wobble — always active, independent of the cursor.
    vec3 flow = position * 0.22 + vec3(0.0, 0.0, uTime * 0.12);
    float wobble = snoise(flow) * 0.85 + snoise(flow * 1.9 + 11.3) * 0.35;

    // Jelly touch response: the surface presses inward right at the cursor
    // (uSquish is a spring value that overshoots/jiggles on release, not a
    // plain fade) with a ring of fluid ripple spreading outward from it.
    float squishFalloff = smoothstep(3.2, 0.0, distToPointer);
    float indent = -squishFalloff * uSquish * 0.85;
    float jiggle = sin(distToPointer * 6.0 - uTime * 9.0) * squishFalloff * uSquish * (0.16 + uSpeedBoost * 0.25);

    vec3 dir = normalize(position + 0.0001);
    vec3 squished = position + dir * (wobble * 0.32 + indent + jiggle);

    float glowRadius = 4.2;
    vGlow = smoothstep(glowRadius, 0.0, distToPointer) * uHoverStrength;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(squished, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uOpacity;
  varying float vGlow;

  void main() {
    vec3 basePurple = vec3(0.32, 0.13, 0.6);
    vec3 hotColor = vec3(0.95, 0.35, 0.85);
    // Toned down so the cursor spotlight accentuates the wireframe rather
    // than blowing it out once bloom picks it up.
    vec3 color = mix(basePurple, hotColor, vGlow * 0.65);

    float alpha = (0.12 + vGlow * 0.5) * uOpacity;
    gl_FragColor = vec4(color, alpha);
  }
`;

function buildKnotWireframe() {
  const knot = new THREE.TorusKnotGeometry(3.2, 1.0, 160, 14, 2, 3);
  const noise3D = createNoise3D();
  const posAttr = knot.attributes.position;
  const normalAttr = knot.attributes.normal;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const n = noise3D(x * 0.25, y * 0.25, z * 0.25);

    posAttr.setXYZ(
      i,
      x + normalAttr.getX(i) * n * 0.22,
      y + normalAttr.getY(i) * n * 0.22,
      z + normalAttr.getZ(i) * n * 0.22
    );
  }
  posAttr.needsUpdate = true;
  knot.computeBoundingSphere();

  return new THREE.WireframeGeometry(knot);
}

const NEUTRAL_Z = -3;
const SPRING_STIFFNESS = 120; // how fast the jelly presses in on touch
const SPRING_DAMPING = 6; // low relative to stiffness so it overshoots/jiggles on release
const FAR_POINTER = new THREE.Vector3(9999, 9999, 9999);

export default function GridField() {
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const proxyRef = useRef(null);
  const hoverStrengthRef = useRef(0);
  const pressRef = useRef(0);
  const pressVelocityRef = useRef(0);
  const pointerLocalRef = useRef(FAR_POINTER.clone());
  const raycasterRef = useRef(null);
  if (!raycasterRef.current) raycasterRef.current = new THREE.Raycaster();

  const uniforms = useRef({
    uPointer: { value: FAR_POINTER.clone() },
    uTime: { value: 0 },
    uHoverStrength: { value: 0 },
    uSpeedBoost: { value: 0 },
    uSquish: { value: 0 },
    uOpacity: { value: 0.8 },
  });

  const geometry = useMemo(buildKnotWireframe, []);
  const proxyRadius = geometry.boundingSphere ? geometry.boundingSphere.radius * 1.15 : 5;

  useFrame(({ camera, pointer, clock }, delta) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    const proxy = proxyRef.current;
    if (!group || !mesh || !proxy) return;

    group.position.x = camera.position.x;
    mesh.rotation.y += delta * 0.06;
    mesh.rotation.x = Math.sin(clock.elapsedTime * 0.15) * 0.15;
    group.updateMatrixWorld(true);

    // Raycast directly against an invisible proxy sphere (the wireframe
    // knot's own thin lines are unreliable to hit-test precisely) so the
    // cursor position used below always matches what the pointer is really
    // touching on the hologram.
    raycasterRef.current.setFromCamera(pointer, camera);
    const hit = raycasterRef.current.intersectObject(proxy, false)[0];

    let targetHover = 0;
    let speed = 0;
    if (hit) {
      const localHit = mesh.worldToLocal(hit.point.clone());
      speed = localHit.distanceTo(pointerLocalRef.current) / Math.max(delta, 0.001);
      pointerLocalRef.current.copy(localHit);
      targetHover = 1;
    }

    // Ease in quickly on approach, ease out slowly on leave — a lerp back to
    // the neutral resting state instead of an abrupt cut. This drives the
    // cursor spotlight/glow, kept smooth and separate from the jelly spring
    // below so the lighting never jiggles with the geometry.
    const hoverRate = targetHover > hoverStrengthRef.current ? 0.12 : 0.045;
    hoverStrengthRef.current = THREE.MathUtils.lerp(hoverStrengthRef.current, targetHover, hoverRate);

    // Jelly spring: presses in on touch and overshoots/jiggles back to rest
    // on release, like squishing then letting go of gel, instead of a plain
    // scale up/down.
    const springForce = (targetHover - pressRef.current) * SPRING_STIFFNESS - pressVelocityRef.current * SPRING_DAMPING;
    pressVelocityRef.current += springForce * delta;
    pressRef.current += pressVelocityRef.current * delta;

    const breathe = 1 + Math.sin(clock.elapsedTime * 0.9) * 0.035 + Math.sin(clock.elapsedTime * 1.7) * 0.015;
    mesh.scale.setScalar(breathe);

    uniforms.current.uPointer.value.copy(pointerLocalRef.current);
    uniforms.current.uHoverStrength.value = hoverStrengthRef.current;
    uniforms.current.uSquish.value = pressRef.current;
    uniforms.current.uSpeedBoost.value = THREE.MathUtils.clamp(speed / 12, 0, 1.5);
    uniforms.current.uTime.value = clock.elapsedTime;
  });

  return (
    <group ref={groupRef} position={[0, 0.5, NEUTRAL_Z]}>
      <lineSegments ref={meshRef} geometry={geometry}>
        <shaderMaterial
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms.current}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      {/* Invisible interaction proxy — a stable bounding sphere the raycaster
          can hit precisely, kept separate from the mesh above so its radius
          doesn't wobble with the breathing/hover scale animation. */}
      <mesh ref={proxyRef}>
        <sphereGeometry args={[proxyRadius, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
