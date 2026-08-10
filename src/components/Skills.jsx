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

const itemVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const chipVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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
              <div className="skill-neon rounded-2xl border border-border-light dark:border-white/10 bg-white dark:bg-white/5 p-6">
                <h3 className="text-base font-bold mb-4 text-black/70 dark:text-white/70 uppercase tracking-wide">
                  {group.category}
                </h3>
                <motion.ul
                  variants={itemVariants}
                  className="grid grid-cols-2 gap-x-4 gap-y-3"
                >
                  {group.items.map((skill) => (
                    <motion.li
                      key={skill.name}
                      variants={chipVariants}
                      className="group flex items-center gap-2 text-sm"
                    >
                      <skill.icon
                        size={18}
                        className="text-black/60 dark:text-white/60 shrink-0 transition-all duration-300 ease-out group-hover:text-accent group-hover:rotate-6"
                      />
                      <span className="truncate">{skill.name}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
