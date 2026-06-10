interface SynchroscopeProps {
  /** Phase angle in degrees, -180..180. 0 = in phase (12 o'clock). */
  angleDeg: number;
  /** Slip frequency in Hz (genset minus bus). Positive = FAST. */
  slipHz: number;
  /** Genset currently synchronizing, e.g. "DG2" — null when idle. */
  activeUnit: string | null;
  size?: number;
  labels: { fast: string; slow: string; idle: string; closing: string };
  /** True for the final moment before breaker close. */
  closing?: boolean;
}

/**
 * Marine switchboard synchroscope. The needle shows phase difference
 * between the incoming generator and the live busbar; it rotates at the
 * slip frequency and the breaker may close when it sits inside the
 * window at 12 o'clock.
 */
const Synchroscope = ({
  angleDeg,
  slipHz,
  activeUnit,
  size = 210,
  labels,
  closing = false,
}: SynchroscopeProps) => {
  const c = size / 2;
  const rOuter = c - 8;
  const rTick = rOuter - 6;
  const active = activeUnit !== null;

  // Sync window: ±15° around top.
  const windowDeg = 15;
  const arc = (a1: number, a2: number, r: number) => {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = c + r * Math.cos(toRad(a1));
    const y1 = c + r * Math.sin(toRad(a1));
    const x2 = c + r * Math.cos(toRad(a2));
    const y2 = c + r * Math.sin(toRad(a2));
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  const needleColor = closing
    ? "hsl(150, 70%, 55%)"
    : active
    ? "hsl(var(--primary))"
    : "hsl(210, 15%, 35%)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Bezel */}
          <circle cx={c} cy={c} r={rOuter} fill="hsl(var(--background))" fillOpacity={0.7}
            stroke="hsl(var(--border))" strokeWidth={1.5} />
          <circle cx={c} cy={c} r={rOuter - 3} fill="none"
            stroke="hsl(var(--border))" strokeWidth={0.5} strokeOpacity={0.5} />

          {/* Sync window arc at 12 o'clock */}
          <path d={arc(-windowDeg, windowDeg, rTick - 2)} fill="none"
            stroke="hsl(150, 70%, 55%)" strokeWidth={5}
            strokeOpacity={active ? 0.85 : 0.25} strokeLinecap="round" />

          {/* Ticks every 30°, minor every 10° */}
          {Array.from({ length: 36 }).map((_, i) => {
            const a = i * 10;
            const major = a % 30 === 0;
            const rad = ((a - 90) * Math.PI) / 180;
            const r1 = rTick;
            const r2 = rTick - (major ? 9 : 4);
            return (
              <line
                key={a}
                x1={c + r1 * Math.cos(rad)} y1={c + r1 * Math.sin(rad)}
                x2={c + r2 * Math.cos(rad)} y2={c + r2 * Math.sin(rad)}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={major ? 1.4 : 0.8}
                strokeOpacity={major ? 0.6 : 0.3}
              />
            );
          })}

          {/* SLOW / FAST direction labels */}
          <text x={c - rTick + 16} y={c + 4} textAnchor="middle"
            className="fill-muted-foreground" fontSize={9}
            fontFamily="monospace" letterSpacing={1} opacity={0.7}>
            {labels.slow}
          </text>
          <text x={c + rTick - 16} y={c + 4} textAnchor="middle"
            className="fill-muted-foreground" fontSize={9}
            fontFamily="monospace" letterSpacing={1} opacity={0.7}>
            {labels.fast}
          </text>
          <text x={c} y={c - rTick + 20} textAnchor="middle"
            fill="hsl(150, 70%, 55%)" fontSize={10} fontFamily="monospace"
            opacity={active ? 0.9 : 0.35}>
            0°
          </text>

          {/* Needle */}
          <g
            style={{
              transform: `rotate(${active ? angleDeg : 45}deg)`,
              transformOrigin: `${c}px ${c}px`,
              transition: active ? "none" : "transform 1.2s ease",
            }}
          >
            <line x1={c} y1={c + 14} x2={c} y2={c - rTick + 14}
              stroke={needleColor} strokeWidth={2.5} strokeLinecap="round"
              style={{ filter: active ? `drop-shadow(0 0 4px ${needleColor})` : "none" }} />
            <polygon
              points={`${c - 4},${c - rTick + 22} ${c + 4},${c - rTick + 22} ${c},${c - rTick + 10}`}
              fill={needleColor}
            />
          </g>

          {/* Hub */}
          <circle cx={c} cy={c} r={7} fill="hsl(var(--card))"
            stroke={needleColor} strokeWidth={1.5} />
          <circle cx={c} cy={c} r={2} fill={needleColor} />
        </svg>

        {/* Slip readout */}
        <div className="absolute inset-x-0 bottom-5 flex flex-col items-center pointer-events-none">
          <span className="font-mono text-[10px] tabular-nums"
            style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
            {active ? `${slipHz >= 0 ? "+" : ""}${slipHz.toFixed(2)} Hz` : "—"}
          </span>
        </div>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-center">
        {closing ? (
          <span className="text-[hsl(150,70%,55%)] animate-pulse">{labels.closing}</span>
        ) : active ? (
          <span className="text-primary">{activeUnit}</span>
        ) : (
          <span className="text-muted-foreground/60">{labels.idle}</span>
        )}
      </div>
    </div>
  );
};

export default Synchroscope;
