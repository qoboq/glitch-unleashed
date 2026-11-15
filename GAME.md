# Glitch Unleashed

A 2D top-down pixel-art game. You control a character, solve puzzles, and talk to other characters.

## Story

_To be written._

## Characters

- **Player** – yellow square head, blue eyes, black moustache, yellow shirt with a red X, green trousers (from the drawing). Drawn in code for now in `src/placeholders.js`.

## Puzzles

_To be written._

## Tech

- Phaser 3 + Vite. `npm install`, then `npm run dev`.
- Settings you can tweak are in `src/settings.js`.
- `pixelArt: true` and `roundPixels: true`; everything is drawn at one pixel scale (`PIXEL_SCALE`).

## Sprite format

- Map tiles: 16×16.
- Character frames: 32×32 for now (64×64 still possible; change `PLAYER.frameSize`).
- Character sheet: a PNG with transparent background, one row per direction,
  4 frames per row (change `PLAYER.framesPerRow` if you use more):
  1. walking down (towards the camera)
  2. walking left
  3. walking right
  4. walking up (away from the camera)
- Put it in `public/assets/sprites/player.png` and set
  `PLAYER.sheet = 'assets/sprites/player.png'` in `src/settings.js`.

## Feature order

1. ✅ Player movement + walk animation (Player drawn in code on a grass field)
2. Tiled level with collisions
3. Dialogue box when talking to characters
4. First puzzle
