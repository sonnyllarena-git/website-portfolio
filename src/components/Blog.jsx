import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../data/blogPosts';

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function Blog() {
  return (
    <section id="blog" className="min-h-[calc(100vh-1px)] flex flex-col justify-center py-24 px-6">
      <div className="max-w-5xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-black mb-10 text-center"
        >
          <span className="text-accent">Blog</span>
        </motion.h2>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {BLOG_POSTS.map((post) => (
            <motion.article
              key={post.id}
              variants={cardVariants}
              className="card-hover flex flex-col rounded-2xl border border-white/10 bg-bg-dark p-6"
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 self-start rounded-full border border-accent/40 px-2.5 py-1">
                {post.tag}
              </span>
              <h3 className="text-lg font-bold mb-2 leading-snug">{post.title}</h3>
              <p className="text-sm text-white/60 mb-4 flex-1">{post.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{formatDate(post.date)}</span>
                <span className="text-accent">Read more →</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
