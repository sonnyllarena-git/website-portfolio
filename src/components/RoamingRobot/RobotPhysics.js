import { createNoise2D } from 'simplex-noise';

// Longer chat messages read as a wall of text in a small speech bubble, so
// they're shown as a sequence of shorter chunks instead — split on word
// boundaries so a chunk never cuts a word in half.
const CHAT_CHUNK_MAX_LEN = 80;
const CHAT_CHUNK_DURATION = 3; // seconds each chunk stays visible before auto-advancing

function splitMessageIntoChunks(text, maxLen = CHAT_CHUNK_MAX_LEN) {
  if (text.length <= maxLen) return [text];

  const words = text.split(' ');
  const chunks = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLen && current) {
      chunks.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

// Kept well inside ±1 NDC so the robot is always fully on-screen — it
// bounces off these like walls rather than exiting and wrapping. Exported
// (along with depthConfinement/computeDynamicBounds below) so the renderer
// can build a persistent 3D wall mesh using the exact same boundary math
// the physics sim bounces against, instead of a separate approximation.
export const BASE_BOUNDS = {
  x: [-0.86, 0.86],
  y: [-0.78, 0.8], // leaves clearance for the navbar/footer strips
  z: [3.5, 11],
};

// How much the x/y walls close in toward center at the far end of the z
// range, as a fraction of their close-range width. 0 = no depth confinement
// (walls stay put regardless of z), 1 = collapses to a single point at
// bounds.z[1]. Tune here if the far robot feels too caged (lower) or still
// roams too freely when tiny (raise).
export const DEPTH_CONFINEMENT = 0.8;

// Screen-space (x/y) bounds shrink toward center as z (camera distance)
// grows, so a perspective-shrunk far robot reads as confined to a small
// patch of screen instead of roaming the full viewport like a close, large
// one does. z keeps its own fixed bounds — it's the axis these are
// interpolated across, not one that scales itself. A pure function (rather
// than a RobotPhysics method) so the renderer can sample it to build the
// boundary wall geometry without needing a live physics instance.
export function computeDynamicBounds(z, bounds = BASE_BOUNDS, depthConfinement = DEPTH_CONFINEMENT) {
  const [zMin, zMax] = bounds.z;
  const zNorm = Math.min(Math.max((z - zMin) / (zMax - zMin), 0), 1);
  const shrink = 1 - zNorm * depthConfinement;

  const xMax = bounds.x[1] * shrink;

  const [yMinClose, yMaxClose] = bounds.y;
  const yCenter = (yMinClose + yMaxClose) / 2;
  const yHalf = ((yMaxClose - yMinClose) / 2) * shrink;

  return {
    x: [-xMax, xMax],
    y: [yCenter - yHalf, yCenter + yHalf],
  };
}

// Position/velocity live in a screen-normalized space: x,y are roughly NDC
// (-1..1, matching the viewport's projected coordinates), z is a real
// Three.js camera-distance in world units so perspective (far = small) comes
// from the actual PerspectiveCamera projection, not manual math.
export class RobotPhysics {
  constructor() {
    this.pos = { x: 0, y: 0.1, z: 6.5 };
    this.vel = { x: 0, y: 0, z: 0 };
    // A fresh per-instance copy, never the shared BASE_BOUNDS reference —
    // updateBounds() below replaces these arrays at runtime (e.g. from the
    // real navbar/footer screen edges), and BASE_BOUNDS must stay untouched
    // since computeDynamicBounds() elsewhere still reads it as a default.
    this.bounds = { x: [...BASE_BOUNDS.x], y: [...BASE_BOUNDS.y], z: [...BASE_BOUNDS.z] };

    this.damping = 0.965;
    this.maxSpeed = 0.016;
    this.depthConfinement = DEPTH_CONFINEMENT;

    // Which way the robot is facing (yaw, radians) — updated from velocity
    // in update() below, but only past facingMinSpeed so it holds its last
    // heading instead of snapping/jittering toward 0 while nearly still.
    this.facingAngle = 0;
    this.facingMinSpeed = this.maxSpeed * 0.08;

    // Wall bounces are damped harder than a plain boundary clamp so the
    // robot settles at the edge instead of oscillating back into it.
    this.wallBounce = 0.3;

    // Edge-triggered collision events for the current frame, consumed by
    // the renderer to spawn the electric spark effect. Cleared every update().
    this.wallCollisionEvents = [];
    // Tracks which bound (if any) each axis is currently pinned against, so
    // a robot held against a wall by wander/avoidance forces fires the
    // collision event once on contact instead of every single frame.
    this._pinnedAxis = { x: null, y: null };

    // 'roaming' | 'avoidance' | 'firing'
    this.state = 'roaming';

    // Firing is a stationary aim-and-zap — the robot doesn't travel to the
    // button, it shoots at it from wherever it's currently roaming.
    this.fireTarget = null;
    this.fireTimer = 0;
    this.fireHitAt = 0.15; // when the beam "lands" and onHit fires, in seconds
    this.fireDuration = 0.5; // total sequence length before resuming roam
    this.fireHitTriggered = false;

    // Keycap avoidance is 2D (screen-space) only — the keycaps' real z isn't
    // known in this coordinate system, and steering away from their on-screen
    // position reads fine regardless of the robot's simulated depth.
    this.keycaps = [];
    this.avoidanceRadius = 0.5;
    this.avoidanceForce = 0.0012;

    this.noiseTime = Math.random() * 1000;
    this.noise2D = createNoise2D();

    // A speech-bubble message the renderer can display above the robot's
    // head. Long messages are queued as multiple chunks (see setMessage),
    // each shown for CHAT_CHUNK_DURATION before auto-advancing to the next.
    this.chatMessageQueue = [];
    this.chatMessage = null;
    this.chatMessageTime = 0;
    // Bumped on every chunk change so the renderer can key its entrance
    // animation off it even when two chunks happen to share the same text.
    this.chatMessageId = 0;
  }

  setMessage(text) {
    this.chatMessageQueue = splitMessageIntoChunks(text);
    this._advanceChatQueue();
  }

  _advanceChatQueue() {
    this.chatMessage = this.chatMessageQueue.shift() ?? null;
    this.chatMessageTime = 0;
    this.chatMessageId += 1;
  }

  updateRoaming(deltaTime, step) {
    const t = this.noiseTime;
    const nX = this.noise2D(t * 0.5, 0);
    const nY = this.noise2D(t * 0.5, 100);
    const nZ = this.noise2D(t * 0.3, 200);

    // No gravity bias — it wanders the full bounds instead of settling to
    // the floor like a dropped object would.
    this.vel.x += nX * this.maxSpeed * 0.05 * step;
    this.vel.y += nY * this.maxSpeed * 0.05 * step;
    this.vel.z += nZ * this.maxSpeed * 0.05 * step;

    this.noiseTime += deltaTime;
  }

  updateAvoidance(step) {
    if (!this.keycaps.length) return;

    // Must match the `> avoidanceRadius * 1.6` exit check in update() below —
    // otherwise dist sits in a dead band (no force, but not far enough to
    // exit either) where the robot decelerates to zero and freezes in place.
    const outerRadius = this.avoidanceRadius * 1.6;

    let avoidX = 0;
    let avoidY = 0;
    for (const kc of this.keycaps) {
      const dx = this.pos.x - kc.x;
      const dy = this.pos.y - kc.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      if (dist < outerRadius) {
        const strength = (1 - dist / outerRadius) * this.avoidanceForce;
        avoidX += (dx / dist) * strength;
        avoidY += (dy / dist) * strength;

        if (dist < this.avoidanceRadius * 0.4) {
          this.vel.y = Math.max(this.vel.y, 0.022); // hop up and away when very close
        }
      }
    }

    this.vel.x += avoidX * step;
    this.vel.y += avoidY * step;
  }

  updateFiring(deltaTime) {
    this.fireTimer += deltaTime;

    let result = null;
    if (!this.fireHitTriggered && this.fireTimer >= this.fireHitAt) {
      this.fireHitTriggered = true;
      result = { hit: true };
    }

    if (this.fireTimer >= this.fireDuration) {
      this.state = 'roaming';
      this.fireTarget = null;
    }

    return result;
  }

  nearestKeycapDist() {
    if (!this.keycaps.length) return Infinity;
    let min = Infinity;
    for (const kc of this.keycaps) {
      const d = Math.hypot(this.pos.x - kc.x, this.pos.y - kc.y);
      if (d < min) min = d;
    }
    return min;
  }

  calculateDynamicBounds(z) {
    return computeDynamicBounds(z, this.bounds, this.depthConfinement);
  }

  // Replaces the roaming x/y bounds with new [min,max] arrays — always whole
  // new arrays, never mutating the existing ones in place, so a stale
  // reference elsewhere can't end up silently sharing (and corrupting)
  // state with the live bounds. z (depth confinement) is left untouched.
  updateBounds(x, y) {
    this.bounds = { x: [...x], y: [...y], z: this.bounds.z };
  }

  triggerWallCollision(axis, direction, bounds) {
    const key = `${axis}:${direction}`;
    if (this._pinnedAxis[axis] === key) return;
    this._pinnedAxis[axis] = key;
    // bounds is the perpendicular axis's current dynamic range, so the
    // renderer can size the flashed wall panel to the boundary's real
    // extent instead of a fixed, easily-lost-in-the-robot tick mark.
    this.wallCollisionEvents.push({ axis, direction, pos: { ...this.pos }, vel: { ...this.vel }, bounds });
  }

  update(deltaTime, keycaps = []) {
    this.keycaps = keycaps;
    this.wallCollisionEvents = [];

    if (this.chatMessage) {
      this.chatMessageTime += deltaTime;
      if (this.chatMessageTime >= CHAT_CHUNK_DURATION) {
        this._advanceChatQueue();
      }
    }

    if (this.state === 'firing') {
      return this.updateFiring(deltaTime);
    }

    // All the tuned constants below assume a 60fps tick; `step` re-expresses
    // whatever the real frame time was in those same units, so the sim's
    // real-world speed stays constant instead of tracking however fast
    // frames happen to be rendering (a slow tab/device would otherwise make
    // the robot visibly crawl).
    const step = deltaTime * 60;

    if (this.state === 'avoidance') {
      this.updateAvoidance(step);
      if (this.nearestKeycapDist() > this.avoidanceRadius * 1.6) {
        this.state = 'roaming';
      }
    } else {
      this.updateRoaming(deltaTime, step);
      if (this.nearestKeycapDist() < this.avoidanceRadius) {
        this.state = 'avoidance';
      }
    }

    const damp = Math.pow(this.damping, step);
    this.vel.x *= damp;
    this.vel.y *= damp;
    this.vel.z *= damp;

    const speed = Math.hypot(this.vel.x, this.vel.y, this.vel.z);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      this.vel.x *= scale;
      this.vel.y *= scale;
      this.vel.z *= scale;
    }

    // -vel.z because the renderer negates z when going from this physics
    // space to world space (see worldFromPhysics in RoamingRobot.jsx) — this
    // keeps facingAngle in the same convention the renderer applies it in.
    const horizSpeed = Math.hypot(this.vel.x, this.vel.z);
    if (horizSpeed > this.facingMinSpeed) {
      this.facingAngle = Math.atan2(this.vel.x, -this.vel.z);
    }

    this.pos.x += this.vel.x * step;
    this.pos.y += this.vel.y * step;
    this.pos.z += this.vel.z * step;

    // Bounce off every wall — the robot always stays fully visible instead
    // of exiting one edge to reappear on the other. x/y walls scale with
    // the current depth (see calculateDynamicBounds); z keeps fixed bounds.
    const dynamicBounds = this.calculateDynamicBounds(this.pos.z);
    for (const axis of ['x', 'y']) {
      const [min, max] = dynamicBounds[axis];
      if (this.pos[axis] < min) {
        this.pos[axis] = min;
        this.vel[axis] = Math.abs(this.vel[axis]) * this.wallBounce;
        this.triggerWallCollision(axis, 'min', dynamicBounds);
      } else if (this.pos[axis] > max) {
        this.pos[axis] = max;
        this.vel[axis] = -Math.abs(this.vel[axis]) * this.wallBounce;
        this.triggerWallCollision(axis, 'max', dynamicBounds);
      } else {
        this._pinnedAxis[axis] = null;
      }
    }

    if (this.pos.z < this.bounds.z[0]) {
      this.pos.z = this.bounds.z[0];
      this.vel.z *= -0.5;
    } else if (this.pos.z > this.bounds.z[1]) {
      this.pos.z = this.bounds.z[1];
      this.vel.z *= -0.5;
    }

    return null;
  }

  fireAt(target) {
    this.state = 'firing';
    this.fireTarget = target;
    this.fireTimer = 0;
    this.fireHitTriggered = false;
  }
}

export default RobotPhysics;
