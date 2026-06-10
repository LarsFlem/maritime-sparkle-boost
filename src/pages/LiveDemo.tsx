import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Radio } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HMIPanel from "@/components/hmi/HMIPanel";
import StatusIndicator from "@/components/hmi/StatusIndicator";
import CraneScene from "@/components/live-demo/CraneScene";
import CraneSequencePanel, { CraneMode, SequenceStep } from "@/components/live-demo/CraneSequencePanel";
import CraneTelemetry from "@/components/live-demo/CraneTelemetry";
import CraneTrend, { TrendPoint } from "@/components/live-demo/CraneTrend";
import CraneAlarms, { CraneAlarm } from "@/components/live-demo/CraneAlarms";
import CraneExplainer from "@/components/live-demo/CraneExplainer";
import {
  craneFk, craneIk, swlAt, inSector,
  SLEW_MIN, SLEW_MAX, MAIN_MIN, MAIN_MAX, JIB_MIN, JIB_MAX, WIRE_MIN, WIRE_MAX,
  CONTAINER_T, CONTAINER_H_M, SWL_RATED_T,
  PICKUP_SLEW, LANDING_SLEW, PICKUP_R, LANDING_R, BARGE_DECK_Z,
} from "@/components/live-demo/craneModel";

// --- Sim constants ---
const TICK_MS = 100; // 10 Hz
const TREND_WINDOW_S = 60;
const TREND_CAPACITY = (TREND_WINDOW_S * 1000) / TICK_MS;

// Axis dynamics: max speed + acceleration per axis (real units/s)
const AXIS_DYN = {
  slew: { vmax: 9, acc: 6 },     // °/s, °/s²
  main: { vmax: 3.5, acc: 2.2 }, // °/s
  jib: { vmax: 6, acc: 4.5 },    // °/s
  wire: { vmax: 1.5, acc: 1.8 }, // m/s
};

// Anti-sway command smoothing (s) per mode — slew is the sway driver.
const TAU = {
  manual: { slew: 0.06, other: 0.05 },
  semi: { slew: 1.1, other: 0.45 },
  auto: { slew: 0.6, other: 0.3 },
};

// Auto-sequence working points — all verified reachable inside the axis
// limits via craneIk (main ≤ 80°, fold ≤ 150°).
const HOVER_Z = 5.4;     // hook hover above deck container
const TRANSIT_Z = 7.5;   // hook height while slewing
const PICKUP_TIP = { r: PICKUP_R, z: 10.5 };
const LANDING_TIP = { r: LANDING_R, z: 12.5 };
const LAND_HOOK_Z = BARGE_DECK_Z + CONTAINER_H_M; // hook when container sits on barge

// Initial pose = IK solution for the pickup tip position
const INIT = { slew: PICKUP_SLEW, main: 79, jib: 136, wire: 5 };

const formatClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rad = (d: number) => (d * Math.PI) / 180;

/** Trapezoidal axis drive: accel-limited velocity toward a clamped velocity command. */
const drive = (
  pos: number, vel: number, target: number,
  dyn: { vmax: number; acc: number }, dt: number, enabled: boolean
): [number, number] => {
  const vCmd = enabled ? clamp((target - pos) * 1.8, -dyn.vmax, dyn.vmax) : 0;
  const newVel = vel + clamp(vCmd - vel, -dyn.acc * dt * (enabled ? 1 : 2), dyn.acc * dt * (enabled ? 1 : 2));
  return [pos + newVel * dt, newVel];
};

const STEP_IDS = ["position", "lower", "connect", "hoist", "slewBarge", "land", "release"] as const;

const LiveDemo = () => {
  const { t } = useLanguage();

  const stateRef = useRef({
    slew: INIT.slew, slewV: 0,
    main: INIT.main, mainV: 0,
    jib: INIT.jib, jibV: 0,
    wire: INIT.wire, wireV: 0,
    smSlew: INIT.slew, smMain: INIT.main, smJib: INIT.jib, smWire: INIT.wire,
    swayRad: 0, swayVel: 0,
    prevTipX: 0, prevTipVel: 0,
    hookLoadT: 0,
    cargoState: "deck" as "deck" | "carried" | "landed",
    connectT: 0,
    windKt: 18, windPhase: 0,
    hydraulicBar: 195, motorTorque: 0,
    autoStep: 0, autoCycleCount: 0, stepEntryDist: 1,
    waterPhase: 0,
  });

  const [mode, setMode] = useState<CraneMode>("auto");
  const [running, setRunning] = useState(false);
  const [eStop, setEStop] = useState(false);
  const [cmdSlew, setCmdSlew] = useState(INIT.slew);
  const [cmdMain, setCmdMain] = useState(INIT.main);
  const [cmdJib, setCmdJib] = useState(INIT.jib);
  const [cmdWire, setCmdWire] = useState(INIT.wire);
  const cmdRef = useRef({ ...INIT });
  useEffect(() => { cmdRef.current = { slew: cmdSlew, main: cmdMain, jib: cmdJib, wire: cmdWire }; },
    [cmdSlew, cmdMain, cmdJib, cmdWire]);

  const [render, setRender] = useState(() => ({
    slew: INIT.slew, main: INIT.main, jib: INIT.jib, wire: INIT.wire,
    swayDeg: 0, deflectDeg: 0, hookLoadT: 0,
    cargoState: "deck" as "deck" | "carried" | "landed",
    windKt: 18, hydraulicBar: 195,
    outreach: 0, hookZ: 0, swl: SWL_RATED_T,
    autoStep: 0, stepProgress: 0, cycles: 0, waterPhase: 0,
  }));

  const [trend, setTrend] = useState<TrendPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: TREND_CAPACITY }, (_, i) => ({
      t: now - (TREND_CAPACITY - 1 - i) * TICK_MS, load: null, sway: null,
    }));
  });

  const alarmStartRef = useRef<Record<string, number>>({});

  // --- Sim loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = TICK_MS / 1000;
      const s = stateRef.current;
      const moveAllowed = running && !eStop;

      // 1. Wind
      s.windPhase += dt * 0.06;
      const baseWind = 18 + Math.sin(s.windPhase * 2 * Math.PI) * 9 + Math.sin(s.windPhase * 7) * 3;
      s.windKt = Math.max(0, baseWind + (Math.random() - 0.5) * 1.2);

      // 2. Targets per mode
      let tSlew = s.smSlew, tMain = s.smMain, tJib = s.smJib, tWire = s.smWire;
      let rawSlew = cmdRef.current.slew;
      let rawMain = cmdRef.current.main;
      let rawJib = cmdRef.current.jib;
      let rawWire = cmdRef.current.wire;

      const fkNow = craneFk(s.main, s.jib);
      const hookZNow = fkNow.tz - s.wire;

      if (mode === "auto" && moveAllowed) {
        // Condition-based sequence — each step drives targets and completes
        // on measured position, not on a timer.
        const ikPickup = craneIk(PICKUP_TIP.r, PICKUP_TIP.z);
        const ikLanding = craneIk(LANDING_TIP.r, LANDING_TIP.z);
        switch (s.autoStep) {
          case 0: { // position over pickup
            rawSlew = PICKUP_SLEW; rawMain = ikPickup.mainDeg; rawJib = ikPickup.jibFoldDeg;
            rawWire = clamp(fkNow.tz - HOVER_Z, WIRE_MIN, WIRE_MAX);
            const dist = Math.abs(s.slew - PICKUP_SLEW) / 9 + Math.abs(fkNow.tx - PICKUP_R) + Math.abs(hookZNow - HOVER_Z) / 2;
            if (dist < 0.45) { s.autoStep = 1; s.stepEntryDist = 1; }
            else if (s.stepEntryDist === 1) s.stepEntryDist = Math.max(1, dist);
            break;
          }
          case 1: { // lower onto container
            rawSlew = PICKUP_SLEW; rawMain = ikPickup.mainDeg; rawJib = ikPickup.jibFoldDeg;
            rawWire = clamp(fkNow.tz - CONTAINER_H_M, WIRE_MIN, WIRE_MAX);
            if (hookZNow <= CONTAINER_H_M + 0.08) { s.autoStep = 2; s.connectT = 0; }
            break;
          }
          case 2: { // connect — twist-locks + load transfer
            rawSlew = s.slew; rawMain = s.main; rawJib = s.jib; rawWire = s.wire;
            s.connectT += dt;
            if (s.connectT >= 1.4) { s.cargoState = "carried"; s.autoStep = 3; }
            break;
          }
          case 3: { // hoist clear
            rawSlew = PICKUP_SLEW; rawMain = ikPickup.mainDeg; rawJib = ikPickup.jibFoldDeg;
            rawWire = clamp(fkNow.tz - TRANSIT_Z, WIRE_MIN, WIRE_MAX);
            if (hookZNow >= TRANSIT_Z - 0.3) s.autoStep = 4;
            break;
          }
          case 4: { // slew + reach out to barge
            rawSlew = LANDING_SLEW; rawMain = ikLanding.mainDeg; rawJib = ikLanding.jibFoldDeg;
            rawWire = clamp(fkNow.tz - TRANSIT_Z, WIRE_MIN, WIRE_MAX);
            if (Math.abs(s.slew - LANDING_SLEW) < 1.2 && Math.abs(fkNow.tx - LANDING_R) < 0.4) s.autoStep = 5;
            break;
          }
          case 5: { // lower to barge deck
            rawSlew = LANDING_SLEW; rawMain = ikLanding.mainDeg; rawJib = ikLanding.jibFoldDeg;
            rawWire = clamp(fkNow.tz - LAND_HOOK_Z, WIRE_MIN, WIRE_MAX);
            if (hookZNow <= LAND_HOOK_Z + 0.08) { s.cargoState = "landed"; s.autoStep = 6; s.connectT = 0; }
            break;
          }
          case 6: { // release + return empty
            s.connectT += dt;
            if (s.connectT < 1.0) {
              rawSlew = s.slew; rawMain = s.main; rawJib = s.jib; rawWire = s.wire;
            } else {
              const clear = hookZNow >= TRANSIT_Z - 2.5;
              rawWire = clamp(fkNow.tz - TRANSIT_Z, WIRE_MIN, WIRE_MAX);
              rawSlew = clear ? PICKUP_SLEW : s.slew;
              rawMain = clear ? ikPickup.mainDeg : s.main;
              rawJib = clear ? ikPickup.jibFoldDeg : s.jib;
              if (Math.abs(s.slew - PICKUP_SLEW) < 2 && hookZNow > HOVER_Z - 0.6) {
                s.autoStep = 0;
                s.autoCycleCount += 1;
                s.cargoState = "deck"; // next container staged on deck
              }
            }
            break;
          }
        }
      }

      // 3. Anti-sway smoothing on targets
      const tau = TAU[mode];
      const aSlew = 1 - Math.exp(-dt / tau.slew);
      const aOther = 1 - Math.exp(-dt / tau.other);
      s.smSlew += (rawSlew - s.smSlew) * aSlew;
      s.smMain += (rawMain - s.smMain) * aOther;
      s.smJib += (rawJib - s.smJib) * aOther;
      s.smWire += (rawWire - s.smWire) * aOther;
      tSlew = clamp(s.smSlew, SLEW_MIN, SLEW_MAX);
      tMain = clamp(s.smMain, MAIN_MIN, MAIN_MAX);
      tJib = clamp(s.smJib, JIB_MIN, JIB_MAX);
      tWire = clamp(s.smWire, WIRE_MIN, WIRE_MAX);

      // 4. Accel-limited axis motion
      const prevSlewV = s.slewV;
      [s.slew, s.slewV] = drive(s.slew, s.slewV, tSlew, AXIS_DYN.slew, dt, moveAllowed);
      [s.main, s.mainV] = drive(s.main, s.mainV, tMain, AXIS_DYN.main, dt, moveAllowed);
      [s.jib, s.jibV] = drive(s.jib, s.jibV, tJib, AXIS_DYN.jib, dt, moveAllowed);
      [s.wire, s.wireV] = drive(s.wire, s.wireV, tWire, AXIS_DYN.wire, dt, moveAllowed);

      // 5. Pendulum sway, forced by jib-tip acceleration (in-plane) and
      //    slew tangential acceleration (injected as equivalent disturbance).
      const fk = craneFk(s.main, s.jib);
      const tipVel = (fk.tx - s.prevTipX) / dt;
      const tipAcc = (tipVel - s.prevTipVel) / dt;
      s.prevTipX = fk.tx;
      s.prevTipVel = tipVel;
      const slewTangAcc = ((s.slewV - prevSlewV) / dt) * rad(1) * fk.tx; // m/s² at the tip
      const wireLen = Math.max(1.5, s.wire);
      const omega2 = 9.81 / wireLen;
      const damping = 0.22 + (s.wire < 3 ? 1.0 : 0) + (s.cargoState !== "carried" ? 0.25 : 0);
      const windForce = (s.windKt - 18) * 0.0012;
      const forcing = -(tipAcc * 0.55 + slewTangAcc * 0.45) * Math.cos(s.swayRad) / wireLen;
      const swayAcc = -omega2 * Math.sin(s.swayRad) - damping * s.swayVel + forcing + windForce;
      s.swayVel += swayAcc * dt;
      s.swayRad += s.swayVel * dt;
      const maxSway = rad(25);
      if (s.swayRad > maxSway) { s.swayRad = maxSway; s.swayVel = 0; }
      if (s.swayRad < -maxSway) { s.swayRad = -maxSway; s.swayVel = 0; }

      // 6. Hook load: ramps during connect/release, dynamic factor while carried
      if (s.cargoState === "carried") {
        // Dynamic amplification on the load cell — modest, like a real crane
        const dyn = 1 + Math.abs(s.swayVel) * 0.16 + Math.abs(s.wireV) * 0.05;
        const target = CONTAINER_T * dyn;
        s.hookLoadT += (target - s.hookLoadT) * 0.25 + (Math.random() - 0.5) * 0.04;
      } else if (mode === "auto" && s.autoStep === 2) {
        s.hookLoadT = CONTAINER_T * clamp(s.connectT / 1.2, 0, 1); // load transfer
      } else {
        s.hookLoadT *= 0.78; // release / slack
        if (s.hookLoadT < 0.05) s.hookLoadT = 0;
      }

      // 7. Hydraulics: demand from axis motion + held load moment
      const demand =
        Math.abs(s.slewV) / AXIS_DYN.slew.vmax +
        Math.abs(s.mainV) / AXIS_DYN.main.vmax +
        Math.abs(s.jibV) / AXIS_DYN.jib.vmax +
        Math.abs(s.wireV) / AXIS_DYN.wire.vmax;
      s.motorTorque = Math.min(100, demand * 38 + (s.hookLoadT / SWL_RATED_T) * 30);
      const targetBar = 192 + s.motorTorque * 0.42 + s.hookLoadT * 1.6 - (running ? 0 : 7);
      s.hydraulicBar += (targetBar - s.hydraulicBar) * 0.15 + (Math.random() - 0.5) * 0.6;

      // 8. Water + step progress
      s.waterPhase = (s.waterPhase + dt * 0.18) % 1;
      let stepProgress = 0;
      if (mode === "auto") {
        if (s.autoStep === 2) stepProgress = clamp(s.connectT / 1.4, 0, 1);
        else if (s.autoStep === 6) stepProgress = clamp(s.connectT / 3.5, 0, 1);
        else {
          // distance-based estimate toward the step's done condition
          const hookZ = fk.tz - s.wire;
          const targets: Record<number, number> = {
            0: Math.abs(s.slew - PICKUP_SLEW) / 9 + Math.abs(fk.tx - PICKUP_R) + Math.abs(hookZ - HOVER_Z) / 2,
            1: Math.abs(hookZ - CONTAINER_H_M),
            3: Math.abs(hookZ - TRANSIT_Z),
            4: Math.abs(s.slew - LANDING_SLEW) / 9 + Math.abs(fk.tx - LANDING_R),
            5: Math.abs(hookZ - LAND_HOOK_Z),
          };
          const d = targets[s.autoStep] ?? 0;
          if (d > s.stepEntryDist) s.stepEntryDist = d;
          stepProgress = s.stepEntryDist > 0.01 ? clamp(1 - d / s.stepEntryDist, 0, 1) : 1;
        }
      }

      // 9. Elastic deflection under load (visual)
      const deflectDeg = -(s.hookLoadT / SWL_RATED_T) * 0.9 * (fk.tx / (16 + 11));

      // 10. Mirror to render state
      const swayDeg = (s.swayRad * 180) / Math.PI;
      const hookZ = fk.tz - s.wire * Math.cos(s.swayRad);
      setRender({
        slew: s.slew, main: s.main, jib: s.jib, wire: s.wire,
        swayDeg, deflectDeg, hookLoadT: s.hookLoadT,
        cargoState: s.cargoState,
        windKt: s.windKt, hydraulicBar: s.hydraulicBar,
        outreach: fk.tx, hookZ, swl: swlAt(fk.tx),
        autoStep: s.autoStep, stepProgress, cycles: s.autoCycleCount,
        waterPhase: s.waterPhase,
      });

      // 11. Trend
      const now = Date.now();
      setTrend((prev) => {
        const next = [...prev, { t: now, load: parseFloat(s.hookLoadT.toFixed(2)), sway: parseFloat(swayDeg.toFixed(2)) }];
        const cutoff = now - TREND_WINDOW_S * 1000;
        while (next.length > 1 && next[0].t < cutoff) next.shift();
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [mode, running, eStop]);

  // When entering auto, restart the sequence cleanly from wherever we are.
  useEffect(() => {
    if (mode === "auto") {
      stateRef.current.autoStep = stateRef.current.cargoState === "carried" ? 4 : 0;
      stateRef.current.stepEntryDist = 1;
    }
  }, [mode]);

  // --- Alarms ---
  const momentUtil = render.swl > 0 ? render.hookLoadT / render.swl : 0;
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
    if (momentUtil > 1.0) push("critical", "MOM-002", t("liveDemo.alarm.momentCritical"));
    else if (momentUtil > 0.9) push("warning", "MOM-001", t("liveDemo.alarm.momentHigh"));
    if (render.windKt > 45) push("critical", "WND-002", t("liveDemo.alarm.windCritical"));
    else if (render.windKt > 35) push("warning", "WND-001", t("liveDemo.alarm.windHigh"));
    if (Math.abs(render.swayDeg) > 10) push("critical", "SWY-002", t("liveDemo.alarm.swayCritical"));
    else if (Math.abs(render.swayDeg) > 5) push("warning", "SWY-001", t("liveDemo.alarm.swayHigh"));
    if (render.hydraulicBar < 165) push("warning", "HYD-001", t("liveDemo.alarm.hydraulicLow"));
    else if (render.hydraulicBar > 240) push("warning", "HYD-002", t("liveDemo.alarm.hydraulicHigh"));
    if (render.cargoState === "carried" && render.hookZ < 1.5 && Math.abs(render.swayDeg) > 6) {
      push("warning", "COL-001", t("liveDemo.alarm.collisionRisk"));
    }

    Object.keys(start).forEach((k) => { if (!seen.has(k)) delete start[k]; });
    const sevRank = { critical: 0, warning: 1, info: 2 };
    return result.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);
  }, [render.windKt, render.swayDeg, render.hydraulicBar, render.cargoState, render.hookZ, momentUtil, eStop, t]);

  // --- Handlers ---
  const handleStart = () => { if (!eStop) setRunning(true); };
  const handleStop = () => setRunning(false);
  const handleReset = useCallback(() => {
    setRunning(false);
    setEStop(false);
    const s = stateRef.current;
    s.slew = INIT.slew; s.slewV = 0;
    s.main = INIT.main; s.mainV = 0;
    s.jib = INIT.jib; s.jibV = 0;
    s.wire = INIT.wire; s.wireV = 0;
    s.smSlew = INIT.slew; s.smMain = INIT.main; s.smJib = INIT.jib; s.smWire = INIT.wire;
    s.swayRad = 0; s.swayVel = 0;
    s.hookLoadT = 0;
    s.cargoState = "deck";
    s.autoStep = 0; s.autoCycleCount = 0; s.stepEntryDist = 1;
    setCmdSlew(INIT.slew); setCmdMain(INIT.main); setCmdJib(INIT.jib); setCmdWire(INIT.wire);
  }, []);
  const handleEStop = () => {
    setEStop((prev) => {
      const next = !prev;
      if (next) setRunning(false);
      return next;
    });
  };

  // Manual hook attach/release — position-checked like a real load-handling system
  const fkRender = craneFk(render.main, render.jib);
  const hookXm = fkRender.tx + render.wire * Math.sin(rad(render.swayDeg));
  const atPickup = inSector(render.slew, PICKUP_SLEW);
  const atLanding = inSector(render.slew, LANDING_SLEW);
  const nearDeckCont = atPickup && Math.abs(hookXm - PICKUP_R) < 1.2 && Math.abs(render.hookZ - CONTAINER_H_M) < 0.45;
  const nearBargeCont = atLanding && Math.abs(hookXm - LANDING_R) < 1.2 && Math.abs(render.hookZ - LAND_HOOK_Z) < 0.45;
  const canSetDeck = atPickup && Math.abs(hookXm - PICKUP_R) < 1.6 && Math.abs(render.hookZ - CONTAINER_H_M) < 0.35;
  const canSetBarge = atLanding && Math.abs(hookXm - LANDING_R) < 1.6 && Math.abs(render.hookZ - LAND_HOOK_Z) < 0.35;

  const hookCarrying = render.cargoState === "carried";
  const hookActionEnabled =
    !eStop && mode !== "auto" &&
    (hookCarrying ? canSetDeck || canSetBarge
      : render.cargoState === "deck" ? nearDeckCont : nearBargeCont);

  const handleHookAction = () => {
    if (!hookActionEnabled) return;
    const s = stateRef.current;
    if (s.cargoState === "carried") {
      s.cargoState = canSetBarge ? "landed" : "deck";
    } else {
      s.cargoState = "carried";
    }
  };

  const hookHint = hookCarrying
    ? canSetDeck || canSetBarge
      ? t("liveDemo.controls.hookHintReleaseReady")
      : t("liveDemo.controls.hookHintSetDown")
    : render.cargoState === "deck"
    ? nearDeckCont ? t("liveDemo.controls.hookHintAttachReady") : t("liveDemo.controls.hookHintToPickup")
    : nearBargeCont ? t("liveDemo.controls.hookHintAttachReady") : t("liveDemo.controls.hookHintToLanding");

  // --- Derived UI ---
  const status = eStop ? "warning" : running ? "operational" : "offline";
  const statusLabel = eStop ? t("liveDemo.status.eStop") : running ? t("liveDemo.status.running") : t("liveDemo.status.stopped");
  const modeLabel = mode === "manual" ? t("liveDemo.mode.manual") : mode === "semi" ? t("liveDemo.mode.semi") : t("liveDemo.mode.auto");

  const steps: SequenceStep[] = useMemo(
    () => STEP_IDS.map((id, i) => ({ id, label: `${i + 1}. ${t(`liveDemo.step.${id}`)}` })),
    [t]
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(hsl(200_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(200_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[radial-gradient(ellipse,hsl(200_100%_50%/0.08),transparent_70%)] pointer-events-none" />
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
              <span className="text-foreground tabular-nums">{render.hookLoadT.toFixed(1)} t</span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.outreach")}:{" "}
              <span className="text-foreground tabular-nums">{render.outreach.toFixed(1)} m</span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.wind")}:{" "}
              <span className="text-foreground tabular-nums">{render.windKt.toFixed(0)} kt</span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.mode")}: <span className="text-foreground">{modeLabel}</span>
            </span>
            <span className="text-muted-foreground">
              {t("liveDemo.kpi.cycles")}:{" "}
              <span className="text-foreground tabular-nums">{render.cycles}</span>
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
                  slewDeg={render.slew}
                  mainDeg={render.main}
                  jibFoldDeg={render.jib}
                  wireM={render.wire}
                  swayDeg={render.swayDeg}
                  deflectDeg={render.deflectDeg}
                  cargoState={render.cargoState}
                  hookLoadT={render.hookLoadT}
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
              cmdSlew={cmdSlew}
              cmdMain={cmdMain}
              cmdJib={cmdJib}
              cmdWire={cmdWire}
              slewRange={[SLEW_MIN, SLEW_MAX]}
              mainRange={[MAIN_MIN, MAIN_MAX]}
              jibRange={[JIB_MIN, JIB_MAX]}
              wireRange={[WIRE_MIN, WIRE_MAX]}
              onCmdSlewChange={setCmdSlew}
              onCmdMainChange={setCmdMain}
              onCmdJibChange={setCmdJib}
              onCmdWireChange={setCmdWire}
              steps={steps}
              activeStepIndex={render.autoStep}
              stepProgress={render.stepProgress}
              cycleCount={render.cycles}
              hookCarrying={hookCarrying}
              hookActionEnabled={hookActionEnabled}
              hookHint={hookHint}
              onHookAction={handleHookAction}
              labels={{
                modeManual: t("liveDemo.mode.manual"),
                modeSemi: t("liveDemo.mode.semi"),
                modeAuto: t("liveDemo.mode.auto"),
                targetSlew: t("liveDemo.controls.targetSlew"),
                targetMain: t("liveDemo.controls.targetMain"),
                targetJib: t("liveDemo.controls.targetJib"),
                targetWire: t("liveDemo.controls.targetWire"),
                pickupZone: t("liveDemo.controls.pickup"),
                landingZone: t("liveDemo.controls.landing"),
                boomLow: t("liveDemo.controls.boomLow"),
                boomHigh: t("liveDemo.controls.boomHigh"),
                jibFolded: t("liveDemo.controls.jibFolded"),
                jibExtended: t("liveDemo.controls.jibExtended"),
                wireIn: t("liveDemo.controls.wireIn"),
                wireOut: t("liveDemo.controls.wireOut"),
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
            hookLoadT={render.hookLoadT}
            swlT={render.swl}
            outreachM={render.outreach}
            hookHeightM={render.hookZ}
            wireOutM={render.wire}
            slewDeg={render.slew}
            mainDeg={render.main}
            jibFoldDeg={render.jib}
            hydraulicBar={render.hydraulicBar}
            windKt={render.windKt}
            swayDeg={render.swayDeg}
            slewSector={atPickup ? "pickup" : atLanding ? "landing" : null}
            labels={{
              load: t("liveDemo.gauge.load"),
              swl: t("liveDemo.gauge.swl"),
              outreach: t("liveDemo.gauge.outreach"),
              hookHeight: t("liveDemo.gauge.hookHeight"),
              wire: t("liveDemo.gauge.wire"),
              slew: t("liveDemo.gauge.slew"),
              main: t("liveDemo.gauge.main"),
              knuckle: t("liveDemo.gauge.knuckle"),
              hydraulic: t("liveDemo.gauge.hydraulic"),
              windSway: t("liveDemo.gauge.windSway"),
              pickup: t("liveDemo.controls.pickup"),
              landing: t("liveDemo.controls.landing"),
              utilization: t("liveDemo.gauge.utilization"),
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
            glowColor={alarms.some((a) => a.severity === "critical") ? "hsl(0, 70%, 60%)" : undefined}
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
