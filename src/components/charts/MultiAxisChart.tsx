import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MetricConfig {
  key: string;
  name: string;
  type: 'line' | 'bar';
  color: string;
  yAxisId?: 'left' | 'right';
}

interface MultiAxisChartProps {
  data: any[];
  title: string;
  metrics: MetricConfig[];
  leftAxisLabel?: string;
  rightAxisLabel?: string;
}

export default function MultiAxisChart({ 
  data, 
  title, 
  metrics, 
  leftAxisLabel = 'Primary Axis',
  rightAxisLabel = 'Secondary Axis'
}: MultiAxisChartProps) {
  const hasRightAxis = metrics.some(m => m.yAxisId === 'right');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" label={{ value: leftAxisLabel, angle: -90, position: 'insideLeft' }} />
            {hasRightAxis && (
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                label={{ value: rightAxisLabel, angle: 90, position: 'insideRight' }} 
              />
            )}
            <Tooltip />
            <Legend />
            {metrics.map((metric) => 
              metric.type === 'line' ? (
                <Line
                  key={metric.key}
                  yAxisId={metric.yAxisId || 'left'}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  strokeWidth={2}
                  name={metric.name}
                  connectNulls={false}
                />
              ) : (
                <Bar
                  key={metric.key}
                  yAxisId={metric.yAxisId || 'left'}
                  dataKey={metric.key}
                  fill={metric.color}
                  name={metric.name}
                  fillOpacity={0.7}
                />
              )
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}