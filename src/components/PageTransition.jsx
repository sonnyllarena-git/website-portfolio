const ENTER_OFFSET = {
  right: { x: '-100%' },
  left: { x: '100%' },
  up: { y: '100%' },
  down: { y: '-100%' },
};

const EXIT_OFFSET = {
  right: { x: '100%' },
  left: { x: '-100%' },
  up: { y: '-100%' },
  down: { y: '100%' },
};

const AXIS_TRANSITION = {
  opacity: { duration: 0.3, ease: 'easeInOut' },
  x: { duration: 0.8, ease: 'easeInOut' },
  y: { duration: 0.8, ease: 'easeInOut' },
};

export const pageVariants = {
  initial: (direction) => ({
    opacity: 0,
    x: 0,
    y: 0,
    ...ENTER_OFFSET[direction],
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: AXIS_TRANSITION,
  },
  exit: (direction) => ({
    opacity: 0,
    ...EXIT_OFFSET[direction],
    transition: AXIS_TRANSITION,
  }),
};
