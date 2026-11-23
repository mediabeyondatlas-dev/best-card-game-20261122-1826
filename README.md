# Ember Duel — a card battler

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/mediabeyondatlas-dev/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/mediabeyondatlas-dev/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

An entry for the make.fun bounty [Make the best card game](https://make.fun/bounty/best-card-game-20261122-1826).

## The game

You are the Ember Mage, duelling Cinder, the Ash Warden, across a green felt
table. Both duelists start at 30 life. Each turn you gain 1 max mana (up to
10), refill your mana, and draw a card. Play creatures onto the table or cast
spells, then end your turn: your awake creatures strike Cinder. Cinder answers
with the same rules, then the next turn begins. The first duelist at 0 life
loses.

- **Creatures** stay on the table and strike at the end of their owner's turn.
  A creature summoned this turn rests until the next — the table is built a
  turn ahead, not rushed.
- **Spells** resolve at once: burn the enemy (Spark Bolt, Sky Meteor), mend
  your own life (Root Mend), draw cards (Tide Call), or rally your creatures
  to +1 attack (War Rally).
- **Four elements**, told apart by colour and shape: Ember (flame), Tide
  (droplet), Leaf (leaf), Stone (mountain peak). 14 original cards in a 24-card
  deck; going second, Cinder draws one extra opening card to even the tempo.
- **Controls:** mouse or keyboard — click a card to play it, keys 1–7 play a
  hand card, Enter ends the turn, R starts a new duel.

## Play it

Serve `game/` with any static server and open `game/index.html` in desktop
Chrome (for example `node serve.ts`, then http://localhost:8080). No build
step, no network requests, no sound: every asset is a file under `game/`.

## Screenshots

Four real renders of the game's own code, taken in headless Chromium from the
game's own `?shot=` scenes — each scene plays the real rules forward from a
fresh game with a fixed seed, so the same address always shows the same duel:

- `1-table.png` — a mid-duel table (`?shot=table&seed=7`): both hands, both
  boards, life totals, mana.
- `2-title.png` — the title screen (`?shot=title`).
- `3-win.png` — the win screen (`?shot=win&seed=3`).
- `4-lose.png` — the loss screen (`?shot=lose&seed=11`).

## Layout

- `game/index.html` — the page shell and table skeleton.
- `game/style.css` — the whole look: felt table, parchment cards, overlays.
- `game/src/cards.js` — the 14-card pool and the 24-card deck.
- `game/src/engine.js` — the rules: turns, mana, playing, striking, winning.
- `game/src/ai.js` — Cinder's card-playing heuristic.
- `game/src/render.js` — draws the state into the DOM.
- `game/src/input.js` — mouse and keyboard.
- `game/src/art.js` — the four element sigils as inline SVG.
- `game/src/random.js` — the seeded random numbers behind every deal.
- `game/src/shots.js` — the deterministic screenshot scenes.
- `game/src/main.js` — boots the game and reads `?seed=` / `?shot=`.
- `main.ts` — hands the game in: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's library, unchanged.
