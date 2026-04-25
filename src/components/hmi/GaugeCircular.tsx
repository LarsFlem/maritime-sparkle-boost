import { useEffect, useRef } from "react";

interface GaugeCircularProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  size?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

const GaugeCircular = ({
  value,
  max,
  label,
  unit,
  color = "hsl(200, 100%, 50%)",
  size = 140,
  warningThreshold = 70,
  criticalThreshold = 90,
}: GaugeCircularProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const startAngle = 135;
  const sweepAngle = 270;
  const arcLength = (sweepAngle / 360) * circumference;
  const filledLength = (percentage / 100) * arcLength;

  const getColor = () => {
    if (percentage >= criticalThreshold) return "hsl(0, 70%, 55%)";
    if (percentage >= warningThreshold) return "hsl(38, 92%, 60%)";
    return color;
  };

  const activeColor = getColor();

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={8}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={-((360 - sweepAngle) / 2 / 360) * circumference + circumference / 4}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          />
          {/* Value arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={activeColor}
            strokeWidth={8}
            strokeDasharray={`${filledLength} ${circumference - filledLength}`}
            strokeDashoffset={-((360 - sweepAngle) / 2 / 360) * circumference + circumference / 4}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
            style={{
              filter: `drop-shadow(0 0 2px ${activeColor}66)`,
              transition: "stroke-dasharray 0.5s ease, stroke 0.3s ease",
            }}
          />
          {/* Major tick marks at 0%, 25%, 50%, 75%, 100% */}
          {[0, 25, 50, 75, 100].map(pct => {
            const rad = ((135 + (pct / 100) * 270) * Math.PI) / 180;
            const cx = size / 2;
            const cy = size / 2;
            return (
              <line
                key={pct}
                x1={cx + (radius + 2) * Math.cos(rad)}
                y1={cy + (radius + 2) * Math.sin(rad)}
                x2={cx + (radius - 4) * Math.cos(rad)}
                y2={cy + (radius - 4) * Math.sin(rad)}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeOpacity={0.35}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-mono text-xl font-semibold tabular-nums"
            style={{ color: activeColor }}
          >
            {typeof value === "number" ? value.toFixed(1) : value}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{unit}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
};

export default GaugeCircular;
