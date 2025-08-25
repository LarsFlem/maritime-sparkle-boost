import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CorrelationChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  title: string;
  xLabel: string;
  yLabel: string;
}

export default function CorrelationChart({ data, xKey, yKey, title, xLabel, yLabel }: CorrelationChartProps) {
  // Calculate correlation coefficient
  const calculateCorrelation = (data: any[], x: string, y: string) => {
    const n = data.length;
    const sumX = data.reduce((sum, item) => sum + item[x], 0);
    const sumY = data.reduce((sum, item) => sum + item[y], 0);
    const sumXY = data.reduce((sum, item) => sum + item[x] * item[y], 0);
    const sumX2 = data.reduce((sum, item) => sum + item[x] * item[x], 0);
    const sumY2 = data.reduce((sum, item) => sum + item[y] * item[y], 0);
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return isNaN(correlation) ? 0 : correlation;
  };

  const correlation = calculateCorrelation(data, xKey, yKey);
  const correlationStrength = Math.abs(correlation) > 0.7 ? 'Strong' : 
                             Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="text-sm">
            <span className="text-muted-foreground">Correlation: </span>
            <span className={`font-bold ${
              Math.abs(correlation) > 0.7 ? 'text-primary' : 
              Math.abs(correlation) > 0.4 ? 'text-yellow-500' : 'text-muted-foreground'
            }`}>
              {correlation.toFixed(3)} ({correlationStrength})
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} name={xLabel} />
            <YAxis dataKey={yKey} name={yLabel} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [value, name]}
              labelFormatter={() => ''}
            />
            <Scatter dataKey={yKey} fill="hsl(var(--primary))" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}