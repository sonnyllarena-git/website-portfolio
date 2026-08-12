import { motion } from 'framer-motion';
import { SKILLS } from '../utils/constants';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Skills() {
  return (
    <section
      id="skills"
      className="min-h-[calc(100vh-1px)] flex flex-col justify-center py-24 px-6"
    >
      <div className="max-w-5xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-10 text-center"
        >
          <span className="text-accent">Skills</span>
        </motion.h2>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {SKILLS.map((group) => (
            <motion.div key={group.category} variants={cardVariants}>
              <div className="skill-neon h-48 flex flex-col rounded-2xl border border-border-light dark:border-white/10 bg-white dark:bg-bg-dark p-6">
                <h3 className="text-base font-bold text-center text-black/70 dark:text-white/70 uppercase tracking-wide">
                  {group.category}
                </h3>

                <div className="skill-marquee-wrapper flex-1 mt-2">
                  <div className="skill-marquee-track">
                    {group.items.map((skill) => (
                      <span key={skill.name} className="skill-marquee-chip">
                        <skill.icon size={14} className="shrink-0" />
                        {skill.name}
                      </span>
                    ))}
                    {group.items.map((skill) => (
                      <span
                        key={`dup-${skill.name}`}
                        className="skill-marquee-chip"
                        aria-hidden="true"
                      >
                        <skill.icon size={14} className="shrink-0" />
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
