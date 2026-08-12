import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PROJECTS } from '../utils/constants';
import ProjectCard from './ProjectCard';
import LogoStack from './LogoStack';
import NavigationDots from './NavigationDots';

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5, ease: 'easeInOut' } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
};

export default function Projects() {
  const [index, setIndex] = useState(0);
  const project = PROJECTS[index];

  const goTo = (nextIndex) => {
    setIndex(nextIndex);
  };

  return (
    <section
      id="projects"
      className="min-h-screen flex flex-col justify-center py-24 px-6"
    >
      <div className="w-full max-w-6xl md:max-w-[1424px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-14 -mt-4 md:-mt-6 text-center"
        >
          <span className="text-accent">Projects.</span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center mt-16 md:mt-20">
          {/* LEFT: project content */}
          <div className="w-full max-w-[440px] md:mx-auto md:min-h-[560px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={project.id}
                variants={fadeVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <ProjectCard project={project} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT: hero/logo peek carousel + nav dots */}
          <div className="flex flex-col md:flex-row items-center md:justify-center gap-6 mt-24 md:mt-0">
            <LogoStack
              projects={PROJECTS}
              currentProject={index}
              onSelect={goTo}
            />

            <NavigationDots
              projects={PROJECTS}
              currentProject={index}
              onSelect={goTo}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
