// Draft screen: a single tap grid, $5 (top) down to $1 (bottom) across
// QB/RB/WR/TE/DEF. Tapping a cell assigns that dollar value to that
// position; since each value and each position can only be used once,
// selecting a cell clears any other selection sharing its row or column.
// No stats are shown — the game is about recalling who was actually good
// that season, not reading a spreadsheet.

import { POSITIONS, DOLLAR_VALUES } from "./seasons.js";

const POSITION_LABELS = { QB: "QB", RB: "RB", WR: "WR", TE: "TE", DEF: "DEF" };

function initials(name) {
  const words = name.replace(/[^A-Za-z\s-]/g, "").split(/[\s-]+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function avatarText(pos, player) {
  return pos === "DEF" ? player.team : initials(player.name);
}

export function renderDraftScreen(container, board, seasonLabel, opts = {}) {
  const lockLabel = opts.lockLabel || "Lock In Roster";

  const assignment = {}; // pos -> value
  const byValue = {}; // value -> pos

  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "draft-header";
  header.innerHTML = `
    <h2>${seasonLabel}</h2>
    <p class="budget-hint">Tap a player to spend that $ value on their position. Each value — $5 down to $1 — gets used exactly once.</p>
  `;
  container.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "draft-board";
  container.appendChild(grid);

  // Header row: corner + one header per position
  grid.appendChild(mkEl(`<div class="board-corner"></div>`));
  for (const pos of POSITIONS) {
    grid.appendChild(mkEl(`<div class="board-col-header">${POSITION_LABELS[pos]}</div>`));
  }

  const cellsByPos = {};
  const cellsByValue = {};
  for (const pos of POSITIONS) cellsByPos[pos] = {};
  for (const value of DOLLAR_VALUES) cellsByValue[value] = {};

  for (const value of DOLLAR_VALUES) {
    grid.appendChild(mkEl(`<div class="board-row-header">$${value}</div>`));
    for (const pos of POSITIONS) {
      const player = board[pos][value];
      const cell = mkEl(`
        <button type="button" class="player-cell" data-pos="${pos}" data-value="${value}">
          <span class="avatar">${avatarText(pos, player)}</span>
          <span class="player-name">${player.name}</span>
          <span class="player-team">${player.team}</span>
        </button>
      `);
      cell.addEventListener("click", () => selectCell(pos, value));
      grid.appendChild(cell);
      cellsByPos[pos][value] = cell;
      cellsByValue[value][pos] = cell;
    }
  }

  const lockBtn = document.createElement("button");
  lockBtn.className = "primary-btn lock-btn";
  lockBtn.textContent = lockLabel;
  lockBtn.disabled = true;
  container.appendChild(lockBtn);

  function clearCellVisual(pos, value) {
    cellsByPos[pos][value].classList.remove("selected");
  }

  function selectCell(pos, value) {
    const prevValueForPos = assignment[pos];
    const prevPosForValue = byValue[value];

    if (prevValueForPos === value) {
      // Tapping an already-selected cell deselects it.
      delete assignment[pos];
      delete byValue[value];
      clearCellVisual(pos, value);
      refresh();
      return;
    }

    if (prevValueForPos !== undefined) {
      clearCellVisual(pos, prevValueForPos);
      delete byValue[prevValueForPos];
    }
    if (prevPosForValue !== undefined) {
      clearCellVisual(prevPosForValue, value);
      delete assignment[prevPosForValue];
    }

    assignment[pos] = value;
    byValue[value] = pos;
    cellsByPos[pos][value].classList.add("selected");
    refresh();
  }

  function refresh() {
    const complete = POSITIONS.every((pos) => assignment[pos] !== undefined);
    lockBtn.disabled = !complete;
  }

  lockBtn.addEventListener("click", () => {
    const roster = {};
    for (const pos of POSITIONS) roster[pos] = { tier: assignment[pos] };
    opts.onLockIn && opts.onLockIn(roster);
  });
}

function mkEl(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
