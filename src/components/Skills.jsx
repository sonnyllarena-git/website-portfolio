import { motion } from 'framer-motion';
import { SKILLS } from '../utils/constants';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 bg-black/[0.02] dark:bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-16 text-center"
        >
          <span className="text-accent">Skills</span>
        </motion.h2>

        {SKILLS.map((group) => (
          <div key={group.category} className="mb-12">
            <h3 className="text-lg font-bold mb-6 text-black/70 dark:text-white/70">
              {group.category}
            </h3>
            <motion.div
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 transition-all duration-400 ease-resize"
            >
              {group.items.map((skill) => (
                <motion.div
                  key={skill.name}
                  variants={cardVariants}
                  className="card-hover group flex flex-col items-center gap-3 py-8 px-4 rounded-2xl border border-border-light dark:border-white/10 bg-white dark:bg-white/5 hover:border-accent"
                >
                  <skill.icon
                    size={32}
                    className="text-black/70 dark:text-white/70 group-hover:text-accent transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:rotate-6"
                  />
                  <span className="text-sm font-medium text-center">
                    {skill.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
