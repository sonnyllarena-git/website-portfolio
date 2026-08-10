import { PROFILE, SOCIAL_LINKS } from '../utils/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-md border-t border-border-light dark:border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 flex-wrap py-2.5 px-6">
        <p className="text-xs text-black/50 dark:text-white/50 text-center">
          &copy; {year} {PROFILE.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.url || '#'}
              target={social.url ? '_blank' : undefined}
              rel={social.url ? 'noopener noreferrer' : undefined}
              aria-label={social.name}
              className="text-black/40 dark:text-white/40 hover:text-accent hover:scale-110 transition-all duration-300 ease-in-out"
            >
              <social.icon size={13} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
