import PlcCodeView, { CodeLine } from "@/components/hmi/PlcCodeView";

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
}

interface PlcLogicViewProps {
  snap: PlcSnapshot;
  hint: string;
}

const PlcLogicView = ({ snap, hint }: PlcLogicViewProps) => {
  const fmt = (n: number, d = 1) => n.toFixed(d);

  const ldLines: CodeLine[] = [
    { toks: [{ t: "(* Load-dependent start / stop — main bus *)", c: "cm" }] },
    {
      toks: [
        { t: "rBusLoadPct", c: "id" }, { t: " := ", c: "op" },
        { t: "rBusLoad_kW", c: "id" }, { t: " / ", c: "op" },
        { t: "rOnlineCap_kW", c: "id" }, { t: " * ", c: "op" },
        { t: "100.0", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "=", value: `${fmt(snap.busLoadPct)} %` }],
    },
    {
      toks: [
        { t: "bHighLoad", c: "id" }, { t: " := ", c: "op" },
        { t: "rBusLoadPct", c: "id" }, { t: " > ", c: "op" },
        { t: "rStartLimit", c: "id" }, { t: ";", c: "op" },
        { t: "   (* 85.0 % *)", c: "cm" },
      ],
      watch: [{ label: "=", value: snap.highLoad }],
    },
    {
      toks: [
        { t: "bLowLoad", c: "id" }, { t: "  := (", c: "op" },
        { t: "rBusLoadPct", c: "id" }, { t: " < ", c: "op" },
        { t: "rStopLimit", c: "id" }, { t: ") ", c: "op" },
        { t: "AND", c: "kw" }, { t: " (", c: "op" },
        { t: "nOnline", c: "id" }, { t: " > ", c: "op" },
        { t: "1", c: "num" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "=", value: snap.lowLoad }],
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "fbTonStart", c: "fn" }, { t: "(", c: "op" },
        { t: "IN", c: "id" }, { t: " := ", c: "op" },
        { t: "bHighLoad", c: "id" }, { t: ", ", c: "op" },
        { t: "PT", c: "id" }, { t: " := ", c: "op" },
        { t: "T#5S", c: "type" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "ET", value: `${fmt(snap.startTimerS)}s` }, { label: "Q", value: snap.startTimerQ }],
    },
    {
      toks: [
        { t: "fbTonStop", c: "fn" }, { t: " (", c: "op" },
        { t: "IN", c: "id" }, { t: " := ", c: "op" },
        { t: "bLowLoad", c: "id" }, { t: ",  ", c: "op" },
        { t: "PT", c: "id" }, { t: " := ", c: "op" },
        { t: "T#15S", c: "type" }, { t: ");", c: "op" },
      ],
      watch: [{ label: "ET", value: `${fmt(snap.stopTimerS)}s` }, { label: "Q", value: snap.stopTimerQ }],
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "IF", c: "kw" }, { t: " fbTonStart.Q ", c: "id" },
        { t: "AND", c: "kw" }, { t: " bStandbyAvail ", c: "id" },
        { t: "THEN", c: "kw" },
      ],
      watch: [{ label: "stby", value: snap.standbyAvail }],
      active: snap.startTimerQ && snap.standbyAvail,
    },
    {
      toks: [{ t: "    " }, { t: "PMS_StartNextStandby", c: "fn" }, { t: "();", c: "op" }],
      active: snap.startTimerQ && snap.standbyAvail,
    },
    { toks: [{ t: "END_IF", c: "kw" }] },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "IF", c: "kw" }, { t: " fbTonStop.Q ", c: "id" }, { t: "THEN", c: "kw" },
      ],
      active: snap.stopTimerQ,
    },
    {
      toks: [{ t: "    " }, { t: "PMS_StopLastOnline", c: "fn" }, { t: "();", c: "op" }],
      active: snap.stopTimerQ,
    },
    { toks: [{ t: "END_IF", c: "kw" }] },
  ];

  const hcLines: CodeLine[] = [
    { toks: [{ t: "(* Heavy consumer request — bow thruster 300 kW *)", c: "cm" }] },
    {
      toks: [
        { t: "rReserve_kW", c: "id" }, { t: " := ", c: "op" },
        { t: "rOnlineCap_kW", c: "id" }, { t: " - ", c: "op" },
        { t: "rBusLoad_kW", c: "id" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "=", value: `${Math.round(snap.reserveKw)} kW` }],
    },
    {
      toks: [
        { t: "bReserveOK", c: "id" }, { t: "  := ", c: "op" },
        { t: "rReserve_kW", c: "id" }, { t: " >= ", c: "op" },
        { t: "rHcDemand_kW", c: "id" }, { t: " * ", c: "op" },
        { t: "1.1", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "=", value: snap.reserveOk }],
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "CASE", c: "kw" }, { t: " eHcSeq ", c: "id" }, { t: "OF", c: "kw" },
      ],
      watch: [{ label: "=", value: `HC_${snap.hcSeq}` }],
    },
    {
      toks: [{ t: "  " }, { t: "HC_IDLE", c: "type" }, { t: ":", c: "op" }],
      active: snap.hcSeq === "IDLE",
    },
    {
      toks: [
        { t: "    " }, { t: "IF", c: "kw" }, { t: " bHcRequest ", c: "id" },
        { t: "THEN", c: "kw" }, { t: " eHcSeq", c: "id" }, { t: " := ", c: "op" },
        { t: "HC_CHECK", c: "type" }, { t: "; ", c: "op" }, { t: "END_IF", c: "kw" },
      ],
      watch: [{ label: "req", value: snap.hcRequest }],
      active: snap.hcSeq === "IDLE" && snap.hcRequest,
    },
    {
      toks: [{ t: "  " }, { t: "HC_CHECK", c: "type" }, { t: ":", c: "op" }],
      active: snap.hcSeq === "CHECK",
    },
    {
      toks: [
        { t: "    " }, { t: "IF", c: "kw" }, { t: " bReserveOK ", c: "id" },
        { t: "THEN", c: "kw" }, { t: " eHcSeq", c: "id" }, { t: " := ", c: "op" },
        { t: "HC_GRANT", c: "type" }, { t: ";", c: "op" },
      ],
      active: snap.hcSeq === "CHECK" && snap.reserveOk,
    },
    {
      toks: [
        { t: "    " }, { t: "ELSIF", c: "kw" }, { t: " bStandbyAvail ", c: "id" }, { t: "THEN", c: "kw" },
      ],
      active: snap.hcSeq === "STARTING",
    },
    {
      toks: [
        { t: "        " }, { t: "PMS_StartNextStandby", c: "fn" }, { t: "();", c: "op" },
        { t: "  (* reserve power first *)", c: "cm" },
      ],
      active: snap.hcSeq === "STARTING",
    },
    { toks: [{ t: "    " }, { t: "END_IF", c: "kw" }] },
    {
      toks: [{ t: "  " }, { t: "HC_GRANT", c: "type" }, { t: ":", c: "op" }],
      active: snap.hcSeq === "GRANT",
    },
    {
      toks: [
        { t: "    " }, { t: "bHcCloseCB", c: "id" }, { t: " := ", c: "op" },
        { t: "TRUE", c: "kw" }, { t: ";", c: "op" },
        { t: "   (* connect consumer *)", c: "cm" },
      ],
      active: snap.hcSeq === "GRANT",
    },
    { toks: [{ t: "END_CASE", c: "kw" }] },
  ];

  const ptLines: CodeLine[] = [
    { toks: [{ t: "(* Preferential trip — staged load shedding *)", c: "cm" }] },
    {
      toks: [
        { t: "bOverload", c: "id" }, { t: " := ", c: "op" },
        { t: "rBusLoad_kW", c: "id" }, { t: " > ", c: "op" },
        { t: "rOnlineCap_kW", c: "id" }, { t: " * ", c: "op" },
        { t: "0.95", c: "num" }, { t: ";", c: "op" },
      ],
      watch: [{ label: "=", value: snap.overload }],
    },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "IF", c: "kw" }, { t: " bOverload ", c: "id" }, { t: "THEN", c: "kw" },
      ],
      active: snap.overload,
    },
    {
      toks: [
        { t: "    " }, { t: "CASE", c: "kw" }, { t: " nShedStage ", c: "id" }, { t: "OF", c: "kw" },
      ],
      watch: [{ label: "=", value: `${snap.shedStage}` }],
      active: snap.overload,
    },
    {
      toks: [
        { t: "      " }, { t: "0", c: "num" }, { t: ": ", c: "op" },
        { t: "PMS_Shed", c: "fn" }, { t: "(", c: "op" },
        { t: "CB_GALLEY", c: "type" }, { t: ");", c: "op" },
        { t: "  (* stage 1 — hotel *)", c: "cm" },
      ],
      active: snap.overload && snap.shedStage === 0,
    },
    {
      toks: [
        { t: "      " }, { t: "1", c: "num" }, { t: ": ", c: "op" },
        { t: "PMS_Shed", c: "fn" }, { t: "(", c: "op" },
        { t: "CB_HVAC", c: "type" }, { t: ");", c: "op" },
        { t: "    (* stage 2 — comfort *)", c: "cm" },
      ],
      active: snap.overload && snap.shedStage === 1,
    },
    {
      toks: [
        { t: "      " }, { t: "2", c: "num" }, { t: ": ", c: "op" },
        { t: "PMS_Shed", c: "fn" }, { t: "(", c: "op" },
        { t: "CB_CRANE", c: "type" }, { t: ");", c: "op" },
        { t: "   (* stage 3 — deck *)", c: "cm" },
      ],
      active: snap.overload && snap.shedStage === 2,
    },
    { toks: [{ t: "    " }, { t: "END_CASE", c: "kw" }] },
    { toks: [{ t: "END_IF", c: "kw" }] },
    { toks: [{ t: "" }] },
    {
      toks: [
        { t: "(* Essential consumers — steering, propulsion — are never shed *)", c: "cm" },
      ],
    },
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
