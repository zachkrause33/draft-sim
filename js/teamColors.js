// Team colors keyed by the abbreviation used in the season data. Because the
// season pools use era-appropriate abbreviations (STL vs LAR, SD vs LAC, OAK
// vs LV), the right-era colors fall out naturally from the key.
//
// `primary` fills the jersey/helmet; `num` is the jersey number's color,
// picked to stay readable on that primary.

export const TEAM_COLORS = {
  ARI: { primary: "#97233f", num: "#ffffff" },
  ATL: { primary: "#a71930", num: "#ffffff" },
  BAL: { primary: "#241773", num: "#ffffff" },
  BUF: { primary: "#00338d", num: "#ffffff" },
  CAR: { primary: "#0085ca", num: "#101820" },
  CHI: { primary: "#0b162a", num: "#c83803" },
  CIN: { primary: "#111111", num: "#fb4f14" },
  CLE: { primary: "#311d00", num: "#ff3c00" },
  DAL: { primary: "#003594", num: "#ffffff" },
  DEN: { primary: "#fb4f14", num: "#002244" },
  DET: { primary: "#0076b6", num: "#ffffff" },
  GB: { primary: "#203731", num: "#ffb612" },
  HOU: { primary: "#03202f", num: "#ffffff" },
  IND: { primary: "#002c5f", num: "#ffffff" },
  JAX: { primary: "#006778", num: "#d7a22a" },
  KC: { primary: "#e31837", num: "#ffb81c" },
  LAC: { primary: "#0080c6", num: "#ffc20e" },
  LAR: { primary: "#003594", num: "#ffa300" },
  LV: { primary: "#101820", num: "#a5acaf" },
  MIA: { primary: "#008e97", num: "#ffffff" },
  MIN: { primary: "#4f2683", num: "#ffc62f" },
  NE: { primary: "#002244", num: "#ffffff" },
  NO: { primary: "#101820", num: "#d3bc8d" },
  NYG: { primary: "#0b2265", num: "#ffffff" },
  NYJ: { primary: "#125740", num: "#ffffff" },
  OAK: { primary: "#101820", num: "#a5acaf" },
  PHI: { primary: "#004c54", num: "#ffffff" },
  PIT: { primary: "#101820", num: "#ffb612" },
  SD: { primary: "#0080c6", num: "#ffb612" },
  SEA: { primary: "#002244", num: "#69be28" },
  SF: { primary: "#aa0000", num: "#b3995d" },
  STL: { primary: "#002244", num: "#b3995d" },
  TB: { primary: "#d50a0a", num: "#ffffff" },
  TEN: { primary: "#0c2340", num: "#4b92db" },
  WAS: { primary: "#5a1414", num: "#ffb612" },
};

const FALLBACK = { primary: "#3a4a63", num: "#ffffff" };

export function teamColors(abbrev) {
  return TEAM_COLORS[abbrev] || FALLBACK;
}
