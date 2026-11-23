// Cinder's brain: a short priority list, run through the same rules the player
// uses. It reads the table, not the player's hand, and its choices are meant to be
// readable: it pushes creatures early, heals when it is hurting, and fires its
// burn spells when it smells lethal.
import { CARD_BY_ID } from './cards.js';

/**
 * Pick the cards a side should play this turn, as card ids in play order.
 * The engine looks each id up in the hand again when it plays it, so the list
 * stays right even as the hand shrinks.
 */
export function choosePlays(game, side) {
  const foe = side === game.player ? game.enemy : game.player;
  const plays = [];
  let mana = side.mana;
  const hand = side.hand.slice();
  const boardAttack = game.boardAttack(side);

  const take = (id) => {
    const at = hand.indexOf(id);
    if (at === -1) return false;
    hand.splice(at, 1);
    mana -= CARD_BY_ID.get(id).cost;
    plays.push(id);
    return true;
  };
  const affordable = (id) => hand.includes(id) && CARD_BY_ID.get(id).cost <= mana;
  const damageInHand = () => {
    let total = 0;
    for (const id of hand) {
      const card = CARD_BY_ID.get(id);
      if (card.damage && card.cost <= mana) total += card.damage;
    }
    return total;
  };

  // Lethal first: burn spells that end the duel now.
  if (boardAttack + damageInHand() >= foe.life) {
    for (const id of hand.slice()) {
      const card = CARD_BY_ID.get(id);
      if (card.damage && card.cost <= mana) take(id);
    }
    if (foe.life - boardAttack - damageInHand() <= 0) return plays;
  }
  // Heal while hurting, and only while it matters.
  if (side.life <= 12) {
    if (affordable('mend')) take('mend');
    if (affordable('guard')) take('guard');
  }
  // Refill an empty hand before anything else.
  if (hand.length <= 2 && affordable('tidecall')) take('tidecall');
  // Creatures, biggest first: the table is the plan.
  const creatures = hand
    .filter((id) => CARD_BY_ID.get(id).kind === 'creature')
    .sort((a, b) => CARD_BY_ID.get(b).attack - CARD_BY_ID.get(a).attack);
  for (const id of creatures) {
    if (CARD_BY_ID.get(id).cost <= mana) take(id);
  }
  // Rally only pays when there is a table to rally.
  if (side.board.length >= 2 && affordable('rally')) take('rally');
  // Leftover mana goes to the enemy's face.
  for (const id of hand.slice()) {
    const card = CARD_BY_ID.get(id);
    if (card.damage && card.cost <= mana) take(id);
  }
  if (affordable('tidecall')) take('tidecall');
  return plays;
}
