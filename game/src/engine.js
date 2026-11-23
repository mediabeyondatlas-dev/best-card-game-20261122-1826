// The rules of Ember Duel, with no DOM in them: a pure state machine the renderer
// draws and the screenshot scenes drive. Both duelists start at 30 life. A turn is:
// gain 1 max mana (up to 10), refill mana, draw a card, play what you can afford,
// then your creatures strike the enemy. End your turn and the same happens for the
// other side. The first duelist at 0 life loses.
import { CARD_BY_ID, buildDeck } from './cards.js';
import { choosePlays } from './ai.js';
import { mulberry32 } from './random.js';

export const START_LIFE = 30;
export const MAX_MANA = 10;
export const HAND_LIMIT = 7;
export const OPENING_HAND = 3;

/** One duelist's side of the table. */
function freshSide(deck) {
  return {
    life: START_LIFE,
    maxMana: 0,
    mana: 0,
    deck,
    hand: [],
    board: [], // creature instances: { id, attack, bonus }
    played: 0,
  };
}

export class Game {
  constructor(seed = 1) {
    this.seed = seed;
    this.rand = mulberry32(seed);
    this.reset();
  }

  reset() {
    this.rand = mulberry32(this.seed);
    this.player = freshSide(buildDeck(this.rand));
    this.enemy = freshSide(buildDeck(this.rand));
    this.turn = 1;
    this.phase = 'title'; // title | play | won | lost
    this.log = ['The duel is about to begin.'];
    this.lastPlay = null;
    this.drawOpeningHands();
  }

  drawOpeningHands() {
    // The second duelist draws one more: going second is a tempo loss in a game
    // where creatures strike the turn they are played, and the extra card evens it.
    for (let i = 0; i < OPENING_HAND; i += 1) {
      this.drawCard(this.player);
      this.drawCard(this.enemy);
    }
    this.drawCard(this.enemy);
  }

  drawCard(side) {
    if (side.deck.length === 0 || side.hand.length >= HAND_LIMIT) return null;
    const id = side.deck.pop();
    side.hand.push(id);
    return id;
  }

  start() {
    if (this.phase !== 'title') return;
    this.phase = 'play';
    this.beginTurn(this.player, 'You');
  }

  beginTurn(side, who) {
    side.maxMana = Math.min(MAX_MANA, side.maxMana + 1);
    side.mana = side.maxMana;
    // Creatures wake at the start of their owner's turn: one summoned this turn
    // rests until the next, so the table is built a turn ahead, not rushed.
    for (const creature of side.board) creature.ready = true;
    const drawn = this.drawCard(side);
    this.say(`${who} begin turn ${this.turn}: ${side.mana} mana${drawn ? `, drew ${CARD_BY_ID.get(drawn).name}` : ', deck empty'}.`);
  }

  say(text) {
    this.log.push(text);
    if (this.log.length > 3) this.log.shift();
  }

  /** The card object for a hand slot, or null. */
  handCard(side, index) {
    const id = side.hand[index];
    return id === undefined ? null : CARD_BY_ID.get(id);
  }

  canPlay(side, index) {
    if (this.phase !== 'play') return false;
    const card = this.handCard(side, index);
    return card !== null && side.mana >= card.cost;
  }

  /** Play the card at a hand index. Returns true when the card was played. */
  playCard(side, index, who) {
    if (!this.canPlay(side, index)) return false;
    const card = this.handCard(side, index);
    side.hand.splice(index, 1);
    side.mana -= card.cost;
    side.played += 1;
    this.lastPlay = { who, card: card.id, at: Date.now() };
    if (card.kind === 'creature') {
      side.board.push({ id: card.id, attack: card.attack, bonus: 0, ready: false });
      this.say(`${who} summoned ${card.name} (${card.attack} attack).`);
      if (card.heal) this.heal(side, card.heal, who);
    } else {
      this.resolveSpell(side, card, who);
    }
    this.checkEnd();
    return true;
  }

  resolveSpell(side, card, who) {
    const foe = side === this.player ? this.enemy : this.player;
    if (card.damage) {
      this.damage(foe, card.damage);
      this.say(`${who} cast ${card.name} for ${card.damage} damage.`);
    }
    if (card.heal) {
      this.heal(side, card.heal, who);
      this.say(`${who} cast ${card.name} and recovered ${card.heal} life.`);
    }
    if (card.draw) {
      const drawn = [];
      for (let i = 0; i < card.draw; i += 1) {
        const id = this.drawCard(side);
        if (id) drawn.push(CARD_BY_ID.get(id).name);
      }
      this.say(`${who} cast ${card.name} and drew ${drawn.length} card${drawn.length === 1 ? '' : 's'}.`);
    }
    if (card.rally) {
      for (const creature of side.board) creature.bonus += card.rally;
      this.say(`${who} cast ${card.name}: creatures gain +${card.rally} attack.`);
    }
  }

  damage(side, amount) {
    side.life = Math.max(0, side.life - amount);
  }

  heal(side, amount, who) {
    const before = side.life;
    side.life = Math.min(START_LIFE, side.life + amount);
    if (side.life > before) this.say(`${who} recovered ${side.life - before} life.`);
  }

  /** Total attack of a side's creatures that are awake and ready to strike. */
  boardAttack(side) {
    let total = 0;
    for (const creature of side.board) {
      if (creature.ready) total += creature.attack + creature.bonus;
    }
    return total;
  }

  /** Creatures strike, then the turn passes. Called only on the player's End Turn. */
  endPlayerTurn() {
    if (this.phase !== 'play') return;
    this.strike(this.player, this.enemy, 'Your creatures');
    if (this.checkEnd()) return;
    this.enemyTurn();
    if (this.checkEnd()) return;
    this.turn += 1;
    this.beginTurn(this.player, 'You');
    this.checkEnd();
  }

  strike(attacker, defender, who) {
    const power = this.boardAttack(attacker);
    if (power > 0) {
      this.damage(defender, power);
      this.say(`${who} strike for ${power} damage.`);
    } else {
      this.say(`${who} have nothing on the table.`);
    }
  }

  /** The AI takes its turn through the same rules the player uses. */
  enemyTurn() {
    this.beginTurn(this.enemy, 'Cinder');
    for (const id of choosePlays(this, this.enemy)) {
      if (this.phase !== 'play') break;
      const index = this.enemy.hand.indexOf(id);
      if (index === -1) break;
      this.playCard(this.enemy, index, 'Cinder');
    }
    if (this.checkEnd()) return;
    this.strike(this.enemy, this.player, "Cinder's creatures");
  }

  checkEnd() {
    if (this.phase !== 'play') return this.phase !== 'play';
    if (this.enemy.life <= 0) {
      this.phase = 'won';
      this.say('Cinder falls. You win the duel!');
      return true;
    }
    if (this.player.life <= 0) {
      this.phase = 'lost';
      this.say('Your ember goes out. Cinder wins.');
      return true;
    }
    return false;
  }

  /** A small summary the renderer and the tests read. */
  summary() {
    return {
      phase: this.phase,
      turn: this.turn,
      playerLife: this.player.life,
      enemyLife: this.enemy.life,
      playerMana: this.player.mana,
      playerMaxMana: this.player.maxMana,
      enemyMana: this.enemy.mana,
      playerHand: this.player.hand.length,
      enemyHand: this.enemy.hand.length,
      playerBoard: this.player.board.length,
      enemyBoard: this.enemy.board.length,
      playerDeck: this.player.deck.length,
      enemyDeck: this.enemy.deck.length,
    };
  }
}
