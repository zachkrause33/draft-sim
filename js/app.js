import { SEASON_2007, POSITIONS, TIERS } from "./season2007.js";
import { simulateGame } from "./simulation.js";
import { renderDraftScreen } from "./draft.js";
import {
  buildShareUrl,
  readUrlPayload,
  makeChallengeId,
  saveLocalChallenge,
  loadLocalChallenge,
} from "./challenge.js";

const view = document.getElementById("view");
const season = SEASON_2007;

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

function randomRoster() {
  const shuffled = TIERS.slice().sort(() => Math.random() - 0.5);
  const roster = {};
  POSITIONS.forEach((pos, i) => (roster[pos] = { tier: shuffled[i] }));
  return roster;
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
}

// ---------- Landing ----------

function renderLanding() {
  view.innerHTML = "";
  view.appendChild(el(`
    <section class="landing">
      <h2>${season.label}</h2>
      <p>Draft a 5-man roster — QB, RB, WR, TE, DEF — from real ${season.id} players.
      Assign the values 5, 4, 3, 2, and 1 across those positions, each used exactly once.
      The value you put on a position decides which tiered player you get there.</p>
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
  view.innerHTML = "";
  const wrap = el(`<section class="draft-screen"></section>`);
  view.appendChild(wrap);

  const nameWrap = el(`
    <div class="name-input-row">
      <label>Your display name: <input type="text" id="labelA" value="Player A" maxlength="20" /></label>
    </div>
  `);
  wrap.appendChild(nameWrap);

  const draftContainer = el(`<div></div>`);
  wrap.appendChild(draftContainer);

  renderDraftScreen(draftContainer, season, {
    title: "Draft Your Roster",
    subtitle: "This roster stays hidden from your opponent until they lock in theirs.",
    lockLabel: "Lock In & Generate Challenge Link",
    onLockIn: (roster) => {
      const labelA = document.getElementById("labelA").value.trim() || "Player A";
      const challengeId = makeChallengeId();
      saveLocalChallenge(challengeId, { roster, labelA, seasonId: season.id });
      const shareUrl = buildShareUrl("duel", { challengeId, seasonId: season.id, rosterA: roster, labelA });
      renderShareScreen(shareUrl, labelA);
    },
  });
}

function renderShareScreen(shareUrl, labelA) {
  view.innerHTML = "";
  view.appendChild(el(`
    <section class="share-screen">
      <h2>Your roster is locked in, ${labelA}.</h2>
      <p>Send this link to your opponent. When they open it, they'll draft their own roster
      (yours stays hidden) and the game will simulate immediately for them.</p>
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
  const { challengeId, rosterA, labelA } = payload.data;
  view.innerHTML = "";

  const intro = el(`
    <section class="challenge-intro">
      <h2>${labelA} has challenged you!</h2>
      <p>They've already drafted their ${season.label} roster in secret. Draft yours to find out
      how it plays out — you won't see their picks until after the game.</p>
    </section>
  `);
  view.appendChild(intro);

  const wrap = el(`<section class="draft-screen"></section>`);
  view.appendChild(wrap);

  const nameWrap = el(`
    <div class="name-input-row">
      <label>Your display name: <input type="text" id="labelB" value="Player B" maxlength="20" /></label>
    </div>
  `);
  wrap.appendChild(nameWrap);

  const draftContainer = el(`<div></div>`);
  wrap.appendChild(draftContainer);

  renderDraftScreen(draftContainer, season, {
    title: "Draft Your Roster",
    subtitle: `Facing ${labelA}'s hidden roster.`,
    lockLabel: "Lock In & Simulate Game",
    onLockIn: (rosterB) => {
      const labelB = document.getElementById("labelB").value.trim() || "Player B";
      const result = simulateGame(rosterA, rosterB, season, { labelA, labelB });
      const resultShareUrl = buildShareUrl("result", {
        challengeId,
        seasonId: season.id,
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
  view.innerHTML = "";
  const wrap = el(`<section class="draft-screen"></section>`);
  view.appendChild(wrap);
  wrap.appendChild(el(`<p class="subtitle">Practice mode: the CPU drafts a random roster the moment you lock yours in.</p>`));

  const draftContainer = el(`<div></div>`);
  wrap.appendChild(draftContainer);

  renderDraftScreen(draftContainer, season, {
    title: "Draft Your Roster",
    lockLabel: "Lock In & Simulate vs CPU",
    onLockIn: (roster) => {
      const cpuRoster = randomRoster();
      const labelA = "You";
      const labelB = "CPU";
      const result = simulateGame(roster, cpuRoster, season, { labelA, labelB });
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
    const { labelA, labelB, rosterA, rosterB, result } = payload.data;
    const fullResult = {
      ...result,
      playersA: resolveTeamPlayers(rosterA),
      playersB: resolveTeamPlayers(rosterB),
    };
    renderRevealScreen(fullResult, labelA, labelB, null);
    return;
  }
  renderLanding();
}

function resolveTeamPlayers(roster) {
  const players = {};
  for (const pos of POSITIONS) {
    players[pos] = season.positions[pos].find((p) => p.tier === roster[pos].tier);
  }
  return players;
}

window.addEventListener("hashchange", route);
route();
