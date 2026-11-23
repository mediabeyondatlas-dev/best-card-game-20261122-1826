// Draws the game into the page's DOM: title screen, table, hands, life totals,
// win and loss screens. The game state lives in engine.js; this file only reads it
// and rebuilds the visible table from it, so a screenshot always shows the real state.
import { CARD_BY_ID, ELEMENTS } from './cards.js';
import { elementIcon, portraitIcon } from './art.js';
import { START_LIFE } from './engine.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function manaPips(filled, total) {
  let out = '';
  for (let i = 0; i < total; i += 1) out += i < filled ? '◆' : '◇';
  return out || '◇';
}

/** One face-up card, as the player sees it in hand. */
export function cardElement(card, index, playable) {
  const element = ELEMENTS[card.element];
  const node = el('div', `card el-${card.element}${playable ? '' : ' dim'}`);
  node.dataset.index = String(index);
  node.tabIndex = 0;
  node.setAttribute('role', 'button');
  node.setAttribute('aria-label', `${card.name}, costs ${card.cost} mana${card.kind === 'creature' ? `, ${card.attack} attack` : `, ${card.text}`}`);
  const cost = el('div', 'card-cost', String(card.cost));
  const art = el('div', 'card-art');
  art.innerHTML = elementIcon(element.glyph, element.color);
  const name = el('div', 'card-name', card.name);
  const type = el('div', 'card-type', card.kind === 'creature' ? 'Creature' : 'Spell');
  const text = el('div', 'card-text', card.text);
  const power = el('div', 'card-power');
  if (card.kind === 'creature') {
    power.textContent = `ATK ${card.attack}`;
  } else if (card.damage) {
    power.textContent = `DMG ${card.damage}`;
  } else if (card.heal) {
    power.textContent = `HEAL ${card.heal}`;
  } else if (card.draw) {
    power.textContent = `DRAW ${card.draw}`;
  } else if (card.rally) {
    power.textContent = `RALLY +${card.rally}`;
  }
  node.append(cost, art, name, type, text, power);
  return node;
}

/** One face-down card back, as the opponent's hand shows. */
function cardBackElement() {
  const node = el('div', 'card-back');
  node.innerHTML = elementIcon('flame', '#ffd166');
  return node;
}

/** One creature standing on the table. */
function boardCreatureElement(instance) {
  const card = CARD_BY_ID.get(instance.id);
  const element = ELEMENTS[card.element];
  const node = el('div', `board-creature el-${card.element}${instance.ready ? '' : ' resting'}`);
  node.title = `${card.name} — ${instance.attack + instance.bonus} attack${instance.ready ? '' : ' (resting, strikes next turn)'}`;
  const art = el('div', 'board-art');
  art.innerHTML = elementIcon(element.glyph, element.color);
  const name = el('div', 'board-name', card.name);
  const attack = el('div', 'board-attack', `ATK ${instance.attack + instance.bonus}${instance.ready ? '' : ' · resting'}`);
  node.append(art, name, attack);
  return node;
}

function renderLife(fillNode, valueNode, life) {
  fillNode.style.width = `${Math.max(0, Math.min(100, (life / START_LIFE) * 100))}%`;
  valueNode.textContent = `♥ ${life}`;
  valueNode.classList.toggle('low', life <= 10);
}

export function render(game) {
  const s = game.summary();
  const doc = document;

  // Top bar: turn and phase.
  doc.getElementById('turn-badge').textContent =
    s.phase === 'play' ? `Turn ${s.turn} — Your move` : s.phase === 'title' ? 'A duel of sparks and wits' : '';
  doc.getElementById('end-turn').disabled = s.phase !== 'play';

  // Opponent: life, mana, hand of backs, board.
  renderLife(doc.getElementById('enemy-life-fill'), doc.getElementById('enemy-life'), s.enemyLife);
  doc.getElementById('enemy-mana').textContent = `◆ ${s.enemyMana}/${game.enemy.maxMana} ${manaPips(s.enemyMana, game.enemy.maxMana)}`;
  doc.getElementById('enemy-hand-count').textContent = String(s.enemyHand);
  const enemyHand = doc.getElementById('enemy-hand');
  enemyHand.replaceChildren();
  for (let i = 0; i < s.enemyHand; i += 1) enemyHand.append(cardBackElement());
  const enemyBoard = doc.getElementById('enemy-board');
  enemyBoard.replaceChildren();
  if (game.enemy.board.length === 0) {
    enemyBoard.append(el('div', 'board-empty', 'Cinder has no creatures yet.'));
  } else {
    for (const creature of game.enemy.board) enemyBoard.append(boardCreatureElement(creature));
  }
  doc.getElementById('enemy-strike').textContent = `Strikes for ${game.boardAttack(game.enemy)}`;

  // Player: life, mana, board, hand.
  renderLife(doc.getElementById('player-life-fill'), doc.getElementById('player-life'), s.playerLife);
  doc.getElementById('player-mana').textContent = `◆ ${s.playerMana}/${s.playerMaxMana} ${manaPips(s.playerMana, s.playerMaxMana)}`;
  const playerBoard = doc.getElementById('player-board');
  playerBoard.replaceChildren();
  if (game.player.board.length === 0) {
    playerBoard.append(el('div', 'board-empty', 'Your creatures will stand here. Play one!'));
  } else {
    for (const creature of game.player.board) playerBoard.append(boardCreatureElement(creature));
  }
  doc.getElementById('player-strike').textContent = `Strikes for ${game.boardAttack(game.player)}`;
  const playerHand = doc.getElementById('player-hand');
  playerHand.replaceChildren();
  game.player.hand.forEach((id, index) => {
    playerHand.append(cardElement(CARD_BY_ID.get(id), index, game.canPlay(game.player, index)));
  });
  doc.getElementById('player-deck').textContent = `Deck: ${s.playerDeck}`;
  doc.getElementById('enemy-deck').textContent = `Deck: ${s.enemyDeck}`;

  // Event log: the last few things that happened.
  const log = doc.getElementById('log');
  log.replaceChildren();
  for (const line of game.log) log.append(el('div', 'log-line', line));

  // Screens.
  doc.getElementById('title-screen').classList.toggle('hidden', s.phase !== 'title');
  const endScreen = doc.getElementById('end-screen');
  endScreen.classList.toggle('hidden', s.phase !== 'won' && s.phase !== 'lost');
  if (s.phase === 'won' || s.phase === 'lost') {
    doc.getElementById('end-title').textContent = s.phase === 'won' ? 'VICTORY' : 'DEFEAT';
    doc.getElementById('end-title').className = s.phase === 'won' ? 'end-title win' : 'end-title lose';
    doc.getElementById('end-detail').textContent =
      s.phase === 'won'
        ? `Cinder falls in ${s.turn} turn${s.turn === 1 ? '' : 's'} — ${s.playerLife} life to spare.`
        : `Your ember goes out on turn ${s.turn}. Cinder keeps the table.`;
  }

  // Portraits and the title legend, once.
  if (!doc.getElementById('enemy-avatar').hasChildNodes()) {
    doc.getElementById('enemy-avatar').innerHTML = portraitIcon('warden');
    doc.getElementById('player-avatar').innerHTML = portraitIcon('mage');
    const legend = doc.getElementById('title-legend');
    for (const element of Object.values(ELEMENTS)) {
      const item = el('span', 'legend-item', element.name);
      const icon = el('span');
      icon.innerHTML = elementIcon(element.glyph, element.color);
      item.prepend(icon);
      legend.append(item);
    }
  }
}
