// All the numbers you might want to tweak live here.

// Size of one map tile in pixels (from GAME.md: 16x16).
export const TILE_SIZE = 16;

// How big the test level is, in tiles.
export const MAP_WIDTH = 40;
export const MAP_HEIGHT = 30;

// Every pixel of art is drawn this many times bigger on screen.
// Keep it a whole number so pixels stay crisp.
export const PIXEL_SCALE = 3;

// The player character.
export const PLAYER = {
  // Size of ONE frame in the sprite sheet. Change to 64 if you pick 64x64 sprites.
  frameSize: 32,

  // Walking speed in pixels per second (art pixels, before scaling).
  speed: 90,

  // Frames per second for the walk animation.
  walkFps: 8,

  // Set this to a PNG path (e.g. 'assets/sprites/player.png', inside the
  // public/ folder) to use real art. Leave it null to use the built-in
  // code-drawn Player. Sheet layout is described in GAME.md.
  sheet: null,

  // How many frames each walk row has in the sheet.
  framesPerRow: 4,
};
