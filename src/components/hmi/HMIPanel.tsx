import { cn } from "@/lib/utils";

interface HMIPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const HMIPanel = ({ title, children, className, glowColor = "hsl(200, 100%, 50%)" }: HMIPanelProps) => {
  return (
    <div
      className={cn(
        "relative rounded-sm overflow-hidden",
        "bg-[hsl(210,20%,8%)]",
        className
      )}
      style={{
        border: `1px solid hsl(210, 15%, 20%)`,
        boxShadow: `inset 0 1px 0 hsl(210, 15%, 25%), 0 0 20px hsl(210, 25%, 5%)`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`,
          boxShadow: `0 0 10px ${glowColor}`,
        }}
      />
      {title && (
        <div
          className="px-4 py-2 border-b font-mono text-xs uppercase tracking-[0.2em]"
          style={{
            borderColor: "hsl(210, 15%, 18%)",
            color: glowColor,
            textShadow: `0 0 8px ${glowColor}`,
            background: "hsl(210, 20%, 6%)",
          }}
        >
          {title}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default HMIPanel;
