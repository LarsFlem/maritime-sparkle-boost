import { Power, Flame, Timer, Gauge as GaugeIcon } from "lucide-react";
import HMIPanel from "@/components/hmi/HMIPanel";
import { GensetView } from "./pmsTypes";

interface GensetCardProps {
  genset: GensetView;
  onStart: () => void;
  onStop: () => void;
  onTrip: () => void;
  onResetFault: () => void;
  labels: {
    start: string;
    stop: string;
    trip: string;
    resetFault: string;
    load: string;
    state: Record<GensetView["state"], string>;
  };
}

const STATE_COLOR: Record<GensetView["state"], string> = {
  standby: "hsl(210, 15%, 50%)",
  starting: "hsl(38, 85%, 60%)",
  sync: "hsl(38, 85%, 60%)",
  online: "hsl(200, 100%, 60%)",
  cooldown: "hsl(38, 85%, 60%)",
  fault: "hsl(0, 70%, 55%)",
};

const GensetCard = ({ genset: g, onStart, onStop, onTrip, onResetFault, labels }: GensetCardProps) => {
  const col = STATE_COLOR[g.state];
  const loadPct = g.state === "online" ? (g.kw / g.ratedKw) * 100 : 0;
  const loadColor = loadPct > 90 ? "hsl(0, 70%, 55%)" : loadPct > 80 ? "hsl(38, 85%, 60%)" : "hsl(200, 100%, 60%)";

  return (
    <HMIPanel title={`${g.id} — ${g.name}`} glowColor={col}>
      <div className="space-y-3">
        {/* State + breaker */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: col,
                boxShadow: `0 0 6px ${col}90`,
              }}
            />
            <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color: col }}>
              {labels.state[g.state]}
            </span>
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            CB {g.breakerClosed ? "●" : "○"}
          </span>
        </div>

        {/* Load bar */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{labels.load}</span>
            <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: g.state === "online" ? loadColor : "hsl(var(--muted-foreground))" }}>
              {Math.round(g.kw)} <span className="text-[10px] font-normal text-muted-foreground">/ {g.ratedKw} kW</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-border/40 overflow-hidden relative">
            {/* 85% load-dependent start mark */}
            <div className="absolute top-0 bottom-0 w-px bg-foreground/30" style={{ left: "85%" }} />
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, loadPct)}%`, backgroundColor: loadColor }}
            />
          </div>
        </div>

        {/* Telemetry row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center gap-1.5">
            <GaugeIcon className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {g.state === "standby" || g.state === "fault" ? "—" : `${g.freqHz.toFixed(2)} Hz`}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {g.state === "standby" || g.state === "fault" ? "0" : Math.round(g.rpm)} rpm
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Timer className="w-3 h-3 text-muted-foreground" />
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {g.hours.toFixed(1)} h
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-1.5 pt-1">
          {g.state === "fault" ? (
            <button
              onClick={onResetFault}
              className="flex-1 px-2 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors"
            >
              {labels.resetFault}
            </button>
          ) : (
            <>
              <button
                onClick={onStart}
                disabled={g.state !== "standby"}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Power className="w-3 h-3" /> {labels.start}
              </button>
              <button
                onClick={onStop}
                disabled={g.state !== "online"}
                className="flex-1 px-2 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border border-border text-muted-foreground hover:bg-card hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {labels.stop}
              </button>
              <button
                onClick={onTrip}
                disabled={g.state !== "online"}
                className="px-2 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider border border-destructive/40 text-destructive/90 hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Simulate breaker trip"
              >
                {labels.trip}
              </button>
            </>
          )}
        </div>
      </div>
    </HMIPanel>
  );
};

export default GensetCard;
