import GaugeCircular from "@/components/hmi/GaugeCircular";

interface CraneTelemetryProps {
  loadPct: number;        // 0..100 (% of rated capacity)
  slewPct: number;        // 0..100
  hoistPct: number;       // 0..100
  hydraulicBar: number;   // 150..250
  windKt: number;         // 0..60
  swayDeg: number;        // -15..+15 (display absolute value 0..15)
  labels: {
    load: string;
    slew: string;
    hoist: string;
    hydraulic: string;
    wind: string;
    sway: string;
  };
}

const CraneTelemetry = ({
  loadPct,
  slewPct,
  hoistPct,
  hydraulicBar,
  windKt,
  swayDeg,
  labels,
}: CraneTelemetryProps) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 justify-items-center">
      <GaugeCircular
        value={loadPct}
        max={100}
        label={labels.load}
        unit="%"
        size={110}
        color="hsl(38, 85%, 60%)"
        warningThreshold={80}
        criticalThreshold={95}
      />
      <GaugeCircular
        value={slewPct}
        max={100}
        label={labels.slew}
        unit="%"
        size={110}
        color="hsl(200, 100%, 60%)"
        warningThreshold={92}
        criticalThreshold={102}
      />
      <GaugeCircular
        value={hoistPct}
        max={100}
        label={labels.hoist}
        unit="%"
        size={110}
        color="hsl(180, 70%, 55%)"
        warningThreshold={92}
        criticalThreshold={102}
      />
      <GaugeCircular
        value={hydraulicBar}
        max={260}
        label={labels.hydraulic}
        unit="bar"
        size={110}
        color="hsl(195, 90%, 60%)"
        warningThreshold={88}
        criticalThreshold={96}
      />
      <GaugeCircular
        value={windKt}
        max={60}
        label={labels.wind}
        unit="kt"
        size={110}
        color="hsl(200, 60%, 70%)"
        warningThreshold={70}
        criticalThreshold={85}
      />
      <GaugeCircular
        value={Math.abs(swayDeg)}
        max={15}
        label={labels.sway}
        unit="°"
        size={110}
        color="hsl(180, 70%, 55%)"
        warningThreshold={45}
        criticalThreshold={75}
      />
    </div>
  );
};

export default CraneTelemetry;
