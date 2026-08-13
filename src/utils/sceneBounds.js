import { useEffect, useState } from 'react';

// Small breathing room from the literal viewport edge / chrome boundary —
// purely aesthetic, so nothing clips exactly at the pixel edge.
const EDGE_MARGIN_PX = 16;
const BOUNDS_KEYS = ['top', 'bottom', 'left', 'right'];

function measure() {
  const header = document.querySelector('header');
  const footer = document.querySelector('footer');
  const top = (header ? header.getBoundingClientRect().bottom : 0) + EDGE_MARGIN_PX;
  const bottom = (footer ? footer.getBoundingClientRect().top : window.innerHeight) - EDGE_MARGIN_PX;
  return {
    top,
    bottom,
    left: EDGE_MARGIN_PX,
    right: window.innerWidth - EDGE_MARGIN_PX,
  };
}

// Real screen-pixel bounds of "the arena" both the roaming robot and the
// keycap jar roam within — the visible viewport minus the fixed Navbar/
// Footer strips (see Navbar.jsx/Footer.jsx, both singleton <header>/<footer>
// elements), recomputed on resize. One source of truth so both systems'
// otherwise fully independent coordinate spaces cover the same real screen
// region without needing to share a camera.
export function useSceneArena() {
  const [bounds, setBounds] = useState(measure);

  useEffect(() => {
    let raf = null;
    const recompute = () => {
      setBounds((prev) => {
        const next = measure();
        // Sub-pixel jitter (scrollbar toggling, rounding) shouldn't ripple
        // into two physics systems + a Rapier collider recreation.
        const unchanged = BOUNDS_KEYS.every((key) => Math.abs(next[key] - prev[key]) < 1);
        return unchanged ? prev : next;
      });
    };
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        recompute();
      });
    };
    window.addEventListener('resize', onResize);
    // Re-measure once after mount too, in case late layout shifts (e.g. web
    // font loading changing the navbar's height) land after the first paint.
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return bounds;
}
