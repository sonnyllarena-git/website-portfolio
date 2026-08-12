import { useEffect, useRef, useState } from 'react';

// Drives the button robot's mood through the chat open/close story:
// excited (anticipation) -> jumping (leap) -> idle, and the mirror on close.
export function useRobotChatState(isOpen, isHovering) {
  const [robotState, setRobotState] = useState('idle');
  const timeoutsRef = useRef([]);
  const prevOpenRef = useRef(isOpen);

  useEffect(() => {
    if (prevOpenRef.current === isOpen) return;
    prevOpenRef.current = isOpen;
    timeoutsRef.current.forEach(clearTimeout);

    if (isOpen) {
      setRobotState('excited');
      timeoutsRef.current = [
        setTimeout(() => setRobotState('jumping'), 300),
        setTimeout(() => setRobotState('idle'), 900),
      ];
    } else {
      setRobotState('sad');
      timeoutsRef.current = [
        setTimeout(() => setRobotState('jumping'), 600),
        setTimeout(() => setRobotState('idle'), 1200),
      ];
    }
  }, [isOpen]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  // Hover only nudges the robot between idle/excited, and only once it has
  // settled — it must never interrupt the open/close script above.
  useEffect(() => {
    if (isOpen) return;
    setRobotState((current) => {
      if (current !== 'idle' && current !== 'excited') return current;
      return isHovering ? 'excited' : 'idle';
    });
  }, [isHovering, isOpen]);

  return robotState;
}
