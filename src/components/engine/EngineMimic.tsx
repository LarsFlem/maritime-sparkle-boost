/**
 * P&ID-style mimic of a medium-speed main engine with its lube-oil,
 * LT freshwater and seawater cooling circuits. Pure presentation —
 * all values come from the simulation.
 */

export interface EngineMimicState {
  rpm: number;
  loadPct: number;
  cylTemps: number[]; // 6 exhaust temps °C
  tcRpm: number;
  loPressBar: number;
  loTempC: number;
  loMainRun: boolean;
  loStbyRun: boolean;
  fwTempC: number;
  fwValvePct: number; // 3-way valve, % to cooler
  swMainRun: boolean;
  swStbyRun: boolean;
  shutdown: boolean;
  slowdown: boolean;
}

const LO = "hsl(38, 85%, 60%)";
const FW = "hsl(180, 90%, 55%)";
const SW = "hsl(210, 90%, 65%)";
const DEAD = "hsl(210, 15%, 32%)";
const HOT = "hsl(0, 70%, 55%)";

const Pipe = ({ d, color, on, speed = 1.4 }: { d: string; color: string; on: boolean; speed?: number }) => (
  <>
    <path d={d} fill="none" stroke={on ? color : DEAD} strokeOpacity={on ? 0.4 : 0.45} strokeWidth={2} />
    {on && (
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeDasharray="3 9"
        strokeLinecap="round" className="sld-flow" style={{ animationDuration: `${speed}s` }} />
    )}
  </>
);

/** Centrifugal pump: circle with rotation indicator + run lamp. */
const Pump = ({ x, y, color, run, label }: { x: number; y: number; color: string; run: boolean; label: string }) => (
  <g>
    <circle cx={x} cy={y} r={11} fill="hsl(var(--background))" fillOpacity={0.8}
      stroke={run ? color : DEAD} strokeWidth={1.6} />
    <polygon points={`${x - 4},${y - 5} ${x - 4},${y + 5} ${x + 6},${y}`} fill={run ? color : DEAD} />
    {run && (
      <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.5}
        strokeDasharray="3 8" className="sld-spin" style={{ transformOrigin: `${x}px ${y}px` }} />
    )}
    <text x={x} y={y + 26} textAnchor="middle" fontSize={8} fontFamily="monospace"
      fill={run ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"} opacity={0.8}>{label}</text>
  </g>
);

/** Plate cooler / heat exchanger symbol. */
const Cooler = ({ x, y, label }: { x: number; y: number; label: string }) => (
  <g>
    <rect x={x - 16} y={y - 13} width={32} height={26} rx={2}
      fill="hsl(var(--background))" fillOpacity={0.8} stroke="hsl(var(--muted-foreground))" strokeWidth={1.2} strokeOpacity={0.7} />
    <line x1={x - 16} y1={y + 13} x2={x + 16} y2={y - 13} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeOpacity={0.7} />
    <text x={x} y={y + 25} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.8}>{label}</text>
  </g>
);

/** Live value tag. */
const Tag = ({ x, y, text, color, anchor = "middle" }: { x: number; y: number; text: string; color?: string; anchor?: "middle" | "start" | "end" }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={9} fontFamily="monospace" className="tabular-nums"
    fill={color ?? "hsl(var(--foreground))"} opacity={0.92}>{text}</text>
);

const EngineMimic = ({ s }: { s: EngineMimicState }) => {
  const running = s.rpm > 5;
  const engineCol = s.shutdown ? HOT : running ? "hsl(200, 100%, 60%)" : DEAD;
  const meanT = s.cylTemps.reduce((a, b) => a + b, 0) / s.cylTemps.length;

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 900 400" className="w-full min-w-[720px]" role="img" aria-label="Engine room mimic">
        {/* ── Engine block ── */}
        <g>
          <rect x={330} y={150} width={250} height={120} rx={4}
            fill="hsl(var(--background))" fillOpacity={0.75}
            stroke={engineCol} strokeWidth={1.8}
            style={{ transition: "stroke 0.4s ease", filter: running ? `drop-shadow(0 0 6px ${engineCol}30)` : "none" }} />
          <text x={455} y={222} textAnchor="middle" fontSize={13} fontFamily="monospace" fontWeight={600}
            fill={engineCol}>MAIN ENGINE</text>
          <text x={455} y={238} textAnchor="middle" fontSize={9} fontFamily="monospace"
            fill="hsl(var(--muted-foreground))">6L26 — 2 040 kW</text>
          <Tag x={455} y={258} text={`${Math.round(s.rpm)} rpm · ${Math.round(s.loadPct)} %`} color={engineCol} />

          {/* Cylinder heads + exhaust temps */}
          {s.cylTemps.map((tC, i) => {
            const x = 348 + i * 38;
            const dev = tC - meanT;
            const col = Math.abs(dev) > 35 ? HOT : Math.abs(dev) > 22 ? "hsl(38, 85%, 60%)" : "hsl(var(--muted-foreground))";
            return (
              <g key={i}>
                <rect x={x} y={136} width={26} height={14} rx={2}
                  fill="hsl(var(--card))" stroke={col} strokeWidth={1} strokeOpacity={0.8} />
                <text x={x + 13} y={146} textAnchor="middle" fontSize={7.5} fontFamily="monospace" fill={col}>
                  {Math.round(tC)}°
                </text>
                <line x1={x + 13} y1={136} x2={x + 13} y2={118} stroke={running ? "hsl(15, 60%, 50%)" : DEAD} strokeWidth={1.5} strokeOpacity={0.7} />
              </g>
            );
          })}

          {/* Exhaust manifold → turbocharger */}
          <line x1={355} y1={118} x2={595} y2={118} stroke={running ? "hsl(15, 60%, 50%)" : DEAD} strokeWidth={2.5} strokeOpacity={0.8} />
          <circle cx={620} cy={118} r={16} fill="hsl(var(--background))" fillOpacity={0.8}
            stroke={running ? "hsl(15, 70%, 58%)" : DEAD} strokeWidth={1.6} />
          {running && (
            <circle cx={620} cy={118} r={11} fill="none" stroke="hsl(15, 70%, 58%)" strokeWidth={1}
              strokeOpacity={0.7} strokeDasharray="4 6" className="sld-spin" style={{ transformOrigin: "620px 118px", animationDuration: "1.2s" }} />
          )}
          <text x={620} y={92} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="hsl(var(--muted-foreground))">T/C</text>
          <Tag x={648} y={121} text={`${(s.tcRpm / 1000).toFixed(1)}k`} color={running ? "hsl(15, 70%, 62%)" : DEAD} anchor="start" />
          <line x1={620} y1={134} x2={620} y2={150} stroke={running ? "hsl(15, 60%, 50%)" : DEAD} strokeWidth={2} strokeOpacity={0.6} />
          <text x={700} y={121} fontSize={8} fontFamily="monospace" fill="hsl(var(--muted-foreground))" opacity={0.7}>EXH ↑</text>
        </g>

        {/* ── Lube oil circuit (right) ── */}
        <g>
          <text x={760} y={170} fontSize={9} fontFamily="monospace" fill={LO} opacity={0.85}>LUBE OIL</text>
          {/* Sump → pumps → cooler → engine */}
          <Pipe d="M 580 250 L 700 250 L 700 310" color={LO} on={running || s.loMainRun || s.loStbyRun} />
          <Pipe d="M 700 310 L 760 310" color={LO} on={s.loMainRun} />
          <Pipe d="M 700 310 L 700 350 L 760 350" color={LO} on={s.loStbyRun} />
          <Pump x={775} y={310} color={LO} run={s.loMainRun} label="LO P1" />
          <Pump x={775} y={350} color={LO} run={s.loStbyRun} label="LO P2" />
          <Pipe d="M 790 310 L 830 310 L 830 215" color={LO} on={s.loMainRun || s.loStbyRun} />
          <Pipe d="M 790 350 L 830 350 L 830 310" color={LO} on={s.loStbyRun} />
          <Cooler x={830} y={195} label="LO CLR" />
          <Pipe d="M 830 180 L 830 165 L 580 165" color={LO} on={s.loMainRun || s.loStbyRun} />
          <Tag x={845} y={168} text={`${s.loPressBar.toFixed(1)} bar`} color={s.loPressBar < 2.5 ? HOT : LO} anchor="start" />
          <Tag x={845} y={250} text={`${Math.round(s.loTempC)}°C`} color={LO} anchor="start" />
        </g>

        {/* ── LT freshwater circuit (left) ── */}
        <g>
          <text x={60} y={170} fontSize={9} fontFamily="monospace" fill={FW} opacity={0.85}>LT FRESHWATER</text>
          {/* Engine out → 3-way valve → cooler/bypass → pump → engine in */}
          <Pipe d="M 330 180 L 200 180" color={FW} on={running} />
          {/* 3-way thermostatic valve */}
          <g>
            <polygon points="200,172 184,180 200,188" fill="hsl(var(--background))" stroke={FW} strokeWidth={1.3} />
            <polygon points="184,180 200,180 192,194" fill="hsl(var(--background))" stroke={FW} strokeWidth={1.3} />
            <text x={192} y={162} textAnchor="middle" fontSize={8} fontFamily="monospace" fill={FW}>TV</text>
            <Tag x={192} y={210} text={`${Math.round(s.fwValvePct)}%`} color={FW} />
          </g>
          <Pipe d="M 184 180 L 120 180 L 120 230" color={FW} on={running && s.fwValvePct > 4} speed={2} />
          <Cooler x={120} y={250} label="FW CLR" />
          {/* Bypass */}
          <Pipe d="M 192 194 L 192 290 L 150 290" color={FW} on={running && s.fwValvePct < 96} speed={2} />
          <Pipe d="M 120 270 L 120 290 L 150 290" color={FW} on={running && s.fwValvePct > 4} speed={2} />
          <Pipe d="M 150 290 L 230 290" color={FW} on={running} />
          <Pump x={245} y={290} color={FW} run={running} label="FW P" />
          <Pipe d="M 260 290 L 330 290 L 330 250" color={FW} on={running} />
          <Tag x={300} y={172} text={`${s.fwTempC.toFixed(1)}°C`} color={s.fwTempC > 90 ? HOT : FW} />
        </g>

        {/* ── Seawater circuit (bottom-left) ── */}
        <g>
          <text x={26} y={330} fontSize={9} fontFamily="monospace" fill={SW} opacity={0.85}>SEAWATER</text>
          <Pipe d="M 30 385 L 30 350 L 56 350" color={SW} on={s.swMainRun || s.swStbyRun} />
          <Pipe d="M 30 385 L 90 385 L 90 350" color={SW} on={s.swStbyRun} />
          <Pump x={70} y={350} color={SW} run={s.swMainRun} label="SW P1" />
          <Pump x={104} y={350} color={SW} run={s.swStbyRun} label="SW P2" />
          <Pipe d="M 84 350 L 96 350" color={SW} on={s.swStbyRun} />
          <Pipe d="M 118 350 L 145 350 L 145 264" color={SW} on={s.swMainRun || s.swStbyRun} />
          {/* Through FW cooler, overboard */}
          <Pipe d="M 145 250 L 145 236 L 60 236 L 60 250" color={SW} on={s.swMainRun || s.swStbyRun} speed={1.8} />
          <text x={42} y={262} fontSize={8} fontFamily="monospace" fill={SW} opacity={0.7}>OVBD ↓</text>
          <text x={14} y={398} fontSize={8} fontFamily="monospace" fill={SW} opacity={0.7}>SEA CHEST</text>
        </g>

        {/* ── Status banners ── */}
        {s.shutdown && (
          <g>
            <rect x={350} y={40} width={210} height={26} rx={4} fill={HOT} fillOpacity={0.12} stroke={HOT} strokeWidth={1} />
            <text x={455} y={57} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={600}
              fill={HOT} className="animate-pulse">ENGINE SHUTDOWN</text>
          </g>
        )}
        {!s.shutdown && s.slowdown && (
          <g>
            <rect x={350} y={40} width={210} height={26} rx={4} fill="hsl(38,85%,60%)" fillOpacity={0.12} stroke="hsl(38,85%,60%)" strokeWidth={1} />
            <text x={455} y={57} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={600}
              fill="hsl(38,85%,60%)" className="animate-pulse">SLOWDOWN ACTIVE</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default EngineMimic;
