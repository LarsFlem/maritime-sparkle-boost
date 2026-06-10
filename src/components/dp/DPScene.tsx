export interface TrailPoint {
  n: number;
  e: number;
}

interface DPSceneProps {
  /** Vessel offset from setpoint in metres (north, east) — includes wave motion */
  posN: number;
  posE: number;
  headingDeg: number;
  headingSetDeg: number;
  trail: TrailPoint[];
  windKt: number;
  windFromDeg: number;
  currentKt: number;
  currentFromDeg: number;
  /** Watch-circle radii in metres */
  warnRadius: number;
  alarmRadius: number;
  labels: { setpoint: string; wind: string; current: string };
}

const SIZE = 480;
const C = SIZE / 2;
const VIEW_M = 8;            // plot shows ±8 m
const SCALE = (C - 38) / VIEW_M;

const OK = "hsl(150, 70%, 55%)";
const WARN = "hsl(38, 85%, 60%)";
const ALARM = "hsl(0, 70%, 55%)";
const WIND = "hsl(180, 100%, 55%)";
const CURRENT = "hsl(265, 60%, 68%)";

const toXY = (n: number, e: number) => ({ x: C + e * SCALE, y: C - n * SCALE });

const DPScene = ({
  posN, posE, headingDeg, headingSetDeg, trail,
  windKt, windFromDeg, currentKt, currentFromDeg,
  warnRadius, alarmRadius, labels,
}: DPSceneProps) => {
  const vessel = toXY(posN, posE);
  const rOuter = VIEW_M * SCALE;

  // Environment arrows sit on the outer rim, pointing inward (direction FROM)
  const envArrow = (fromDeg: number, color: string, label: string, magnitude: string, show: boolean) => {
    if (!show) return null;
    const rad = ((fromDeg - 90) * Math.PI) / 180;
    const rim = rOuter + 22;
    const x1 = C + rim * Math.cos(rad);
    const y1 = C + rim * Math.sin(rad);
    const x2 = C + (rOuter - 4) * Math.cos(rad);
    const y2 = C + (rOuter - 4) * Math.sin(rad);
    // Arrowhead
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ah = 7;
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeOpacity={0.85} />
        <polygon
          points={`${x2},${y2} ${x2 - ah * Math.cos(ang - 0.4)},${y2 - ah * Math.sin(ang - 0.4)} ${x2 - ah * Math.cos(ang + 0.4)},${y2 - ah * Math.sin(ang + 0.4)}`}
          fill={color}
        />
        <text
          x={C + (rim + 12) * Math.cos(rad)}
          y={C + (rim + 12) * Math.sin(rad)}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={9} fontFamily="monospace" fill={color}
        >
          {label} {magnitude}
        </text>
      </g>
    );
  };

  // Vessel hull polygon (PSV-ish outline) — local coords, bow +y up before rotation
  const hullL = 26;
  const hullW = 11;
  const hull = [
    [0, -hullL * 0.55],            // bow tip
    [hullW / 2, -hullL * 0.25],
    [hullW / 2, hullL * 0.45],
    [-hullW / 2, hullL * 0.45],
    [-hullW / 2, -hullL * 0.25],
  ].map((p) => p.join(",")).join(" ");

  const offM = Math.hypot(posN, posE);
  const vesselColor = offM > alarmRadius ? ALARM : offM > warnRadius ? WARN : "hsl(200, 100%, 65%)";

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[560px] mx-auto" role="img" aria-label="DP position plot">
      {/* Plot background */}
      <circle cx={C} cy={C} r={rOuter} fill="hsl(var(--background))" fillOpacity={0.65}
        stroke="hsl(var(--border))" strokeWidth={1} />

      {/* Radar sweep (cosmetic) */}
      <g className="dp-sweep" style={{ transformOrigin: `${C}px ${C}px` }}>
        <path
          d={`M ${C} ${C} L ${C} ${C - rOuter} A ${rOuter} ${rOuter} 0 0 1 ${C + rOuter * Math.sin(0.5)} ${C - rOuter * Math.cos(0.5)} Z`}
          fill="hsl(200, 100%, 60%)" fillOpacity={0.05}
        />
      </g>

      {/* Range rings every metre; emphasized watch circles */}
      {Array.from({ length: VIEW_M }, (_, i) => i + 1).map((m) => {
        const emphasized = m === warnRadius || m === alarmRadius;
        const col = m === warnRadius ? WARN : m === alarmRadius ? ALARM : "hsl(var(--border))";
        return (
          <g key={m}>
            <circle cx={C} cy={C} r={m * SCALE} fill="none"
              stroke={col} strokeWidth={emphasized ? 1.2 : 0.6}
              strokeOpacity={emphasized ? 0.55 : 0.35}
              strokeDasharray={emphasized ? "6 5" : undefined} />
            {(m === 2 || m === VIEW_M - 2 || emphasized) && (
              <text x={C + m * SCALE + 2} y={C - 3} fontSize={8} fontFamily="monospace"
                fill={col} opacity={emphasized ? 0.8 : 0.45}>{m}m</text>
            )}
          </g>
        );
      })}

      {/* Crosshair axes + cardinal labels */}
      <line x1={C - rOuter} y1={C} x2={C + rOuter} y2={C} stroke="hsl(var(--border))" strokeWidth={0.6} strokeOpacity={0.5} />
      <line x1={C} y1={C - rOuter} x2={C} y2={C + rOuter} stroke="hsl(var(--border))" strokeWidth={0.6} strokeOpacity={0.5} />
      {[
        { t: "N", x: C, y: C - rOuter - 8, anchor: "middle" },
        { t: "S", x: C, y: C + rOuter + 14, anchor: "middle" },
        { t: "E", x: C + rOuter + 10, y: C + 4, anchor: "start" },
        { t: "W", x: C - rOuter - 10, y: C + 4, anchor: "end" },
      ].map((c) => (
        <text key={c.t} x={c.x} y={c.y} textAnchor={c.anchor as "middle"} fontSize={11}
          fontFamily="monospace" fontWeight={600} fill="hsl(var(--muted-foreground))" opacity={0.8}>
          {c.t}
        </text>
      ))}

      {/* Heading setpoint tick on the outer ring */}
      {(() => {
        const rad = ((headingSetDeg - 90) * Math.PI) / 180;
        return (
          <line
            x1={C + (rOuter - 8) * Math.cos(rad)} y1={C + (rOuter - 8) * Math.sin(rad)}
            x2={C + (rOuter + 2) * Math.cos(rad)} y2={C + (rOuter + 2) * Math.sin(rad)}
            stroke={OK} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.8}
          />
        );
      })()}

      {/* Environment arrows */}
      {envArrow(windFromDeg, WIND, labels.wind, `${Math.round(windKt)}kt`, windKt > 0.5)}
      {envArrow(currentFromDeg, CURRENT, labels.current, `${currentKt.toFixed(1)}kt`, currentKt > 0.05)}

      {/* Position trail */}
      {trail.length > 1 && (
        <polyline
          points={trail.map((p) => { const { x, y } = toXY(p.n, p.e); return `${x},${y}`; }).join(" ")}
          fill="none" stroke="hsl(200, 100%, 60%)" strokeWidth={1.2}
          strokeOpacity={0.4} strokeLinejoin="round"
        />
      )}

      {/* Setpoint marker */}
      <g opacity={0.9}>
        <line x1={C - 7} y1={C} x2={C + 7} y2={C} stroke={OK} strokeWidth={1.4} />
        <line x1={C} y1={C - 7} x2={C} y2={C + 7} stroke={OK} strokeWidth={1.4} />
        <circle cx={C} cy={C} r={3.5} fill="none" stroke={OK} strokeWidth={1.2} />
      </g>

      {/* Vessel */}
      <g transform={`translate(${vessel.x}, ${vessel.y}) rotate(${headingDeg})`}>
        <polygon points={hull} fill={vesselColor} fillOpacity={0.18}
          stroke={vesselColor} strokeWidth={1.6} strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 6px ${vesselColor}40)`, transition: "stroke 0.4s ease, fill 0.4s ease" }} />
        {/* Bow heading line */}
        <line x1={0} y1={-hullL * 0.55} x2={0} y2={-hullL * 0.55 - 10}
          stroke={vesselColor} strokeWidth={1.2} strokeOpacity={0.7} />
        {/* Deckhouse */}
        <rect x={-hullW / 2 + 2} y={hullL * 0.08} width={hullW - 4} height={hullL * 0.3} rx={1.5}
          fill="none" stroke={vesselColor} strokeWidth={1} strokeOpacity={0.6} />
      </g>

      {/* Offset readout */}
      <text x={16} y={SIZE - 14} fontSize={10} fontFamily="monospace" fill={vesselColor} className="tabular-nums">
        Δ {offM.toFixed(2)} m
      </text>
      <text x={SIZE - 16} y={SIZE - 14} textAnchor="end" fontSize={10} fontFamily="monospace"
        fill="hsl(var(--muted-foreground))" className="tabular-nums">
        HDG {Math.round(((headingDeg % 360) + 360) % 360).toString().padStart(3, "0")}°
      </text>
    </svg>
  );
};

export default DPScene;
