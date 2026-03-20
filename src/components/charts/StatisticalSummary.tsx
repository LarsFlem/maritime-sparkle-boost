import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatisticalSummaryProps {
  data: any[];
  metrics: { key: string; label: string; unit: string; decimals?: number }[];
}

function calcStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[n - 1];
  const p25 = sorted[Math.floor(n * 0.25)];
  const p50 = sorted[Math.floor(n * 0.5)];
  const p75 = sorted[Math.floor(n * 0.75)];
  
  // Recent trend: compare last 20% vs first 20%
  const slice = Math.max(Math.floor(n * 0.2), 1);
  const recentAvg = sorted.slice(-slice).reduce((a, b) => a + b, 0) / slice;
  const earlyAvg = sorted.slice(0, slice).reduce((a, b) => a + b, 0) / slice;
  const changePct = earlyAvg !== 0 ? ((recentAvg - earlyAvg) / earlyAvg) * 100 : 0;

  return { mean, stdDev, min, max, p25, p50, p75, changePct };
}

export default function StatisticalSummary({ data, metrics }: StatisticalSummaryProps) {
  const stats = useMemo(() => {
    return metrics.map(m => {
      const values = data.map(d => d[m.key]).filter((v): v is number => typeof v === 'number');
      return { ...m, ...calcStats(values) };
    });
  }, [data, metrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Statistical Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Metric</th>
                <th className="text-right py-2 px-2 font-medium">Mean</th>
                <th className="text-right py-2 px-2 font-medium">Std Dev</th>
                <th className="text-right py-2 px-2 font-medium">Min</th>
                <th className="text-right py-2 px-2 font-medium">P25</th>
                <th className="text-right py-2 px-2 font-medium">P50</th>
                <th className="text-right py-2 px-2 font-medium">P75</th>
                <th className="text-right py-2 px-2 font-medium">Max</th>
                <th className="text-right py-2 pl-2 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => {
                const d = s.decimals ?? 1;
                return (
                  <tr key={s.key} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{s.label}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums">{s.mean.toFixed(d)} {s.unit}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums text-muted-foreground">±{s.stdDev.toFixed(d)}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums">{s.min.toFixed(d)}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums">{s.p25.toFixed(d)}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums font-medium">{s.p50.toFixed(d)}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums">{s.p75.toFixed(d)}</td>
                    <td className="text-right py-2.5 px-2 tabular-nums">{s.max.toFixed(d)}</td>
                    <td className="text-right py-2.5 pl-2">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        s.changePct > 2 ? 'text-green-500' : s.changePct < -2 ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {s.changePct > 2 ? <ArrowUpRight className="h-3 w-3" /> : 
                         s.changePct < -2 ? <ArrowDownRight className="h-3 w-3" /> : 
                         <Minus className="h-3 w-3" />}
                        {Math.abs(s.changePct).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
