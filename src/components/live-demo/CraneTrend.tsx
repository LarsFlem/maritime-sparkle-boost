import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface TrendPoint {
  t: number;        // timestamp ms
  load: number | null;     // tonnes
  sway: number | null;     // degrees
}

interface CraneTrendProps {
  data: TrendPoint[];
  windowSeconds: number;
  labels: { load: string; sway: string };
}

const formatClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const CraneTrend = ({ data, windowSeconds, labels }: CraneTrendProps) => {
  const now = Date.now();
  const domainStart = now - windowSeconds * 1000;
  const domainEnd = now;

  // 6 evenly spaced ticks
  const ticks: number[] = [];
  for (let i = 0; i < 6; i++) {
    ticks.push(domainStart + ((domainEnd - domainStart) * i) / 5);
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={[domainStart, domainEnd]}
          ticks={ticks}
          allowDataOverflow
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 9, fontFamily: "monospace" }}
          tickFormatter={formatClock}
        />
        <YAxis
          yAxisId="load"
          stroke="hsl(38, 85%, 60%)"
          tick={{ fontSize: 9, fontFamily: "monospace" }}
          domain={[0, 14]}
          width={28}
          label={{
            value: "t",
            angle: -90,
            position: "insideLeft",
            style: { fill: "hsl(38, 85%, 60%)", fontSize: 9, fontFamily: "monospace" },
          }}
        />
        <YAxis
          yAxisId="sway"
          orientation="right"
          stroke="hsl(180, 70%, 55%)"
          tick={{ fontSize: 9, fontFamily: "monospace" }}
          domain={[-12, 12]}
          width={28}
          label={{
            value: "°",
            angle: 90,
            position: "insideRight",
            style: { fill: "hsl(180, 70%, 55%)", fontSize: 9, fontFamily: "monospace" },
          }}
        />
        <Tooltip
          labelFormatter={(label: number) => formatClock(label)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
            fontFamily: "monospace",
            fontSize: 11,
            borderRadius: 8,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
          iconType="line"
        />
        <Line
          yAxisId="load"
          type="linear"
          dataKey="load"
          name={labels.load}
          stroke="hsl(38, 85%, 60%)"
          strokeWidth={1.6}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          yAxisId="sway"
          type="linear"
          dataKey="sway"
          name={labels.sway}
          stroke="hsl(180, 70%, 55%)"
          strokeWidth={1.4}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CraneTrend;
