/**
 * P&ID-style mimic of a medium-speed main engine with its lube-oil,
 * LT freshwater and seawater cooling circuits. Pure presentation —
 * all values come from the simulation.
 *
 * Drawn in layers: equipment backdrop → piping → rotating machinery →
 * text. Every label anchor is kept out of the pipe runs, so no readout
 * is struck through by a line. Where the seawater overboard run has to
 * cross the freshwater header it uses a pipe hop, not a bare crossing —
 * the two circuits are close in hue and a plain crossing reads as a tee.
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
const EXH = "hsl(15, 62%, 52%)";
const EXH_HOT = "hsl(15, 70%, 58%)";
const DEAD = "hsl(210, 15%, 32%)";
const HOT = "hsl(0, 70%, 55%)";
const MUTED = "hsl(var(--muted-foreground))";

const Pipe = ({ d, color, on, speed = 1.4 }: { d: string; color: string; on: boolean; speed?: number }) => (
  <>
    <path d={d} fill="none" stroke={on ? color : DEAD} strokeOpacity={on ? 0.4 : 0.45} strokeWidth={2} />
    {on && (
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeDasharray="3 9"
        strokeLinecap="round" className="sld-flow" style={{ animationDuration: `${speed}s` }} />
    )}
  </>
);

/** Centrifugal pump: circle with rotation indicator. Label lives in the text layer. */
const Pump = ({ x, y, color, run }: { x: number; y: number; color: string; run: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={11} fill="hsl(var(--background))" fillOpacity={0.85}
      stroke={run ? color : DEAD} strokeWidth={1.6} />
    <polygon points={`${x - 4},${y - 5} ${x - 4},${y + 5} ${x + 6},${y}`} fill={run ? color : DEAD} />
    {run && (
      <circle cx={x} cy={y} r={14} fill="none" stroke={color} strokeWidth={0.8} strokeOpacity={0.5}
        strokeDasharray="3 8" className="sld-spin" style={{ transformOrigin: `${x}px ${y}px` }} />
    )}
  </g>
);

/**
 * Plate cooler. Pipes terminate exactly on the box edges, so a cooler with
 * ports on all four sides reads as cross-flow without drawing lines through it.
 */
const Cooler = ({ x, y, w = 32, h = 26 }: { x: number; y: number; w?: number; h?: number }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={2}
      fill="hsl(var(--background))" fillOpacity={0.88} stroke={MUTED} strokeWidth={1.2} strokeOpacity={0.75} />
    <line x1={x - w / 2} y1={y + h / 2} x2={x + w / 2} y2={y - h / 2}
      stroke={MUTED} strokeWidth={1} strokeOpacity={0.5} />
  </g>
);

/** Sea chest / overboard hull penetration with grating. */
const Grating = ({ x, y }: { x: number; y: number }) => (
  <g stroke={SW} strokeOpacity={0.8}>
    <rect x={x - 16} y={y} width={32} height={9} rx={1} fill="hsl(var(--background))" fillOpacity={0.6} strokeWidth={1.2} />
    <line x1={x - 6} y1={y + 1} x2={x - 6} y2={y + 8} strokeWidth={0.9} strokeOpacity={0.5} />
    <line x1={x + 6} y1={y + 1} x2={x + 6} y2={y + 8} strokeWidth={0.9} strokeOpacity={0.5} />
  </g>
);

/** Equipment / section caption. */
const Label = ({ x, y, text, color, anchor = "middle", size = 8.5 }: {
  x: number; y: number; text: string; color?: string; anchor?: "middle" | "start" | "end"; size?: number;
}) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fontFamily="monospace"
    fill={color ?? MUTED} opacity={0.85}>{text}</text>
);

/** Live value readout. */
const Tag = ({ x, y, text, color, anchor = "middle", size = 9 }: {
  x: number; y: number; text: string; color?: string; anchor?: "middle" | "start" | "end"; size?: number;
}) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fontFamily="monospace" className="tabular-nums"
    fill={color ?? "hsl(var(--foreground))"} opacity={0.92}>{text}</text>
);

const EngineMimic = ({ s }: { s: EngineMimicState }) => {
  const running = s.rpm > 5;
  const engineCol = s.shutdown ? HOT : running ? "hsl(200, 100%, 60%)" : DEAD;
  const exhCol = running ? EXH : DEAD;
  const meanT = s.cylTemps.reduce((a, b) => a + b, 0) / s.cylTemps.length;

  const loAny = s.loMainRun || s.loStbyRun;
  const swAny = s.swMainRun || s.swStbyRun;
  const toCooler = running && s.fwValvePct > 4;
  const toBypass = running && s.fwValvePct < 96;

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 940 430" className="w-full min-w-[690px]" role="img" aria-label="Engine room mimic">
        {/* ══ Layer 1: equipment backdrop — piping terminates on these edges ══ */}
        <rect x={340} y={150} width={260} height={125} rx={4}
          fill="hsl(var(--background))" fillOpacity={0.75}
          stroke={engineCol} strokeWidth={1.8}
          style={{ transition: "stroke 0.4s ease", filter: running ? `drop-shadow(0 0 6px ${engineCol}30)` : "none" }} />
        {/* FW cooler: FW vertically (top/bottom ports), SW horizontally (left/right ports) */}
        <Cooler x={200} y={258} w={44} h={40} />
        <Cooler x={850} y={250} />

        {/* ══ Layer 2: exhaust side ══ */}
        <g>
          {/* Cylinder heads with their exhaust risers */}
          {s.cylTemps.map((tC, i) => {
            const x = 362 + i * 38;
            const dev = tC - meanT;
            const col = Math.abs(dev) > 35 ? HOT : Math.abs(dev) > 22 ? LO : MUTED;
            return (
              <g key={i}>
                <line x1={x + 13} y1={136} x2={x + 13} y2={118} stroke={exhCol} strokeWidth={1.5} strokeOpacity={0.75} />
                <rect x={x} y={136} width={26} height={14} rx={2}
                  fill="hsl(var(--card))" stroke={col} strokeWidth={1} strokeOpacity={0.8} />
                <text x={x + 13} y={146.5} textAnchor="middle" fontSize={8} fontFamily="monospace"
                  className="tabular-nums" fill={col}>{Math.round(tC)}°</text>
              </g>
            );
          })}
          {/* Manifold runs into the turbocharger casing — no gap */}
          <line x1={369} y1={118} x2={634} y2={118} stroke={exhCol} strokeWidth={2.5} strokeOpacity={0.85} />
          <circle cx={650} cy={118} r={16} fill="hsl(var(--background))" fillOpacity={0.85}
            stroke={running ? EXH_HOT : DEAD} strokeWidth={1.6} />
          {running && (
            <circle cx={650} cy={118} r={11} fill="none" stroke={EXH_HOT} strokeWidth={1}
              strokeOpacity={0.7} strokeDasharray="4 6" className="sld-spin"
              style={{ transformOrigin: "650px 118px", animationDuration: "1.2s" }} />
          )}
          {/* Turbine outlet up to the funnel */}
          <line x1={650} y1={102} x2={650} y2={78} stroke={exhCol} strokeWidth={2} strokeOpacity={0.8} />
          <polygon points="650,66 644,78 656,78" fill={exhCol} fillOpacity={0.85} />
        </g>

        {/* ══ Layer 3: lube oil circuit (right) — pumps in parallel off a common header ══ */}
        <g>
          <Pipe d="M 600 255 L 700 255 L 700 380" color={LO} on={running || loAny} />
          <Pipe d="M 700 330 L 766 330" color={LO} on={s.loMainRun} />
          <Pipe d="M 700 380 L 766 380" color={LO} on={s.loStbyRun} />
          <Pipe d="M 794 330 L 850 330" color={LO} on={s.loMainRun} />
          <Pipe d="M 794 380 L 850 380 L 850 330" color={LO} on={s.loStbyRun} />
          <Pipe d="M 850 330 L 850 263" color={LO} on={loAny} />
          <Pipe d="M 850 237 L 850 170 L 600 170" color={LO} on={loAny} />
        </g>

        {/* ══ Layer 4: LT freshwater circuit (left) ══ */}
        <g>
          <Pipe d="M 340 180 L 314 180" color={FW} on={running} />
          <Pipe d="M 286 180 L 200 180 L 200 238" color={FW} on={toCooler} speed={2} />
          <Pipe d="M 200 278 L 200 312 L 300 312" color={FW} on={toCooler} speed={2} />
          <Pipe d="M 300 194 L 300 312" color={FW} on={toBypass} speed={2} />
          <Pipe d="M 300 312 L 316 312" color={FW} on={running} />
          <Pipe d="M 344 312 L 400 312 L 400 275" color={FW} on={running} />
          {/* 3-way thermostatic valve: three triangles meeting at the seat.
              Each leg is dimmed when that port is shut, so the split is readable. */}
          <g fill="hsl(var(--background))" fillOpacity={0.85} strokeWidth={1.3}>
            <polygon points="314,171 314,189 300,180" stroke={running ? FW : DEAD} />
            <polygon points="286,171 286,189 300,180" stroke={toCooler ? FW : DEAD} />
            <polygon points="291,194 309,194 300,180" stroke={toBypass ? FW : DEAD} />
          </g>
        </g>

        {/* ══ Layer 5: seawater circuit (bottom-left) — parallel pumps, through the
              FW cooler, then overboard. The overboard run hops the FW header. ══ */}
        <g>
          <Grating x={40} y={396} />
          <Pipe d="M 40 396 L 40 330" color={SW} on={swAny} />
          <Pipe d="M 40 330 L 86 330" color={SW} on={s.swMainRun} />
          <Pipe d="M 40 380 L 86 380" color={SW} on={s.swStbyRun} />
          <Pipe d="M 114 330 L 150 330" color={SW} on={s.swMainRun} />
          <Pipe d="M 114 380 L 150 380 L 150 330" color={SW} on={s.swStbyRun} />
          <Pipe d="M 150 330 L 150 258 L 178 258" color={SW} on={swAny} speed={1.8} />
          <Pipe d="M 222 258 L 250 258 L 250 304 A 8 8 0 0 1 250 320 L 250 396"
            color={SW} on={swAny} speed={1.8} />
          <Grating x={250} y={396} />
        </g>

        {/* ══ Layer 6: rotating machinery ══ */}
        <Pump x={780} y={330} color={LO} run={s.loMainRun} />
        <Pump x={780} y={380} color={LO} run={s.loStbyRun} />
        <Pump x={330} y={312} color={FW} run={running} />
        <Pump x={100} y={330} color={SW} run={s.swMainRun} />
        <Pump x={100} y={380} color={SW} run={s.swStbyRun} />

        {/* ══ Layer 7: all text, drawn last ══ */}
        <g>
          {/* Engine */}
          <text x={470} y={198} textAnchor="middle" fontSize={14} fontFamily="monospace" fontWeight={600}
            fill={engineCol}>MAIN ENGINE</text>
          <Label x={470} y={219} text="6L26 — 2 040 kW" size={9.5} />
          <Tag x={470} y={243} text={`${Math.round(s.rpm)} rpm · ${Math.round(s.loadPct)} %`} color={engineCol} size={10} />

          {/* Exhaust */}
          <Label x={650} y={152} text="T/C" />
          <Label x={663} y={82} text="EXH" anchor="start" />
          <Tag x={676} y={121} text={`${(s.tcRpm / 1000).toFixed(1)}k`} color={running ? EXH_HOT : DEAD} anchor="start" />

          {/* Lube oil */}
          <Label x={620} y={196} text="LUBE OIL" color={LO} anchor="start" size={9.5} />
          <Label x={828} y={254} text="LO CLR" anchor="end" />
          <Label x={780} y={356} text="LO P1" />
          <Label x={780} y={406} text="LO P2" />
          <Tag x={874} y={174} text={`${s.loPressBar.toFixed(1)} bar`} color={s.loPressBar < 2.5 ? HOT : LO} anchor="start" />
          <Tag x={874} y={254} text={`${Math.round(s.loTempC)}°C`} color={LO} anchor="start" />

          {/* LT freshwater */}
          <Label x={40} y={168} text="LT FRESHWATER" color={FW} anchor="start" size={9.5} />
          <Label x={300} y={162} text="TV" color={FW} />
          <Label x={170} y={228} text="FW CLR" anchor="end" />
          <Label x={330} y={338} text="FW P" />
          <Tag x={250} y={168} text={`${s.fwTempC.toFixed(1)}°C`} color={s.fwTempC > 90 ? HOT : FW} />
          <Tag x={284} y={207} text={`${Math.round(s.fwValvePct)}%`} color={FW} anchor="end" />

          {/* Seawater */}
          <Label x={28} y={300} text="SEAWATER" color={SW} anchor="start" size={9.5} />
          <Label x={100} y={356} text="SW P1" />
          <Label x={100} y={406} text="SW P2" />
          <Label x={40} y={418} text="SEA CHEST" color={SW} />
          <Label x={250} y={418} text="OVBD" color={SW} />
        </g>

        {/* ══ Status banners ══ */}
        {s.shutdown && (
          <g>
            <rect x={365} y={40} width={210} height={26} rx={4} fill={HOT} fillOpacity={0.12} stroke={HOT} strokeWidth={1} />
            <text x={470} y={57} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={600}
              fill={HOT} className="animate-pulse">ENGINE SHUTDOWN</text>
          </g>
        )}
        {!s.shutdown && s.slowdown && (
          <g>
            <rect x={365} y={40} width={210} height={26} rx={4} fill={LO} fillOpacity={0.12} stroke={LO} strokeWidth={1} />
            <text x={470} y={57} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={600}
              fill={LO} className="animate-pulse">SLOWDOWN ACTIVE</text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default EngineMimic;
