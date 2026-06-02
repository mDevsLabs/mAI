import { findMatchingRoute } from '~common/routes';

import { invoke } from './invoke';

const SAFE_EXTERNAL_PROTOCOLS = new Set(['mailto:', 'tel:']);

const interceptRoute = async (path: string, source: 'link-click', url: string) => {
  console.info(`[preload] Intercepted ${source} and prevented default behavior:`, path);

  // Use electron-client-ipc's dispatch method
  try {
    await invoke('windows.interceptRoute', { path, source, url });
  } catch (e) {
    console.error(`[preload] Route interception (${source}) call failed`, e);
  }
};

/**
 * Route interceptor - Responsible for capturing and intercepting client-side route navigation
 */
export const setupRouteInterceptors = function () {
  console.info('[preload] Setting up route interceptors');

  // Intercept all a tag click events - For Next.js Link component
  document.addEventListener(
    'click',
    async (e) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.href) {
        try {
          const url = new URL(link.href);

          if (SAFE_EXTERNAL_PROTOCOLS.has(url.protocol)) {
            console.info(`[preload] Intercepted external link click:`, url.href);
            e.preventDefault();
            e.stopPropagation();
            await invoke('system.openExternalLink', url.href);
            return false;
          }

          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.warn('[preload] Blocked unsupported link protocol:', url.protocol);
            e.preventDefault();
            e.stopPropagation();
            return false;
          }

          // Check if it's an external link
          if (url.origin !== window.location.origin) {
            console.info(`[preload] Intercepted external link click:`, url.href);
            // Prevent default link navigation behavior
            e.preventDefault();
            e.stopPropagation();
            // Call main process to handle external link
            await invoke('system.openExternalLink', url.href);
            return false; // Explicitly prevent subsequent processing
          }

          // If not external link, continue with internal route interception logic
          // Use shared config to check if interception is needed
          const matchedRoute = findMatchingRoute(url.pathname);

          // If it's a path that needs interception
          if (matchedRoute) {
            const currentPath = window.location.pathname;
            const isAlreadyInTargetPage = currentPath.startsWith(matchedRoute.pathPrefix);

            // If already in target page, don't intercept, let default navigation continue
            if (isAlreadyInTargetPage) return;

            // Immediately prevent default behavior to avoid Next.js taking over routing
            e.preventDefault();
            e.stopPropagation();

            await interceptRoute(url.pathname, 'link-click', link.href);

            return false;
          }
        } catch (err) {
          // Handle possible URL parsing errors or other issues
          if (err instanceof TypeError && err.message.includes('Invalid URL')) {
            console.warn('[preload] Ignored invalid link URL:', link.href);
          } else {
            console.error('[preload] Link interception error:', err);
          }
        }
      }
    },
    true,
  );

  console.info('[preload] Route interceptors setup completed');
};
