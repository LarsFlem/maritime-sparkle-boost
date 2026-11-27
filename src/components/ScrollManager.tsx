import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToSection, type ScrollState } from "@/lib/scroll";

/**
 * Keeps scroll position predictable across route changes:
 * - a new page opens at the top instead of inheriting the previous page's scroll offset;
 * - a link that carries `state.scrollTo` lands on that section of the new page.
 */
const ScrollManager = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const target = (location.state as ScrollState)?.scrollTo;

  useLayoutEffect(() => {
    if (!target) window.scrollTo(0, 0);
    // Only on page changes; same-page section jumps are handled by the link itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!target) return;
    // Wait a frame so the new page has laid out before measuring the section,
    // then clear the state so reload or back/forward does not jump again.
    const raf = requestAnimationFrame(() => {
      scrollToSection(target);
      navigate(location.pathname, { replace: true, state: null });
    });
    return () => cancelAnimationFrame(raf);
  }, [target, location.pathname, navigate]);

  return null;
};

export default ScrollManager;
