import { motion } from 'framer-motion';

const CARD_EASE = [0.34, 1.56, 0.64, 1];

const LAYER_STYLES = [
  { scale: 1, y: 0, opacity: 1 },
  { scale: 0.9, y: -52, opacity: 0.6 },
  { scale: 0.82, y: -100, opacity: 0.4 },
  { scale: 0.76, y: -143, opacity: 0.25 },
];

export default function LogoStack({ projects, currentProject, onSelect }) {
  const total = projects.length;

  return (
    <div className="relative w-[280px] h-[320px] md:w-[380px] md:h-[440px]">
      {projects.map((project, index) => {
        const layer = ((index - currentProject) % total + total) % total;
        const { scale, y, opacity } = LAYER_STYLES[layer] ?? LAYER_STYLES[LAYER_STYLES.length - 1];
        const isFront = layer === 0;

        return (
          <motion.button
            key={project.id}
            type="button"
            onClick={() => !isFront && onSelect(index)}
            aria-label={isFront ? undefined : `Go to ${project.title}`}
            initial={false}
            animate={{ scale, y, opacity }}
            whileHover={isFront ? undefined : { scale: scale + 0.01, opacity: opacity + 0.05 }}
            transition={{ duration: 0.4, ease: CARD_EASE }}
            style={{ zIndex: total - layer }}
            className={`group absolute inset-0 rounded-2xl overflow-hidden shadow-2xl ${
              isFront ? 'cursor-default' : 'cursor-pointer'
            }`}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {isFront && (
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-5 opacity-100 group-hover:opacity-10 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">{project.title}</span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
