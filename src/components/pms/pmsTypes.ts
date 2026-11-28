/** Synchronising window: breaker may close within ±this phase angle (deg). Shared by logic and synchroscope. */
export const SYNC_WIN_DEG = 12;
/** Time the breaker takes to close once the synchroniser gives the close command (s). */
export const BREAKER_CLOSE_S = 0.6;

export type GensetState =
  | "standby"
  | "starting"
  | "sync"
  | "online"
  | "cooldown"
  | "fault";

export interface GensetView {
  id: string;
  name: string;
  ratedKw: number;
  state: GensetState;
  kw: number;
  freqHz: number;
  rpm: number;
  hours: number;
  breakerClosed: boolean;
  /** Phase angle vs bus while synchronizing (deg, -180..180) */
  syncAngleDeg: number;
  /** Frequency difference vs bus while synchronizing (Hz) */
  syncSlipHz: number;
  /** Close command given, breaker closing (synchroscope shows "in window") */
  closing: boolean;
}

export type ConsumerState = "off" | "request" | "online" | "shed";

export interface ConsumerView {
  id: string;
  name: string;
  ratedKw: number;
  kw: number;
  enabled: boolean;
  state: ConsumerState;
  essential: boolean;
  sheddable: boolean;
  /** Heavy consumer — needs PMS power reservation before connecting */
  heavy: boolean;
}

export type PmsLogSev = "ok" | "info" | "warn" | "err";

export interface PmsLogEvent {
  id: number;
  ts: number;
  sev: PmsLogSev;
  unit: string;
  msg: string;
}
