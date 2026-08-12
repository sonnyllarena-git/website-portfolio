import React, { useRef, useState, useContext, createContext } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, Decal } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';
import { useIconTexture } from '../hooks/useIconTexture';

// Shared with KeyPhysicsOverlay's particle-text canvas: a mutable ref (not
// React state) so 60fps hover-position updates skip React's render cycle.
export const KeycapHoverContext = createContext(null);

const KeyCap = ({ position, rotation, item }) => {
  const rigidBodyRef = useRef();
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const texture = useIconTexture(item.icon);
  const hoverRef = useContext(KeycapHoverContext);
  const { camera, size } = useThree();

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    rigidBodyRef.current?.wakeUp();
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !rigidBodyRef.current) return;
    const { point } = e;
    const currentPos = rigidBodyRef.current.translation();
    rigidBodyRef.current.setLinvel({
      x: (point.x - currentPos.x) * 18,
      y: (point.y - currentPos.y) * 18,
      z: 0,
    }, true);
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
