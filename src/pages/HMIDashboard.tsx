import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Power, Activity, ThermometerSun, Vibrate, Zap, Radio } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import GaugeCircular from "@/components/hmi/GaugeCircular";
import StatusIndicator from "@/components/hmi/StatusIndicator";
import HMIPanel from "@/components/hmi/HMIPanel";
import DigitalDisplay from "@/components/hmi/DigitalDisplay";

interface Turbine {
  id: string;
  name: string;
  status: "operational" | "warning" | "offline";
  energyOutput: number;
  efficiency: number;
  health: number;
  position: { x: number; y: number };
  temperature: number;
  vibration: number;
}

const HMIDashboard = () => {
  const { t } = useLanguage();
  const [turbines, setTurbines] = useState<Turbine[]>([
    { id: "T001", name: "WG-Alpha", status: "operational", energyOutput: 2.4, efficiency: 87, health: 95, position: { x: 20, y: 30 }, temperature: 45, vibration: 2.1 },
    { id: "T002", name: "WG-Beta", status: "operational", energyOutput: 2.1, efficiency: 82, health: 88, position: { x: 40, y: 20 }, temperature: 42, vibration: 1.8 },
    { id: "T003", name: "WG-Gamma", status: "warning", energyOutput: 1.8, efficiency: 72, health: 76, position: { x: 60, y: 35 }, temperature: 52, vibration: 3.2 },
    { id: "T004", name: "WG-Delta", status: "operational", energyOutput: 2.3, efficiency: 85, health: 92, position: { x: 80, y: 25 }, temperature: 44, vibration: 2.0 },
    { id: "T005", name: "WG-Echo", status: "offline", energyOutput: 0, efficiency: 0, health: 45, position: { x: 30, y: 65 }, temperature: 38, vibration: 0.5 },
    { id: "T006", name: "WG-Foxtrot", status: "operational", energyOutput: 2.2, efficiency: 84, health: 89, position: { x: 70, y: 55 }, temperature: 46, vibration: 2.3 },
  ]);

  const [selectedTurbine, setSelectedTurbine] = useState<Turbine | null>(null);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [trendData, setTrendData] = useState<{ time: string; energy: number }[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setTurbines(prev => prev.map(turbine => ({
        ...turbine,
        energyOutput: turbine.status === "operational"
          ? Math.max(0.5, Math.min(3.0, turbine.energyOutput + (Math.random() - 0.5) * 0.15))
          : turbine.energyOutput,
        efficiency: turbine.status === "operational"
          ? Math.min(100, Math.max(60, turbine.efficiency + (Math.random() - 0.5) * 1.5))
          : turbine.efficiency,
        temperature: Math.max(35, Math.min(60, turbine.temperature + (Math.random() - 0.5) * 1)),
        vibration: Math.max(0, Math.min(5, turbine.vibration + (Math.random() - 0.5) * 0.2)),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Update trend data
  useEffect(() => {
    const total = turbines.reduce((sum, t) => sum + t.energyOutput, 0);
    setTotalEnergy(total);
    setTrendData(prev => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const next = [...prev, { time: timeStr, energy: parseFloat(total.toFixed(1)) }];
      return next.slice(-20);
    });
  }, [turbines]);

  const operationalCount = turbines.filter(t => t.status === "operational").length;
  const warningCount = turbines.filter(t => t.status === "warning").length;
  const offlineCount = turbines.filter(t => t.status === "offline").length;
  const avgEfficiency = Math.round(turbines.reduce((s, t) => s + t.efficiency, 0) / turbines.length);

  const getStatusColor = (status: Turbine["status"]) => {
    switch (status) {
      case "operational": return "hsl(142, 60%, 55%)";
      case "warning": return "hsl(38, 92%, 60%)";
      case "offline": return "hsl(0, 70%, 55%)";
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
              <AlertTriangle className="w-4 h-4 text-amber-400/90" />
              <span className="font-mono text-xs text-amber-400/90 uppercase tracking-wider">
                {warningCount} ACTIVE WARNING{warningCount > 1 ? "S" : ""} — WG-Gamma: HIGH VIBRATION DETECTED
              </span>
            </div>
          )}

          {/* Top row: KPI displays */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HMIPanel title="Total Output" glowColor="hsl(142, 76%, 50%)">
              <DigitalDisplay value={totalEnergy} label="Power" unit="MW" color="hsl(142, 76%, 50%)" size="lg" />
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
            <HMIPanel title="Avg Efficiency" glowColor="hsl(200, 100%, 50%)">
              <GaugeCircular value={avgEfficiency} max={100} label="" unit="%" color="hsl(200, 100%, 50%)" size={120} />
            </HMIPanel>
            <HMIPanel title="System Health" glowColor="hsl(280, 70%, 60%)">
              <GaugeCircular
                value={Math.round(turbines.reduce((s, t) => s + t.health, 0) / turbines.length)}
                max={100}
                label=""
                unit="%"
                color="hsl(280, 70%, 60%)"
                size={120}
                warningThreshold={50}
                criticalThreshold={30}
              />
            </HMIPanel>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Ocean map */}
            <HMIPanel title="Ocean Farm — Topological View" className="lg:col-span-1">
              <div className="relative w-full h-72 rounded-md overflow-hidden bg-background/60 border border-border/40">
                {/* Grid overlay */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.06]">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="hsl(var(--primary))" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="hsl(var(--primary))" strokeWidth="0.5" />
                  ))}
                </svg>
                {/* Turbine nodes */}
                {turbines.map((turbine) => (
                  <div
                    key={turbine.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${turbine.position.x}%`, top: `${turbine.position.y}%` }}
                    onClick={() => setSelectedTurbine(turbine)}
                  >
                    {/* Outer ring */}
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
                    {/* Label */}
                    <div
                      className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] whitespace-nowrap font-mono uppercase tracking-wider text-muted-foreground"
                    >
                      {turbine.id}
                    </div>
                  </div>
                ))}
              </div>
            </HMIPanel>

            {/* Live trend */}
            <HMIPanel title="Power Output — Live Trend" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={272}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10, fontFamily: "monospace" }} domain={['auto', 'auto']} />
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
                  <Area type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#energyGrad)" dot={false} />
                </AreaChart>
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
                <GaugeCircular value={selectedTurbine.energyOutput} max={3} label="Output" unit="MW" color="hsl(142, 76%, 50%)" size={130} />
                <GaugeCircular value={selectedTurbine.efficiency} max={100} label="Efficiency" unit="%" color="hsl(200, 100%, 50%)" size={130} />
                <GaugeCircular value={selectedTurbine.health} max={100} label="Health" unit="%" color="hsl(280, 70%, 60%)" size={130} warningThreshold={50} criticalThreshold={30} />
                <GaugeCircular value={selectedTurbine.temperature} max={60} label="Temperature" unit="°C" color="hsl(30, 100%, 55%)" size={130} warningThreshold={75} criticalThreshold={90} />
                <GaugeCircular value={selectedTurbine.vibration} max={5} label="Vibration" unit="Hz" color="hsl(45, 100%, 60%)" size={130} warningThreshold={60} criticalThreshold={80} />
                <div className="flex flex-col gap-3">
                  <DigitalDisplay value={selectedTurbine.id} label="Unit ID" color="hsl(200, 100%, 50%)" size="sm" />
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
