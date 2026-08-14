import { useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GridField from './GridField';
import Glitter from './Glitter';
import CameraRig from './CameraRig';
import { waypointX } from './waypoints';
import { usePageNav } from '../../context/PageContext';
import Hero from '../Hero';
import About from '../About';
import Projects from '../Projects';
import TechStack from '../TechStack';
import Blog from '../Blog';
import Testimonials from '../Testimonials';
import Contact from '../Contact';

const PAGE_COMPONENTS = {
  home: Hero,
  about: About,
  projects: Projects,
  techStack: TechStack,
  blog: Blog,
  testimonials: Testimonials,
  contact: Contact,
};

function getReduced() {
  return (
    typeof window !== 'undefined' &&
    (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(getReduced);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(getReduced());
    mq.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  return reduced;
}

export default function SceneCanvas() {
  const { activePage, pageOrder } = usePageNav();
  const reduced = usePrefersReducedMotion();
  const [displayedPage, setDisplayedPage] = useState(activePage);
  const [visible, setVisible] = useState(true);

  const pageIndex = pageOrder.indexOf(activePage);
  const displayedIndex = pageOrder.indexOf(displayedPage);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (reduced) {
      setDisplayedPage(activePage);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [activePage, reduced]);

  const handleArrive = useCallback(() => {
    setDisplayedPage(activePage);
    setVisible(true);
  }, [activePage]);

  const DisplayedComponent = PAGE_COMPONENTS[displayedPage];

  return (
    <Canvas camera={{ position: [0, 0, 9], fov: 50 }} gl={{ antialias: true, alpha: true }}>
      {!reduced && <GridField />}
      {!reduced && <Glitter />}
      {!reduced && (
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.15} luminanceSmoothing={0.4} intensity={0.9} />
        </EffectComposer>
      )}
      <CameraRig pageIndex={pageIndex} reduced={reduced} onArrive={handleArrive} />
      <Html
        transform={false}
        center
        position={[waypointX(displayedIndex), 0, 0]}
        style={{
          width: '100vw',
          opacity: visible ? 1 : 0,
          transition: 'opacity 300ms ease-in-out',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="h-screen w-screen overflow-y-auto pb-10">
          <DisplayedComponent />
        </div>
      </Html>
    </Canvas>
  );
}
