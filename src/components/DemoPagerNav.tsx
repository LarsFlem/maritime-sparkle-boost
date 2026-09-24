import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ORDER = [
  { to: "/pms", key: "nav.pms" },
  { to: "/dp", key: "nav.dp" },
  { to: "/live-demo", key: "nav.liveDemo" },
  { to: "/engine-room", key: "nav.engine" },
  { to: "/hmi", key: "nav.hmi" },
  { to: "/data-analysis", key: "nav.dataAnalysis" },
];

/** Prev / next navigation chaining the demo pages into a guided tour. */
const DemoPagerNav = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const idx = ORDER.findIndex((d) => d.to === location.pathname);
  if (idx === -1) return null;
  const prev = ORDER[(idx + ORDER.length - 1) % ORDER.length];
  const next = ORDER[(idx + 1) % ORDER.length];

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/40 px-4 py-3">
      <Link to={prev.to}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors min-w-0">
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{t(prev.key)}</span>
      </Link>
      <Link to="/"
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors shrink-0">
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("nav.allDemos")}</span>
      </Link>
      <Link to={next.to}
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-foreground hover:text-primary transition-colors min-w-0">
        <span className="truncate">{t("nav.nextDemo")}: {t(next.key)}</span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </Link>
    </div>
  );
};

export default DemoPagerNav;
