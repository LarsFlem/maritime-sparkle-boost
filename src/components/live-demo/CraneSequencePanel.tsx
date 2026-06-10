import { Play, Square, RotateCcw, AlertOctagon, Hand, Sparkles, Cpu, Anchor } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export type CraneMode = "manual" | "semi" | "auto";

export interface SequenceStep {
  id: string;
  label: string;
}

// Hoisted out of the parent so React keeps the same component identity across
// the parent's 10 Hz re-renders — otherwise the DOM nodes unmount/remount
// every tick and clicks that straddle a tick get dropped.
const ModeButton = ({
  active,
  onClick,
  icon,
  text,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  text: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`relative flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-[10px] font-mono uppercase tracking-wider transition-colors border-y border-r first:border-l first:rounded-l last:rounded-r ${
      active
        ? "bg-primary/25 border-primary text-primary shadow-[inset_0_-2px_0_0_hsl(var(--primary))]"
        : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/70"
    }`}
  >
    {icon}
    <span>{text}</span>
  </button>
);

interface CraneSequencePanelProps {
  mode: CraneMode;
  onModeChange: (m: CraneMode) => void;
  running: boolean;
  eStop: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onEStop: () => void;
  // Manual / Semi-Auto controls (real engineering units)
  cmdSlew: number;   // deg
  cmdMain: number;   // deg
  cmdJib: number;    // deg (knuckle fold)
  cmdWire: number;   // m
  slewRange: [number, number];
  mainRange: [number, number];
  jibRange: [number, number];
  wireRange: [number, number];
  onCmdSlewChange: (v: number) => void;
  onCmdMainChange: (v: number) => void;
  onCmdJibChange: (v: number) => void;
  onCmdWireChange: (v: number) => void;
  // Auto sequence
  steps: SequenceStep[];
  activeStepIndex: number;
  stepProgress: number; // 0..1 within current step
  cycleCount: number;
  // Manual hook control
  hookCarrying: boolean;
  hookActionEnabled: boolean;
  hookHint: string;
  onHookAction: () => void;
  // Labels (for i18n)
  labels: {
    modeManual: string;
    modeSemi: string;
    modeAuto: string;
    targetSlew: string;
    targetMain: string;
    targetJib: string;
    targetWire: string;
    pickupZone: string;
    landingZone: string;
    boomLow: string;
    boomHigh: string;
    jibFolded: string;
    jibExtended: string;
    wireIn: string;
    wireOut: string;
    sequence: string;
    cycles: string;
    start: string;
    stop: string;
    reset: string;
    attach: string;
    release: string;
    eStop: string;
    eStopReset: string;
    panelTitle: string;
  };
}

// Compact labelled slider used for each crane axis.
const AxisSlider = ({
  label, value, unit, range, step, onChange, disabled, footLeft, footRight, decimals = 0,
}: {
  label: string;
  value: number;
  unit: string;
  range: [number, number];
  step: number;
  onChange: (v: number) => void;
  disabled: boolean;
  footLeft: string;
  footRight: string;
  decimals?: number;
}) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-baseline">
      <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</label>
      <span className="text-xs font-mono text-foreground tabular-nums">
        {value.toFixed(decimals)}{unit}
      </span>
    </div>
    <Slider
      value={[value]}
      onValueChange={(v) => onChange(v[0])}
      min={range[0]}
      max={range[1]}
      step={step}
      disabled={disabled}
    />
    <div className="flex justify-between text-[8px] font-mono uppercase text-muted-foreground/60 tracking-wider">
      <span>{footLeft}</span>
      <span>{footRight}</span>
    </div>
  </div>
);

const CraneSequencePanel = ({
  mode,
  onModeChange,
  running,
  eStop,
  onStart,
  onStop,
  onReset,
  onEStop,
  cmdSlew,
  cmdMain,
  cmdJib,
  cmdWire,
  slewRange,
  mainRange,
  jibRange,
  wireRange,
  onCmdSlewChange,
  onCmdMainChange,
  onCmdJibChange,
  onCmdWireChange,
  steps,
  activeStepIndex,
  stepProgress,
  cycleCount,
  hookCarrying,
  hookActionEnabled,
  hookHint,
  onHookAction,
  labels,
}: CraneSequencePanelProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Mode selector */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
          {labels.panelTitle}
        </div>
        <div className="flex">
          <ModeButton
            active={mode === "manual"}
            onClick={() => onModeChange("manual")}
            icon={<Hand className="w-3 h-3" />}
            text={labels.modeManual}
          />
          <ModeButton
            active={mode === "semi"}
            onClick={() => onModeChange("semi")}
            icon={<Sparkles className="w-3 h-3" />}
            text={labels.modeSemi}
          />
          <ModeButton
            active={mode === "auto"}
            onClick={() => onModeChange("auto")}
            icon={<Cpu className="w-3 h-3" />}
            text={labels.modeAuto}
          />
        </div>
      </div>

      {/* Manual / Semi-Auto sliders */}
      {mode !== "auto" && (
        <div className="space-y-3">
          <AxisSlider
            label={labels.targetSlew} value={cmdSlew} unit="°" range={slewRange} step={1}
            onChange={onCmdSlewChange} disabled={eStop}
            footLeft={labels.pickupZone} footRight={labels.landingZone}
          />
          <AxisSlider
            label={labels.targetMain} value={cmdMain} unit="°" range={mainRange} step={0.5}
            onChange={onCmdMainChange} disabled={eStop}
            footLeft={labels.boomLow} footRight={labels.boomHigh}
          />
          <AxisSlider
            label={labels.targetJib} value={cmdJib} unit="°" range={jibRange} step={0.5}
            onChange={onCmdJibChange} disabled={eStop}
            footLeft={labels.jibExtended} footRight={labels.jibFolded}
          />
          <AxisSlider
            label={labels.targetWire} value={cmdWire} unit=" m" range={wireRange} step={0.1} decimals={1}
            onChange={onCmdWireChange} disabled={eStop}
            footLeft={labels.wireIn} footRight={labels.wireOut}
          />

          {/* Hook control */}
          <div className="space-y-1.5 pt-1">
            <Button
              type="button"
              onClick={onHookAction}
              disabled={!hookActionEnabled}
              size="sm"
              variant="ghost"
              className={`w-full h-9 font-mono text-[10px] uppercase tracking-wider border ${
                hookCarrying
                  ? "bg-[hsl(22,60%,45%)]/15 hover:bg-[hsl(22,60%,45%)]/25 border-[hsl(22,60%,55%)]/50 text-[hsl(22,80%,70%)] disabled:opacity-40"
                  : "bg-accent/10 hover:bg-accent/20 border-accent/40 text-accent disabled:opacity-40"
              }`}
            >
              <Anchor className="w-3.5 h-3.5 mr-1.5" />
              {hookCarrying ? labels.release : labels.attach}
            </Button>
            <p className="text-[9px] font-mono text-muted-foreground/55 leading-tight text-center">
              {hookHint}
            </p>
          </div>
        </div>
      )}

      {/* Auto sequence steps */}
      {mode === "auto" && (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {labels.sequence}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              {labels.cycles}: <span className="text-foreground tabular-nums">{cycleCount}</span>
            </span>
          </div>
          <ol className="space-y-1">
            {steps.map((step, i) => {
              const isActive = running && !eStop && i === activeStepIndex;
              const isDone = running && i < activeStepIndex;
              const dotColor = isActive
                ? "hsl(200, 100%, 60%)"
                : isDone
                ? "hsl(180, 70%, 55%)"
                : "hsl(210, 15%, 35%)";
              return (
                <li key={step.id} className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />
                  <span
                    className={`flex-1 text-[10px] font-mono uppercase tracking-wider ${
                      isActive
                        ? "text-foreground"
                        : isDone
                        ? "text-muted-foreground/80"
                        : "text-muted-foreground/45"
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <div className="w-12 h-0.5 bg-border/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100 ease-linear"
                        style={{
                          width: `${Math.round(stepProgress * 100)}%`,
                          backgroundColor: "hsl(200, 100%, 60%)",
                        }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Run / Stop / Reset */}
      <div className="grid grid-cols-3 gap-1.5 pt-1">
        <Button
          onClick={onStart}
          disabled={eStop || running}
          size="sm"
          className="bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40 disabled:opacity-40 h-9 font-mono text-[10px] uppercase tracking-wider"
          variant="ghost"
        >
          <Play className="w-3.5 h-3.5 mr-1" />
          {labels.start}
        </Button>
        <Button
          onClick={onStop}
          disabled={!running}
          size="sm"
          className="bg-muted/40 hover:bg-muted/60 text-foreground border border-border/60 disabled:opacity-40 h-9 font-mono text-[10px] uppercase tracking-wider"
          variant="ghost"
        >
          <Square className="w-3.5 h-3.5 mr-1" />
          {labels.stop}
        </Button>
        <Button
          onClick={onReset}
          size="sm"
          className="bg-muted/40 hover:bg-muted/60 text-foreground border border-border/60 h-9 font-mono text-[10px] uppercase tracking-wider"
          variant="ghost"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          {labels.reset}
        </Button>
      </div>

      {/* Emergency stop */}
      <Button
        onClick={onEStop}
        size="sm"
        variant="ghost"
        className={`h-10 font-mono text-[11px] uppercase tracking-[0.16em] border ${
          eStop
            ? "bg-destructive/30 hover:bg-destructive/40 border-destructive text-destructive-foreground alarm-pulse"
            : "bg-destructive/10 hover:bg-destructive/20 border-destructive/50 text-destructive"
        }`}
      >
        <AlertOctagon className="w-4 h-4 mr-1.5" />
        {eStop ? labels.eStopReset : labels.eStop}
      </Button>
    </div>
  );
};

export default CraneSequencePanel;
