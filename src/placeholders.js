// Placeholder art drawn with code, so the game runs before any real art exists.
// Once real PNGs are ready, these can be deleted (see PLAYER.sheet in settings.js).

import { TILE_SIZE } from './settings.js';

// Tiny seeded random generator so the grass looks the same every time.
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Ground tiles, side by side in one image: 0-2 grass variants, 3 flowers, 4 pebbles.
export const GROUND_TILES = { GRASS: [0, 1, 2], FLOWERS: 3, PEBBLES: 4 };

export function makeGroundTiles(scene, key) {
  const count = 5;
  const tex = scene.textures.createCanvas(key, TILE_SIZE * count, TILE_SIZE);
  const ctx = tex.getContext();
  const rand = makeRandom(42);
  const px = (x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
  };

  for (let i = 0; i < count; i++) {
    const ox = i * TILE_SIZE;
    ctx.fillStyle = '#5a9e4b';
    ctx.fillRect(ox, 0, TILE_SIZE, TILE_SIZE);
    // grass speckles
    for (let n = 0; n < 10; n++) {
      const x = ox + Math.floor(rand() * TILE_SIZE);
      const y = Math.floor(rand() * TILE_SIZE);
      px(x, y, rand() < 0.5 ? '#4a8a3e' : '#6cb35a');
    }
  }

  // flowers on tile 3
  const flowers = [[3, 4, '#f4e04d'], [10, 9, '#f28ab2'], [6, 12, '#ffffff']];
  for (const [x, y, c] of flowers) {
    const ox = 3 * TILE_SIZE;
    px(ox + x, y - 1, c); px(ox + x - 1, y, c); px(ox + x + 1, y, c); px(ox + x, y + 1, c);
    px(ox + x, y, '#e8a33d');
  }

  // pebbles on tile 4
  const pebbles = [[4, 5, 3, 2], [10, 10, 2, 2], [7, 12, 2, 1]];
  for (const [x, y, w, h] of pebbles) {
    const ox = 4 * TILE_SIZE;
    ctx.fillStyle = '#5e5e6e';
    ctx.fillRect(ox + x, y + 1, w, h);
    ctx.fillStyle = '#a9a9b8';
    ctx.fillRect(ox + x, y, w, h);
  }

  tex.refresh();
}

// The dummy's sprite sheet: 4 rows (down, left, right, up) x 4 walk frames.
// Same layout real art should use, so swapping is easy.
export const DIRECTIONS = ['down', 'left', 'right', 'up'];

export function makeDummySheet(scene, key, frameSize, framesPerRow) {
  const tex = scene.textures.createCanvas(key, frameSize * framesPerRow, frameSize * DIRECTIONS.length);
  const ctx = tex.getContext();
  const u = frameSize / 32; // drawn on a 32x32 grid, scaled up for bigger frames

  const OUTLINE = '#1c1c28';
  const SKIN = '#f2c94c';  // crash-test-dummy yellow
  const SHADE = '#c99a2e';
  const SHIRT = '#3d7bd9';
  const PANTS = '#2b3a67';

  DIRECTIONS.forEach((dir, row) => {
    for (let f = 0; f < framesPerRow; f++) {
      const ox = f * frameSize;
      const oy = row * frameSize;
      const step = [0, 1, 0, -1][f % 4]; // which leg is forward
      const bob = f % 2 === 1 ? -1 : 0;   // body bobs up on step frames

      const parts = [
        // [x, y, w, h, color]
        [12, 22 + bob, 3, 6 + step, PANTS],          // left leg
        [17, 22 + bob, 3, 6 - step, PANTS],          // right leg
        [8, 14 + bob - step, 2, 6, SKIN],             // left arm
        [22, 14 + bob + step, 2, 6, SKIN],            // right arm
        [10, 13 + bob, 12, 10, SHIRT],                // body
        [11, 3 + bob, 10, 10, SKIN],                  // head
      ];

      const rect = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(ox + x * u, oy + y * u, w * u, h * u);
      };

      // soft shadow on the ground
      rect(10, 28, 12, 2, 'rgba(0,0,0,0.25)');
      // outlines first, then fills, so outlines never cover other parts
      for (const [x, y, w, h] of parts) rect(x - 1, y - 1, w + 2, h + 2, OUTLINE);
      for (const [x, y, w, h, c] of parts) rect(x, y, w, h, c);

      // face shows which way the dummy is looking
      const headY = 3 + bob;
      if (dir === 'down') {
        rect(13, headY + 4, 2, 2, OUTLINE);
        rect(17, headY + 4, 2, 2, OUTLINE);
        rect(14, headY + 8, 4, 1, SHADE);
      } else if (dir === 'left') {
        rect(12, headY + 4, 2, 2, OUTLINE);
      } else if (dir === 'right') {
        rect(18, headY + 4, 2, 2, OUTLINE);
      } else {
        rect(13, headY + 2, 6, 1, SHADE); // back of the head
      }
    }
  });

  tex.refresh();
  addSheetFrames(scene, key, frameSize, framesPerRow);
}

// Cut a texture into numbered frames, left to right, top to bottom.
export function addSheetFrames(scene, key, frameSize, framesPerRow) {
  const texture = scene.textures.get(key);
  let i = 0;
  for (let row = 0; row < DIRECTIONS.length; row++) {
    for (let col = 0; col < framesPerRow; col++) {
      texture.add(i++, 0, col * frameSize, row * frameSize, frameSize, frameSize);
    }
  }
}
