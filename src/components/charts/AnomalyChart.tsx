import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';

interface AnomalyChartProps {
  data: any[];
  dataKey: string;
  title: string;
  unit?: string;
  sensitivity?: number; // number of std deviations
}

export default function AnomalyChart({ data, dataKey, title, unit = '', sensitivity = 2 }: AnomalyChartProps) {
  const analysis = useMemo(() => {
    const values = data.map(d => d[dataKey]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
    
    const upperBound = mean + sensitivity * stdDev;
    const lowerBound = mean - sensitivity * stdDev;

    const enriched = data.map((d, i) => {
      const val = d[dataKey];
      const isAnomaly = val > upperBound || val < lowerBound;
      return {
        ...d,
        upperBound,
        lowerBound,
        mean,
        isAnomaly,
        anomalyValue: isAnomaly ? val : undefined,
      };
    });

    const anomalyCount = enriched.filter(d => d.isAnomaly).length;

    return { enriched, anomalyCount, mean, stdDev, upperBound, lowerBound };
  }, [data, dataKey, sensitivity]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {title}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={analysis.anomalyCount > 5 ? 'destructive' : analysis.anomalyCount > 0 ? 'secondary' : 'default'}>
              {analysis.anomalyCount} anomalies detected
            </Badge>
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          μ = {analysis.mean.toFixed(1)} {unit} | σ = {analysis.stdDev.toFixed(1)} {unit} | Threshold: ±{sensitivity}σ
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={analysis.enriched}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: any, name: string) => {
                if (name === 'Normal Band') return null;
                return [`${Number(value).toFixed(2)} ${unit}`, name];
              }}
            />
            {/* Normal band */}
            <Area
              dataKey="upperBound"
              stroke="none"
              fill="hsl(var(--primary))"
              fillOpacity={0.05}
              name="Normal Band"
            />
            <Area
              dataKey="lowerBound"
              stroke="none"
              fill="hsl(var(--background))"
              fillOpacity={1}
              name="Normal Band"
            />
            {/* Mean line */}
            <Line
              dataKey="mean"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={1}
              strokeDasharray="6 4"
              dot={false}
              name="Mean"
            />
            {/* Bounds */}
            <Line dataKey="upperBound" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Upper Bound" />
            <Line dataKey="lowerBound" stroke="hsl(var(--destructive))" strokeWidth={1} strokeDasharray="3 3" dot={false} name="Lower Bound" />
            {/* Actual data */}
            <Line
              dataKey={dataKey}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Actual"
            />
            {/* Anomaly markers */}
            <Line
              dataKey="anomalyValue"
              stroke="none"
              dot={{ r: 5, fill: 'hsl(var(--destructive))', stroke: 'hsl(var(--destructive))' }}
              name="Anomaly"
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
