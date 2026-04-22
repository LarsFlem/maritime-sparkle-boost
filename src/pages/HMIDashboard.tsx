import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Activity, ThermometerSun, Vibrate, Zap, Radio, Map as MapIcon, Grid3x3 } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import GaugeCircular from "@/components/hmi/GaugeCircular";
import StatusIndicator from "@/components/hmi/StatusIndicator";
import HMIPanel from "@/components/hmi/HMIPanel";
import DigitalDisplay from "@/components/hmi/DigitalDisplay";
import OceanMap from "@/components/hmi/OceanMap";

interface Turbine {
  id: string;
  name: string;
  status: "operational" | "warning" | "offline";
  energyOutput: number;
  efficiency: number;
  health: number;
  position: { x: number; y: number };
  // Geographic position (North Sea, Sector 7G)
  lat: number;
  lng: number;
  temperature: number;
  vibration: number;
}

// Palette tokens — aligned with ocean theme
const COLOR_PRIMARY = "hsl(200, 100%, 60%)";   // primary blue
const COLOR_ACCENT = "hsl(180, 100%, 55%)";    // cyan accent
const COLOR_OPERATIONAL = "hsl(180, 70%, 55%)"; // teal/cyan for OK
const COLOR_WARNING = "hsl(38, 85%, 60%)";     // amber (kept for safety semantics)
const COLOR_OFFLINE = "hsl(210, 15%, 45%)";    // muted slate (less neon)
const COLOR_HEALTH = "hsl(195, 90%, 60%)";

type TrendPoint = { time: string; total: number } & Record<string, number | string>;

const buildTrendPoint = (fleet: Turbine[], timestamp = new Date()): TrendPoint => {
  const timeStr = `${timestamp.getHours().toString().padStart(2, "0")}:${timestamp.getMinutes().toString().padStart(2, "0")}:${timestamp.getSeconds().toString().padStart(2, "0")}`;
  const total = fleet.reduce((sum, turbine) => sum + turbine.energyOutput, 0);
  const point: TrendPoint = { time: timeStr, total: parseFloat(total.toFixed(2)) };

  fleet.forEach((turbine) => {
    point[turbine.id] = parseFloat(turbine.energyOutput.toFixed(2));
  });

  return point;
};

// Window: 90s at 0.2s sample rate => 450 points
const TREND_MAX_POINTS = 450;

const HMIDashboard = () => {
  const { t } = useLanguage();
  const [turbines, setTurbines] = useState<Turbine[]>([
    { id: "T001", name: "WG-Alpha",   status: "operational", energyOutput: 2.4, efficiency: 87, health: 95, position: { x: 20, y: 30 }, lat: 59.10, lng: 1.85, temperature: 45, vibration: 2.1 },
    { id: "T002", name: "WG-Beta",    status: "operational", energyOutput: 2.1, efficiency: 82, health: 88, position: { x: 40, y: 20 }, lat: 59.05, lng: 2.15, temperature: 42, vibration: 1.8 },
    { id: "T003", name: "WG-Gamma",   status: "warning",     energyOutput: 1.8, efficiency: 72, health: 76, position: { x: 60, y: 35 }, lat: 58.85, lng: 2.45, temperature: 52, vibration: 3.2 },
    { id: "T004", name: "WG-Delta",   status: "operational", energyOutput: 2.3, efficiency: 85, health: 92, position: { x: 80, y: 25 }, lat: 58.95, lng: 2.75, temperature: 44, vibration: 2.0 },
    { id: "T005", name: "WG-Echo",    status: "offline",     energyOutput: 0,   efficiency: 0,  health: 45, position: { x: 30, y: 65 }, lat: 58.55, lng: 2.05, temperature: 38, vibration: 0.5 },
    { id: "T006", name: "WG-Foxtrot", status: "operational", energyOutput: 2.2, efficiency: 84, health: 89, position: { x: 70, y: 55 }, lat: 58.50, lng: 2.55, temperature: 46, vibration: 2.3 },
  ]);

  const [selectedTurbine, setSelectedTurbine] = useState<Turbine | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set()); // empty = show all + total
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mapView, setMapView] = useState<"grid" | "geo">("geo");

  // Per-turbine colors for trend lines
  const TURBINE_COLORS: Record<string, string> = {
    T001: "hsl(200, 100%, 65%)",
    T002: "hsl(180, 90%, 55%)",
    T003: "hsl(38, 90%, 60%)",
    T004: "hsl(160, 80%, 55%)",
    T005: "hsl(210, 15%, 55%)",
    T006: "hsl(220, 90%, 65%)",
  };

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Smooth, fluid live data — interpolate 4× per second toward a moving target
  const targetsRef = useRef<Record<string, { energyOutput: number; efficiency: number; temperature: number; vibration: number }>>({});
  const turbinesRef = useRef(turbines);

  useEffect(() => {
    turbinesRef.current = turbines;
  }, [turbines]);

  useEffect(() => {
    // Initialize targets from current values
    if (Object.keys(targetsRef.current).length === 0) {
      turbines.forEach(t => {
        targetsRef.current[t.id] = {
          energyOutput: t.energyOutput,
          efficiency: t.efficiency,
          temperature: t.temperature,
          vibration: t.vibration,
        };
      });
    }

    // Drift the targets every 5s — slow, organic changes
    const targetInterval = setInterval(() => {
      turbines.forEach(t => {
        const cur = targetsRef.current[t.id];
        if (!cur) return;
        if (t.status === "operational") {
          cur.energyOutput = Math.max(1.4, Math.min(2.8, cur.energyOutput + (Math.random() - 0.5) * 0.4));
          cur.efficiency = Math.max(75, Math.min(95, cur.efficiency + (Math.random() - 0.5) * 3));
        } else if (t.status === "warning") {
          cur.energyOutput = Math.max(1.0, Math.min(2.2, cur.energyOutput + (Math.random() - 0.5) * 0.35));
          cur.efficiency = Math.max(60, Math.min(78, cur.efficiency + (Math.random() - 0.5) * 2));
        }
        cur.temperature = Math.max(35, Math.min(60, cur.temperature + (Math.random() - 0.5) * 2));
        cur.vibration = Math.max(0, Math.min(5, cur.vibration + (Math.random() - 0.5) * 0.4));
      });
    }, 5000);

    // Smoothly interpolate values toward targets — 4 fps for fluid motion
    const smoothInterval = setInterval(() => {
      setTurbines(prev => prev.map(t => {
        const tgt = targetsRef.current[t.id];
        if (!tgt) return t;
        const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
        const k = 0.15; // smoothing factor
        return {
          ...t,
          energyOutput: lerp(t.energyOutput, tgt.energyOutput, k),
          efficiency: lerp(t.efficiency, tgt.efficiency, k),
          temperature: lerp(t.temperature, tgt.temperature, k),
          vibration: lerp(t.vibration, tgt.vibration, k),
        };
      }));
    }, 250);

    return () => {
      clearInterval(targetInterval);
      clearInterval(smoothInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live total
  useEffect(() => {
    const total = turbines.reduce((sum, t) => sum + t.energyOutput, 0);
    setTotalEnergy(total);
  }, [turbines]);

  // Slow-moving trend graph — sample every 3s, keep 30 points (~90s window)
  // Records total + per-turbine series so user can toggle visibility
  // Append a trend point whenever turbine data updates
  useEffect(() => {
    setTrendData((prev) => [...prev, buildTrendPoint(turbines)].slice(-TREND_MAX_POINTS));
  }, [turbines]);

  const operationalCount = turbines.filter(t => t.status === "operational").length;
  const warningCount = turbines.filter(t => t.status === "warning").length;
  const offlineCount = turbines.filter(t => t.status === "offline").length;
  const avgEfficiency = Math.round(turbines.reduce((s, t) => s + t.efficiency, 0) / turbines.length);

  const getStatusColor = (status: Turbine["status"]) => {
    switch (status) {
      case "operational": return COLOR_OPERATIONAL;
      case "warning":     return COLOR_WARNING;
      case "offline":     return COLOR_OFFLINE;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16">
        {/* Top status bar */}
        <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                SCADA LINK ACTIVE
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Station: NORTH SEA — Sector 7G
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              UTC {currentTime.toISOString().slice(0, 10)}
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {currentTime.toTimeString().slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Alarm bar */}
          {warningCount > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card/50 border border-border/60">
              <AlertTriangle className="w-4 h-4" style={{ color: COLOR_WARNING }} />
              <span className="font-mono text-xs uppercase tracking-wider" style={{ color: COLOR_WARNING }}>
                {warningCount} ACTIVE WARNING{warningCount > 1 ? "S" : ""} — WG-Gamma: HIGH VIBRATION DETECTED
              </span>
            </div>
          )}

          {/* Top row: KPI displays */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HMIPanel title="Total Output" glowColor={COLOR_PRIMARY}>
              <DigitalDisplay value={totalEnergy} label="Power" unit="MW" color={COLOR_PRIMARY} size="lg" />
            </HMIPanel>
            <HMIPanel title="Fleet Status">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusIndicator status="operational" label={`${operationalCount} ONLINE`} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator status="warning" label={`${warningCount} WARNING`} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <StatusIndicator status="offline" label={`${offlineCount} OFFLINE`} size="sm" />
                </div>
              </div>
            </HMIPanel>
            <HMIPanel title="Avg Efficiency" glowColor={COLOR_PRIMARY}>
              <GaugeCircular value={avgEfficiency} max={100} label="" unit="%" color={COLOR_PRIMARY} size={120} />
            </HMIPanel>
            <HMIPanel title="System Health" glowColor={COLOR_ACCENT}>
              <GaugeCircular
                value={Math.round(turbines.reduce((s, t) => s + t.health, 0) / turbines.length)}
                max={100}
                label=""
                unit="%"
                color={COLOR_ACCENT}
                size={120}
                warningThreshold={50}
                criticalThreshold={30}
              />
            </HMIPanel>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Ocean map / topological view */}
            <HMIPanel
              title={mapView === "geo" ? "Ocean Farm — Geographic View" : "Ocean Farm — Topological View"}
              className="lg:col-span-1"
            >
              {/* View toggle */}
              <div className="flex items-center gap-1 mb-3 p-1 rounded-md bg-background/40 border border-border/40 w-fit">
                <button
                  onClick={() => setMapView("geo")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    mapView === "geo"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapIcon className="w-3 h-3" /> Map
                </button>
                <button
                  onClick={() => setMapView("grid")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors ${
                    mapView === "grid"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3x3 className="w-3 h-3" /> Grid
                </button>
              </div>

              {mapView === "geo" ? (
                <OceanMap
                  turbines={turbines.map(t => ({
                    id: t.id,
                    name: t.name,
                    status: t.status,
                    energyOutput: t.energyOutput,
                    lat: t.lat,
                    lng: t.lng,
                  }))}
                  selectedId={selectedTurbine?.id}
                  onSelect={(id) => setSelectedTurbine(turbines.find(t => t.id === id) ?? null)}
                  getStatusColor={getStatusColor}
                />
              ) : (
                <div className="relative w-full h-72 rounded-md overflow-hidden bg-background/60 border border-border/40">
                  <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="hsl(var(--primary))" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="hsl(var(--primary))" strokeWidth="0.5" />
                    ))}
                  </svg>
                  {turbines.map((turbine) => (
                    <div
                      key={turbine.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-[left,top] duration-1000 ease-out"
                      style={{ left: `${turbine.position.x}%`, top: `${turbine.position.y}%` }}
                      onClick={() => setSelectedTurbine(turbine)}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          border: `1px solid ${getStatusColor(turbine.status)}`,
                          boxShadow: `0 0 6px ${getStatusColor(turbine.status)}40`,
                          background: `${getStatusColor(turbine.status)}10`,
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: getStatusColor(turbine.status) }}
                        />
                      </div>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap font-mono uppercase tracking-wider text-muted-foreground">
                        {turbine.id}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HMIPanel>

            {/* Live trend — slow & smooth, multi-series with toggle */}
            <HMIPanel title="Power Output — Live Trend (90s)" className="lg:col-span-2">
              {/* Series toggles */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                {(() => {
                  const showAll = selectedSeries.size === 0;
                  const toggle = (key: string) => {
                    setSelectedSeries(prev => {
                      const next = new Set(prev);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      return next;
                    });
                  };
                  const chip = (key: string, label: string, color: string) => {
                    const active = showAll || selectedSeries.has(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggle(key)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded font-mono text-[10px] uppercase tracking-wider border transition-colors ${
                          active
                            ? "bg-background/60 border-border text-foreground"
                            : "bg-background/20 border-border/40 text-muted-foreground/60 line-through"
                        }`}
                        title={active ? "Click to hide" : "Click to show"}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ background: color, opacity: active ? 1 : 0.35 }} />
                        {label}
                      </button>
                    );
                  };
                  return (
                    <>
                      {chip("total", "Total", "hsl(var(--primary))")}
                      {turbines.map(t => chip(t.id, t.id, TURBINE_COLORS[t.id] ?? "hsl(var(--primary))"))}
                      {selectedSeries.size > 0 && (
                        <button
                          onClick={() => setSelectedSeries(new Set())}
                          className="ml-1 px-2 py-1 rounded font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/10"
                        >
                          Reset
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>

              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 10, fontFamily: "monospace" }}
                    domain={['auto', 'auto']}
                    label={{ value: "MW", angle: -90, position: "insideLeft", style: { fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "monospace" } }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                      fontFamily: "monospace",
                      fontSize: 12,
                      borderRadius: 8,
                    }}
                  />
                  {(() => {
                    const showAll = selectedSeries.size === 0;
                    const showTotal = showAll || selectedSeries.has("total");
                    return (
                      <>
                        {showTotal && (
                          <Line
                            key="total"
                            type="linear"
                            dataKey="total"
                            name="Total"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2.5}
                            dot={false}
                            isAnimationActive={false}
                          />
                        )}
                        {turbines.map(t => {
                          const visible = showAll || selectedSeries.has(t.id);
                          if (!visible) return null;
                          return (
                            <Line
                              key={t.id}
                              type="linear"
                              dataKey={t.id}
                              name={t.id}
                              stroke={TURBINE_COLORS[t.id] ?? "hsl(var(--primary))"}
                              strokeWidth={1.5}
                              strokeOpacity={0.9}
                              dot={false}
                              isAnimationActive={false}
                            />
                          );
                        })}
                      </>
                    );
                  })()}
                </LineChart>
              </ResponsiveContainer>
            </HMIPanel>
          </div>

          {/* Unit detail panels */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {turbines.map((turbine) => (
              <HMIPanel
                key={turbine.id}
                title={turbine.id}
                glowColor={getStatusColor(turbine.status)}
                className={`cursor-pointer transition-all ${selectedTurbine?.id === turbine.id ? "ring-1 ring-primary/50" : ""}`}
              >
                <div className="space-y-3" onClick={() => setSelectedTurbine(turbine)}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{turbine.name}</span>
                    <StatusIndicator status={turbine.status} size="sm" label="" />
                  </div>
                  <GaugeCircular value={turbine.energyOutput} max={3} label="" unit="MW" color={getStatusColor(turbine.status)} size={90} warningThreshold={85} criticalThreshold={95} />
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex items-center gap-1">
                      <ThermometerSun className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{Math.round(turbine.temperature)}°C</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Vibrate className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{turbine.vibration.toFixed(1)}Hz</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{Math.round(turbine.efficiency)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono tabular-nums text-muted-foreground">{turbine.health}%</span>
                    </div>
                  </div>
                </div>
              </HMIPanel>
            ))}
          </div>

          {/* Selected unit detail */}
          {selectedTurbine && (
            <HMIPanel title={`${selectedTurbine.id} — ${selectedTurbine.name} — DIAGNOSTICS`} glowColor={getStatusColor(selectedTurbine.status)}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center">
                <GaugeCircular value={selectedTurbine.energyOutput} max={3} label="Output" unit="MW" color={COLOR_PRIMARY} size={130} />
                <GaugeCircular value={selectedTurbine.efficiency} max={100} label="Efficiency" unit="%" color={COLOR_ACCENT} size={130} />
                <GaugeCircular value={selectedTurbine.health} max={100} label="Health" unit="%" color={COLOR_HEALTH} size={130} warningThreshold={50} criticalThreshold={30} />
                <GaugeCircular value={selectedTurbine.temperature} max={60} label="Temperature" unit="°C" color={COLOR_PRIMARY} size={130} warningThreshold={75} criticalThreshold={90} />
                <GaugeCircular value={selectedTurbine.vibration} max={5} label="Vibration" unit="Hz" color={COLOR_ACCENT} size={130} warningThreshold={60} criticalThreshold={80} />
                <div className="flex flex-col gap-3">
                  <DigitalDisplay value={selectedTurbine.id} label="Unit ID" color={COLOR_PRIMARY} size="sm" />
                  <StatusIndicator status={selectedTurbine.status} size="lg" />
                </div>
              </div>
            </HMIPanel>
          )}
        </div>
      </div>
    </div>
  );
};

export default HMIDashboard;
