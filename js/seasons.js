// Season player pools: real players/team-defenses, tiered $5 (best) down to
// $1 (weakest) per position, for a given NFL season. Each tier lists a few
// real candidates so the board looks different game to game even for the
// same season — the "$5 WR" isn't always the same guy. Stats are computed
// from statTemplates.js (era + tier), never stored here: this file is pure
// football trivia content, not a stat sheet.
//
// Coverage starts with 2000s-2020s (deepest, most reliable recall/records).
// 1980s/90s are a planned follow-up pass, not implemented yet.

import { deriveStats } from "./statTemplates.js";

export const POSITIONS = ["QB", "RB", "WR", "TE", "DEF"];
export const DOLLAR_VALUES = [5, 4, 3, 2, 1];

function bucket(tier, candidates) {
  return { tier, candidates };
}

export const SEASONS = {
  "2000": {
    id: "2000", label: "2000 NFL Season", era: "2000s",
    positions: {
      QB: [
        bucket(5, [{ name: "Peyton Manning", team: "IND" }, { name: "Elvis Grbac", team: "KC" }]),
        bucket(4, [{ name: "Rich Gannon", team: "OAK" }, { name: "Brett Favre", team: "GB" }]),
        bucket(3, [{ name: "Steve McNair", team: "TEN" }, { name: "Vinny Testaverde", team: "NYJ" }]),
        bucket(2, [{ name: "Trent Dilfer", team: "BAL" }, { name: "Jon Kitna", team: "SEA" }]),
        bucket(1, [{ name: "Akili Smith", team: "CIN" }, { name: "Ryan Leaf", team: "SD" }]),
      ],
      RB: [
        bucket(5, [{ name: "Marshall Faulk", team: "STL" }, { name: "Edgerrin James", team: "IND" }]),
        bucket(4, [{ name: "Robert Smith", team: "MIN" }, { name: "Jamal Lewis", team: "BAL" }]),
        bucket(3, [{ name: "Eddie George", team: "TEN" }, { name: "Curtis Martin", team: "NYJ" }]),
        bucket(2, [{ name: "Ricky Watters", team: "SEA" }, { name: "Emmitt Smith", team: "DAL" }]),
        bucket(1, [{ name: "James Stewart", team: "DET" }, { name: "Ron Dayne", team: "NYG" }]),
      ],
      WR: [
        bucket(5, [{ name: "Randy Moss", team: "MIN" }, { name: "Marvin Harrison", team: "IND" }]),
        bucket(4, [{ name: "Torry Holt", team: "STL" }, { name: "Isaac Bruce", team: "STL" }]),
        bucket(3, [{ name: "Terrell Owens", team: "SF" }, { name: "Tim Brown", team: "OAK" }]),
        bucket(2, [{ name: "Keyshawn Johnson", team: "TB" }, { name: "Muhsin Muhammad", team: "CAR" }]),
        bucket(1, [{ name: "Az-Zahir Hakim", team: "STL" }, { name: "David Boston", team: "ARI" }]),
      ],
      TE: [
        bucket(5, [{ name: "Tony Gonzalez", team: "KC" }, { name: "Shannon Sharpe", team: "BAL" }]),
        bucket(4, [{ name: "Wesley Walls", team: "CAR" }, { name: "Frank Wycheck", team: "TEN" }]),
        bucket(3, [{ name: "Ken Dilger", team: "IND" }, { name: "Byron Chamberlain", team: "DEN" }]),
        bucket(2, [{ name: "Freddie Jones", team: "ARI" }, { name: "Rickey Dudley", team: "OAK" }]),
        bucket(1, [{ name: "O.J. Santiago", team: "ATL" }, { name: "Stephen Alexander", team: "WAS" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Ravens", team: "BAL" }, { name: "Titans", team: "TEN" }]),
        bucket(4, [{ name: "Buccaneers", team: "TB" }, { name: "Jaguars", team: "JAX" }]),
        bucket(3, [{ name: "Dolphins", team: "MIA" }, { name: "Eagles", team: "PHI" }]),
        bucket(2, [{ name: "Lions", team: "DET" }, { name: "Cardinals", team: "ARI" }]),
        bucket(1, [{ name: "Browns", team: "CLE" }, { name: "Chargers", team: "SD" }]),
      ],
    },
  },

  "2003": {
    id: "2003", label: "2003 NFL Season", era: "2000s",
    positions: {
      QB: [
        bucket(5, [{ name: "Peyton Manning", team: "IND" }, { name: "Steve McNair", team: "TEN" }]),
        bucket(4, [{ name: "Daunte Culpepper", team: "MIN" }, { name: "Tom Brady", team: "NE" }]),
        bucket(3, [{ name: "Jake Delhomme", team: "CAR" }, { name: "Jon Kitna", team: "CIN" }]),
        bucket(2, [{ name: "Drew Bledsoe", team: "BUF" }, { name: "Kerry Collins", team: "OAK" }]),
        bucket(1, [{ name: "Joey Harrington", team: "DET" }, { name: "David Carr", team: "HOU" }]),
      ],
      RB: [
        bucket(5, [{ name: "Jamal Lewis", team: "BAL" }, { name: "Priest Holmes", team: "KC" }]),
        bucket(4, [{ name: "Ahman Green", team: "GB" }, { name: "Deuce McAllister", team: "NO" }]),
        bucket(3, [{ name: "Clinton Portis", team: "DEN" }, { name: "Edgerrin James", team: "IND" }]),
        bucket(2, [{ name: "Ricky Williams", team: "MIA" }, { name: "Stephen Davis", team: "CAR" }]),
        bucket(1, [{ name: "William Green", team: "CLE" }, { name: "Troy Hambrick", team: "DAL" }]),
      ],
      WR: [
        bucket(5, [{ name: "Randy Moss", team: "MIN" }, { name: "Torry Holt", team: "STL" }]),
        bucket(4, [{ name: "Terrell Owens", team: "SF" }, { name: "Hines Ward", team: "PIT" }]),
        bucket(3, [{ name: "Derrick Mason", team: "TEN" }, { name: "Rod Smith", team: "DEN" }]),
        bucket(2, [{ name: "Keenan McCardell", team: "TB" }, { name: "Joe Horn", team: "NO" }]),
        bucket(1, [{ name: "Peerless Price", team: "ATL" }, { name: "Az-Zahir Hakim", team: "STL" }]),
      ],
      TE: [
        bucket(5, [{ name: "Tony Gonzalez", team: "KC" }, { name: "Todd Heap", team: "BAL" }]),
        bucket(4, [{ name: "Jeremy Shockey", team: "NYG" }, { name: "Randy McMichael", team: "MIA" }]),
        bucket(3, [{ name: "Antonio Gates", team: "SD" }, { name: "Desmond Clark", team: "DEN" }]),
        bucket(2, [{ name: "Jerramy Stevens", team: "SEA" }, { name: "Marcus Pollard", team: "IND" }]),
        bucket(1, [{ name: "Bubba Franks", team: "GB" }, { name: "Ernie Conwell", team: "STL" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Ravens", team: "BAL" }, { name: "Patriots", team: "NE" }]),
        bucket(4, [{ name: "Panthers", team: "CAR" }, { name: "Titans", team: "TEN" }]),
        bucket(3, [{ name: "Dolphins", team: "MIA" }, { name: "Eagles", team: "PHI" }]),
        bucket(2, [{ name: "Lions", team: "DET" }, { name: "Cardinals", team: "ARI" }]),
        bucket(1, [{ name: "Chargers", team: "SD" }, { name: "Falcons", team: "ATL" }]),
      ],
    },
  },

  "2007": {
    id: "2007", label: "2007 NFL Season", era: "2000s",
    positions: {
      QB: [
        bucket(5, [{ name: "Tom Brady", team: "NE" }, { name: "Drew Brees", team: "NO" }]),
        bucket(4, [{ name: "Tony Romo", team: "DAL" }, { name: "Ben Roethlisberger", team: "PIT" }]),
        bucket(3, [{ name: "Carson Palmer", team: "CIN" }, { name: "Derek Anderson", team: "CLE" }]),
        bucket(2, [{ name: "David Garrard", team: "JAX" }, { name: "Jon Kitna", team: "DET" }]),
        bucket(1, [{ name: "Trent Edwards", team: "BUF" }, { name: "Kyle Boller", team: "BAL" }]),
      ],
      RB: [
        bucket(5, [{ name: "LaDainian Tomlinson", team: "SD" }, { name: "Adrian Peterson", team: "MIN" }]),
        bucket(4, [{ name: "Brian Westbrook", team: "PHI" }, { name: "Willie Parker", team: "PIT" }]),
        bucket(3, [{ name: "Marion Barber", team: "DAL" }, { name: "Clinton Portis", team: "WAS" }]),
        bucket(2, [{ name: "Willis McGahee", team: "BAL" }, { name: "Thomas Jones", team: "NYJ" }]),
        bucket(1, [{ name: "Chester Taylor", team: "MIN" }, { name: "Cedric Benson", team: "CHI" }]),
      ],
      WR: [
        bucket(5, [{ name: "Randy Moss", team: "NE" }, { name: "Terrell Owens", team: "DAL" }]),
        bucket(4, [{ name: "Larry Fitzgerald", team: "ARI" }, { name: "Chad Johnson", team: "CIN" }]),
        bucket(3, [{ name: "Braylon Edwards", team: "CLE" }, { name: "Reggie Wayne", team: "IND" }]),
        bucket(2, [{ name: "Steve Smith", team: "CAR" }, { name: "Torry Holt", team: "STL" }]),
        bucket(1, [{ name: "Bernard Berrian", team: "CHI" }, { name: "Devery Henderson", team: "NO" }]),
      ],
      TE: [
        bucket(5, [{ name: "Antonio Gates", team: "SD" }, { name: "Tony Gonzalez", team: "KC" }]),
        bucket(4, [{ name: "Jason Witten", team: "DAL" }, { name: "Kellen Winslow", team: "CLE" }]),
        bucket(3, [{ name: "Chris Cooley", team: "WAS" }, { name: "Dallas Clark", team: "IND" }]),
        bucket(2, [{ name: "Ben Watson", team: "NE" }, { name: "Alge Crumpler", team: "ATL" }]),
        bucket(1, [{ name: "Visanthe Shiancoe", team: "MIN" }, { name: "Bo Scaife", team: "TEN" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Steelers", team: "PIT" }, { name: "Buccaneers", team: "TB" }]),
        bucket(4, [{ name: "Redskins", team: "WAS" }, { name: "Giants", team: "NYG" }]),
        bucket(3, [{ name: "Colts", team: "IND" }, { name: "Chargers", team: "SD" }]),
        bucket(2, [{ name: "Packers", team: "GB" }, { name: "Cowboys", team: "DAL" }]),
        bucket(1, [{ name: "Chiefs", team: "KC" }, { name: "Lions", team: "DET" }]),
      ],
    },
  },

  "2011": {
    id: "2011", label: "2011 NFL Season", era: "2010s",
    positions: {
      QB: [
        bucket(5, [{ name: "Aaron Rodgers", team: "GB" }, { name: "Drew Brees", team: "NO" }]),
        bucket(4, [{ name: "Tom Brady", team: "NE" }, { name: "Matthew Stafford", team: "DET" }]),
        bucket(3, [{ name: "Eli Manning", team: "NYG" }, { name: "Cam Newton", team: "CAR" }]),
        bucket(2, [{ name: "Matt Ryan", team: "ATL" }, { name: "Philip Rivers", team: "SD" }]),
        bucket(1, [{ name: "Blaine Gabbert", team: "JAX" }, { name: "Christian Ponder", team: "MIN" }]),
      ],
      RB: [
        bucket(5, [{ name: "Ray Rice", team: "BAL" }, { name: "LeSean McCoy", team: "PHI" }]),
        bucket(4, [{ name: "Maurice Jones-Drew", team: "JAX" }, { name: "Arian Foster", team: "HOU" }]),
        bucket(3, [{ name: "Marshawn Lynch", team: "SEA" }, { name: "Frank Gore", team: "SF" }]),
        bucket(2, [{ name: "Michael Turner", team: "ATL" }, { name: "DeMarco Murray", team: "DAL" }]),
        bucket(1, [{ name: "Jacquizz Rodgers", team: "ATL" }, { name: "Kevin Smith", team: "DET" }]),
      ],
      WR: [
        bucket(5, [{ name: "Calvin Johnson", team: "DET" }, { name: "Wes Welker", team: "NE" }]),
        bucket(4, [{ name: "Victor Cruz", team: "NYG" }, { name: "Steve Smith", team: "CAR" }]),
        bucket(3, [{ name: "A.J. Green", team: "CIN" }, { name: "Julio Jones", team: "ATL" }]),
        bucket(2, [{ name: "Mike Wallace", team: "PIT" }, { name: "Dwayne Bowe", team: "KC" }]),
        bucket(1, [{ name: "Titus Young", team: "DET" }, { name: "Kevin Ogletree", team: "DAL" }]),
      ],
      TE: [
        bucket(5, [{ name: "Rob Gronkowski", team: "NE" }, { name: "Jimmy Graham", team: "NO" }]),
        bucket(4, [{ name: "Aaron Hernandez", team: "NE" }, { name: "Tony Gonzalez", team: "ATL" }]),
        bucket(3, [{ name: "Jason Witten", team: "DAL" }, { name: "Vernon Davis", team: "SF" }]),
        bucket(2, [{ name: "Owen Daniels", team: "HOU" }, { name: "Kellen Winslow", team: "TB" }]),
        bucket(1, [{ name: "Ed Dickson", team: "BAL" }, { name: "Jermichael Finley", team: "GB" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Ravens", team: "BAL" }, { name: "Steelers", team: "PIT" }]),
        bucket(4, [{ name: "49ers", team: "SF" }, { name: "Texans", team: "HOU" }]),
        bucket(3, [{ name: "Eagles", team: "PHI" }, { name: "Bears", team: "CHI" }]),
        bucket(2, [{ name: "Bengals", team: "CIN" }, { name: "Lions", team: "DET" }]),
        bucket(1, [{ name: "Packers", team: "GB" }, { name: "Colts", team: "IND" }]),
      ],
    },
  },

  "2015": {
    id: "2015", label: "2015 NFL Season", era: "2010s",
    positions: {
      QB: [
        bucket(5, [{ name: "Cam Newton", team: "CAR" }, { name: "Carson Palmer", team: "ARI" }]),
        bucket(4, [{ name: "Tom Brady", team: "NE" }, { name: "Russell Wilson", team: "SEA" }]),
        bucket(3, [{ name: "Andy Dalton", team: "CIN" }, { name: "Kirk Cousins", team: "WAS" }]),
        bucket(2, [{ name: "Eli Manning", team: "NYG" }, { name: "Alex Smith", team: "KC" }]),
        bucket(1, [{ name: "Case Keenum", team: "STL" }, { name: "Johnny Manziel", team: "CLE" }]),
      ],
      RB: [
        bucket(5, [{ name: "Adrian Peterson", team: "MIN" }, { name: "Devonta Freeman", team: "ATL" }]),
        bucket(4, [{ name: "Todd Gurley", team: "STL" }, { name: "Doug Martin", team: "TB" }]),
        bucket(3, [{ name: "Latavius Murray", team: "OAK" }, { name: "Chris Ivory", team: "NYJ" }]),
        bucket(2, [{ name: "Matt Forte", team: "CHI" }, { name: "Jeremy Hill", team: "CIN" }]),
        bucket(1, [{ name: "Trent Richardson", team: "IND" }, { name: "T.J. Yeldon", team: "JAX" }]),
      ],
      WR: [
        bucket(5, [{ name: "Antonio Brown", team: "PIT" }, { name: "Julio Jones", team: "ATL" }]),
        bucket(4, [{ name: "DeAndre Hopkins", team: "HOU" }, { name: "Odell Beckham Jr.", team: "NYG" }]),
        bucket(3, [{ name: "Allen Robinson", team: "JAX" }, { name: "Brandon Marshall", team: "NYJ" }]),
        bucket(2, [{ name: "Jarvis Landry", team: "MIA" }, { name: "Golden Tate", team: "DET" }]),
        bucket(1, [{ name: "Kevin White", team: "CHI" }, { name: "Breshad Perriman", team: "BAL" }]),
      ],
      TE: [
        bucket(5, [{ name: "Rob Gronkowski", team: "NE" }, { name: "Gary Barnidge", team: "CLE" }]),
        bucket(4, [{ name: "Delanie Walker", team: "TEN" }, { name: "Tyler Eifert", team: "CIN" }]),
        bucket(3, [{ name: "Greg Olsen", team: "CAR" }, { name: "Jordan Reed", team: "WAS" }]),
        bucket(2, [{ name: "Travis Kelce", team: "KC" }, { name: "Zach Ertz", team: "PHI" }]),
        bucket(1, [{ name: "Coby Fleener", team: "IND" }, { name: "Jace Amaro", team: "NYJ" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Broncos", team: "DEN" }, { name: "Panthers", team: "CAR" }]),
        bucket(4, [{ name: "Chiefs", team: "KC" }, { name: "Cardinals", team: "ARI" }]),
        bucket(3, [{ name: "Bengals", team: "CIN" }, { name: "Vikings", team: "MIN" }]),
        bucket(2, [{ name: "Redskins", team: "WAS" }, { name: "Buccaneers", team: "TB" }]),
        bucket(1, [{ name: "Saints", team: "NO" }, { name: "49ers", team: "SF" }]),
      ],
    },
  },

  "2019": {
    id: "2019", label: "2019 NFL Season", era: "2010s",
    positions: {
      QB: [
        bucket(5, [{ name: "Lamar Jackson", team: "BAL" }, { name: "Patrick Mahomes", team: "KC" }]),
        bucket(4, [{ name: "Russell Wilson", team: "SEA" }, { name: "Dak Prescott", team: "DAL" }]),
        bucket(3, [{ name: "Deshaun Watson", team: "HOU" }, { name: "Kirk Cousins", team: "MIN" }]),
        bucket(2, [{ name: "Carson Wentz", team: "PHI" }, { name: "Jared Goff", team: "LAR" }]),
        bucket(1, [{ name: "Josh Rosen", team: "MIA" }, { name: "Mason Rudolph", team: "PIT" }]),
      ],
      RB: [
        bucket(5, [{ name: "Derrick Henry", team: "TEN" }, { name: "Christian McCaffrey", team: "CAR" }]),
        bucket(4, [{ name: "Ezekiel Elliott", team: "DAL" }, { name: "Aaron Jones", team: "GB" }]),
        bucket(3, [{ name: "Nick Chubb", team: "CLE" }, { name: "Dalvin Cook", team: "MIN" }]),
        bucket(2, [{ name: "Josh Jacobs", team: "LV" }, { name: "Leonard Fournette", team: "JAX" }]),
        bucket(1, [{ name: "Devonta Freeman", team: "ATL" }, { name: "Kerryon Johnson", team: "DET" }]),
      ],
      WR: [
        bucket(5, [{ name: "Michael Thomas", team: "NO" }, { name: "DeAndre Hopkins", team: "HOU" }]),
        bucket(4, [{ name: "Chris Godwin", team: "TB" }, { name: "Julio Jones", team: "ATL" }]),
        bucket(3, [{ name: "Cooper Kupp", team: "LAR" }, { name: "Amari Cooper", team: "DAL" }]),
        bucket(2, [{ name: "Kenny Golladay", team: "DET" }, { name: "Terry McLaurin", team: "WAS" }]),
        bucket(1, [{ name: "N'Keal Harry", team: "NE" }, { name: "Parris Campbell", team: "IND" }]),
      ],
      TE: [
        bucket(5, [{ name: "Travis Kelce", team: "KC" }, { name: "George Kittle", team: "SF" }]),
        bucket(4, [{ name: "Zach Ertz", team: "PHI" }, { name: "Mark Andrews", team: "BAL" }]),
        bucket(3, [{ name: "Darren Waller", team: "LV" }, { name: "Austin Hooper", team: "ATL" }]),
        bucket(2, [{ name: "Evan Engram", team: "NYG" }, { name: "Hunter Henry", team: "LAC" }]),
        bucket(1, [{ name: "Jared Cook", team: "NO" }, { name: "Jordan Reed", team: "WAS" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Patriots", team: "NE" }, { name: "49ers", team: "SF" }]),
        bucket(4, [{ name: "Ravens", team: "BAL" }, { name: "Steelers", team: "PIT" }]),
        bucket(3, [{ name: "Saints", team: "NO" }, { name: "Chiefs", team: "KC" }]),
        bucket(2, [{ name: "Bears", team: "CHI" }, { name: "Eagles", team: "PHI" }]),
        bucket(1, [{ name: "Dolphins", team: "MIA" }, { name: "Bengals", team: "CIN" }]),
      ],
    },
  },

  "2023": {
    id: "2023", label: "2023 NFL Season", era: "2020s",
    positions: {
      QB: [
        bucket(5, [{ name: "Lamar Jackson", team: "BAL" }, { name: "Dak Prescott", team: "DAL" }]),
        bucket(4, [{ name: "Josh Allen", team: "BUF" }, { name: "Brock Purdy", team: "SF" }]),
        bucket(3, [{ name: "Jared Goff", team: "DET" }, { name: "Jordan Love", team: "GB" }]),
        bucket(2, [{ name: "Kirk Cousins", team: "MIN" }, { name: "Geno Smith", team: "SEA" }]),
        bucket(1, [{ name: "Zach Wilson", team: "NYJ" }, { name: "Bryce Young", team: "CAR" }]),
      ],
      RB: [
        bucket(5, [{ name: "Christian McCaffrey", team: "SF" }, { name: "Raheem Mostert", team: "MIA" }]),
        bucket(4, [{ name: "Kyren Williams", team: "LAR" }, { name: "Derrick Henry", team: "TEN" }]),
        bucket(3, [{ name: "James Cook", team: "BUF" }, { name: "Josh Jacobs", team: "LV" }]),
        bucket(2, [{ name: "Javonte Williams", team: "DEN" }, { name: "Zack Moss", team: "IND" }]),
        bucket(1, [{ name: "Ezekiel Elliott", team: "NE" }, { name: "Miles Sanders", team: "CAR" }]),
      ],
      WR: [
        bucket(5, [{ name: "Tyreek Hill", team: "MIA" }, { name: "CeeDee Lamb", team: "DAL" }]),
        bucket(4, [{ name: "Amon-Ra St. Brown", team: "DET" }, { name: "A.J. Brown", team: "PHI" }]),
        bucket(3, [{ name: "Puka Nacua", team: "LAR" }, { name: "Keenan Allen", team: "LAC" }]),
        bucket(2, [{ name: "DeVonta Smith", team: "PHI" }, { name: "Michael Pittman Jr.", team: "IND" }]),
        bucket(1, [{ name: "Zay Flowers", team: "BAL" }, { name: "Jaxon Smith-Njigba", team: "SEA" }]),
      ],
      TE: [
        bucket(5, [{ name: "Sam LaPorta", team: "DET" }, { name: "Travis Kelce", team: "KC" }]),
        bucket(4, [{ name: "George Kittle", team: "SF" }, { name: "Trey McBride", team: "ARI" }]),
        bucket(3, [{ name: "Evan Engram", team: "JAX" }, { name: "Dallas Goedert", team: "PHI" }]),
        bucket(2, [{ name: "David Njoku", team: "CLE" }, { name: "Cole Kmet", team: "CHI" }]),
        bucket(1, [{ name: "Hunter Henry", team: "NE" }, { name: "Noah Fant", team: "SEA" }]),
      ],
      DEF: [
        bucket(5, [{ name: "Ravens", team: "BAL" }, { name: "Browns", team: "CLE" }]),
        bucket(4, [{ name: "Cowboys", team: "DAL" }, { name: "49ers", team: "SF" }]),
        bucket(3, [{ name: "Chiefs", team: "KC" }, { name: "Steelers", team: "PIT" }]),
        bucket(2, [{ name: "Packers", team: "GB" }, { name: "Texans", team: "HOU" }]),
        bucket(1, [{ name: "Cardinals", team: "ARI" }, { name: "Panthers", team: "CAR" }]),
      ],
    },
  },
};

export function pickRandomSeasonId() {
  const ids = Object.keys(SEASONS);
  return ids[Math.floor(Math.random() * ids.length)];
}

// Resolves one concrete player per $-tier per position for a single game
// instance. This resolved "board" is what gets shared between both
// drafters (via the challenge link) so they draft from the identical set
// of names, even though the underlying season pool has multiple candidates
// per slot.
export function buildBoard(season) {
  const board = {};
  for (const pos of POSITIONS) {
    board[pos] = {};
    for (const b of season.positions[pos]) {
      const candidates = b.candidates;
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      board[pos][b.tier] = {
        tier: b.tier,
        name: chosen.name,
        team: chosen.team,
        stats: deriveStats(pos, season.era, b.tier),
      };
    }
  }
  return board;
}

export function isValidRoster(roster) {
  const values = POSITIONS.map((pos) => roster[pos] && roster[pos].tier);
  if (values.some((v) => v === undefined || v === null)) return false;
  const sorted = [...values].sort();
  return JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5]);
}
