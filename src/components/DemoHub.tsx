import { Link } from "react-router-dom";
import { ArrowRight, Zap, Crosshair, Construction, Gauge, LineChart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";

/* ── Lightweight animated SVG previews (pure CSS, no sim) ── */

const PreviewPMS = () => (
  <svg viewBox="0 0 200 110" className="w-full h-full">
    {/* Gensets */}
    {[55, 145].map((x, i) => (
      <g key={x}>
        <circle cx={x} cy={24} r={13} fill="none" stroke="hsl(200,100%,60%)" strokeWidth={1.4} strokeOpacity={0.9} />
        <text x={x} y={28} textAnchor="middle" fontSize={10} fontFamily="monospace" fill="hsl(200,100%,60%)">G</text>
        <circle cx={x} cy={24} r={17} fill="none" stroke="hsl(200,100%,60%)" strokeWidth={0.8}
          strokeOpacity={0.4} strokeDasharray="3 9" className="sld-spin" style={{ transformOrigin: `${x}px 24px`, animationDelay: `${i * -2}s` }} />
        <line x1={x} y1={37} x2={x} y2={62} stroke="hsl(200,100%,60%)" strokeOpacity={0.35} strokeWidth={1.2} />
        <line x1={x} y1={37} x2={x} y2={62} stroke="hsl(200,100%,60%)" strokeWidth={1.4}
          strokeDasharray="2 7" strokeLinecap="round" className="sld-flow" style={{ animationDelay: `${i * -0.4}s` }} />
      </g>
    ))}
    {/* Bus */}
    <line x1={20} y1={62} x2={180} y2={62} stroke="hsl(200,100%,60%)" strokeWidth={2.5} strokeOpacity={0.85} />
    {/* Consumers */}
    {[40, 100, 160].map((x, i) => (
      <g key={x}>
        <line x1={x} y1={62} x2={x} y2={86} stroke="hsl(200,100%,60%)" strokeOpacity={0.35} strokeWidth={1.2} />
        <line x1={x} y1={62} x2={x} y2={86} stroke="hsl(200,100%,60%)" strokeWidth={1.2}
          strokeDasharray="2 7" strokeLinecap="round" className="sld-flow" style={{ animationDelay: `${i * -0.7}s` }} />
        <circle cx={x} cy={94} r={8} fill="none" stroke="hsl(180,100%,55%)" strokeWidth={1.2} strokeOpacity={0.8} />
        <text x={x} y={97.5} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="hsl(180,100%,55%)">M</text>
      </g>
    ))}
  </svg>
);

const PreviewDP = () => (
  <svg viewBox="0 0 200 110" className="w-full h-full">
    <g>
      {[14, 28, 42].map((r) => (
        <circle key={r} cx={100} cy={55} r={r} fill="none" stroke="hsl(200,100%,60%)" strokeWidth={0.7}
          strokeOpacity={r === 42 ? 0.5 : 0.25} strokeDasharray={r === 28 ? "4 4" : undefined} />
      ))}
      <line x1={52} y1={55} x2={148} y2={55} stroke="hsl(200,100%,60%)" strokeOpacity={0.2} strokeWidth={0.7} />
      <line x1={100} y1={7} x2={100} y2={103} stroke="hsl(200,100%,60%)" strokeOpacity={0.2} strokeWidth={0.7} />
      {/* Sweep */}
      <g className="dp-sweep" style={{ transformOrigin: "100px 55px" }}>
        <path d="M 100 55 L 100 13 A 42 42 0 0 1 120 18 Z" fill="hsl(200,100%,60%)" fillOpacity={0.12} />
      </g>
      {/* Setpoint */}
      <g stroke="hsl(150,70%,55%)" strokeWidth={1}>
        <line x1={96} y1={55} x2={104} y2={55} />
        <line x1={100} y1={51} x2={100} y2={59} />
      </g>
      {/* Vessel */}
      <g className="demo-drift" style={{ transformOrigin: "100px 55px" }}>
        <polygon points="100,40 106,48 106,64 94,64 94,48"
          fill="hsl(200,100%,65%)" fillOpacity={0.25} stroke="hsl(200,100%,65%)" strokeWidth={1.3}
          transform="rotate(14 100 55)" />
      </g>
      {/* Env arrow */}
      <line x1={32} y1={20} x2={50} y2={34} stroke="hsl(180,100%,55%)" strokeWidth={1.4} strokeOpacity={0.8} />
      <polygon points="52,36 44,33 48,28" fill="hsl(180,100%,55%)" fillOpacity={0.8} />
    </g>
  </svg>
);

const PreviewCrane = () => (
  <svg viewBox="0 0 200 110" className="w-full h-full">
    {/* Deck + pedestal + boom */}
    <line x1={10} y1={96} x2={190} y2={96} stroke="hsl(200,100%,60%)" strokeOpacity={0.4} strokeWidth={1.5} />
    <rect x={138} y={62} width={12} height={34} fill="none" stroke="hsl(200,100%,60%)" strokeWidth={1.3} strokeOpacity={0.8} />
    <line x1={144} y1={62} x2={52} y2={28} stroke="hsl(200,100%,60%)" strokeWidth={1.6} strokeOpacity={0.9} />
    <line x1={144} y1={62} x2={100} y2={28} stroke="hsl(200,100%,60%)" strokeWidth={0.8} strokeOpacity={0.4} />
    {/* Swinging cable + container */}
    <g className="demo-sway" style={{ transformOrigin: "62px 31px" }}>
      <line x1={62} y1={31} x2={62} y2={68} stroke="hsl(180,100%,55%)" strokeWidth={1} strokeOpacity={0.9} />
      <rect x={51} y={68} width={22} height={12} rx={1.5}
        fill="hsl(38,85%,60%)" fillOpacity={0.25} stroke="hsl(38,85%,60%)" strokeWidth={1.2} />
    </g>
    {/* Water */}
    <path d="M 10 103 Q 30 100 50 103 T 90 103 T 130 103 T 170 103 T 195 103"
      fill="none" stroke="hsl(180,100%,55%)" strokeWidth={1} strokeOpacity={0.4} />
  </svg>
);

const PreviewHMI = () => (
  <svg viewBox="0 0 200 110" className="w-full h-full">
    {/* Gauge */}
    <path d="M 25 62 A 30 30 0 1 1 85 62" fill="none" stroke="hsl(var(--border))" strokeWidth={5} strokeLinecap="round" />
    <path d="M 25 62 A 30 30 0 0 1 55 32" fill="none" stroke="hsl(200,100%,60%)" strokeWidth={5} strokeLinecap="round" />
    <g className="demo-needle" style={{ transformOrigin: "55px 62px" }}>
      <line x1={55} y1={62} x2={55} y2={38} stroke="hsl(180,100%,55%)" strokeWidth={1.6} strokeLinecap="round" />
    </g>
    <circle cx={55} cy={62} r={2.5} fill="hsl(180,100%,55%)" />
    {/* Sparkline */}
    <polyline points="105,72 117,60 129,66 141,46 153,54 165,40 177,30"
      fill="none" stroke="hsl(200,100%,60%)" strokeWidth={1.6} strokeLinejoin="round"
      strokeOpacity={0.9} />
    {/* Status dots */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <circle cx={112 + i * 26} cy={90} r={3}
          fill={i === 1 ? "hsl(38,85%,60%)" : "hsl(150,70%,55%)"}>
          <animate attributeName="opacity" values="1;0.4;1" dur={`${1.6 + i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      </g>
    ))}
  </svg>
);

const PreviewData = () => (
  <svg viewBox="0 0 200 110" className="w-full h-full">
    {/* Bars */}
    {[28, 56, 84, 112, 140, 168].map((x, i) => (
      <rect key={x} x={x - 8} y={30} width={16} height={60} rx={2}
        fill="hsl(200,100%,60%)" fillOpacity={0.3 + (i % 3) * 0.15}
        className="demo-bar" style={{ transformOrigin: `${x}px 90px`, animationDelay: `${i * -0.45}s` }} />
    ))}
    {/* Trend line */}
    <polyline points="20,66 48,58 76,62 104,44 132,50 160,34 184,38"
      fill="none" stroke="hsl(180,100%,55%)" strokeWidth={1.8} strokeLinejoin="round" />
    <line x1={14} y1={90} x2={186} y2={90} stroke="hsl(var(--border))" strokeWidth={1} />
  </svg>
);

/* ── Section ── */

const DemoHub = () => {
  const { t } = useLanguage();

  const demos = [
    {
      to: "/pms",
      icon: Zap,
      preview: <PreviewPMS />,
      title: t("demos.pms.title"),
      desc: t("demos.pms.desc"),
      tags: t("demos.pms.tags").split("|"),
      featured: true,
    },
    {
      to: "/dp",
      icon: Crosshair,
      preview: <PreviewDP />,
      title: t("demos.dp.title"),
      desc: t("demos.dp.desc"),
      tags: t("demos.dp.tags").split("|"),
      featured: true,
    },
    {
      to: "/live-demo",
      icon: Construction,
      preview: <PreviewCrane />,
      title: t("demos.crane.title"),
      desc: t("demos.crane.desc"),
      tags: t("demos.crane.tags").split("|"),
      featured: false,
    },
    {
      to: "/hmi",
      icon: Gauge,
      preview: <PreviewHMI />,
      title: t("demos.hmi.title"),
      desc: t("demos.hmi.desc"),
      tags: t("demos.hmi.tags").split("|"),
      featured: false,
    },
    {
      to: "/data-analysis",
      icon: LineChart,
      preview: <PreviewData />,
      title: t("demos.data.title"),
      desc: t("demos.data.desc"),
      tags: t("demos.data.tags").split("|"),
      featured: false,
    },
  ];

  return (
    <section id="demos" aria-label="Interactive demos" className="py-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-gradient-radial from-accent/4 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-primary mb-4">{t("demos.kicker")}</p>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-foreground tracking-tight">{t("demos.title")}</h2>
          <div className="section-divider mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("demos.description")}</p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-6 gap-6" staggerDelay={0.1}>
          {demos.map((demo) => (
            <StaggerItem
              key={demo.to}
              className={demo.featured ? "md:col-span-3" : "md:col-span-3 lg:col-span-2"}
            >
              <Link to={demo.to} className="block h-full group">
                <div className="glass-effect hover-lift rounded-xl border-border/30 hover:border-primary/30 border overflow-hidden h-full flex flex-col transition-colors duration-300">
                  {/* Preview console */}
                  <div className="relative bg-background/80 border-b border-border/30 overflow-hidden" style={{ aspectRatio: demo.featured ? "16/7" : "16/8" }}>
                    {/* Console chrome */}
                    <div className="absolute top-2 left-3 flex items-center gap-1.5 z-10">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(150,70%,55%)] animate-pulse" />
                      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/70">LIVE SIM</span>
                    </div>
                    <div className="absolute inset-0 hmi-scanlines pointer-events-none" />
                    <div className="absolute inset-0 p-3 pt-6 transition-transform duration-500 group-hover:scale-[1.04]">
                      {demo.preview}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2.5 mb-2">
                      <demo.icon className="h-4 w-4 text-primary shrink-0" />
                      <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                        {demo.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{demo.desc}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {demo.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-primary/8 text-primary/90 border border-primary/15">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                      {t("demos.launch")}
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default DemoHub;
