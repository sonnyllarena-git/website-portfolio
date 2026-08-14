import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { usePageNav } from '../context/PageContext';
import { useSound } from '../context/SoundContext';
import { NAV_LINKS } from '../utils/constants';
import AvailableForWorkBadge from './AvailableForWorkBadge';
import AudioControl from './AudioControl';
import HudNavToggle from './HudNavToggle';

export default function Navbar() {
  const { activePage, goToPage, openStore, closeStore } = usePageNav();
  const { tick } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > 20);
  }, [activePage]);

  const handleNavClick = (to) => {
    tick();
    setMenuOpen(false);
    closeStore();
    goToPage(to);
  };

  const handleStoreClick = () => {
    tick();
    setMenuOpen(false);
    openStore();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 bg-bg-dark/90 backdrop-blur-md ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <button
          onClick={() => handleNavClick('home')}
          className="w-10 h-10 rounded-full border border-accent/40 text-white flex items-center justify-center font-bold text-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:border-accent"
          aria-label="Go to home"
        >
          S
        </button>

        <div className="hidden md:block">
          <HudNavToggle activePage={activePage} onNavigate={handleNavClick} />
        </div>

        <div className="hidden md:flex items-center gap-4">
          <AudioControl />
          <button
            onClick={handleStoreClick}
            className="btn-hover px-5 py-2.5 border border-white/20 text-white/80 text-sm font-semibold rounded-full hover:border-white/40 hover:text-white"
          >
            Store
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="btn-hover px-5 py-2.5 border border-accent text-accent text-sm font-semibold rounded-full hover:bg-accent hover:text-black"
          >
            Connect Now
          </button>
          <AvailableForWorkBadge />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <AudioControl />
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center text-white"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? 'close' : 'open'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex"
              >
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-bg-dark/95 border-t border-white/10"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <button
                    onClick={() => handleNavClick(link.to)}
                    className={`text-base font-medium ${
                      activePage === link.to ? 'text-accent' : 'text-white'
                    }`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handleStoreClick}
                  className="text-base font-medium text-white"
                >
                  Store
                </button>
              </li>
              <li className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick('contact')}
                  className="btn-hover flex-1 px-5 py-2.5 border border-accent text-accent text-sm font-semibold rounded-full"
                >
                  Connect Now
                </button>
                <AvailableForWorkBadge />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
