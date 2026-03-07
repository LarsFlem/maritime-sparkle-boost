import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Power, Zap, Gauge } from "lucide-react";

interface IOMonitorProps {
  isRunning: boolean;
  position: number;
}

interface DigitalIO {
  id: string;
  label: string;
  state: boolean;
}

interface AnalogIO {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
}

export const IOMonitor = ({ isRunning, position }: IOMonitorProps) => {
  const [digitalInputs, setDigitalInputs] = useState<DigitalIO[]>([
    { id: 'di1', label: 'Proximity Sensor 1', state: false },
    { id: 'di2', label: 'Proximity Sensor 2', state: false },
    { id: 'di3', label: 'Limit Switch Left', state: false },
    { id: 'di4', label: 'Limit Switch Right', state: false },
    { id: 'di5', label: 'Safety Gate', state: true },
    { id: 'di6', label: 'Air Pressure OK', state: true },
  ]);

  const [digitalOutputs, setDigitalOutputs] = useState<DigitalIO[]>([
    { id: 'do1', label: 'Motor Enable', state: false },
    { id: 'do2', label: 'Brake Release', state: false },
    { id: 'do3', label: 'Valve 1', state: false },
    { id: 'do4', label: 'Valve 2', state: false },
    { id: 'do5', label: 'Status LED Green', state: false },
    { id: 'do6', label: 'Status LED Red', state: true },
  ]);

  const [analogInputs, setAnalogInputs] = useState<AnalogIO[]>([
    { id: 'ai1', label: 'Position Sensor', value: 0, unit: 'mm', min: 0, max: 100 },
    { id: 'ai2', label: 'Force Sensor', value: 0, unit: 'N', min: 0, max: 500 },
    { id: 'ai3', label: 'Current Sensor', value: 0, unit: 'A', min: 0, max: 10 },
    { id: 'ai4', label: 'Voltage Monitor', value: 24, unit: 'V', min: 0, max: 30 },
  ]);

  const [analogOutputs, setAnalogOutputs] = useState<AnalogIO[]>([
    { id: 'ao1', label: 'Speed Reference', value: 50, unit: '%', min: 0, max: 100 },
    { id: 'ao2', label: 'Pressure Setpoint', value: 1.5, unit: 'bar', min: 0, max: 5 },
  ]);

  // Simulate I/O changes based on system state
  useEffect(() => {
    setDigitalInputs(prev => prev.map(input => {
      if (input.id === 'di1') return { ...input, state: position > 25 };
      if (input.id === 'di2') return { ...input, state: position > 75 };
      if (input.id === 'di3') return { ...input, state: position < 5 };
      if (input.id === 'di4') return { ...input, state: position > 95 };
      return input;
    }));

    setDigitalOutputs(prev => prev.map(output => {
      if (output.id === 'do1') return { ...output, state: isRunning };
      if (output.id === 'do2') return { ...output, state: isRunning };
      if (output.id === 'do3') return { ...output, state: position > 50 && isRunning };
      if (output.id === 'do5') return { ...output, state: isRunning };
      if (output.id === 'do6') return { ...output, state: !isRunning };
      return output;
    }));

    setAnalogInputs(prev => prev.map(input => {
      if (input.id === 'ai1') return { ...input, value: position };
      if (input.id === 'ai2') return { ...input, value: isRunning ? 150 + Math.random() * 100 : 0 };
      if (input.id === 'ai3') return { ...input, value: isRunning ? 3 + Math.random() * 2 : 0 };
      if (input.id === 'ai4') return { ...input, value: 24 + (Math.random() - 0.5) * 0.5 };
      return input;
    }));
  }, [isRunning, position]);

  const IOIndicator = ({ label, state }: { label: string; state: boolean }) => (
    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
      <span className="text-sm text-slate-300">{label}</span>
      <Badge variant={state ? "default" : "secondary"} className={state ? "bg-green-600" : "bg-slate-600"}>
        {state ? 'ON' : 'OFF'}
      </Badge>
    </div>
  );

  const AnalogDisplay = ({ label, value, unit, min, max }: AnalogIO) => (
    <div className="p-3 bg-slate-700/30 rounded">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-white font-mono">{value.toFixed(2)} {unit}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40 shadow-[var(--shadow-ocean)] hover:border-primary/30 transition-all duration-500">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Zap className="w-5 h-5 mr-2" />
          I/O Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="digital-in" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-700">
            <TabsTrigger value="digital-in" className="text-xs">DI</TabsTrigger>
            <TabsTrigger value="digital-out" className="text-xs">DO</TabsTrigger>
            <TabsTrigger value="analog-in" className="text-xs">AI</TabsTrigger>
            <TabsTrigger value="analog-out" className="text-xs">AO</TabsTrigger>
          </TabsList>

          <TabsContent value="digital-in" className="space-y-2 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Power className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Digital Inputs</span>
              <Badge variant="secondary">{digitalInputs.filter(i => i.state).length}/{digitalInputs.length}</Badge>
            </div>
            {digitalInputs.map(input => (
              <IOIndicator key={input.id} label={input.label} state={input.state} />
            ))}
          </TabsContent>

          <TabsContent value="digital-out" className="space-y-2 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Power className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Digital Outputs</span>
              <Badge variant="secondary">{digitalOutputs.filter(o => o.state).length}/{digitalOutputs.length}</Badge>
            </div>
            {digitalOutputs.map(output => (
              <IOIndicator key={output.id} label={output.label} state={output.state} />
            ))}
          </TabsContent>

          <TabsContent value="analog-in" className="space-y-3 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-white">Analog Inputs</span>
            </div>
            {analogInputs.map(input => (
              <AnalogDisplay key={input.id} {...input} />
            ))}
          </TabsContent>

          <TabsContent value="analog-out" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Analog Outputs</span>
            </div>
            {analogOutputs.map(output => (
              <div key={output.id} className="p-3 bg-slate-700/30 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">{output.label}</span>
                  <span className="text-white font-mono">{output.value.toFixed(2)} {output.unit}</span>
                </div>
                <Slider
                  value={[output.value]}
                  onValueChange={(val) => {
                    setAnalogOutputs(prev => prev.map(o => 
                      o.id === output.id ? { ...o, value: val[0] } : o
                    ));
                  }}
                  min={output.min}
                  max={output.max}
                  step={0.1}
                  className="w-full"
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
