// The card pool of Ember Duel. Four elements, told apart by colour and by shape:
// Ember is a flame, Tide a droplet, Leaf a leaf, Stone a mountain. Every card is an
// original name and idea of this game; none is borrowed from a commercial game.
export const ELEMENTS = {
  ember: { name: 'Ember', color: '#e5484d', dark: '#8f1d22', glyph: 'flame' },
  tide: { name: 'Tide', color: '#2f7fe0', dark: '#174a8f', glyph: 'drop' },
  leaf: { name: 'Leaf', color: '#3d9b4f', dark: '#1d5c2a', glyph: 'leaf' },
  stone: { name: 'Stone', color: '#c98a2e', dark: '#7a5212', glyph: 'peak' },
};

// kind: 'creature' stays on the table and strikes at the end of its owner's turn;
// kind: 'spell' resolves at once and is gone. attack is the damage a creature deals
// each turn; damage/heal/draw/rally are the spell's numbers.
export const CARDS = [
  { id: 'imp', name: 'Ember Imp', element: 'ember', cost: 1, kind: 'creature', attack: 1, text: 'A small spark.' },
  { id: 'sprite', name: 'Spark Sprite', element: 'ember', cost: 2, kind: 'creature', attack: 2, text: 'It dances, it burns.' },
  { id: 'drake', name: 'Flame Drake', element: 'ember', cost: 4, kind: 'creature', attack: 4, text: 'One wingbeat ends it.' },
  { id: 'bolt', name: 'Spark Bolt', element: 'ember', cost: 2, kind: 'spell', damage: 3, text: 'Deal 3 damage.' },
  { id: 'meteor', name: 'Sky Meteor', element: 'ember', cost: 5, kind: 'spell', damage: 6, text: 'Deal 6 damage.' },
  { id: 'wisp', name: 'Tide Wisp', element: 'tide', cost: 2, kind: 'creature', attack: 2, text: 'It flows to the fight.' },
  { id: 'guard', name: 'Coral Guard', element: 'tide', cost: 3, kind: 'creature', attack: 2, heal: 3, text: 'Heal 3 on summon.' },
  { id: 'tidecall', name: 'Tide Call', element: 'tide', cost: 1, kind: 'spell', draw: 2, text: 'Draw 2 cards.' },
  { id: 'sprout', name: 'Thorn Sprout', element: 'leaf', cost: 1, kind: 'creature', attack: 1, text: 'Small, sharp, everywhere.' },
  { id: 'lurker', name: 'Vine Lurker', element: 'leaf', cost: 3, kind: 'creature', attack: 3, text: 'It hid under the table.' },
  { id: 'mend', name: 'Root Mend', element: 'leaf', cost: 2, kind: 'spell', heal: 6, text: 'Restore 6 life.' },
  { id: 'pup', name: 'Pebble Pup', element: 'stone', cost: 1, kind: 'creature', attack: 1, text: 'Loyal and hard to move.' },
  { id: 'golem', name: 'Stone Golem', element: 'stone', cost: 4, kind: 'creature', attack: 3, text: 'It does not hurry.' },
  { id: 'rally', name: 'War Rally', element: 'stone', cost: 2, kind: 'spell', rally: 1, text: 'Creatures +1 attack.' },
];

export const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

/** How many copies of each card a deck holds: 24 cards, two of most, one of the big ones. */
const DECKLIST = [
  ['imp', 2], ['sprite', 2], ['drake', 1], ['bolt', 2], ['meteor', 1],
  ['wisp', 2], ['guard', 2], ['tidecall', 1],
  ['sprout', 2], ['lurker', 2], ['mend', 2],
  ['pup', 2], ['golem', 2], ['rally', 1],
];

/** A fresh shuffled deck of card ids, drawn only from the given random function. */
export function buildDeck(rand) {
  const ids = [];
  for (const [id, count] of DECKLIST) {
    for (let i = 0; i < count; i += 1) ids.push(id);
  }
  // Shuffle a copy so the decklist itself never changes order.
  const out = ids.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
