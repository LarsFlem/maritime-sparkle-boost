import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendAnalysisProps {
  data: any[];
  dataKey: string;
  title: string;
  unit?: string;
}

export default function TrendAnalysis({ data, dataKey, title, unit = '' }: TrendAnalysisProps) {
  const analysis = useMemo(() => {
    if (data.length < 2) return null;

    // Calculate linear regression
    const n = data.length;
    const xValues = data.map((_, i) => i);
    const yValues = data.map(item => item[dataKey]);
    
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate trend line
    const trendData = data.map((item, i) => ({
      ...item,
      trend: slope * i + intercept
    }));
    
    // Calculate R-squared
    const meanY = sumY / n;
    const totalSumSquares = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
    const residualSumSquares = yValues.reduce((sum, y, i) => {
      const predicted = slope * i + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    // Forecast next 7 points
    const forecast = [];
    for (let i = n; i < n + 7; i++) {
      forecast.push({
        date: `Forecast ${i - n + 1}`,
        [dataKey]: slope * i + intercept,
        isForecast: true
      });
    }
    
    return {
      trendData,
      forecast,
      slope,
      rSquared,
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
    };
  }, [data, dataKey]);

  if (!analysis) return null;

  const combinedData = [...analysis.trendData, ...analysis.forecast];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <div className="flex items-center gap-2">
            {analysis.trend === 'increasing' && (
              <Badge variant="default" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Increasing
              </Badge>
            )}
            {analysis.trend === 'decreasing' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Decreasing
              </Badge>
            )}
            {analysis.trend === 'stable' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Minus className="h-3 w-3" />
                Stable
              </Badge>
            )}
          </div>
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          R² = {analysis.rSquared.toFixed(3)} | Slope = {analysis.slope.toFixed(3)} {unit}/day
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => [
                `${Number(value).toFixed(2)} ${unit}`,
                props.payload.isForecast ? 'Forecast' : 'Actual'
              ]}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line 
              type="monotone" 
              dataKey="trend" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={1}
              strokeDasharray="10,10"
              dot={false}
              name="Trend Line"
            />
            <ReferenceLine x={analysis.trendData.length - 1} stroke="hsl(var(--border))" strokeDasharray="2,2" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}