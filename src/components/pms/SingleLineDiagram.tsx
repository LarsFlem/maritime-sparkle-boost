import { GensetView, ConsumerView } from "./pmsTypes";

interface SingleLineDiagramProps {
  gensets: GensetView[];
  consumers: ConsumerView[];
  busLive: boolean;
  busKw: number;
  blackout: boolean;
  onToggleConsumer: (id: string) => void;
  labels: {
    bus: string;
    busDead: string;
    heavy: string;
    shed: string;
    request: string;
  };
}

// Geometry — viewBox 920 × 470
const VB_W = 920;
const BUS_Y = 235;
const BUS_X1 = 70;
const BUS_X2 = 850;
const GEN_Y = 78;
const GEN_BRK_Y = 168;
const CON_Y = 392;
const CON_BRK_Y = 295;

const LIVE = "hsl(200, 100%, 60%)";
const DEAD = "hsl(210, 15%, 32%)";
const WARN = "hsl(38, 85%, 60%)";
const FAULT = "hsl(0, 70%, 55%)";
const OK = "hsl(150, 70%, 55%)";

const GEN_XS = [190, 460, 730];
const CON_XS = [120, 245, 370, 495, 620, 745];

/** Animated power-flow dashes drawn over a base conductor. */
const FlowLine = ({
  x1, y1, x2, y2, live, kw = 0, color = LIVE,
}: { x1: number; y1: number; x2: number; y2: number; live: boolean; kw?: number; color?: string }) => {
  // More power → faster dash flow. Clamp duration 0.45..2.2 s.
  const dur = Math.max(0.45, Math.min(2.2, 900 / Math.max(60, kw)));
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={live ? color : DEAD}
        strokeOpacity={live ? 0.4 : 0.55}
        strokeWidth={1.6} />
      {live && kw > 1 && (
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={color} strokeWidth={1.8}
          strokeDasharray="3 9" strokeLinecap="round"
          className="sld-flow"
          style={{ animationDuration: `${dur}s` }} />
      )}
    </>
  );
};

/** Marine breaker symbol: hinged blade, closed = inline, open = swung out. */
const Breaker = ({
  x, y, closed, color,
}: { x: number; y: number; closed: boolean; color: string }) => {
  const half = 13;
  return (
    <g>
      {/* Terminals */}
      <circle cx={x} cy={y - half} r={2.5} fill={color} />
      <circle cx={x} cy={y + half} r={2.5} fill={color} />
      {/* Blade — pivots at lower terminal */}
      <line
        x1={x} y1={y + half} x2={x} y2={y - half}
        stroke={color} strokeWidth={2} strokeLinecap="round"
        style={{
          transformOrigin: `${x}px ${y + half}px`,
          transform: closed ? "rotate(0deg)" : "rotate(38deg)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      {/* Status lamp */}
      <rect x={x + 9} y={y - 4} width={8} height={8} rx={1}
        fill={closed ? color : "transparent"}
        stroke={color} strokeWidth={1}
        style={{ transition: "fill 0.3s ease" }} />
    </g>
  );
};

const stateColor = (g: GensetView): string => {
  switch (g.state) {
    case "online": return LIVE;
    case "sync":
    case "starting": return WARN;
    case "fault": return FAULT;
    case "cooldown": return WARN;
    default: return DEAD;
  }
};

const SingleLineDiagram = ({
  gensets,
  consumers,
  busLive,
  busKw,
  blackout,
  onToggleConsumer,
  labels,
}: SingleLineDiagramProps) => {
  const busColor = busLive ? LIVE : DEAD;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${VB_W} 470`}
        className="w-full min-w-[680px]"
        role="img"
        aria-label="Single line diagram"
      >
        {/* ── Gensets ── */}
        {gensets.map((g, i) => {
          const x = GEN_XS[i];
          const col = stateColor(g);
          const feederLive = g.breakerClosed && busLive;
          return (
            <g key={g.id}>
              {/* Symbol: IEC generator circle */}
              <circle cx={x} cy={GEN_Y} r={27}
                fill="hsl(var(--background))" fillOpacity={0.6}
                stroke={col} strokeWidth={1.8}
                style={{
                  transition: "stroke 0.4s ease",
                  filter: g.state === "online" ? `drop-shadow(0 0 5px ${col}50)` : "none",
                }} />
              <text x={x} y={GEN_Y + 1} textAnchor="middle" fontSize={17}
                fontFamily="monospace" fontWeight={600} fill={col}>G</text>
              <text x={x} y={GEN_Y + 14} textAnchor="middle" fontSize={9}
                fontFamily="monospace" fill={col} opacity={0.8}>3~</text>

              {/* Spinning indicator while running */}
              {(g.state === "online" || g.state === "sync" || g.state === "cooldown") && (
                <circle cx={x} cy={GEN_Y} r={32} fill="none"
                  stroke={col} strokeWidth={1} strokeOpacity={0.5}
                  strokeDasharray="4 14" strokeLinecap="round"
                  className="sld-spin"
                  style={{ transformOrigin: `${x}px ${GEN_Y}px` }} />
              )}

              {/* Label + kW */}
              <text x={x - 40} y={GEN_Y - 32} textAnchor="start" fontSize={12}
                fontFamily="monospace" fontWeight={600}
                fill="hsl(var(--foreground))" opacity={0.9}>{g.id}</text>
              <text x={x + 40} y={GEN_Y - 4} textAnchor="start" fontSize={11}
                fontFamily="monospace" fill={g.state === "online" ? LIVE : "hsl(var(--muted-foreground))"}
                className="tabular-nums">
                {g.state === "online" ? `${Math.round(g.kw)} kW` : g.state.toUpperCase()}
              </text>
              <text x={x + 40} y={GEN_Y + 10} textAnchor="start" fontSize={9}
                fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.7}
                className="tabular-nums">
                {g.ratedKw} kW
              </text>

              {/* Feeder: genset → breaker → bus */}
              <FlowLine x1={x} y1={GEN_Y + 27} x2={x} y2={GEN_BRK_Y - 13}
                live={feederLive} kw={g.kw} />
              <Breaker x={x} y={GEN_BRK_Y} closed={g.breakerClosed}
                color={g.state === "fault" ? FAULT : g.breakerClosed ? LIVE : DEAD} />
              <FlowLine x1={x} y1={GEN_BRK_Y + 13} x2={x} y2={BUS_Y}
                live={feederLive} kw={g.kw} />
            </g>
          );
        })}

        {/* ── Main busbar (double line, classic switchboard) ── */}
        <line x1={BUS_X1} y1={BUS_Y} x2={BUS_X2} y2={BUS_Y}
          stroke={busColor} strokeWidth={4} strokeOpacity={busLive ? 0.9 : 0.6}
          style={{ transition: "stroke 0.4s ease" }} />
        <line x1={BUS_X1} y1={BUS_Y + 6} x2={BUS_X2} y2={BUS_Y + 6}
          stroke={busColor} strokeWidth={1.2} strokeOpacity={busLive ? 0.45 : 0.3} />
        {busLive && (
          <line x1={BUS_X1} y1={BUS_Y} x2={BUS_X2} y2={BUS_Y}
            stroke={LIVE} strokeWidth={4} strokeDasharray="2 26"
            strokeLinecap="round" strokeOpacity={0.7}
            className="sld-flow" style={{ animationDuration: "1.6s" }} />
        )}
        <text x={BUS_X1} y={BUS_Y - 10} fontSize={11} fontFamily="monospace"
          fill={busLive ? "hsl(var(--foreground))" : FAULT}
          opacity={0.85} className={blackout ? "animate-pulse" : undefined}>
          {blackout ? labels.busDead : labels.bus}
        </text>
        <text x={BUS_X2} y={BUS_Y - 10} textAnchor="end" fontSize={11}
          fontFamily="monospace" fill={busLive ? LIVE : DEAD} className="tabular-nums">
          {busLive ? `Σ ${Math.round(busKw)} kW` : "0 kW"}
        </text>

        {/* ── Consumers ── */}
        {consumers.map((cn, i) => {
          const x = CON_XS[i];
          const isMotor = cn.heavy || cn.id.startsWith("prop") || cn.id === "crane";
          const live = cn.state === "online" && busLive;
          const col = cn.state === "online" ? LIVE
            : cn.state === "request" ? WARN
            : cn.state === "shed" ? WARN
            : DEAD;
          return (
            <g key={cn.id} className="cursor-pointer" onClick={() => onToggleConsumer(cn.id)}>
              <title>{cn.name} — {cn.ratedKw} kW</title>

              {/* Feeder: bus → breaker → consumer */}
              <FlowLine x1={x} y1={BUS_Y + 6} x2={x} y2={CON_BRK_Y - 13}
                live={live} kw={cn.kw} />
              <Breaker x={x} y={CON_BRK_Y} closed={cn.state === "online"} color={col} />
              {cn.state === "request" ? (
                <line x1={x} y1={CON_BRK_Y + 13} x2={x} y2={CON_Y - 22}
                  stroke={WARN} strokeWidth={1.6} strokeDasharray="4 5"
                  className="animate-pulse" />
              ) : (
                <FlowLine x1={x} y1={CON_BRK_Y + 13} x2={x} y2={CON_Y - 22}
                  live={live} kw={cn.kw} />
              )}

              {/* Symbol */}
              {isMotor ? (
                <>
                  <circle cx={x} cy={CON_Y} r={21}
                    fill="hsl(var(--background))" fillOpacity={0.6}
                    stroke={col} strokeWidth={1.6}
                    style={{ transition: "stroke 0.4s ease" }} />
                  <text x={x} y={CON_Y + 1} textAnchor="middle" fontSize={13}
                    fontFamily="monospace" fontWeight={600} fill={col}>M</text>
                  <text x={x} y={CON_Y + 12} textAnchor="middle" fontSize={8}
                    fontFamily="monospace" fill={col} opacity={0.8}>3~</text>
                </>
              ) : (
                <>
                  <rect x={x - 18} y={CON_Y - 18} width={36} height={36} rx={3}
                    fill="hsl(var(--background))" fillOpacity={0.6}
                    stroke={col} strokeWidth={1.6}
                    style={{ transition: "stroke 0.4s ease" }} />
                  <line x1={x - 9} y1={CON_Y - 5} x2={x + 9} y2={CON_Y - 5}
                    stroke={col} strokeWidth={1.4} />
                  <line x1={x - 9} y1={CON_Y + 1} x2={x + 9} y2={CON_Y + 1}
                    stroke={col} strokeWidth={1.4} />
                  <line x1={x - 9} y1={CON_Y + 7} x2={x + 9} y2={CON_Y + 7}
                    stroke={col} strokeWidth={1.4} />
                </>
              )}

              {/* Heavy-consumer badge */}
              {cn.heavy && (
                <g>
                  <rect x={x + 14} y={CON_Y - 30} width={22} height={13} rx={2}
                    fill={cn.state === "request" ? WARN : "hsl(var(--card))"}
                    fillOpacity={cn.state === "request" ? 0.25 : 0.8}
                    stroke={cn.state === "request" ? WARN : "hsl(var(--border))"} strokeWidth={1} />
                  <text x={x + 25} y={CON_Y - 20.5} textAnchor="middle" fontSize={8}
                    fontFamily="monospace" fontWeight={600}
                    fill={cn.state === "request" ? WARN : "hsl(var(--muted-foreground))"}>
                    {labels.heavy}
                  </text>
                </g>
              )}

              {/* State badges */}
              {cn.state === "shed" && (
                <text x={x} y={CON_Y - 28} textAnchor="middle" fontSize={9}
                  fontFamily="monospace" fontWeight={600} fill={WARN}
                  className="animate-pulse">{labels.shed}</text>
              )}
              {cn.state === "request" && (
                <text x={x} y={CON_Y - 36} textAnchor="middle" fontSize={9}
                  fontFamily="monospace" fontWeight={600} fill={WARN}
                  className="animate-pulse">{labels.request}</text>
              )}

              {/* Name + kW */}
              <text x={x} y={CON_Y + 36} textAnchor="middle" fontSize={9.5}
                fontFamily="monospace" fill="hsl(var(--foreground))" opacity={0.8}>
                {cn.name}
              </text>
              <text x={x} y={CON_Y + 49} textAnchor="middle" fontSize={9.5}
                fontFamily="monospace" className="tabular-nums"
                fill={live ? LIVE : "hsl(var(--muted-foreground))"} opacity={live ? 1 : 0.6}>
                {live ? `${Math.round(cn.kw)} kW` : `(${cn.ratedKw} kW)`}
              </text>

              {/* Click affordance halo */}
              <circle cx={x} cy={CON_Y} r={26} fill="transparent"
                className="hover:fill-primary/5" style={{ transition: "fill 0.2s ease" }} />
            </g>
          );
        })}

        {/* OK indicator when bus healthy */}
        {busLive && !blackout && (
          <circle cx={BUS_X1 - 14} cy={BUS_Y + 3} r={4} fill={OK}
            style={{ filter: `drop-shadow(0 0 4px ${OK})` }}>
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
      </svg>
    </div>
  );
};

export default SingleLineDiagram;
