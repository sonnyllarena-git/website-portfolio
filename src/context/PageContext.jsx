import { createContext, useCallback, useContext, useState } from 'react';
import { NAV_LINKS } from '../utils/constants';

const PAGE_ORDER = NAV_LINKS.map((link) => link.to);
const ROTATION = ['right', 'up', 'left', 'down'];

function baseDirectionFor(index) {
  if (index <= 0) return 'right';
  return ROTATION[(index - 1) % ROTATION.length];
}

function opposite(direction) {
  return { right: 'left', left: 'right', up: 'down', down: 'up' }[direction];
}

const PageNavContext = createContext(null);

export function PageNavProvider({ children }) {
  const [activePage, setActivePage] = useState(PAGE_ORDER[0]);
  const [direction, setDirection] = useState('right');

  const goToPage = useCallback((id) => {
    if (!PAGE_ORDER.includes(id)) return;

    setActivePage((current) => {
      if (current === id) return current;

      const currentIndex = PAGE_ORDER.indexOf(current);
      const targetIndex = PAGE_ORDER.indexOf(id);
      const isForward = targetIndex > currentIndex;
      const nextDirection = isForward
        ? baseDirectionFor(targetIndex)
        : opposite(baseDirectionFor(currentIndex));

      setDirection(nextDirection);
      return id;
    });
  }, []);

  return (
    <PageNavContext.Provider
      value={{ activePage, direction, goToPage, pageOrder: PAGE_ORDER }}
    >
      {children}
    </PageNavContext.Provider>
  );
}

export function usePageNav() {
  const ctx = useContext(PageNavContext);
  if (!ctx) throw new Error('usePageNav must be used within a PageNavProvider');
  return ctx;
}
