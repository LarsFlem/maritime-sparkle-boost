interface CraneTelemetryProps {
  hookLoadT: number;
  swlT: number;
  outreachM: number;
  hookHeightM: number;
  wireOutM: number;
  slewDeg: number;
  mainDeg: number;
  jibFoldDeg: number;
  hydraulicBar: number;
  windKt: number;
  swayDeg: number;
  slewSector: "pickup" | "landing" | null;
  labels: {
    load: string;
    swl: string;
    outreach: string;
    hookHeight: string;
    wire: string;
    slew: string;
    main: string;
    knuckle: string;
    hydraulic: string;
    windSway: string;
    pickup: string;
    landing: string;
    utilization: string;
  };
}

const Readout = ({
  label, value, unit, color, sub, bar,
}: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  sub?: React.ReactNode;
  bar?: { pct: number; color: string };
}) => (
  <div className="rounded-md border border-border/40 bg-background/50 px-3 py-2.5 flex flex-col gap-1 min-w-0">
    <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground truncate">{label}</span>
    <span className="font-mono text-xl font-semibold tabular-nums leading-none" style={{ color: color ?? "hsl(var(--foreground))" }}>
      {value}
      {unit && <span className="text-[10px] font-normal text-muted-foreground ml-1">{unit}</span>}
    </span>
    {bar && (
      <div className="h-1 rounded-full bg-border/40 overflow-hidden relative mt-0.5">
        <div className="absolute top-0 bottom-0 w-px bg-foreground/30 z-10" style={{ left: "80%" }} />
        <div className="h-full rounded-full transition-all duration-200"
          style={{ width: `${Math.min(100, bar.pct)}%`, backgroundColor: bar.color }} />
      </div>
    )}
    {sub && <span className="font-mono text-[9px] text-muted-foreground/70 tabular-nums truncate">{sub}</span>}
  </div>
);

const CraneTelemetry = ({
  hookLoadT, swlT, outreachM, hookHeightM, wireOutM,
  slewDeg, mainDeg, jibFoldDeg, hydraulicBar, windKt, swayDeg, slewSector,
  labels,
}: CraneTelemetryProps) => {
  const utilPct = swlT > 0 ? (hookLoadT / swlT) * 100 : 0;
  const loadColor = utilPct > 95 ? "hsl(0, 70%, 55%)" : utilPct > 80 ? "hsl(38, 85%, 60%)" : "hsl(38, 85%, 65%)";
  const hydColor = hydraulicBar > 240 || hydraulicBar < 165 ? "hsl(38, 85%, 60%)" : "hsl(195, 90%, 60%)";
  const swayColor = Math.abs(swayDeg) > 5 ? "hsl(38, 85%, 60%)" : "hsl(180, 70%, 55%)";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      <Readout
        label={labels.load}
        value={hookLoadT.toFixed(1)}
        unit="t"
        color={loadColor}
        bar={{ pct: utilPct, color: loadColor }}
        sub={`${labels.utilization} ${Math.round(utilPct)} %`}
      />
      <Readout
        label={labels.swl}
        value={swlT.toFixed(1)}
        unit="t"
        color="hsl(150, 70%, 55%)"
        sub={`@ ${outreachM.toFixed(1)} m`}
      />
      <Readout label={labels.outreach} value={outreachM.toFixed(1)} unit="m" color="hsl(200, 100%, 60%)" />
      <Readout label={labels.hookHeight} value={hookHeightM.toFixed(1)} unit="m" color="hsl(200, 100%, 60%)" />
      <Readout label={labels.wire} value={wireOutM.toFixed(1)} unit="m" color="hsl(180, 70%, 55%)" />
      <Readout
        label={labels.slew}
        value={`${Math.round(slewDeg).toString().padStart(3, "0")}°`}
        color="hsl(200, 100%, 60%)"
        sub={slewSector === "pickup" ? labels.pickup : slewSector === "landing" ? labels.landing : "—"}
      />
      <Readout label={labels.main} value={mainDeg.toFixed(1)} unit="°" color="hsl(38, 85%, 65%)" />
      <Readout label={labels.knuckle} value={jibFoldDeg.toFixed(1)} unit="°" color="hsl(38, 85%, 65%)" />
      <Readout label={labels.hydraulic} value={hydraulicBar.toFixed(0)} unit="bar" color={hydColor} />
      <Readout
        label={labels.windSway}
        value={`${windKt.toFixed(0)} kt`}
        color={swayColor}
        sub={`${swayDeg >= 0 ? "+" : ""}${swayDeg.toFixed(1)}° sway`}
      />
    </div>
  );
};

export default CraneTelemetry;
