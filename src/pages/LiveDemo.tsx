import { useState, useEffect, useRef, useMemo } from "react";
import { Radio } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HMIPanel from "@/components/hmi/HMIPanel";
import StatusIndicator from "@/components/hmi/StatusIndicator";
import CraneScene from "@/components/live-demo/CraneScene";
import CraneSequencePanel, {
  CraneMode,
  SequenceStep,
} from "@/components/live-demo/CraneSequencePanel";
import CraneTelemetry from "@/components/live-demo/CraneTelemetry";
import CraneTrend, { TrendPoint } from "@/components/live-demo/CraneTrend";
import CraneAlarms, { CraneAlarm } from "@/components/live-demo/CraneAlarms";
import CraneExplainer from "@/components/live-demo/CraneExplainer";

// --- Sim constants ---
const TICK_MS = 100;            // 10 Hz sim
const TREND_WINDOW_S = 60;
const TREND_CAPACITY = (TREND_WINDOW_S * 1000) / TICK_MS;

const SLEW_RATE = 14;           // %/s rate-limit
const HOIST_RATE = 22;          // %/s rate-limit
const RATED_CAPACITY_T = 12;    // tonnes

// Anti-sway: low-pass smoothing time constant on commands.
const SMOOTH_TAU_MANUAL = 0.05; // ~unfiltered
const SMOOTH_TAU_SEMI = 0.7;    // strong smoothing for anti-sway
const SMOOTH_TAU_AUTO = 0.5;    // moderate (sequence still has to complete)

// Auto sequence step durations in seconds. Targets sized so motion + smoothing
// settle comfortably inside each step at the rate limits above.
const AUTO_STEPS = [
  { id: "pickup_lower", durS: 4.0, slewTarget: 0,   hoistTarget: 0   },
  { id: "pickup_lift",  durS: 4.0, slewTarget: 0,   hoistTarget: 70  },
  { id: "slew",         durS: 9.0, slewTarget: 100, hoistTarget: 70  },
  { id: "setdown",      durS: 4.0, slewTarget: 100, hoistTarget: 0   },
  { id: "return",       durS: 8.0, slewTarget: 0,   hoistTarget: 50  },
] as const;

const TOTAL_AUTO_S = AUTO_STEPS.reduce((s, st) => s + st.durS, 0);

const formatClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const LiveDemo = () => {
  const { t } = useLanguage();

  // --- Plant state (refs for tight inner loop, mirrored to React state for render) ---
  const stateRef = useRef({
    slewPct: 0,           // actual position
    hoistPct: 50,         // start at neutral cruise
    cmdSlew: 0,           // raw command (slider or auto)
    cmdHoist: 50,
    smCmdSlew: 0,         // smoothed (anti-sway) command
    smCmdHoist: 50,
    swayDeg: 0,
    swayVel: 0,
    prevTrolleyX: 0,
    trolleyVel: 0,
    windKt: 18,
    windPhase: 0,
    hydraulicBar: 195,
    motorTorque: 0,
    cargoState: "deck" as "deck" | "carried" | "landed",
    autoElapsedS: 0,
    autoStepIndex: 0,
    autoCycleCount: 0,
    waterPhase: 0,
  });

  const [mode, setMode] = useState<CraneMode>("auto");
  const [running, setRunning] = useState(false);
  const [eStop, setEStop] = useState(false);
  const [cmdSlewUI, setCmdSlewUI] = useState(0);
  const [cmdHoistUI, setCmdHoistUI] = useState(50);

  // Render-driving state (updated every tick).
  const [render, setRender] = useState({
    slewPct: 0,
    hoistPct: 50,
    swayDeg: 0,
    cargoState: "deck" as "deck" | "carried" | "landed",
    windKt: 18,
    hydraulicBar: 195,
    motorTorque: 0,
    autoStepIndex: 0,
    autoStepProgress: 0,
    autoCycleCount: 0,
    waterPhase: 0,
  });

  const [trend, setTrend] = useState<TrendPoint[]>(() => {
    const now = Date.now();
    const arr: TrendPoint[] = [];
    for (let i = TREND_CAPACITY - 1; i >= 0; i--) {
      arr.push({ t: now - i * TICK_MS, load: null, sway: null });
    }
    return arr;
  });

  const alarmStartRef = useRef<Record<string, number>>({});

  // Push UI commands into state ref.
  useEffect(() => {
    stateRef.current.cmdSlew = cmdSlewUI;
  }, [cmdSlewUI]);
  useEffect(() => {
    stateRef.current.cmdHoist = cmdHoistUI;
  }, [cmdHoistUI]);

  // Reset auto progression when mode changes.
  useEffect(() => {
    if (mode === "auto") {
      stateRef.current.autoElapsedS = 0;
      stateRef.current.autoStepIndex = 0;
    }
  }, [mode]);

  // --- Sim loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = TICK_MS / 1000;
      const s = stateRef.current;

      // 1. Wind: slow sin + noise. Range ~10..38 kt typical.
      s.windPhase += dt * 0.06;
      const baseWind = 18 + Math.sin(s.windPhase * 2 * Math.PI) * 9 + Math.sin(s.windPhase * 7) * 3;
      s.windKt = Math.max(0, baseWind + (Math.random() - 0.5) * 1.2);

      // 2. Determine commands depending on mode.
      let cmdSlew = s.cmdSlew;
      let cmdHoist = s.cmdHoist;

      if (mode === "auto" && running && !eStop) {
        s.autoElapsedS += dt;
        // Find current auto step.
        let acc = 0;
        let stepIdx = 0;
        for (let i = 0; i < AUTO_STEPS.length; i++) {
          if (s.autoElapsedS < acc + AUTO_STEPS[i].durS) {
            stepIdx = i;
            break;
          }
          acc += AUTO_STEPS[i].durS;
          stepIdx = i + 1;
        }
        if (stepIdx >= AUTO_STEPS.length) {
          // Cycle complete — reset.
          s.autoElapsedS = 0;
          s.autoCycleCount += 1;
          s.cargoState = "deck"; // fresh container appears
          stepIdx = 0;
        }
        s.autoStepIndex = stepIdx;
        const step = AUTO_STEPS[stepIdx];
        cmdSlew = step.slewTarget;
        cmdHoist = step.hoistTarget;

        // Cargo state transitions
        if (step.id === "pickup_lower") {
          // Approaching deck for pickup
          s.cargoState = "deck";
        } else if (step.id === "pickup_lift") {
          // We've grabbed the container
          if (s.hoistPct < 5) s.cargoState = "carried";
        } else if (step.id === "slew") {
          s.cargoState = "carried";
        } else if (step.id === "setdown") {
          // We release once near deck
          if (s.hoistPct < 5) s.cargoState = "landed";
        } else if (step.id === "return") {
          // Container stays landed; hook returns empty
          s.cargoState = "landed";
        }
      } else if (!running || eStop) {
        // No motion command when stopped.
        // (slider commands held but motion drained by rate limit)
      }

      // 3. Anti-sway smoothing: low-pass filter on commands. Manual mode = nearly transparent.
      const tau = mode === "manual" ? SMOOTH_TAU_MANUAL : mode === "semi" ? SMOOTH_TAU_SEMI : SMOOTH_TAU_AUTO;
      const alpha = 1 - Math.exp(-dt / tau);
      s.smCmdSlew += (cmdSlew - s.smCmdSlew) * alpha;
      s.smCmdHoist += (cmdHoist - s.smCmdHoist) * alpha;

      // 4. Rate-limited motion toward smoothed command.
      const moveAllowed = running && !eStop;
      if (moveAllowed) {
        const slewMax = SLEW_RATE * dt;
        const hoistMax = HOIST_RATE * dt;
        const slewErr = s.smCmdSlew - s.slewPct;
        const hoistErr = s.smCmdHoist - s.hoistPct;
        s.slewPct += Math.max(-slewMax, Math.min(slewMax, slewErr));
        s.hoistPct += Math.max(-hoistMax, Math.min(hoistMax, hoistErr));
      }

      // 5. Sway pendulum. Cable longer when hoistPct low (container near deck).
      const cableLen = 3 + (1 - s.hoistPct / 100) * 9; // 3..12 m
      const omega2 = 9.81 / cableLen;

      // Trolley horizontal position derives from slew. Approximate: trolleyX in metres, span 24m.
      const trolleyX = -s.slewPct * 0.24; // negative = leftward (toward landing)
      const trolleyVel = (trolleyX - s.prevTrolleyX) / dt;
      const trolleyAcc = (trolleyVel - s.trolleyVel) / dt;
      s.prevTrolleyX = trolleyX;
      s.trolleyVel = trolleyVel;

      // Wind-induced sway force (unitless, scaled).
      const windForce = (s.windKt - 18) * 0.0015;
      // Trolley acceleration injects pendulum disturbance.
      const accForce = -trolleyAcc * 0.04;

      const damping = 0.7;
      const swayRad = (s.swayDeg * Math.PI) / 180;
      const swayAcc = -omega2 * Math.sin(swayRad) - damping * s.swayVel + windForce + accForce;
      s.swayVel += swayAcc * dt;
      const newSwayRad = swayRad + s.swayVel * dt;
      s.swayDeg = (newSwayRad * 180) / Math.PI;
      // Hard clamp for sanity
      if (s.swayDeg > 30) {
        s.swayDeg = 30;
        s.swayVel = 0;
      } else if (s.swayDeg < -30) {
        s.swayDeg = -30;
        s.swayVel = 0;
      }

      // 6. Hydraulic pressure responds to motor demand.
      const demand = (Math.abs(s.smCmdSlew - s.slewPct) + Math.abs(s.smCmdHoist - s.hoistPct)) / 2;
      s.motorTorque = Math.min(100, demand * 4 + (s.cargoState === "carried" ? 25 : 0));
      const targetBar = 195 + (s.motorTorque / 100) * 35 - (running ? 0 : 8);
      s.hydraulicBar += (targetBar - s.hydraulicBar) * 0.15 + (Math.random() - 0.5) * 0.6;

      // 7. Water animation phase
      s.waterPhase = (s.waterPhase + dt * 0.18) % 1;

      // 8. Manual-mode commands (apply pending UI values to actual setpoints in a bit smoother way)
      // (Already done via stateRef writes from useEffect.)

      // 9. Mirror to React render state.
      const stepDuration = AUTO_STEPS[s.autoStepIndex]?.durS ?? 1;
      let stepStart = 0;
      for (let i = 0; i < s.autoStepIndex; i++) stepStart += AUTO_STEPS[i].durS;
      const stepProgress = Math.min(1, Math.max(0, (s.autoElapsedS - stepStart) / stepDuration));

      setRender({
        slewPct: s.slewPct,
        hoistPct: s.hoistPct,
        swayDeg: s.swayDeg,
        cargoState: s.cargoState,
        windKt: s.windKt,
        hydraulicBar: s.hydraulicBar,
        motorTorque: s.motorTorque,
        autoStepIndex: s.autoStepIndex,
        autoStepProgress: stepProgress,
        autoCycleCount: s.autoCycleCount,
        waterPhase: s.waterPhase,
      });

      // 10. Push trend point.
      const now = Date.now();
      const loadT = s.cargoState === "carried" ? RATED_CAPACITY_T : 0;
      setTrend(prev => {
        const next = [...prev, { t: now, load: loadT, sway: s.swayDeg }];
        // Keep window
        const cutoff = now - TREND_WINDOW_S * 1000;
        while (next.length > 1 && next[0].t < cutoff) next.shift();
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [mode, running, eStop]);

  // --- Alarm evaluator (memoised; stable IDs keyed by code) ---
  const alarms: CraneAlarm[] = useMemo(() => {
    const result: CraneAlarm[] = [];
    const now = Date.now();
    const start = alarmStartRef.current;
    const seen = new Set<string>();
    const push = (severity: CraneAlarm["severity"], code: string, msg: string) => {
      seen.add(code);
      if (!start[code]) start[code] = now;
      result.push({ id: code, severity, code, msg, ts: start[code] });
    };

    if (eStop) push("critical", "ESD-001", t("liveDemo.alarm.eStop"));
    if (render.windKt > 45) push("critical", "WND-002", t("liveDemo.alarm.windCritical"));
    else if (render.windKt > 35) push("warning", "WND-001", t("liveDemo.alarm.windHigh"));
    if (Math.abs(render.swayDeg) > 10) push("critical", "SWY-002", t("liveDemo.alarm.swayCritical"));
    else if (Math.abs(render.swayDeg) > 5) push("warning", "SWY-001", t("liveDemo.alarm.swayHigh"));
    if (render.hydraulicBar < 165) push("warning", "HYD-001", t("liveDemo.alarm.hydraulicLow"));
    else if (render.hydraulicBar > 240) push("warning", "HYD-002", t("liveDemo.alarm.hydraulicHigh"));
    if (render.cargoState === "carried" && render.hoistPct < 8 && Math.abs(render.swayDeg) > 6) {
      push("warning", "COL-001", t("liveDemo.alarm.collisionRisk"));
    }

    // Drop start times for codes that cleared so re-trigger gets a fresh ts.
    Object.keys(start).forEach(k => {
      if (!seen.has(k)) delete start[k];
    });

    // Sort: critical first, then warnings, then info.
    const sevRank = { critical: 0, warning: 1, info: 2 };
    return result.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  }, [render.windKt, render.swayDeg, render.hydraulicBar, render.cargoState, render.hoistPct, eStop, t]);

  // --- Handlers ---
  const handleStart = () => {
    if (eStop) return;
    setRunning(true);
  };
  const handleStop = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    setEStop(false);
    stateRef.current.slewPct = 0;
    stateRef.current.hoistPct = 50;
    stateRef.current.smCmdSlew = 0;
    stateRef.current.smCmdHoist = 50;
    stateRef.current.swayDeg = 0;
    stateRef.current.swayVel = 0;
    stateRef.current.cargoState = "deck";
    stateRef.current.autoElapsedS = 0;
    stateRef.current.autoStepIndex = 0;
    stateRef.current.autoCycleCount = 0;
    setCmdSlewUI(0);
    setCmdHoistUI(50);
  };
  const handleEStop = () => {
    setEStop(prev => {
      const next = !prev;
      if (next) setRunning(false);
      return next;
    });
  };

  // Manual hook: attach if at the right zone with hook low; release at landing or back at deck.
  const handleHookAction = () => {
    if (eStop || mode === "auto") return;
    const s = stateRef.current;
    if (s.hoistPct > 8) return;
    if (s.cargoState === "carried") {
      // Drop where the hook is.
      s.cargoState = s.slewPct >= 50 ? "landed" : "deck";
    } else if (s.cargoState === "deck" && s.slewPct <= 12) {
      s.cargoState = "carried";
    } else if (s.cargoState === "landed" && s.slewPct >= 88) {
      s.cargoState = "carried";
    }
  };

  // --- Derived ---
  const loadPct = render.cargoState === "carried" ? 100 : 0;
  const hookCarrying = render.cargoState === "carried";
  const atDeckZone = render.slewPct <= 12;
  const atLandingZone = render.slewPct >= 88;
  const hookLow = render.hoistPct <= 8;
  const hookActionEnabled =
    !eStop &&
    mode !== "auto" &&
    hookLow &&
    (hookCarrying || (render.cargoState === "deck" && atDeckZone) || (render.cargoState === "landed" && atLandingZone));
  const hookHint = hookCarrying
    ? hookLow
      ? t("liveDemo.controls.hookHintReleaseReady")
      : t("liveDemo.controls.hookHintLower")
    : !hookLow
    ? t("liveDemo.controls.hookHintLower")
    : render.cargoState === "deck" && !atDeckZone
    ? t("liveDemo.controls.hookHintToPickup")
    : render.cargoState === "landed" && !atLandingZone
    ? t("liveDemo.controls.hookHintToLanding")
    : t("liveDemo.controls.hookHintAttachReady");
  const status = eStop ? "warning" : running ? "operational" : "offline";
  const statusLabel = eStop
    ? t("liveDemo.status.eStop")
    : running
    ? t("liveDemo.status.running")
    : t("liveDemo.status.stopped");

  const modeLabel = mode === "manual"
    ? t("liveDemo.mode.manual")
    : mode === "semi"
    ? t("liveDemo.mode.semi")
    : t("liveDemo.mode.auto");

  const steps: SequenceStep[] = useMemo(() => [
    { id: "pickup_lower", label: t("liveDemo.step.pickupLower") },
    { id: "pickup_lift",  label: t("liveDemo.step.pickupLift") },
    { id: "slew",         label: t("liveDemo.step.slew") },
    { id: "setdown",      label: t("liveDemo.step.setdown") },
    { id: "return",       label: t("liveDemo.step.return") },
  ], [t]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background grid + radial glow */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(200_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(200_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[radial-gradient(ellipse,hsl(200_100%_50%/0.08),transparent_70%)] pointer-events-none" />
      {/* Scan-line overlay (matches HMI Dashboard) */}
      <div className="pointer-events-none fixed inset-0 z-30 hmi-scanlines" />

      <Navbar />

      <div className="pt-16 relative z-10">
        {/* Top status bar */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                {t("liveDemo.statusBar")} — {modeLabel}
              </span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {t("liveDemo.station")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator status={status} label={statusLabel} size="sm" />
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-sm font-semibold tabular-nums hidden sm:inline">
              {formatClock(Date.now())}
            </span>
          </div>
        </div>

      <div className="container mx-auto px-4 pt-6 pb-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {t("liveDemo.title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            {t("liveDemo.subtitle")}
          </p>

          {/* KPI strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 font-mono text-[11px] uppercase tracking-wider">
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.load")}:{" "}
              <span className="text-foreground tabular-nums">
                {(loadPct / 100 * RATED_CAPACITY_T).toFixed(1)} t
              </span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.wind")}:{" "}
              <span className="text-foreground tabular-nums">
                {render.windKt.toFixed(0)} kt
              </span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.mode")}:{" "}
              <span className="text-foreground">{modeLabel}</span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.cycles")}:{" "}
              <span className="text-foreground tabular-nums">{render.autoCycleCount}</span>
            </span>
            <span className="text-muted-foreground">
              UTC:{" "}
              <span className="text-foreground tabular-nums">{formatClock(Date.now())}</span>
            </span>
          </div>
        </div>

        {/* Main row: scene + sequence panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <HMIPanel
            title={t("liveDemo.scene.title")}
            className="lg:col-span-2"
            glowColor={eStop ? "hsl(0, 70%, 60%)" : undefined}
          >
            <div className="relative w-full overflow-hidden rounded border border-border/30 bg-background">
              <div className="aspect-[16/9]">
                <CraneScene
                  slewPct={render.slewPct}
                  hoistPct={render.hoistPct}
                  swayDeg={render.swayDeg}
                  cargoState={render.cargoState}
                  windKt={render.windKt}
                  running={running}
                  eStop={eStop}
                  waterPhase={render.waterPhase}
                  modeLabel={modeLabel}
                />
              </div>
            </div>
          </HMIPanel>

          <HMIPanel title={t("liveDemo.controls.title")}>
            <CraneSequencePanel
              mode={mode}
              onModeChange={setMode}
              running={running}
              eStop={eStop}
              onStart={handleStart}
              onStop={handleStop}
              onReset={handleReset}
              onEStop={handleEStop}
              cmdSlew={cmdSlewUI}
              cmdHoist={cmdHoistUI}
              onCmdSlewChange={setCmdSlewUI}
              onCmdHoistChange={setCmdHoistUI}
              steps={steps}
              activeStepIndex={render.autoStepIndex}
              stepProgress={render.autoStepProgress}
              cycleCount={render.autoCycleCount}
              hookCarrying={hookCarrying}
              hookActionEnabled={hookActionEnabled}
              hookHint={hookHint}
              onHookAction={handleHookAction}
              labels={{
                modeManual: t("liveDemo.mode.manual"),
                modeSemi: t("liveDemo.mode.semi"),
                modeAuto: t("liveDemo.mode.auto"),
                targetSlew: t("liveDemo.controls.targetSlew"),
                targetHoist: t("liveDemo.controls.targetHoist"),
                pickupZone: t("liveDemo.controls.pickup"),
                landingZone: t("liveDemo.controls.landing"),
                deckLevel: t("liveDemo.controls.deck"),
                cruiseHeight: t("liveDemo.controls.cruise"),
                sequence: t("liveDemo.controls.sequence"),
                cycles: t("liveDemo.controls.cycles"),
                start: t("liveDemo.controls.start"),
                stop: t("liveDemo.controls.stop"),
                reset: t("liveDemo.controls.reset"),
                eStop: t("liveDemo.controls.eStop"),
                eStopReset: t("liveDemo.controls.eStopReset"),
                panelTitle: t("liveDemo.controls.modeTitle"),
                attach: t("liveDemo.controls.attach"),
                release: t("liveDemo.controls.release"),
              }}
            />
          </HMIPanel>
        </div>

        {/* Telemetry strip */}
        <HMIPanel title={t("liveDemo.telemetry.title")} className="mt-4">
          <CraneTelemetry
            loadPct={loadPct}
            slewPct={render.slewPct}
            hoistPct={render.hoistPct}
            hydraulicBar={render.hydraulicBar}
            windKt={render.windKt}
            swayDeg={render.swayDeg}
            labels={{
              load: t("liveDemo.gauge.load"),
              slew: t("liveDemo.gauge.slew"),
              hoist: t("liveDemo.gauge.hoist"),
              hydraulic: t("liveDemo.gauge.hydraulic"),
              wind: t("liveDemo.gauge.wind"),
              sway: t("liveDemo.gauge.sway"),
            }}
          />
        </HMIPanel>

        {/* Trend + alarms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <HMIPanel title={t("liveDemo.trend.title")}>
            <CraneTrend
              data={trend}
              windowSeconds={TREND_WINDOW_S}
              labels={{
                load: t("liveDemo.trend.load"),
                sway: t("liveDemo.trend.sway"),
              }}
            />
          </HMIPanel>

          <HMIPanel
            title={t("liveDemo.alarms.title")}
            glowColor={alarms.some(a => a.severity === "critical") ? "hsl(0, 70%, 60%)" : undefined}
          >
            <CraneAlarms
              alarms={alarms}
              labels={{
                allClear: t("liveDemo.alarms.allClear"),
                title: t("liveDemo.alarms.title"),
              }}
            />
          </HMIPanel>
        </div>

        {/* Explainer */}
        <HMIPanel title={t("liveDemo.explainer.title")} className="mt-4">
          <CraneExplainer
            labels={{
              title: t("liveDemo.explainer.title"),
              antiSwayTitle: t("liveDemo.explainer.antiSwayTitle"),
              antiSwayBody: t("liveDemo.explainer.antiSwayBody"),
              safetyTitle: t("liveDemo.explainer.safetyTitle"),
              safetyBody: t("liveDemo.explainer.safetyBody"),
              sequenceTitle: t("liveDemo.explainer.sequenceTitle"),
              sequenceBody: t("liveDemo.explainer.sequenceBody"),
            }}
          />
        </HMIPanel>
      </div>
      </div>
    </div>
  );
};

export default LiveDemo;
