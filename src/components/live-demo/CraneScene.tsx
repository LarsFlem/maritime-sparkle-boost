interface CraneSceneProps {
  slewPct: number;          // 0 = pickup zone (deck), 100 = landing zone (platform)
  hoistPct: number;          // 0 = at deck level, 100 = at boom tip
  swayDeg: number;           // cable sway angle from vertical, +ve = leans left
  cargoState: "deck" | "carried" | "landed";
  windKt: number;            // wind speed (drives the wind arrow)
  running: boolean;
  eStop: boolean;
  waterPhase: number;        // 0..1 animated
  modeLabel: string;         // shown in the corner
}

// --- Geometry constants (viewBox 800 × 450) ---
const VB_W = 800;
const VB_H = 450;
const WATER_Y = 360;
const PEDESTAL_X = 600;
const PEDESTAL_TOP_Y = 280;
const PEDESTAL_BASE_Y = 340;
const BOOM_PIVOT_Y = PEDESTAL_TOP_Y - 4;
const PICKUP_X = 560;        // deck pickup spot
const LANDING_X = 180;       // landing zone (platform / barge to the left)
const TROLLEY_Y_HIGH = 110;  // boom high point (cargo lifted)
const TROLLEY_Y_LOW = 95;
const DECK_TOP_Y = 320;
const PLATFORM_TOP_Y = 305;
const CONTAINER_W = 64;
const CONTAINER_H = 36;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CraneScene = ({
  slewPct,
  hoistPct,
  swayDeg,
  cargoState,
  windKt,
  running,
  eStop,
  waterPhase,
  modeLabel,
}: CraneSceneProps) => {
  // Boom-tip position from slew %.
  // Slew 0 → boom tip directly above pickup zone (right). Slew 100 → above landing zone (left).
  const slewT = slewPct / 100;
  const boomTipX = lerp(PEDESTAL_X - 30, LANDING_X + 30, slewT);
  const boomTipY = lerp(TROLLEY_Y_LOW, TROLLEY_Y_HIGH, Math.abs(slewT - 0.5) * 2 * 0.4);

  // Cable length grows as hoist comes down (container low = lots of cable out).
  // hoistPct 100 → container near boom tip (short cable). hoistPct 0 → container at deck (long cable).
  const cableLen = lerp(180, 30, hoistPct / 100);

  // Hook position = boom tip + cable (straight down) rotated by swayDeg.
  const swayRad = (swayDeg * Math.PI) / 180;
  const hookX = boomTipX + cableLen * Math.sin(swayRad);
  const hookY = boomTipY + cableLen * Math.cos(swayRad);

  // Container position: follows hook when carried; otherwise rests on deck or landing zone.
  let containerX: number;
  let containerY: number;
  if (cargoState === "carried") {
    containerX = hookX;
    containerY = hookY + CONTAINER_H / 2;
  } else if (cargoState === "deck") {
    containerX = PICKUP_X;
    containerY = DECK_TOP_Y - CONTAINER_H / 2;
  } else {
    containerX = LANDING_X;
    containerY = PLATFORM_TOP_Y - CONTAINER_H / 2;
  }

  // Animated water surface (sin wave on top edge).
  const wavePoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * VB_W;
    const y = WATER_Y + Math.sin(waterPhase * Math.PI * 2 + i * 0.4) * 2.5;
    wavePoints.push(`${x},${y}`);
  }
  const wavePath = `M 0 ${VB_H} L ${wavePoints.join(" L ")} L ${VB_W} ${VB_H} Z`;

  // Wind arrow: length scales with windKt, points right (assumed wind direction).
  const windArrowLen = Math.min(60, 10 + windKt * 1.4);

  // Glow suppressed during E-stop (gives a "cold" look).
  const accentColor = eStop ? "hsl(0, 70%, 55%)" : "hsl(200, 100%, 60%)";

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="craneSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(210, 30%, 8%)" />
          <stop offset="100%" stopColor="hsl(205, 35%, 14%)" />
        </linearGradient>
        <linearGradient id="craneWaterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(210, 50%, 14%)" />
          <stop offset="100%" stopColor="hsl(215, 55%, 6%)" />
        </linearGradient>
        <linearGradient id="craneBoomGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(38, 80%, 55%)" />
          <stop offset="100%" stopColor="hsl(38, 85%, 65%)" />
        </linearGradient>
        <linearGradient id="craneContainerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(22, 60%, 48%)" />
          <stop offset="100%" stopColor="hsl(22, 55%, 38%)" />
        </linearGradient>
        <pattern id="craneGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(200, 100%, 50%)" strokeOpacity="0.05" strokeWidth="0.5" />
        </pattern>
        <filter id="craneGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky background + grid */}
      <rect width={VB_W} height={VB_H} fill="url(#craneSkyGrad)" />
      <rect width={VB_W} height={WATER_Y} fill="url(#craneGrid)" />

      {/* Distant horizon glow */}
      <ellipse cx={VB_W / 2} cy={WATER_Y - 10} rx={VB_W * 0.55} ry={50} fill={accentColor} fillOpacity={0.05} />

      {/* Water */}
      <path d={wavePath} fill="url(#craneWaterGrad)" />
      {/* Subtle reflection lines */}
      {[0, 1, 2].map(i => {
        const yOff = 12 + i * 14;
        return (
          <path
            key={i}
            d={`M 0 ${WATER_Y + yOff} Q ${VB_W / 2} ${WATER_Y + yOff + 3} ${VB_W} ${WATER_Y + yOff}`}
            stroke="hsl(200, 60%, 40%)"
            strokeOpacity={0.18 - i * 0.05}
            strokeWidth={0.6}
            fill="none"
          />
        );
      })}

      {/* Landing platform (left, fixed offshore platform) */}
      <g>
        <rect
          x={LANDING_X - 80}
          y={PLATFORM_TOP_Y}
          width={160}
          height={WATER_Y - PLATFORM_TOP_Y}
          fill="hsl(210, 18%, 16%)"
          stroke="hsl(210, 25%, 30%)"
          strokeWidth={1}
        />
        {/* Platform legs visible below water */}
        {[-50, 0, 50].map(off => (
          <rect
            key={off}
            x={LANDING_X + off - 4}
            y={WATER_Y}
            width={8}
            height={VB_H - WATER_Y - 6}
            fill="hsl(210, 20%, 12%)"
            stroke="hsl(210, 25%, 28%)"
            strokeWidth={0.5}
          />
        ))}
        {/* Landing-zone footprint (dashed) */}
        <rect
          x={LANDING_X - CONTAINER_W / 2 - 4}
          y={PLATFORM_TOP_Y - 2}
          width={CONTAINER_W + 8}
          height={4}
          fill="none"
          stroke={accentColor}
          strokeOpacity={0.45}
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={LANDING_X}
          y={PLATFORM_TOP_Y - 10}
          textAnchor="middle"
          fontSize={9}
          fontFamily="monospace"
          fill="hsl(var(--muted-foreground))"
          opacity={0.7}
        >
          LANDING ZONE
        </text>
      </g>

      {/* Vessel hull (right) */}
      <g>
        <path
          d={`M 380 ${DECK_TOP_Y} L 770 ${DECK_TOP_Y} L 760 ${WATER_Y - 4} L 410 ${WATER_Y - 4} Z`}
          fill="hsl(210, 20%, 14%)"
          stroke="hsl(210, 25%, 28%)"
          strokeWidth={1}
        />
        {/* Deck details: portholes / bollards */}
        {[420, 460, 720].map(x => (
          <circle key={x} cx={x} cy={WATER_Y - 16} r={3} fill="hsl(38, 70%, 50%)" fillOpacity={0.5} />
        ))}
        {/* Pickup-zone footprint */}
        <rect
          x={PICKUP_X - CONTAINER_W / 2 - 4}
          y={DECK_TOP_Y - 2}
          width={CONTAINER_W + 8}
          height={4}
          fill="none"
          stroke={accentColor}
          strokeOpacity={0.45}
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text
          x={PICKUP_X}
          y={DECK_TOP_Y - 10}
          textAnchor="middle"
          fontSize={9}
          fontFamily="monospace"
          fill="hsl(var(--muted-foreground))"
          opacity={0.7}
        >
          PICKUP
        </text>
      </g>

      {/* Crane pedestal */}
      <g>
        <rect
          x={PEDESTAL_X - 18}
          y={PEDESTAL_TOP_Y}
          width={36}
          height={PEDESTAL_BASE_Y - PEDESTAL_TOP_Y}
          fill="hsl(38, 60%, 42%)"
          stroke="hsl(38, 70%, 55%)"
          strokeWidth={0.8}
        />
        {/* Pedestal struts */}
        <line
          x1={PEDESTAL_X - 18}
          y1={PEDESTAL_TOP_Y + 12}
          x2={PEDESTAL_X + 18}
          y2={PEDESTAL_TOP_Y + 28}
          stroke="hsl(38, 65%, 38%)"
          strokeWidth={0.8}
        />
        <line
          x1={PEDESTAL_X + 18}
          y1={PEDESTAL_TOP_Y + 12}
          x2={PEDESTAL_X - 18}
          y2={PEDESTAL_TOP_Y + 28}
          stroke="hsl(38, 65%, 38%)"
          strokeWidth={0.8}
        />
      </g>

      {/* Boom: from pedestal top to boom tip */}
      <g>
        {/* Boom main beam */}
        <line
          x1={PEDESTAL_X}
          y1={BOOM_PIVOT_Y}
          x2={boomTipX}
          y2={boomTipY}
          stroke="url(#craneBoomGrad)"
          strokeWidth={9}
          strokeLinecap="round"
          filter={running && !eStop ? "url(#craneGlow)" : undefined}
        />
        {/* Lattice detail */}
        {[0.25, 0.5, 0.75].map(t => {
          const x = lerp(PEDESTAL_X, boomTipX, t);
          const y = lerp(BOOM_PIVOT_Y, boomTipY, t);
          return (
            <circle key={t} cx={x} cy={y} r={2.5} fill="hsl(38, 80%, 65%)" fillOpacity={0.7} />
          );
        })}
        {/* Boom-tip pulley */}
        <circle cx={boomTipX} cy={boomTipY} r={5} fill="hsl(210, 15%, 18%)" stroke="hsl(38, 80%, 60%)" strokeWidth={1.2} />
        {/* Boom pivot joint */}
        <circle cx={PEDESTAL_X} cy={BOOM_PIVOT_Y} r={6} fill="hsl(210, 15%, 18%)" stroke="hsl(38, 80%, 60%)" strokeWidth={1.5} />
      </g>

      {/* Cable */}
      <line
        x1={boomTipX}
        y1={boomTipY}
        x2={hookX}
        y2={hookY}
        stroke={eStop ? "hsl(0, 60%, 60%)" : "hsl(180, 60%, 60%)"}
        strokeWidth={1.4}
        strokeOpacity={0.85}
      />
      {/* Hook */}
      <g>
        <circle cx={hookX} cy={hookY} r={4} fill="hsl(38, 80%, 55%)" stroke="hsl(38, 90%, 70%)" strokeWidth={1} />
        <line x1={hookX} y1={hookY + 3} x2={hookX} y2={hookY + 8} stroke="hsl(38, 80%, 55%)" strokeWidth={1.4} />
      </g>

      {/* Container — only render when present in scene */}
      {(cargoState === "deck" || cargoState === "carried" || cargoState === "landed") && (
        <g
          style={{
            transform: cargoState === "carried" ? `rotate(${swayDeg}deg)` : "none",
            transformOrigin: `${containerX}px ${containerY - CONTAINER_H / 2}px`,
            transformBox: "fill-box",
          }}
        >
          <rect
            x={containerX - CONTAINER_W / 2}
            y={containerY - CONTAINER_H / 2}
            width={CONTAINER_W}
            height={CONTAINER_H}
            fill="url(#craneContainerGrad)"
            stroke="hsl(22, 70%, 28%)"
            strokeWidth={1}
            rx={2}
          />
          {/* Container ribs */}
          {[-22, -10, 2, 14].map(off => (
            <line
              key={off}
              x1={containerX + off}
              y1={containerY - CONTAINER_H / 2 + 3}
              x2={containerX + off}
              y2={containerY + CONTAINER_H / 2 - 3}
              stroke="hsl(22, 70%, 30%)"
              strokeOpacity={0.5}
              strokeWidth={0.6}
            />
          ))}
          {/* ID stencil */}
          <text
            x={containerX}
            y={containerY + 4}
            textAnchor="middle"
            fontSize={8}
            fontFamily="monospace"
            fill="hsl(38, 70%, 80%)"
            opacity={0.85}
          >
            MA-127
          </text>
        </g>
      )}

      {/* Wind indicator (top-left) */}
      <g transform="translate(40, 40)">
        <text x={0} y={-4} fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.75}>
          WIND
        </text>
        <line x1={0} y1={6} x2={windArrowLen} y2={6} stroke={accentColor} strokeWidth={1.5} strokeOpacity={0.8} />
        <polygon
          points={`${windArrowLen},6 ${windArrowLen - 6},2 ${windArrowLen - 6},10`}
          fill={accentColor}
          fillOpacity={0.85}
        />
        <text x={0} y={22} fontSize={10} fontFamily="monospace" fill={accentColor} opacity={0.9}>
          {windKt.toFixed(0)} kt
        </text>
      </g>

      {/* Mode + LIVE badge (top-right) */}
      <g transform={`translate(${VB_W - 20}, 40)`}>
        <text x={0} y={0} textAnchor="end" fontSize={10} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.85}>
          MODE · {modeLabel}
        </text>
        {running && !eStop && (
          <g>
            <circle cx={-6} cy={14} r={3.5} fill="hsl(0, 75%, 60%)">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <text x={-14} y={18} textAnchor="end" fontSize={9} fontFamily="monospace" fill="hsl(0, 75%, 70%)">
              LIVE
            </text>
          </g>
        )}
      </g>

      {/* Coordinates / scale ruler (bottom-right corner) */}
      <g transform={`translate(${VB_W - 110}, ${VB_H - 24})`}>
        <line x1={0} y1={6} x2={80} y2={6} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1} />
        {[0, 20, 40, 60, 80].map(x => (
          <line key={x} x1={x} y1={3} x2={x} y2={9} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1} />
        ))}
        <text x={40} y={20} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.6}>
          10 m
        </text>
      </g>
    </svg>
  );
};

export default CraneScene;
