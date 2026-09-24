import {
  craneFk,
  CONTAINER_H_M,
  CONTAINER_W_M,
  PICKUP_R,
  LANDING_R,
  BARGE_DECK_Z,
  PICKUP_SLEW,
  LANDING_SLEW,
  SECTOR_HALF,
  inSector,
} from "./craneModel";

interface CraneSceneProps {
  slewDeg: number;
  mainDeg: number;
  jibFoldDeg: number;
  wireM: number;
  swayDeg: number;
  /** Elastic boom deflection under load (visual only) */
  deflectDeg: number;
  cargoState: "deck" | "carried" | "landed";
  hookLoadT: number;
  windKt: number;
  running: boolean;
  eStop: boolean;
  waterPhase: number;
  modeLabel: string;
}

// --- Canvas mapping (viewBox 800 × 450) ---
const VB_W = 800;
const VB_H = 450;
const SCALE = 12; // px per metre
const PED_X = 665;
const DECK_Y = 348;
const WATER_Y = 396;

const mx = (r: number) => PED_X - r * SCALE;
const my = (z: number) => DECK_Y - z * SCALE;
const rad = (d: number) => (d * Math.PI) / 180;

const CONT_W = CONTAINER_W_M * SCALE;
const CONT_H = CONTAINER_H_M * SCALE;

/** Tapered boom segment drawn as a polygon between two joints. */
const BoomSegment = ({
  x1, y1, x2, y2, w1, w2, glow,
}: { x1: number; y1: number; x2: number; y2: number; w1: number; w2: number; glow: boolean }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const px = Math.sin(a);
  const py = -Math.cos(a);
  const pts = [
    `${x1 + px * w1},${y1 + py * w1}`,
    `${x2 + px * w2},${y2 + py * w2}`,
    `${x2 - px * w2},${y2 - py * w2}`,
    `${x1 - px * w1},${y1 - py * w1}`,
  ].join(" ");
  return (
    <polygon
      points={pts}
      fill="url(#craneBoomGrad)"
      stroke="hsl(38, 70%, 40%)"
      strokeWidth={0.8}
      filter={glow ? "url(#craneGlow)" : undefined}
    />
  );
};

/** Hydraulic cylinder: thick barrel from anchor, thin rod to attachment. */
const Cylinder = ({
  x1, y1, x2, y2,
}: { x1: number; y1: number; x2: number; y2: number }) => {
  const bx = x1 + (x2 - x1) * 0.55;
  const by = y1 + (y2 - y1) * 0.55;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke="hsl(210, 18%, 30%)" strokeWidth={6} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke="hsl(210, 25%, 45%)" strokeWidth={3.5} strokeLinecap="round" />
      <line x1={bx} y1={by} x2={x2} y2={y2} stroke="hsl(195, 40%, 65%)" strokeWidth={2} strokeLinecap="round" />
      <circle cx={x1} cy={y1} r={2.5} fill="hsl(210, 25%, 45%)" />
      <circle cx={x2} cy={y2} r={2.5} fill="hsl(210, 25%, 45%)" />
    </g>
  );
};

const CraneScene = ({
  slewDeg,
  mainDeg,
  jibFoldDeg,
  wireM,
  swayDeg,
  deflectDeg,
  cargoState,
  hookLoadT,
  windKt,
  running,
  eStop,
  waterPhase,
  modeLabel,
}: CraneSceneProps) => {
  // FK with elastic deflection — the drawn structure is the loaded structure.
  const fk = craneFk(mainDeg + deflectDeg, jibFoldDeg);
  const pivot = { x: PED_X, y: my(4) };
  const knuckle = { x: mx(fk.kx), y: my(fk.kz) };
  const tip = { x: mx(fk.tx), y: my(fk.tz) };

  // Hook hangs from the tip, rotated by sway.
  const hookXm = fk.tx + wireM * Math.sin(rad(swayDeg));
  const hookZm = fk.tz - wireM * Math.cos(rad(swayDeg));
  const hook = { x: mx(hookXm), y: my(hookZm) };

  // Container placement
  const atPickupSector = inSector(slewDeg, PICKUP_SLEW);
  const atLandingSector = inSector(slewDeg, LANDING_SLEW);
  let contCx = 0, contTopY = 0, ghost = false, contSurfaceY = WATER_Y;
  if (cargoState === "deck") {
    contCx = mx(PICKUP_R);
    contTopY = my(CONTAINER_H_M);
    ghost = !atPickupSector;
    contSurfaceY = DECK_Y;
  } else if (cargoState === "landed") {
    contCx = mx(LANDING_R);
    contTopY = my(BARGE_DECK_Z + CONTAINER_H_M);
    ghost = !atLandingSector;
    contSurfaceY = my(BARGE_DECK_Z);
  } else {
    contCx = hook.x;
    contTopY = hook.y + 6;
    ghost = false;
    contSurfaceY = hookXm > LANDING_R - 4 && atLandingSector ? my(BARGE_DECK_Z)
      : hookXm < PICKUP_R + 4 ? DECK_Y : WATER_Y;
  }
  const contBottomY = contTopY + CONT_H;
  const heightAbove = Math.max(0, (contSurfaceY - contBottomY) / SCALE);
  const shadowScale = Math.max(0.25, 1 - heightAbove / 30);
  const shadowOpacity = Math.max(0.06, 0.3 - heightAbove * 0.012);

  // Water surface
  const wavePoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * VB_W;
    const y = WATER_Y + Math.sin(waterPhase * Math.PI * 2 + i * 0.4) * 2.5;
    wavePoints.push(`${x},${y}`);
  }
  const wavePath = `M 0 ${VB_H} L ${wavePoints.join(" L ")} L ${VB_W} ${VB_H} Z`;

  const accentColor = eStop ? "hsl(0, 70%, 55%)" : "hsl(200, 100%, 60%)";
  const windArrowLen = Math.min(60, 10 + windKt * 1.4);

  // Slew rose geometry (semicircular dial, 0°..180° mapped left→right over
  // the top). With SVG's y-down axis, y = sin(180°+deg)·r lands 90° at the top.
  const roseAngle = (deg: number) => rad(180 + deg);

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="craneSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(210, 30%, 8%)" />
          <stop offset="100%" stopColor="hsl(205, 35%, 14%)" />
        </linearGradient>
        <linearGradient id="craneWaterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(210, 50%, 14%)" />
          <stop offset="100%" stopColor="hsl(215, 55%, 6%)" />
        </linearGradient>
        <linearGradient id="craneBoomGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(38, 85%, 62%)" />
          <stop offset="100%" stopColor="hsl(38, 75%, 48%)" />
        </linearGradient>
        <linearGradient id="craneContainerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(22, 60%, 48%)" />
          <stop offset="100%" stopColor="hsl(22, 55%, 38%)" />
        </linearGradient>
        <pattern id="craneGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(200, 100%, 50%)" strokeOpacity="0.05" strokeWidth="0.5" />
        </pattern>
        <filter id="craneGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky + grid */}
      <rect width={VB_W} height={VB_H} fill="url(#craneSkyGrad)" />
      <rect width={VB_W} height={WATER_Y} fill="url(#craneGrid)" />
      <ellipse cx={VB_W / 2} cy={WATER_Y - 10} rx={VB_W * 0.55} ry={50} fill={accentColor} fillOpacity={0.05} />

      {/* Water */}
      <path d={wavePath} fill="url(#craneWaterGrad)" />
      {[0, 1, 2].map((i) => (
        <path key={i}
          d={`M 0 ${WATER_Y + 12 + i * 14} Q ${VB_W / 2} ${WATER_Y + 15 + i * 14} ${VB_W} ${WATER_Y + 12 + i * 14}`}
          stroke="hsl(200, 60%, 40%)" strokeOpacity={0.18 - i * 0.05} strokeWidth={0.6} fill="none" />
      ))}

      {/* Barge (left, lower deck) */}
      <g>
        <path
          d={`M ${mx(25.5)} ${my(BARGE_DECK_Z)} L ${mx(16.5)} ${my(BARGE_DECK_Z)} L ${mx(17)} ${WATER_Y + 8} L ${mx(25)} ${WATER_Y + 8} Z`}
          fill="hsl(210, 20%, 14%)" stroke="hsl(210, 25%, 28%)" strokeWidth={1}
        />
        {[18, 23.5].map((r) => (
          <circle key={r} cx={mx(r)} cy={my(BARGE_DECK_Z) + 8} r={2.5} fill="hsl(38, 70%, 50%)" fillOpacity={0.5} />
        ))}
        <rect x={mx(LANDING_R) - CONT_W / 2 - 4} y={my(BARGE_DECK_Z) - 2} width={CONT_W + 8} height={4}
          fill="none" stroke={accentColor} strokeOpacity={0.45} strokeDasharray="4 3" strokeWidth={1} />
        <text x={mx(LANDING_R)} y={my(BARGE_DECK_Z) - 9} textAnchor="middle" fontSize={9}
          fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.7}>
          BARGE — LANDING
        </text>
      </g>

      {/* Own vessel (right) */}
      <g>
        <path
          d={`M ${mx(13.5)} ${DECK_Y} L 785 ${DECK_Y} L 775 ${WATER_Y - 4} L ${mx(12.8)} ${WATER_Y - 4} Z`}
          fill="hsl(210, 20%, 14%)" stroke="hsl(210, 25%, 28%)" strokeWidth={1}
        />
        {[mx(11.5), PED_X + 60, PED_X + 95].map((x) => (
          <circle key={x} cx={x} cy={WATER_Y - 16} r={3} fill="hsl(38, 70%, 50%)" fillOpacity={0.5} />
        ))}
        <rect x={mx(PICKUP_R) - CONT_W / 2 - 4} y={DECK_Y - 2} width={CONT_W + 8} height={4}
          fill="none" stroke={accentColor} strokeOpacity={0.45} strokeDasharray="4 3" strokeWidth={1} />
        <text x={mx(PICKUP_R)} y={DECK_Y - 9} textAnchor="middle" fontSize={9}
          fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.7}>
          PICKUP
        </text>
      </g>

      {/* Container shadow */}
      {!ghost && (
        <ellipse cx={contCx} cy={contSurfaceY + 2} rx={(CONT_W / 2) * shadowScale} ry={3.5 * shadowScale}
          fill="black" opacity={cargoState === "carried" ? shadowOpacity : 0.3} />
      )}

      {/* Pedestal + slew ring */}
      <g>
        <rect x={PED_X - 15} y={pivot.y + 10} width={30} height={DECK_Y - pivot.y - 10}
          fill="hsl(38, 55%, 38%)" stroke="hsl(38, 65%, 50%)" strokeWidth={0.8} />
        <ellipse cx={PED_X} cy={pivot.y + 12} rx={19} ry={5}
          fill="hsl(210, 18%, 22%)" stroke="hsl(38, 70%, 55%)" strokeWidth={1} />
        {/* King post up to pivot */}
        <rect x={PED_X - 9} y={pivot.y - 6} width={18} height={20}
          fill="hsl(38, 60%, 45%)" stroke="hsl(38, 70%, 55%)" strokeWidth={0.8} />
      </g>

      {/* Main boom + jib */}
      <BoomSegment x1={pivot.x} y1={pivot.y} x2={knuckle.x} y2={knuckle.y} w1={6} w2={4.5} glow={running && !eStop} />
      <BoomSegment x1={knuckle.x} y1={knuckle.y} x2={tip.x} y2={tip.y} w1={4} w2={2.5} glow={running && !eStop} />

      {/* Luffing cylinder: pedestal front → underside of main boom */}
      <Cylinder
        x1={PED_X - 13} y1={DECK_Y - 6}
        x2={pivot.x + (knuckle.x - pivot.x) * 0.48} y2={pivot.y + (knuckle.y - pivot.y) * 0.48 + 7}
      />
      {/* Knuckle cylinder: top of main boom → jib root */}
      <Cylinder
        x1={pivot.x + (knuckle.x - pivot.x) * 0.72} y1={pivot.y + (knuckle.y - pivot.y) * 0.72 - 8}
        x2={knuckle.x + (tip.x - knuckle.x) * 0.22} y2={knuckle.y + (tip.y - knuckle.y) * 0.22 - 5}
      />

      {/* Joints + tip sheave */}
      <circle cx={pivot.x} cy={pivot.y} r={6} fill="hsl(210, 15%, 18%)" stroke="hsl(38, 80%, 60%)" strokeWidth={1.5} />
      <circle cx={knuckle.x} cy={knuckle.y} r={5} fill="hsl(210, 15%, 18%)" stroke="hsl(38, 80%, 60%)" strokeWidth={1.4} />
      <circle cx={tip.x} cy={tip.y} r={4.5} fill="hsl(210, 15%, 18%)" stroke="hsl(38, 80%, 60%)" strokeWidth={1.2} />
      <circle cx={tip.x} cy={tip.y} r={1.5} fill="hsl(38, 80%, 60%)" />

      {/* Wire + hook block */}
      <line x1={tip.x} y1={tip.y} x2={hook.x} y2={hook.y}
        stroke={eStop ? "hsl(0, 60%, 60%)" : "hsl(180, 50%, 62%)"} strokeWidth={1.3} strokeOpacity={0.9} />
      <g transform={`translate(${hook.x}, ${hook.y}) rotate(${swayDeg * 0.8})`}>
        <rect x={-4} y={-7} width={8} height={9} rx={1.5}
          fill="hsl(210, 18%, 25%)" stroke="hsl(38, 80%, 55%)" strokeWidth={1} />
        <path d="M 0 2 C 0 6, -4 6, -4 9" fill="none" stroke="hsl(38, 80%, 55%)" strokeWidth={1.8} strokeLinecap="round" />
      </g>

      {/* Container */}
      <g
        opacity={ghost ? 0.22 : 1}
        style={{
          transform: cargoState === "carried" ? `rotate(${swayDeg * 0.8}deg)` : "none",
          transformOrigin: `${contCx}px ${contTopY}px`,
          transformBox: "view-box" as const,
        }}
      >
        <rect x={contCx - CONT_W / 2} y={contTopY} width={CONT_W} height={CONT_H} rx={2}
          fill="url(#craneContainerGrad)" stroke="hsl(22, 70%, 28%)" strokeWidth={1}
          strokeDasharray={ghost ? "4 3" : undefined} />
        {[-12, -2, 8].map((off) => (
          <line key={off} x1={contCx + off} y1={contTopY + 3} x2={contCx + off} y2={contBottomY - 3}
            stroke="hsl(22, 70%, 30%)" strokeOpacity={0.5} strokeWidth={0.6} />
        ))}
        <text x={contCx} y={contTopY + CONT_H / 2 + 3} textAnchor="middle" fontSize={8}
          fontFamily="monospace" fill="hsl(38, 70%, 80%)" opacity={0.85}>
          MA-127
        </text>
        {/* Lifting slings when carried */}
        {cargoState === "carried" && (
          <>
            <line x1={contCx} y1={contTopY - 5} x2={contCx - CONT_W / 2 + 3} y2={contTopY}
              stroke="hsl(38, 60%, 55%)" strokeWidth={1} />
            <line x1={contCx} y1={contTopY - 5} x2={contCx + CONT_W / 2 - 3} y2={contTopY}
              stroke="hsl(38, 60%, 55%)" strokeWidth={1} />
          </>
        )}
      </g>
      {ghost && (
        <text x={contCx} y={contTopY - 6} textAnchor="middle" fontSize={8} fontFamily="monospace"
          fill="hsl(var(--muted-foreground))" opacity={0.55}>
          {cargoState === "deck" ? `SLEW ${PICKUP_SLEW}°` : `SLEW ${LANDING_SLEW}°`}
        </text>
      )}

      {/* Slew rose (top-left) */}
      <g transform="translate(64, 78)">
        <text x={0} y={-48} textAnchor="middle" fontSize={9} fontFamily="monospace"
          fill="hsl(var(--muted-foreground))" opacity={0.75}>SLEW</text>
        <circle cx={0} cy={0} r={36} fill="hsl(var(--background))" fillOpacity={0.5}
          stroke="hsl(var(--border))" strokeWidth={1} />
        {/* Sector arcs */}
        {[
          { c: PICKUP_SLEW, col: "hsl(180, 100%, 55%)", label: "P" },
          { c: LANDING_SLEW, col: "hsl(150, 70%, 55%)", label: "L" },
        ].map(({ c, col, label }) => {
          const a1 = roseAngle(c - SECTOR_HALF);
          const a2 = roseAngle(c + SECTOR_HALF);
          const r = 30;
          const p1 = { x: Math.cos(a1) * r, y: Math.sin(a1) * r };
          const p2 = { x: Math.cos(a2) * r, y: Math.sin(a2) * r };
          const pl = { x: Math.cos(roseAngle(c)) * 22, y: Math.sin(roseAngle(c)) * 22 };
          return (
            <g key={label}>
              <path d={`M ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`}
                fill="none" stroke={col} strokeWidth={4} strokeOpacity={0.6} strokeLinecap="round" />
              <text x={pl.x} y={pl.y + 3} textAnchor="middle" fontSize={8} fontFamily="monospace" fill={col}>{label}</text>
            </g>
          );
        })}
        {/* Ticks */}
        {[0, 45, 90, 135, 180].map((d) => {
          const a = roseAngle(d);
          return (
            <line key={d}
              x1={Math.cos(a) * 32} y1={Math.sin(a) * 32}
              x2={Math.cos(a) * 36} y2={Math.sin(a) * 36}
              stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeOpacity={0.5} />
          );
        })}
        {/* Needle (boom direction) */}
        <line x1={0} y1={0}
          x2={Math.cos(roseAngle(slewDeg)) * 30} y2={Math.sin(roseAngle(slewDeg)) * 30}
          stroke={accentColor} strokeWidth={2.5} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${accentColor}70)` }} />
        <circle cx={0} cy={0} r={3.5} fill="hsl(var(--card))" stroke={accentColor} strokeWidth={1.5} />
        <text x={0} y={52} textAnchor="middle" fontSize={10} fontFamily="monospace" fill={accentColor}>
          {Math.round(slewDeg).toString().padStart(3, "0")}°
        </text>
      </g>

      {/* Wind indicator */}
      <g transform="translate(140, 40)">
        <text x={0} y={-4} fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.75}>WIND</text>
        <line x1={0} y1={6} x2={windArrowLen} y2={6} stroke={accentColor} strokeWidth={1.5} strokeOpacity={0.8} />
        <polygon points={`${windArrowLen},6 ${windArrowLen - 6},2 ${windArrowLen - 6},10`} fill={accentColor} fillOpacity={0.85} />
        <text x={0} y={22} fontSize={10} fontFamily="monospace" fill={accentColor} opacity={0.9}>
          {windKt.toFixed(0)} kt
        </text>
      </g>

      {/* Hook load readout near hook */}
      {cargoState === "carried" && hookLoadT > 0.2 && (
        <text x={hook.x + 14} y={hook.y - 8} fontSize={9} fontFamily="monospace"
          fill="hsl(38, 85%, 65%)" opacity={0.9}>
          {hookLoadT.toFixed(1)} t
        </text>
      )}

      {/* Mode + LIVE badge */}
      <g transform={`translate(${VB_W - 20}, 40)`}>
        <text x={0} y={0} textAnchor="end" fontSize={10} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.85}>
          MODE · {modeLabel}
        </text>
        {running && !eStop && (
          <g>
            <circle cx={-6} cy={14} r={3.5} fill="hsl(0, 75%, 60%)">
              <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <text x={-14} y={18} textAnchor="end" fontSize={9} fontFamily="monospace" fill="hsl(0, 75%, 70%)">LIVE</text>
          </g>
        )}
      </g>

      {/* Scale ruler: 10 m = 120 px */}
      <g transform={`translate(${VB_W - 150}, ${VB_H - 24})`}>
        <line x1={0} y1={6} x2={120} y2={6} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1} />
        {[0, 30, 60, 90, 120].map((x) => (
          <line key={x} x1={x} y1={3} x2={x} y2={9} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} strokeWidth={1} />
        ))}
        <text x={60} y={20} textAnchor="middle" fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.6}>
          10 m
        </text>
      </g>
    </svg>
  );
};

export default CraneScene;
