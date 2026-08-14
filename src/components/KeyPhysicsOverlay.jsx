import React, { useState, useMemo, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { PORTFOLIO_STACK } from '../data/techStack';
import KeyCap, { KeycapHoverContext } from './KeyCap';
import ScreenJar, { useJarFloorBounds } from './ScreenJar';
import RobotProxyBody from './RobotProxyBody';
import { useKeycapAvoidance } from '../context/KeycapAvoidanceContext';
import { WallCollisionEffect } from './effects/WallCollisionEffect';
import { useSceneArena } from '../utils/sceneBounds';

const MAX_WALL_HIT_EFFECTS = 6; // caps runaway spawns if a keycap gets pinned against a wall

// --- Particle text: samples a name into dot positions on an offscreen canvas,
// cached per string since the same names repeat across hovers. ---
// Verdana/Arial (heavy weight) has wider, more open letterforms than Inter —
// they hold up much better once reduced to a sparse dot pattern. A touch of
// letter-spacing also keeps adjacent letters' dots from blurring together.
function sampleTextParticles(text, fontSize = 20, stride = 1) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = `900 ${fontSize}px Verdana, Arial, sans-serif`;
  ctx.font = font;
  ctx.letterSpacing = '1.5px';
  const width = Math.max(1, Math.ceil(ctx.measureText(text).width) + 12);
  const height = Math.ceil(fontSize * 1.6);
  canvas.width = width;
  canvas.height = height;
  ctx.font = font;
  ctx.letterSpacing = '1.5px';
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 6, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const points = [];
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      if (data[(y * width + x) * 4 + 3] > 128) {
        points.push({ x: x - width / 2, y: y - height / 2 });
      }
    }
  }
  return points;
}

const textParticleCache = new Map();
function getTextParticles(text) {
  if (!textParticleCache.has(text)) {
    textParticleCache.set(text, sampleTextParticles(text));
  }
  return textParticleCache.get(text);
}

const SCATTER_START_MS = 150;
const ASSEMBLE_START_MS = 500;
const ASSEMBLE_END_MS = 1200;
const LEAVE_MS = 500;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

// Draws the currently-hovered keycap's name assembling from/scattering into
// dots, driven entirely off a mutable ref (hoverRef) so it never triggers a
// React re-render — KeyCap writes to it every frame while hovered.
function ParticleTextCanvas({ hoverRef }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const lastKeyRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const hover = hoverRef.current;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      ctx.clearRect(0, 0, width, height);

      if (!hover.phase) return;

      const now = performance.now();
      const transitionKey = `${hover.id}-${hover.phase}-${hover.phaseStart}`;
      if (lastKeyRef.current !== transitionKey) {
        lastKeyRef.current = transitionKey;
        if (hover.phase === 'in') {
          particlesRef.current = getTextParticles(hover.text).map((t) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 4 + Math.random() * 10;
            return {
              fromX: Math.cos(angle) * radius,
              fromY: Math.sin(angle) * radius,
              toX: t.x,
              toY: t.y,
            };
          });
        } else if (hover.phase === 'out') {
          particlesRef.current = particlesRef.current.map((p) => {
            const angle = Math.random() * Math.PI * 2;
            const radius = 20 + Math.random() * 30;
            return {
              fromX: p.toX,
              fromY: p.toY,
              toX: p.toX + Math.cos(angle) * radius,
              toY: p.toY + Math.sin(angle) * radius,
            };
          });
        }
      }

      const elapsed = now - hover.phaseStart;
      let progress = 1;
      let alpha = 1;

      if (hover.phase === 'in') {
        if (elapsed < SCATTER_START_MS) {
          alpha = 0;
          progress = 0;
        } else if (elapsed < ASSEMBLE_START_MS) {
          alpha = (elapsed - SCATTER_START_MS) / (ASSEMBLE_START_MS - SCATTER_START_MS);
          progress = 0;
        } else if (elapsed < ASSEMBLE_END_MS) {
          alpha = 1;
          progress = easeOutCubic((elapsed - ASSEMBLE_START_MS) / (ASSEMBLE_END_MS - ASSEMBLE_START_MS));
        }
      } else if (hover.phase === 'out') {
        const leaveProgress = Math.min(elapsed / LEAVE_MS, 1);
        progress = easeOutCubic(leaveProgress);
        alpha = 1 - leaveProgress;
        if (leaveProgress >= 1) {
          hover.phase = null;
          particlesRef.current = [];
          lastKeyRef.current = null;
        }
      }

      if (alpha <= 0 || !particlesRef.current.length) return;

      const anchorX = hover.x;
      const anchorY = hover.y - 48;

      ctx.save();
      ctx.shadowColor = 'rgba(140, 235, 255, 0.85)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      particlesRef.current.forEach((p) => {
        const x = anchorX + p.fromX + (p.toX - p.fromX) * progress;
        const y = anchorY + p.fromY + (p.toY - p.fromY) * progress;
        ctx.beginPath();
        ctx.arc(x, y, 1.15, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [hoverRef]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-50" />;
}

// Visible ground plane + contact-shadow catcher, sized/positioned to match
// ScreenJar's actual (dynamic) floor collider — kept in lockstep via the
// same useJarFloorBounds() hook so the rendered ground never visually
// detaches from where keycaps actually come to rest.
function JarFloor({ arena }) {
  const { floorY, halfWidth, centerX } = useJarFloorBounds(arena);
  const width = halfWidth * 2;

  return (
    <>
      <mesh position={[centerX, floorY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 16]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.22} />
      </mesh>
      <ContactShadows position={[centerX, floorY + 0.05, 0]} opacity={0.5} blur={2} scale={[width, 16]} far={8} />
    </>
  );
}

// Decorative physics background: every skill keycap drops in from above the
// frame and settles at the bottom. Skipped on mobile (perf) and when the
// user prefers reduced motion.
const KeyPhysicsOverlay = ({ floating = false }) => {
  const [skip] = useState(
    () => window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const hoverRef = useRef({ id: null, text: '', x: 0, y: 0, phase: null, phaseStart: 0 });
  const avoidanceRef = useKeycapAvoidance();
  const [wallHitEffects, setWallHitEffects] = useState([]);
  const hitIdRef = useRef(0);
  const arena = useSceneArena();

  const handleWallHit = useCallback(({ position }) => {
    setWallHitEffects((prev) => {
      const next = [...prev, { id: hitIdRef.current++, position }];
      return next.length > MAX_WALL_HIT_EFFECTS ? next.slice(next.length - MAX_WALL_HIT_EFFECTS) : next;
    });
  }, []);

  // The roaming robot must never keep avoiding a keycap after this scene
  // (Home-page-only) unmounts, so its shared position list is cleared with it.
  useEffect(() => {
    return () => {
      if (avoidanceRef) avoidanceRef.current = [];
    };
  }, [avoidanceRef]);

  const keysList = useMemo(
    () =>
      PORTFOLIO_STACK.map((item, i) => ({
        item,
        position: [
          (Math.random() - 0.5) * 20,
          10 + i * 0.6 + Math.random() * 2,
          (Math.random() - 0.5) * 3,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      })),
    []
  );

  if (skip) return null;

  return (
    <div className="absolute inset-0 z-0">
      <KeycapHoverContext.Provider value={hoverRef}>
        <Canvas
          camera={{ position: [0, 0, 16], fov: 55 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 15, 10]} intensity={2.5} />
          <pointLight position={[-10, -10, -10]} color="#FF4D4D" intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#ffffff" intensity={0.3} />

          <JarFloor arena={arena} />

          <Suspense fallback={null}>
            <Physics gravity={[0, -14, 0]} colliders={false}>
              <ScreenJar arena={arena} />
              <RobotProxyBody />
              {keysList.map((k, index) => (
                <KeyCap
                  key={index}
                  id={index}
                  position={k.position}
                  rotation={k.rotation}
                  item={k.item}
                  onWallHit={handleWallHit}
                  floating={floating}
                />
              ))}
              {wallHitEffects.map((effect) => (
                <WallCollisionEffect
                  key={effect.id}
                  position={effect.position}
                  onExpire={() => setWallHitEffects((prev) => prev.filter((w) => w.id !== effect.id))}
                />
              ))}
            </Physics>
          </Suspense>
        </Canvas>

        <ParticleTextCanvas hoverRef={hoverRef} />
      </KeycapHoverContext.Provider>
    </div>
  );
};

export default KeyPhysicsOverlay;
