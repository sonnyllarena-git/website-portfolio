import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { waypointX } from './waypoints';

export default function CameraRig({ pageIndex, reduced, onArrive }) {
  const { camera } = useThree();
  const isFirst = useRef(true);

  useEffect(() => {
    const targetX = waypointX(pageIndex);

    if (reduced || isFirst.current) {
      camera.position.set(targetX, 0, 9);
      isFirst.current = false;
      onArrive();
      return undefined;
    }

    const tween = gsap.to(camera.position, {
      x: targetX,
      duration: 1.4,
      ease: 'power3.inOut',
      onComplete: onArrive,
    });

    return () => tween.kill();
  }, [pageIndex, camera, reduced, onArrive]);

  return null;
}
