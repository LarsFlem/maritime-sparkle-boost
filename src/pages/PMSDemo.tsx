import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Radio, ZapOff, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HMIPanel from "@/components/hmi/HMIPanel";
import DigitalDisplay from "@/components/hmi/DigitalDisplay";
import GaugeCircular from "@/components/hmi/GaugeCircular";
import SingleLineDiagram from "@/components/pms/SingleLineDiagram";
import Synchroscope from "@/components/pms/Synchroscope";
import GensetCard from "@/components/pms/GensetCard";
import PlcLogicView, { PlcSnapshot } from "@/components/pms/PlcLogicView";
import {
  GensetState,
  GensetView,
  ConsumerView,
  PmsLogEvent,
  PmsLogSev,
} from "@/components/pms/pmsTypes";

const TICK_MS = 100;

const COLOR_PRIMARY = "hsl(200, 100%, 60%)";
const COLOR_ACCENT = "hsl(180, 100%, 55%)";
const COLOR_WARN = "hsl(38, 85%, 60%)";
const COLOR_ERR = "hsl(0, 70%, 55%)";
const COLOR_OK = "hsl(150, 70%, 55%)";

// PMS setpoints (the same numbers surface in the PLC logic view)
const LD_START_PCT = 85;
const LD_START_DELAY_S = 5;
const LD_STOP_PCT = 35;
const LD_STOP_DELAY_S = 15;
const HC_MARGIN = 1.1;
const OVERLOAD_PCT = 95;

interface GensetSim {
  id: string;
  name: string;
  ratedKw: number;
  state: GensetState;
  stateT: number;
  kw: number;
  freqHz: number;
  syncAngle: number;
  syncSlip: number;
  hours: number;
  breakerClosed: boolean;
}

interface ConsumerSim {
  id: string;
  name: string;
  ratedKw: number;
  demandFactor: number;
  essential: boolean;
  sheddable: boolean;
  heavy: boolean;
  state: ConsumerView["state"];
  kw: number;
  wobblePhase: number;
}

type HcSeq = "IDLE" | "CHECK" | "STARTING" | "GRANT";

const initialGensets = (): GensetSim[] => [
  { id: "DG1", name: "Diesel Gen 1", ratedKw: 850, state: "online", stateT: 0, kw: 0, freqHz: 60, syncAngle: 0, syncSlip: 0, hours: 4211.6, breakerClosed: true },
  { id: "DG2", name: "Diesel Gen 2", ratedKw: 850, state: "standby", stateT: 0, kw: 0, freqHz: 0, syncAngle: 0, syncSlip: 0, hours: 3978.2, breakerClosed: false },
  { id: "DG3", name: "Diesel Gen 3", ratedKw: 850, state: "standby", stateT: 0, kw: 0, freqHz: 0, syncAngle: 0, syncSlip: 0, hours: 2456.9, breakerClosed: false },
];

const initialConsumers = (): ConsumerSim[] => [
  { id: "propPort", name: "PROP PORT", ratedKw: 420, demandFactor: 0.65, essential: true, sheddable: false, heavy: false, state: "online", kw: 0, wobblePhase: 0.2 },
  { id: "propStbd", name: "PROP STBD", ratedKw: 420, demandFactor: 0.65, essential: true, sheddable: false, heavy: false, state: "online", kw: 0, wobblePhase: 2.4 },
  { id: "bowThr", name: "BOW THR", ratedKw: 300, demandFactor: 0.85, essential: false, sheddable: false, heavy: true, state: "off", kw: 0, wobblePhase: 4.1 },
  { id: "crane", name: "CRANE", ratedKw: 160, demandFactor: 0.7, essential: false, sheddable: true, heavy: false, state: "off", kw: 0, wobblePhase: 1.3 },
  { id: "hvac", name: "HVAC", ratedKw: 90, demandFactor: 0.75, essential: false, sheddable: true, heavy: false, state: "off", kw: 0, wobblePhase: 5.0 },
  { id: "galley", name: "GALLEY", ratedKw: 60, demandFactor: 0.75, essential: false, sheddable: true, heavy: false, state: "off", kw: 0, wobblePhase: 3.2 },
];

// Shed order: galley → hvac → crane (least critical first)
const SHED_ORDER = ["galley", "hvac", "crane"];

const formatClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const PMSDemo = () => {
  const { t } = useLanguage();

  const simRef = useRef({
    gensets: initialGensets(),
    consumers: initialConsumers(),
    startTimerS: 0,
    stopTimerS: 0,
    shedTimerS: 0,
    shedStage: 0,
    busFreq: 60,
    busVolt: 690,
    blackout: false,
    recoveryT: -1, // ≥0 → recovery sequence running
    recoveryStage: 0,
    hcSeq: "IDLE" as HcSeq,
    startOrderQueued: false,
  });

  const [gensets, setGensets] = useState<GensetView[]>([]);
  const [consumers, setConsumers] = useState<ConsumerView[]>([]);
  const [busKw, setBusKw] = useState(0);
  const [busFreq, setBusFreq] = useState(60);
  const [busVolt, setBusVolt] = useState(690);
  const [busLive, setBusLive] = useState(true);
  const [blackout, setBlackout] = useState(false);
  const [plcSnap, setPlcSnap] = useState<PlcSnapshot | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [eventLog, setEventLog] = useState<PmsLogEvent[]>([]);
  const nextEventId = useRef(1);
  const logQueue = useRef<PmsLogEvent[]>([]);

  const pushLog = (sev: PmsLogSev, unit: string, msg: string) => {
    logQueue.current.push({ id: nextEventId.current++, ts: Date.now(), sev, unit, msg });
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Seed log
  useEffect(() => {
    const now = Date.now();
    setEventLog([
      { id: 0, ts: now - 12000, sev: "ok", unit: "PMS", msg: "PMS in AUTO — load-dependent start/stop armed" },
      { id: -1, ts: now - 30000, sev: "info", unit: "DG1", msg: "On load — single genset operation" },
      { id: -2, ts: now - 55000, sev: "ok", unit: "BUS", msg: "Main bus energized — 690 V / 60 Hz" },
    ]);
    nextEventId.current = 1;
  }, []);

  // ── Main sim loop ──
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = TICK_MS / 1000;
      const s = simRef.current;

      const onlineGens = () => s.gensets.filter((g) => g.state === "online" && g.breakerClosed);
      const busIsLive = onlineGens().length > 0;

      // 1. Consumer demand (only drawn when bus live & consumer online)
      s.consumers.forEach((c) => {
        c.wobblePhase += dt * (0.25 + c.ratedKw / 2000);
        if (c.state === "online" && busIsLive) {
          const target =
            c.ratedKw *
            c.demandFactor *
            (1 + 0.07 * Math.sin(c.wobblePhase) + 0.03 * Math.sin(c.wobblePhase * 3.7));
          c.kw += (Math.max(0, target) - c.kw) * 0.12 + (Math.random() - 0.5) * 1.5;
        } else {
          c.kw *= 0.7;
          if (c.kw < 1) c.kw = 0;
        }
      });

      const busLoad = busIsLive ? s.consumers.reduce((sum, c) => sum + c.kw, 0) : 0;
      const onlineCap = onlineGens().reduce((sum, g) => sum + g.ratedKw, 0);
      const busLoadPct = onlineCap > 0 ? (busLoad / onlineCap) * 100 : 0;

      // 2. Load sharing — equal % across online machines
      const online = onlineGens();
      online.forEach((g) => {
        const share = busLoad * (g.ratedKw / Math.max(1, onlineCap));
        g.kw += (share - g.kw) * 0.18;
      });

      // 3. Genset state machines
      const anyIncoming = s.gensets.some((g) => g.state === "starting" || g.state === "sync");
      s.gensets.forEach((g) => {
        g.stateT += dt;
        if (g.state !== "standby" && g.state !== "fault") g.hours += dt / 3600;

        switch (g.state) {
          case "starting": {
            const k = Math.min(1, g.stateT / 2.5);
            g.freqHz = 59.3 * k;
            if (g.stateT >= 2.5) {
              if (!busIsLive) {
                // Dead bus — close straight onto the bus
                g.state = "online";
                g.stateT = 0;
                g.breakerClosed = true;
                g.freqHz = 60;
                pushLog("ok", g.id, "Dead-bus closure — bus energized");
                // Recovery: reconnect essentials in stage order
                if (s.recoveryT >= 0) s.recoveryStage = 1;
              } else {
                g.state = "sync";
                g.stateT = 0;
                g.syncSlip = 0.42 + Math.random() * 0.15;
                g.syncAngle = -150 + Math.random() * 300;
                pushLog("info", g.id, "Synchronizing to main bus");
              }
            }
            break;
          }
          case "sync": {
            // Governor pulls slip toward a small positive value, then in-window closure
            g.syncSlip += (0.06 - g.syncSlip) * dt * 0.65 + (Math.random() - 0.5) * 0.01;
            g.freqHz = s.busFreq + g.syncSlip;
            g.syncAngle += g.syncSlip * 360 * dt;
            if (g.syncAngle > 180) g.syncAngle -= 360;
            if (g.syncAngle < -180) g.syncAngle += 360;
            const inWindow = Math.abs(g.syncSlip) < 0.12 && Math.abs(g.syncAngle) < 12;
            if (inWindow && g.stateT > 2) {
              g.state = "online";
              g.stateT = 0;
              g.breakerClosed = true;
              g.freqHz = s.busFreq;
              pushLog("ok", g.id, "Breaker closed — sharing load");
            }
            break;
          }
          case "online": {
            g.freqHz = s.busFreq;
            break;
          }
          case "cooldown": {
            g.freqHz = 60;
            g.kw = 0;
            if (g.stateT >= 6) {
              g.state = "standby";
              g.stateT = 0;
              g.freqHz = 0;
              pushLog("info", g.id, "Cooldown complete — back in standby");
            }
            break;
          }
          default:
            g.kw = 0;
        }
      });

      // 4. Load-dependent start
      const standby = s.gensets.find((g) => g.state === "standby");
      const highLoad = busIsLive && busLoadPct > LD_START_PCT;
      s.startTimerS = highLoad ? s.startTimerS + dt : 0;
      const startQ = s.startTimerS >= LD_START_DELAY_S;
      if (startQ && standby && !anyIncoming) {
        standby.state = "starting";
        standby.stateT = 0;
        s.startTimerS = 0;
        pushLog("warn", "PMS", `Load ${Math.round(busLoadPct)}% > ${LD_START_PCT}% — start order ${standby.id}`);
      }

      // 5. Load-dependent stop (last-on-first-off, capacity check)
      const lowLoad = busIsLive && busLoadPct < LD_STOP_PCT && online.length > 1;
      s.stopTimerS = lowLoad ? s.stopTimerS + dt : 0;
      const stopQ = s.stopTimerS >= LD_STOP_DELAY_S;
      if (stopQ) {
        const candidate = [...online].reverse()[0];
        const remainingCap = onlineCap - candidate.ratedKw;
        if (remainingCap > 0 && busLoad / remainingCap < 0.8) {
          candidate.state = "cooldown";
          candidate.stateT = 0;
          candidate.breakerClosed = false;
          pushLog("info", "PMS", `Load ${Math.round(busLoadPct)}% < ${LD_STOP_PCT}% — stop order ${candidate.id}`);
        }
        s.stopTimerS = 0;
      }

      // 6. Heavy consumer sequence (bow thruster power reservation)
      // Reserve is checked against the consumer's RATED power, as a real PMS
      // does — matches the HC RESERVE logic shown in the PLC view.
      const bow = s.consumers.find((c) => c.id === "bowThr")!;
      const reserveKw = onlineCap - busLoad;
      const reserveOk = reserveKw >= bow.ratedKw * HC_MARGIN;
      switch (s.hcSeq) {
        case "IDLE":
          if (bow.state === "request") s.hcSeq = "CHECK";
          break;
        case "CHECK":
          if (bow.state !== "request") { s.hcSeq = "IDLE"; break; }
          if (!busIsLive) break;
          if (reserveOk) {
            s.hcSeq = "GRANT";
          } else if (standby && !anyIncoming) {
            standby.state = "starting";
            standby.stateT = 0;
            pushLog("warn", "PMS", `Insufficient reserve for BOW THR — start order ${standby.id}`);
            s.hcSeq = "STARTING";
          }
          break;
        case "STARTING":
          if (bow.state !== "request") { s.hcSeq = "IDLE"; break; }
          if (reserveOk && !anyIncoming) s.hcSeq = "GRANT";
          break;
        case "GRANT":
          if (bow.state === "request") {
            bow.state = "online";
            pushLog("ok", "PMS", "Power reserved — BOW THR connected");
          }
          s.hcSeq = "IDLE";
          break;
      }

      // 7. Preferential trip — staged load shedding on overload
      const overload = busIsLive && busLoadPct > OVERLOAD_PCT;
      if (overload) {
        s.shedTimerS += dt;
        // 2.5 s per stage — brief transients (e.g. while a standby genset is
        // already starting) shouldn't shed load
        if (s.shedTimerS >= 2.5 && s.shedStage < SHED_ORDER.length) {
          const victim = s.consumers.find((c) => c.id === SHED_ORDER[s.shedStage]);
          if (victim && victim.state === "online") {
            victim.state = "shed";
            pushLog("err", "PMS", `PREF TRIP stage ${s.shedStage + 1} — ${victim.name} shed`);
          }
          s.shedStage += 1;
          s.shedTimerS = 0;
        }
      } else {
        s.shedTimerS = 0;
        if (busLoadPct < 80) s.shedStage = 0;
      }

      // 8. Blackout recovery sequence
      if (s.recoveryT >= 0) {
        s.recoveryT += dt;
        if (s.recoveryStage === 0 && s.recoveryT >= 1.5) {
          const dg1 = s.gensets[0];
          if (dg1.state === "standby") {
            dg1.state = "starting";
            dg1.stateT = 0;
            pushLog("warn", "PMS", "Blackout recovery — start order DG1");
          }
          s.recoveryStage = -1; // wait for dead-bus closure (handled in state machine)
        }
        if (s.recoveryStage >= 1) {
          // Reconnect essential consumers, staggered
          const essentials = s.consumers.filter((c) => c.essential);
          const idx = Math.floor((s.recoveryT - 4.5) / 1.2);
          essentials.forEach((c, i) => {
            if (i <= idx && c.state === "off") {
              c.state = "online";
              pushLog("ok", "PMS", `Priority restart — ${c.name} reconnected`);
            }
          });
          if (essentials.every((c) => c.state === "online")) {
            s.recoveryT = -1;
            s.recoveryStage = 0;
            s.blackout = false;
            pushLog("ok", "PMS", "Blackout recovery complete");
          }
        }
      }
      if (busIsLive) s.blackout = false;

      // 9. Bus electrical values
      if (busIsLive) {
        const droop = (busLoadPct - 50) * 0.004;
        const sag = busLoadPct > OVERLOAD_PCT ? (busLoadPct - OVERLOAD_PCT) * 0.02 : 0;
        s.busFreq += (60 - droop - sag - s.busFreq) * 0.1 + (Math.random() - 0.5) * 0.008;
        s.busVolt += (690 - busLoadPct * 0.04 - s.busVolt) * 0.1 + (Math.random() - 0.5) * 0.4;
      } else {
        s.busFreq = 0;
        s.busVolt = 0;
      }

      // 10. Mirror to render state
      setGensets(
        s.gensets.map((g) => ({
          id: g.id, name: g.name, ratedKw: g.ratedKw, state: g.state,
          kw: g.kw, freqHz: g.freqHz, rpm: (g.freqHz / 60) * 1800, hours: g.hours,
          breakerClosed: g.breakerClosed, syncAngleDeg: g.syncAngle, syncSlipHz: g.syncSlip,
        }))
      );
      setConsumers(
        s.consumers.map((c) => ({
          id: c.id, name: c.name, ratedKw: c.ratedKw, kw: c.kw,
          enabled: c.state === "online" || c.state === "request",
          state: c.state, essential: c.essential, sheddable: c.sheddable, heavy: c.heavy,
        }))
      );
      setBusKw(busLoad);
      setBusFreq(s.busFreq);
      setBusVolt(s.busVolt);
      setBusLive(busIsLive);
      setBlackout(s.blackout);
      setPlcSnap({
        busLoadKw: busLoad,
        onlineCapKw: onlineCap,
        busLoadPct,
        highLoad,
        lowLoad,
        startTimerS: Math.min(LD_START_DELAY_S, s.startTimerS),
        stopTimerS: Math.min(LD_STOP_DELAY_S, s.stopTimerS),
        startTimerQ: startQ,
        stopTimerQ: stopQ,
        standbyAvail: s.gensets.some((g) => g.state === "standby"),
        onlineCount: online.length,
        hcSeq: s.hcSeq,
        hcRequest: bow.state === "request",
        reserveKw,
        hcDemandKw: bow.ratedKw,
        reserveOk,
        overload,
        shedStage: Math.min(s.shedStage, SHED_ORDER.length - 1),
      });

      if (logQueue.current.length) {
        const queued = logQueue.current;
        logQueue.current = [];
        setEventLog((prev) => [...queued.reverse(), ...prev].slice(0, 28));
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──
  const handleToggleConsumer = (id: string) => {
    const s = simRef.current;
    const c = s.consumers.find((x) => x.id === id);
    if (!c) return;
    if (c.state === "online" || c.state === "request") {
      c.state = "off";
      if (c.heavy) s.hcSeq = "IDLE";
      pushLog("info", "OPR", `${c.name} disconnect order`);
    } else {
      // shed → off → request/online again by operator
      if (c.heavy) {
        c.state = "request";
        pushLog("info", "OPR", `${c.name} connect request — awaiting PMS reservation`);
      } else {
        c.state = "online";
        pushLog("info", "OPR", `${c.name} connected`);
      }
    }
  };

  const handleStartGenset = (idx: number) => {
    const g = simRef.current.gensets[idx];
    if (g.state !== "standby") return;
    g.state = "starting";
    g.stateT = 0;
    pushLog("info", "OPR", `Manual start order ${g.id}`);
  };

  const handleStopGenset = (idx: number) => {
    const s = simRef.current;
    const g = s.gensets[idx];
    if (g.state !== "online") return;
    const online = s.gensets.filter((x) => x.state === "online");
    g.state = "cooldown";
    g.stateT = 0;
    g.breakerClosed = false;
    pushLog(online.length === 1 ? "warn" : "info", "OPR", `Manual stop order ${g.id}${online.length === 1 ? " — bus will go dead" : ""}`);
  };

  const handleTripGenset = (idx: number) => {
    const g = simRef.current.gensets[idx];
    if (g.state !== "online") return;
    g.state = "fault";
    g.stateT = 0;
    g.breakerClosed = false;
    g.kw = 0;
    g.freqHz = 0;
    pushLog("err", g.id, "BREAKER TRIP — generator fault");
  };

  const handleResetFault = (idx: number) => {
    const g = simRef.current.gensets[idx];
    if (g.state !== "fault") return;
    g.state = "standby";
    g.stateT = 0;
    pushLog("ok", g.id, "Fault reset — available for start");
  };

  const handleBlackout = () => {
    const s = simRef.current;
    s.gensets.forEach((g) => {
      g.state = "standby";
      g.stateT = 0;
      g.breakerClosed = false;
      g.kw = 0;
      g.freqHz = 0;
    });
    // Everything drops out; essentials get priority restart, the rest await the operator
    s.consumers.forEach((c) => {
      c.state = "off";
    });
    s.blackout = true;
    s.recoveryT = 0;
    s.recoveryStage = 0;
    s.hcSeq = "IDLE";
    pushLog("err", "BUS", "BLACKOUT — main bus dead");
    pushLog("warn", "PMS", "Auto recovery sequence initiated");
  };

  const handleReset = () => {
    const s = simRef.current;
    s.gensets = initialGensets();
    s.consumers = initialConsumers();
    s.startTimerS = 0;
    s.stopTimerS = 0;
    s.shedTimerS = 0;
    s.shedStage = 0;
    s.busFreq = 60;
    s.busVolt = 690;
    s.blackout = false;
    s.recoveryT = -1;
    s.recoveryStage = 0;
    s.hcSeq = "IDLE";
    pushLog("ok", "OPR", "Simulation reset to initial state");
  };

  // ── Derived ──
  const syncing = gensets.find((g) => g.state === "sync");
  const closing = syncing
    ? Math.abs(syncing.syncSlipHz) < 0.12 && Math.abs(syncing.syncAngleDeg) < 12
    : false;
  const onlineCapacity = gensets.filter((g) => g.state === "online").reduce((s, g) => s + g.ratedKw, 0);
  const reservePct = onlineCapacity > 0 ? Math.max(0, ((onlineCapacity - busKw) / onlineCapacity) * 100) : 0;
  const overloadNow = plcSnap?.overload ?? false;
  const faultedGenset = gensets.find((g) => g.state === "fault");

  const gensetLabels = {
    start: t("pms.genset.start"),
    stop: t("pms.genset.stop"),
    trip: t("pms.genset.trip"),
    resetFault: t("pms.genset.resetFault"),
    load: t("pms.genset.load"),
    state: {
      standby: t("pms.state.standby"),
      starting: t("pms.state.starting"),
      sync: t("pms.state.sync"),
      online: t("pms.state.online"),
      cooldown: t("pms.state.cooldown"),
      fault: t("pms.state.fault"),
    } as Record<GensetState, string>,
  };

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
                PMS — AUTO
              </span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {t("pms.station")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-wider">
              <span className="text-muted-foreground">{t("pms.bus")} </span>
              <span className={busLive ? "text-primary" : "text-destructive"}>
                {busLive ? `${busVolt.toFixed(0)} V / ${busFreq.toFixed(2)} Hz` : t("pms.busDead")}
              </span>
            </span>
            <div className="h-4 w-px bg-border" />
            <span className="font-mono text-sm font-semibold tabular-nums">
              {currentTime.toTimeString().slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Page intro */}
          <div className="text-center max-w-3xl mx-auto pt-2 pb-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("pms.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("pms.subtitle")}</p>
          </div>

          {/* Alarm bar */}
          {(blackout || overloadNow || faultedGenset) && (
            <div className="alarm-pulse flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border">
              <AlertTriangle className="w-4 h-4 animate-pulse" style={{ color: blackout ? COLOR_ERR : COLOR_WARN }} />
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: blackout ? COLOR_ERR : COLOR_WARN }}>
                {blackout
                  ? t("pms.alarm.blackout")
                  : overloadNow
                  ? t("pms.alarm.overload")
                  : `${faultedGenset?.id} — ${t("pms.alarm.gensetFault")}`}
              </span>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HMIPanel title={t("pms.kpi.busLoad")} glowColor={COLOR_PRIMARY}>
              <DigitalDisplay value={Math.round(busKw)} label={t("pms.kpi.activePower")} unit="kW" color={COLOR_PRIMARY} size="lg" />
            </HMIPanel>
            <HMIPanel title={t("pms.kpi.capacity")} glowColor={COLOR_ACCENT}>
              <DigitalDisplay
                value={onlineCapacity}
                label={`${gensets.filter((g) => g.state === "online").length} × DG ${t("pms.kpi.online")}`}
                unit="kW"
                color={COLOR_ACCENT}
                size="lg"
              />
            </HMIPanel>
            <HMIPanel title={t("pms.kpi.reserve")} glowColor={reservePct < 15 ? COLOR_ERR : COLOR_PRIMARY}>
              <GaugeCircular
                value={Math.round(reservePct)}
                max={100}
                label=""
                unit="%"
                color={reservePct < 15 ? COLOR_ERR : reservePct < 25 ? COLOR_WARN : COLOR_OK}
                size={120}
                warningThreshold={101}
                criticalThreshold={102}
              />
            </HMIPanel>
            <HMIPanel title={t("pms.kpi.busFreq")} glowColor={COLOR_PRIMARY}>
              <div className="flex flex-col items-center justify-center h-full gap-1 py-2">
                <span className="font-mono text-4xl font-semibold tabular-nums" style={{ color: busLive ? COLOR_PRIMARY : "hsl(var(--muted-foreground))" }}>
                  {busLive ? busFreq.toFixed(2) : "--.--"}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Hz</span>
              </div>
            </HMIPanel>
          </div>

          {/* Main: SLD + sync/scenarios */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <HMIPanel title={t("pms.sld.title")} className="lg:col-span-3">
              <SingleLineDiagram
                gensets={gensets}
                consumers={consumers}
                busLive={busLive}
                busKw={busKw}
                blackout={blackout}
                onToggleConsumer={handleToggleConsumer}
                labels={{
                  bus: t("pms.sld.bus"),
                  busDead: t("pms.sld.busDead"),
                  heavy: "HC",
                  shed: t("pms.sld.shed"),
                  request: t("pms.sld.request"),
                }}
              />
              <p className="mt-1 text-[11px] text-muted-foreground text-center">{t("pms.sld.hint")}</p>
            </HMIPanel>

            <div className="space-y-4">
              <HMIPanel title={t("pms.sync.title")} glowColor={syncing ? COLOR_WARN : undefined}>
                <div className="flex justify-center">
                  <Synchroscope
                    angleDeg={syncing?.syncAngleDeg ?? 0}
                    slipHz={syncing?.syncSlipHz ?? 0}
                    activeUnit={syncing?.id ?? null}
                    closing={closing}
                    labels={{
                      fast: t("pms.sync.fast"),
                      slow: t("pms.sync.slow"),
                      idle: t("pms.sync.idle"),
                      closing: t("pms.sync.closing"),
                    }}
                  />
                </div>
              </HMIPanel>

              <HMIPanel title={t("pms.scenario.title")}>
                <div className="space-y-2">
                  <button
                    onClick={handleBlackout}
                    disabled={blackout || !busLive}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded font-mono text-[11px] uppercase tracking-wider border border-destructive/40 text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ZapOff className="w-3.5 h-3.5" /> {t("pms.scenario.blackout")}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded font-mono text-[11px] uppercase tracking-wider border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> {t("pms.scenario.reset")}
                  </button>
                  <p className="text-[10.5px] leading-relaxed text-muted-foreground pt-1">
                    {t("pms.scenario.hint")}
                  </p>
                </div>
              </HMIPanel>
            </div>
          </div>

          {/* Genset cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gensets.map((g, i) => (
              <GensetCard
                key={g.id}
                genset={g}
                onStart={() => handleStartGenset(i)}
                onStop={() => handleStopGenset(i)}
                onTrip={() => handleTripGenset(i)}
                onResetFault={() => handleResetFault(i)}
                labels={gensetLabels}
              />
            ))}
          </div>

          {/* PLC logic + event log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <HMIPanel title={t("pms.plc.title")} className="lg:col-span-2" glowColor={COLOR_ACCENT}>
              {plcSnap && <PlcLogicView snap={plcSnap} hint={t("pms.plc.hint")} />}
            </HMIPanel>

            <HMIPanel title={t("pms.log.title")}>
              <div className="space-y-0.5 h-[420px] overflow-y-auto pr-0.5">
                {eventLog.map((event) => {
                  const dotColor: Record<PmsLogSev, string> = {
                    ok: COLOR_OK,
                    info: COLOR_PRIMARY,
                    warn: COLOR_WARN,
                    err: COLOR_ERR,
                  };
                  return (
                    <div key={event.id} className="flex items-start gap-2 py-1.5 border-b border-border/15 last:border-0">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor[event.sev] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[9px] font-medium" style={{ color: dotColor[event.sev] }}>{event.unit}</span>
                          <span className="font-mono text-[8px] text-muted-foreground/45 tabular-nums">{formatClock(event.ts)}</span>
                        </div>
                        <p className="font-mono text-[9px] text-muted-foreground leading-tight">{event.msg}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </HMIPanel>
          </div>

          {/* Explainer */}
          <HMIPanel title={t("pms.explainer.title")}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: t("pms.explainer.ldTitle"), body: t("pms.explainer.ldBody") },
                { title: t("pms.explainer.hcTitle"), body: t("pms.explainer.hcBody") },
                { title: t("pms.explainer.boTitle"), body: t("pms.explainer.boBody") },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-primary">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </HMIPanel>
        </div>
      </div>
    </div>
  );
};

export default PMSDemo;
