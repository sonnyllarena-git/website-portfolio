import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useMousePosition } from '../hooks/useMousePosition';

const SIZE = 150;

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
        background:
          'radial-gradient(circle, rgba(255,107,53,0.55) 0%, rgba(255,107,53,0.25) 45%, rgba(255,107,53,0) 75%)',
        filter: 'blur(6px)',
      }}
      animate={{
        opacity: isInside ? 0.75 : 0,
        scale: hoveringInteractive ? 1.3 : 1,
      }}
      transition={{
        opacity: { duration: 0.3, ease: 'easeInOut' },
        scale: { duration: 0.3, ease: 'easeInOut' },
      }}
    />
  );
}
