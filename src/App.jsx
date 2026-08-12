import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { PageNavProvider, usePageNav } from './context/PageContext';
import { KeycapAvoidanceProvider } from './context/KeycapAvoidanceContext';
import { pageVariants } from './components/PageTransition';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CursorOrb from './components/CursorOrb';
import OrangePixels from './components/OrangePixels';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Learning from './components/Learning';
import Contact from './components/Contact';
import Chatbot from './components/chat/Chatbot';
import RoamingRobot from './components/RoamingRobot/RoamingRobot';

const PAGES = {
  home: Hero,
  about: About,
  projects: Projects,
  skills: Skills,
  learning: Learning,
  contact: Contact,
};

function AnimatedPages() {
  const { activePage, direction } = usePageNav();
  const PageComponent = PAGES[activePage];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activePage]);

  return (
    <AnimatePresence custom={direction} initial={false}>
      <motion.div
        key={activePage}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="absolute inset-0 overflow-y-auto pb-10"
      >
        <PageComponent />
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const roamingRobotRef = useRef(null);

  const handleRequestOpen = (openNow) => {
    const button = document.querySelector('[data-chat-launcher]');
    const rect = button?.getBoundingClientRect();
    const px = rect ? rect.left + rect.width / 2 : window.innerWidth - 50;
    const py = rect ? rect.top + rect.height / 2 : window.innerHeight - 50;
    roamingRobotRef.current?.fireLaserAt(px, py, openNow);
  };

  return (
    <ThemeProvider>
      <PageNavProvider>
        <KeycapAvoidanceProvider>
          <BrowserRouter>
            <div className="min-h-screen text-black dark:text-white relative">
              <OrangePixels />
              <CursorOrb />
              <Navbar />
              <main className="relative z-20 h-screen overflow-hidden">
                <Routes>
                  <Route path="/" element={<AnimatedPages />} />
                </Routes>
              </main>
              <Footer />
              <RoamingRobot ref={roamingRobotRef} />
              <Chatbot onRequestOpen={handleRequestOpen} />
            </div>
          </BrowserRouter>
        </KeycapAvoidanceProvider>
      </PageNavProvider>
    </ThemeProvider>
  );
}

export default App;
