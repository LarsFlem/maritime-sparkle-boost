import { useRef, useState, useCallback } from "react";

interface DPJoystickProps {
  /** Called with normalized commands: surge (+fwd) and sway (+stbd), each -1..1 */
  onChange: (surge: number, sway: number) => void;
  disabled?: boolean;
  size?: number;
}

const DPJoystick = ({ onChange, disabled = false, size = 150 }: DPJoystickProps) => {
  const wellRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 }); // px offset from center
  const maxR = size / 2 - 24;

  const update = useCallback((clientX: number, clientY: number) => {
    const well = wellRef.current;
    if (!well) return;
    const rect = well.getBoundingClientRect();
    let dx = clientX - (rect.left + rect.width / 2);
    let dy = clientY - (rect.top + rect.height / 2);
    const r = Math.hypot(dx, dy);
    if (r > maxR) {
      dx = (dx / r) * maxR;
      dy = (dy / r) * maxR;
    }
    setKnob({ x: dx, y: dy });
    // Screen up = +surge, screen right = +sway
    onChange(-dy / maxR, dx / maxR);
  }, [maxR, onChange]);

  const release = useCallback(() => {
    draggingRef.current = false;
    setKnob({ x: 0, y: 0 });
    onChange(0, 0);
  }, [onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    update(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || disabled) return;
    update(e.clientX, e.clientY);
  };

  const active = Math.hypot(knob.x, knob.y) > 2;

  return (
    <div
      ref={wellRef}
      className={`relative rounded-full border select-none touch-none mx-auto ${
        disabled ? "opacity-35 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
      }`}
      style={{
        width: size,
        height: size,
        background: "radial-gradient(circle at 50% 45%, hsl(var(--card)), hsl(var(--background)))",
        borderColor: "hsl(var(--border))",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {/* Crosshair guides */}
      <div className="absolute left-1/2 top-3 bottom-3 w-px bg-border/50 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-3 right-3 h-px bg-border/50 -translate-y-1/2 pointer-events-none" />
      <span className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/70 pointer-events-none">FWD</span>
      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/70 pointer-events-none">AFT</span>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[8px] text-muted-foreground/70 pointer-events-none">PT</span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[8px] text-muted-foreground/70 pointer-events-none">SB</span>

      {/* Command vector */}
      {active && (
        <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>
          <line
            x1={size / 2} y1={size / 2}
            x2={size / 2 + knob.x} y2={size / 2 + knob.y}
            stroke="hsl(200, 100%, 60%)" strokeWidth={1.5} strokeOpacity={0.6} strokeDasharray="3 3"
          />
        </svg>
      )}

      {/* Knob */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 38,
          height: 38,
          left: size / 2 + knob.x - 19,
          top: size / 2 + knob.y - 19,
          background: active
            ? "radial-gradient(circle at 35% 30%, hsl(200, 100%, 70%), hsl(200, 100%, 40%))"
            : "radial-gradient(circle at 35% 30%, hsl(210, 20%, 45%), hsl(210, 25%, 22%))",
          boxShadow: active
            ? "0 0 14px hsl(200 100% 60% / 0.5), inset 0 -2px 5px rgb(0 0 0 / 0.4)"
            : "0 2px 6px rgb(0 0 0 / 0.45), inset 0 -2px 5px rgb(0 0 0 / 0.4)",
          transition: draggingRef.current ? "none" : "left 0.25s ease, top 0.25s ease, background 0.2s ease",
        }}
      />
    </div>
  );
};

export default DPJoystick;
