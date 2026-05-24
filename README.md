# POPTRIS

A browser Tetris clone built as a class demo. Pure HTML, CSS, and `<canvas>` JavaScript: no frameworks, no build step, no dependencies to install. The only thing it pulls from the network is a Google Fonts stylesheet for the title typeface.

**Play it:** https://margmarg.github.io/poptris/

## Controls

| Key | Action |
| --- | --- |
| ← → | Move left / right |
| ↑ | Rotate (with wall kicks) |
| ↓ | Soft drop (+1 point per cell) |
| Space | Hard drop (+2 points per cell) |
| P | Pause / resume |
| M | Mute / unmute |

## Features

- All 7 tetrominoes (I, O, T, S, Z, J, L), each with its own color and 4 rotation states.
- **Ghost piece:** a dashed outline shows where the current piece will land.
- **Next-piece preview** in the side panel.
- **Wall kicks:** rotation near a wall nudges the piece sideways (offsets of -1, +1, -2, +2) so it still turns when possible.
- **Scoring:** 100 / 300 / 500 / 800 points for clearing 1 / 2 / 3 / 4 lines at once, multiplied by the current level, plus drop bonuses.
- **Levels:** the level goes up every 10 lines cleared, and gravity speeds up with it. The drop interval is `max(80, 800 - (level - 1) * 60)` milliseconds.
- **Sound, generated live with the Web Audio API:** the Korobeiniki ("Tetris theme") melody loops as background music, with separate blips for move, rotate, drop, lock, line clear, and game over. No audio files needed.

## Running locally

Open `index.html` in any modern browser. That is all it needs. Browser audio policy requires a click before sound starts, so press **Start** to begin.

## How it works

Three files, each with one job:

- **`index.html`** lays out the page: score / level / lines panel, the main `<canvas id="game">` playfield (10 columns x 20 rows), the next-piece canvas, and the start / pause overlay.
- **`styles.css`** handles the pop-art look (halftone background, the POPTRIS logo, panels, buttons).
- **`game.js`** is the whole game, wrapped in an IIFE so nothing leaks into the global scope. The main pieces:
  - `SHAPES` / `COLORS` define every tetromino rotation as a grid of 0s and 1s.
  - `board` is a 20 x 10 array of cells; an empty cell is `0`, a filled one stores the piece letter so it keeps its color.
  - `collide()` is the core rule: it checks a piece against the walls, the floor, and settled blocks. Movement, rotation, and dropping all just ask "would this collide?" before committing.
  - `tick()` is the game loop, driven by `requestAnimationFrame`. It accumulates elapsed time and steps the piece down once per drop interval.
  - `lockPiece()` settles a piece, calls `clearLines()`, updates score and level, then `spawnPiece()` brings in the next one (and ends the game if the new piece has no room).
  - The `play*Sfx` functions and `scheduleMusicStep()` build all sound from oscillators at runtime.

## Editing and redeploying

This repo is hosted on GitHub Pages from the `main` branch. To publish a change:

```sh
git add -A
git commit -m "describe your change"
git push
```

GitHub Pages rebuilds within a minute or two of each push.
