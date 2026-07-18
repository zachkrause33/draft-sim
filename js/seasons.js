// Season player pools: real players/team-defenses, tiered $5 (best) down to
// $1 (weakest) per position, for a given NFL season. Each tier lists a couple
// real candidates so the board looks different game to game even for the same
// season — the "$5 WR" isn't always the same guy. Stats are computed from
// statTemplates.js (era + tier), never stored here: this file is pure
// football trivia content, not a stat sheet.
//
// Ordering is by that-season production, not career reputation. So a player
// who was elite for his career but had a down or injured year sits lower for
// that year (e.g. Drew Brees is only $2 in 2007, Antonio Gates is $1 as a
// 2003 rookie, Kevin White / Breshad Perriman are $1 in 2015 having missed
// the year hurt).
//
// `num` is the player's real jersey number for THAT team-season (players
// change numbers between teams, so it lives on the per-season candidate).
// Star numbers are accurate; a few deep-role numbers are best-effort and
// trivially correctable. Team defenses have no number.
//
// Coverage starts with 2000s-2020s (deepest, most reliable recall/records).
// 1980s/90s are a planned follow-up pass, not implemented yet.

import { deriveStats } from "./statTemplates.js";

export const POSITIONS = ["QB", "RB", "WR", "TE", "DEF"];
export const DOLLAR_VALUES = [5, 4, 3, 2, 1];

function bucket(tier, candidates) {
  return { tier, candidates };
}
// p = offensive player (has number), d = team defense (no number)
function p(name, team, num) { return { name, team, num }; }
function d(name, team) { return { name, team }; }

export const SEASONS = {
  "2000": {
    id: "2000", label: "2000 NFL Season", era: "2000s",
    positions: {
      QB: [
        bucket(5, [p("Peyton Manning", "IND", 18), p("Rich Gannon", "OAK", 12)]),
        bucket(4, [p("Brett Favre", "GB", 4), p("Elvis Grbac", "KC", 18)]),
        bucket(3, [p("Steve McNair", "TEN", 9), p("Vinny Testaverde", "NYJ", 16)]),
        bucket(2, [p("Jon Kitna", "SEA", 3), p("Trent Dilfer", "BAL", 8)]),
        bucket(1, [p("Akili Smith", "CIN", 11), p("Ryan Leaf", "SD", 16)]),
      ],
      RB: [
        bucket(5, [p("Marshall Faulk", "STL", 28), p("Edgerrin James", "IND", 32)]),
        bucket(4, [p("Robert Smith", "MIN", 26), p("Eddie George", "TEN", 27)]),
        bucket(3, [p("Jamal Lewis", "BAL", 31), p("Curtis Martin", "NYJ", 28)]),
        bucket(2, [p("Emmitt Smith", "DAL", 22), p("Ricky Watters", "SEA", 32)]),
        bucket(1, [p("James Stewart", "DET", 20), p("Ron Dayne", "NYG", 27)]),
      ],
      WR: [
        bucket(5, [p("Randy Moss", "MIN", 84), p("Marvin Harrison", "IND", 88)]),
        bucket(4, [p("Terrell Owens", "SF", 81), p("Torry Holt", "STL", 88)]),
        bucket(3, [p("Isaac Bruce", "STL", 80), p("Tim Brown", "OAK", 81)]),
        bucket(2, [p("Keyshawn Johnson", "TB", 19), p("Muhsin Muhammad", "CAR", 87)]),
        bucket(1, [p("David Boston", "ARI", 89), p("Az-Zahir Hakim", "STL", 82)]),
      ],
      TE: [
        bucket(5, [p("Tony Gonzalez", "KC", 88), p("Shannon Sharpe", "BAL", 82)]),
        bucket(4, [p("Frank Wycheck", "TEN", 89), p("Wesley Walls", "CAR", 85)]),
        bucket(3, [p("Ken Dilger", "IND", 85), p("Freddie Jones", "SD", 82)]),
        bucket(2, [p("Byron Chamberlain", "DEN", 87), p("Rickey Dudley", "OAK", 85)]),
        bucket(1, [p("O.J. Santiago", "ATL", 88), p("Stephen Alexander", "WAS", 82)]),
      ],
      DEF: [
        bucket(5, [d("Ravens", "BAL"), d("Titans", "TEN")]),
        bucket(4, [d("Buccaneers", "TB"), d("Dolphins", "MIA")]),
        bucket(3, [d("Eagles", "PHI"), d("Jaguars", "JAX")]),
        bucket(2, [d("Lions", "DET"), d("Chargers", "SD")]),
        bucket(1, [d("Cardinals", "ARI"), d("Browns", "CLE")]),
      ],
    },
  },

  "2003": {
    id: "2003", label: "2003 NFL Season", era: "2000s",
    positions: {
      QB: [
        bucket(5, [p("Peyton Manning", "IND", 18), p("Steve McNair", "TEN", 9)]),
        bucket(4, [p("Daunte Culpepper", "MIN", 11), p("Tom Brady", "NE", 12)]),
        bucket(3, [p("Jake Delhomme", "CAR", 17), p("Jon Kitna", "CIN", 3)]),
        bucket(2, [p("Drew Bledsoe", "BUF", 11), p("Kerry Collins", "OAK", 5)]),
        bucket(1, [p("Joey Harrington", "DET", 3), p("David Carr", "HOU", 8)]),
      ],
      RB: [
        bucket(5, [p("Jamal Lewis", "BAL", 31), p("Priest Holmes", "KC", 31)]),
        bucket(4, [p("Ahman Green", "GB", 30), p("Deuce McAllister", "NO", 26)]),
        bucket(3, [p("Clinton Portis", "DEN", 26), p("Edgerrin James", "IND", 32)]),
        bucket(2, [p("Ricky Williams", "MIA", 34), p("Stephen Davis", "CAR", 48)]),
        bucket(1, [p("William Green", "CLE", 30), p("Troy Hambrick", "DAL", 25)]),
      ],
      WR: [
        bucket(5, [p("Randy Moss", "MIN", 84), p("Torry Holt", "STL", 88)]),
        bucket(4, [p("Joe Horn", "NO", 87), p("Derrick Mason", "TEN", 85)]),
        bucket(3, [p("Terrell Owens", "SF", 81), p("Hines Ward", "PIT", 86)]),
        bucket(2, [p("Rod Smith", "DEN", 80), p("Keenan McCardell", "TB", 87)]),
        bucket(1, [p("Peerless Price", "ATL", 81), p("Az-Zahir Hakim", "DET", 81)]),
      ],
      TE: [
        bucket(5, [p("Tony Gonzalez", "KC", 88), p("Jeremy Shockey", "NYG", 80)]),
        bucket(4, [p("Todd Heap", "BAL", 86), p("Randy McMichael", "MIA", 81)]),
        bucket(3, [p("Bubba Franks", "GB", 88), p("Desmond Clark", "DEN", 88)]),
        bucket(2, [p("Marcus Pollard", "IND", 81), p("Jerramy Stevens", "SEA", 86)]),
        bucket(1, [p("Antonio Gates", "SD", 85), p("Ernie Conwell", "STL", 89)]),
      ],
      DEF: [
        bucket(5, [d("Patriots", "NE"), d("Ravens", "BAL")]),
        bucket(4, [d("Titans", "TEN"), d("Panthers", "CAR")]),
        bucket(3, [d("Dolphins", "MIA"), d("Eagles", "PHI")]),
        bucket(2, [d("Falcons", "ATL"), d("Chargers", "SD")]),
        bucket(1, [d("Lions", "DET"), d("Cardinals", "ARI")]),
      ],
    },
  },

  "2007": {
    id: "2007", label: "2007 NFL Season", era: "2000s",
    positions: {
      QB: [
        bucket(5, [p("Tom Brady", "NE", 12), p("Tony Romo", "DAL", 9)]),
        bucket(4, [p("Ben Roethlisberger", "PIT", 7), p("Carson Palmer", "CIN", 9)]),
        bucket(3, [p("Derek Anderson", "CLE", 3), p("David Garrard", "JAX", 9)]),
        bucket(2, [p("Drew Brees", "NO", 9), p("Jon Kitna", "DET", 8)]),
        bucket(1, [p("Trent Edwards", "BUF", 5), p("Kyle Boller", "BAL", 7)]),
      ],
      RB: [
        bucket(5, [p("LaDainian Tomlinson", "SD", 21), p("Brian Westbrook", "PHI", 36)]),
        bucket(4, [p("Adrian Peterson", "MIN", 28), p("Willie Parker", "PIT", 39)]),
        bucket(3, [p("Clinton Portis", "WAS", 26), p("Marion Barber", "DAL", 24)]),
        bucket(2, [p("Willis McGahee", "BAL", 23), p("Thomas Jones", "NYJ", 20)]),
        bucket(1, [p("Cedric Benson", "CHI", 32), p("Chester Taylor", "MIN", 29)]),
      ],
      WR: [
        bucket(5, [p("Randy Moss", "NE", 81), p("Reggie Wayne", "IND", 87)]),
        bucket(4, [p("Terrell Owens", "DAL", 81), p("Braylon Edwards", "CLE", 17)]),
        bucket(3, [p("Larry Fitzgerald", "ARI", 11), p("Chad Johnson", "CIN", 85)]),
        bucket(2, [p("Torry Holt", "STL", 81), p("Steve Smith", "CAR", 89)]),
        bucket(1, [p("Bernard Berrian", "CHI", 80), p("Devery Henderson", "NO", 19)]),
      ],
      TE: [
        bucket(5, [p("Jason Witten", "DAL", 82), p("Tony Gonzalez", "KC", 88)]),
        bucket(4, [p("Antonio Gates", "SD", 85), p("Kellen Winslow", "CLE", 80)]),
        bucket(3, [p("Dallas Clark", "IND", 44), p("Chris Cooley", "WAS", 47)]),
        bucket(2, [p("Alge Crumpler", "ATL", 83), p("Ben Watson", "NE", 84)]),
        bucket(1, [p("Visanthe Shiancoe", "MIN", 81), p("Bo Scaife", "TEN", 86)]),
      ],
      DEF: [
        bucket(5, [d("Steelers", "PIT"), d("Buccaneers", "TB")]),
        bucket(4, [d("Colts", "IND"), d("Chargers", "SD")]),
        bucket(3, [d("Giants", "NYG"), d("Packers", "GB")]),
        bucket(2, [d("Redskins", "WAS"), d("Cowboys", "DAL")]),
        bucket(1, [d("Chiefs", "KC"), d("Lions", "DET")]),
      ],
    },
  },

  "2011": {
    id: "2011", label: "2011 NFL Season", era: "2010s",
    positions: {
      QB: [
        bucket(5, [p("Aaron Rodgers", "GB", 12), p("Drew Brees", "NO", 9)]),
        bucket(4, [p("Tom Brady", "NE", 12), p("Matthew Stafford", "DET", 9)]),
        bucket(3, [p("Eli Manning", "NYG", 10), p("Cam Newton", "CAR", 1)]),
        bucket(2, [p("Matt Ryan", "ATL", 2), p("Philip Rivers", "SD", 17)]),
        bucket(1, [p("Blaine Gabbert", "JAX", 11), p("Christian Ponder", "MIN", 7)]),
      ],
      RB: [
        bucket(5, [p("Ray Rice", "BAL", 27), p("LeSean McCoy", "PHI", 25)]),
        bucket(4, [p("Maurice Jones-Drew", "JAX", 32), p("Arian Foster", "HOU", 23)]),
        bucket(3, [p("Marshawn Lynch", "SEA", 24), p("Frank Gore", "SF", 21)]),
        bucket(2, [p("Michael Turner", "ATL", 33), p("DeMarco Murray", "DAL", 29)]),
        bucket(1, [p("Jacquizz Rodgers", "ATL", 32), p("Kevin Smith", "DET", 30)]),
      ],
      WR: [
        bucket(5, [p("Calvin Johnson", "DET", 81), p("Wes Welker", "NE", 83)]),
        bucket(4, [p("Victor Cruz", "NYG", 80), p("Steve Smith", "CAR", 89)]),
        bucket(3, [p("Mike Wallace", "PIT", 17), p("A.J. Green", "CIN", 18)]),
        bucket(2, [p("Julio Jones", "ATL", 11), p("Dwayne Bowe", "KC", 82)]),
        bucket(1, [p("Titus Young", "DET", 16), p("Kevin Ogletree", "DAL", 85)]),
      ],
      TE: [
        bucket(5, [p("Rob Gronkowski", "NE", 87), p("Jimmy Graham", "NO", 80)]),
        bucket(4, [p("Aaron Hernandez", "NE", 81), p("Jason Witten", "DAL", 82)]),
        bucket(3, [p("Tony Gonzalez", "ATL", 88), p("Vernon Davis", "SF", 85)]),
        bucket(2, [p("Jermichael Finley", "GB", 88), p("Owen Daniels", "HOU", 81)]),
        bucket(1, [p("Kellen Winslow", "TB", 82), p("Ed Dickson", "BAL", 84)]),
      ],
      DEF: [
        bucket(5, [d("49ers", "SF"), d("Steelers", "PIT")]),
        bucket(4, [d("Ravens", "BAL"), d("Texans", "HOU")]),
        bucket(3, [d("Bears", "CHI"), d("Bengals", "CIN")]),
        bucket(2, [d("Eagles", "PHI"), d("Lions", "DET")]),
        bucket(1, [d("Packers", "GB"), d("Colts", "IND")]),
      ],
    },
  },

  "2015": {
    id: "2015", label: "2015 NFL Season", era: "2010s",
    positions: {
      QB: [
        bucket(5, [p("Cam Newton", "CAR", 1), p("Carson Palmer", "ARI", 3)]),
        bucket(4, [p("Tom Brady", "NE", 12), p("Russell Wilson", "SEA", 3)]),
        bucket(3, [p("Andy Dalton", "CIN", 14), p("Eli Manning", "NYG", 10)]),
        bucket(2, [p("Kirk Cousins", "WAS", 8), p("Alex Smith", "KC", 11)]),
        bucket(1, [p("Case Keenum", "STL", 17), p("Johnny Manziel", "CLE", 2)]),
      ],
      RB: [
        bucket(5, [p("Adrian Peterson", "MIN", 28), p("Devonta Freeman", "ATL", 24)]),
        bucket(4, [p("Todd Gurley", "STL", 30), p("Doug Martin", "TB", 22)]),
        bucket(3, [p("Matt Forte", "CHI", 22), p("Chris Ivory", "NYJ", 33)]),
        bucket(2, [p("Latavius Murray", "OAK", 28), p("Jeremy Hill", "CIN", 32)]),
        bucket(1, [p("T.J. Yeldon", "JAX", 24), p("Trent Richardson", "IND", 34)]),
      ],
      WR: [
        bucket(5, [p("Antonio Brown", "PIT", 84), p("Julio Jones", "ATL", 11)]),
        bucket(4, [p("DeAndre Hopkins", "HOU", 10), p("Odell Beckham Jr.", "NYG", 13)]),
        bucket(3, [p("Brandon Marshall", "NYJ", 15), p("Allen Robinson", "JAX", 15)]),
        bucket(2, [p("Jarvis Landry", "MIA", 14), p("Golden Tate", "DET", 15)]),
        bucket(1, [p("Kevin White", "CHI", 13), p("Breshad Perriman", "BAL", 18)]),
      ],
      TE: [
        bucket(5, [p("Rob Gronkowski", "NE", 87), p("Greg Olsen", "CAR", 88)]),
        bucket(4, [p("Delanie Walker", "TEN", 82), p("Gary Barnidge", "CLE", 82)]),
        bucket(3, [p("Tyler Eifert", "CIN", 85), p("Jordan Reed", "WAS", 86)]),
        bucket(2, [p("Travis Kelce", "KC", 87), p("Zach Ertz", "PHI", 86)]),
        bucket(1, [p("Coby Fleener", "IND", 80), p("Jace Amaro", "NYJ", 88)]),
      ],
      DEF: [
        bucket(5, [d("Broncos", "DEN"), d("Panthers", "CAR")]),
        bucket(4, [d("Chiefs", "KC"), d("Cardinals", "ARI")]),
        bucket(3, [d("Bengals", "CIN"), d("Vikings", "MIN")]),
        bucket(2, [d("Redskins", "WAS"), d("Buccaneers", "TB")]),
        bucket(1, [d("49ers", "SF"), d("Saints", "NO")]),
      ],
    },
  },

  "2019": {
    id: "2019", label: "2019 NFL Season", era: "2010s",
    positions: {
      QB: [
        bucket(5, [p("Lamar Jackson", "BAL", 8), p("Russell Wilson", "SEA", 3)]),
        bucket(4, [p("Patrick Mahomes", "KC", 15), p("Dak Prescott", "DAL", 4)]),
        bucket(3, [p("Deshaun Watson", "HOU", 4), p("Kirk Cousins", "MIN", 8)]),
        bucket(2, [p("Carson Wentz", "PHI", 11), p("Jared Goff", "LAR", 16)]),
        bucket(1, [p("Josh Rosen", "MIA", 3), p("Mason Rudolph", "PIT", 2)]),
      ],
      RB: [
        bucket(5, [p("Christian McCaffrey", "CAR", 22), p("Derrick Henry", "TEN", 22)]),
        bucket(4, [p("Nick Chubb", "CLE", 24), p("Aaron Jones", "GB", 33)]),
        bucket(3, [p("Dalvin Cook", "MIN", 33), p("Ezekiel Elliott", "DAL", 21)]),
        bucket(2, [p("Josh Jacobs", "LV", 28), p("Leonard Fournette", "JAX", 27)]),
        bucket(1, [p("Devonta Freeman", "ATL", 24), p("Kerryon Johnson", "DET", 33)]),
      ],
      WR: [
        bucket(5, [p("Michael Thomas", "NO", 13), p("Julio Jones", "ATL", 11)]),
        bucket(4, [p("Chris Godwin", "TB", 12), p("DeAndre Hopkins", "HOU", 10)]),
        bucket(3, [p("Cooper Kupp", "LAR", 10), p("Amari Cooper", "DAL", 19)]),
        bucket(2, [p("Kenny Golladay", "DET", 19), p("Terry McLaurin", "WAS", 17)]),
        bucket(1, [p("N'Keal Harry", "NE", 15), p("Parris Campbell", "IND", 1)]),
      ],
      TE: [
        bucket(5, [p("Travis Kelce", "KC", 87), p("George Kittle", "SF", 85)]),
        bucket(4, [p("Darren Waller", "LV", 83), p("Mark Andrews", "BAL", 89)]),
        bucket(3, [p("Zach Ertz", "PHI", 86), p("Austin Hooper", "ATL", 81)]),
        bucket(2, [p("Evan Engram", "NYG", 88), p("Hunter Henry", "LAC", 86)]),
        bucket(1, [p("Jared Cook", "NO", 87), p("Jordan Reed", "WAS", 86)]),
      ],
      DEF: [
        bucket(5, [d("Patriots", "NE"), d("49ers", "SF")]),
        bucket(4, [d("Ravens", "BAL"), d("Steelers", "PIT")]),
        bucket(3, [d("Bears", "CHI"), d("Saints", "NO")]),
        bucket(2, [d("Eagles", "PHI"), d("Chiefs", "KC")]),
        bucket(1, [d("Dolphins", "MIA"), d("Bengals", "CIN")]),
      ],
    },
  },

  "2023": {
    id: "2023", label: "2023 NFL Season", era: "2020s",
    positions: {
      QB: [
        bucket(5, [p("Lamar Jackson", "BAL", 8), p("Dak Prescott", "DAL", 4)]),
        bucket(4, [p("Josh Allen", "BUF", 17), p("Brock Purdy", "SF", 13)]),
        bucket(3, [p("Jared Goff", "DET", 16), p("Jordan Love", "GB", 10)]),
        bucket(2, [p("Kirk Cousins", "MIN", 8), p("Geno Smith", "SEA", 7)]),
        bucket(1, [p("Zach Wilson", "NYJ", 2), p("Bryce Young", "CAR", 9)]),
      ],
      RB: [
        bucket(5, [p("Christian McCaffrey", "SF", 23), p("Raheem Mostert", "MIA", 31)]),
        bucket(4, [p("Derrick Henry", "TEN", 22), p("Kyren Williams", "LAR", 23)]),
        bucket(3, [p("James Cook", "BUF", 4), p("Josh Jacobs", "LV", 8)]),
        bucket(2, [p("Javonte Williams", "DEN", 33), p("Zack Moss", "IND", 21)]),
        bucket(1, [p("Miles Sanders", "CAR", 6), p("Ezekiel Elliott", "NE", 15)]),
      ],
      WR: [
        bucket(5, [p("Tyreek Hill", "MIA", 10), p("CeeDee Lamb", "DAL", 88)]),
        bucket(4, [p("Amon-Ra St. Brown", "DET", 14), p("A.J. Brown", "PHI", 11)]),
        bucket(3, [p("Puka Nacua", "LAR", 17), p("Keenan Allen", "LAC", 13)]),
        bucket(2, [p("Michael Pittman Jr.", "IND", 11), p("DeVonta Smith", "PHI", 6)]),
        bucket(1, [p("Zay Flowers", "BAL", 4), p("Jaxon Smith-Njigba", "SEA", 11)]),
      ],
      TE: [
        bucket(5, [p("Travis Kelce", "KC", 87), p("Sam LaPorta", "DET", 87)]),
        bucket(4, [p("George Kittle", "SF", 85), p("Evan Engram", "JAX", 17)]),
        bucket(3, [p("Trey McBride", "ARI", 85), p("David Njoku", "CLE", 85)]),
        bucket(2, [p("Dallas Goedert", "PHI", 88), p("Cole Kmet", "CHI", 85)]),
        bucket(1, [p("Hunter Henry", "NE", 85), p("Noah Fant", "SEA", 87)]),
      ],
      DEF: [
        bucket(5, [d("Ravens", "BAL"), d("Browns", "CLE")]),
        bucket(4, [d("Cowboys", "DAL"), d("49ers", "SF")]),
        bucket(3, [d("Chiefs", "KC"), d("Steelers", "PIT")]),
        bucket(2, [d("Texans", "HOU"), d("Packers", "GB")]),
        bucket(1, [d("Cardinals", "ARI"), d("Panthers", "CAR")]),
      ],
    },
  },
};

export function pickRandomSeasonId() {
  const ids = Object.keys(SEASONS);
  return ids[Math.floor(Math.random() * ids.length)];
}

// Resolves one concrete player per $-tier per position for a single game
// instance. This resolved "board" is what gets shared between both drafters
// (via the challenge link) so they draft from the identical set of names,
// even though the underlying season pool has multiple candidates per slot.
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
        num: chosen.num, // undefined for team defenses
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
