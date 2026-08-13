import { createContext, useContext, useRef } from 'react';

const RobotPositionContext = createContext(null);

// Mirrors KeycapAvoidanceContext.jsx's pattern in the opposite direction: a
// mutable ref (not React state, so 60fps writes skip React's render cycle)
// holding the roaming robot's real, camera-projected screen NDC position —
// written every frame by RoamingRobot, read every frame by RobotProxyBody
// (inside the keycap jar's physics world) to shove keycaps out of the way.
export function RobotPositionProvider({ children }) {
  const positionRef = useRef({ x: 0, y: 0, active: false });
  return (
    <RobotPositionContext.Provider value={positionRef}>
      {children}
    </RobotPositionContext.Provider>
  );
}

export function useRobotPosition() {
  return useContext(RobotPositionContext);
}
