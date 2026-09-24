interface DigitalDisplayProps {
  value: string | number;
  label: string;
  unit?: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const fontSizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };

const DigitalDisplay = ({ value, label, unit, color, size = "md" }: DigitalDisplayProps) => {
  const tone = color ?? "hsl(var(--foreground))";
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono ${fontSizes[size]} font-semibold tabular-nums`}
          style={{ color: tone }}
        >
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
};

export default DigitalDisplay;
