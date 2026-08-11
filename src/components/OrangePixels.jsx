import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePageNav } from '../context/PageContext';

const SIZES = [2, 4, 8, 12, 15];
const BLURS = [0, 5, 15];
const PIXEL_COUNT = 8;

function generatePixels(generation) {
  return Array.from({ length: PIXEL_COUNT }).map((_, i) => ({
    id: `${generation}-${i}`,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: SIZES[Math.floor(Math.random() * SIZES.length)],
    blur: BLURS[Math.floor(Math.random() * BLURS.length)],
    opacity: 0.6 + Math.random() * 0.4,
  }));
}

export default function OrangePixels() {
  const { activePage } = usePageNav();
  const generationRef = useRef(0);
  const [pixels, setPixels] = useState(() => generatePixels(generationRef.current));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    generationRef.current += 1;
    setPixels(generatePixels(generationRef.current));
  }, [activePage]);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <AnimatePresence initial={false}>
        {pixels.map((pixel) => (
          <motion.div
            key={pixel.id}
            className="absolute rounded-full bg-accent"
            style={{
              left: `${pixel.left}%`,
              top: `${pixel.top}%`,
              width: pixel.size,
              height: pixel.size,
              filter: pixel.blur ? `blur(${pixel.blur}px)` : undefined,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: pixel.opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
