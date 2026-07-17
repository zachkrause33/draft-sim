// 2007 NFL season player pool.
// Per-game stat baselines are derived from real 2007 season totals divided by
// games played (manual curation, per Section 7 of the game plan). Values are
// approximate and meant for gameplay balance, not box-office accuracy.

export const SEASON_2007 = {
  id: "2007",
  label: "2007 NFL Season",
  positions: {
    QB: [
      { tier: 5, name: "Tom Brady", team: "NE",
        stats: { comp: 24.9, att: 36.1, yds: 300.4, td: 3.13, int: 0.50 } },
      { tier: 4, name: "Drew Brees", team: "NO",
        stats: { comp: 27.5, att: 40.8, yds: 276.4, td: 1.75, int: 1.13 } },
      { tier: 3, name: "Tony Romo", team: "DAL",
        stats: { comp: 20.9, att: 32.5, yds: 263.2, td: 2.25, int: 1.19 } },
      { tier: 2, name: "Carson Palmer", team: "CIN",
        stats: { comp: 24.3, att: 35.9, yds: 258.2, td: 1.63, int: 1.25 } },
      { tier: 1, name: "David Garrard", team: "JAX",
        stats: { comp: 16.0, att: 25.0, yds: 193.0, td: 1.38, int: 0.23 } },
    ],
    RB: [
      { tier: 5, name: "LaDainian Tomlinson", team: "SD",
        stats: { car: 19.7, yds: 92.1, td: 0.94, fum: 0.19 } },
      { tier: 4, name: "Adrian Peterson", team: "MIN",
        stats: { car: 15.9, yds: 89.4, td: 0.80, fum: 0.13 } },
      { tier: 3, name: "Brian Westbrook", team: "PHI",
        stats: { car: 18.5, yds: 88.9, td: 0.80, fum: 0.20 } },
      { tier: 2, name: "Willie Parker", team: "PIT",
        stats: { car: 20.1, yds: 82.3, td: 0.31, fum: 0.19 } },
      { tier: 1, name: "Marion Barber", team: "DAL",
        stats: { car: 13.2, yds: 65.0, td: 0.67, fum: 0.13 } },
    ],
    WR: [
      { tier: 5, name: "Randy Moss", team: "NE",
        stats: { rec: 6.10, yds: 93.3, td: 1.44, fum: 0.06 } },
      { tier: 4, name: "Terrell Owens", team: "DAL",
        stats: { rec: 5.40, yds: 90.3, td: 1.00, fum: 0.07 } },
      { tier: 3, name: "Larry Fitzgerald", team: "ARI",
        stats: { rec: 6.25, yds: 88.1, td: 0.625, fum: 0.00 } },
      { tier: 2, name: "Braylon Edwards", team: "CLE",
        stats: { rec: 5.00, yds: 80.6, td: 1.00, fum: 0.06 } },
      { tier: 1, name: "Steve Smith", team: "CAR",
        stats: { rec: 5.40, yds: 62.6, td: 0.44, fum: 0.06 } },
    ],
    TE: [
      { tier: 5, name: "Antonio Gates", team: "SD",
        stats: { rec: 4.70, yds: 61.5, td: 0.56, fum: 0.03 } },
      { tier: 4, name: "Tony Gonzalez", team: "KC",
        stats: { rec: 6.20, yds: 73.25, td: 0.25, fum: 0.03 } },
      { tier: 3, name: "Jason Witten", team: "DAL",
        stats: { rec: 6.00, yds: 71.6, td: 0.44, fum: 0.03 } },
      { tier: 2, name: "Chris Cooley", team: "WAS",
        stats: { rec: 3.80, yds: 41.4, td: 0.31, fum: 0.02 } },
      { tier: 1, name: "Ben Watson", team: "NE",
        stats: { rec: 2.06, yds: 24.25, td: 0.125, fum: 0.02 } },
    ],
    DEF: [
      { tier: 5, name: "Steelers", team: "PIT",
        stats: { sacks: 2.94, int: 1.25, ff: 0.94, ptsAllowed: 13.9 } },
      { tier: 4, name: "Buccaneers", team: "TB",
        stats: { sacks: 2.19, int: 1.13, ff: 0.94, ptsAllowed: 19.6 } },
      { tier: 3, name: "Redskins", team: "WAS",
        stats: { sacks: 2.06, int: 1.31, ff: 0.75, ptsAllowed: 20.0 } },
      { tier: 2, name: "Giants", team: "NYG",
        stats: { sacks: 3.31, int: 0.94, ff: 0.63, ptsAllowed: 21.9 } },
      { tier: 1, name: "Chiefs", team: "KC",
        stats: { sacks: 1.75, int: 0.75, ff: 0.50, ptsAllowed: 26.4 } },
    ],
  },
};

export const POSITIONS = ["QB", "RB", "WR", "TE", "DEF"];
export const TIERS = [5, 4, 3, 2, 1];

export function resolvePlayer(season, position, tier) {
  const pool = season.positions[position];
  const player = pool.find((p) => p.tier === tier);
  if (!player) {
    throw new Error(`No ${position} player found for tier ${tier}`);
  }
  return player;
}

export function isValidRoster(roster) {
  const tiers = POSITIONS.map((pos) => roster[pos] && roster[pos].tier);
  if (tiers.some((t) => t === undefined || t === null)) return false;
  const sorted = [...tiers].sort();
  return JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5]);
}
