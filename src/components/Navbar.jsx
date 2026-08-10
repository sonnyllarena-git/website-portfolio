import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { usePageNav } from '../context/PageContext';
import { NAV_LINKS } from '../utils/constants';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { activePage, goToPage } = usePageNav();
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
    setMenuOpen(false);
    goToPage(to);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-md ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <button
          onClick={() => handleNavClick('home')}
          className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-lg transition-transform duration-300 ease-in-out hover:scale-110"
          aria-label="Go to home"
        >
          S
        </button>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.to} className="group">
              <button
                onClick={() => handleNavClick(link.to)}
                className={`relative text-sm font-medium transition-colors duration-200 ease-in-out hover:text-accent ${
                  activePage === link.to
                    ? 'text-accent'
                    : 'text-black dark:text-white'
                }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-2 left-0 right-0 h-0.5 bg-accent origin-left transition-transform duration-200 ease-in-out ${
                    activePage === link.to
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-10 h-10 flex items-center justify-center rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors duration-300 ease-in-out overflow-hidden"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </motion.span>
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="btn-hover px-5 py-2.5 bg-black border border-black text-white text-sm font-semibold rounded-full hover:bg-transparent hover:text-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white"
          >
            Contact Me
          </button>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-black dark:border-white text-black dark:text-white overflow-hidden transition-colors duration-300 ease-in-out"
          >
            <motion.span
              key={theme}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex"
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </motion.span>
          </button>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="w-9 h-9 flex items-center justify-center text-black dark:text-white"
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
            className="md:hidden overflow-hidden bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-white/10"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <button
                    onClick={() => handleNavClick(link.to)}
                    className={`text-base font-medium ${
                      activePage === link.to
                        ? 'text-accent'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="btn-hover w-full px-5 py-2.5 bg-black border border-black text-white text-sm font-semibold rounded-full"
                >
                  Contact Me
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
