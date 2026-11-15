// Every character is drawn here with code, copied from the kid's drawings:
// blocky bodies, flat colours and a thick black outline.
//
// To change how someone looks, change the colours or sizes in CHARACTERS below.
// Each sheet is 4 rows (down, left, right, up) x 4 walk frames.

import { FRAME_W, FRAME_H } from './settings.js';

export const DIRECTIONS = ['down', 'left', 'right', 'up'];
export const FRAMES_PER_ROW = 4;

const OUTLINE = '#141414';
const SKIN = '#f0b27a';

// Small face pieces. r(x, y, w, h, colour) draws a rectangle; hx/hy is the
// top-left corner of the head; hw is the width of the head.
const face = {
  // two eyes on the front, one on the side
  eyes(r, dir, hx, hy, hw, colour, y = 2) {
    const eye = (x) => { r(x, hy + y, 2, 2, colour); r(x + 1, hy + y + 1, 1, 1, OUTLINE); };
    if (dir === 'down') { eye(hx + 1); eye(hx + hw - 3); }
    if (dir === 'left') eye(hx);
    if (dir === 'right') eye(hx + hw - 2);
  },
  // the Player's eyes: black squares with a blue spot
  darkEyes(r, dir, hx, hy, hw) {
    const eye = (x) => { r(x, hy + 2, 2, 2, OUTLINE); r(x + 1, hy + 3, 1, 1, '#2b9ce0'); };
    if (dir === 'down') { eye(hx + 1); eye(hx + hw - 3); }
    if (dir === 'left') eye(hx);
    if (dir === 'right') eye(hx + hw - 2);
  },
  // a block of colour under the eyes: mouth, moustache or beard
  mouth(r, dir, hx, hy, hw, colour, y, w, h = 2) {
    if (dir === 'down') r(hx + Math.floor((hw - w) / 2), hy + y, w, h, colour);
    if (dir === 'left') r(hx, hy + y, Math.ceil(w / 2), h, colour);
    if (dir === 'right') r(hx + hw - Math.ceil(w / 2), hy + y, Math.ceil(w / 2), h, colour);
  },
};

export const CHARACTERS = {
  // PLAYER: yellow square head, black moustache, red X on a yellow shirt, green trousers
  player: {
    name: 'Glitch Inspector',
    head: { w: 9, h: 8, colour: '#f5c933' },
    body: { w: 11, h: 10, colour: '#f5c933' },
    arms: [['#f5c933', 9]],
    legs: [['#3e8e2c', 6]],
    details(r, dir, g) {
      const RED = '#d8423a';
      if (dir === 'down' || dir === 'up') {
        for (let i = 0; i < 10; i++) { r(g.bx + i, g.by + i, 2, 1, RED); r(g.bx + 9 - i, g.by + i, 2, 1, RED); }
      } else r(g.bx + 5, g.by, 2, 10, RED);
      face.darkEyes(r, dir, g.hx, g.hy, 9);
      if (dir === 'down') { r(g.hx + 1, g.hy + 5, 7, 1, OUTLINE); r(g.hx + 1, g.hy + 6, 3, 1, OUTLINE); r(g.hx + 5, g.hy + 6, 3, 1, OUTLINE); }
      if (dir === 'left') { r(g.hx, g.hy + 5, 4, 1, OUTLINE); r(g.hx, g.hy + 6, 2, 1, OUTLINE); }
      if (dir === 'right') { r(g.hx + 5, g.hy + 5, 4, 1, OUTLINE); r(g.hx + 7, g.hy + 6, 2, 1, OUTLINE); }
    },
  },

  // THE MAYOR: brown hair, black suit, white collar
  mayor: mayorLook('The Mayor', SKIN, '#7a4a25', '#2e2e38', '#3d8fe0', '#7a4a25'),
  // THE ENTITY MAYOR: the same man, but green and purple
  entity: mayorLook('Entity Mayor', '#8fe07a', '#1f9c45', '#8a2fd0', '#eaffea', '#3b0f66'),

  // RUNNER: red shirt, black shorts
  runner: {
    name: 'Runner',
    head: { w: 8, h: 8, colour: SKIN },
    body: { w: 11, h: 9, colour: '#e0452f' },
    arms: [['#e0452f', 3], [SKIN, 6]],
    legs: [['#2e2e38', 3], [SKIN, 3], ['#2e2e38', 1]],
    details(r, dir, g) {
      face.eyes(r, dir, g.hx, g.hy, 8, '#3d8fe0');
      face.mouth(r, dir, g.hx, g.hy, 8, '#7a4a25', 5, 4);
      if (dir === 'down') r(g.bx + 4, g.by, 3, 1, SKIN);
    },
  },

  // MINER: the small one, blue shirt with a brown stripe, yellow boots
  miner: {
    name: 'Miner',
    head: { w: 7, h: 7, colour: SKIN },
    body: { w: 9, h: 8, colour: '#3d8fe0' },
    arms: [['#3d8fe0', 3], [SKIN, 4]],
    legs: [['#2f5fc4', 2], ['#f5c933', 2], ['#f08a24', 1]],
    details(r, dir, g) {
      face.eyes(r, dir, g.hx, g.hy, 7, '#3d8fe0', 1);
      face.mouth(r, dir, g.hx, g.hy, 7, '#5a3a22', 4, 5, 3);
      if (dir === 'down') { r(g.bx + 3, g.by + 1, 3, 7, '#7a4a25'); r(g.hx + 3, g.hy + 4, 1, 1, SKIN); }
      if (dir === 'up') r(g.bx + 3, g.by + 1, 3, 7, '#2f5fc4');
    },
  },

  // CURIOUS FARMER: tall, yellow hat, black beard, brown overalls, blue sleeves
  farmer: {
    name: 'Curious Farmer',
    head: { w: 8, h: 8, colour: SKIN },
    body: { w: 11, h: 12, colour: '#7a4a25' },
    arms: [['#3d8fe0', 8], [SKIN, 3]],
    legs: [['#7a4a25', 6], ['#f08a24', 2]],
    extras(g) {
      return [
        [g.hx - 2, g.hy - 1, 12, 2, '#f5c933'], // hat brim
        [g.hx + 1, g.hy - 5, 6, 4, '#f5c933'],  // hat top
      ];
    },
    details(r, dir, g) {
      face.eyes(r, dir, g.hx, g.hy, 8, '#3d8fe0', 2);
      face.mouth(r, dir, g.hx, g.hy, 8, OUTLINE, 5, 6, 3);
      if (dir === 'down') { r(g.hx + 3, g.hy + 5, 2, 1, '#ffffff'); r(g.bx, g.by, 2, 3, '#3d8fe0'); r(g.bx + 9, g.by, 2, 3, '#3d8fe0'); }
      if (dir === 'up') { r(g.bx, g.by, 2, 3, '#3d8fe0'); r(g.bx + 9, g.by, 2, 3, '#3d8fe0'); }
    },
  },

  // VILLAGE MAKER: tall, bald, black beard, brown coat over a blue shirt
  maker: {
    name: 'Village Maker',
    head: { w: 8, h: 8, colour: SKIN },
    body: { w: 11, h: 12, colour: '#7a4a25' },
    arms: [['#7a4a25', 9], [SKIN, 2]],
    legs: [['#3d6fc4', 3], ['#7a4a25', 3], ['#f5c933', 2]],
    details(r, dir, g) {
      face.eyes(r, dir, g.hx, g.hy, 8, '#4a4a58', 2);
      face.mouth(r, dir, g.hx, g.hy, 8, OUTLINE, 5, 6, 3);
      if (dir === 'down') {
        r(g.hx + 3, g.hy + 5, 2, 1, SKIN);
        r(g.bx + 3, g.by, 5, 12, '#3d8fe0');   // blue shirt under the open coat
        r(g.bx + 3, g.by + 9, 5, 1, OUTLINE);  // belt
        r(g.bx + 5, g.by + 9, 1, 1, '#f5c933');
      }
    },
  },
};

function mayorLook(name, skin, hair, suit, eyes, moustache) {
  return {
    name,
    head: { w: 9, h: 8, colour: skin },
    body: { w: 11, h: 10, colour: suit },
    arms: [[suit, 7], [skin, 2]],
    legs: [[suit, 6]],
    extras(g, dir) {
      // hair that sticks out on both sides, like a hat
      return dir === 'up'
        ? [[g.hx - 1, g.hy - 1, 11, 6, hair]]
        : [[g.hx - 1, g.hy - 1, 11, 3, hair]];
    },
    details(r, dir, g) {
      face.eyes(r, dir, g.hx, g.hy, 9, eyes, 3);
      face.mouth(r, dir, g.hx, g.hy, 9, moustache, 6, 5, 1);
      if (dir === 'down') { r(g.bx + 4, g.by, 3, 3, '#ffffff'); r(g.bx + 5, g.by + 1, 1, 4, OUTLINE); }
    },
  };
}

// Draw one character's whole sprite sheet into a texture called `key`.
export function makeCharacterSheet(scene, key) {
  const spec = CHARACTERS[key];
  const tex = scene.textures.createCanvas(key, FRAME_W * FRAMES_PER_ROW, FRAME_H * DIRECTIONS.length);
  const ctx = tex.getContext();

  const legH = spec.legs.reduce((sum, [, h]) => sum + h, 0);
  const armH = spec.arms.reduce((sum, [, h]) => sum + h, 0);
  const legW = Math.floor((spec.body.w - 1) / 2);
  const FEET = 36; // y of the ground inside a frame

  DIRECTIONS.forEach((dir, row) => {
    for (let f = 0; f < FRAMES_PER_ROW; f++) {
      const ox = f * FRAME_W;
      const oy = row * FRAME_H;
      const step = [0, 1, 0, -1][f]; // which leg is forward
      const bob = f % 2 === 1 ? -1 : 0; // body bobs up on step frames

      const g = {};
      g.bx = Math.round(15.5 - spec.body.w / 2);
      g.by = FEET - legH - 1 - spec.body.h + bob;
      g.hx = Math.round(15.5 - spec.head.w / 2);
      g.hy = g.by - 1 - spec.head.h;
      const legY = FEET - legH + bob;

      const r = (x, y, w, h, colour) => {
        ctx.fillStyle = colour;
        ctx.fillRect(ox + x, oy + y, w, h);
      };

      // big blocks: [x, y, w, h, colour]
      const blocks = [
        [g.bx, legY, legW, legH - bob + step, null],                      // left leg
        [g.bx + spec.body.w - legW, legY, legW, legH - bob - step, null],  // right leg
        [g.bx - 3, g.by - step, 2, armH, null],                            // left arm
        [g.bx + spec.body.w + 1, g.by + step, 2, armH, null],              // right arm
        [g.bx, g.by, spec.body.w, spec.body.h, spec.body.colour],
        [g.hx, g.hy, spec.head.w, spec.head.h, spec.head.colour],
        ...(spec.extras ? spec.extras(g, dir) : []),
      ];

      r(g.bx - 1, FEET, spec.body.w + 2, 2, 'rgba(0,0,0,0.25)'); // soft shadow
      // outlines first, then colours, so outlines never cover other parts
      for (const [x, y, w, h] of blocks) r(x - 1, y - 1, w + 2, h + 2, OUTLINE);
      blocks.forEach(([x, y, w, h, colour], i) => {
        if (colour) return r(x, y, w, h, colour);
        // legs and arms are striped: sleeve then hand, trousers then shoes...
        const stripes = i < 2 ? spec.legs : spec.arms;
        let top = y;
        stripes.forEach(([c, sh], n) => {
          const last = n === stripes.length - 1;
          const hh = last ? y + h - top : sh;
          r(x, top, w, hh, c);
          top += hh;
        });
      });
      spec.details(r, dir, g);
    }
  });

  tex.refresh();

  // cut into numbered frames, plus one called "face" for the talking box
  const texture = scene.textures.get(key);
  let i = 0;
  for (let row = 0; row < DIRECTIONS.length; row++) {
    for (let col = 0; col < FRAMES_PER_ROW; col++) {
      texture.add(i++, 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
    }
  }
  const hy = FEET - legH - 1 - spec.body.h - 1 - spec.head.h;
  texture.add('face', 0, 8, Math.max(0, hy - 6), 16, 16);

  // walk animations, e.g. "mayor-walk-left"
  DIRECTIONS.forEach((dir, row) => {
    scene.anims.create({
      key: `${key}-walk-${dir}`,
      frames: scene.anims.generateFrameNumbers(key, { start: row * FRAMES_PER_ROW, end: row * FRAMES_PER_ROW + FRAMES_PER_ROW - 1 }),
      frameRate: 8,
      repeat: -1,
    });
  });
}

export function makeAllCharacters(scene) {
  for (const key of Object.keys(CHARACTERS)) makeCharacterSheet(scene, key);
}
