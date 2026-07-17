# Draft & Duel

A head-to-head NFL roster-drafting game. Two players independently draft a
5-man team (QB/RB/WR/TE/DEF) from a single real historical season — 2007, for
this MVP — using a fixed budget: the values 5, 4, 3, 2, and 1, each assigned
to exactly one position. Rosters lock blind, then a stat-driven simulation
plays out a full 4-quarter game and produces a real football score and box
score.

This is the Phase 1 MVP described in the game plan: one season, no backend,
no login.

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

## How a challenge works (no backend)

There's no server or database in Phase 1. A challenge's state travels
entirely in the URL:

1. Player A drafts a roster and locks it in. The app generates a share link
   like `#duel=<encoded roster + season + display name>` and stores a local
   copy in `localStorage` (so Player A's own browser can show a "waiting"
   state if they revisit the link).
2. Player A sends that link to Player B by any means (text, email, etc.).
3. Player B opens the link. The app decodes Player A's roster but never
   renders it — Player B only sees "you've been challenged," then drafts
   their own roster blind.
4. The moment Player B locks in, the simulation runs immediately in their
   browser (`js/simulation.js` is a pure function: two rosters + season data
   in, score/box score/play log out).
5. The app generates a second link, `#result=<full simulation result>`, for
   Player B to send back to Player A so Player A can open it and see the
   identical reveal.

There's no live "Player A gets notified the instant Player B finishes" —
that requires a backend and is explicitly Phase 2 work. The result link is
the async hand-off in the meantime.

## Code layout

- `js/season2007.js` — the 2007 player pool: 5 tiers × 5 positions, each with
  real per-game stat baselines (hand-curated from real 2007 season totals,
  divided by games played — see "Data sourcing" in the game plan).
- `js/simulation.js` — the pure simulation engine. Turnovers (sack/INT/fumble)
  are checked first each possession; if none fire, a drive-success roll
  decides TD/FG/punt. Two separate variance knobs are kept apart in code per
  the game plan: a tight ~5% "outcome variance" on the scoring roll (the
  actual fairness lever) and a wide ~15-30% "stat-flavor variance" on
  yardage (cosmetic, keeps box scores from repeating).
- `js/draft.js` — the budget-assignment UI. Assigning a value to a position
  is what selects which tiered player you get there.
- `js/challenge.js` — encode/decode challenge and result payloads to/from a
  URL-safe base64 hash fragment, plus the `localStorage` helper for the
  creating player.
- `js/app.js` — screen routing and wiring (landing, draft, share, challenge
  intro, live reveal with play-by-play + box score).

## Known tuning notes

The scoring-probability formula follows the game plan exactly: offensive
strength is the *average* tier across QB/RB/WR/TE, compared against the
opponent's *raw* DEF tier (Section 4.3 — no per-position weighting on
offense, but DEF isn't averaged against anything). One consequence: a single
DEF-tier swing has more leverage than a single swing at any one offensive
position, since offense tiers are diluted by averaging over four slots and
DEF isn't. Whether that's a feature (defense-heavy budgets are a real
strategy) or needs damping is worth playtesting before Phase 2 — the
coefficients in `simulation.js` (`0.06` per tier-point, `0.42` baseline
score probability, etc.) are a first-pass tuning, isolated as named
constants so they're easy to adjust.

## What's not here yet (see the game plan for the roadmap)

- Only the 2007 season is supported.
- No backend, so no async "Player B hasn't drafted yet" persistence beyond
  the share-link hand-off, and no head-to-head record tracking across
  matchups.
- No accounts/login.
