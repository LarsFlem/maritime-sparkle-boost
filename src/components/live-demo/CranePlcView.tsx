import PlcCodeView, { CodeLine } from "@/components/hmi/PlcCodeView";

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
  cmdSmSlew: number;
}

interface CranePlcViewProps {
  snap: CranePlcSnapshot;
  hint: string;
}

const STEP_NAMES = [
  "STEP_POSITION", "STEP_LOWER", "STEP_CONNECT", "STEP_HOIST",
  "STEP_SLEW_BARGE", "STEP_LAND", "STEP_RELEASE",
];

const CranePlcView = ({ snap, hint }: CranePlcViewProps) => {
  const fmt = (n: number, d = 1) => n.toFixed(d);
  const inAuto = snap.mode === "auto" && snap.running;
  const step = inAuto ? snap.autoStep : -1;
  const stepName = step >= 0 ? STEP_NAMES[step] : "—";
  const util = snap.swl > 0 ? snap.hookLoadT / snap.swl : 0;

  const caseHead = (i: number, name: string): CodeLine => ({
    toks: [{ t: "  " }, { t: name, c: "type" }, { t: ":", c: "op" }],
    active: step === i,
  });

  const seqLines: CodeLine[] = [
    { toks: [{ t: "(* Container transfer — condition-based step sequence *)", c: "cm" }] },
    {
      toks: [{ t: "CASE", c: "kw" }, { t: " eStep ", c: "id" }, { t: "OF", c: "kw" }],
      watch: [{ label: "=", value: stepName }],
    },
    caseHead(0, "STEP_POSITION"),
    {
      toks: [
        { t: "    " }, { t: "MoveTo", c: "fn" }, { t: "(", c: "op" },
        { t: "SLEW_PICKUP", c: "type" }, { t: ", ", c: "op" },
        { t: "R_PICKUP", c: "type" }, { t: ", ", c: "op" },
        { t: "Z_HOVER", c: "type" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "slew", value: `${fmt(snap.slew, 0)}°` }, { label: "R", value: `${fmt(snap.outreach)} m` }],
      active: step === 0,
    },
    {
      toks: [
        { t: "    " }, { t: "IF", c: "kw" }, { t: " bInPos ", c: "id" },
        { t: "THEN", c: "kw" }, { t: " eStep", c: "id" }, { t: " := ", c: "op" },
        { t: "STEP_LOWER", c: "type" }, { t: "; ", c: "op" }, { t: "END_IF", c: "kw" },
      ],
      active: step === 0,
    },
    caseHead(1, "STEP_LOWER"),
    {
      toks: [
        { t: "    " }, { t: "rWireCmd", c: "id" }, { t: " := ", c: "op" },
        { t: "rTipZ", c: "id" }, { t: " - ", c: "op" }, { t: "H_CONT", c: "type" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "hookZ", value: `${fmt(snap.hookZ)} m` }],
      active: step === 1,
    },
    caseHead(2, "STEP_CONNECT"),
    {
      toks: [
        { t: "    " }, { t: "tmrLock", c: "fn" }, { t: "(", c: "op" },
        { t: "IN", c: "id" }, { t: " := ", c: "op" }, { t: "TRUE", c: "kw" },
        { t: ", ", c: "op" }, { t: "PT", c: "id" }, { t: " := ", c: "op" },
        { t: "T#1.4S", c: "type" }, { t: ");", c: "op" },
        { t: "  (* twist-locks + load transfer *)", c: "cm" },
      ],
      watch: [{ label: "ET", value: step === 2 ? `${fmt(snap.stepProgress * 1.4)}s` : "0.0s" }],
      active: step === 2,
    },
    caseHead(3, "STEP_HOIST"),
    {
      toks: [
        { t: "    " }, { t: "IF", c: "kw" }, { t: " rHookZ >= ", c: "id" },
        { t: "Z_TRANSIT", c: "type" }, { t: " THEN", c: "kw" },
        { t: " eStep", c: "id" }, { t: " := ", c: "op" },
        { t: "STEP_SLEW_BARGE", c: "type" }, { t: "; ", c: "op" }, { t: "END_IF", c: "kw" },
      ],
      active: step === 3,
    },
    caseHead(4, "STEP_SLEW_BARGE"),
    {
      toks: [
        { t: "    " }, { t: "MoveTo", c: "fn" }, { t: "(", c: "op" },
        { t: "SLEW_LANDING", c: "type" }, { t: ", ", c: "op" },
        { t: "R_LANDING", c: "type" }, { t: ", ", c: "op" },
        { t: "Z_BARGE", c: "type" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "slew", value: `${fmt(snap.slew, 0)}°` }],
      active: step === 4,
    },
    caseHead(5, "STEP_LAND"),
    {
      toks: [
        { t: "    " }, { t: "IF", c: "kw" }, { t: " bLanded ", c: "id" },
        { t: "THEN", c: "kw" }, { t: " bLoadOn", c: "id" }, { t: " := ", c: "op" },
        { t: "FALSE", c: "kw" }, { t: "; ", c: "op" }, { t: "END_IF", c: "kw" },
      ],
      watch: [{ label: "load", value: `${fmt(snap.hookLoadT)} t` }],
      active: step === 5,
    },
    caseHead(6, "STEP_RELEASE"),
    {
      toks: [
        { t: "    " }, { t: "nCycles", c: "id" }, { t: " := ", c: "op" },
        { t: "nCycles", c: "id" }, { t: " + ", c: "op" }, { t: "1", c: "num" }, { t: ";", c: "op" },
        { t: "  (* return empty, restart *)", c: "cm" },
      ],
      active: step === 6,
    },
    { toks: [{ t: "END_CASE", c: "kw" }] },
  ];

  const tau = snap.mode === "manual" ? 0.06 : snap.mode === "semi" ? 1.1 : 0.6;
  const alpha = 1 - Math.exp(-0.1 / tau);
  const swayLines: CodeLine[] = [
    { toks: [{ t: "(* Anti-sway — low-pass command shaping on slew *)", c: "cm" }] },
    {
      toks: [
        { t: "rTau", c: "id" }, { t: "   := ", c: "op" },
        { t: "SEL", c: "fn" }, { t: "(", c: "op" },
        { t: "eMode", c: "id" }, { t: " = ", c: "op" }, { t: "MODE_SEMI", c: "type" },
        { t: ", ", c: "op" }, { t: "rTauBase", c: "id" }, { t: ", ", c: "op" },
        { t: "1.1", c: "num" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "mode", value: snap.mode.toUpperCase() }, { label: "τ", value: `${tau.toFixed(2)}s` }],
    },
    {
      toks: [
        { t: "rAlpha", c: "id" }, { t: " := ", c: "op" },
        { t: "1.0", c: "num" }, { t: " - ", c: "op" },
        { t: "EXP", c: "fn" }, { t: "(-", c: "op" },
        { t: "R_DT", c: "type" }, { t: " / ", c: "op" },
        { t: "rTau", c: "id" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "=", value: alpha.toFixed(3) }],
    },
    {
      toks: [
        { t: "rSmSlew", c: "id" }, { t: " := ", c: "op" },
        { t: "rSmSlew", c: "id" }, { t: " + (", c: "op" },
        { t: "rCmdSlew", c: "id" }, { t: " - ", c: "op" },
        { t: "rSmSlew", c: "id" }, { t: ") * ", c: "op" },
        { t: "rAlpha", c: "id" }, { t: ";", c: "op" },
      ],
      watch: [
        { label: "cmd", value: `${fmt(snap.cmdRawSlew, 0)}°` },
        { label: "sm", value: `${fmt(snap.cmdSmSlew)}°` },
      ],
      active: Math.abs(snap.cmdRawSlew - snap.cmdSmSlew) > 0.5,
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "(* Result: tip acceleration stays below the pendulum's *)", c: "cm" },
      ],
    },
    {
      toks: [{ t: "(* excitation threshold — measured sway: *)", c: "cm" }],
      watch: [{ label: "sway", value: `${snap.swayDeg >= 0 ? "+" : ""}${fmt(snap.swayDeg)}°` }],
    },
  ];

  const momLines: CodeLine[] = [
    { toks: [{ t: "(* Load-moment protection — SWL from outreach *)", c: "cm" }] },
    {
      toks: [
        { t: "rOutreach", c: "id" }, { t: " := ", c: "op" },
        { t: "L_MAIN", c: "type" }, { t: "*", c: "op" }, { t: "COS", c: "fn" },
        { t: "(rMain)", c: "op" }, { t: " + ", c: "op" },
        { t: "L_JIB", c: "type" }, { t: "*", c: "op" }, { t: "COS", c: "fn" },
        { t: "(rMain - rFold);", c: "op" },
      ],
      watch: [{ label: "=", value: `${fmt(snap.outreach)} m` }],
    },
    {
      toks: [
        { t: "rSwl", c: "id" }, { t: "      := ", c: "op" },
        { t: "MIN", c: "fn" }, { t: "(", c: "op" },
        { t: "R_SWL_RATED", c: "type" }, { t: ", ", c: "op" },
        { t: "R_MOM_LIMIT", c: "type" }, { t: " / ", c: "op" },
        { t: "MAX", c: "fn" }, { t: "(", c: "op" },
        { t: "3.0", c: "num" }, { t: ", ", c: "op" },
        { t: "rOutreach", c: "id" }, { t: "));", c: "op" },
      ],
      watch: [{ label: "=", value: `${fmt(snap.swl)} t` }],
    },
    {
      toks: [
        { t: "rUtil", c: "id" }, { t: "     := ", c: "op" },
        { t: "rHookLoad", c: "id" }, { t: " / ", c: "op" },
        { t: "rSwl", c: "id" }, { t: ";", c: "op" },
      ],
      watch: [
        { label: "load", value: `${fmt(snap.hookLoadT)} t` },
        { label: "=", value: `${Math.round(util * 100)} %` },
      ],
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "bMomWarn", c: "id" }, { t: " := ", c: "op" },
        { t: "rUtil", c: "id" }, { t: " > ", c: "op" },
        { t: "0.90", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "=", value: util > 0.9 }],
    },
    {
      toks: [
        { t: "bMomTrip", c: "id" }, { t: " := ", c: "op" },
        { t: "rUtil", c: "id" }, { t: " > ", c: "op" },
        { t: "1.00", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "=", value: util > 1.0 }],
    },
    {
      toks: [
        { t: "IF", c: "kw" }, { t: " bMomTrip ", c: "id" }, { t: "THEN", c: "kw" },
        { t: " BlockLuffOut", c: "fn" }, { t: "(); ", c: "op" }, { t: "END_IF", c: "kw" },
        { t: "  (* interlock *)", c: "cm" },
      ],
      active: util > 1.0,
    },
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
