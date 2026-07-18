import { SEASONS, POSITIONS, DOLLAR_VALUES, pickRandomSeasonId, buildBoard } from "./seasons.js";
import { simulateGame } from "./simulation.js";
import { renderDraftScreen } from "./draft.js";
import {
  buildShareUrl,
  readUrlPayload,
  makeChallengeId,
  saveLocalChallenge,
} from "./challenge.js";

const view = document.getElementById("view");

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

function randomRoster() {
  const shuffled = DOLLAR_VALUES.slice().sort(() => Math.random() - 0.5);
  const roster = {};
  POSITIONS.forEach((pos, i) => (roster[pos] = { tier: shuffled[i] }));
  return roster;
}

function resolvePlayers(roster, board) {
  const players = {};
  for (const pos of POSITIONS) players[pos] = board[pos][roster[pos].tier];
  return players;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

function newSeasonInstance() {
  const seasonId = pickRandomSeasonId();
  const season = SEASONS[seasonId];
  const board = buildBoard(season);
  return { seasonId, seasonLabel: season.label, board };
}

// ---------- Landing ----------

function renderLanding() {
  view.innerHTML = "";
  view.appendChild(el(`
    <section class="landing">
      <p class="landing-blurb">Every game is a different real NFL season. Tap a $ value onto each
      position to build a 5-man roster — QB, RB, WR, TE, DEF — using $5, $4, $3, $2, and $1 exactly
      once. No stats on the board: it's on you to remember who actually mattered that year.</p>
      <div class="landing-actions">
        <button id="new-challenge-btn" class="primary-btn">Start a New Challenge</button>
        <button id="practice-btn" class="secondary-btn">Practice vs CPU</button>
      </div>
    </section>
  `));
  document.getElementById("new-challenge-btn").addEventListener("click", startNewChallenge);
  document.getElementById("practice-btn").addEventListener("click", startPractice);
}

// ---------- New challenge (Player A) ----------

function startNewChallenge() {
  const { seasonId, seasonLabel, board } = newSeasonInstance();

  view.innerHTML = "";
  const wrap = el(`<section class="draft-screen"></section>`);
  view.appendChild(wrap);

  wrap.appendChild(el(`
    <div class="name-input-row">
      <label>Your display name: <input type="text" id="labelA" value="Player A" maxlength="20" /></label>
    </div>
  `));

  const draftContainer = el(`<div></div>`);
  wrap.appendChild(draftContainer);

  renderDraftScreen(draftContainer, board, seasonLabel, {
    lockLabel: "Lock In & Generate Challenge Link",
    onLockIn: (roster) => {
      const labelA = document.getElementById("labelA").value.trim() || "Player A";
      const challengeId = makeChallengeId();
      saveLocalChallenge(challengeId, { roster, labelA, seasonId });
      const shareUrl = buildShareUrl("duel", { challengeId, seasonId, seasonLabel, board, rosterA: roster, labelA });
      renderShareScreen(shareUrl, labelA);
    },
  });
}

function renderShareScreen(shareUrl, labelA) {
  view.innerHTML = "";
  view.appendChild(el(`
    <section class="share-screen">
      <h2>Your roster is locked in, ${labelA}.</h2>
      <p>Send this link to your opponent. They'll draft blind from the exact same board you just
      saw, then the game simulates immediately for them.</p>
      <div class="share-link-row">
        <input type="text" id="share-url" readonly value="${shareUrl}" />
        <button id="copy-btn" class="secondary-btn">Copy Link</button>
      </div>
      <p class="waiting-note">Once they play, they'll get a <strong>result link</strong> to send back to you
      so you can see the same reveal.</p>
      <button id="back-home-btn" class="link-btn">Back to Home</button>
    </section>
  `));
  document.getElementById("copy-btn").addEventListener("click", () => {
    copyToClipboard(shareUrl);
    const btn = document.getElementById("copy-btn");
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "Copy Link"), 1500);
  });
  document.getElementById("back-home-btn").addEventListener("click", () => {
    window.location.hash = "";
    renderLanding();
  });
}

// ---------- Accepting a challenge (Player B) ----------

function startAcceptChallenge(payload) {
  const { challengeId, seasonLabel, board, rosterA, labelA } = payload.data;
  view.innerHTML = "";

  view.appendChild(el(`
    <section class="challenge-intro">
      <h2>${labelA} has challenged you!</h2>
      <p>They've already drafted their ${seasonLabel} roster from the board below, in secret.
      Draft yours to find out how it plays out.</p>
    </section>
  `));

  const wrap = el(`<section class="draft-screen"></section>`);
  view.appendChild(wrap);

  wrap.appendChild(el(`
    <div class="name-input-row">
      <label>Your display name: <input type="text" id="labelB" value="Player B" maxlength="20" /></label>
    </div>
  `));

  const draftContainer = el(`<div></div>`);
  wrap.appendChild(draftContainer);

  renderDraftScreen(draftContainer, board, seasonLabel, {
    lockLabel: "Lock In & Simulate Game",
    onLockIn: (rosterB) => {
      const labelB = document.getElementById("labelB").value.trim() || "Player B";
      const result = simulateGame(rosterA, rosterB, board, { labelA, labelB });
      const resultShareUrl = buildShareUrl("result", {
        challengeId,
        seasonLabel,
        board,
        labelA,
        labelB,
        rosterA,
        rosterB,
        result: {
          scoreA: result.scoreA,
          scoreB: result.scoreB,
          boxScoreA: result.boxScoreA,
          boxScoreB: result.boxScoreB,
          playLog: result.playLog,
        },
      });
      renderRevealScreen(result, labelA, labelB, resultShareUrl);
    },
  });
}

// ---------- Practice vs CPU ----------

function startPractice() {
  const { seasonLabel, board } = newSeasonInstance();

  view.innerHTML = "";
  const wrap = el(`<section class="draft-screen"></section>`);
  view.appendChild(wrap);
  wrap.appendChild(el(`<p class="subtitle">Practice mode: the CPU drafts a random roster from the same board the moment you lock yours in.</p>`));

  const draftContainer = el(`<div></div>`);
  wrap.appendChild(draftContainer);

  renderDraftScreen(draftContainer, board, seasonLabel, {
    lockLabel: "Lock In & Simulate vs CPU",
    onLockIn: (roster) => {
      const cpuRoster = randomRoster();
      const labelA = "You";
      const labelB = "CPU";
      const result = simulateGame(roster, cpuRoster, board, { labelA, labelB });
      renderRevealScreen(result, labelA, labelB, null);
    },
  });
}

// ---------- Reveal (live play-by-play + box score) ----------

function boxScoreTable(labelTeam, playersMap, box) {
  const rows = POSITIONS.map((pos) => {
    const player = playersMap[pos];
    let statStr = "";
    const b = box[pos];
    if (pos === "QB") statStr = `${b.comp.toFixed(1)}/${b.att.toFixed(1)}, ${b.yds} yds, ${b.td} TD, ${b.int} INT`;
    else if (pos === "RB") statStr = `${b.car.toFixed(1)} car, ${b.yds} yds, ${b.td} TD, ${b.fum} fum`;
    else if (pos === "WR" || pos === "TE") statStr = `${b.rec.toFixed(1)} rec, ${b.yds} yds, ${b.td} TD, ${b.fum} fum`;
    else if (pos === "DEF") statStr = `${b.sacks} sacks, ${b.int} INT, ${b.ff} FF`;
    return `<tr><td>${pos}</td><td>${player.name}</td><td>${statStr}</td></tr>`;
  }).join("");

  return `
    <div class="box-score">
      <h3>${labelTeam}</h3>
      <table class="player-table">
        <thead><tr><th>Pos</th><th>Player</th><th>Line</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function ordinal(q) {
  return ["1st", "2nd", "3rd", "4th", "OT"][q - 1] || `Q${q}`;
}

// Ball position as a % across the whole field (endzones included). A drives
// left→right, B right→left; yard is 0 (own goal) to 100 (opponent goal).
function ballLeftPercent(driveTeam, yard) {
  return driveTeam === "A" ? 10 + (yard / 100) * 80 : 90 - (yard / 100) * 80;
}

const TEAM_A_COLOR = "var(--pos-qb)"; // gold
const TEAM_B_COLOR = "var(--pos-def)"; // blue

function renderRevealScreen(result, labelA, labelB, resultShareUrl) {
  view.innerHTML = "";

  // --- Scorebug ---
  view.appendChild(el(`
    <div class="scorebug">
      <div class="scorebug-team"><span class="scorebug-label">${labelA}</span><span id="score-a" class="scorebug-score">0</span></div>
      <div class="scorebug-clock"><span id="sb-clock">1st · 15:00</span></div>
      <div class="scorebug-team"><span class="scorebug-label">${labelB}</span><span id="score-b" class="scorebug-score">0</span></div>
    </div>
  `));

  // --- Live field ---
  const field = el(`
    <div class="field" style="--team-a-color:${TEAM_A_COLOR}; --team-b-color:${TEAM_B_COLOR};">
      <div class="endzone endzone-a"><span>${labelA}</span></div>
      <div class="endzone endzone-b"><span>${labelB}</span></div>
      <div class="field-grass"></div>
      <div class="ball" id="ball"></div>
      <div class="poss-banner" id="poss-banner"><strong id="poss-team"></strong><span class="poss-sub">Possession</span></div>
    </div>
  `);
  view.appendChild(field);
  const ball = field.querySelector("#ball");
  const possBanner = field.querySelector("#poss-banner");
  const possTeam = field.querySelector("#poss-team");
  const endzoneA = field.querySelector(".endzone-a");
  const endzoneB = field.querySelector(".endzone-b");

  // --- Controls ---
  const controls = el(`
    <div class="reveal-controls">
      <button id="speed-btn" class="secondary-btn" type="button">Speed: 1×</button>
      <button id="skip-btn" class="secondary-btn" type="button">Skip to Final</button>
    </div>
  `);
  view.appendChild(controls);

  // --- Play feed ---
  const log = el(`<div class="play-log"></div>`);
  view.appendChild(log);

  // --- Box score + actions (hidden until final) ---
  const boxWrap = el(`<div class="box-scores" style="display:none;"></div>`);
  boxWrap.innerHTML = boxScoreTable(labelA, result.playersA, result.boxScoreA) + boxScoreTable(labelB, result.playersB, result.boxScoreB);
  view.appendChild(boxWrap);

  const footerActions = el(`<div class="reveal-actions" style="display:none;"></div>`);
  view.appendChild(footerActions);

  const events = result.playLog;
  let i = 0;
  let speed = 1;
  let timer = null;
  let done = false;

  const scoreAEl = document.getElementById("score-a");
  const scoreBEl = document.getElementById("score-b");
  const clockEl = document.getElementById("sb-clock");

  function applyState(evt) {
    scoreAEl.textContent = evt.runningScoreA;
    scoreBEl.textContent = evt.runningScoreB;
    if (evt.clock) clockEl.textContent = `${ordinal(evt.quarter)} · ${evt.clock}`;
  }

  function appendFeed(evt) {
    const line = el(`<div class="play-event play-${evt.type}">
      <span class="play-quarter">${ordinal(evt.quarter)}</span>
      <span class="play-text">${evt.text}</span>
    </div>`);
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  function animateBall(evt) {
    const startPct = ballLeftPercent(evt.driveTeam, evt.startYard);
    const endPct = ballLeftPercent(evt.driveTeam, evt.endYard);
    const slideMs = Math.round(1300 / speed);
    // Snap to the line of scrimmage, then slide to the result.
    ball.style.transition = "none";
    ball.style.left = startPct + "%";
    ball.classList.add("ball-live");
    // force reflow so the next transition takes effect
    void ball.offsetWidth;
    ball.style.transition = `left ${slideMs}ms cubic-bezier(0.33, 0.9, 0.36, 1)`;
    ball.style.left = endPct + "%";

    const teamColor = evt.driveTeam === "A" ? TEAM_A_COLOR : TEAM_B_COLOR;
    possTeam.textContent = evt.possessionTeam;
    possBanner.style.setProperty("--poss-color", teamColor);
    possBanner.classList.add("visible");

    if (evt.points === 7) {
      const ez = evt.driveTeam === "A" ? endzoneB : endzoneA;
      setTimeout(() => ez.classList.add("flash"), slideMs);
      setTimeout(() => ez.classList.remove("flash"), slideMs + 700);
    }
  }

  function finish() {
    if (done) return;
    done = true;
    if (timer) { clearTimeout(timer); timer = null; }
    possBanner.classList.remove("visible");
    controls.style.display = "none";
    boxWrap.style.display = "";
    footerActions.style.display = "";
    if (resultShareUrl) {
      footerActions.innerHTML = `
        <p>Send this result link back to ${labelA} so they can see the same reveal:</p>
        <div class="share-link-row">
          <input type="text" readonly value="${resultShareUrl}" id="result-share-url" />
          <button id="copy-result-btn" class="secondary-btn">Copy Link</button>
        </div>
        <button id="back-home-btn-2" class="link-btn">Back to Home</button>
      `;
      const copyBtn = footerActions.querySelector("#copy-result-btn");
      copyBtn.addEventListener("click", () => {
        copyToClipboard(resultShareUrl);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy Link"), 1500);
      });
    } else {
      footerActions.innerHTML = `<button id="back-home-btn-2" class="link-btn">Back to Home</button>`;
    }
    footerActions.querySelector("#back-home-btn-2").addEventListener("click", () => {
      window.location.hash = "";
      renderLanding();
    });
  }

  function step() {
    if (i >= events.length) { finish(); return; }
    const evt = events[i];
    i++;
    applyState(evt);
    appendFeed(evt);

    let dur;
    if (evt.type === "info") {
      dur = 1500;
    } else if (evt.type === "final") {
      timer = setTimeout(finish, Math.round(700 / speed));
      return;
    } else {
      animateBall(evt);
      dur = 2500;
    }
    timer = setTimeout(step, Math.round(dur / speed));
  }

  function skipToEnd() {
    if (timer) { clearTimeout(timer); timer = null; }
    while (i < events.length) {
      const evt = events[i];
      i++;
      applyState(evt);
      appendFeed(evt);
    }
    finish();
  }

  controls.querySelector("#speed-btn").addEventListener("click", () => {
    speed = speed === 1 ? 2 : 1;
    controls.querySelector("#speed-btn").textContent = `Speed: ${speed}×`;
  });
  controls.querySelector("#skip-btn").addEventListener("click", skipToEnd);

  step();
}

// ---------- Routing ----------

function route() {
  const payload = readUrlPayload();
  if (payload && payload.kind === "duel") {
    startAcceptChallenge(payload);
    return;
  }
  if (payload && payload.kind === "result") {
    const { labelA, labelB, rosterA, rosterB, board, result } = payload.data;
    const fullResult = {
      ...result,
      playersA: resolvePlayers(rosterA, board),
      playersB: resolvePlayers(rosterB, board),
    };
    renderRevealScreen(fullResult, labelA, labelB, null);
    return;
  }
  renderLanding();
}

window.addEventListener("hashchange", route);
route();
