import { useEffect, useState, useRef } from 'react';
import { subscribeToolUsage, incrementToolUsage } from '../utils/toolUsageService';

/**
 * Live community usage map: { "/merge-pdf": 123, ... }
 */
export function useToolUsage() {
  const [usageMap, setUsageMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToolUsage((map) => {
      setUsageMap(map);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { usageMap, loading };
}

/**
 * Increment community counter once when a tool page mounts.
 * Use inside any tool component: useTrackToolView("/merge-pdf", "Merge PDF")
 */
export function useTrackToolView(link, title) {
  const tracked = useRef(false);
  useEffect(() => {
    if (!link || tracked.current) return;
    tracked.current = true;
    // slight delay so Firestore init is ready even on hard reload
    const t = setTimeout(() => {
      incrementToolUsage(link, { title }).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [link, title]);
}
