import { motion } from 'framer-motion';
import { FiArrowDown } from 'react-icons/fi';
import { PROFILE, SOCIAL_LINKS } from '../utils/constants';
import { CurvedLine, OrangeSquare } from './Decorations';

export default function Hero() {
  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      <CurvedLine className="hidden lg:block absolute top-24 right-10 opacity-70" />
      <OrangeSquare className="hidden lg:block absolute top-40 left-16" size={18} delay={0.3} />
      <OrangeSquare className="hidden lg:block absolute bottom-32 right-1/3" size={12} delay={0.6} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.2, delayChildren: 0.4 } },
        }}
        className="hidden lg:flex flex-col items-center gap-5 fixed left-8 bottom-10 z-10"
      >
        {SOCIAL_LINKS.map((social) => (
          <motion.a
            key={social.name}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
            href={social.url || '#'}
            target={social.url ? '_blank' : undefined}
            rel={social.url ? 'noopener noreferrer' : undefined}
            aria-label={social.name}
            className="text-black/60 dark:text-white/60 hover:text-accent hover:scale-110 transition-all duration-300 ease-in-out"
          >
            <social.icon size={18} />
          </motion.a>
        ))}
        <span className="w-px h-16 bg-black/20 dark:bg-white/20" />
      </motion.div>

      <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-accent font-semibold mb-3 tracking-wide">Hello, I'm</p>
          <h1 className="text-6xl md:text-7xl font-black leading-none mb-4">
            {PROFILE.name}
          </h1>
          <p className="text-lg md:text-xl text-black/70 dark:text-white/70 max-w-md">
            {PROFILE.title}
          </p>

          <button
            onClick={scrollToAbout}
            className="mt-10 inline-flex items-center gap-2 group text-sm font-semibold"
          >
            <span className="w-11 h-11 rounded-full border border-black dark:border-white flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white group-hover:scale-110 transition-all duration-300 ease-in-out">
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="flex"
              >
                <FiArrowDown />
              </motion.span>
            </span>
            Scroll Down
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative justify-self-center"
        >
          <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-black dark:border-white rounded-2xl bg-white/40 dark:bg-white/5 flex items-center justify-center relative overflow-hidden transition-transform duration-400 ease-out hover:scale-105">
            <span className="text-black/30 dark:text-white/30 text-sm">
              Profile Photo
            </span>
            <OrangeSquare className="absolute -top-4 -right-4" size={24} delay={0.5} />
            <span className="absolute -bottom-5 -left-5 w-20 h-20 border-2 border-accent rounded-2xl -z-10" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
