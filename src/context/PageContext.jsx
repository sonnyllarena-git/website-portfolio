import { createContext, useCallback, useContext, useState } from 'react';
import { NAV_LINKS } from '../utils/constants';

const PAGE_ORDER = NAV_LINKS.map((link) => link.to);

const PageNavContext = createContext(null);

export function PageNavProvider({ children }) {
  const [activePage, setActivePage] = useState(PAGE_ORDER[0]);
  const [direction, setDirection] = useState('forward');
  const [storeOpen, setStoreOpen] = useState(false);

  const goToPage = useCallback(
    (id) => {
      if (!PAGE_ORDER.includes(id) || id === activePage) return;
      const nextDirection = PAGE_ORDER.indexOf(id) > PAGE_ORDER.indexOf(activePage) ? 'forward' : 'backward';
      setDirection(nextDirection);
      setActivePage(id);
    },
    [activePage]
  );

  const openStore = useCallback(() => setStoreOpen(true), []);
  const closeStore = useCallback(() => setStoreOpen(false), []);

  return (
    <PageNavContext.Provider
      value={{ activePage, direction, goToPage, pageOrder: PAGE_ORDER, storeOpen, openStore, closeStore }}
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
