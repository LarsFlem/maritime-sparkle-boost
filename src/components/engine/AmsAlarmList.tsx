import { BellOff, Check } from "lucide-react";

/**
 * IMO-style AMS alarm handling: alarms are ACTIVE-UNACK (blinking),
 * ACTIVE-ACK (steady) or CLEARED-UNACK (condition gone, still needs
 * acknowledge). Acknowledging a cleared alarm removes it from the list.
 */
export type AmsAlarmState = "activeUnack" | "activeAck" | "clearedUnack";

export interface AmsAlarm {
  id: string;
  tag: string;
  text: string;
  severity: "alarm" | "warning";
  state: AmsAlarmState;
  ts: number;
}

interface AmsAlarmListProps {
  alarms: AmsAlarm[];
  hornActive: boolean;
  onAckAll: () => void;
  onSilence: () => void;
  labels: {
    ackAll: string;
    silence: string;
    allClear: string;
    stateActiveUnack: string;
    stateActiveAck: string;
    stateClearedUnack: string;
  };
}

const fmtClock = (ms: number) => {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const AmsAlarmList = ({ alarms, hornActive, onAckAll, onSilence, labels }: AmsAlarmListProps) => {
  const anyUnack = alarms.some((a) => a.state !== "activeAck");

  return (
    <div className="flex flex-col h-full">
      {/* Horn + buttons */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onSilence}
          disabled={!hornActive}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border transition-colors ${
            hornActive
              ? "border-destructive text-destructive bg-destructive/10 alarm-pulse"
              : "border-border text-muted-foreground/50"
          }`}
        >
          <BellOff className="w-3 h-3" /> {labels.silence}
        </button>
        <button
          onClick={onAckAll}
          disabled={!anyUnack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-3 h-3" /> {labels.ackAll}
        </button>
        {hornActive && (
          <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-destructive animate-pulse">
            ♪ HORN
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 space-y-1 overflow-y-auto max-h-[300px] pr-0.5">
        {alarms.length === 0 && (
          <div className="flex items-center gap-2 py-6 justify-center">
            <span className="w-2 h-2 rounded-full bg-[hsl(150,70%,55%)]" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{labels.allClear}</span>
          </div>
        )}
        {alarms.map((a) => {
          const col = a.state === "clearedUnack"
            ? "hsl(150, 70%, 55%)"
            : a.severity === "alarm"
            ? "hsl(0, 70%, 55%)"
            : "hsl(38, 85%, 60%)";
          const stateLabel = a.state === "activeUnack"
            ? labels.stateActiveUnack
            : a.state === "activeAck"
            ? labels.stateActiveAck
            : labels.stateClearedUnack;
          return (
            <div
              key={a.id}
              className={`flex items-start gap-2 px-2 py-1.5 rounded border ${
                a.state === "activeUnack" ? "animate-pulse" : ""
              }`}
              style={{ borderColor: `${col}40`, background: `${col}0d` }}
            >
              <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: col }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] font-semibold" style={{ color: col }}>{a.tag}</span>
                  <span className="font-mono text-[8px] text-muted-foreground/50 tabular-nums">{fmtClock(a.ts)}</span>
                  <span className="ml-auto font-mono text-[8px] uppercase tracking-wider shrink-0" style={{ color: col, opacity: 0.85 }}>
                    {stateLabel}
                  </span>
                </div>
                <p className="font-mono text-[9.5px] text-muted-foreground leading-tight">{a.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmsAlarmList;
