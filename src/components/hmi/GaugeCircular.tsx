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

  // Rolling 5-minute history for min/max indicators
  const historyRef = useRef<{ v: number; t: number }[]>([]);
  useEffect(() => {
    const now = Date.now();
    historyRef.current.push({ v: value, t: now });
    const cutoff = now - 5 * 60 * 1000;
    historyRef.current = historyRef.current.filter(p => p.t > cutoff);
  }, [value]);

  const hist = historyRef.current;
  const minVal = hist.length >= 8 ? Math.min(...hist.map(p => p.v)) : null;
  const maxVal = hist.length >= 8 ? Math.max(...hist.map(p => p.v)) : null;
  const showMinMax =
    minVal !== null &&
    maxVal !== null &&
    (maxVal - minVal) / max >= 0.02;

  const valueToAngle = (v: number) =>
    startAngle + (Math.min(Math.max(v, 0), max) / max) * sweepAngle;

  const arcPath = (a1Deg: number, a2Deg: number, r: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const cx = size / 2;
    const cy = size / 2;
    const x1 = cx + r * Math.cos(toRad(a1Deg));
    const y1 = cy + r * Math.sin(toRad(a1Deg));
    const x2 = cx + r * Math.cos(toRad(a2Deg));
    const y2 = cy + r * Math.sin(toRad(a2Deg));
    const large = a2Deg - a1Deg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const marker = (angleDeg: number, fill: string, opacity: number) => {
    const θ = (angleDeg * Math.PI) / 180;
    const cx = size / 2;
    const cy = size / 2;
    const hw = size > 100 ? 3 : 2.5;
    const tipR = radius - 2;
    const baseR = radius + 7;
    const px = Math.cos(θ + Math.PI / 2);
    const py = Math.sin(θ + Math.PI / 2);
    const tip = `${cx + tipR * Math.cos(θ)},${cy + tipR * Math.sin(θ)}`;
    const bL = `${cx + baseR * Math.cos(θ) + hw * px},${cy + baseR * Math.sin(θ) + hw * py}`;
    const bR = `${cx + baseR * Math.cos(θ) - hw * px},${cy + baseR * Math.sin(θ) - hw * py}`;
    return <polygon points={`${tip} ${bL} ${bR}`} fill={fill} fillOpacity={opacity} />;
  };

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
          {/* 5-min range arc (thin band just outside the track) */}
          {showMinMax && (
            <path
              d={arcPath(valueToAngle(minVal!), valueToAngle(maxVal!), radius + 5)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeOpacity={0.28}
              strokeLinecap="round"
            />
          )}
          {/* Min marker — cool slate triangle */}
          {showMinMax && marker(valueToAngle(minVal!), "hsl(210, 20%, 65%)", 0.65)}
          {/* Max marker — warm amber triangle */}
          {showMinMax && marker(valueToAngle(maxVal!), "hsl(38, 80%, 65%)", 0.70)}
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
