// Per-game stat baselines by era, and how much a tier (5 = best, 1 = weakest)
// scales that baseline. Stats are never shown to the player (the game is
// about recalling who was actually good, not reading a stat sheet) — they
// only drive the simulation engine — so authoring a new season only requires
// real player/team names per tier, never hand-tuned numbers. Adding an era
// bucket here is enough to make every season in that era simulate believably.

const QB_BASELINE = {
  "1980s": { comp: 13.5, att: 24.5, yds: 175, td: 0.95, int: 1.15 },
  "1990s": { comp: 17.0, att: 28.5, yds: 200, td: 1.15, int: 1.00 },
  "2000s": { comp: 20.5, att: 32.5, yds: 225, td: 1.35, int: 0.95 },
  "2010s": { comp: 23.0, att: 34.5, yds: 245, td: 1.55, int: 0.75 },
  "2020s": { comp: 23.5, att: 34.0, yds: 240, td: 1.60, int: 0.65 },
};
const QB_TIER_MULT = {
  5: { comp: 1.20, att: 1.05, yds: 1.30, td: 1.90, int: 0.55 },
  4: { comp: 1.10, att: 1.02, yds: 1.13, td: 1.35, int: 0.80 },
  3: { comp: 1.00, att: 1.00, yds: 1.00, td: 1.00, int: 1.00 },
  2: { comp: 0.92, att: 0.97, yds: 0.88, td: 0.75, int: 1.25 },
  1: { comp: 0.80, att: 0.90, yds: 0.70, td: 0.50, int: 1.60 },
};

const RB_BASELINE = {
  "1980s": { car: 15.0, yds: 62, td: 0.50, fum: 0.18 },
  "1990s": { car: 15.5, yds: 65, td: 0.55, fum: 0.16 },
  "2000s": { car: 16.0, yds: 68, td: 0.60, fum: 0.15 },
  "2010s": { car: 15.0, yds: 66, td: 0.62, fum: 0.13 },
  "2020s": { car: 14.5, yds: 65, td: 0.60, fum: 0.12 },
};
const RB_TIER_MULT = {
  5: { car: 1.30, yds: 1.55, td: 1.70, fum: 1.15 },
  4: { car: 1.15, yds: 1.25, td: 1.30, fum: 1.05 },
  3: { car: 1.00, yds: 1.00, td: 1.00, fum: 1.00 },
  2: { car: 0.85, yds: 0.75, td: 0.60, fum: 0.95 },
  1: { car: 0.65, yds: 0.50, td: 0.40, fum: 0.85 },
};

const WR_BASELINE = {
  "1980s": { rec: 3.2, yds: 50, td: 0.35, fum: 0.05 },
  "1990s": { rec: 3.8, yds: 58, td: 0.40, fum: 0.05 },
  "2000s": { rec: 4.3, yds: 65, td: 0.45, fum: 0.05 },
  "2010s": { rec: 4.8, yds: 70, td: 0.50, fum: 0.04 },
  "2020s": { rec: 5.0, yds: 72, td: 0.50, fum: 0.04 },
};
const TE_BASELINE = {
  "1980s": { rec: 2.0, yds: 26, td: 0.25, fum: 0.03 },
  "1990s": { rec: 2.3, yds: 29, td: 0.28, fum: 0.03 },
  "2000s": { rec: 2.8, yds: 34, td: 0.32, fum: 0.03 },
  "2010s": { rec: 3.3, yds: 38, td: 0.38, fum: 0.025 },
  "2020s": { rec: 3.5, yds: 40, td: 0.40, fum: 0.025 },
};
const RECEIVER_TIER_MULT = {
  5: { rec: 1.60, yds: 1.75, td: 2.00, fum: 1.10 },
  4: { rec: 1.30, yds: 1.35, td: 1.40, fum: 1.05 },
  3: { rec: 1.00, yds: 1.00, td: 1.00, fum: 1.00 },
  2: { rec: 0.75, yds: 0.70, td: 0.55, fum: 0.90 },
  1: { rec: 0.50, yds: 0.45, td: 0.30, fum: 0.80 },
};

const DEF_BASELINE = {
  "1980s": { sacks: 2.3, int: 1.1, ff: 0.85, ptsAllowed: 20.5 },
  "1990s": { sacks: 2.4, int: 1.0, ff: 0.80, ptsAllowed: 20.0 },
  "2000s": { sacks: 2.5, int: 0.95, ff: 0.78, ptsAllowed: 20.5 },
  "2010s": { sacks: 2.6, int: 0.85, ff: 0.70, ptsAllowed: 22.0 },
  "2020s": { sacks: 2.5, int: 0.80, ff: 0.65, ptsAllowed: 22.5 },
};
// Good defenses sack/int/ff MORE and allow FEWER points, so ptsAllowed
// deliberately inverts relative to the other three columns.
const DEF_TIER_MULT = {
  5: { sacks: 1.35, int: 1.40, ff: 1.35, ptsAllowed: 0.68 },
  4: { sacks: 1.15, int: 1.15, ff: 1.15, ptsAllowed: 0.85 },
  3: { sacks: 1.00, int: 1.00, ff: 1.00, ptsAllowed: 1.00 },
  2: { sacks: 0.85, int: 0.85, ff: 0.85, ptsAllowed: 1.15 },
  1: { sacks: 0.65, int: 0.65, ff: 0.65, ptsAllowed: 1.35 },
};

const TABLES = {
  QB: { baseline: QB_BASELINE, mult: QB_TIER_MULT },
  RB: { baseline: RB_BASELINE, mult: RB_TIER_MULT },
  WR: { baseline: WR_BASELINE, mult: RECEIVER_TIER_MULT },
  TE: { baseline: TE_BASELINE, mult: RECEIVER_TIER_MULT },
  DEF: { baseline: DEF_BASELINE, mult: DEF_TIER_MULT },
};

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function deriveStats(position, era, tier) {
  const table = TABLES[position];
  const baseline = table.baseline[era];
  const mult = table.mult[tier];
  const stats = {};
  for (const key of Object.keys(baseline)) {
    stats[key] = round2(baseline[key] * mult[key]);
  }
  return stats;
}
