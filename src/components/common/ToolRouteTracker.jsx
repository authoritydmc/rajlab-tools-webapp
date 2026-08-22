import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { incrementToolUsage } from '../../utils/toolUsageService';
import { TOOL_REGISTRY } from '../../utils/toolRegistry';

/**
 * Global tracker — mounts once inside MainLayout.
 * Increments `tool_usage` whenever the user navigates to a known tool path.
 * Debounced per-path (2s cooldown is also enforced inside the service).
 */
export default function ToolRouteTracker() {
  const location = useLocation();
  const lastPath = useRef('');

  useEffect(() => {
    const path = location.pathname;
    if (!path || path === '/' || path.startsWith('/embed') || path.startsWith('/raw') || path === '/changelog') return;
    if (lastPath.current === path) return;
    lastPath.current = path;

    const info = TOOL_REGISTRY[path];
    if (!info) return;
    // don't await — fire and forget
    incrementToolUsage(path, { title: info.title }).catch(() => {});
  }, [location.pathname]);

  return null;
}
