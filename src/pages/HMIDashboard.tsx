import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Power, Waves, Battery, Settings, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

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
  const [turbines, setTurbines] = useState<Turbine[]>([
    { id: "T001", name: "Wave Gen Alpha", status: "operational", energyOutput: 2.4, efficiency: 87, health: 95, position: { x: 20, y: 30 }, temperature: 45, vibration: 2.1 },
    { id: "T002", name: "Wave Gen Beta", status: "operational", energyOutput: 2.1, efficiency: 82, health: 88, position: { x: 40, y: 20 }, temperature: 42, vibration: 1.8 },
    { id: "T003", name: "Wave Gen Gamma", status: "warning", energyOutput: 1.8, efficiency: 72, health: 76, position: { x: 60, y: 35 }, temperature: 52, vibration: 3.2 },
    { id: "T004", name: "Wave Gen Delta", status: "operational", energyOutput: 2.3, efficiency: 85, health: 92, position: { x: 80, y: 25 }, temperature: 44, vibration: 2.0 },
    { id: "T005", name: "Wave Gen Echo", status: "offline", energyOutput: 0, efficiency: 0, health: 45, position: { x: 30, y: 60 }, temperature: 38, vibration: 0.5 },
    { id: "T006", name: "Wave Gen Foxtrot", status: "operational", energyOutput: 2.2, efficiency: 84, health: 89, position: { x: 70, y: 50 }, temperature: 46, vibration: 2.3 },
  ]);

  const [selectedTurbine, setSelectedTurbine] = useState<Turbine | null>(null);
  const [totalEnergy, setTotalEnergy] = useState(0);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTurbines(prev => prev.map(turbine => ({
        ...turbine,
        energyOutput: turbine.status === "operational" 
          ? Math.max(0, turbine.energyOutput + (Math.random() - 0.5) * 0.2)
          : turbine.energyOutput,
        efficiency: turbine.status === "operational"
          ? Math.min(100, Math.max(60, turbine.efficiency + (Math.random() - 0.5) * 2))
          : turbine.efficiency,
        temperature: Math.max(35, Math.min(60, turbine.temperature + (Math.random() - 0.5) * 2)),
        vibration: Math.max(0, Math.min(5, turbine.vibration + (Math.random() - 0.5) * 0.3)),
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTotalEnergy(turbines.reduce((sum, turbine) => sum + turbine.energyOutput, 0));
  }, [turbines]);

  const getStatusColor = (status: Turbine["status"]) => {
    switch (status) {
      case "operational": return "hsl(var(--primary))";
      case "warning": return "hsl(45, 100%, 60%)";
      case "offline": return "hsl(var(--destructive))";
    }
  };

  const getStatusBadge = (status: Turbine["status"]) => {
    switch (status) {
      case "operational": return <Badge className="bg-green-500 text-white">Operational</Badge>;
      case "warning": return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
      case "offline": return <Badge className="bg-red-500 text-white">Offline</Badge>;
    }
  };

  const energyData = [
    { time: "00:00", energy: 10.2 },
    { time: "04:00", energy: 8.5 },
    { time: "08:00", energy: 12.1 },
    { time: "12:00", energy: 14.3 },
    { time: "16:00", energy: 11.8 },
    { time: "20:00", energy: totalEnergy },
  ];

  const operationalTurbines = turbines.filter(t => t.status === "operational").length;
  const warningTurbines = turbines.filter(t => t.status === "warning").length;
  const offlineTurbines = turbines.filter(t => t.status === "offline").length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Wave Generator HMI Control Center</h1>
            <p className="text-slate-400">Offshore Energy Farm - Real-time Monitoring</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Badge className="text-lg px-4 py-2 bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              System Online
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Energy Output</CardTitle>
              <Power className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{totalEnergy.toFixed(1)} MW</div>
              <p className="text-xs text-slate-400">+2.1% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Operational</CardTitle>
              <Waves className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{operationalTurbines}/{turbines.length}</div>
              <p className="text-xs text-slate-400">Turbines online</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Warnings</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{warningTurbines}</div>
              <p className="text-xs text-slate-400">Require attention</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Fleet Efficiency</CardTitle>
              <Battery className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(turbines.reduce((sum, t) => sum + t.efficiency, 0) / turbines.length)}%
              </div>
              <p className="text-xs text-slate-400">Average performance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ocean Map View */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Ocean Farm Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-80 bg-gradient-to-b from-blue-900 to-blue-950 rounded-lg overflow-hidden">
                {/* Ocean waves effect */}
                <div className="absolute inset-0 opacity-30">
                  <div className="wave-animation"></div>
                </div>
                
                {/* Turbines */}
                {turbines.map((turbine) => (
                  <div
                    key={turbine.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                    style={{ left: `${turbine.position.x}%`, top: `${turbine.position.y}%` }}
                    onClick={() => setSelectedTurbine(turbine)}
                  >
                    <div className="relative">
                      <div 
                        className="w-6 h-6 rounded-full border-2 animate-pulse"
                        style={{ 
                          backgroundColor: getStatusColor(turbine.status),
                          borderColor: "white",
                          boxShadow: `0 0 10px ${getStatusColor(turbine.status)}`
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap bg-black/70 px-2 py-1 rounded">
                        {turbine.name}
                      </div>
                      {turbine.status === "operational" && (
                        <div className="absolute -bottom-2 -left-1 w-8 h-1 bg-green-400 opacity-60 animate-ping" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Energy Production Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Energy Production (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      color: 'white'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Turbine Details */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-slate-700">Fleet Overview</TabsTrigger>
              <TabsTrigger value="details" className="text-white data-[state=active]:bg-slate-700">Detailed View</TabsTrigger>
              <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {turbines.map((turbine) => (
                  <Card key={turbine.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer" onClick={() => setSelectedTurbine(turbine)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white">{turbine.name}</CardTitle>
                        {getStatusBadge(turbine.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Energy Output:</span>
                        <span className="text-green-400 font-medium">{turbine.energyOutput.toFixed(1)} MW</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Efficiency:</span>
                          <span className="text-white">{turbine.efficiency}%</span>
                        </div>
                        <Progress value={turbine.efficiency} className="h-2" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Health:</span>
                          <span className="text-white">{turbine.health}%</span>
                        </div>
                        <Progress value={turbine.health} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              {selectedTurbine ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{selectedTurbine.name} - Detailed Diagnostics</CardTitle>
                      {getStatusBadge(selectedTurbine.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-400">Power Generation</h3>
                        <p className="text-2xl font-bold text-green-400">{selectedTurbine.energyOutput.toFixed(2)} MW</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-400">Temperature</h3>
                        <p className="text-2xl font-bold text-blue-400">{selectedTurbine.temperature}°C</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-400">Vibration</h3>
                        <p className="text-2xl font-bold text-yellow-400">{selectedTurbine.vibration.toFixed(1)} Hz</p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-400">Overall Health</h3>
                        <p className="text-2xl font-bold text-purple-400">{selectedTurbine.health}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="py-12 text-center">
                    <p className="text-slate-400">Select a turbine from the ocean map or overview to view detailed diagnostics</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={turbines}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #334155',
                          color: 'white'
                        }} 
                      />
                      <Bar dataKey="energyOutput" fill="#22c55e" name="Energy (MW)" />
                      <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style>{`
        .wave-animation {
          background: linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%);
          animation: wave 3s ease-in-out infinite;
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(-100px); }
          50% { transform: translateX(100px); }
        }
      `}</style>
    </div>
  );
};

export default HMIDashboard;