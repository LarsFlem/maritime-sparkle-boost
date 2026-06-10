import PlcCodeView, { CodeLine } from "@/components/hmi/PlcCodeView";

export interface EnginePlcSnapshot {
  loPress: number;
  loStbyRun: boolean;
  stbyDelayS: number;
  runT: number;
  protArmed: boolean;
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

const EnginePlcView = ({ snap, hint }: EnginePlcViewProps) => {
  const fmt = (n: number, d = 1) => n.toFixed(d);
  const running = snap.rpm > 100;
  const loLow = snap.loPress < 2.5 && running;

  const loLines: CodeLine[] = [
    { toks: [{ t: "(* ME lube-oil protection — alarm / standby / slowdown / shutdown *)", c: "cm" }] },
    {
      toks: [
        { t: "bProtArmed", c: "id" }, { t: " := ", c: "op" },
        { t: "tmrRun.ET", c: "id" }, { t: " > ", c: "op" },
        { t: "T#4S", c: "type" }, { t: ";", c: "op" },
        { t: "   (* start build-up bypass *)", c: "cm" },
      ],
      watch: [{ label: "ET", value: `${fmt(Math.min(snap.runT, 99))}s` }, { label: "=", value: snap.protArmed }],
    },
    {
      toks: [
        { t: "bLoLow", c: "id" }, { t: "     := ", c: "op" },
        { t: "rLoPress", c: "id" }, { t: " < ", c: "op" },
        { t: "2.5", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "PT-2301", value: `${fmt(snap.loPress)} bar` }, { label: "=", value: loLow }],
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "(* Standby pump auto-changeover at the alarm limit *)", c: "cm" },
      ],
    },
    {
      toks: [
        { t: "tmrStby", c: "fn" }, { t: "(", c: "op" },
        { t: "IN", c: "id" }, { t: " := ", c: "op" },
        { t: "bLoLow ", c: "id" }, { t: "AND NOT", c: "kw" }, { t: " bStbyRun", c: "id" },
        { t: ", ", c: "op" }, { t: "PT", c: "id" }, { t: " := ", c: "op" },
        { t: "T#1S", c: "type" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "ET", value: `${fmt(Math.min(snap.stbyDelayS, 1))}s` }],
      active: loLow && !snap.loStbyRun,
    },
    {
      toks: [
        { t: "IF", c: "kw" }, { t: " tmrStby.Q ", c: "id" }, { t: "THEN", c: "kw" },
        { t: " bStbyRun", c: "id" }, { t: " := ", c: "op" },
        { t: "TRUE", c: "kw" }, { t: "; ", c: "op" }, { t: "END_IF", c: "kw" },
      ],
      watch: [{ label: "LO-P2", value: snap.loStbyRun }],
      active: snap.loStbyRun,
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "bSlowdown", c: "id" }, { t: " := ", c: "op" },
        { t: "bProtArmed ", c: "id" }, { t: "AND", c: "kw" },
        { t: " rLoPress < ", c: "id" }, { t: "2.0", c: "num" }, { t: ";", c: "op" },
        { t: "  (* limit 35% MCR *)", c: "cm" },
      ],
      watch: [{ label: "=", value: snap.slowdown }],
      active: snap.slowdown,
    },
    {
      toks: [
        { t: "IF", c: "kw" }, { t: " bProtArmed ", c: "id" }, { t: "AND", c: "kw" },
        { t: " rLoPress < ", c: "id" }, { t: "1.6", c: "num" }, { t: " THEN", c: "kw" },
      ],
      active: snap.shutdown,
    },
    {
      toks: [
        { t: "    " }, { t: "bShutdown", c: "id" }, { t: " := ", c: "op" },
        { t: "TRUE", c: "kw" }, { t: ";", c: "op" },
        { t: "   (* latched — manual reset *)", c: "cm" },
      ],
      watch: [{ label: "=", value: snap.shutdown }],
      active: snap.shutdown,
    },
    { toks: [{ t: "END_IF", c: "kw" }] },
  ];

  const err = snap.fwTemp - 82;
  const piLines: CodeLine[] = [
    { toks: [{ t: "(* LT FW temperature — PI on three-way valve, SP 82.0 °C *)", c: "cm" }] },
    {
      toks: [
        { t: "rErr", c: "id" }, { t: "   := ", c: "op" },
        { t: "rFwTemp", c: "id" }, { t: " - ", c: "op" },
        { t: "R_SETPOINT", c: "type" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "TT-2201", value: `${fmt(snap.fwTemp)}°C` }, { label: "e", value: `${err >= 0 ? "+" : ""}${fmt(err)}` }],
    },
    {
      toks: [
        { t: "rInt", c: "id" }, { t: "   := ", c: "op" },
        { t: "LIMIT", c: "fn" }, { t: "(-", c: "op" },
        { t: "30", c: "num" }, { t: ", ", c: "op" },
        { t: "rInt", c: "id" }, { t: " + ", c: "op" },
        { t: "rErr", c: "id" }, { t: " * ", c: "op" },
        { t: "0.25", c: "num" }, { t: " * ", c: "op" },
        { t: "R_DT", c: "type" }, { t: ", ", c: "op" },
        { t: "30", c: "num" }, { t: ");", c: "op" },
        { t: "  (* anti-windup *)", c: "cm" },
      ],
      watch: [{ label: "I", value: fmt(snap.fwInt) }],
    },
    {
      toks: [
        { t: "rValve", c: "id" }, { t: " := ", c: "op" },
        { t: "LIMIT", c: "fn" }, { t: "(", c: "op" },
        { t: "0", c: "num" }, { t: ", ", c: "op" },
        { t: "50", c: "num" }, { t: " + ", c: "op" },
        { t: "rErr", c: "id" }, { t: " * ", c: "op" },
        { t: "16", c: "num" }, { t: " + ", c: "op" },
        { t: "rInt", c: "id" }, { t: ", ", c: "op" },
        { t: "100", c: "num" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "TV", value: `${Math.round(snap.fwValve)} %` }],
      active: Math.abs(err) > 1.5,
    },
    { toks: [{ t: "" }] },
    {
      toks: [{ t: "(* Valve splits flow cooler/bypass; SW side gives the *)", c: "cm" }],
    },
    {
      toks: [{ t: "(* cooling capacity — trip the SW pump and watch I wind up *)", c: "cm" }],
    },
  ];

  const devLines: CodeLine[] = [
    { toks: [{ t: "(* Cylinder exhaust deviation monitoring *)", c: "cm" }] },
    {
      toks: [
        { t: "rMean", c: "id" }, { t: " := ", c: "op" },
        { t: "SUM", c: "fn" }, { t: "(", c: "op" },
        { t: "arCylT", c: "id" }, { t: ") / ", c: "op" },
        { t: "6.0", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "x̄", value: `${Math.round(snap.cylMean)}°C` }],
    },
    {
      toks: [
        { t: "FOR", c: "kw" }, { t: " i ", c: "id" }, { t: ":= ", c: "op" },
        { t: "1", c: "num" }, { t: " TO ", c: "kw" }, { t: "6", c: "num" },
        { t: " DO", c: "kw" },
      ],
    },
    {
      toks: [
        { t: "    " }, { t: "arDev", c: "id" }, { t: "[i] := ", c: "op" },
        { t: "ABS", c: "fn" }, { t: "(", c: "op" },
        { t: "arCylT", c: "id" }, { t: "[i] - ", c: "op" },
        { t: "rMean", c: "id" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "dev[4]", value: `${Math.round(Math.abs(snap.cylDev4))}°C` }],
    },
    {
      toks: [
        { t: "    " }, { t: "bDevAlm", c: "id" }, { t: "[i] := ", c: "op" },
        { t: "arDev", c: "id" }, { t: "[i] > ", c: "op" },
        { t: "35.0", c: "num" }, { t: ";", c: "op" },
        { t: "  (* combustion / injector fault *)", c: "cm" },
      ],
      watch: [{ label: "alm[4]", value: Math.abs(snap.cylDev4) > 35 }],
      active: Math.abs(snap.cylDev4) > 35,
    },
    { toks: [{ t: "END_FOR", c: "kw" }] },
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
