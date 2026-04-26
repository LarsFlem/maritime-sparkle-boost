import { AlertTriangle, AlertOctagon, Info, ShieldCheck } from "lucide-react";

export type AlarmSeverity = "critical" | "warning" | "info";

export interface CraneAlarm {
  id: string;
  severity: AlarmSeverity;
  code: string;
  msg: string;
  ts: number;
}

interface CraneAlarmsProps {
  alarms: CraneAlarm[];
  labels: {
    allClear: string;
    title: string;
  };
}

const sevConfig: Record<
  AlarmSeverity,
  { color: string; icon: React.ReactNode; tag: string }
> = {
  critical: {
    color: "hsl(0, 70%, 60%)",
    icon: <AlertOctagon className="w-3.5 h-3.5" />,
    tag: "CRIT",
  },
  warning: {
    color: "hsl(38, 85%, 60%)",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    tag: "WARN",
  },
  info: {
    color: "hsl(200, 100%, 65%)",
    icon: <Info className="w-3.5 h-3.5" />,
    tag: "INFO",
  },
};

const formatClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const CraneAlarms = ({ alarms, labels }: CraneAlarmsProps) => {
  if (alarms.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground/70">
        <ShieldCheck className="w-4 h-4" style={{ color: "hsl(180, 70%, 55%)" }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
          {labels.allClear}
        </span>
      </div>
    );
  }

  const visible = alarms.slice(0, 5);
  const overflow = alarms.length - visible.length;

  return (
    <div className="space-y-1">
      {visible.map((a) => {
        const cfg = sevConfig[a.severity];
        return (
          <div
            key={a.id}
            className="flex items-start gap-2 px-2 py-1.5 rounded border border-border/30 bg-background/30"
            style={{ borderLeftColor: cfg.color, borderLeftWidth: 2 }}
          >
            <div className="mt-0.5 shrink-0" style={{ color: cfg.color }}>
              {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="font-mono text-[9px] font-semibold tracking-wider"
                  style={{ color: cfg.color }}
                >
                  {cfg.tag}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/70">
                  {a.code}
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/45 ml-auto tabular-nums">
                  {formatClock(a.ts)}
                </span>
              </div>
              <p className="font-mono text-[10px] text-foreground/90 leading-tight">
                {a.msg}
              </p>
            </div>
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="text-center font-mono text-[9px] text-muted-foreground/60 uppercase tracking-wider pt-1">
          + {overflow} more
        </div>
      )}
    </div>
  );
};

export default CraneAlarms;
