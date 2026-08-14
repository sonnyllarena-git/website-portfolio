import { motion } from 'framer-motion';
import { PROFILE } from '../utils/constants';
import { OrangeSquare, DotGrid } from './Decorations';

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function About() {
  return (
    <section
      id="about"
      className="min-h-screen flex items-center py-24 px-6 relative"
    >
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative justify-self-center"
        >
          <div className="profile-neon w-64 h-72 md:w-80 md:h-96 border-2 border-black dark:border-white rounded-2xl bg-white/40 dark:bg-bg-dark flex items-center justify-center relative overflow-hidden">
            <span className="text-black/30 dark:text-white/30 text-sm">
              Profile Photo
            </span>
            <OrangeSquare className="absolute -top-5 -left-5" size={20} />
            <DotGrid className="absolute -bottom-8 -right-8 hidden md:block" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="section-heading text-4xl md:text-5xl font-black mb-8">
            About the <span className="text-accent">Company.</span>
          </h2>

          <p className="text-black/70 dark:text-white/70 leading-relaxed mb-8">
            {PROFILE.bio}
          </p>

          <h3 className="font-bold text-lg mb-4">What We Work With:</h3>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-3 mb-10"
          >
            {PROFILE.skillsAreList.map((skill) => (
              <motion.li
                key={skill}
                variants={itemVariants}
                className="flex items-center gap-3"
              >
                <span className="w-2 h-2 bg-accent rounded-sm shrink-0" />
                <span className="text-black/80 dark:text-white/80">{skill}</span>
              </motion.li>
            ))}
          </motion.ul>

          <div className="w-full h-1.5 bg-accent rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
