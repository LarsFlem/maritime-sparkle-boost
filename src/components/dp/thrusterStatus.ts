/**
 * Shared thruster status colour, so the plan view and the per-unit detail
 * cards can never drift apart on what "saturated" or "failed" looks like.
 */
export const thrusterColor = (th: { failed: boolean; saturated: boolean; thrustPct: number }) =>
  th.failed
    ? "hsl(0, 70%, 55%)"
    : th.saturated
    ? "hsl(38, 85%, 60%)"
    : th.thrustPct > 1
    ? "hsl(200, 100%, 60%)"
    : "hsl(210, 15%, 50%)";
