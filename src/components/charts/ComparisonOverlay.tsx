import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ComparisonOverlayProps {
  currentData: any[];
  previousData: any[];
  metric: string;
  metricLabel: string;
  unit: string;
  currentLabel?: string;
  previousLabel?: string;
}

export default function ComparisonOverlay({
  currentData, previousData, metric, metricLabel, unit,
  currentLabel = 'Current Period', previousLabel = 'Previous Period'
}: ComparisonOverlayProps) {
  const mergedData = useMemo(() => {
    const maxLen = Math.max(currentData.length, previousData.length);
    return Array.from({ length: maxLen }, (_, i) => ({
      index: i + 1,
      current: currentData[i]?.[metric] ?? null,
      previous: previousData[i]?.[metric] ?? null,
    }));
  }, [currentData, previousData, metric]);

  const stats = useMemo(() => {
    const curAvg = currentData.reduce((s, d) => s + (d[metric] || 0), 0) / (currentData.length || 1);
    const prevAvg = previousData.reduce((s, d) => s + (d[metric] || 0), 0) / (previousData.length || 1);
    const change = prevAvg !== 0 ? ((curAvg - prevAvg) / prevAvg) * 100 : 0;
    return { curAvg, prevAvg, change };
  }, [currentData, previousData, metric]);

  const ChangeIcon = stats.change > 1 ? ArrowUpRight : stats.change < -1 ? ArrowDownRight : Minus;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>Period Comparison — {metricLabel}</span>
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" />
              {currentLabel}: {stats.curAvg.toFixed(1)} {unit}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <span className="h-2 w-2 rounded-full inline-block" style={{ background: 'hsl(215, 14%, 50%)' }} />
              {previousLabel}: {stats.prevAvg.toFixed(1)} {unit}
            </Badge>
            <span className={`flex items-center gap-0.5 font-semibold ${stats.change > 1 ? 'text-green-500' : stats.change < -1 ? 'text-red-500' : 'text-muted-foreground'}`}>
              <ChangeIcon className="h-3.5 w-3.5" />
              {Math.abs(stats.change).toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="index" label={{ value: 'Day #', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }} tick={{ fontSize: 10 }} />
            <YAxis label={{ value: unit, angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} tick={{ fontSize: 10 }} />
            <Tooltip
              content={({ payload, label }) => {
                if (!payload?.length) return null;
                return (
                  <div className="bg-background border border-border rounded p-2.5 text-sm shadow-md">
                    <p className="text-xs text-muted-foreground mb-1">Day {label}</p>
                    {payload.map((p: any) => (
                      <p key={p.dataKey} style={{ color: p.color }}>
                        {p.name}: <strong>{p.value?.toFixed(1)} {unit}</strong>
                      </p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend />
            <ReferenceLine y={stats.curAvg} stroke="hsl(var(--primary))" strokeDasharray="5 5" strokeOpacity={0.5} />
            <ReferenceLine y={stats.prevAvg} stroke="hsl(215, 14%, 50%)" strokeDasharray="5 5" strokeOpacity={0.5} />
            <Line type="monotone" dataKey="current" name={currentLabel} stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="previous" name={previousLabel} stroke="hsl(215, 14%, 50%)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} opacity={0.7} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
