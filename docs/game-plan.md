# Draft & Duel — Full Game Plan

A head-to-head NFL roster-drafting game. Two players independently draft a 5-man
"team" (QB/RB/WR/TE/DEF) from a real historical NFL season using a fixed budget
(5/4/3/2/1, each value used once — the "$15 meme" mechanic). Rosters lock blind,
then a stat-driven simulation plays out a full 4-quarter game and produces a real
football score and box score.

---

## 1. Core Concept

- **Season-anchored, not era-blended.** Every draft happens inside one specific
  real NFL season (e.g. 2007). This is the differentiator from 82-0/20-0, which
  mash eras together. Picking the right season becomes part of the strategy.
- **Budget draft, not random spin.** Players assign values 5/4/3/2/1 across five
  positions, each value used exactly once. No position carries a built-in
  multiplier — the "5" is equally likely to go on DEF as QB, so the decision is
  about season knowledge and matchup reading, not always stacking the same slot.
- **Real box score output.** The simulation isn't an abstract point total — it
  produces an actual NFL-style score (e.g. 27–20) and a per-player stat line
  (completions/attempts, yards, TDs, INTs, fumbles, sacks).
- **Head-to-head is the core loop.** Solo play against a CPU is a fallback /
  practice mode. The real game is challenging a specific person and building a
  record against them.

---

## 2. Game Loop (short-term / MVP)

1. **Challenge created.** Player A picks (or is assigned) a season and generates
   a challenge — a shareable link/code.
2. **Player B accepts** the challenge via the link.
3. **Blind draft.** Both players independently assign 5/4/3/2/1 across
   QB/RB/WR/TE/DEF using that season's real player pool. Neither sees the
   other's picks.
4. **Lock-in.** Once both rosters are submitted, the challenge is "ready."
5. **Simulate.** The engine runs a 4-quarter, stat-driven game between the two
   rosters (see Section 4).
6. **Reveal.** Both players see the live-scrolling play script, the final score,
   and the full box score. Result is recorded as a win/loss for both players
   tied to this specific matchup.

No login is required for MVP — a challenge can be tracked via a unique
URL/session token, with an optional display name per player per challenge.

---

## 3. Data Model

### 3.1 Season / Player Pool
Each supported season needs, per position, a fixed pool of 5 tiered players
(tier 5 = best, tier 1 = weakest) with real per-game stat baselines:

| Position | Fields |
|---|---|
| QB | comp, att, yds, td, int (per game) |
| RB | car, yds, td, fum (per game) |
| WR / TE | rec, yds, td, fum (per game) |
| DEF | sacks, int, ff (forced fumbles), pts allowed (per game) |

This is the single most labor-intensive content task — every season you want to
support needs this table hand-built or sourced. See Section 7 (data sourcing).

### 3.2 Roster / Draft
```
Roster {
  season_id
  player_id (owner)
  positions: {
    QB: { tier: 1-5, player_ref },
    RB: { tier: 1-5, player_ref },
    WR: { tier: 1-5, player_ref },
    TE: { tier: 1-5, player_ref },
    DEF: { tier: 1-5, player_ref }
  }
  locked_at: timestamp
}
```
Constraint: the five `tier` values across positions must be a permutation of
{5,4,3,2,1} — enforce this server-side, not just in the UI.

### 3.3 Challenge / Matchup
```
Matchup {
  id
  season_id
  player_a_id, player_b_id
  roster_a_id, roster_b_id
  status: pending | drafted_a | drafted_b | ready | simulated
  result: { score_a, score_b, box_score_a, box_score_b, play_log }
  created_at, simulated_at
}
```

### 3.4 Records (short-term, pre-login)
Even without accounts, track a lightweight head-to-head record keyed by
whatever identity token exists (session, or eventually user ID):
```
HeadToHead {
  player_a_id, player_b_id
  wins_a, wins_b, ties
}
```

---

## 4. Simulation Engine

This is the part that has to feel like football, not a random number generator.

### 4.1 Structure
- 4 quarters, 3 possessions per team per quarter (12 possessions/team, 24 total),
  alternating.
- Each possession is either a **pass play** (~60%) or **run play** (~40%),
  weighted, not fixed.

### 4.2 Turnovers (checked first, every possession)
- **Sack chance** (pass plays only): derived from the defense's real sack rate.
  Ends the drive, no stat changes beyond a flavor line.
- **Interception chance**: derived from the QB's real INT rate, increased by the
  opposing defense's tier (better defense = higher forced-turnover odds).
- **Fumble chance**: derived from the ball-carrier's (RB, or receiver on a
  completed pass) real fumble rate, same defense-tier boost applied. This is
  the mechanic you specifically wanted: a turnover-prone player actually costs
  you more against a good defense.
- If a turnover fires, the possession ends immediately at 0 points and the log
  records it distinctly (styled differently in the UI) from a non-scoring punt.

### 4.3 Scoring (if no turnover)
- Compute a **drive success probability** from:
  - Offensive strength = average tier across QB/RB/WR/TE (deliberately no
    per-position weighting, per your instruction)
  - Defensive strength = opposing DEF tier
  - A variance term — this is the "slow ~5%" swing you asked for, applied at
    the drive-outcome-probability level (not to raw yardage, see 4.5)
- Roll for outcome: touchdown / field goal / punt (no score) using that
  probability.

### 4.4 Stat Accrual
Every possession updates a running box score per player:
- Pass play: QB gets attempts/completions/yards/TD proportional to their real
  per-game rate, split across ~7 pass possessions/game; target receiver
  (WR 70% / TE 30% split) gets a reception, yards, and TD credit.
- Run play: RB gets carries/yards/TD proportional to their real rate, split
  across ~5 run possessions/game.
- Defense accrues sacks, INTs, and forced fumbles as they occur.

By the end of 12 possessions, each player's box score should land close to
(but not identical to) their real per-game average — the variance is what
makes each simulated game replayable rather than deterministic.

### 4.5 Variance — two different knobs, don't conflate them
- **Outcome variance (~5%)**: shifts the TD/FG/punt probability each drive.
  This is the "who wins" lever — keep it tight, per your instruction, so a
  genuinely stronger roster wins consistently and a close draft can still flip.
- **Stat-flavor variance (wider, ~±15–30%)**: shifts individual yardage numbers
  possession-to-possession so the box score doesn't look robotic. This is
  cosmetic/realism, not a fairness lever — needs to stay wide enough that two
  simulations of the same matchup don't produce identical box scores.
  Keep these conceptually separate in code (two different constants/functions)
  so they can be tuned independently.

### 4.6 Live Script Output
The engine should emit an ordered list of play-by-play events (not just a
final tally) so the frontend can reveal them progressively:
```
PlayEvent {
  quarter, possession_team, type: pass|run|turnover|sack,
  text: "Tom Brady finds Randy Moss for 34 yds — TOUCHDOWN!",
  points_scored, running_score_a, running_score_b
}
```
Frontend consumes this as a queue and reveals one event at a time with a short
delay, updating the scorebug live — this is already working in the prototype.

---

## 5. Phased Roadmap

### Phase 1 — MVP (build first)
- Single season supported (2007), hardcoded player pool
- Draft UI: budget assignment, real stat lines shown per player
- Simulation engine as specified in Section 4, running client-side or in a
  simple backend function
- Head-to-head via shareable link: two players draft blind, simulate, both see
  result
- No login — session-based identity only
- No persistent record across matchups yet (each challenge is self-contained)

### Phase 2 — Head-to-head infrastructure
- Backend to hold matchup state (so drafts can happen async — B doesn't have to
  be online when A drafts)
- Basic head-to-head record tracking between two people (win/loss tally),
  keyed by session or lightweight identity
- Multiple seasons supported — requires building out the stat tables for each
  additional season

### Phase 3 — Accounts
- Login (email or OAuth)
- Persistent profile: overall record, per-opponent record, draft history
- "Previously challenged" list with one-tap rechallenge
- Migrate any session-based history to the account

### Phase 4 — Groups / Seasons
- Create a private group of friends ("league")
- Recurring day-to-day challenges within the group (a daily matchup rotation,
  similar in spirit to 82-0's daily mode but head-to-head)
- Group standings / leaderboard

### Phase 5 — Live game script polish
- Slow-reveal play-by-play already exists in prototype form — refine pacing,
  add sack/2-point/OT edge cases, maybe simple crowd-noise or momentum flavor
  text tied to scoring runs
- Possibly add a "watch mode" so both players can watch the reveal
  simultaneously instead of independently

---

## 6. Open Product Decisions (resolve before Phase 2)

- **Season selection**: fixed daily season for everyone (Wordle-style), or does
  the challenger pick? Picking creates a meta-strategy (choose a season you
  know well) but adds complexity.
- **Async vs. sync drafting**: can B draft hours after A, or does the challenge
  expire if not both drafted within a window?
- **Identity before login**: is a session/device-based identity good enough for
  Phase 1–2, or do you want lightweight named profiles (no auth, just a
  display name) so "previously challenged" can work before full accounts?
- **Tie handling**: replay immediately, or does a tie just not count toward
  either record?

---

## 7. Data Sourcing (the unglamorous part)

Every season you support needs a hand-built or scraped table of 25 players
(5 positions × 5 tiers) with real per-game stat baselines. Options, roughly in
order of effort:
- **Manual curation** (what the prototype used): pick 5 well-known players per
  position per season, look up real season totals, divide by games played.
  Slow but fully controllable and accurate.
- **Pro Football Reference scraping/export**: pull season stat tables
  programmatically, then apply your own tiering logic (e.g. rank by yards or
  a composite score) to auto-select the 5 tiers per position. Much faster to
  scale to many seasons, but you lose editorial control over "is this player
  actually a fun/well-known pick."
- **Hybrid**: auto-pull stats from a data source, but hand-curate *which*
  players make the tier list (so tier 1 stays flavorful/fun rather than just
  "worst starter by yardage").

Given you're already using The Odds API for the betting dashboard, this is a
separate sourcing problem (historical stats, not live odds) — Pro Football
Reference or nflverse/nflfastR data (free, well-documented) are the most
realistic sources to build against.

---

## 8. Suggested Tech Shape

Not prescriptive, but consistent with your existing stack choices:
- **Frontend**: keep it framework-light for MVP (the vanilla JS prototype
  proves the mechanic) or move to React once head-to-head state management
  gets more complex (shared matchup state, live reveal for two viewers).
- **Backend**: minimal — a matchup needs to persist roster A, roster B, and a
  simulation result somewhere both players can fetch it. A simple serverless
  function + database (or even a lightweight key-value store) is enough for
  Phase 1–2. Full accounts/auth in Phase 3 is where a more conventional
  backend (Postgres + auth provider) starts to pay off.
- **Simulation engine**: keep it as a pure function (roster A, roster B, season
  data) → (score, box score, play log). Pure functions are easy to test, easy
  to run client-side for solo/CPU mode, and easy to move server-side later for
  the "trusted" head-to-head result (so a client can't fake a result before
  you have anti-cheat concerns).
