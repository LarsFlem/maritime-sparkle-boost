import { Sparkles, Shield, Workflow } from "lucide-react";

interface CraneExplainerProps {
  labels: {
    title: string;
    antiSwayTitle: string;
    antiSwayBody: string;
    safetyTitle: string;
    safetyBody: string;
    sequenceTitle: string;
    sequenceBody: string;
  };
}

const CraneExplainer = ({ labels }: CraneExplainerProps) => {
  const items = [
    {
      icon: <Sparkles className="w-3.5 h-3.5" />,
      title: labels.antiSwayTitle,
      body: labels.antiSwayBody,
      color: "hsl(200, 100%, 60%)",
    },
    {
      icon: <Shield className="w-3.5 h-3.5" />,
      title: labels.safetyTitle,
      body: labels.safetyBody,
      color: "hsl(38, 85%, 60%)",
    },
    {
      icon: <Workflow className="w-3.5 h-3.5" />,
      title: labels.sequenceTitle,
      body: labels.sequenceBody,
      color: "hsl(180, 70%, 55%)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.title}
          className="p-3 rounded border border-border/30 bg-background/20"
          style={{ borderLeftColor: it.color, borderLeftWidth: 2 }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: it.color }}>
            {it.icon}
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
              {it.title}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{it.body}</p>
        </div>
      ))}
    </div>
  );
};

export default CraneExplainer;
