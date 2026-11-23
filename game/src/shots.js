// The screenshot scenes behind ?shot=title|table|win|lose. Each one plays the real
// rules forward from a fresh game with a fixed seed, both sides driven by the same
// card-playing heuristic the AI uses, so every frame is what a real duel looks like
// and the same seed always gives the same frame. No state is ever set by hand.
import { choosePlays } from './ai.js';

/** Play one side's turn with the shared heuristic, through the real rules. */
function autopilotTurn(game, side, who) {
  for (const id of choosePlays(game, side)) {
    const index = side.hand.indexOf(id);
    if (index === -1) break;
    if (!game.playCard(side, index, who)) break;
    if (game.phase !== 'play') return;
  }
}

/**
 * Drive a fresh game to the named scene and return the seed that produced it.
 * table: stop mid-duel on the player's turn, both tables busy. win/lose: play a
 * whole duel out until one side falls. The caller picks seeds that land as named;
 * the defaults below were found by scanning seeds in Node (see README).
 */
export function stageShot(game, name) {
  game.reset();
  if (name !== 'table' && name !== 'win' && name !== 'lose') return;
  game.start();
  const wantWin = name === 'win';
  const wantLose = name === 'lose';
  // At most 40 turns: every duel ends long before that.
  for (let turn = 0; turn < 40 && game.phase === 'play'; turn += 1) {
    if (name === 'table' && turn >= 5) return; // mid-duel, player's turn, tables busy
    autopilotTurn(game, game.player, 'You');
    if (game.phase !== 'play') break;
    game.endPlayerTurn();
    if (game.phase !== 'play') break;
    if (wantWin && game.phase === 'play' && game.enemy.life <= 0) break;
    if (wantLose && game.phase === 'play' && game.player.life <= 0) break;
  }
}
