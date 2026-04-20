import { cn } from "@/lib/utils";

interface HMIPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const HMIPanel = ({ title, children, className, glowColor }: HMIPanelProps) => {
  const accent = glowColor ?? "hsl(var(--primary))";
  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-card/60 backdrop-blur-sm border border-border/60",
        className
      )}
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        }}
      />
      {title && (
        <div
          className="px-4 py-2 border-b border-border/40 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground bg-background/40"
        >
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default HMIPanel;
