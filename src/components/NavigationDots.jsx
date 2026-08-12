import { useState } from 'react';

export default function NavigationDots({ projects, currentProject, onSelect }) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <>
      {/* Desktop: dot on the left, clickable titles reveal to the right on hover of the list */}
      <div
        className="hidden md:flex flex-col items-start gap-3"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to ${project.title}`}
            className="flex items-center gap-3 h-9"
          >
            <span
              className={`shrink-0 rounded-full transition-all duration-300 ease-in-out ${
                index === currentProject
                  ? 'w-1.5 h-9 bg-accent shadow-[0_0_10px_rgba(255,107,53,0.5)]'
                  : 'w-1.5 h-5 bg-black/20 dark:bg-white/20 hover:bg-accent/60 hover:h-6'
              }`}
            />

            <span
              className={`overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 ease-in-out ${
                isHovering ? 'max-w-[14rem] opacity-100' : 'max-w-0 opacity-0'
              } ${
                index === currentProject
                  ? 'text-accent'
                  : 'text-black/60 dark:text-white/60'
              }`}
            >
              {project.title}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile: horizontal pill dots, no hover/title state */}
      <div className="flex md:hidden items-center gap-3">
        {projects.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to ${project.title}`}
            className={`h-1.5 rounded-full transition-all duration-300 ease-in-out ${
              index === currentProject
                ? 'w-9 bg-accent'
                : 'w-5 bg-black/20 dark:bg-white/20'
            }`}
          />
        ))}
      </div>
    </>
  );
}
