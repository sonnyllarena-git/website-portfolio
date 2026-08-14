import { NAV_LINKS } from '../utils/constants';

const TICK_HEIGHTS = [10, 14, 10, 16, 10, 18, 10];

export default function HudNavToggle({ activePage, onNavigate }) {
  return (
    <nav className="group flex items-center border border-white/10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full transition-all duration-500">
      <div className="flex items-center gap-1 h-4 group-hover:hidden" aria-hidden="true">
        {NAV_LINKS.map((link, i) => (
          <span
            key={link.to}
            className="hud-ruler-tick"
            style={{
              height: TICK_HEIGHTS[i % TICK_HEIGHTS.length],
              opacity: link.to === activePage ? 1 : 0.4,
            }}
          />
        ))}
      </div>

      <ul className="hidden group-hover:flex items-center gap-6 text-xs font-mono tracking-widest uppercase whitespace-nowrap">
        {NAV_LINKS.map((link) => (
          <li key={link.to}>
            <button
              type="button"
              onClick={() => onNavigate(link.to)}
              className={`transition-colors ${
                activePage === link.to ? 'text-accent' : 'text-white/70 hover:text-accent'
              }`}
            >
              {link.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
