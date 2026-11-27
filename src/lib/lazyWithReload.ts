import { lazy, type ComponentType } from "react";

// Every deploy renames the lazy chunks, and GitHub Pages caches index.html
// for ten minutes. A tab opened before a deploy therefore asks for chunk files
// that no longer exist, and the import fails. Reload once to pick up the new
// index.html; the session flag stops a genuinely broken chunk from looping.
const RELOAD_FLAG = "chunk-reload-attempted";
export const lazyWithReload = (load: () => Promise<{ default: ComponentType }>) =>
  lazy(() =>
    load().then(
      (module) => {
        try { sessionStorage.removeItem(RELOAD_FLAG); } catch { /* storage unavailable */ }
        return module;
      },
      (error) => {
        let alreadyTried = true;
        try {
          alreadyTried = sessionStorage.getItem(RELOAD_FLAG) === "1";
          if (!alreadyTried) sessionStorage.setItem(RELOAD_FLAG, "1");
        } catch { /* storage unavailable: do not risk a reload loop */ }
        if (alreadyTried) throw error;
        window.location.reload();
        // Keep the route spinner up until the reload takes over.
        return new Promise<never>(() => {});
      },
    ),
  );
