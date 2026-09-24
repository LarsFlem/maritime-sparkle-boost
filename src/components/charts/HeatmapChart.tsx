import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapChartProps {
  data: any[];
  title: string;
  metric: string;
  unit?: string;
}

export default function HeatmapChart({ data, title, metric, unit = '' }: HeatmapChartProps) {
  const heatmapData = useMemo(() => {
    // Group data by day of week and simulate hourly distribution
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const grid: { day: string; hour: number; value: number }[] = [];
    
    days.forEach((day, di) => {
      hours.forEach(hour => {
        // Use data to create realistic hourly patterns
        const dayData = data.filter((_, i) => i % 7 === di);
        const baseValue = dayData.length > 0 
          ? dayData.reduce((s, d) => s + d[metric], 0) / dayData.length 
          : 0;
        // Apply hourly pattern: lower at night, higher during day
        const hourFactor = Math.sin((hour - 6) * Math.PI / 12) * 0.3 + 0.7;
        const noise = (Math.random() - 0.5) * baseValue * 0.15;
        const value = Math.max(0, baseValue * hourFactor + noise);
        grid.push({ day, hour, value });
      });
    });

    const values = grid.map(g => g.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { grid, days, hours, min, max };
  }, [data, metric]);

  const getColor = (value: number) => {
    const t = heatmapData.max !== heatmapData.min 
      ? (value - heatmapData.min) / (heatmapData.max - heatmapData.min)
      : 0;
    // Dark blue → teal → green → yellow
    if (t < 0.25) return `hsl(220, 60%, ${20 + t * 4 * 30}%)`;
    if (t < 0.5) return `hsl(${220 - (t - 0.25) * 4 * 40}, 60%, 50%)`;
    if (t < 0.75) return `hsl(${180 - (t - 0.5) * 4 * 60}, 70%, 45%)`;
    return `hsl(${60 - (t - 0.75) * 4 * 20}, 80%, ${45 + (t - 0.75) * 4 * 10}%)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={0}>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex ml-10 mb-1">
                {heatmapData.hours.filter((_, i) => i % 3 === 0).map(h => (
                  <div key={h} className="text-[10px] text-muted-foreground" style={{ width: `${100 / 8}%` }}>
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>
              {/* Grid */}
              {heatmapData.days.map(day => (
                <div key={day} className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs text-muted-foreground w-9 text-right shrink-0">{day}</span>
                  <div className="flex flex-1 gap-px">
                    {heatmapData.grid
                      .filter(g => g.day === day)
                      .map((cell, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex-1 h-6 rounded-sm cursor-crosshair transition-transform hover:scale-y-125"
                              style={{ backgroundColor: getColor(cell.value) }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {day} {String(cell.hour).padStart(2, '0')}:00 — {cell.value.toFixed(1)} {unit}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </div>
              ))}
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-muted-foreground">
                <span>Low</span>
                <div className="flex gap-px">
                  {[0, 0.25, 0.5, 0.75, 1].map(t => {
                    const v = heatmapData.min + t * (heatmapData.max - heatmapData.min);
                    return <div key={t} className="w-5 h-3 rounded-sm" style={{ backgroundColor: getColor(v) }} />;
                  })}
                </div>
                <span>High</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
