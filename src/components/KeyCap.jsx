import React, { useRef, useState, useContext, createContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, Decal } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { Vector3, Plane } from 'three';
import { useIconTexture } from '../hooks/useIconTexture';
import { useKeycapAvoidance } from '../context/KeycapAvoidanceContext';

// Shared with KeyPhysicsOverlay's particle-text canvas: a mutable ref (not
// React state) so 60fps hover-position updates skip React's render cycle.
export const KeycapHoverContext = createContext(null);

// Hard velocity cap — a bad/degenerate drag point one frame must never be
// able to fling a body into a runaway trajectory (positions were observed
// hitting ~1e33 without this, once a single bad frame got integrated).
const MAX_DRAG_SPEED = 40;
const clamp = (v, max) => Math.max(-max, Math.min(max, v));

const KeyCap = ({ position, rotation, item, id, onWallHit }) => {
  const rigidBodyRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const texture = useIconTexture(item.icon);
  const hoverRef = useContext(KeycapHoverContext);
  const avoidanceRef = useKeycapAvoidance();
  const { camera, size, raycaster } = useThree();
  // Reused across the whole drag so we're not allocating every pointermove.
  const dragPlaneRef = useRef(new Plane(new Vector3(0, 0, 1), 0));
  const dragPointRef = useRef(new Vector3());
  const avoidanceVectorRef = useRef(new Vector3());

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    // R3F's pointer-capture events only recompute a hit point while the ray
    // still directly intersects this (small, moving) mesh — the instant it
    // doesn't, the event replays a frozen point from the original grab,
    // which is why dragging used to nudge once then stop tracking the
    // cursor. Dragging on our own fixed depth-plane sidesteps that entirely.
    const pos = rigidBodyRef.current?.translation();
    const z = pos && Number.isFinite(pos.z) ? pos.z : 0;
    dragPlaneRef.current.set(new Vector3(0, 0, 1), -z);
    setIsDragging(true);
    rigidBodyRef.current?.wakeUp();
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const handlePointerMove = () => {
    if (!isDragging || !rigidBodyRef.current) return;
    const hit = raycaster.ray.intersectPlane(dragPlaneRef.current, dragPointRef.current);
    if (!hit || !Number.isFinite(hit.x) || !Number.isFinite(hit.y)) return;
    const currentPos = rigidBodyRef.current.translation();
    rigidBodyRef.current.setLinvel({
      x: clamp((hit.x - currentPos.x) * 18, MAX_DRAG_SPEED),
      y: clamp((hit.y - currentPos.y) * 18, MAX_DRAG_SPEED),
      z: 0,
    }, true);
  };

  // Only the jar's x-axis (left/right) walls carry the electric wall-hit
  // effect — see ScreenJar.jsx for why the floor and z-axis walls are excluded.
  // Left vs right is inferred from which side of the (x=0-centered) jar the
  // keycap was on when it hit — the two wall colliders sit far enough apart
  // (x=-12/+12) that the sign of pos.x is unambiguous.
  const handleCollisionEnter = ({ other }) => {
    if (other.colliderObject?.name !== 'jar-wall-x') return;
    const pos = rigidBodyRef.current?.translation();
    if (!pos) return;
    onWallHit?.({ side: pos.x < 0 ? 'left' : 'right', position: [pos.x, pos.y, pos.z] });
  };

  const handlePointerEnter = () => {
    setHovered(true);
    if (hoverRef) {
      hoverRef.current.id = item.name;
      hoverRef.current.text = item.name;
      hoverRef.current.phase = 'in';
      hoverRef.current.phaseStart = performance.now();
    }
  };

  const handlePointerLeave = () => {
    setHovered(false);
    if (hoverRef && hoverRef.current.id === item.name) {
      hoverRef.current.phase = 'out';
      hoverRef.current.phaseStart = performance.now();
    }
  };

  useFrame(() => {
    if (!hovered || !hoverRef || !rigidBodyRef.current) return;
    const pos = rigidBodyRef.current.translation();
    const vector = new Vector3(pos.x, pos.y + 0.55, pos.z);
    vector.project(camera);
    hoverRef.current.x = (vector.x * 0.5 + 0.5) * size.width;
    hoverRef.current.y = (-(vector.y * 0.5) + 0.5) * size.height;
  });

  // Publishes this keycap's screen-space NDC position every frame so the
  // roaming robot (a separate canvas/camera) can steer away from it. Reuses
  // the raw NDC from this scene's own camera as an approximation of the
  // robot canvas's NDC — close enough for a decorative avoidance behavior
  // without needing the two cameras' projections to match exactly.
  useFrame(() => {
    if (!avoidanceRef || id == null || !rigidBodyRef.current) return;
    const pos = rigidBodyRef.current.translation();
    avoidanceVectorRef.current.set(pos.x, pos.y, pos.z);
    avoidanceVectorRef.current.project(camera);
    avoidanceRef.current[id] = { x: avoidanceVectorRef.current.x, y: avoidanceVectorRef.current.y };
  });

  const textColor = item.color === '#FF6B00' ? '#FFFFFF' : '#FF6B00';

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      rotation={rotation}
      colliders="cuboid"
      restitution={0.65}
      friction={0.3}
      linearDamping={0.5}
      angularDamping={0.5}
      onCollisionEnter={handleCollisionEnter}
    >
      <group
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <RoundedBox args={[0.85, 0.65, 0.85]} radius={0.12} smoothness={6} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={item.color}
            emissive={hovered ? '#ffffff' : '#000000'}
            emissiveIntensity={hovered ? 0.1 : 0}
            roughness={hovered ? 0.08 : 0.15}
            metalness={0.1}
            clearcoat={hovered ? 1.15 : 1.0}
            clearcoatRoughness={hovered ? 0.05 : 0.1}
          />

          {texture && (
            <Decal position={[0, 0.33, -0.06]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.38, 0.38, 0.38]}>
              <meshBasicMaterial
                map={texture}
                polygonOffset
                polygonOffsetFactor={-1}
                transparent
                alphaTest={0.1}
              />
            </Decal>
          )}
        </RoundedBox>

        <Text
          position={[0, 0.34, 0.22]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.1}
          color={textColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={0.75}
        >
          {item.name}
        </Text>

        {hovered && <pointLight position={[0, 1.2, 0]} color="#ffffff" intensity={1.2} distance={1.6} />}
      </group>
    </RigidBody>
  );
};

export default KeyCap;
