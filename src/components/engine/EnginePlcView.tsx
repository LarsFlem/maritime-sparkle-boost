import PlcCodeView, { CodeLine } from "@/components/hmi/PlcCodeView";
import { st } from "@/components/hmi/st";

export interface EnginePlcSnapshot {
  loPress: number;
  loStbyRun: boolean;
  /** Electric LO pump started by low pressure while running (changeover), not pre-lube */
  loStbyAuto: boolean;
  stbyDelayS: number;
  runT: number;
  protArmed: boolean;
  slowdownLo: boolean;
  slowdownFw: boolean;
  slowdown: boolean;
  shutdown: boolean;
  fwTemp: number;
  fwInt: number;
  fwValve: number;
  cylMean: number;
  cylDev4: number;
  rpm: number;
}

interface EnginePlcViewProps {
  snap: EnginePlcSnapshot;
  hint: string;
}

/**
 * Simplified structured-text view of the protection and control logic the
 * engine-room simulation follows (EngineRoom.tsx), with live values.
 */
const EnginePlcView = ({ snap, hint }: EnginePlcViewProps) => {
  const fmt = (n: number, d = 1) => n.toFixed(d);
  const running = snap.rpm > 100;
  const loLow = running && snap.runT > 6 && snap.loPress < 2.5;

  const loLines: CodeLine[] = [
    st("(* ME lube-oil protection: alarm / standby / slowdown / shutdown *)"),
    st("bEngRunning := rRpm > 100.0;", { watch: [{ label: "rpm", value: fmt(snap.rpm, 0) }, { label: "=", value: running }] }),
    st("tonArm(IN := bEngRunning, PT := T#4S);  (* protection armed after build-up *)", {
      watch: [{ label: "ET", value: `${fmt(Math.min(snap.runT, 99))}s` }, { label: "Q", value: snap.protArmed }],
    }),
    st("tonAlmArm(IN := bEngRunning, PT := T#6S);  (* pressure alarms wait for the engine pump *)"),
    st("bLoLow := bEngRunning AND tonAlmArm.Q AND rLoPress < 2.5;", {
      watch: [{ label: "PT-2301", value: `${fmt(snap.loPress)} bar` }, { label: "=", value: loLow }],
    }),
    st(""),
    st("(* Electric pump: pre-lube before start, standby changeover on low pressure *)"),
    st("IF bStartOrder AND NOT bEngRunning THEN bElPumpRun := TRUE; END_IF"),
    st("tonChg(IN := bLoLow AND NOT bChangeover, PT := T#1S);", { watch: [{ label: "ET", value: `${fmt(snap.stbyDelayS)}s` }] }),
    st("IF tonChg.Q THEN bElPumpRun := TRUE; bChangeover := TRUE; END_IF", { watch: [{ label: "chg", value: snap.loStbyAuto }] }),
    st("IF bEngRunning AND rLoPress > 3.8 AND NOT bLoFault THEN", { watch: [{ label: "pump", value: snap.loStbyRun }] }),
    st("  bElPumpRun := FALSE; bChangeover := FALSE;  (* engine-driven pump delivers *)"),
    st("END_IF"),
    st("bStartBlock := NOT bEngRunning AND rLoPress < 1.5;  (* no start without pre-lube *)"),
    st(""),
    st("bSlowdownLo := tonArm.Q AND rLoPress < 2.0;", { watch: [{ label: "=", value: snap.slowdownLo }] }),
    st("bSlowdownFw := rFwTemp > 95.0;", { watch: [{ label: "=", value: snap.slowdownFw }] }),
    st("bSlowdown := bSlowdownLo OR bSlowdownFw;  (* limit to 35 % MCR load *)", { watch: [{ label: "=", value: snap.slowdown }], active: snap.slowdown }),
    st("IF tonArm.Q AND rLoPress < 1.6 THEN bShutdown := TRUE; END_IF  (* latched *)", { watch: [{ label: "=", value: snap.shutdown }], active: snap.shutdown }),
    st("IF bResetCmd THEN bShutdown := FALSE; nTelegraph := 0; END_IF  (* no restart on reset *)"),
  ];

  const piLines: CodeLine[] = [
    st("(* HT FW (jacket water) temperature: PI on three-way valve, SP 82.0 °C *)"),
    st("rErr := rFwTemp - R_SETPOINT;", { watch: [{ label: "TT-2201", value: `${fmt(snap.fwTemp)} °C` }] }),
    st("IF bEngRunning THEN"),
    st("  rInt := LIMIT(-30.0, rInt + rErr * 0.25 * R_DT, 30.0);  (* anti-windup *)", { watch: [{ label: "I", value: fmt(snap.fwInt) }] }),
    st("  rValve := LIMIT(0.0, 50.0 + rErr * 16.0 + rInt, 100.0);", { watch: [{ label: "=", value: `${fmt(snap.fwValve, 0)} %` }] }),
    st("ELSE"),
    st("  rInt := 0.0;  (* valve parks towards bypass *)"),
    st("END_IF"),
    st("(* Valve splits flow cooler/bypass; the SW side sets the cooling capacity. *)"),
    st("(* Trip the SW pump and watch the integrator wind up to its limit. *)"),
  ];

  const devLines: CodeLine[] = [
    st("(* Cylinder exhaust deviation monitoring *)"),
    st("rSum := 0.0;"),
    st("FOR i := 1 TO 6 DO"),
    st("  rSum := rSum + arCylT[i];"),
    st("END_FOR"),
    st("rMean := rSum / 6.0;", { watch: [{ label: "=", value: `${fmt(snap.cylMean, 0)} °C` }] }),
    st("FOR i := 1 TO 6 DO"),
    st("  arDev[i] := ABS(arCylT[i] - rMean);"),
    st("  bDevAlm[i] := bEngRunning AND arDev[i] > 35.0;  (* combustion / injector fault *)", {
      watch: [{ label: "dev[4]", value: `${snap.cylDev4 >= 0 ? "+" : ""}${fmt(snap.cylDev4, 0)} °C` }],
      active: running && Math.abs(snap.cylDev4) > 35,
    }),
    st("END_FOR"),
  ];

  return (
    <PlcCodeView
      tabs={[
        { id: "LO PROTECT", lines: loLines },
        { id: "FW PI CTRL", lines: piLines },
        { id: "CYL DEV", lines: devLines },
      ]}
      hint={hint}
    />
  );
};

export default EnginePlcView;
