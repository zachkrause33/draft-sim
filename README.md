# Draft & Duel

A head-to-head NFL roster-drafting game. Two players independently draft a
5-man team (QB/RB/WR/TE/DEF) from a real NFL season — a different real season
every game — by tapping $5, $4, $3, $2, and $1 onto the five positions, each
value used exactly once. No stats are shown on the board: the game is about
remembering who was actually good that year, not reading a spreadsheet.
Rosters lock blind, then a stat-driven simulation plays out a full 4-quarter
game and produces a real football score and box score.

This is the Phase 1 MVP described in the game plan: no backend, no login.

## Running it

No build step or dependencies — it's plain HTML/CSS/JS with ES modules.
Serve the directory with any static file server and open it in a browser
(opening `index.html` directly via `file://` will not work because ES module
`import` requires an HTTP origin):

```
npx http-server -p 8123
# or: python3 -m http.server 8123
```

Then visit `http://localhost:8123/`.

## The draft board

Each game randomly picks one of the supported seasons, then randomly resolves
one real player per $-tier per position from that season's candidate pool
(2-3 real options per slot) — so the "$5 WR" isn't the same guy every time
you play the same season. That resolved board is what both players actually
draft from; tapping a cell assigns its $ value to that position, and since
each value and each position can only be used once, selecting a cell clears
any other selection sharing its row or column.

Cards show a jersey in the player's real team colors for that year, with
their real number for that team-season (players change numbers between teams,
so the number lives on the per-season candidate), and the name — no stats, no
team abbreviation. A defense is a whole team rather than one player, so it
keeps its team name and shows a team-colored helmet chip instead of a
numbered jersey. Both the jersey and the helmet are inline SVG, so they
render in the sandboxed shareable preview with no external image requests.

Tiers are ordered by that-season production, not career reputation — the $5
player is the best that year and $1 the weakest. So a player who was elite
for his career but had a down or injured year sits lower for that year (Drew
Brees is $2 in 2007, Antonio Gates is $1 as a 2003 rookie, Kevin White and
Breshad Perriman are $1 in 2015 having missed the season hurt). That's the
whole game: knowing who actually mattered in a given season.

Team colors live in `js/teamColors.js`, keyed by the abbreviation used in the
season data — so era-appropriate abbreviations resolve to the right-era colors
automatically (STL Rams navy/gold vs LAR royal/yellow, SD/LAC powder blue,
OAK/LV silver-and-black).

**Season coverage:** 2000, 2003, 2007, 2011, 2015, 2019, 2023 — chosen to
span recent NFL eras where player-pool recall is most reliable. Individual
per-game stats (comp/att/yds/td/int, car/yds/td/fum, rec/yds/td/fum) have
been reliably recorded basically as far back as the stat categories existed
(1970s and earlier). The practical limiter for going all the way back to
1980 is defense: sacks only became an official team stat league-wide in
1982, and forced-fumble tracking gets spottier the further back you go, so
1980-81 defense numbers would be estimates rather than record. That's not a
blocker — the plan is to add an "1980s"/"1990s" era pass next (the
architecture already supports it, see below), just scoped as a follow-up
rather than guessed at in bulk in one pass.

## How a challenge works (no backend)

There's no server or database in Phase 1. A challenge's state travels
entirely in the URL:

1. Player A drafts a roster and locks it in. The app generates a share link
   encoding the resolved board, the season, and Player A's roster, and
   stores a local copy in `localStorage` (so Player A's own browser can show
   a "waiting" state if they revisit the link).
2. Player A sends that link to Player B by any means (text, email, etc.).
3. Player B opens the link and sees the identical board Player A drafted
   from — but never Player A's picks — then drafts their own roster blind.
4. The moment Player B locks in, the simulation runs immediately in their
   browser (`js/simulation.js` is a pure function: two rosters + a resolved
   board in, score/box score/play log out).
5. The app generates a second link, encoding the full simulation result, for
   Player B to send back to Player A so Player A can open it and see the
   identical reveal.

There's no live "Player A gets notified the instant Player B finishes" —
that requires a backend and is explicitly Phase 2 work. The result link is
the async hand-off in the meantime. (Because the resolved board now travels
in the link too, these URLs run several thousand characters — well within
what browsers and messaging apps handle, just noting it's not a short link.)

## Code layout

- `js/seasons.js` — the season registry: real players/team-defenses, tiered
  $5 (best) down to $1 per position, a few real candidates per tier. Also
  `buildBoard()` (resolves one concrete candidate per tier for a single game
  instance) and `pickRandomSeasonId()`.
- `js/statTemplates.js` — per-game stat baselines by era (1980s-2020s bucket
  keys, though only 2000s-2020s are populated so far) and how much a $-tier
  scales that baseline. Stats are derived formulaically and are never shown
  in the UI — they only drive the simulation — so adding a new season is
  purely a matter of real player/team names (and jersey numbers), never
  hand-tuned stat numbers.
- `js/teamColors.js` — jersey/helmet colors per franchise (primary fill +
  number color), keyed by the season data's abbreviations so the era-correct
  colors resolve automatically.
- `js/simulation.js` — the pure simulation engine. Turnovers (sack/INT/fumble)
  are checked first each possession; if none fire, a drive-success roll
  decides TD/FG/punt. Two separate variance knobs are kept apart in code per
  the game plan: a tight ~5% "outcome variance" on the scoring roll (the
  actual fairness lever) and a wide ~15-30% "stat-flavor variance" on
  yardage (cosmetic, keeps box scores from repeating). Each possession event
  also carries a `driveTeam`, a start/end field position (own-goal frame),
  and a game clock, purely so the live-field reveal can animate the ball —
  these are derived from the already-rolled outcome and never change who wins.
  The box score is **emergent from the game actually played**, not a
  reconstruction of season averages: each drive contributes real counting
  stats based on its own outcome (a scoring drive adds yards/attempts/a TD; a
  three-and-out adds little; an interception drive adds the pick), so a QB who
  throws four TDs shows four TDs and a QB who gets picked twice shows two INTs.
  Season stats only scale efficiency (better players produce more), they're
  never copied into the final line. Two sims of the same matchup give
  different box scores.
- `js/draft.js` — the tap grid: $ values as rows, positions as columns,
  each cell a real player rendered as a position-colored jersey (with number)
  or, for defenses, a helmet chip — name only, no stats. Tapping enforces the
  one-value-per-position, one-position-per-value constraint directly (it's a
  permutation-matrix selection).
- `js/challenge.js` — encode/decode challenge and result payloads to/from a
  URL-safe base64 hash fragment, plus the `localStorage` helper for the
  creating player.
- `js/app.js` — screen routing and wiring (landing, draft, share, challenge
  intro, and the live reveal). The reveal is a FanDuel-style broadcast: a
  top-down field with the ball sliding down it drive by drive, a possession
  banner in the offense's color, a live scorebug with a game clock, and a
  slowed play-by-play feed. It has a 1×/2× speed toggle and a "Skip to Final"
  button, then drops to the full box score.

## Known tuning notes

The scoring-probability formula follows the game plan exactly: offensive
strength is the *average* $-value across QB/RB/WR/TE, compared against the
opponent's *raw* DEF value (Section 4.3 — no per-position weighting on
offense, but DEF isn't averaged against anything). One consequence: a single
DEF-value swing has more leverage than a single swing at any one offensive
position, since offense values are diluted by averaging over four slots and
DEF isn't. Whether that's a feature (defense-heavy budgets are a real
strategy) or needs damping is worth playtesting before Phase 2 — the
coefficients in `simulation.js` (`0.06` per tier-point, `0.42` baseline
score probability, etc.) are a first-pass tuning, isolated as named
constants so they're easy to adjust.

## What's not here yet (see the game plan for the roadmap)

- Only 2000-2023 seasons are populated; 1980s/90s are a planned follow-up.
- No backend, so no async "Player B hasn't drafted yet" persistence beyond
  the share-link hand-off, and no head-to-head record tracking across
  matchups.
- No accounts/login, no real player photos (licensing + the shareable
  preview's sandboxing rule out hotlinked images for now — cards use a
  colored initials avatar instead).
