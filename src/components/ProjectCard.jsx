import { FiGithub } from 'react-icons/fi';

export default function ProjectCard({ project }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-2xl md:text-3xl font-black">{project.title}</h3>
      <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
        {project.description}
      </p>

      <span className="inline-flex items-center gap-2 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
        ✨ {project.keyMetric}
      </span>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
          Key Features
        </h4>
        <ul className="grid grid-cols-2 gap-2">
          {project.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-xs text-black/70 dark:text-white/70 bg-black/5 dark:bg-white/5 rounded-lg px-2.5 py-1.5"
            >
              <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
          Tech Stack
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="text-xs font-medium px-3 py-1 rounded-full border border-accent text-accent"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 dark:text-white/50">
          Screenshots & Videos
        </h4>
        <div className="rounded-xl bg-black/5 dark:bg-white/5 px-6 py-7 text-center text-xs text-black/40 dark:text-white/40">
          Project screenshots & demo videos coming soon
        </div>
      </div>

      <a
        href={project.github}
        target="_blank"
        rel="noopener noreferrer"
        className="project-github-neon inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold w-fit"
      >
        <FiGithub size={16} />
        View on GitHub
      </a>
    </div>
  );
}
