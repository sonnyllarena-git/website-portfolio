import { motion } from 'framer-motion';
import { PORTFOLIO_STACK } from '../data/techStack';

const CATEGORIES = [...new Set(PORTFOLIO_STACK.map((item) => item.category))];

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function TechStack() {
  return (
    <section
      id="techStack"
      className="min-h-[calc(100vh-1px)] flex flex-col justify-center py-24 px-6"
    >
      <div className="max-w-5xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-3 text-center"
        >
          <span className="text-accent">Tech Stack</span>
        </motion.h2>
        <p className="text-center text-white/60 mb-10 max-w-xl mx-auto">
          The languages, frameworks, and tools we build with day to day.
        </p>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {CATEGORIES.map((category) => {
            const items = PORTFOLIO_STACK.filter((item) => item.category === category);
            return (
              <motion.div key={category} variants={cardVariants}>
                <div className="skill-neon h-48 flex flex-col rounded-2xl border border-white/10 bg-bg-dark p-6">
                  <h3 className="text-base font-bold text-center text-white/70 uppercase tracking-wide">
                    {category}
                  </h3>

                  <div className="skill-marquee-wrapper flex-1 mt-2">
                    <div className="skill-marquee-track">
                      {items.map((item) => (
                        <span
                          key={item.name}
                          className="skill-marquee-chip"
                          style={{ borderTop: `2px solid ${item.color}` }}
                        >
                          <img src={item.icon} alt="" className="w-3.5 h-3.5 shrink-0" />
                          {item.name}
                        </span>
                      ))}
                      {items.map((item) => (
                        <span
                          key={`dup-${item.name}`}
                          className="skill-marquee-chip"
                          style={{ borderTop: `2px solid ${item.color}` }}
                          aria-hidden="true"
                        >
                          <img src={item.icon} alt="" className="w-3.5 h-3.5 shrink-0" />
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
