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

function renderRevealScreen(result, labelA, labelB, resultShareUrl) {
  view.innerHTML = "";

  const scorebug = el(`
    <div class="scorebug">
      <div class="scorebug-team"><span class="scorebug-label">${labelA}</span><span id="score-a" class="scorebug-score">0</span></div>
      <div class="scorebug-team"><span class="scorebug-label">${labelB}</span><span id="score-b" class="scorebug-score">0</span></div>
    </div>
  `);
  view.appendChild(scorebug);

  const log = el(`<div class="play-log"></div>`);
  view.appendChild(log);

  const boxWrap = el(`<div class="box-scores" style="display:none;"></div>`);
  boxWrap.innerHTML = boxScoreTable(labelA, result.playersA, result.boxScoreA) + boxScoreTable(labelB, result.playersB, result.boxScoreB);
  view.appendChild(boxWrap);

  const footerActions = el(`<div class="reveal-actions" style="display:none;"></div>`);
  view.appendChild(footerActions);

  let i = 0;
  const events = result.playLog;
  function revealNext() {
    if (i >= events.length) {
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
      return;
    }
    const evt = events[i];
    const line = el(`<div class="play-event play-${evt.type}">
      <span class="play-quarter">Q${evt.quarter}</span>
      <span class="play-text">${evt.text}</span>
    </div>`);
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    document.getElementById("score-a").textContent = evt.runningScoreA;
    document.getElementById("score-b").textContent = evt.runningScoreB;
    i++;
    setTimeout(revealNext, evt.type === "final" ? 200 : 450);
  }
  revealNext();
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
