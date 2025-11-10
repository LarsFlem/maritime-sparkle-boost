import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Database, TrendingUp } from "lucide-react";

interface DataPoint {
  timestamp: string;
  temperature: number;
  pressure: number;
  speed: number;
  motorRpm: number;
  vibration: number;
  power: number;
}

interface DataLoggerProps {
  currentData: {
    temperature: number;
    pressure: number;
    speed: number;
    motorRpm: number;
    vibration: number;
    power: number;
  };
  isRunning: boolean;
}

export const DataLogger = ({ currentData, isRunning }: DataLoggerProps) => {
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'pressure' | 'speed' | 'vibration'>('temperature');

  useEffect(() => {
    if (isLogging) {
      const interval = setInterval(() => {
        const newPoint: DataPoint = {
          timestamp: new Date().toLocaleTimeString(),
          ...currentData
        };
        
        setDataHistory(prev => {
          const updated = [...prev, newPoint];
          return updated.slice(-50); // Keep last 50 points
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLogging, currentData]);

  const exportData = () => {
    const csv = [
      ['Timestamp', 'Temperature', 'Pressure', 'Speed', 'Motor RPM', 'Vibration', 'Power'],
      ...dataHistory.map(d => [
        d.timestamp,
        d.temperature.toFixed(2),
        d.pressure.toFixed(2),
        d.speed.toFixed(2),
        d.motorRpm.toFixed(0),
        d.vibration.toFixed(2),
        d.power.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plc-data-${new Date().toISOString()}.csv`;
    a.click();
  };

  const metrics = [
    { key: 'temperature', label: 'Temperature', color: '#f97316', unit: '°C' },
    { key: 'pressure', label: 'Pressure', color: '#3b82f6', unit: 'bar' },
    { key: 'speed', label: 'Speed', color: '#22c55e', unit: '%' },
    { key: 'vibration', label: 'Vibration', color: '#a855f7', unit: 'mm/s' }
  ] as const;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Database className="w-5 h-5 mr-2" />
            Data Logger
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isLogging ? "destructive" : "default"}
              onClick={() => setIsLogging(!isLogging)}
            >
              {isLogging ? 'Stop Logging' : 'Start Logging'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportData}
              disabled={dataHistory.length === 0}
              className="border-slate-600 text-white"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {metrics.map(metric => (
              <Badge
                key={metric.key}
                variant={selectedMetric === metric.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedMetric(metric.key)}
              >
                {metric.label}
              </Badge>
            ))}
          </div>
          <Badge variant="secondary">
            {dataHistory.length} samples
          </Badge>
        </div>

        {dataHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dataHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#94a3b8"
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {metrics.map(metric => 
                selectedMetric === metric.key && (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    name={`${metric.label} (${metric.unit})`}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center bg-slate-700/30 rounded-lg">
            <div className="text-center text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Start logging to view historical data</p>
            </div>
          </div>
        )}

        {/* Current readings */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-700/50 p-3 rounded">
            <div className="text-xs text-slate-400">Temperature</div>
            <div className="text-lg font-mono text-white">{currentData.temperature.toFixed(1)}°C</div>
          </div>
          <div className="bg-slate-700/50 p-3 rounded">
            <div className="text-xs text-slate-400">Vibration</div>
            <div className="text-lg font-mono text-white">{currentData.vibration.toFixed(2)} mm/s</div>
          </div>
          <div className="bg-slate-700/50 p-3 rounded">
            <div className="text-xs text-slate-400">Power</div>
            <div className="text-lg font-mono text-white">{currentData.power.toFixed(1)} kW</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
