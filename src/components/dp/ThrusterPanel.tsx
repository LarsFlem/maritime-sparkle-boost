import HMIPanel from "@/components/hmi/HMIPanel";
import { thrusterColor } from "@/components/dp/thrusterStatus";

export interface ThrusterView {
  id: string;
  name: string;
  type: "tunnel" | "azimuth";
  /** Demanded thrust 0..100 % of rated */
  thrustPct: number;
  /** Thrust direction in vessel body frame, deg (0 = ahead, 90 = stbd). Tunnels: ±90 only. */
  directionDeg: number;
  maxKn: number;
  failed: boolean;
  saturated: boolean;
  /** Mounting position on the hull, m forward of / starboard of the CoG. */
  posX: number;
  posY: number;
}

interface ThrusterPanelProps {
  thruster: ThrusterView;
  onToggleFail: () => void;
  labels: { run: string; failed: string; fail: string; restore: string; tunnel: string; azimuth: string };
}

const SIZE = 110;
const C = SIZE / 2;
const R = C - 12;

const ThrusterPanel = ({ thruster: th, onToggleFail, labels }: ThrusterPanelProps) => {
  const col = thrusterColor(th);

  const arrowLen = (th.thrustPct / 100) * (R - 8);
  const rad = ((th.directionDeg - 90) * Math.PI) / 180;
  const tipX = C + arrowLen * Math.cos(rad);
  const tipY = C + arrowLen * Math.sin(rad);
  const ang = rad;
  const ah = Math.min(7, 3 + arrowLen * 0.12);

  return (
    <HMIPanel title={`${th.id} — ${th.type === "tunnel" ? labels.tunnel : labels.azimuth}`} glowColor={col}>
      <div className="flex items-center gap-3">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
          {/* Dial */}
          <circle cx={C} cy={C} r={R} fill="hsl(var(--background))" fillOpacity={0.6}
            stroke="hsl(var(--border))" strokeWidth={1} />
          {/* Ticks every 45° */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = ((i * 45 - 90) * Math.PI) / 180;
            return (
              <line key={i}
                x1={C + (R - 4) * Math.cos(a)} y1={C + (R - 4) * Math.sin(a)}
                x2={C + R * Math.cos(a)} y2={C + R * Math.sin(a)}
                stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeOpacity={0.4} />
            );
          })}
          {/* Bow marker */}
          <text x={C} y={14} textAnchor="middle" fontSize={7} fontFamily="monospace"
            fill="hsl(var(--muted-foreground))" opacity={0.7}>FWD</text>

          {/* Tunnel housing: athwartships slot; azimuth: rotating pod ring */}
          {th.type === "tunnel" ? (
            <rect x={C - R + 10} y={C - 3.5} width={2 * R - 20} height={7} rx={3.5}
              fill="none" stroke={col} strokeWidth={1} strokeOpacity={0.5} />
          ) : (
            <circle cx={C} cy={C} r={10} fill="none" stroke={col} strokeWidth={1} strokeOpacity={0.5} />
          )}

          {/* Thrust vector */}
          {!th.failed && th.thrustPct > 1 && (
            <g>
              <line x1={C} y1={C} x2={tipX} y2={tipY} stroke={col} strokeWidth={2.5} strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 3px ${col}60)` }} />
              <polygon
                points={`${tipX + ah * Math.cos(ang)},${tipY + ah * Math.sin(ang)} ${tipX - ah * 0.6 * Math.cos(ang - 0.5)},${tipY - ah * 0.6 * Math.sin(ang - 0.5)} ${tipX - ah * 0.6 * Math.cos(ang + 0.5)},${tipY - ah * 0.6 * Math.sin(ang + 0.5)}`}
                fill={col}
              />
            </g>
          )}
          {th.failed && (
            <g stroke="hsl(0, 70%, 55%)" strokeWidth={2} strokeLinecap="round">
              <line x1={C - 10} y1={C - 10} x2={C + 10} y2={C + 10} />
              <line x1={C + 10} y1={C - 10} x2={C - 10} y2={C + 10} />
            </g>
          )}
          <circle cx={C} cy={C} r={3} fill={col} />
        </svg>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xl font-semibold tabular-nums" style={{ color: col }}>
              {th.failed ? "—" : Math.round(th.thrustPct)}
              {!th.failed && <span className="text-[10px] text-muted-foreground font-normal"> %</span>}
            </span>
          </div>
          <div className="font-mono text-[9px] text-muted-foreground tabular-nums space-y-0.5">
            <div>{th.failed ? "0" : Math.round((th.thrustPct / 100) * th.maxKn)} / {th.maxKn} kN</div>
            {th.type === "azimuth" && !th.failed && (
              <div>AZI {Math.round(((th.directionDeg % 360) + 360) % 360).toString().padStart(3, "0")}°</div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col, boxShadow: `0 0 4px ${col}` }} />
            <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: col }}>
              {th.failed ? labels.failed : labels.run}
            </span>
          </div>
          <button
            onClick={onToggleFail}
            className={`w-full px-2 py-1 rounded font-mono text-[9px] uppercase tracking-wider border transition-colors ${
              th.failed
                ? "border-primary/40 text-primary hover:bg-primary/10"
                : "border-destructive/40 text-destructive/90 hover:bg-destructive/10"
            }`}
          >
            {th.failed ? labels.restore : labels.fail}
          </button>
        </div>
      </div>
    </HMIPanel>
  );
};

export default ThrusterPanel;
