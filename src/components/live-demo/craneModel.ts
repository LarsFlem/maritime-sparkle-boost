/**
 * Shared kinematic model for the knuckle-boom deck crane.
 * All lengths in metres, angles in degrees, loads in tonnes.
 * Side view: outreach (R) grows to the LEFT on screen, heights (Z) are
 * metres above the main deck datum.
 */

export const L_MAIN = 16; // main boom length
export const L_JIB = 11; // knuckle jib length
export const PIVOT_Z = 4; // boom pivot height above main deck

// Axis travel limits
export const SLEW_MIN = 0;
export const SLEW_MAX = 180;
export const MAIN_MIN = 25;
export const MAIN_MAX = 80;
export const JIB_MIN = 5; // fold angle: 0 = straight extension of main boom
export const JIB_MAX = 150;
export const WIRE_MIN = 1;
export const WIRE_MAX = 28;

// Load chart
export const SWL_RATED_T = 12; // max hook load near pedestal
export const MOMENT_LIMIT_TM = 150; // load moment limit (t·m)
export const CONTAINER_T = 5.8; // cargo mass
export const CONTAINER_H_M = 2.6;
export const CONTAINER_W_M = 3.0;

// Work zones (slew sectors + radial windows)
export const PICKUP_SLEW = 25;
export const LANDING_SLEW = 155;
export const SECTOR_HALF = 12; // ± degrees considered "in sector"
export const PICKUP_R = 9; // container position on own deck
export const LANDING_R = 21; // container position on barge
export const BARGE_DECK_Z = -3; // barge deck below main deck
export const ZONE_HALF_R = 2.2; // radial tolerance for the zones

const rad = (d: number) => (d * Math.PI) / 180;

export interface CraneFk {
  /** knuckle joint */
  kx: number;
  kz: number;
  /** jib tip (sheave) */
  tx: number;
  tz: number;
  /** jib absolute angle above horizontal (deg) */
  jibAbsDeg: number;
}

/** Forward kinematics: boom angles → knuckle + tip position (R, Z). */
export const craneFk = (mainDeg: number, jibFoldDeg: number): CraneFk => {
  const jibAbsDeg = mainDeg - jibFoldDeg;
  const kx = L_MAIN * Math.cos(rad(mainDeg));
  const kz = PIVOT_Z + L_MAIN * Math.sin(rad(mainDeg));
  return {
    kx,
    kz,
    tx: kx + L_JIB * Math.cos(rad(jibAbsDeg)),
    tz: kz + L_JIB * Math.sin(rad(jibAbsDeg)),
    jibAbsDeg,
  };
};

/**
 * Inverse kinematics: desired tip (R, Z) → { mainDeg, jibFoldDeg }.
 * Elbow-up solution (knuckle above the pivot–tip chord), as a real
 * knuckle-boom crane articulates.
 */
export const craneIk = (R: number, Z: number): { mainDeg: number; jibFoldDeg: number } => {
  const dx = R;
  const dz = Z - PIVOT_Z;
  let D = Math.hypot(dx, dz);
  D = Math.max(Math.abs(L_MAIN - L_JIB) + 0.5, Math.min(L_MAIN + L_JIB - 0.5, D));

  const a = Math.atan2(dz, dx);
  const cosKnee = (L_MAIN * L_MAIN + L_JIB * L_JIB - D * D) / (2 * L_MAIN * L_JIB);
  const knee = Math.acos(Math.max(-1, Math.min(1, cosKnee))); // angle between links
  const cosShoulder = (D * D + L_MAIN * L_MAIN - L_JIB * L_JIB) / (2 * D * L_MAIN);
  const shoulder = Math.acos(Math.max(-1, Math.min(1, cosShoulder)));

  const mainDeg = ((a + shoulder) * 180) / Math.PI;
  const jibFoldDeg = 180 - (knee * 180) / Math.PI;
  return {
    mainDeg: Math.max(MAIN_MIN, Math.min(MAIN_MAX, mainDeg)),
    jibFoldDeg: Math.max(JIB_MIN, Math.min(JIB_MAX, jibFoldDeg)),
  };
};

/** Safe working load at a given outreach — load-moment limited. */
export const swlAt = (outreachM: number): number =>
  Math.min(SWL_RATED_T, MOMENT_LIMIT_TM / Math.max(3, outreachM));

export const inSector = (slewDeg: number, sectorDeg: number): boolean =>
  Math.abs(slewDeg - sectorDeg) <= SECTOR_HALF;
