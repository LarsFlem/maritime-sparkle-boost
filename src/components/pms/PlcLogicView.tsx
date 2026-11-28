import PlcCodeView, { CodeLine } from "@/components/hmi/PlcCodeView";
import { st } from "@/components/hmi/st";

export interface PlcSnapshot {
  busLoadKw: number;
  onlineCapKw: number;
  busLoadPct: number;
  highLoad: boolean;
  lowLoad: boolean;
  startTimerS: number;
  stopTimerS: number;
  startTimerQ: boolean;
  stopTimerQ: boolean;
  standbyAvail: boolean;
  onlineCount: number;
  hcSeq: "IDLE" | "CHECK" | "STARTING" | "GRANT";
  hcRequest: boolean;
  reserveKw: number;
  hcDemandKw: number;
  reserveOk: boolean;
  overload: boolean;
  shedStage: number;
  incoming: boolean;
  shedTimerS: number;
  blackout: boolean;
}

interface PlcLogicViewProps {
  snap: PlcSnapshot;
  hint: string;
}

/**
 * Simplified structured-text view of the PMS logic the simulation follows
 * (PMSDemo.tsx), with live values. Not a complete PMS.
 */
const PlcLogicView = ({ snap, hint }: PlcLogicViewProps) => {
  const fmt = (n: number, d = 1) => n.toFixed(d);
  const hc = (s: PlcSnapshot["hcSeq"]) => snap.hcSeq === s;

  const ldLines: CodeLine[] = [
    st("(* Load-dependent start / stop: main bus *)"),
    st("IF rOnlineCap_kW > 0.0 THEN", { watch: [{ label: "cap", value: `${fmt(snap.onlineCapKw, 0)} kW` }] }),
    st("  rBusLoad_pct := rBusLoad_kW / rOnlineCap_kW * 100.0;", {
      watch: [{ label: "load", value: `${fmt(snap.busLoadKw, 0)} kW` }, { label: "=", value: `${fmt(snap.busLoadPct)} %` }],
    }),
    st("ELSE"),
    st("  rBusLoad_pct := 0.0;  (* dead bus: handled by the blackout sequence *)", { active: snap.blackout }),
    st("END_IF"),
    st(""),
    st("fbTonStart(IN := rBusLoad_pct > 85.0, PT := T#5S);", {
      watch: [{ label: "ET", value: `${fmt(snap.startTimerS)}s` }, { label: "Q", value: snap.startTimerQ }],
    }),
    st("IF fbTonStart.Q AND bStandbyAvail AND NOT bIncoming THEN", {
      watch: [{ label: "stby", value: snap.standbyAvail }, { label: "incoming", value: snap.incoming }],
      active: snap.startTimerQ,
    }),
    st("  PMS_StartNextStandby();  (* start, synchronise, close *)", { active: snap.startTimerQ }),
    st("END_IF"),
    st(""),
    st("fbTonStop(IN := rBusLoad_pct < 35.0 AND nOnline > 1, PT := T#15S);", {
      watch: [{ label: "ET", value: `${fmt(snap.stopTimerS)}s` }, { label: "online", value: String(snap.onlineCount) }],
    }),
    st("rRemainCap_kW := rOnlineCap_kW - rLastOnCap_kW;"),
    st("IF fbTonStop.Q AND rRemainCap_kW > 0.0", { active: snap.stopTimerQ }),
    st("   AND rBusLoad_kW / rRemainCap_kW < 0.80 THEN  (* capacity check *)", { active: snap.stopTimerQ }),
    st("  PMS_StopLastOn();  (* unload, open breaker, cool down *)", { active: snap.stopTimerQ }),
    st("END_IF"),
  ];

  const hcLines: CodeLine[] = [
    st("(* Heavy consumer: power reservation before the bow thruster connects *)"),
    st("rReserve_kW := rOnlineCap_kW - rBusLoad_kW;", { watch: [{ label: "=", value: `${fmt(snap.reserveKw, 0)} kW` }] }),
    st("bReserveOk := rReserve_kW >= rBowThr_Rated_kW * 1.10;", {
      watch: [{ label: "need", value: `${fmt(snap.hcDemandKw * 1.1, 0)} kW` }, { label: "=", value: snap.reserveOk }],
    }),
    st("CASE eHcSeq OF", { watch: [{ label: "=", value: `HC_${snap.hcSeq}` }] }),
    st("  HC_IDLE:", { active: hc("IDLE") }),
    st("    IF bBowThrRequest THEN eHcSeq := HC_CHECK; END_IF", { active: hc("IDLE"), watch: [{ label: "req", value: snap.hcRequest }] }),
    st("  HC_CHECK:", { active: hc("CHECK") }),
    st("    IF NOT bBowThrRequest THEN eHcSeq := HC_IDLE;", { active: hc("CHECK") }),
    st("    ELSIF bReserveOk THEN eHcSeq := HC_GRANT;", { active: hc("CHECK") }),
    st("    ELSIF bStandbyAvail AND NOT bIncoming THEN", { active: hc("CHECK") }),
    st("      PMS_StartNextStandby(); eHcSeq := HC_STARTING;", { active: hc("CHECK") }),
    st("    END_IF", { active: hc("CHECK") }),
    st("  HC_STARTING:", { active: hc("STARTING") }),
    st("    IF NOT bBowThrRequest THEN eHcSeq := HC_IDLE;", { active: hc("STARTING") }),
    st("    ELSIF bReserveOk AND NOT bIncoming THEN eHcSeq := HC_GRANT; END_IF", { active: hc("STARTING") }),
    st("  HC_GRANT:", { active: hc("GRANT") }),
    st("    bBowThrCloseCB := TRUE;  (* reservation granted, connect *)", { active: hc("GRANT") }),
    st("    eHcSeq := HC_IDLE;", { active: hc("GRANT") }),
    st("END_CASE"),
  ];

  const ptLines: CodeLine[] = [
    st("(* Preferential trip: staged shedding of non-essential load on overload *)"),
    st("bOverload := rBusLoad_pct > 95.0;", { watch: [{ label: "=", value: snap.overload }], active: snap.overload }),
    st("fbTonShed(IN := bOverload AND NOT fbTonShed.Q, PT := T#2500MS);  (* re-arms each stage *)", {
      watch: [{ label: "ET", value: `${fmt(snap.shedTimerS)}s` }],
    }),
    st("IF fbTonShed.Q AND nShedStage < 3 THEN", { active: snap.overload }),
    st("  aShedCB[nShedStage] := FALSE;  (* 0 GALLEY, 1 HVAC, 2 CRANE *)", { active: snap.overload }),
    st("  nShedStage := nShedStage + 1;", { active: snap.overload, watch: [{ label: "stage", value: String(snap.shedStage) }] }),
    st("END_IF"),
    st("IF NOT bOverload AND rBusLoad_pct < 80.0 THEN nShedStage := 0; END_IF  (* reset *)"),
    st(""),
    st("(* Blackout: dead bus starts the recovery, essentials reconnect staggered *)"),
    st("IF NOT bBusLive AND NOT bRecovery THEN", { watch: [{ label: "blackout", value: snap.blackout }], active: snap.blackout }),
    st("  FOR i := 0 TO 5 DO aConsumerCB[i] := FALSE; END_FOR  (* undervoltage trip *)", { active: snap.blackout }),
    st("  bRecovery := TRUE; PMS_StartNextStandby();  (* dead-bus closure *)", { active: snap.blackout }),
    st("END_IF"),
  ];

  return (
    <PlcCodeView
      tabs={[
        { id: "LD START/STOP", lines: ldLines },
        { id: "HC RESERVE", lines: hcLines },
        { id: "PREF TRIP", lines: ptLines },
      ]}
      hint={hint}
    />
  );
};

export default PlcLogicView;
