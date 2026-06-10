import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, Radio, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Minus, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HMIPanel from "@/components/hmi/HMIPanel";
import DigitalDisplay from "@/components/hmi/DigitalDisplay";
import DemoExplainer from "@/components/hmi/DemoExplainer";
import DemoPagerNav from "@/components/DemoPagerNav";
import { Slider } from "@/components/ui/slider";
import DPScene, { TrailPoint } from "@/components/dp/DPScene";
import ThrusterPanel, { ThrusterView } from "@/components/dp/ThrusterPanel";
import DPJoystick from "@/components/dp/DPJoystick";

const TICK_MS = 100;

// ── Vessel model (80 m PSV) ──
const MASS_T = 5000;          // tonnes
const YAW_INERTIA = 2.5e6;    // t·m²
const D_SURGE = 250;          // kN per m/s
const D_SWAY = 420;
const D_YAW = 3.0e6;          // kNm per rad/s

// ── Controller gains ──
const KP_POS = 100;           // kN/m
const KD_POS = 1500;          // kN/(m/s)
const KI_POS = 4;             // kN/(m·s)
const KI_CLAMP = 260;         // kN
const KP_YAW = 4.0e5;         // kNm/rad
const KD_YAW = 5.0e6;         // kNm/(rad/s)

// ── Environment coefficients ──
const K_WIND = 0.25;          // kN per kt²
const K_CURRENT = 45;         // kN per kt²
const K_WAVE = 8;             // kN per m² (drift)

const WARN_RADIUS = 3;        // m
const ALARM_RADIUS = 5;       // m

interface ThrusterSim {
  id: string;
  name: string;
  type: "tunnel" | "azimuth";
  posX: number;               // m fwd of CoG
  posY: number;               // m stbd of CoG
  maxKn: number;
  ratedKw: number;
  fx: number;                 // applied force, body frame (kN)
  fy: number;
  failed: boolean;
  saturated: boolean;
}

const initialThrusters = (): ThrusterSim[] => [
  { id: "T1", name: "Bow Tunnel 1", type: "tunnel", posX: 34, posY: 0, maxKn: 200, ratedKw: 800, fx: 0, fy: 0, failed: false, saturated: false },
  { id: "T2", name: "Bow Tunnel 2", type: "tunnel", posX: 27, posY: 0, maxKn: 200, ratedKw: 800, fx: 0, fy: 0, failed: false, saturated: false },
  { id: "T3", name: "Azimuth Port", type: "azimuth", posX: -30, posY: -8, maxKn: 350, ratedKw: 2200, fx: 0, fy: 0, failed: false, saturated: false },
  { id: "T4", name: "Azimuth Stbd", type: "azimuth", posX: -30, posY: 8, maxKn: 350, ratedKw: 2200, fx: 0, fy: 0, failed: false, saturated: false },
];

type DPMode = "auto" | "joystick" | "standby";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const wrapPi = (a: number) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};

const DPDemo = () => {
  const { t } = useLanguage();

  const simRef = useRef({
    // NED position relative to setpoint (m) and heading (rad)
    n: 0.4, e: -0.3, psi: (15 * Math.PI) / 180,
    u: 0, v: 0, r: 0,           // body velocities
    intX: 0, intY: 0,           // controller integrators (body frame)
    thrusters: initialThrusters(),
    wavePhase: 0,
    joySurge: 0, joySway: 0,
  });

  const [mode, setMode] = useState<DPMode>("auto");
  const modeRef = useRef<DPMode>("auto");
  const [headingSet, setHeadingSet] = useState(15);
  const headingSetRef = useRef(15);
  const [windKt, setWindKt] = useState(18);
  const [windDir, setWindDir] = useState(225);
  const [currentKt, setCurrentKt] = useState(0.8);
  const [currentDir, setCurrentDir] = useState(190);
  const [waveHs, setWaveHs] = useState(1.5);
  const envRef = useRef({ windKt: 18, windDir: 225, currentKt: 0.8, currentDir: 190, waveHs: 1.5 });

  const [render, setRender] = useState({
    posN: 0, posE: 0, headingDeg: 15, offsetM: 0, headingErrDeg: 0,
    thrustUtilPct: 0, powerKw: 0,
    thrusters: [] as ThrusterView[],
  });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const trailRef = useRef<TrailPoint[]>([]);
  const trailTimerRef = useRef(0);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { headingSetRef.current = headingSet; }, [headingSet]);
  useEffect(() => {
    envRef.current = { windKt, windDir, currentKt, currentDir, waveHs };
  }, [windKt, windDir, currentKt, currentDir, waveHs]);

  const handleJoystick = useCallback((surge: number, sway: number) => {
    simRef.current.joySurge = surge;
    simRef.current.joySway = sway;
  }, []);

  // ── Sim loop ──
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = TICK_MS / 1000;
      const s = simRef.current;
      const env = envRef.current;
      const m = modeRef.current;

      // 1. Environment forces (NED frame). Directions are "coming FROM".
      const toRad = (d: number) => ((d + 180) * Math.PI) / 180; // force acts toward FROM+180
      const fWind = K_WIND * env.windKt * env.windKt;
      const fCur = K_CURRENT * env.currentKt * env.currentKt;
      const fWave = K_WAVE * env.waveHs * env.waveHs;
      const envN =
        fWind * Math.cos(toRad(env.windDir)) +
        fCur * Math.cos(toRad(env.currentDir)) +
        fWave * Math.cos(toRad(env.windDir));
      const envE =
        fWind * Math.sin(toRad(env.windDir)) +
        fCur * Math.sin(toRad(env.currentDir)) +
        fWave * Math.sin(toRad(env.windDir));

      // Rotate env into body frame
      const cos = Math.cos(s.psi);
      const sin = Math.sin(s.psi);
      const envX = envN * cos + envE * sin;
      const envY = -envN * sin + envE * cos;
      // Weathervaning moments — pressure centres offset from CoG
      const envM = envY * 10 * (fWind / Math.max(1, fWind + fCur)) + envY * 4 * (fCur / Math.max(1, fWind + fCur));

      // 2. Controller demands (body frame)
      let demX = 0, demY = 0, demM = 0;
      const psiSet = (headingSetRef.current * Math.PI) / 180;
      const ePsi = wrapPi(psiSet - s.psi);

      if (m === "auto") {
        // Position error (setpoint at origin), NED → body
        const eN = -s.n;
        const eE = -s.e;
        const eX = eN * cos + eE * sin;
        const eY = -eN * sin + eE * cos;
        s.intX = clamp(s.intX + eX * KI_POS * dt, -KI_CLAMP, KI_CLAMP);
        s.intY = clamp(s.intY + eY * KI_POS * dt, -KI_CLAMP, KI_CLAMP);
        demX = KP_POS * eX - KD_POS * s.u + s.intX;
        demY = KP_POS * eY - KD_POS * s.v + s.intY;
        demM = KP_YAW * ePsi - KD_YAW * s.r;
      } else if (m === "joystick") {
        demX = s.joySurge * 500;
        demY = s.joySway * 500;
        demM = KP_YAW * ePsi - KD_YAW * s.r; // heading hold stays active
        s.intX = 0; s.intY = 0;
      } else {
        s.intX = 0; s.intY = 0;
      }

      // 3. Thrust allocation
      const th = s.thrusters;
      th.forEach((tt) => { tt.fx = 0; tt.fy = 0; tt.saturated = false; });

      if (m !== "standby") {
        const tunnels = th.filter((tt) => tt.type === "tunnel" && !tt.failed);
        const azis = th.filter((tt) => tt.type === "azimuth" && !tt.failed);

        const bowArm = tunnels.length
          ? tunnels.reduce((sum, tt) => sum + tt.posX, 0) / tunnels.length
          : 30;
        const sternArm = -30;

        // Split sway demand between bow & stern groups to satisfy the moment
        let fyBow = 0, fyStern = 0;
        if (tunnels.length > 0 && azis.length > 0) {
          fyBow = (demM - sternArm * demY) / (bowArm - sternArm);
          fyStern = demY - fyBow;
        } else if (azis.length > 0) {
          fyStern = demY;
        } else if (tunnels.length > 0) {
          fyBow = demY;
        }

        // Bow tunnels share their group demand
        if (tunnels.length) {
          const each = fyBow / tunnels.length;
          tunnels.forEach((tt) => {
            tt.fy = clamp(each, -tt.maxKn, tt.maxKn);
            if (Math.abs(each) > tt.maxKn) tt.saturated = true;
          });
        }

        // Azimuths: share surge + stern sway; differential surge makes
        // yaw moment when both tunnels are lost
        if (azis.length) {
          const fxEach = demX / azis.length;
          const fyEach = fyStern / azis.length;
          let residualM = 0;
          if (tunnels.length === 0 && azis.length === 2) {
            residualM = demM - sternArm * fyStern;
          }
          azis.forEach((tt) => {
            let fx = fxEach;
            if (residualM !== 0 && azis.length === 2) {
              // M = ΔFx · y-offset; split between the pair
              fx += (residualM / (2 * Math.abs(tt.posY))) * (tt.posY > 0 ? 1 : -1);
            }
            const mag = Math.hypot(fx, fyEach);
            const scale = mag > tt.maxKn ? tt.maxKn / mag : 1;
            if (mag > tt.maxKn) tt.saturated = true;
            tt.fx = fx * scale;
            tt.fy = fyEach * scale;
          });
        }
      }

      // Applied totals from actual (clamped) thruster forces
      const thrX = th.reduce((sum, tt) => sum + tt.fx, 0);
      const thrY = th.reduce((sum, tt) => sum + tt.fy, 0);
      const thrM = th.reduce((sum, tt) => sum + tt.fy * tt.posX - tt.fx * tt.posY, 0);

      // 4. 3-DOF dynamics
      const du = (thrX + envX - D_SURGE * s.u) / MASS_T;
      const dv = (thrY + envY - D_SWAY * s.v) / MASS_T;
      const dr = (thrM + envM - D_YAW * s.r) / YAW_INERTIA;
      s.u += du * dt;
      s.v += dv * dt;
      s.r += dr * dt;
      s.n += (s.u * cos - s.v * sin) * dt;
      s.e += (s.u * sin + s.v * cos) * dt;
      s.psi += s.r * dt;

      // 5. First-order wave motion — display only; the controller sees the
      //    wave-filtered (low-frequency) position, like a real DP system.
      s.wavePhase += dt * 0.8;
      const waveAmp = env.waveHs * 0.12;
      const waveDirRad = toRad(env.windDir);
      const dispN = s.n + waveAmp * Math.sin(s.wavePhase) * Math.cos(waveDirRad);
      const dispE = s.e + waveAmp * Math.sin(s.wavePhase * 1.13 + 0.7) * Math.sin(waveDirRad);

      // 6. Trail (2 Hz)
      trailTimerRef.current += dt;
      if (trailTimerRef.current >= 0.5) {
        trailTimerRef.current = 0;
        trailRef.current = [...trailRef.current.slice(-119), { n: dispN, e: dispE }];
        setTrail(trailRef.current);
      }

      // 7. Mirror to render state
      const psiDeg = ((s.psi * 180) / Math.PI) % 360;
      const offsetM = Math.hypot(s.n, s.e);
      const totalCap = th.filter((tt) => !tt.failed).reduce((sum, tt) => sum + tt.maxKn, 0);
      const totalThrust = th.reduce((sum, tt) => sum + Math.hypot(tt.fx, tt.fy), 0);
      const powerKw = th.reduce(
        (sum, tt) => sum + (tt.failed ? 0 : tt.ratedKw * Math.pow(Math.hypot(tt.fx, tt.fy) / tt.maxKn, 1.5)),
        0
      );

      setRender({
        posN: dispN,
        posE: dispE,
        headingDeg: psiDeg,
        offsetM,
        headingErrDeg: (wrapPi(psiSet - s.psi) * 180) / Math.PI,
        thrustUtilPct: totalCap > 0 ? (totalThrust / totalCap) * 100 : 0,
        powerKw,
        thrusters: th.map((tt) => {
          const mag = Math.hypot(tt.fx, tt.fy);
          return {
            id: tt.id,
            name: tt.name,
            type: tt.type,
            thrustPct: (mag / tt.maxKn) * 100,
            directionDeg: mag > 0.5 ? (Math.atan2(tt.fy, tt.fx) * 180) / Math.PI : tt.type === "tunnel" ? 90 : 0,
            maxKn: tt.maxKn,
            failed: tt.failed,
            saturated: tt.saturated,
          };
        }),
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──
  const handleToggleFail = (idx: number) => {
    const tt = simRef.current.thrusters[idx];
    tt.failed = !tt.failed;
    if (tt.failed) { tt.fx = 0; tt.fy = 0; }
  };

  const handleStepSetpoint = (dN: number, dE: number) => {
    // Plot is centred on the setpoint, so stepping it shifts the vessel's
    // relative position the opposite way; the controller then pulls it in.
    simRef.current.n -= dN;
    simRef.current.e -= dE;
    trailRef.current = trailRef.current.map((p) => ({ n: p.n - dN, e: p.e - dE }));
  };

  const handleReset = () => {
    const s = simRef.current;
    s.n = 0.4; s.e = -0.3; s.psi = (15 * Math.PI) / 180;
    s.u = 0; s.v = 0; s.r = 0;
    s.intX = 0; s.intY = 0;
    s.thrusters = initialThrusters();
    trailRef.current = [];
    setTrail([]);
    setHeadingSet(15);
    setWindKt(18); setWindDir(225);
    setCurrentKt(0.8); setCurrentDir(190);
    setWaveHs(1.5);
    setMode("auto");
  };

  // ── Derived ──
  const posWarn = render.offsetM > WARN_RADIUS;
  const posAlarm = render.offsetM > ALARM_RADIUS;
  const hdgWarn = Math.abs(render.headingErrDeg) > 3;
  const anyFailed = render.thrusters.some((tt) => tt.failed);
  const anySaturated = render.thrusters.some((tt) => tt.saturated);
  const statusColor = posAlarm ? "hsl(0, 70%, 55%)" : posWarn || anySaturated ? "hsl(38, 85%, 60%)" : "hsl(150, 70%, 55%)";

  const modeBtn = (m: DPMode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={`flex-1 px-2 py-2 rounded font-mono text-[10px] uppercase tracking-wider border transition-colors ${
        mode === m
          ? "bg-primary/15 border-primary/50 text-primary"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      {label}
    </button>
  );

  const envSlider = (
    label: string, value: number, set: (v: number) => void,
    min: number, max: number, step: number, unit: string
  ) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="font-mono text-[10px] tabular-nums text-primary">{value.toFixed(step < 1 ? 1 : 0)} {unit}</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => set(v[0])} min={min} max={max} step={step} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16">
        <div className="pointer-events-none fixed inset-0 z-30 hmi-scanlines" />

        {/* Top status bar */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                DP — {mode === "auto" ? "AUTO POSITION" : mode === "joystick" ? "JOYSTICK" : "STANDBY"}
              </span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {t("dp.station")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
              <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: statusColor }}>
                {posAlarm ? t("dp.status.alarm") : posWarn ? t("dp.status.warning") : t("dp.status.inPosition")}
              </span>
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Page intro */}
          <div className="text-center max-w-3xl mx-auto pt-2 pb-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("dp.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("dp.subtitle")}</p>
          </div>

          {/* Alarm bar */}
          {(posAlarm || (posWarn && mode === "auto") || anyFailed) && (
            <div className="alarm-pulse flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border">
              <AlertTriangle className="w-4 h-4 animate-pulse" style={{ color: posAlarm ? "hsl(0, 70%, 55%)" : "hsl(38, 85%, 60%)" }} />
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: posAlarm ? "hsl(0, 70%, 55%)" : "hsl(38, 85%, 60%)" }}>
                {posAlarm ? t("dp.alarm.position") : anyFailed ? t("dp.alarm.thruster") : t("dp.alarm.excursion")}
              </span>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HMIPanel title={t("dp.kpi.offset")} glowColor={statusColor}>
              <DigitalDisplay value={render.offsetM} label={t("dp.kpi.fromSetpoint")} unit="m" color={statusColor} size="lg" />
            </HMIPanel>
            <HMIPanel title={t("dp.kpi.heading")} glowColor={hdgWarn ? "hsl(38, 85%, 60%)" : "hsl(200, 100%, 60%)"}>
              <div className="flex items-end gap-3">
                <DigitalDisplay
                  value={`${Math.round(((render.headingDeg % 360) + 360) % 360).toString().padStart(3, "0")}°`}
                  label={t("dp.kpi.actual")}
                  color="hsl(200, 100%, 60%)"
                  size="lg"
                />
                <span className="font-mono text-[10px] text-muted-foreground pb-1 tabular-nums">
                  SET {headingSet.toString().padStart(3, "0")}°
                </span>
              </div>
            </HMIPanel>
            <HMIPanel title={t("dp.kpi.thrust")} glowColor={anySaturated ? "hsl(38, 85%, 60%)" : "hsl(180, 100%, 55%)"}>
              <DigitalDisplay
                value={Math.round(render.thrustUtilPct)}
                label={t("dp.kpi.utilization")}
                unit="%"
                color={anySaturated ? "hsl(38, 85%, 60%)" : "hsl(180, 100%, 55%)"}
                size="lg"
              />
            </HMIPanel>
            <HMIPanel title={t("dp.kpi.power")} glowColor="hsl(200, 100%, 60%)">
              <DigitalDisplay value={Math.round(render.powerKw)} label={t("dp.kpi.consumption")} unit="kW" color="hsl(200, 100%, 60%)" size="lg" />
            </HMIPanel>
          </div>

          {/* Main: scene + controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <HMIPanel title={t("dp.scene.title")} className="lg:col-span-2" glowColor={posAlarm ? "hsl(0, 70%, 55%)" : undefined}>
              <DPScene
                posN={render.posN}
                posE={render.posE}
                headingDeg={render.headingDeg}
                headingSetDeg={headingSet}
                trail={trail}
                windKt={windKt}
                windFromDeg={windDir}
                currentKt={currentKt}
                currentFromDeg={currentDir}
                warnRadius={WARN_RADIUS}
                alarmRadius={ALARM_RADIUS}
                labels={{ setpoint: t("dp.scene.setpoint"), wind: t("dp.scene.wind"), current: t("dp.scene.current") }}
              />
            </HMIPanel>

            <div className="space-y-4">
              {/* Mode + joystick */}
              <HMIPanel title={t("dp.mode.title")}>
                <div className="space-y-3">
                  <div className="flex gap-1.5">
                    {modeBtn("auto", t("dp.mode.auto"))}
                    {modeBtn("joystick", t("dp.mode.joystick"))}
                    {modeBtn("standby", t("dp.mode.standby"))}
                  </div>

                  <DPJoystick onChange={handleJoystick} disabled={mode !== "joystick"} />

                  {/* Heading setpoint */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{t("dp.mode.headingSet")}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHeadingSet((h) => (h + 355) % 360)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-sm tabular-nums text-primary w-12 text-center">
                        {headingSet.toString().padStart(3, "0")}°
                      </span>
                      <button
                        onClick={() => setHeadingSet((h) => (h + 5) % 360)}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Setpoint step */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{t("dp.mode.stepSetpoint")}</span>
                    <div className="grid grid-cols-3 gap-1">
                      <div />
                      <button onClick={() => handleStepSetpoint(2, 0)} disabled={mode !== "auto"}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <div />
                      <button onClick={() => handleStepSetpoint(0, -2)} disabled={mode !== "auto"}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleStepSetpoint(-2, 0)} disabled={mode !== "auto"}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleStepSetpoint(0, 2)} disabled={mode !== "auto"}
                        className="w-7 h-7 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> {t("dp.mode.reset")}
                  </button>
                </div>
              </HMIPanel>

              {/* Environment */}
              <HMIPanel title={t("dp.env.title")} glowColor="hsl(180, 100%, 55%)">
                <div className="space-y-3.5">
                  {envSlider(t("dp.env.windSpeed"), windKt, setWindKt, 0, 50, 1, "kt")}
                  {envSlider(t("dp.env.windDir"), windDir, setWindDir, 0, 359, 1, "°")}
                  {envSlider(t("dp.env.currentSpeed"), currentKt, setCurrentKt, 0, 3, 0.1, "kt")}
                  {envSlider(t("dp.env.currentDir"), currentDir, setCurrentDir, 0, 359, 1, "°")}
                  {envSlider(t("dp.env.waveHeight"), waveHs, setWaveHs, 0, 5, 0.1, "m")}
                </div>
              </HMIPanel>
            </div>
          </div>

          {/* Thruster row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {render.thrusters.map((tt, i) => (
              <ThrusterPanel
                key={tt.id}
                thruster={tt}
                onToggleFail={() => handleToggleFail(i)}
                labels={{
                  run: t("dp.thruster.run"),
                  failed: t("dp.thruster.failed"),
                  fail: t("dp.thruster.fail"),
                  restore: t("dp.thruster.restore"),
                  tunnel: t("dp.thruster.tunnel"),
                  azimuth: t("dp.thruster.azimuth"),
                }}
              />
            ))}
          </div>

          {/* Explainer */}
          <DemoExplainer
            title={t("dp.explainer.title")}
            items={[
              { title: t("dp.explainer.controlTitle"), body: t("dp.explainer.controlBody") },
              { title: t("dp.explainer.waveTitle"), body: t("dp.explainer.waveBody") },
              { title: t("dp.explainer.redundancyTitle"), body: t("dp.explainer.redundancyBody") },
            ]}
          />
          <DemoPagerNav />
        </div>
      </div>
    </div>
  );
};

export default DPDemo;
