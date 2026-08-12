// "Eye level" convention for the roaming robot's camera framing
// (RoamingRobot.jsx) — where its 3D scene's vanishing point sits on screen.
//
// Expressed as a fraction of viewport height from the TOP where the
// vanishing point sits. 0.5 = dead center (equal headroom and floor).
// Pushing it up (toward 0) leaves more of the frame as "floor" below it and
// less open space above — the classic one-point floor-perspective read of
// standing at ground level. 0.36 pushes past the initial 0.4-0.45 estimate —
// that range read as barely different from dead-center once seen live, since
// the robot's own wander already puts it anywhere across a wide band
// regardless of the shift. A value close to the bottom (nearly the whole
// frame converging to a point near the edge) reads instead like a much
// taller viewer looking down at the floor.
export const EYE_LEVEL_FROM_TOP = 0.36;
