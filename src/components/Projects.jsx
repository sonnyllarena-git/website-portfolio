import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { PROJECTS } from '../utils/constants';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-16 text-center"
        >
          <span className="text-accent">Projects.</span>
        </motion.h2>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {PROJECTS.map((project) => (
            <motion.div
              key={project.id}
              variants={cardVariants}
              className="card-hover group rounded-2xl border border-border-light dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-black/10 dark:bg-white/10 overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center text-black/30 dark:text-white/30 text-sm transition-transform duration-400 ease-out group-hover:scale-108">
                  Project Preview
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                <p className="text-sm text-black/70 dark:text-white/70 mb-4 flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="text-xs font-medium px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black/70 dark:text-white/70 transition-colors duration-200 ease-in-out hover:bg-accent hover:text-white"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hover flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-black dark:border-white text-sm font-semibold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    <FiExternalLink size={14} />
                    View
                  </a>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hover flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90"
                  >
                    <FiGithub size={14} />
                    View Code
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
