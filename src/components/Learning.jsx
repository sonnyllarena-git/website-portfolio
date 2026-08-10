import { motion } from 'framer-motion';
import { FiBookOpen } from 'react-icons/fi';

export default function Learning() {
  return (
    <section id="learning" className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Learning &amp; <span className="text-accent">Courses</span>
        </h2>
        <p className="text-black/70 dark:text-white/70 mb-10">
          Expanding knowledge and skills, one course at a time.
        </p>

        <div className="card-hover flex flex-col items-center gap-4 py-16 px-8 rounded-2xl border-2 border-dashed border-border-light dark:border-white/15">
          <FiBookOpen size={40} className="text-accent" />
          <p className="text-lg font-semibold">More courses coming soon</p>
          <p className="text-sm text-black/60 dark:text-white/60 max-w-sm">
            This section will showcase certifications, courses, and learning
            milestones as they're completed.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
