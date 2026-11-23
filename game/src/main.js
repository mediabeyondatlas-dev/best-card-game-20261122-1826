// Boots Ember Duel: reads ?seed= and ?shot= from the address bar, builds the game,
// binds the input, stages a screenshot scene when asked, and draws the first frame.
// ?shot=title shows the title screen, ?shot=table a mid-duel table, ?shot=win the
// win screen and ?shot=lose the loss screen; every scene plays the real rules from
// a fixed seed, so the same address always shows the same game.
import { Game } from './engine.js';
import { render } from './render.js';
import { bindInput } from './input.js';
import { stageShot } from './shots.js';

// Seeds found by scanning in Node: 7 gives a busy mid-duel table, 3 a player win,
// 11 an enemy win. Pass ?seed= to try another duel.
const SEEDS = { table: 7, win: 3, lose: 11 };

const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') ?? (shot && SEEDS[shot] !== undefined ? SEEDS[shot] : 1)) || 1;

const game = new Game(seed);
bindInput(game, () => render(game));
if (shot) stageShot(game, shot);
render(game);

// A handle the play-tests drive the real game through (clicks, not state edits).
window.__ember = { game, stageShot };
