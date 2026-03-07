import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Bell, CheckCircle, XCircle, Info } from "lucide-react";

export interface Alarm {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  active: boolean;
}

interface AlarmSystemProps {
  temperature: number;
  pressure: number;
  vibration: number;
  emergencyStop: boolean;
}

export const AlarmSystem = ({ temperature, pressure, vibration, emergencyStop }: AlarmSystemProps) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmHistory, setAlarmHistory] = useState<Alarm[]>([]);

  useEffect(() => {
    const newAlarms: Alarm[] = [];

    // Check for alarm conditions
    if (temperature > 26) {
      const existingAlarm = alarms.find(a => a.message.includes('High Temperature'));
      if (!existingAlarm) {
        newAlarms.push({
          id: `temp-${Date.now()}`,
          type: temperature > 28 ? 'critical' : 'warning',
          message: `High Temperature: ${temperature.toFixed(1)}°C`,
          timestamp: new Date(),
          acknowledged: false,
          active: true
        });
      }
    }

    if (pressure > 1.6) {
      const existingAlarm = alarms.find(a => a.message.includes('High Pressure'));
      if (!existingAlarm) {
        newAlarms.push({
          id: `press-${Date.now()}`,
          type: pressure > 1.8 ? 'critical' : 'warning',
          message: `High Pressure: ${pressure.toFixed(2)} bar`,
          timestamp: new Date(),
          acknowledged: false,
          active: true
        });
      }
    }

    if (vibration > 3) {
      const existingAlarm = alarms.find(a => a.message.includes('Vibration'));
      if (!existingAlarm) {
        newAlarms.push({
          id: `vib-${Date.now()}`,
          type: vibration > 4 ? 'critical' : 'warning',
          message: `High Vibration: ${vibration.toFixed(2)} mm/s`,
          timestamp: new Date(),
          acknowledged: false,
          active: true
        });
      }
    }

    if (emergencyStop) {
      const existingAlarm = alarms.find(a => a.message.includes('Emergency Stop'));
      if (!existingAlarm) {
        newAlarms.push({
          id: `estop-${Date.now()}`,
          type: 'critical',
          message: 'Emergency Stop Activated',
          timestamp: new Date(),
          acknowledged: false,
          active: true
        });
      }
    }

    if (newAlarms.length > 0) {
      setAlarms(prev => [...prev, ...newAlarms]);
      setAlarmHistory(prev => [...newAlarms, ...prev].slice(0, 100));
    }

    // Clear alarms when conditions return to normal
    setAlarms(prev => prev.map(alarm => {
      if (alarm.message.includes('Temperature') && temperature <= 26) {
        return { ...alarm, active: false };
      }
      if (alarm.message.includes('Pressure') && pressure <= 1.6) {
        return { ...alarm, active: false };
      }
      if (alarm.message.includes('Vibration') && vibration <= 3) {
        return { ...alarm, active: false };
      }
      if (alarm.message.includes('Emergency Stop') && !emergencyStop) {
        return { ...alarm, active: false };
      }
      return alarm;
    }).filter(alarm => alarm.active || !alarm.acknowledged));

  }, [temperature, pressure, vibration, emergencyStop]);

  const acknowledgeAlarm = (id: string) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === id ? { ...alarm, acknowledged: true } : alarm
    ).filter(alarm => alarm.active));
  };

  const acknowledgeAll = () => {
    setAlarms(prev => prev.map(alarm => ({ ...alarm, acknowledged: true }))
      .filter(alarm => alarm.active));
  };

  const activeAlarms = alarms.filter(a => a.active && !a.acknowledged);
  const criticalCount = activeAlarms.filter(a => a.type === 'critical').length;
  const warningCount = activeAlarms.filter(a => a.type === 'warning').length;

  const getAlarmIcon = (type: Alarm['type']) => {
    switch (type) {
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
    }
  };

  const getAlarmColor = (type: Alarm['type']) => {
    switch (type) {
      case 'critical':
        return 'text-red-400 bg-red-900/20 border-red-800';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'info':
        return 'text-blue-400 bg-blue-900/20 border-blue-800';
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/40 shadow-[var(--shadow-ocean)] hover:border-primary/30 transition-all duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-white">
            <Bell className="w-5 h-5 mr-2" />
            Alarm System
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="destructive" className="bg-red-600">
              {criticalCount} Critical
            </Badge>
            <Badge variant="secondary" className="bg-yellow-600">
              {warningCount} Warning
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeAlarms.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={acknowledgeAll}
            className="w-full border-slate-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Acknowledge All
          </Button>
        )}

        <ScrollArea className="h-[300px] pr-4">
          {activeAlarms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[250px] text-slate-400">
              <CheckCircle className="w-12 h-12 mb-2 opacity-50" />
              <p>No active alarms</p>
              <p className="text-sm mt-1">System operating normally</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlarms.map(alarm => (
                <div
                  key={alarm.id}
                  className={`p-3 rounded-lg border ${getAlarmColor(alarm.type)} animate-in fade-in slide-in-from-top-2`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {getAlarmIcon(alarm.type)}
                      <div>
                        <div className="font-medium">{alarm.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {alarm.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlarm(alarm.id)}
                      className="h-7 px-2"
                    >
                      ACK
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {alarmHistory.length > 0 && (
          <div className="pt-4 border-t border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Recent History</h4>
            <ScrollArea className="h-[150px]">
              <div className="space-y-1">
                {alarmHistory.slice(0, 10).map(alarm => (
                  <div
                    key={alarm.id}
                    className="text-xs text-slate-400 flex justify-between py-1"
                  >
                    <span>{alarm.message}</span>
                    <span>{alarm.timestamp.toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
