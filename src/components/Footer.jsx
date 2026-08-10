import { PROFILE, SOCIAL_LINKS, NAV_LINKS } from '../utils/constants';
import { usePageNav } from '../context/PageContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { activePage, goToPage } = usePageNav();

  return (
    <footer className="border-t border-border-light dark:border-white/10 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-black/60 dark:text-white/60">
          &copy; {year} {PROFILE.name}. All rights reserved.
        </p>

        <ul className="flex flex-wrap items-center gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <button
                onClick={() => goToPage(link.to)}
                className={`link-hover text-sm ${
                  activePage === link.to
                    ? 'text-accent'
                    : 'text-black/70 dark:text-white/70'
                }`}
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.url || '#'}
              target={social.url ? '_blank' : undefined}
              rel={social.url ? 'noopener noreferrer' : undefined}
              aria-label={social.name}
              className="text-black/60 dark:text-white/60 hover:text-accent hover:scale-110 transition-all duration-300 ease-in-out"
            >
              <social.icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
