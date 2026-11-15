// All the numbers you might want to tweak live here.

// Size of one map tile in pixels.
export const TILE_SIZE = 16;

// Every pixel of art is drawn at least this many times bigger on screen.
// (On big screens the game zooms in more by itself, always by a whole number,
// so pixels stay crisp.)
export const PIXEL_SCALE = 3;

// Size of ONE character frame. Characters are drawn in code in
// src/characters.js, 4 rows (down, left, right, up) x 4 walk frames.
export const FRAME_W = 32;
export const FRAME_H = 40;

// The player character.
export const PLAYER = {
  // Walking speed in art pixels per second.
  speed: 95,
  // Frames per second for the walk animation.
  walkFps: 8,
};

// Sound volume from 0 (silent) to 1 (loud). Press M in the game to mute.
export const VOLUME = 0.5;

// The font used for all the text.
export const FONT = '"Jersey 15", "Courier New", monospace';

// The purple you must not touch, and its friends.
export const PURPLE = 0xa23ce0;
export const GLITCH_GREEN = 0x42f56c;
