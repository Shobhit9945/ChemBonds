import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query. Returns whether it currently matches.
 * SSR-safe: initial value falls back to `false` if `window` is unavailable.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport is phone-sized (Tailwind `md` breakpoint). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}
