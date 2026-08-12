import { createContext, useContext, useRef } from 'react';

const KeycapAvoidanceContext = createContext(null);

// Mutable array (not React state) of the on-screen keycaps' current NDC
// position, sparse-indexed by each KeyCap's slot. Written every frame by
// KeyPhysicsOverlay's keycaps, read every frame by the RoamingRobot for
// collision avoidance — a ref so 60fps updates skip React's render cycle,
// the same pattern KeyCap already uses for its hover-label context.
export function KeycapAvoidanceProvider({ children }) {
  const positionsRef = useRef([]);
  return (
    <KeycapAvoidanceContext.Provider value={positionsRef}>
      {children}
    </KeycapAvoidanceContext.Provider>
  );
}

export function useKeycapAvoidance() {
  return useContext(KeycapAvoidanceContext);
}
