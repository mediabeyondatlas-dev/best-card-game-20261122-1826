// Mouse and keyboard: the only way a player touches the game. Click a card to play
// it, click End Turn (or press Enter) to let your creatures strike and pass the
// turn, press 1-7 to play a hand card, R to start a new duel after it ends.
export function bindInput(game, render) {
  const doc = document;

  function refresh() {
    render(game);
  }

  doc.getElementById('start-button').addEventListener('click', () => {
    game.start();
    refresh();
  });
  doc.getElementById('play-again-button').addEventListener('click', () => {
    game.reset();
    game.start();
    refresh();
  });
  doc.getElementById('restart-button').addEventListener('click', () => {
    game.reset();
    refresh();
  });
  doc.getElementById('end-turn').addEventListener('click', () => {
    game.endPlayerTurn();
    refresh();
  });

  doc.getElementById('player-hand').addEventListener('click', (event) => {
    const card = event.target.closest('.card');
    if (!card) return;
    const index = Number(card.dataset.index);
    if (game.playCard(game.player, index, 'You')) refresh();
  });
  doc.getElementById('player-hand').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.card');
    if (!card) return;
    const index = Number(card.dataset.index);
    if (game.playCard(game.player, index, 'You')) refresh();
  });

  doc.addEventListener('keydown', (event) => {
    if (game.phase === 'title' && (event.key === 'Enter' || event.key === ' ')) {
      game.start();
      refresh();
      return;
    }
    if (game.phase === 'play') {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        game.endPlayerTurn();
        refresh();
        return;
      }
      const slot = Number(event.key) - 1;
      if (slot >= 0 && slot < game.player.hand.length) {
        if (game.playCard(game.player, slot, 'You')) refresh();
      }
      return;
    }
    if ((game.phase === 'won' || game.phase === 'lost') && (event.key === 'r' || event.key === 'R' || event.key === 'Enter')) {
      game.reset();
      game.start();
      refresh();
    }
  });
}
