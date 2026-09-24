import { ThrusterView } from "@/components/dp/ThrusterPanel";
import { thrusterColor } from "@/components/dp/thrusterStatus";

/**
 * Plan view of the hull with every thruster drawn where it actually sits,
 * so the thrust vectors can be read against the geometry that produces the
 * yaw moment. Body frame throughout — bow up, starboard right — which is the
 * frame `directionDeg` is already reported in, so the arrows need no rotation.
 */

const SCALE = 4;              // px per metre
const BOW_M = 42;             // hull extent fwd of CoG
const STERN_M = -38;
const HALF_BEAM_M = 9.5;
const MARGIN_M = 21;          // room outside the hull for arrows and labels
const MAX_ARROW_M = 9;        // arrow length at 100 % thrust
const LABEL_M = 24;           // label offset from the centreline, clear of the arrows

const W = (HALF_BEAM_M + MARGIN_M) * 2 * SCALE;   // 236
const H = (BOW_M - STERN_M + 12) * SCALE;         // 368
const CX = W / 2;                                  // 118
const CY = (BOW_M + 6) * SCALE;                    // 192 — svg y of the CoG

/** Vessel coords (m) → svg. posY is starboard, posX is forward. */
const px = (posY: number) => CX + posY * SCALE;
const py = (posX: number) => CY - posX * SCALE;

const HULL = `M ${CX} ${py(BOW_M)}
  C ${px(1.5)} ${py(38)}, ${px(HALF_BEAM_M)} ${py(32)}, ${px(HALF_BEAM_M)} ${py(23)}
  L ${px(HALF_BEAM_M)} ${py(-35)}
  Q ${px(HALF_BEAM_M)} ${py(STERN_M)}, ${px(7)} ${py(STERN_M)}
  L ${px(-7)} ${py(STERN_M)}
  Q ${px(-HALF_BEAM_M)} ${py(STERN_M)}, ${px(-HALF_BEAM_M)} ${py(-35)}
  L ${px(-HALF_BEAM_M)} ${py(23)}
  C ${px(-HALF_BEAM_M)} ${py(32)}, ${px(-1.5)} ${py(38)}, ${CX} ${py(BOW_M)} Z`;

const MUTED = "hsl(var(--muted-foreground))";

const Arrow = ({ x, y, dirDeg, lenPx, color }: {
  x: number; y: number; dirDeg: number; lenPx: number; color: string;
}) => {
  const rad = (dirDeg * Math.PI) / 180;
  const ux = Math.sin(rad);       // starboard component → +svg x
  const uy = -Math.cos(rad);      // ahead component → −svg y
  const tx = x + ux * lenPx;
  const ty = y + uy * lenPx;
  const head = Math.min(6, 2.5 + lenPx * 0.14);
  const nx = -uy;                 // unit normal
  const ny = ux;
  return (
    <g>
      <line x1={x} y1={y} x2={tx} y2={ty} stroke={color} strokeWidth={2.4} strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${color}70)` }} />
      <polygon
        points={
          `${tx + ux * head},${ty + uy * head} ` +
          `${tx + nx * head * 0.62},${ty + ny * head * 0.62} ` +
          `${tx - nx * head * 0.62},${ty - ny * head * 0.62}`
        }
        fill={color}
      />
    </g>
  );
};

const Cross = ({ x, y }: { x: number; y: number }) => (
  <g stroke="hsl(0, 70%, 55%)" strokeWidth={2} strokeLinecap="round">
    <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
    <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
  </g>
);

const VesselThrusterLayout = ({ thrusters }: { thrusters: ThrusterView[] }) => (
  <div className="flex justify-center">
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[240px]" role="img"
      aria-label="Thruster layout, vessel plan view">
      <defs>
        {/* Ducts are clipped to the hull so they can never poke through it */}
        <clipPath id="dp-hull-clip">
          <path d={HULL} />
        </clipPath>
      </defs>

      {/* Hull */}
      <path d={HULL} fill="hsl(var(--background))" fillOpacity={0.55}
        stroke={MUTED} strokeWidth={1.4} strokeOpacity={0.65} />
      {/* Centreline + midship reference */}
      <line x1={CX} y1={py(BOW_M - 4)} x2={CX} y2={py(STERN_M + 2)}
        stroke={MUTED} strokeWidth={0.7} strokeOpacity={0.25} strokeDasharray="4 5" />
      <g stroke={MUTED} strokeWidth={0.9} strokeOpacity={0.5}>
        <line x1={CX - 5} y1={CY} x2={CX + 5} y2={CY} />
        <line x1={CX} y1={CY - 5} x2={CX} y2={CY + 5} />
      </g>
      <text x={CX + 9} y={CY + 3} fontSize={7} fontFamily="monospace" fill={MUTED} opacity={0.6}>CoG</text>

      {/* Thruster symbols, clipped where they sit inside the hull */}
      <g clipPath="url(#dp-hull-clip)">
        {thrusters.map((th) => {
          const col = thrusterColor(th);
          const x = px(th.posY);
          const y = py(th.posX);
          return th.type === "tunnel" ? (
            <rect key={th.id} x={px(-HALF_BEAM_M)} y={y - 3.5}
              width={HALF_BEAM_M * 2 * SCALE} height={7} rx={3.5}
              fill="hsl(var(--card))" fillOpacity={0.9} stroke={col} strokeWidth={1.2} strokeOpacity={0.85} />
          ) : (
            <circle key={th.id} cx={x} cy={y} r={5.5}
              fill="hsl(var(--card))" fillOpacity={0.9} stroke={col} strokeWidth={1.3} strokeOpacity={0.85} />
          );
        })}
      </g>

      {/* Thrust vectors and status, drawn over the hull so they read at a glance */}
      {thrusters.map((th) => {
        const col = thrusterColor(th);
        const x = px(th.posY);
        const y = py(th.posX);
        const len = (Math.min(th.thrustPct, 100) / 100) * MAX_ARROW_M * SCALE;
        return (
          <g key={th.id}>
            {!th.failed && th.thrustPct > 1 && (
              <Arrow x={x} y={y} dirDeg={th.directionDeg} lenPx={len} color={col} />
            )}
            {th.failed && <Cross x={x} y={y} />}
            <circle cx={x} cy={y} r={2.2} fill={col} />
          </g>
        );
      })}

      {/* Labels sit out in the margin abeam of their unit — off to starboard
          for a starboard-side thruster, to port for everything else, so an
          arrow swinging outboard never runs through the text. */}
      {thrusters.map((th) => {
        const col = thrusterColor(th);
        const toStbd = th.posY > 0;
        return (
          <text key={th.id} x={px(toStbd ? LABEL_M : -LABEL_M)} y={py(th.posX) + 3}
            textAnchor="middle" fontSize={8.5} fontFamily="monospace"
            className="tabular-nums" fill={col} opacity={0.95}>
            {th.id} {th.failed ? "—" : `${Math.round(th.thrustPct)}%`}
          </text>
        );
      })}
    </svg>
  </div>
);

export default VesselThrusterLayout;
