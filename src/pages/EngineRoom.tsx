import { useState, useEffect, useRef } from "react";
import { Radio, AlertTriangle, FlaskConical, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HMIPanel from "@/components/hmi/HMIPanel";
import DigitalDisplay from "@/components/hmi/DigitalDisplay";
import DemoExplainer from "@/components/hmi/DemoExplainer";
import DemoPagerNav from "@/components/DemoPagerNav";
import { Slider } from "@/components/ui/slider";
import EngineMimic, { EngineMimicState } from "@/components/engine/EngineMimic";
import AmsAlarmList, { AmsAlarm } from "@/components/engine/AmsAlarmList";
import EnginePlcView, { EnginePlcSnapshot } from "@/components/engine/EnginePlcView";

const TICK_MS = 100;
const MCR_RPM = 750;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

interface AlarmDef {
  id: string;
  tag: string;
  severity: "alarm" | "warning";
  textKey: string;
}

const ALARM_DEFS: AlarmDef[] = [
  { id: "LO_P_LOW", tag: "PT-2301", severity: "alarm", textKey: "engine.alm.loLow" },
  { id: "LO_SLOWDOWN", tag: "SLD-001", severity: "alarm", textKey: "engine.alm.loSlowdown" },
  { id: "LO_SHUTDOWN", tag: "SHD-001", severity: "alarm", textKey: "engine.alm.loShutdown" },
  { id: "LO_STBY", tag: "LO-P2", severity: "warning", textKey: "engine.alm.loStby" },
  { id: "CYL_DEV", tag: "TE-2104", severity: "warning", textKey: "engine.alm.cylDev" },
  { id: "FW_T_HIGH", tag: "TT-2201", severity: "warning", textKey: "engine.alm.fwHigh" },
  { id: "FW_SLOWDOWN", tag: "SLD-002", severity: "alarm", textKey: "engine.alm.fwSlowdown" },
  { id: "SW_P_STOP", tag: "SW-P1", severity: "warning", textKey: "engine.alm.swStop" },
];

const EngineRoom = () => {
  const { t } = useLanguage();

  const simRef = useRef({
    telegraph: 0,
    rpm: 0,
    loadPct: 0,
    cylBase: [0, 0, 0, 0, 0, 0].map((_, i) => i * 1.7),
    cyl4Offset: 0,
    tcRpm: 0,
    loPress: 0.4,
    loTemp: 45,
    loFault: false,
    loFaultT: 0,
    loStbyRun: false,
    loStbyDelay: 0,
    runT: 0,
    fwTemp: 70,
    fwValve: 30,
    fwInt: 0,
    swMainRun: true,
    swStbyRun: false,
    swFault: false,
    swStbyDelay: 0,
    cyl4Fault: false,
    slowdown: false,
    shutdown: false,
    phase: 0,
    horn: false,
    alarms: [] as AmsAlarm[],
  });

  const [telegraph, setTelegraph] = useState(0);
  const telegraphRef = useRef(0);
  useEffect(() => { telegraphRef.current = telegraph; }, [telegraph]);

  const [mimic, setMimic] = useState<EngineMimicState>({
    rpm: 0, loadPct: 0, cylTemps: [0, 0, 0, 0, 0, 0].map(() => 25), tcRpm: 0,
    loPressBar: 0.4, loTempC: 45, loMainRun: false, loStbyRun: false,
    fwTempC: 70, fwValvePct: 30, swMainRun: true, swStbyRun: false,
    shutdown: false, slowdown: false,
  });
  const [alarms, setAlarms] = useState<AmsAlarm[]>([]);
  const [horn, setHorn] = useState(false);
  const [plcSnap, setPlcSnap] = useState<EnginePlcSnapshot | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Sim loop ──
  useEffect(() => {
    const interval = setInterval(() => {
      const dt = TICK_MS / 1000;
      const s = simRef.current;
      s.phase += dt;

      // 1. Engine speed: telegraph → rpm with lag; slowdown caps, shutdown kills
      let target = (telegraphRef.current / 100) * MCR_RPM;
      if (s.slowdown) target = Math.min(target, 0.35 * MCR_RPM);
      if (s.shutdown) target = 0;
      s.rpm += (target - s.rpm) * dt / 2.6;
      if (s.rpm < 2) s.rpm = 0;
      const running = s.rpm > 100;
      s.runT = running ? s.runT + dt : 0;
      s.loadPct = Math.pow(s.rpm / MCR_RPM, 3) * 100;

      // Pre-lubrication: the electric standby pump runs before/while the
      // engine comes up, until the engine-driven pump delivers.
      if (telegraphRef.current > 0 && !running && !s.shutdown) s.loStbyRun = true;

      // 2. Cylinder exhaust temps (+ cyl 4 deviation fault)
      s.cyl4Offset += ((s.cyl4Fault ? 62 : 0) - s.cyl4Offset) * dt / 5;
      const cylTemps = s.cylBase.map((b, i) => {
        const wobble = Math.sin(s.phase * 0.7 + i * 1.9) * 5 + Math.sin(s.phase * 2.3 + i) * 2;
        const base = running ? 178 + s.loadPct * 2.45 : Math.max(25, 178 * (s.rpm / 300));
        return base + b + wobble + (i === 3 ? s.cyl4Offset : 0);
      });

      // 3. Turbocharger
      s.tcRpm += ((s.loadPct / 100) * 26500 - s.tcRpm) * dt / 3.5;

      // 4. Lube oil: engine-driven main pump; electric standby auto-starts at
      //    the low-pressure alarm limit. The injected fault is a progressive
      //    leak, so the protection ladder plays out in stages: alarm →
      //    standby rescue → slowdown → latched shutdown.
      const loMainRun = running;
      s.loFaultT = s.loFault ? s.loFaultT + dt : 0;
      let pressTarget: number;
      if (!running) pressTarget = s.loStbyRun ? 3.0 : 0.4;
      else if (s.loFault) {
        const base = s.loStbyRun ? 3.3 : 1.5;
        pressTarget = Math.max(1.2, base - s.loFaultT * 0.09);
      } else pressTarget = 4.1 + s.loadPct * 0.007;
      s.loPress += (pressTarget - s.loPress) * dt / 3.2 + (Math.random() - 0.5) * 0.02;
      if (s.loPress < 2.5 && running && !s.loStbyRun) {
        s.loStbyDelay += dt;
        if (s.loStbyDelay > 1.0) s.loStbyRun = true; // auto changeover
      } else {
        s.loStbyDelay = 0;
        if (!s.loFault && s.loPress > 3.8) s.loStbyRun = false;
      }
      s.loTemp += ((running ? 56 + s.loadPct * 0.13 : 45) - s.loTemp) * dt / 12;

      // Safety chain: slowdown / shutdown on LO pressure. Armed only after a
      // short build-up time so a normal start cannot trip the protection.
      const protArmed = s.runT > 4;
      if (protArmed && s.loPress < 1.6) s.shutdown = true;
      const loSlow = protArmed && s.loPress < 2.0;

      // 5. LT FW cooling with PI-controlled 3-way valve (setpoint 82 °C)
      const swFlow = s.swMainRun || s.swStbyRun ? 1 : 0.12;
      const err = s.fwTemp - 82;
      if (running) {
        s.fwInt = clamp(s.fwInt + err * dt * 0.25, -30, 30);
        s.fwValve = clamp(50 + err * 16 + s.fwInt, 0, 100);
      } else {
        s.fwValve += (15 - s.fwValve) * dt / 5;
        s.fwInt = 0;
      }
      const heatIn = s.loadPct * 0.052;
      const coolOut = (s.fwValve / 100) * (s.fwTemp - 15) * 0.00115 * swFlow * 60;
      s.fwTemp += (heatIn - coolOut - (s.fwTemp - 25) * 0.001) * dt;
      const fwSlow = s.fwTemp > 95;
      s.slowdown = loSlow || fwSlow;

      // 6. Seawater pumps: trip → standby auto-start
      if (s.swFault && s.swMainRun) s.swMainRun = false;
      if (!s.swMainRun && !s.swStbyRun) {
        s.swStbyDelay += dt;
        if (s.swStbyDelay > 2) s.swStbyRun = true;
      }
      if (!s.swFault && !s.swMainRun && s.swStbyRun === false) { /* waiting on delay */ }

      // 7. AMS alarm state machine (IMO ack/clear semantics)
      const meanT = cylTemps.reduce((a, b) => a + b, 0) / 6;
      const conditions: Record<string, boolean> = {
        LO_P_LOW: s.runT > 2 && s.loPress < 2.5,
        LO_SLOWDOWN: loSlow,
        LO_SHUTDOWN: s.shutdown,
        LO_STBY: s.loStbyRun && running,
        CYL_DEV: running && Math.abs(cylTemps[3] - meanT) > 35,
        FW_T_HIGH: s.fwTemp > 90,
        FW_SLOWDOWN: fwSlow,
        SW_P_STOP: s.swFault,
      };
      const now = Date.now();
      const list = [...s.alarms];
      ALARM_DEFS.forEach((def) => {
        const active = conditions[def.id];
        const idx = list.findIndex((a) => a.id === def.id);
        if (active && idx === -1) {
          list.unshift({ id: def.id, tag: def.tag, severity: def.severity, text: t(def.textKey), state: "activeUnack", ts: now });
          s.horn = true; // new alarm always re-sounds the horn
        } else if (!active && idx !== -1) {
          if (list[idx].state === "activeAck") list.splice(idx, 1); // acked + cleared → drop
          else if (list[idx].state === "activeUnack") list[idx] = { ...list[idx], state: "clearedUnack" };
        } else if (active && idx !== -1 && list[idx].state === "clearedUnack") {
          list[idx] = { ...list[idx], state: "activeUnack", ts: now };
          s.horn = true;
        }
      });
      s.alarms = list;
      if (!list.some((a) => a.state === "activeUnack")) s.horn = false;

      // 8. Mirror
      setMimic({
        rpm: s.rpm, loadPct: s.loadPct, cylTemps, tcRpm: s.tcRpm,
        loPressBar: s.loPress, loTempC: s.loTemp, loMainRun, loStbyRun: s.loStbyRun,
        fwTempC: s.fwTemp, fwValvePct: s.fwValve,
        swMainRun: s.swMainRun, swStbyRun: s.swStbyRun,
        shutdown: s.shutdown, slowdown: s.slowdown,
      });
      setAlarms(list);
      setHorn(s.horn);
      setPlcSnap({
        loPress: s.loPress,
        loStbyRun: s.loStbyRun,
        stbyDelayS: s.loStbyDelay,
        runT: s.runT,
        protArmed,
        slowdown: s.slowdown,
        shutdown: s.shutdown,
        fwTemp: s.fwTemp,
        fwInt: s.fwInt,
        fwValve: s.fwValve,
        cylMean: meanT,
        cylDev4: cylTemps[3] - meanT,
        rpm: s.rpm,
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [t]);

  // ── Handlers ──
  const handleAckAll = () => {
    const s = simRef.current;
    s.alarms = s.alarms
      .filter((a) => a.state !== "clearedUnack")
      .map((a) => ({ ...a, state: "activeAck" as const }));
    s.horn = false;
  };
  const handleSilence = () => { simRef.current.horn = false; };
  const setFault = (key: "cyl4Fault" | "loFault" | "swFault") => {
    simRef.current[key] = !simRef.current[key];
  };
  const handleResetFaults = () => {
    const s = simRef.current;
    s.cyl4Fault = false;
    s.loFault = false;
    s.loFaultT = 0;
    s.swFault = false;
    s.shutdown = false;
    s.swMainRun = true;
    s.swStbyRun = false;
    s.swStbyDelay = 0;
    s.loStbyDelay = 0;
    if (s.rpm < 5) setTelegraph(0);
  };

  const faultBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded font-mono text-[10px] uppercase tracking-wider border transition-colors ${
        active
          ? "border-destructive/60 text-destructive bg-destructive/10"
          : "border-border text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      <span className="flex items-center gap-2"><FlaskConical className="w-3 h-3" /> {label}</span>
      <span>{active ? "ON" : "OFF"}</span>
    </button>
  );

  const meanT = mimic.cylTemps.reduce((a, b) => a + b, 0) / 6;
  const anyActive = alarms.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16">
        <div className="pointer-events-none fixed inset-0 z-30 hmi-scanlines" />

        {/* Status bar */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">AMS — {t("engine.umsMode")}</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:inline">
              {t("engine.station")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {horn && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-destructive animate-pulse">♪ {t("engine.horn")}</span>
            )}
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="font-mono text-sm font-semibold tabular-nums">{currentTime.toTimeString().slice(0, 8)}</span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Intro */}
          <div className="text-center max-w-3xl mx-auto pt-2 pb-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t("engine.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("engine.subtitle")}</p>
          </div>

          {/* Alarm banner */}
          {(mimic.shutdown || mimic.slowdown) && (
            <div className="alarm-pulse flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border">
              <AlertTriangle className="w-4 h-4 animate-pulse" style={{ color: mimic.shutdown ? "hsl(0,70%,55%)" : "hsl(38,85%,60%)" }} />
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: mimic.shutdown ? "hsl(0,70%,55%)" : "hsl(38,85%,60%)" }}>
                {mimic.shutdown ? t("engine.banner.shutdown") : t("engine.banner.slowdown")}
              </span>
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HMIPanel title={t("engine.kpi.rpm")} glowColor="hsl(200,100%,60%)">
              <DigitalDisplay value={`${Math.round(mimic.rpm)}`} label={`MCR ${MCR_RPM}`} unit="rpm" color="hsl(200,100%,60%)" size="lg" />
            </HMIPanel>
            <HMIPanel title={t("engine.kpi.load")} glowColor="hsl(180,100%,55%)">
              <DigitalDisplay value={`${Math.round(mimic.loadPct)}`} label={t("engine.kpi.ofMcr")} unit="%" color="hsl(180,100%,55%)" size="lg" />
            </HMIPanel>
            <HMIPanel title={t("engine.kpi.loPress")} glowColor={mimic.loPressBar < 2.5 ? "hsl(0,70%,55%)" : "hsl(38,85%,60%)"}>
              <DigitalDisplay value={mimic.loPressBar} label="PT-2301" unit="bar"
                color={mimic.loPressBar < 2.5 ? "hsl(0,70%,55%)" : "hsl(38,85%,60%)"} size="lg" />
            </HMIPanel>
            <HMIPanel title={t("engine.kpi.fwTemp")} glowColor={mimic.fwTempC > 90 ? "hsl(0,70%,55%)" : "hsl(180,90%,55%)"}>
              <DigitalDisplay value={mimic.fwTempC} label="TT-2201 · SP 82" unit="°C"
                color={mimic.fwTempC > 90 ? "hsl(0,70%,55%)" : "hsl(180,90%,55%)"} size="lg" />
            </HMIPanel>
          </div>

          {/* Main: mimic + right column */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <HMIPanel title={t("engine.mimic.title")} className="lg:col-span-3"
              glowColor={mimic.shutdown ? "hsl(0,70%,55%)" : undefined}>
              <EngineMimic s={mimic} />
            </HMIPanel>

            <div className="space-y-4">
              <HMIPanel title={t("engine.telegraph.title")}>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{t("engine.telegraph.lever")}</span>
                    <span className="font-mono text-sm tabular-nums text-primary">{telegraph} %</span>
                  </div>
                  <Slider value={[telegraph]} onValueChange={(v) => setTelegraph(v[0])} min={0} max={100} step={1}
                    disabled={mimic.shutdown} />
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      [0, t("engine.telegraph.stop")],
                      [30, t("engine.telegraph.slow")],
                      [60, t("engine.telegraph.half")],
                      [90, t("engine.telegraph.full")],
                    ].map(([v, label]) => (
                      <button key={v}
                        onClick={() => setTelegraph(v as number)}
                        disabled={mimic.shutdown}
                        className={`px-1 py-1.5 rounded font-mono text-[9px] uppercase tracking-wider border transition-colors disabled:opacity-30 ${
                          telegraph === v ? "bg-primary/15 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {mimic.shutdown && (
                    <p className="text-[10px] leading-snug text-destructive/90 font-mono uppercase tracking-wide">
                      {t("engine.telegraph.shutdownHint")}
                    </p>
                  )}
                </div>
              </HMIPanel>

              <HMIPanel title={t("engine.faults.title")}>
                <div className="space-y-2">
                  {faultBtn(t("engine.faults.cyl4"), mimic.cylTemps[3] - meanT > 30, () => setFault("cyl4Fault"))}
                  {faultBtn(t("engine.faults.lo"), simRef.current.loFault, () => setFault("loFault"))}
                  {faultBtn(t("engine.faults.sw"), simRef.current.swFault, () => setFault("swFault"))}
                  <button onClick={handleResetFaults}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded font-mono text-[10px] uppercase tracking-wider border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors">
                    <RotateCcw className="w-3 h-3" /> {t("engine.faults.reset")}
                  </button>
                  <p className="text-[10.5px] leading-relaxed text-muted-foreground pt-1">{t("engine.faults.hint")}</p>
                </div>
              </HMIPanel>
            </div>
          </div>

          {/* Cylinder temps + AMS alarms */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <HMIPanel title={t("engine.cyl.title")} className="lg:col-span-2">
              <svg viewBox="0 0 600 190" className="w-full">
                {(() => {
                  const t0 = 120, t1 = 520; // temp range mapped to bar height
                  const y = (tc: number) => 165 - clamp((tc - t0) / (t1 - t0), 0, 1) * 140;
                  return (
                    <>
                      {/* Mean + deviation band */}
                      <rect x={30} y={y(meanT + 35)} width={540} height={Math.max(0, y(meanT - 35) - y(meanT + 35))}
                        fill="hsl(38,85%,60%)" fillOpacity={0.06} />
                      <line x1={30} y1={y(meanT)} x2={570} y2={y(meanT)}
                        stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="5 4" strokeOpacity={0.6} />
                      <text x={575} y={y(meanT) + 3} fontSize={9} fontFamily="monospace"
                        fill="hsl(var(--muted-foreground))" className="tabular-nums">x̄</text>
                      {mimic.cylTemps.map((tc, i) => {
                        const x = 60 + i * 85;
                        const dev = tc - meanT;
                        const col = Math.abs(dev) > 35 ? "hsl(0,70%,55%)" : Math.abs(dev) > 22 ? "hsl(38,85%,60%)" : "hsl(200,100%,60%)";
                        return (
                          <g key={i}>
                            <rect x={x - 16} y={y(tc)} width={32} height={165 - y(tc)} rx={2}
                              fill={col} fillOpacity={0.3} stroke={col} strokeWidth={1.2}
                              style={{ transition: "y 0.2s linear, height 0.2s linear" }} />
                            <text x={x} y={y(tc) - 6} textAnchor="middle" fontSize={10} fontFamily="monospace"
                              fill={col} className="tabular-nums">{Math.round(tc)}°</text>
                            <text x={x} y={182} textAnchor="middle" fontSize={9} fontFamily="monospace"
                              fill="hsl(var(--muted-foreground))">CYL {i + 1}</text>
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
              <p className="text-[10.5px] text-muted-foreground text-center">{t("engine.cyl.hint")}</p>
            </HMIPanel>

            <HMIPanel title={t("engine.ams.title")} glowColor={anyActive ? "hsl(38,85%,60%)" : undefined}>
              <AmsAlarmList
                alarms={alarms}
                hornActive={horn}
                onAckAll={handleAckAll}
                onSilence={handleSilence}
                labels={{
                  ackAll: t("engine.ams.ackAll"),
                  silence: t("engine.ams.silence"),
                  allClear: t("engine.ams.allClear"),
                  stateActiveUnack: t("engine.ams.activeUnack"),
                  stateActiveAck: t("engine.ams.activeAck"),
                  stateClearedUnack: t("engine.ams.clearedUnack"),
                }}
              />
            </HMIPanel>
          </div>

          {/* PLC logic */}
          <HMIPanel title={t("engine.plc.title")} glowColor="hsl(180, 100%, 55%)">
            {plcSnap && <EnginePlcView snap={plcSnap} hint={t("engine.plc.hint")} />}
          </HMIPanel>

          {/* Explainer */}
          <DemoExplainer
            title={t("engine.explainer.title")}
            items={[
              { title: t("engine.explainer.amsTitle"), body: t("engine.explainer.amsBody") },
              { title: t("engine.explainer.safetyTitle"), body: t("engine.explainer.safetyBody") },
              { title: t("engine.explainer.controlTitle"), body: t("engine.explainer.controlBody") },
            ]}
          />
          <DemoPagerNav />
        </div>
      </div>
    </div>
  );
};

export default EngineRoom;
