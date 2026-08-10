import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { PageNavProvider, usePageNav } from './context/PageContext';
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
  return (
    <ThemeProvider>
      <PageNavProvider>
        <BrowserRouter>
          <div className="min-h-screen text-black dark:text-white relative">
            <OrangePixels />
            <CursorOrb />
            <Navbar />
            <main className="relative h-screen overflow-hidden">
              <Routes>
                <Route path="/" element={<AnimatedPages />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </PageNavProvider>
    </ThemeProvider>
  );
}

export default App;
