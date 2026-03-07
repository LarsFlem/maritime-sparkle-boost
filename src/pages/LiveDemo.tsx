import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import BluetoothController from "@/components/BluetoothController";
import { DataLogger } from "@/components/live-demo/DataLogger";
import { AlarmSystem } from "@/components/live-demo/AlarmSystem";
import { IOMonitor } from "@/components/live-demo/IOMonitor";
import { ProgramSequencer } from "@/components/live-demo/ProgramSequencer";
import { 
  Play, 
  Square, 
  RotateCw, 
  Zap, 
  Thermometer, 
  Gauge, 
  AlertTriangle,
  CheckCircle2,
  Power,
  Camera,
  Settings,
  Activity,
  Cpu
} from "lucide-react";

interface PLCState {
  isRunning: boolean;
  position: number;
  speed: number;
  temperature: number;
  pressure: number;
  motorRpm: number;
  vibration: number;
  power: number;
  errors: string[];
  cycleCount: number;
  lastUpdate: Date;
}

const LiveDemo = () => {
  const { t } = useLanguage();
  
  const [plcState, setPLCState] = useState<PLCState>({
    isRunning: false,
    position: 0,
    speed: 50,
    temperature: 22.5,
    pressure: 1.2,
    motorRpm: 0,
    vibration: 1.5,
    power: 0,
    errors: [],
    cycleCount: 0,
    lastUpdate: new Date()
  });

  const [targetPosition, setTargetPosition] = useState([50]);
  const [targetSpeed, setTargetSpeed] = useState([50]);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [autoMode, setAutoMode] = useState(false);

  // Simulate PLC updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPLCState(prev => {
        if (!prev.isRunning || emergencyStop) return { 
          ...prev, 
          speed: 0,
          motorRpm: 0,
          vibration: 0.5,
          power: 0,
          lastUpdate: new Date() 
        };

        const newPosition = autoMode 
          ? Math.sin(Date.now() / 2000) * 50 + 50 
          : Math.min(100, Math.max(0, prev.position + (targetPosition[0] - prev.position) * 0.1));
        
        const newSpeed = prev.isRunning ? targetSpeed[0] : 0;
        const newRpm = prev.isRunning ? newSpeed * 20 + Math.random() * 50 : 0;
        const newTemp = 22.5 + (prev.isRunning ? Math.random() * 5 : 0);
        const newPressure = 1.2 + (prev.isRunning ? Math.random() * 0.5 : 0);
        const newVibration = prev.isRunning ? 1.5 + Math.random() * 2 : 0.5;
        const newPower = prev.isRunning ? (newSpeed / 100) * 3.5 + Math.random() * 0.5 : 0;

        return {
          ...prev,
          position: newPosition,
          speed: newSpeed,
          temperature: newTemp,
          pressure: newPressure,
          motorRpm: newRpm,
          vibration: newVibration,
          power: newPower,
          cycleCount: autoMode && Math.abs(newPosition - 50) < 2 ? prev.cycleCount + 1 : prev.cycleCount,
          lastUpdate: new Date()
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [targetPosition, targetSpeed, emergencyStop, autoMode]);

  const handleStart = () => {
    if (emergencyStop) return;
    setPLCState(prev => ({ ...prev, isRunning: true, errors: [] }));
  };

  const handleStop = () => {
    setPLCState(prev => ({ ...prev, isRunning: false, speed: 0, motorRpm: 0 }));
  };

  const handleReset = () => {
    setPLCState(prev => ({ 
      ...prev, 
      position: 0, 
      cycleCount: 0, 
      errors: [],
      temperature: 22.5,
      pressure: 1.2
    }));
    setTargetPosition([50]);
    setTargetSpeed([50]);
    setEmergencyStop(false);
  };

  const handleEmergencyStop = () => {
    setEmergencyStop(!emergencyStop);
    if (!emergencyStop) {
      setPLCState(prev => ({ 
        ...prev, 
        isRunning: false, 
        speed: 0, 
        motorRpm: 0,
        errors: [...prev.errors, "Emergency stop activated"]
      }));
    }
  };

  // Bluetooth controller callbacks
  const handleBluetoothPositionChange = (position: number) => {
    if (!autoMode && !emergencyStop) {
      setTargetPosition([position]);
    }
  };

  const handleBluetoothSpeedChange = (speed: number) => {
    if (!autoMode && !emergencyStop) {
      setTargetSpeed([speed]);
    }
  };

  // Program sequencer callbacks
  const handleProgramStepChange = (position?: number, speed?: number) => {
    if (position !== undefined) setTargetPosition([position]);
    if (speed !== undefined) setTargetSpeed([speed]);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(200_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(200_100%_50%/0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[radial-gradient(ellipse,hsl(200_100%_50%/0.08),transparent_70%)] pointer-events-none" />
      
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-4">
            <span className={`w-2 h-2 rounded-full ${plcState.isRunning ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
            {plcState.isRunning ? t('liveDemo.status.running') : t('liveDemo.status.stopped')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-['Space_Grotesk']">
            {t('liveDemo.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('liveDemo.subtitle')}
          </p>
          
          {/* Live stats bar */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-muted-foreground">Temp:</span>
              <span className="font-mono text-foreground">{plcState.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="w-4 h-4 text-blue-400" />
              <span className="text-muted-foreground">RPM:</span>
              <span className="font-mono text-foreground">{plcState.motorRpm.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-muted-foreground">Power:</span>
              <span className="font-mono text-foreground">{plcState.power.toFixed(1)} kW</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-muted-foreground">Cycles:</span>
              <span className="font-mono text-foreground">{plcState.cycleCount}</span>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Video Feed with Robot Arm Visualization */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/40 shadow-[var(--shadow-ocean)] group hover:border-primary/30 transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Camera className="w-5 h-5 mr-2 text-primary" />
                {t('liveDemo.videoFeed.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-background rounded-lg overflow-hidden aspect-video border border-border/30">
                {/* Robot Arm SVG Visualization */}
                <svg viewBox="0 0 400 250" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(200 100% 50% / 0.06)" strokeWidth="0.5"/>
                    </pattern>
                    <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(200, 100%, 50%)" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="hsl(180, 100%, 50%)" stopOpacity="0.6"/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect width="400" height="250" fill="url(#grid)"/>
                  
                  {/* Base */}
                  <rect x="170" y="200" width="60" height="30" rx="4" fill="hsl(210, 15%, 25%)" stroke="hsl(200, 100%, 50%)" strokeWidth="1" opacity="0.8"/>
                  
                  {/* Arm segment 1 */}
                  <g style={{ transform: `rotate(${-30 + (plcState.position * 0.6)}deg)`, transformOrigin: '200px 200px', transition: 'transform 0.3s ease' }}>
                    <rect x="190" y="120" width="20" height="80" rx="4" fill="url(#armGrad)" filter="url(#glow)"/>
                    
                    {/* Arm segment 2 */}
                    <g style={{ transform: `rotate(${-20 + (plcState.speed * 0.4)}deg)`, transformOrigin: '200px 120px', transition: 'transform 0.3s ease' }}>
                      <rect x="190" y="60" width="20" height="60" rx="4" fill="url(#armGrad)" opacity="0.9" filter="url(#glow)"/>
                      
                      {/* Gripper */}
                      <circle cx="200" cy="55" r="8" fill="none" stroke="hsl(180, 100%, 50%)" strokeWidth="2" filter="url(#glow)"/>
                      <circle cx="200" cy="55" r="3" fill={plcState.isRunning ? "hsl(142, 76%, 50%)" : "hsl(210, 15%, 40%)"} className={plcState.isRunning ? "animate-pulse" : ""}/>
                    </g>
                    
                    {/* Joint */}
                    <circle cx="200" cy="120" r="6" fill="hsl(210, 15%, 20%)" stroke="hsl(200, 100%, 50%)" strokeWidth="1.5"/>
                  </g>
                  
                  {/* Base joint */}
                  <circle cx="200" cy="200" r="8" fill="hsl(210, 15%, 20%)" stroke="hsl(200, 100%, 50%)" strokeWidth="1.5"/>
                  
                  {/* Status text */}
                  <text x="20" y="20" fill="hsl(200, 100%, 50%)" fontSize="10" fontFamily="monospace" opacity="0.7">POS: {plcState.position.toFixed(1)}%</text>
                  <text x="20" y="35" fill="hsl(180, 100%, 50%)" fontSize="10" fontFamily="monospace" opacity="0.7">SPD: {plcState.speed.toFixed(1)}%</text>
                  <text x="20" y="50" fill="hsl(142, 76%, 50%)" fontSize="10" fontFamily="monospace" opacity="0.7">RPM: {plcState.motorRpm.toFixed(0)}</text>
                </svg>
                
                {/* Overlay HUD */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-background/70 backdrop-blur-sm rounded-lg p-2.5 border border-border/30">
                    <div className="flex justify-between text-foreground text-xs font-mono mb-1.5">
                      <span>Position: {plcState.position.toFixed(1)}%</span>
                      <span>Speed: {plcState.speed.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300 shadow-[0_0_8px_hsl(200_100%_50%/0.5)]"
                        style={{ width: `${plcState.position}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recording indicator */}
                {plcState.isRunning && (
                  <div className="absolute top-3 right-3 flex items-center bg-destructive text-destructive-foreground px-2.5 py-1 rounded-full text-xs font-medium">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                    LIVE
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bluetooth Controller */}
          <BluetoothController
            onPositionChange={handleBluetoothPositionChange}
            onSpeedChange={handleBluetoothSpeedChange}
            isEmergencyStop={emergencyStop}
            isRunning={plcState.isRunning}
          />

          {/* PLC HMI Control Panel */}
          <Card className="bg-card/60 backdrop-blur-sm border-border/40 shadow-[var(--shadow-ocean)] hover:border-primary/30 transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Cpu className="w-5 h-5 mr-2 text-primary" />
                {t('liveDemo.hmi.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="control" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                  <TabsTrigger value="control" className="text-white data-[state=active]:bg-primary">
                    {t('liveDemo.hmi.tabs.control')}
                  </TabsTrigger>
                  <TabsTrigger value="monitoring" className="text-white data-[state=active]:bg-primary">
                    {t('liveDemo.hmi.tabs.monitoring')}
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-white data-[state=active]:bg-primary">
                    {t('liveDemo.hmi.tabs.settings')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="control" className="space-y-6 mt-6">
                  {/* Emergency Stop */}
                  <div className="flex items-center justify-between p-4 bg-red-900/20 rounded-lg border border-red-800">
                    <span className="text-white font-medium">Emergency Stop</span>
                    <Button
                      onClick={handleEmergencyStop}
                      variant={emergencyStop ? "destructive" : "outline"}
                      size="lg"
                      className={emergencyStop ? "bg-red-600" : "border-red-600 text-red-600"}
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      {emergencyStop ? 'RESET E-STOP' : 'E-STOP'}
                    </Button>
                  </div>

                  {/* Control Buttons */}
                  <div className="grid grid-cols-3 gap-4">
                    <Button 
                      onClick={handleStart}
                      disabled={emergencyStop}
                      className="bg-green-600 hover:bg-green-700 text-white h-12"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      START
                    </Button>
                    <Button 
                      onClick={handleStop}
                      variant="destructive"
                      className="h-12"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      STOP
                    </Button>
                    <Button 
                      onClick={handleReset}
                      variant="outline"
                      className="border-slate-600 text-white h-12"
                    >
                      <RotateCw className="w-5 h-5 mr-2" />
                      RESET
                    </Button>
                  </div>

                  {/* Mode Controls */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-white font-medium">Auto Mode</label>
                      <Switch 
                        checked={autoMode}
                        onCheckedChange={setAutoMode}
                        disabled={emergencyStop}
                      />
                    </div>

                    {!autoMode && (
                      <>
                        <div className="space-y-2">
                          <label className="text-white text-sm">Target Position: {targetPosition[0]}%</label>
                          <Slider
                            value={targetPosition}
                            onValueChange={setTargetPosition}
                            max={100}
                            step={1}
                            className="w-full"
                            disabled={emergencyStop}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-white text-sm">Speed: {targetSpeed[0]}%</label>
                          <Slider
                            value={targetSpeed}
                            onValueChange={setTargetSpeed}
                            max={100}
                            step={1}
                            className="w-full"
                            disabled={emergencyStop}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="monitoring" className="space-y-4 mt-6">
                  {/* Status Indicators */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Position</span>
                        <span className="text-white font-mono">{plcState.position.toFixed(1)}%</span>
                      </div>
                      <Progress value={plcState.position} className="mt-2" />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Speed</span>
                        <span className="text-white font-mono">{plcState.speed.toFixed(1)}%</span>
                      </div>
                      <Progress value={plcState.speed} className="mt-2" />
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Thermometer className="w-5 h-5 text-orange-400 mr-2" />
                        <span className="text-slate-300">Temperature</span>
                      </div>
                      <span className="text-white font-mono text-lg">{plcState.temperature.toFixed(1)}°C</span>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Gauge className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-slate-300">Pressure</span>
                      </div>
                      <span className="text-white font-mono text-lg">{plcState.pressure.toFixed(2)} bar</span>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-slate-300">Motor RPM</span>
                      </div>
                      <span className="text-white font-mono text-lg">{plcState.motorRpm.toFixed(0)}</span>
                    </div>

                    <div className="bg-slate-700/50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <RotateCw className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-slate-300">Cycles</span>
                      </div>
                      <span className="text-white font-mono text-lg">{plcState.cycleCount}</span>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
                      System Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">PLC Status:</span>
                        <span className="text-green-400">Online</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Communication:</span>
                        <span className="text-green-400">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Last Update:</span>
                        <span className="text-slate-300">{plcState.lastUpdate.toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Errors:</span>
                        <span className={plcState.errors.length > 0 ? "text-red-400" : "text-green-400"}>
                          {plcState.errors.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Errors */}
                  {plcState.errors.length > 0 && (
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-800">
                      <h4 className="text-red-400 font-medium mb-2">Active Errors</h4>
                      {plcState.errors.map((error, index) => (
                        <div key={index} className="text-red-300 text-sm">
                          • {error}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-6">
                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Settings className="w-5 h-5 text-slate-300 mr-2" />
                      <span className="text-white font-medium">PLC Configuration</span>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">PLC Model:</span>
                        <span className="text-white">Siemens S7-1200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Firmware:</span>
                        <span className="text-white">v4.2.3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">IP Address:</span>
                        <span className="text-white">192.168.1.100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Scan Rate:</span>
                        <span className="text-white">100ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Protocol:</span>
                        <span className="text-white">Modbus TCP</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Power className="w-5 h-5 text-slate-300 mr-2" />
                      <span className="text-white font-medium">System Information</span>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Runtime:</span>
                        <span className="text-white">24h 15m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">CPU Usage:</span>
                        <span className="text-white">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Memory:</span>
                        <span className="text-white">45% (2.1GB)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Temperature:</span>
                        <span className="text-white">42°C</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Extended Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Data Logger */}
          <DataLogger
            currentData={{
              temperature: plcState.temperature,
              pressure: plcState.pressure,
              speed: plcState.speed,
              motorRpm: plcState.motorRpm,
              vibration: plcState.vibration,
              power: plcState.power
            }}
            isRunning={plcState.isRunning}
          />

          {/* Alarm System */}
          <AlarmSystem
            temperature={plcState.temperature}
            pressure={plcState.pressure}
            vibration={plcState.vibration}
            emergencyStop={emergencyStop}
          />
        </div>

        {/* I/O and Program Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* I/O Monitor */}
          <IOMonitor
            isRunning={plcState.isRunning}
            position={plcState.position}
          />

          {/* Program Sequencer */}
          <ProgramSequencer
            onStepChange={handleProgramStepChange}
            isRunning={plcState.isRunning}
            autoMode={autoMode}
          />
        </div>
      </div>
    </div>
  );
};

export default LiveDemo;