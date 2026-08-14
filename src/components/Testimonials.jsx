import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { TESTIMONIALS } from '../data/testimonials';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Testimonials() {
  return (
    <section id="testimonials" className="min-h-[calc(100vh-1px)] flex flex-col justify-center py-24 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-10 text-center"
        >
          <span className="text-accent">What They Say</span>
        </motion.h2>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.id}
              variants={cardVariants}
              className="card-hover flex flex-col rounded-2xl border border-white/10 bg-bg-dark p-6"
            >
              <div className="flex gap-1 mb-3 text-accent">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <FiStar key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <blockquote className="text-sm text-white/70 flex-1 mb-4 leading-relaxed">
                “{t.quote}”
              </blockquote>
              <figcaption>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
