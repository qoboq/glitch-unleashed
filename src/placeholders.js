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

// The player's sprite sheet, based on the kid's drawing of PLAYER:
// yellow square head, blue eyes, black moustache, yellow shirt with a red X,
// green trousers, thick black outlines.
// 4 rows (down, left, right, up) x 4 walk frames. Real art should use the same layout.
export const DIRECTIONS = ['down', 'left', 'right', 'up'];

export function makeDummySheet(scene, key, frameSize, framesPerRow) {
  const tex = scene.textures.createCanvas(key, frameSize * framesPerRow, frameSize * DIRECTIONS.length);
  const ctx = tex.getContext();
  const u = frameSize / 32; // drawn on a 32x32 grid, scaled up for bigger frames

  // Colours picked from the drawing. Change these to recolour the player.
  const OUTLINE = '#141414';
  const YELLOW = '#f5c933';
  const RED = '#d8423a';
  const GREEN = '#3e8e2c';
  const EYE = '#2b9ce0';

  DIRECTIONS.forEach((dir, row) => {
    for (let f = 0; f < framesPerRow; f++) {
      const ox = f * frameSize;
      const oy = row * frameSize;
      const step = [0, 1, 0, -1][f % 4]; // which leg is forward
      const bob = f % 2 === 1 ? -1 : 0;   // body bobs up on step frames

      const headY = 2 + bob;
      const bodyY = 11 + bob;

      const parts = [
        // [x, y, w, h, color]
        [10, 22 + bob, 5, 6 + bob * -1 + step, GREEN], // left leg
        [16, 22 + bob, 5, 6 + bob * -1 - step, GREEN], // right leg
        [7, bodyY - step, 2, 9, YELLOW],               // left arm
        [22, bodyY + step, 2, 9, YELLOW],              // right arm
        [10, bodyY, 11, 10, YELLOW],                   // body
        [11, headY, 9, 8, YELLOW],                     // head
      ];

      const rect = (x, y, w, h, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(ox + x * u, oy + y * u, w * u, h * u);
      };

      // soft shadow on the ground
      rect(9, 28, 13, 2, 'rgba(0,0,0,0.25)');
      // outlines first, then fills, so outlines never cover other parts
      for (const [x, y, w, h] of parts) rect(x - 1, y - 1, w + 2, h + 2, OUTLINE);
      for (const [x, y, w, h, c] of parts) rect(x, y, w, h, c);

      // red X across the shirt (straps cross on the back too)
      if (dir === 'down' || dir === 'up') {
        for (let i = 0; i < 10; i++) {
          rect(10 + i, bodyY + i, 2, 1, RED);
          rect(19 - i, bodyY + i, 2, 1, RED);
        }
      } else {
        // from the side you only see one strap going over the shoulder
        rect(15, bodyY, 2, 10, RED);
      }

      // eye: black square with a blue spot, like in the drawing
      const eye = (x) => {
        rect(x, headY + 2, 2, 2, OUTLINE);
        rect(x + 1, headY + 3, 1, 1, EYE);
      };

      if (dir === 'down') {
        eye(12);
        eye(17);
        // big black moustache-smile
        rect(12, headY + 5, 7, 1, OUTLINE);
        rect(12, headY + 6, 3, 1, OUTLINE);
        rect(16, headY + 6, 3, 1, OUTLINE);
      } else if (dir === 'left') {
        eye(11);
        rect(11, headY + 5, 4, 1, OUTLINE);
        rect(11, headY + 6, 2, 1, OUTLINE);
      } else if (dir === 'right') {
        eye(18);
        rect(16, headY + 5, 4, 1, OUTLINE);
        rect(18, headY + 6, 2, 1, OUTLINE);
      }
      // facing up: back of the head, no face
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
