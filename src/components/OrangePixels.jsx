import { useState } from 'react';

const SIZES = [2, 4, 8, 12, 15];
const BLURS = [0, 5, 15];
const PIXEL_COUNT = 8;

function generatePixels() {
  return Array.from({ length: PIXEL_COUNT }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: SIZES[Math.floor(Math.random() * SIZES.length)],
    blur: BLURS[Math.floor(Math.random() * BLURS.length)],
    opacity: 0.6 + Math.random() * 0.4,
  }));
}

export default function OrangePixels() {
  const [pixels] = useState(generatePixels);

  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {pixels.map((pixel) => (
        <div
          key={pixel.id}
          className="absolute rounded-full bg-accent"
          style={{
            left: `${pixel.left}%`,
            top: `${pixel.top}%`,
            width: pixel.size,
            height: pixel.size,
            filter: pixel.blur ? `blur(${pixel.blur}px)` : undefined,
            opacity: pixel.opacity,
          }}
        />
      ))}
    </div>
  );
}
