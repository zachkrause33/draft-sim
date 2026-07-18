// Draft screen: a single tap grid, $5 (top) down to $1 (bottom) across
// QB/RB/WR/TE/DEF. Tapping a cell assigns that dollar value to that
// position; since each value and each position can only be used once,
// selecting a cell clears any other selection sharing its row or column.
// No stats are shown — the game is about recalling who was actually good
// that season, not reading a spreadsheet.
//
// Offensive players show a position-colored jersey with their real number.
// A defense is a whole team, not one player, so it shows a helmet chip and
// keeps its team name.

import { POSITIONS, DOLLAR_VALUES } from "./seasons.js";

const POSITION_LABELS = { QB: "QB", RB: "RB", WR: "WR", TE: "TE", DEF: "DEF" };

// Inline SVG so it renders in the sandboxed shareable preview too (no
// external image requests). Jersey fill is set via CSS (currentColor-like)
// using the position class on the cell.
function jerseySvg(num) {
  return `
    <svg class="kit kit-jersey" viewBox="0 0 48 48" aria-hidden="true">
      <path class="kit-fill" d="M17 6 L20 6 L24 10 L28 6 L31 6 L44 13 L39 22 L33 19 L33 43 L15 43 L15 19 L9 22 L4 13 Z"/>
      <text class="kit-num" x="24" y="34" text-anchor="middle">${num != null ? num : ""}</text>
    </svg>`;
}

function helmetSvg() {
  return `
    <svg class="kit kit-helmet" viewBox="0 0 48 48" aria-hidden="true">
      <path class="kit-fill" d="M8 26 C8 13 20 8 28 10 C39 12 42 21 42 26 L24 28 Z"/>
      <path class="kit-fill" d="M24 27 L41 25 C41 31 37 34 31 34 L26 34 Z"/>
      <rect class="kit-mask" x="22" y="27" width="15" height="3.4" rx="1.7"/>
    </svg>`;
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
  for (const pos of POSITIONS) cellsByPos[pos] = {};

  for (const value of DOLLAR_VALUES) {
    grid.appendChild(mkEl(`<div class="board-row-header">$${value}</div>`));
    for (const pos of POSITIONS) {
      const player = board[pos][value];
      const kit = pos === "DEF" ? helmetSvg() : jerseySvg(player.num);
      const cell = mkEl(`
        <button type="button" class="player-cell" data-pos="${pos}" data-value="${value}">
          <span class="kit-wrap">${kit}</span>
          <span class="player-name">${player.name}</span>
        </button>
      `);
      cell.addEventListener("click", () => selectCell(pos, value));
      grid.appendChild(cell);
      cellsByPos[pos][value] = cell;
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
