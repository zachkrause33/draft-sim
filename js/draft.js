// Draft screen: budget assignment (5/4/3/2/1 across QB/RB/WR/TE/DEF).
// Renders into a container element; calls onLockIn(roster) once a full
// valid permutation has been assigned.

import { POSITIONS, TIERS, resolvePlayer } from "./season2007.js";

const POSITION_LABELS = { QB: "Quarterback", RB: "Running Back", WR: "Wide Receiver", TE: "Tight End", DEF: "Defense" };

function statLine(position, stats) {
  switch (position) {
    case "QB":
      return `${stats.comp.toFixed(1)}/${stats.att.toFixed(1)} cmp/att, ${stats.yds.toFixed(1)} yds, ${stats.td.toFixed(2)} TD, ${stats.int.toFixed(2)} INT`;
    case "RB":
      return `${stats.car.toFixed(1)} car, ${stats.yds.toFixed(1)} yds, ${stats.td.toFixed(2)} TD, ${stats.fum.toFixed(2)} fum`;
    case "WR":
    case "TE":
      return `${stats.rec.toFixed(1)} rec, ${stats.yds.toFixed(1)} yds, ${stats.td.toFixed(2)} TD, ${stats.fum.toFixed(2)} fum`;
    case "DEF":
      return `${stats.sacks.toFixed(2)} sacks, ${stats.int.toFixed(2)} INT, ${stats.ff.toFixed(2)} FF, ${stats.ptsAllowed.toFixed(1)} pts allowed`;
    default:
      return "";
  }
}

export function renderDraftScreen(container, season, opts = {}) {
  const title = opts.title || "Draft Your Roster";
  const subtitle = opts.subtitle || "";
  const lockLabel = opts.lockLabel || "Lock In Roster";

  const assignment = { QB: null, RB: null, WR: null, TE: null, DEF: null };

  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "draft-header";
  header.innerHTML = `<h2>${title}</h2>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}
    <p class="budget-hint">Assign 5, 4, 3, 2, and 1 across the five positions — each value used exactly once.</p>`;
  container.appendChild(header);

  const positionsWrap = document.createElement("div");
  positionsWrap.className = "position-grid";
  container.appendChild(positionsWrap);

  const rosterPreview = document.createElement("div");
  rosterPreview.className = "roster-preview";
  container.appendChild(rosterPreview);

  const lockBtn = document.createElement("button");
  lockBtn.className = "primary-btn";
  lockBtn.textContent = lockLabel;
  lockBtn.disabled = true;
  container.appendChild(lockBtn);

  const selects = {};

  function availableValuesFor(position) {
    const used = new Set(
      POSITIONS.filter((p) => p !== position && assignment[p] !== null).map((p) => assignment[p])
    );
    return TIERS.filter((t) => !used.has(t));
  }

  function refreshSelects() {
    for (const pos of POSITIONS) {
      const select = selects[pos];
      const current = assignment[pos];
      const options = availableValuesFor(pos);
      select.innerHTML = `<option value="">—</option>` +
        options.map((t) => `<option value="${t}">${t}</option>`).join("");
      select.value = current === null ? "" : String(current);
    }
    updatePreview();
    const filled = POSITIONS.every((p) => assignment[p] !== null);
    lockBtn.disabled = !filled;
  }

  function updatePreview() {
    const filled = POSITIONS.every((p) => assignment[p] !== null);
    if (!filled) {
      rosterPreview.innerHTML = `<p class="preview-hint">Your locked roster will appear here once every position has a value.</p>`;
      return;
    }
    rosterPreview.innerHTML = `<h3>Your Roster</h3>` + POSITIONS.map((pos) => {
      const player = resolvePlayer(season, pos, assignment[pos]);
      return `<div class="preview-row"><span class="preview-tier">[${assignment[pos]}]</span>
        <span class="preview-pos">${pos}</span>
        <span class="preview-name">${player.name} (${player.team})</span></div>`;
    }).join("");
  }

  for (const pos of POSITIONS) {
    const card = document.createElement("div");
    card.className = "position-card";

    const players = season.positions[pos].slice().sort((a, b) => b.tier - a.tier);
    const rows = players.map((p) => `
      <tr>
        <td class="tier-cell">${p.tier}</td>
        <td>${p.name} <span class="team-tag">${p.team}</span></td>
        <td class="stat-cell">${statLine(pos, p.stats)}</td>
      </tr>`).join("");

    card.innerHTML = `
      <div class="position-card-head">
        <h3>${POSITION_LABELS[pos]}</h3>
        <label class="value-select-label">Value:
          <select data-pos="${pos}"></select>
        </label>
      </div>
      <table class="player-table">
        <thead><tr><th>Tier</th><th>Player</th><th>Per-game avg</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    positionsWrap.appendChild(card);
    const select = card.querySelector("select");
    selects[pos] = select;
    select.addEventListener("change", () => {
      assignment[pos] = select.value === "" ? null : Number(select.value);
      refreshSelects();
    });
  }

  refreshSelects();

  lockBtn.addEventListener("click", () => {
    const roster = {};
    for (const pos of POSITIONS) roster[pos] = { tier: assignment[pos] };
    opts.onLockIn && opts.onLockIn(roster);
  });

  return {
    randomize() {
      const shuffled = TIERS.slice().sort(() => Math.random() - 0.5);
      POSITIONS.forEach((pos, i) => (assignment[pos] = shuffled[i]));
      refreshSelects();
    },
  };
}
