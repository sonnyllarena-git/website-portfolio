import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';

const SIZE = 280;

export default function CursorOrb() {
  const { position, isInside } = useMousePosition();
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const springX = useSpring(x, { damping: 22, stiffness: 200, mass: 0.6 });
  const springY = useSpring(y, { damping: 22, stiffness: 200, mass: 0.6 });
  const [hoveringInteractive, setHoveringInteractive] = useState(false);

  useEffect(() => {
    x.set(position.x - SIZE / 2);
    y.set(position.y - SIZE / 2);
  }, [position, x, y]);

  useEffect(() => {
    const handleOver = (e) => {
      setHoveringInteractive(Boolean(e.target.closest('a, button, input, textarea')));
    };
    document.addEventListener('mouseover', handleOver);
    return () => document.removeEventListener('mouseover', handleOver);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 z-40 rounded-full pointer-events-none"
      style={{
        width: SIZE,
        height: SIZE,
        x: springX,
        y: springY,
      }}
      animate={{
        opacity: isInside ? 0.85 : 0,
        scale: hoveringInteractive ? 1.3 : 1,
      }}
      transition={{
        opacity: { duration: 0.3, ease: 'easeInOut' },
        scale: { duration: 0.3, ease: 'easeInOut' },
      }}
    >
      <div
        className="cursor-aura-pulse absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(168,85,247,0.30) 0%, rgba(168,85,247,0.16) 45%, rgba(168,85,247,0) 75%)',
          filter: 'blur(6px)',
        }}
      />
      <div className="cursor-hotspot absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </motion.div>
  );
}
