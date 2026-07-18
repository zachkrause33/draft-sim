// Pure simulation engine: (rosterA, rosterB, board) -> { scoreA, scoreB,
// boxScoreA, boxScoreB, playLog }. No DOM access, no globals, easy to test
// and reusable for both head-to-head and solo/CPU modes.

import { POSITIONS } from "./seasons.js";

const QUARTERS = 4;
const POSSESSIONS_PER_TEAM_PER_QUARTER = 3;
const PASS_PLAY_CHANCE = 0.6;

const LEAGUE_AVG = { sacksPerGame: 2.5, intPerGame: 0.9, fumPerGame: 0.15 };

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = () => Math.random();
const randInt = (min, max) => Math.floor(min + rand() * (max - min + 1));

// Per-drive counting stats, emergent from THIS drive's outcome rather than
// reconstructed from season averages. A scoring drive puts up more yards; a
// three-and-out puts up little. Player quality (their season yardage) scales
// efficiency, so better players still produce more — but the final box score
// reflects the game that was actually played, and two sims of the same
// matchup produce different lines.
function passDriveYards(points, qb) {
  const scale = clamp(qb.stats.yds / 240, 0.7, 1.45);
  let base;
  if (points === 7) base = 45 + rand() * 38;      // touchdown drive
  else if (points === 3) base = 28 + rand() * 30; // field-goal drive
  else base = 6 + rand() * 30;                     // stalled drive / punt
  return Math.max(0, Math.round(base * scale * flavor()));
}
function runDriveYards(points, rb) {
  const scale = clamp(rb.stats.yds / 70, 0.7, 1.45);
  let base;
  if (points === 7) base = 22 + rand() * 40;
  else if (points === 3) base = 14 + rand() * 30;
  else base = 3 + rand() * 26;
  return Math.max(0, Math.round(base * scale * flavor()));
}

// Stat-flavor variance (wide, ~15-30%): cosmetic jitter on yardage so two
// sims of the same matchup don't produce identical box scores.
function flavor() {
  return 0.8 + rand() * 0.5; // 0.80 - 1.30
}

// Outcome variance (tight, ~5%): the "who wins" lever, applied only to the
// drive-success probability. Deliberately kept separate from flavor().
function outcomeVariance() {
  return (rand() * 2 - 1) * 0.05; // -0.05 - +0.05
}

function makeEmptyBox() {
  return {
    QB: { comp: 0, att: 0, yds: 0, td: 0, int: 0 },
    RB: { car: 0, yds: 0, td: 0, fum: 0 },
    WR: { rec: 0, yds: 0, td: 0, fum: 0 },
    TE: { rec: 0, yds: 0, td: 0, fum: 0 },
    DEF: { sacks: 0, int: 0, ff: 0 },
  };
}

function resolveTeam(roster, board) {
  const players = {};
  for (const pos of POSITIONS) {
    players[pos] = board[pos][roster[pos].tier];
  }
  return players;
}

function offenseStrength(players) {
  const tiers = ["QB", "RB", "WR", "TE"].map((p) => players[p].tier);
  return tiers.reduce((a, b) => a + b, 0) / tiers.length;
}

function sackProbability(defPlayer) {
  return clamp(
    0.035 + (defPlayer.stats.sacks - LEAGUE_AVG.sacksPerGame) * 0.015,
    0.015,
    0.10
  );
}

function interceptionProbability(qb, defPlayer) {
  return clamp(
    0.05 +
      (qb.stats.int - LEAGUE_AVG.intPerGame) * 0.035 +
      (defPlayer.tier - 3) * 0.012,
    0.02,
    0.16
  );
}

function fumbleProbability(carrierFumPerGame, defPlayer) {
  return clamp(
    0.025 + (carrierFumPerGame - LEAGUE_AVG.fumPerGame) * 0.05 + (defPlayer.tier - 3) * 0.008,
    0.008,
    0.09
  );
}

function driveScoreProbability(offPlayers, defPlayer) {
  const off = offenseStrength(offPlayers);
  const def = defPlayer.tier;
  const base = 0.42 + (off - def) * 0.06 + outcomeVariance();
  return clamp(base, 0.12, 0.82);
}

function touchdownShare(offPlayers) {
  const off = offenseStrength(offPlayers);
  return clamp(0.55 + (off - 3) * 0.07, 0.25, 0.85);
}

// Decide the drive's point outcome (0 / 3 / 7) from player-quality-driven
// probabilities. Kept separate from stat accrual so the "who scores" logic
// (the fairness lever) stays clean.
function drivePoints(offPlayers, defPlayer) {
  if (rand() >= driveScoreProbability(offPlayers, defPlayer)) return 0;
  return rand() < touchdownShare(offPlayers) ? 7 : 3;
}

function simulatePossession({ offPlayers, offBox, defPlayer, defBox, quarter, offLabel, defLabel }) {
  const playType = rand() < PASS_PLAY_CHANCE ? "pass" : "run";
  const base = { quarter, possessionTeam: offLabel, type: playType, points: 0 };

  if (playType === "pass") {
    const qb = offPlayers.QB;
    const compPct = clamp(qb.stats.comp / qb.stats.att, 0.5, 0.72);

    // Sack ends the drive; a sack is not a pass attempt, so nothing is
    // charged to the QB's line beyond the defense's sack.
    if (rand() < sackProbability(defPlayer)) {
      defBox.DEF.sacks += 1;
      return { ...base, type: "sack", text: `${qb.name} is sacked! ${defLabel} defense gets home.` };
    }

    const receiverPos = rand() < 0.7 ? "WR" : "TE";
    const receiver = offPlayers[receiverPos];

    if (rand() < interceptionProbability(qb, defPlayer)) {
      const att = randInt(2, 4);
      offBox.QB.att += att;
      offBox.QB.comp += clamp(Math.round(att * compPct * 0.7), 0, att);
      offBox.QB.int += 1;
      defBox.DEF.int += 1;
      return { ...base, type: "turnover", text: `${qb.name}'s pass is INTERCEPTED by the ${defLabel} defense!` };
    }

    if (rand() < fumbleProbability(receiver.stats.fum, defPlayer)) {
      const y = Math.round((8 + rand() * 26) * flavor());
      const att = randInt(2, 4);
      offBox.QB.att += att;
      offBox.QB.comp += clamp(Math.round(att * compPct), 1, att);
      offBox.QB.yds += y;
      offBox[receiverPos].rec += 1;
      offBox[receiverPos].yds += y;
      offBox[receiverPos].fum += 1;
      defBox.DEF.ff += 1;
      return { ...base, type: "turnover", text: `${qb.name} finds ${receiver.name}, but the ball comes loose! ${defLabel} recovers the fumble.` };
    }

    const points = drivePoints(offPlayers, defPlayer);
    const y = passDriveYards(points, qb);
    const att = randInt(3, 6);
    const comp = clamp(Math.round(att * compPct * (0.85 + rand() * 0.3)), 1, att);
    offBox.QB.att += att;
    offBox.QB.comp += comp;
    offBox.QB.yds += y;
    offBox[receiverPos].rec += Math.min(comp, randInt(1, 3));
    offBox[receiverPos].yds += y;

    if (points === 7) {
      offBox.QB.td += 1;
      offBox[receiverPos].td += 1;
      return { ...base, points: 7, text: `${qb.name} finds ${receiver.name} for ${y} yds — TOUCHDOWN!` };
    }
    if (points === 3) {
      return { ...base, points: 3, text: `${qb.name} to ${receiver.name} for ${y} yds. Drive stalls — FIELD GOAL is good.` };
    }
    return { ...base, text: `${qb.name} completes to ${receiver.name} for ${y} yds. Drive stalls, ${offLabel} punts.` };
  }

  // Run play
  const rb = offPlayers.RB;

  if (rand() < fumbleProbability(rb.stats.fum, defPlayer)) {
    offBox.RB.car += randInt(2, 4);
    offBox.RB.yds += Math.round(rand() * 9);
    offBox.RB.fum += 1;
    defBox.DEF.ff += 1;
    return { ...base, type: "turnover", text: `${rb.name} coughs it up! ${defLabel} recovers the fumble.` };
  }

  const points = drivePoints(offPlayers, defPlayer);
  const y = runDriveYards(points, rb);
  offBox.RB.car += randInt(3, 7);
  offBox.RB.yds += y;

  if (points === 7) {
    offBox.RB.td += 1;
    return { ...base, points: 7, text: `${rb.name} runs it in for ${y} yds — TOUCHDOWN!` };
  }
  if (points === 3) {
    return { ...base, points: 3, text: `${rb.name} runs for ${y} yds. Drive stalls — FIELD GOAL is good.` };
  }
  return { ...base, text: `${rb.name} runs for ${y} yds. Drive stalls, ${offLabel} punts.` };
}

function roundBox(box) {
  // Every stat is now an actual count from the game, so a plain integer box
  // score (no season-style decimals).
  const rounded = {};
  for (const pos of Object.keys(box)) {
    rounded[pos] = {};
    for (const [key, val] of Object.entries(box[pos])) {
      rounded[pos][key] = Math.round(val);
    }
  }
  return rounded;
}

// Where the ball ends up, in yards from the offense's own goal line (0) to
// the opponent's goal line (100). Drives always start at the own 25. This is
// purely for the live-field animation — it's derived from the already-rolled
// outcome, so it never changes who wins.
const DRIVE_START_YARD = 25;
function driveEndYard(event) {
  if (event.points === 7) return 100;            // touchdown, into the end zone
  if (event.points === 3) return 72 + rand() * 16; // field-goal range
  if (event.type === "sack") return 16 + rand() * 8; // pushed back
  if (event.type === "turnover") return 30 + rand() * 35; // giveaway spot
  return 40 + rand() * 26;                        // stalled drive / punt
}

function formatClock(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

export function simulateGame(rosterA, rosterB, board, options = {}) {
  const playersA = resolveTeam(rosterA, board);
  const playersB = resolveTeam(rosterB, board);
  const labelA = options.labelA || "Team A";
  const labelB = options.labelB || "Team B";

  const boxA = makeEmptyBox();
  const boxB = makeEmptyBox();

  let scoreA = 0;
  let scoreB = 0;
  const playLog = [];

  const firstToPossess = rand() < 0.5 ? "A" : "B";
  playLog.push({
    quarter: 1,
    type: "info",
    text: `Coin toss: ${firstToPossess === "A" ? labelA : labelB} will receive the ball first.`,
    points: 0,
    clock: "15:00",
    runningScoreA: 0,
    runningScoreB: 0,
  });

  const possessionsPerQuarter = POSSESSIONS_PER_TEAM_PER_QUARTER * 2;
  const totalPossessions = QUARTERS * possessionsPerQuarter;
  let possessionTeam = firstToPossess;
  let clockRemaining = 900; // seconds left in the current quarter

  for (let n = 0; n < totalPossessions; n++) {
    const quarter = Math.floor(n / possessionsPerQuarter) + 1;
    if (n % possessionsPerQuarter === 0) clockRemaining = 900; // new quarter

    const clockAtSnap = clockRemaining;
    clockRemaining -= 95 + rand() * 110; // this drive burns ~1:35–3:25

    const offense = possessionTeam === "A"
      ? { offPlayers: playersA, offBox: boxA, defPlayer: playersB.DEF, defBox: boxB, offLabel: labelA, defLabel: labelB }
      : { offPlayers: playersB, offBox: boxB, defPlayer: playersA.DEF, defBox: boxA, offLabel: labelB, defLabel: labelA };

    const event = simulatePossession({ ...offense, quarter });

    if (possessionTeam === "A") {
      scoreA += event.points;
    } else {
      scoreB += event.points;
    }

    playLog.push({
      quarter,
      possessionTeam: offense.offLabel,
      driveTeam: possessionTeam,
      startYard: DRIVE_START_YARD,
      endYard: Math.round(driveEndYard(event)),
      clock: formatClock(clockAtSnap),
      type: event.type,
      text: event.text,
      points: event.points,
      runningScoreA: scoreA,
      runningScoreB: scoreB,
    });

    possessionTeam = possessionTeam === "A" ? "B" : "A";
  }

  playLog.push({
    quarter: QUARTERS,
    type: "final",
    text: `FINAL: ${labelA} ${scoreA} — ${labelB} ${scoreB}`,
    points: 0,
    clock: "0:00",
    runningScoreA: scoreA,
    runningScoreB: scoreB,
  });

  return {
    scoreA,
    scoreB,
    boxScoreA: roundBox(boxA),
    boxScoreB: roundBox(boxB),
    playLog,
    playersA,
    playersB,
  };
}
