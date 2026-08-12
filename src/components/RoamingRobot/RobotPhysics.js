import { createNoise2D } from 'simplex-noise';

// Position/velocity live in a screen-normalized space: x,y are roughly NDC
// (-1..1, matching the viewport's projected coordinates), z is a real
// Three.js camera-distance in world units so perspective (far = small) comes
// from the actual PerspectiveCamera projection, not manual math.
export class RobotPhysics {
  constructor() {
    this.pos = { x: 0, y: 0.1, z: 6.5 };
    this.vel = { x: 0, y: 0, z: 0 };

    // Kept well inside ±1 NDC so the robot is always fully on-screen —
    // it bounces off these like walls rather than exiting and wrapping.
    this.bounds = {
      x: [-0.86, 0.86],
      y: [-0.78, 0.8], // leaves clearance for the navbar/footer strips
      z: [3.5, 11],
    };

    this.damping = 0.965;
    this.maxSpeed = 0.016;

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

    let avoidX = 0;
    let avoidY = 0;
    for (const kc of this.keycaps) {
      const dx = this.pos.x - kc.x;
      const dy = this.pos.y - kc.y;
      const dist = Math.hypot(dx, dy) || 0.0001;

      if (dist < this.avoidanceRadius) {
        const strength = (1 - dist / this.avoidanceRadius) * this.avoidanceForce;
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

  update(deltaTime, keycaps = []) {
    this.keycaps = keycaps;

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

    this.pos.x += this.vel.x * step;
    this.pos.y += this.vel.y * step;
    this.pos.z += this.vel.z * step;

    // Bounce off every wall — the robot always stays fully visible instead
    // of exiting one edge to reappear on the other.
    if (this.pos.x < this.bounds.x[0]) {
      this.pos.x = this.bounds.x[0];
      this.vel.x *= -0.5;
    } else if (this.pos.x > this.bounds.x[1]) {
      this.pos.x = this.bounds.x[1];
      this.vel.x *= -0.5;
    }

    if (this.pos.y < this.bounds.y[0]) {
      this.pos.y = this.bounds.y[0];
      this.vel.y *= -0.5;
    } else if (this.pos.y > this.bounds.y[1]) {
      this.pos.y = this.bounds.y[1];
      this.vel.y *= -0.5;
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
