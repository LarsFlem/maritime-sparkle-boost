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
        if (!prev.isRunning || emergencyStop) return { ...prev, lastUpdate: new Date() };

        const newPosition = autoMode 
          ? Math.sin(Date.now() / 2000) * 50 + 50 
          : Math.min(100, Math.max(0, prev.position + (targetPosition[0] - prev.position) * 0.1));
        
        const newSpeed = prev.isRunning ? targetSpeed[0] : 0;
        const newRpm = prev.isRunning ? newSpeed * 20 + Math.random() * 50 : 0;
        const newTemp = 22.5 + (prev.isRunning ? Math.random() * 5 : 0);
        const newPressure = 1.2 + (prev.isRunning ? Math.random() * 0.5 : 0);

        return {
          ...prev,
          position: newPosition,
          speed: newSpeed,
          temperature: newTemp,
          pressure: newPressure,
          motorRpm: newRpm,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            {t('liveDemo.title')}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {t('liveDemo.subtitle')}
          </p>
          <Badge 
            variant={plcState.isRunning ? "default" : "secondary"} 
            className="mt-4 px-4 py-2 text-lg"
          >
            <Activity className="w-4 h-4 mr-2" />
            {plcState.isRunning ? t('liveDemo.status.running') : t('liveDemo.status.stopped')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Video Feed */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Camera className="w-5 h-5 mr-2" />
                {t('liveDemo.videoFeed.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                  <div className="text-center text-slate-400">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">{t('liveDemo.videoFeed.placeholder')}</p>
                    <p className="text-sm mt-2">{t('liveDemo.videoFeed.description')}</p>
                  </div>
                </div>
                
                {/* Simulated robot position indicator */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 rounded p-2">
                    <div className="flex justify-between text-white text-sm mb-2">
                      <span>Position: {plcState.position.toFixed(1)}%</span>
                      <span>Speed: {plcState.speed.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plcState.position}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recording indicator */}
                {plcState.isRunning && (
                  <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
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
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Cpu className="w-5 h-5 mr-2" />
                {t('liveDemo.hmi.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="control" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-700">
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
      </div>
    </div>
  );
};

export default LiveDemo;