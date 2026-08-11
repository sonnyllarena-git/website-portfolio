import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiCopy } from 'react-icons/fi';

const EMAIL = 'llarenasonny@yahoo.com';

export default function RevealEmailButton() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleReveal = () => setIsRevealed((prev) => !prev);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleReveal();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full mt-8">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isRevealed}
        aria-label={isRevealed ? 'Hide email address' : 'Reveal email address'}
        onClick={toggleReveal}
        onKeyDown={handleKeyDown}
        className={`group relative w-full h-28 rounded-full border-2 cursor-pointer transition-colors duration-500 ease-in-out ${
          isRevealed
            ? 'email-reveal-neon bg-accent border-accent'
            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/15 hover:-translate-y-1 hover:border-accent'
        }`}
      >
        {!isRevealed && (
          <span className="absolute inset-0 flex items-center pl-[108px] pr-6 text-sm font-semibold text-black/50 dark:text-white/60">
            Reveal email address
          </span>
        )}

        {isRevealed && (
          <span className="absolute inset-0 flex items-center pl-6 pr-[168px] text-sm sm:text-base text-white font-medium select-all cursor-text truncate">
            {EMAIL}
          </span>
        )}

        {isRevealed && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            onKeyDown={(e) => e.stopPropagation()}
            title="Copy email address"
            aria-label="Copy email address"
            className="absolute right-[108px] top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white text-accent transition-transform duration-200 ease-in-out hover:scale-110 active:scale-95"
          >
            {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
          </button>
        )}

        <motion.span
          className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 rounded-full border transition-colors duration-300 ease-in-out ${
            isRevealed
              ? 'bg-white border-black/5'
              : 'bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10 group-hover:bg-white'
          }`}
          animate={{ left: isRevealed ? 'calc(100% - 96px)' : '16px' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <FiArrowRight
            size={20}
            className={`transition-transform duration-500 ease-in-out ${
              isRevealed
                ? 'rotate-180 text-accent'
                : 'text-black/40 dark:text-white/40 group-hover:text-accent group-hover:scale-110'
            }`}
          />
        </motion.span>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-9 px-4 py-2 rounded-md bg-green-500 text-white text-xs font-semibold shadow-lg whitespace-nowrap z-10"
          >
            Copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
