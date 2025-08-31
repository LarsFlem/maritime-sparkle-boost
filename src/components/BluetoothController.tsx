import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Bluetooth, 
  BluetoothConnected,
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  RotateCcw,
  Power,
  Zap
} from "lucide-react";

interface BluetoothControllerProps {
  onPositionChange: (position: number) => void;
  onSpeedChange: (speed: number) => void;
  isEmergencyStop: boolean;
  isRunning: boolean;
}

const BluetoothController = ({ 
  onPositionChange, 
  onSpeedChange, 
  isEmergencyStop, 
  isRunning 
}: BluetoothControllerProps) => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [controllerPower, setControllerPower] = useState([75]);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Simulate battery drain
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, prev - 0.1));
    }, 30000); // Drain 0.1% every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected]);

  const connectBluetooth = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate Bluetooth connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      setIsConnected(true);
      setDeviceName("Maritime Robot Controller");
      setBatteryLevel(85);
      
      // Optional: Request Web Bluetooth API (if supported)
      if ('bluetooth' in navigator) {
        try {
          const bluetooth = (navigator as any).bluetooth;
          const device = await bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service', 'device_information']
          });
          setDeviceName(device.name || "Maritime Robot Controller");
        } catch (error) {
          console.log("Bluetooth pairing cancelled or failed:", error);
        }
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectBluetooth = () => {
    setIsConnected(false);
    setDeviceName("");
    setBatteryLevel(0);
  };

  const handleDirectionalControl = (direction: string) => {
    if (isEmergencyStop || !isConnected) return;
    
    const currentTime = Date.now();
    const intensity = controllerPower[0];
    
    // Vibration feedback
    if (vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    switch (direction) {
      case 'forward':
        onPositionChange(Math.min(100, intensity));
        break;
      case 'backward':
        onPositionChange(Math.max(0, 100 - intensity));
        break;
      case 'left':
        onPositionChange(Math.max(0, 25));
        break;
      case 'right':
        onPositionChange(Math.min(100, 75));
        break;
      case 'rotateLeft':
        onSpeedChange(Math.max(10, intensity - 20));
        break;
      case 'rotateRight':
        onSpeedChange(Math.min(100, intensity + 20));
        break;
    }
  };

  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-green-400";
    if (batteryLevel > 20) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Gamepad2 className="w-5 h-5 mr-2" />
            Bluetooth Controller
          </div>
          <Badge 
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-600" : "bg-slate-600"}
          >
            {isConnected ? (
              <BluetoothConnected className="w-3 h-3 mr-1" />
            ) : (
              <Bluetooth className="w-3 h-3 mr-1" />
            )}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Controls */}
        {!isConnected ? (
          <div className="text-center space-y-4">
            <div className="text-slate-400">
              Connect your Bluetooth controller to control the robot
            </div>
            <Button 
              onClick={connectBluetooth}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Bluetooth className="w-4 h-4 mr-2" />
              {isConnecting ? "Connecting..." : "Connect Controller"}
            </Button>
          </div>
        ) : (
          <>
            {/* Device Info */}
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Device:</span>
                <span className="text-white font-medium">{deviceName}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Battery:</span>
                <span className={`font-mono ${getBatteryColor()}`}>
                  {batteryLevel.toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Signal:</span>
                <span className="text-green-400">Strong</span>
              </div>
            </div>

            {/* Power Control */}
            <div className="space-y-2">
              <label className="text-white text-sm flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Controller Power: {controllerPower[0]}%
              </label>
              <Slider
                value={controllerPower}
                onValueChange={setControllerPower}
                max={100}
                step={5}
                className="w-full"
                disabled={isEmergencyStop}
              />
            </div>

            {/* Directional Controls */}
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <Button
                onMouseDown={() => handleDirectionalControl('forward')}
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
                disabled={isEmergencyStop || !isRunning}
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
              <div></div>
              
              <Button
                onMouseDown={() => handleDirectionalControl('left')}
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
                disabled={isEmergencyStop || !isRunning}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                onMouseDown={() => handleDirectionalControl('backward')}
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
                disabled={isEmergencyStop || !isRunning}
              >
                <ArrowDown className="w-5 h-5" />
              </Button>
              <Button
                onMouseDown={() => handleDirectionalControl('right')}
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-slate-700 h-12"
                disabled={isEmergencyStop || !isRunning}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Rotation Controls */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onMouseDown={() => handleDirectionalControl('rotateLeft')}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 h-10"
                disabled={isEmergencyStop || !isRunning}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Rotate Left
              </Button>
              <Button
                onMouseDown={() => handleDirectionalControl('rotateRight')}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 h-10"
                disabled={isEmergencyStop || !isRunning}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate Right
              </Button>
            </div>

            {/* Controller Settings */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Haptic Feedback</span>
              <Button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                variant={vibrationEnabled ? "default" : "outline"}
                size="sm"
              >
                {vibrationEnabled ? "ON" : "OFF"}
              </Button>
            </div>

            {/* Disconnect */}
            <Button
              onClick={disconnectBluetooth}
              variant="destructive"
              className="w-full"
            >
              <Power className="w-4 h-4 mr-2" />
              Disconnect Controller
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BluetoothController;