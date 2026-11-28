import PlcCodeView, { CodeLine } from "@/components/hmi/PlcCodeView";
import { st } from "@/components/hmi/st";

export interface CranePlcSnapshot {
  autoStep: number;        // 0..6, -1 when not in auto
  stepProgress: number;    // 0..1
  mode: "manual" | "semi" | "auto";
  running: boolean;
  slew: number;
  outreach: number;
  hookZ: number;
  hookLoadT: number;
  swl: number;
  swayDeg: number;
  cmdRawSlew: number;
  wire: number;
  /** Input-shaper delay (half damped sway period), 0 when shaping is off */
  shaperDelay: number;
  momTrip: boolean;
  cycles: number;
}

interface CranePlcViewProps {
  snap: CranePlcSnapshot;
  hint: string;
}

const STEP_NAMES = [
  "STEP_POSITION", "STEP_LOWER", "STEP_CONNECT", "STEP_HOIST",
  "STEP_SLEW_BARGE", "STEP_LAND", "STEP_RELEASE",
];

/**
 * Simplified structured-text view of the logic the simulation follows,
 * with live values. Kept in step with LiveDemo.tsx: if the sim changes,
 * change the code shown here too.
 */
const CranePlcView = ({ snap, hint }: CranePlcViewProps) => {
  const fmt = (n: number, d = 1) => n.toFixed(d);
  const inAuto = snap.mode === "auto" && snap.running;
  const step = inAuto ? snap.autoStep : -1;
  const stepName = step >= 0 ? STEP_NAMES[step] : "—";
  const util = snap.swl > 0 ? snap.hookLoadT / snap.swl : 0;
  const shaping = snap.mode !== "manual";
  const on = (i: number) => step === i;

  const seqLines: CodeLine[] = [
    st("(* Container transfer: condition-based step sequence *)"),
    st("CASE eStep OF", { watch: [{ label: "=", value: stepName }] }),
    st("  STEP_POSITION:", { active: on(0) }),
    st("    fbMove(Execute := TRUE, rSlew := SLEW_PICKUP, rR := R_PICKUP, rZ := Z_HOVER);", {
      active: on(0), watch: [{ label: "slew", value: `${fmt(snap.slew, 0)}°` }, { label: "R", value: `${fmt(snap.outreach)} m` }],
    }),
    st("    IF fbMove.Done THEN eStep := STEP_LOWER; END_IF", { active: on(0) }),
    st("  STEP_LOWER:", { active: on(1) }),
    st("    fbHoist(Execute := TRUE, rZ := Z_CONTAINER_TOP);", { active: on(1), watch: [{ label: "hook", value: `${fmt(snap.hookZ)} m` }] }),
    st("    IF fbHoist.Done THEN eStep := STEP_CONNECT; END_IF", { active: on(1) }),
    st("  STEP_CONNECT:  (* twist-locks + load transfer *)", { active: on(2) }),
    st("    tmrLock(IN := TRUE, PT := T#1400MS);", { active: on(2), watch: [{ label: "load", value: `${fmt(snap.hookLoadT)} t` }] }),
    st("    IF tmrLock.Q THEN tmrLock(IN := FALSE); eStep := STEP_HOIST; END_IF", { active: on(2) }),
    st("  STEP_HOIST:", { active: on(3) }),
    st("    fbHoist(Execute := TRUE, rZ := Z_TRANSIT);", { active: on(3) }),
    st("    IF fbHoist.Done THEN eStep := STEP_SLEW_BARGE; END_IF", { active: on(3) }),
    st("  STEP_SLEW_BARGE:", { active: on(4) }),
    st("    fbMove(Execute := TRUE, rSlew := SLEW_LANDING, rR := R_LANDING, rZ := Z_TRANSIT);", { active: on(4) }),
    st("    IF fbMove.Done THEN eStep := STEP_LAND; END_IF", { active: on(4) }),
    st("  STEP_LAND:", { active: on(5) }),
    st("    fbHoist(Execute := TRUE, rZ := Z_BARGE_LAND);", { active: on(5) }),
    st("    IF fbHoist.Done THEN eStep := STEP_RELEASE; END_IF", { active: on(5) }),
    st("  STEP_RELEASE:", { active: on(6) }),
    st("    tmrLock(IN := TRUE, PT := T#1S);", { active: on(6) }),
    st("    IF tmrLock.Q AND bHookClear THEN", { active: on(6) }),
    st("      fbMove(Execute := TRUE, rSlew := SLEW_PICKUP, rR := R_PICKUP, rZ := Z_HOVER);", { active: on(6) }),
    st("    END_IF", { active: on(6) }),
    st("    IF fbMove.Done THEN", { active: on(6) }),
    st("      nCycles := nCycles + 1;", { active: on(6), watch: [{ label: "=", value: String(snap.cycles) }] }),
    st("      tmrLock(IN := FALSE); eStep := STEP_POSITION;", { active: on(6) }),
    st("    END_IF", { active: on(6) }),
    st("END_CASE"),
  ];

  const swayLines: CodeLine[] = [
    st("(* Anti-sway: zero-vibration (ZV) input shaper tuned to the pendulum *)"),
    st("rL := MAX(rWireLen, 1.5);", { watch: [{ label: "=", value: `${fmt(snap.wire)} m` }] }),
    st("rOmega := SQRT(G / rL);"),
    st("rZeta := MIN(rDamping / (2.0 * rOmega), 0.6);"),
    st("rTd := PI / (rOmega * SQRT(1.0 - rZeta * rZeta));  (* half damped period *)", {
      watch: [{ label: "=", value: shaping ? `${fmt(snap.shaperDelay, 2)} s` : "—" }],
    }),
    st("rK := EXP(-rZeta * PI / SQRT(1.0 - rZeta * rZeta));"),
    st("rA1 := 1.0 / (1.0 + rK);"),
    st("rA2 := rK / (1.0 + rK);"),
    st(""),
    st("(* Rate/accel-limited reference, plus a copy delayed by rTd *)"),
    st("fbProfile(rTarget := rSlewTarget, rVmax := V_SLEW, rAcc := A_SLEW_SHAPED);", {
      watch: [{ label: "cmd", value: `${fmt(snap.cmdRawSlew, 0)}°` }],
    }),
    st("fbDelay(rIn := fbProfile.rPos, rDelay := rTd);"),
    st("IF eMode <> MODE_MANUAL THEN", { active: shaping }),
    st("  rSlewSet := rA1 * fbProfile.rPos + rA2 * fbDelay.rOut", { active: shaping, watch: [{ label: "slew", value: `${fmt(snap.slew)}°` }] }),
    st("              + K_SWAY_FB * rSwayRate;  (* damp what is left *)", { active: shaping }),
    st("ELSE", { active: !shaping }),
    st("  rSlewSet := fbProfile.rPos;", { active: !shaping }),
    st("END_IF"),
    st("(* measured sway angle *)", { watch: [{ label: "sway", value: `${snap.swayDeg >= 0 ? "+" : ""}${fmt(snap.swayDeg)}°` }] }),
  ];

  const momLines: CodeLine[] = [
    st("(* Load-moment limiter: SWL from outreach (load chart) *)"),
    st("rR := fbKinematics.rOutreach;", { watch: [{ label: "=", value: `${fmt(snap.outreach)} m` }] }),
    st("rSwl := MIN(SWL_RATED, MOMENT_LIMIT / MAX(rR, 3.0));", { watch: [{ label: "=", value: `${fmt(snap.swl)} t` }] }),
    st("rUtil := rHookLoad / rSwl;", {
      watch: [{ label: "load", value: `${fmt(snap.hookLoadT)} t` }, { label: "=", value: `${Math.round(util * 100)} %` }],
    }),
    st("bMomWarn := rUtil > 0.90;", { watch: [{ label: "=", value: util > 0.9 }] }),
    st("IF rUtil >= 0.98 THEN bMomTrip := TRUE;"),
    st("ELSIF rUtil <= 0.95 THEN bMomTrip := FALSE; END_IF", { watch: [{ label: "bMomTrip", value: snap.momTrip }] }),
    st("bBlockLuffOut := bMomTrip;  (* blocks every motion that increases outreach *)", { active: snap.momTrip }),
    st(""),
    st("(* Hoist lower limit: hook or container stops on deck, barge or water *)"),
    st("fbSurface(rR := rR, rSlew := rSlew, eCargo := eCargoState);"),
    st("rWireMax := rTipZ - fbSurface.rFloorZ;"),
    st("bLowerLimit := rWire >= rWireMax - 0.05;", { watch: [{ label: "hook", value: `${fmt(snap.hookZ)} m` }] }),
  ];

  return (
    <PlcCodeView
      tabs={[
        { id: "STEP SEQ", lines: seqLines },
        { id: "ANTI-SWAY", lines: swayLines },
        { id: "LOAD MOMENT", lines: momLines },
      ]}
      hint={hint}
    />
  );
};

export default CranePlcView;
