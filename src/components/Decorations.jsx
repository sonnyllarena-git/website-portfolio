import { motion } from 'framer-motion';

export function CurvedLine({ className = '' }) {
  return (
    <svg
      className={className}
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M10 200C60 120 120 40 210 10"
        stroke="#FF6B35"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1000"
        initial={{ strokeDashoffset: 1000 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function OrangeSquare({ className = '', size = 16, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay, type: 'spring', bounce: 0.5 }}
      className={`bg-accent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function DotGrid({ className = '' }) {
  return (
    <svg
      className={className}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
    >
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={row * 28 + 6}
            cy={col * 28 + 6}
            r="2"
            className="fill-black/20 dark:fill-white/20"
          />
        ))
      )}
    </svg>
  );
}
