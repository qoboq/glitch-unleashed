// Draws the first version of every tile, house and prop as PNG files.
// Run it with:   node tools/make-art.mjs
//
// The PNGs in public/assets/ are the real art from then on: you can open and
// repaint them in LibreSprite, or swap in your own pictures with the same
// file name. Running this script again OVERWRITES them, so only do that if
// you want the code-drawn versions back.
import { fileURLToPath } from 'node:url';
import { Img, makeRandom, OUTLINE } from './png.mjs';

const OUT = fileURLToPath(new URL("../public/assets/", import.meta.url));
const T = 16;
const only = process.argv[2]; // optional: only redraw files whose name contains this

function save(img, file) {
  if (only && !file.includes(only)) return;
  img.save(OUT + file);
}

// ───────────────────────── colours ─────────────────────────
const C = {
  grass: '#63b84f', grassDark: '#4f9f40', grassLight: '#80cf68',
  dirt: '#dcae6c', dirtDark: '#c4904f', dirtLight: '#ebc68e',
  stone: '#cfc8bb', stoneDark: '#a9a195', stoneLight: '#e2ddd3',
  dead: '#5e6d58', deadDark: '#4a5849', deadPurple: '#7a5a8f',
  spookDirt: '#8a776f', spookDark: '#5d4c4c',
  wood: '#a8713a', woodDark: '#7d4f25', woodLight: '#c98f52',
  leaf: '#3f9c3a', leafDark: '#2f7d30', leafLight: '#62bd4d',
  rock: '#9b9ba8', rockDark: '#6d6d7c', rockLight: '#c2c2cf',
  water: '#4aa8e8', waterLight: '#9fd6f7',
  red: '#d8423a', orange: '#f08a24', yellow: '#f5c933', blue: '#3d8fe0',
  cream: '#f4e3b5', white: '#ffffff', black: OUTLINE,
  purple: '#a23ce0', purpleDark: '#6a1fa0', purpleLight: '#d58cff', glitchGreen: '#42f56c',
  houseBrown: '#6b3a1e', houseBrownDark: '#532a13', houseBrownLight: '#7f4826',
};

// ───────────────────────── town tiles ─────────────────────────
// One picture with all 16x16 ground tiles in a grid, 8 across.
// The numbers here must match TILES in tools/make-town.mjs.
function townTiles() {
  const cols = 8, rows = 4;
  const sheet = new Img(cols * T, rows * T);
  const rand = makeRandom(7);
  const tile = (i, fn) => {
    const t = new Img(T, T);
    fn(t);
    sheet.blit(t, (i % cols) * T, Math.floor(i / cols) * T);
  };
  const speckle = (t, colours, n) => {
    for (let k = 0; k < n; k++) t.px(Math.floor(rand() * T), Math.floor(rand() * T), colours[Math.floor(rand() * colours.length)]);
  };
  const tuft = (t, x, y, c) => { t.px(x, y, c); t.px(x - 1, y - 1, c); t.px(x + 1, y - 1, c); };
  const grass = (t) => { t.rect(0, 0, T, T, C.grass); speckle(t, [C.grassDark, C.grassLight], 7); tuft(t, 4 + Math.floor(rand() * 8), 5 + Math.floor(rand() * 8), C.grassDark); };
  const flower = (t, x, y, c) => { t.px(x, y - 1, c); t.px(x - 1, y, c); t.px(x + 1, y, c); t.px(x, y + 1, c); t.px(x, y, C.orange); };

  tile(0, grass); tile(1, grass); tile(2, grass);
  tile(3, (t) => { grass(t); flower(t, 4, 4, C.yellow); flower(t, 11, 10, '#ff8fc0'); });
  tile(4, (t) => { grass(t); flower(t, 5, 11, C.white); flower(t, 11, 4, C.red); });
  tile(5, (t) => { grass(t); t.rect(4, 6, 3, 2, C.rockDark); t.rect(4, 5, 3, 2, C.rockLight); t.rect(10, 11, 2, 2, C.rockDark); t.rect(10, 10, 2, 2, C.rockLight); });
  tile(6, (t) => { grass(t); for (const x of [3, 7, 12]) { tuft(t, x, 9, C.leafDark); tuft(t, x + 1, 13, C.leafDark); } });

  const dirt = (t) => { t.rect(0, 0, T, T, C.dirt); speckle(t, [C.dirtDark, C.dirtLight], 8); };
  tile(7, dirt);
  tile(8, (t) => { dirt(t); t.rect(5, 9, 2, 1, C.dirtDark); t.rect(11, 4, 2, 1, C.dirtDark); });
  tile(9, (t) => { dirt(t); t.rect(0, 0, T, 3, C.grass); for (let x = 0; x < T; x += 2) t.px(x + (x % 4 ? 0 : 1), 3, C.grass); t.rect(0, 4, T, 1, C.dirtDark, 1); for (let x = 0; x < T; x += 2) t.px(x + (x % 4 ? 0 : 1), 4, C.dirt); });
  tile(10, (t) => { dirt(t); t.rect(0, 13, T, 3, C.grass); for (let x = 0; x < T; x += 2) t.px(x + (x % 4 ? 1 : 0), 12, C.grass); });

  const stone = (t, flip) => {
    t.rect(0, 0, T, T, C.stone);
    t.rect(0, 7, T, 1, C.stoneDark); t.rect(0, 15, T, 1, C.stoneDark);
    t.rect(flip ? 4 : 10, 0, 1, 7, C.stoneDark); t.rect(flip ? 11 : 3, 8, 1, 7, C.stoneDark);
    speckle(t, [C.stoneLight], 5);
  };
  tile(11, (t) => stone(t, false)); tile(12, (t) => stone(t, true));

  const dead = (t) => { t.rect(0, 0, T, T, C.dead); speckle(t, [C.deadDark, C.deadDark, C.deadPurple], 8); };
  tile(13, dead); tile(14, (t) => { dead(t); tuft(t, 5, 8, C.deadDark); tuft(t, 11, 12, C.deadPurple); });
  const spook = (t) => { t.rect(0, 0, T, T, C.spookDirt); speckle(t, [C.spookDark, '#9c8980'], 8); };
  tile(15, (t) => { spook(t); t.line(3, 4, 7, 8, C.spookDark); t.line(7, 8, 6, 12, C.spookDark); t.line(7, 8, 11, 9, C.spookDark); });
  tile(16, (t) => { spook(t); t.rect(0, 0, T, 3, C.dead); for (let x = 0; x < T; x += 2) t.px(x + (x % 4 ? 0 : 1), 3, C.dead); });
  tile(17, (t) => { spook(t); t.rect(0, 13, T, 3, C.dead); for (let x = 0; x < T; x += 2) t.px(x + (x % 4 ? 1 : 0), 12, C.dead); });
  tile(18, spook);

  // fence pieces (see-through background, they go on the "walls" layer)
  const rails = (t) => { t.box(0, 5, T, 3, C.woodLight); t.box(0, 10, T, 3, C.woodLight); };
  tile(20, (t) => { rails(t); t.box(6, 2, 4, 13, C.wood); });
  tile(21, (t) => { rails(t); t.clear(0, 0, 3, T); t.box(2, 2, 4, 13, C.wood); });
  tile(22, (t) => { rails(t); t.clear(13, 0, 3, T); t.box(10, 2, 4, 13, C.wood); });
  // hedge
  tile(23, (t) => { t.box(0, 2, T, 13, C.leaf); t.rect(1, 3, T - 2, 2, C.leafLight); speckle(t, [C.leafDark], 0); for (const [x, y] of [[4, 7], [10, 9], [6, 12], [12, 5]]) t.rect(x, y, 2, 1, C.leafDark); });
  // crops: soil with rows of wheat, and soil with small sprouts
  const soil = (t) => { t.rect(0, 0, T, T, '#8a5a34'); for (const y of [3, 11]) t.rect(0, y + 3, T, 1, '#6e4526'); };
  tile(24, (t) => { soil(t); for (const y of [0, 8]) for (let x = 1; x < T; x += 4) { t.rect(x, y + 1, 1, 5, C.yellow); t.rect(x + 1, y, 1, 3, '#ffe27a'); t.px(x - 0, y + 5, C.leafDark); } });
  tile(25, (t) => { soil(t); for (const y of [3, 11]) for (let x = 2; x < T; x += 5) { t.px(x, y, C.leafLight); t.px(x - 1, y - 1, C.leaf); t.px(x + 1, y - 1, C.leaf); } });
  // quarry floor
  const gravel = (t) => { t.rect(0, 0, T, T, '#b9b3a6'); speckle(t, [C.rockDark, C.rockLight, '#8f897d'], 12); };
  tile(26, gravel); tile(27, (t) => { gravel(t); t.rect(5, 6, 3, 2, C.rockDark); t.rect(5, 5, 3, 2, C.rockLight); });
  // half grass, half dead grass (where the town turns spooky)
  tile(28, (t) => { t.rect(0, 0, T, T, C.grass); for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) if (rand() < x / T) t.px(x, y, rand() < 0.2 ? C.deadDark : C.dead); });

  save(sheet, 'tiles/town-tiles.png');
}

// ───────────────────────── props ─────────────────────────
function prop(name, w, h, draw) {
  const img = new Img(w, h);
  draw(img);
  save(img, `props/${name}.png`);
  return img;
}

function scribble(img, x, y, w, h, colours, n, seed) {
  const rand = makeRandom(seed);
  for (let k = 0; k < n; k++) {
    const sx = x + Math.floor(rand() * w), sy = y + Math.floor(rand() * h);
    const len = 2 + Math.floor(rand() * 6);
    const c = colours[Math.floor(rand() * colours.length)];
    for (let i = 0; i < len; i++) if (sx + i < x + w && sy - i >= y) img.px(sx + i, sy - Math.floor(i / 2), c);
  }
}

function windowPane(img, x, y, w, h, glass) {
  img.box(x, y, w, h, glass);
  img.rect(x + Math.floor(w / 2), y + 1, 1, h - 2, OUTLINE);
  img.rect(x + 1, y + Math.floor(h / 2), w - 2, 1, OUTLINE);
}

function townProps() {
  // trees: blocky, like the characters
  const tree = (name, leaf, light, dark, fruit) => prop(name, 32, 48, (g) => {
    g.rect(13, 30, 6, 16, C.wood); g.rect(13, 30, 2, 16, C.woodDark);
    g.rect(3, 8, 26, 16, leaf); g.rect(6, 3, 20, 26, leaf); g.rect(10, 1, 12, 4, leaf);
    g.rect(8, 5, 8, 3, light); g.rect(5, 10, 4, 6, light); g.rect(18, 8, 5, 2, light);
    g.rect(20, 20, 6, 4, dark); g.rect(8, 23, 8, 3, dark); g.rect(24, 12, 3, 6, dark);
    if (fruit) for (const [x, y] of [[9, 14], [20, 15], [14, 21], [16, 8]]) g.rect(x, y, 2, 2, fruit);
    g.outline();
  });
  tree('tree', C.leaf, C.leafLight, C.leafDark);
  tree('tree-apple', '#4aa843', '#6fc85c', '#36873a', C.red);
  tree('tree-autumn', '#e59a2c', '#f6c04f', '#c4731d');
  prop('tree-dead', 32, 48, (g) => {
    const c = '#5a4a52';
    g.rect(14, 16, 5, 30, c);
    g.line(15, 22, 6, 12, c); g.line(16, 22, 7, 12, c); g.line(6, 12, 3, 13, c); g.line(7, 12, 8, 6, c);
    g.line(17, 18, 26, 8, c); g.line(18, 18, 27, 8, c); g.line(26, 8, 29, 9, c); g.line(24, 10, 23, 4, c);
    g.line(16, 16, 15, 5, c); g.line(17, 16, 16, 5, c);
    g.rect(12, 44, 9, 2, c);
    g.outline();
    g.rect(15, 30, 2, 3, OUTLINE); // a hollow in the trunk
  });
  prop('bush', 18, 14, (g) => { g.rect(2, 3, 14, 10, C.leaf); g.rect(4, 1, 10, 3, C.leaf); g.rect(5, 3, 5, 2, C.leafLight); g.rect(10, 9, 4, 2, C.leafDark); g.outline(); });
  prop('bush-berry', 18, 14, (g) => { g.rect(2, 3, 14, 10, C.leaf); g.rect(4, 1, 10, 3, C.leaf); g.rect(5, 3, 5, 2, C.leafLight); for (const [x, y] of [[5, 7], [11, 5], [9, 10]]) g.rect(x, y, 2, 2, C.red); g.outline(); });

  // ordinary town houses
  const house = (name, wall, roof, roofDark, door) => prop(name, 80, 76, (g) => {
    g.rect(6, 34, 68, 40, wall);
    g.poly([[1, 36], [14, 8], [66, 8], [79, 36]], roof);
    g.rect(54, 2, 9, 12, C.red); g.rect(52, 1, 13, 3, '#a02d27');
    g.outline();
    for (let y = 14; y < 34; y += 6) g.line(Math.round(14 - (y - 8) * 0.46) + 2, y, Math.round(66 + (y - 8) * 0.46) - 3, y, roofDark);
    g.rect(6, 36, 68, 1, OUTLINE);
    g.box(34, 50, 14, 24, door); g.rect(44, 62, 2, 2, C.yellow);
    windowPane(g, 12, 46, 14, 14, '#8fd0ff'); windowPane(g, 55, 46, 14, 14, '#8fd0ff');
    g.box(11, 60, 16, 4, C.wood); g.box(54, 60, 16, 4, C.wood);
    for (const x of [13, 17, 21, 56, 60, 64]) g.rect(x, 58, 2, 2, x % 8 < 4 ? C.red : C.yellow);
  });
  house('house-red', C.cream, C.red, '#a02d27', C.wood);
  house('house-blue', '#f1f1f1', C.blue, '#2a68ad', '#b5651d');
  house('house-green', '#f7e7a0', '#4aa843', '#36873a', '#8a4b2a');

  // the Curious Farmer's house, from the drawing: long low house, orange
  // triangle roof on the left, red chimney on the right
  prop('house-farmer', 100, 72, (g) => {
    g.rect(2, 40, 96, 30, '#b9872c');
    g.poly([[2, 40], [18, 6], [58, 40]], C.orange);
    g.rect(76, 16, 12, 24, C.red); g.rect(73, 12, 18, 5, C.red);
    g.outline();
    scribble(g, 3, 41, 94, 28, ['#a37423', '#c99a3d'], 60, 3);
    g.rect(2, 40, 96, 1, OUTLINE);
    g.line(18, 6, 58, 40, OUTLINE);
    g.rect(73, 17, 18, 1, OUTLINE);
    g.box(9, 46, 14, 24, '#7a4a25'); g.rect(10, 47, 12, 9, OUTLINE); g.rect(19, 62, 2, 2, C.yellow);
    windowPane(g, 34, 48, 14, 12, '#8fd0ff'); windowPane(g, 62, 48, 14, 12, '#8fd0ff');
  });

  // the Glitch House, from the drawing: a big brown square with a yellow door
  const bigHouse = (name, glitched) => prop(name, 132, 120, (g) => {
    const wall = glitched ? C.houseBrown : '#8a5230';
    g.rect(2, 6, 128, 112, wall);
    g.outline();
    scribble(g, 3, 7, 126, 110, glitched ? [C.houseBrownDark, C.houseBrownLight, C.houseBrownDark] : ['#7a4526', '#9c6238'], 260, 11);
    // door: black top part, yellow door, like in the drawing
    g.box(54, 70, 24, 48, glitched ? '#d9a520' : C.yellow);
    g.rect(55, 71, 22, 18, glitched ? OUTLINE : '#8fd0ff');
    if (!glitched) { g.rect(65, 71, 1, 18, OUTLINE); g.rect(54, 88, 24, 1, OUTLINE); }
    g.rect(57, 100, 3, 3, OUTLINE);
    // windows
    for (const x of [16, 94]) {
      windowPane(g, x, 26, 22, 22, glitched ? '#1c0f2a' : '#ffe27a');
      if (glitched) { g.rect(x + 3, 30, 4, 3, C.purple); g.rect(x + 14, 39, 4, 3, C.purple); }
      else { g.box(x - 1, 48, 24, 5, C.wood); for (let i = 0; i < 5; i++) g.rect(x + 2 + i * 4, 46, 2, 2, i % 2 ? C.red : '#ff8fc0'); }
    }
    if (glitched) {
      // cracks
      g.line(100, 60, 108, 76, OUTLINE); g.line(108, 76, 104, 90, OUTLINE); g.line(108, 76, 116, 82, OUTLINE);
      g.line(30, 62, 24, 78, OUTLINE); g.line(24, 78, 30, 92, OUTLINE);
      // broken, shifted strips and loose purple / green pixels
      const rand = makeRandom(5);
      for (const [y, h, dx] of [[18, 4, 5], [54, 3, -6], [96, 5, 4]]) {
        const strip = new Img(132, h);
        for (let j = 0; j < h; j++) for (let i = 0; i < 132; i++) strip.px(i, j, g.get(i, y + j));
        g.clear(0, y, 132, h);
        g.blit(strip, dx, y);
      }
      for (let k = 0; k < 26; k++) {
        const c = [C.purple, C.purple, C.purpleLight, C.glitchGreen][Math.floor(rand() * 4)];
        g.rect(4 + Math.floor(rand() * 120), 8 + Math.floor(rand() * 104), 2 + Math.floor(rand() * 5), 1 + Math.floor(rand() * 2), c);
      }
    } else {
      g.rect(2, 6, 128, 5, '#6b3a1e'); g.rect(2, 11, 128, 1, OUTLINE);
    }
  });
  bigHouse('glitch-house', true);
  bigHouse('glitch-house-fixed', false);

  // a house that is still being built (next to the Village Maker)
  prop('house-frame', 72, 64, (g) => {
    for (const x of [4, 24, 44, 64]) g.rect(x, 22, 4, 40, C.woodLight);
    g.rect(4, 22, 64, 4, C.woodLight); g.rect(4, 42, 64, 3, C.woodLight);
    g.poly([[2, 22], [36, 2], [70, 22], [66, 22], [36, 6], [6, 22]], C.woodLight);
    g.rect(34, 6, 4, 16, C.woodLight);
    g.rect(6, 54, 60, 8, C.cream);
    g.outline();
    for (let x = 12; x < 64; x += 10) g.rect(x, 55, 1, 7, C.stoneDark);
  });

  prop('fountain', 56, 50, (g) => {
    g.ellipse(28, 36, 26, 12, C.stone);
    g.rect(2, 36, 52, 6, C.stone);
    g.ellipse(28, 42, 26, 6, C.stoneDark);
    g.outline();
    g.ellipse(28, 35, 22, 9, C.water);
    g.ellipse(22, 33, 8, 2, C.waterLight);
    g.box(24, 14, 8, 22, C.stoneLight);
    g.box(19, 10, 18, 6, C.stoneLight);
    g.rect(21, 8, 14, 2, C.water); g.rect(26, 3, 4, 6, C.waterLight);
    g.rect(18, 16, 2, 8, C.waterLight); g.rect(36, 16, 2, 8, C.waterLight);
  });

  const stall = (name, a, b, goods) => prop(name, 52, 46, (g) => {
    g.rect(4, 12, 3, 32, C.wood); g.rect(45, 12, 3, 32, C.wood);
    g.rect(2, 28, 48, 16, C.woodLight);
    for (let i = 0; i < 6; i++) g.rect(1 + i * 8.4, 2, 9, 12, i % 2 ? a : b);
    g.outline();
    for (let i = 0; i < 6; i++) g.rect(Math.round(1 + i * 8.4), 12, 9, 2, i % 2 ? b : a);
    g.rect(2, 32, 48, 1, OUTLINE);
    goods.forEach((c, i) => g.box(6 + i * 7, 24, 6, 6, c));
  });
  stall('stall-fruit', C.red, C.white, [C.red, C.orange, C.yellow, '#63b84f', C.red, C.orange]);
  stall('stall-bread', C.blue, C.white, ['#d9a05a', '#e8c07a', '#d9a05a', '#b9772f', '#e8c07a', '#d9a05a']);

  prop('well', 28, 36, (g) => {
    g.rect(3, 6, 3, 20, C.wood); g.rect(22, 6, 3, 20, C.wood);
    g.poly([[0, 8], [14, 0], [28, 8]], C.red);
    g.rect(3, 20, 22, 14, C.stone);
    g.outline();
    g.rect(6, 22, 16, 3, '#2a3550');
    g.rect(13, 8, 1, 12, OUTLINE);
    for (const [x, y] of [[6, 28], [14, 30], [19, 27]]) g.rect(x, y, 4, 1, C.stoneDark);
  });
  prop('bench', 30, 16, (g) => { g.rect(2, 2, 26, 4, C.woodLight); g.rect(2, 8, 26, 3, C.woodLight); g.rect(4, 6, 2, 9, C.wood); g.rect(24, 6, 2, 9, C.wood); g.outline(); });
  prop('lamp', 12, 38, (g) => { g.rect(5, 12, 2, 24, '#4a4a58'); g.rect(3, 34, 6, 2, '#4a4a58'); g.rect(2, 3, 8, 9, C.yellow); g.rect(1, 1, 10, 2, '#4a4a58'); g.outline(); g.rect(4, 5, 3, 4, '#fff3b0'); });
  prop('sign-town', 62, 36, (g) => {
    g.rect(8, 16, 4, 20, C.wood); g.rect(50, 16, 4, 20, C.wood);
    g.rect(1, 2, 60, 18, C.woodLight);
    g.outline();
    g.rect(3, 4, 56, 14, C.cream);
    g.text('WELCOME TO', 11, 5, C.woodDark);
    g.text('BARTTOWN', 15, 12, C.red);
  });
  prop('sign-arrow', 26, 26, (g) => {
    g.rect(11, 12, 4, 13, C.wood);
    g.poly([[2, 3], [18, 3], [24, 8], [18, 14], [2, 14]], C.woodLight);
    g.outline();
    g.rect(6, 8, 10, 1, OUTLINE); g.px(15, 7, OUTLINE); g.px(15, 9, OUTLINE); g.px(14, 6, OUTLINE); g.px(14, 10, OUTLINE);
  });
  prop('sign-danger', 26, 28, (g) => {
    g.rect(11, 14, 4, 13, '#5a4a52');
    g.rect(2, 2, 22, 14, '#d9c9a0');
    g.outline();
    g.rect(12, 4, 2, 6, C.purple); g.rect(12, 12, 2, 2, C.purple);
  });

  // rocks and the mine
  prop('rock-big', 30, 24, (g) => { g.poly([[3, 22], [1, 12], [8, 3], [20, 1], [28, 9], [28, 22]], C.rock); g.outline(); g.poly([[8, 5], [19, 3], [15, 9], [7, 10]], C.rockLight); g.poly([[18, 14], [27, 12], [27, 21], [16, 21]], C.rockDark); });
  prop('rock-small', 16, 12, (g) => { g.poly([[2, 11], [1, 6], [6, 1], [12, 2], [15, 7], [14, 11]], C.rock); g.outline(); g.rect(5, 3, 5, 2, C.rockLight); g.rect(9, 7, 5, 3, C.rockDark); });
  prop('rock-ore', 30, 24, (g) => { g.poly([[3, 22], [1, 12], [8, 3], [20, 1], [28, 9], [28, 22]], C.rock); g.outline(); g.poly([[8, 5], [19, 3], [15, 9], [7, 10]], C.rockLight); for (const [x, y] of [[6, 14], [14, 12], [21, 16], [11, 18]]) { g.rect(x, y, 3, 3, C.yellow); g.px(x, y, '#fff3b0'); } });
  prop('mine', 76, 60, (g) => {
    g.poly([[1, 58], [4, 30], [16, 12], [34, 2], [54, 6], [70, 24], [75, 58]], C.rock);
    g.outline();
    g.poly([[16, 14], [34, 4], [50, 8], [38, 14], [22, 22]], C.rockLight);
    g.poly([[58, 30], [70, 26], [74, 57], [60, 57]], C.rockDark);
    g.rect(24, 28, 28, 31, OUTLINE);
    g.rect(27, 31, 22, 28, '#2a2230');
    g.box(22, 26, 5, 33, C.wood); g.box(49, 26, 5, 33, C.wood); g.box(20, 23, 36, 6, C.woodLight);
    g.rect(30, 50, 16, 2, C.woodDark); g.rect(30, 55, 16, 2, C.woodDark); g.rect(32, 46, 2, 13, C.rockDark); g.rect(42, 46, 2, 13, C.rockDark);
  });
  prop('minecart', 30, 20, (g) => { g.poly([[2, 3], [28, 3], [25, 14], [5, 14]], '#7b7b8c'); g.rect(6, 14, 6, 5, '#3a3a46'); g.rect(18, 14, 6, 5, '#3a3a46'); g.rect(6, 1, 18, 3, C.rock); g.outline(); g.rect(9, 0, 4, 2, C.rockLight); g.rect(17, 1, 4, 2, C.yellow); g.rect(3, 6, 24, 1, '#55556a'); });
  prop('pickaxe', 16, 16, (g) => { g.line(3, 13, 11, 5, C.wood); g.line(4, 13, 12, 5, C.wood); g.poly([[6, 1], [14, 3], [15, 10], [12, 5], [8, 3]], C.rockLight); g.outline(); });

  // farm things
  prop('scarecrow', 24, 38, (g) => {
    g.rect(11, 14, 2, 23, C.wood); g.rect(2, 16, 20, 2, C.wood);
    g.rect(6, 14, 12, 12, C.red); g.rect(7, 5, 10, 9, '#e8c07a');
    g.rect(4, 3, 16, 2, C.yellow); g.rect(8, 0, 8, 4, C.yellow);
    g.outline();
    g.rect(9, 8, 2, 2, OUTLINE); g.rect(13, 8, 2, 2, OUTLINE); g.rect(10, 11, 4, 1, OUTLINE);
    g.rect(8, 16, 2, 2, C.yellow); g.rect(14, 22, 2, 2, C.blue);
  });
  prop('haystack', 26, 20, (g) => { g.rect(2, 6, 22, 13, C.yellow); g.rect(5, 2, 16, 5, C.yellow); g.outline(); for (const [x, y] of [[5, 9], [12, 6], [17, 12], [8, 14], [19, 8]]) g.rect(x, y, 4, 1, '#c99a1d'); g.rect(6, 4, 6, 1, '#fff3b0'); });
  prop('pumpkin', 12, 11, (g) => { g.rect(1, 3, 10, 7, C.orange); g.rect(5, 1, 2, 3, C.leafDark); g.outline(); g.rect(4, 4, 1, 5, '#c96a14'); g.rect(7, 4, 1, 5, '#c96a14'); });
  prop('cart', 38, 24, (g) => { g.rect(4, 6, 26, 10, C.woodLight); g.rect(30, 12, 7, 2, C.wood); g.ellipse(11, 18, 5, 5, C.wood); g.ellipse(25, 18, 5, 5, C.wood); g.rect(6, 2, 22, 5, C.yellow); g.outline(); g.rect(4, 10, 26, 1, OUTLINE); g.rect(10, 17, 2, 2, C.woodDark); g.rect(24, 17, 2, 2, C.woodDark); });

  // odds and ends
  prop('barrel', 14, 18, (g) => { g.rect(2, 1, 10, 16, C.wood); g.rect(1, 4, 12, 10, C.wood); g.outline(); g.rect(1, 5, 12, 1, '#55556a'); g.rect(1, 12, 12, 1, '#55556a'); g.rect(4, 2, 2, 14, C.woodLight); });
  prop('crate', 16, 16, (g) => { g.box(1, 1, 14, 14, C.woodLight); g.line(2, 2, 13, 13, C.wood); g.line(13, 2, 2, 13, C.wood); g.rect(1, 1, 14, 1, OUTLINE); });
  prop('logs', 30, 16, (g) => { for (const [x, y] of [[2, 8], [11, 8], [20, 8], [6, 1], [15, 1]]) { g.rect(x, y, 8, 7, C.wood); } g.outline(); for (const [x, y] of [[2, 8], [11, 8], [20, 8], [6, 1], [15, 1]]) { g.rect(x + 2, y + 2, 4, 3, C.woodLight); g.px(x + 4, y + 3, C.woodDark); } });
  prop('workbench', 34, 22, (g) => { g.rect(1, 6, 32, 5, C.woodLight); g.rect(3, 11, 3, 10, C.wood); g.rect(28, 11, 3, 10, C.wood); g.rect(6, 2, 8, 4, C.rock); g.rect(18, 3, 10, 3, C.cream); g.outline(); g.rect(20, 4, 6, 1, C.blue); });
  prop('pond', 72, 40, (g) => { g.ellipse(36, 20, 34, 18, C.water); g.outline(); g.ellipse(26, 14, 12, 3, C.waterLight); g.ellipse(46, 26, 8, 2, C.waterLight); g.rect(54, 10, 6, 4, C.leaf); g.rect(56, 9, 2, 1, '#ff8fc0'); g.rect(14, 24, 5, 3, C.leaf); });
  prop('flowerbed', 30, 12, (g) => { g.rect(1, 5, 28, 6, '#8a5a34'); g.outline(); for (let i = 0; i < 6; i++) { g.rect(3 + i * 4.6, 3, 3, 3, [C.red, C.yellow, '#ff8fc0', C.white, C.orange, C.red][i]); g.px(4 + i * 4.6, 6, C.leaf); } });

  // the purple glitch puddle you must not touch (the game makes it flicker)
  prop('glitch-puddle', 34, 20, (g) => {
    g.ellipse(17, 10, 15, 8, C.purple);
    g.rect(0, 8, 6, 2, C.purple); g.rect(28, 12, 6, 2, C.purple); g.rect(10, 0, 4, 3, C.purple);
    g.ellipse(13, 8, 6, 2, C.purpleLight);
    for (const [x, y] of [[20, 12], [8, 13], [24, 6]]) g.rect(x, y, 3, 1, C.glitchGreen);
    g.rect(22, 10, 4, 2, C.purpleDark);
  });
  // the Miner's glitching rock
  prop('glitch-rock', 16, 16, (g) => {
    g.poly([[2, 14], [1, 8], [5, 2], [11, 1], [15, 7], [13, 14]], C.rock);
    g.outline();
    g.rect(5, 4, 4, 2, C.rockLight);
    g.rect(8, 7, 5, 2, C.purple); g.rect(3, 10, 4, 2, C.glitchGreen); g.rect(10, 11, 2, 2, C.purpleLight); g.rect(6, 7, 1, 1, C.purpleLight);
  });
}

// ───────────────────────── inside the Glitch House ─────────────────────────
function houseTiles() {
  const cols = 8;
  const sheet = new Img(cols * T, T);
  const rand = makeRandom(21);
  const tile = (i, fn) => { const t = new Img(T, T); fn(t); sheet.blit(t, i * T, 0); };
  const floor = (t, a, b) => { t.rect(0, 0, T, T, a); t.rect(0, 7, T, 1, b); t.rect(0, 15, T, 1, b); t.rect(5, 0, 1, 7, b); t.rect(11, 8, 1, 7, b); };
  tile(0, (t) => floor(t, '#3b2a33', '#2a1d26'));
  tile(1, (t) => { floor(t, '#3b2a33', '#2a1d26'); t.line(3, 3, 8, 6, '#2a1d26'); t.line(8, 6, 7, 11, '#2a1d26'); });
  tile(2, (t) => { // wall you see from the front
    t.rect(0, 0, T, T, '#4a3f5c');
    for (let y = 0; y < T; y += 4) { t.rect(0, y + 3, T, 1, '#2b2338'); for (let x = (y % 8 ? 2 : 6); x < T; x += 8) t.rect(x, y, 1, 3, '#2b2338'); }
    t.rect(0, 0, T, 1, '#6a5c80');
  });
  tile(3, (t) => { t.rect(0, 0, T, T, '#15101c'); }); // top of a wall / darkness
  tile(4, (t) => { floor(t, '#3b2a33', '#2a1d26'); for (let k = 0; k < 6; k++) t.px(Math.floor(rand() * T), Math.floor(rand() * T), C.purpleDark); });
  tile(5, (t) => { // purple glitch floor: do not step on it!
    t.rect(0, 0, T, T, C.purple);
    for (let k = 0; k < 9; k++) t.rect(Math.floor(rand() * 13), Math.floor(rand() * 15), 2 + Math.floor(rand() * 3), 1, [C.purpleLight, C.purpleDark, C.glitchGreen][k % 3]);
    t.rect(0, 0, T, 1, C.purpleDark); t.rect(0, 15, T, 1, C.purpleDark);
  });
  tile(6, (t) => { t.rect(0, 0, T, T, '#5a2f3f'); t.rect(0, 0, T, 1, '#7a4658'); t.rect(0, 15, T, 1, '#3f1f2c'); for (let x = 2; x < T; x += 4) t.px(x, 8, '#7a4658'); }); // carpet
  save(sheet, 'tiles/house-tiles.png');
}

function houseProps() {
  const door = (name, open) => prop(name, 32, 34, (g) => {
    g.box(2, 0, 28, 34, '#2b2338');
    if (open) { g.rect(5, 3, 22, 31, '#000000'); g.rect(5, 3, 4, 31, '#8a6a2a'); }
    else { g.box(5, 3, 22, 31, '#8a6a2a'); g.rect(16, 4, 1, 29, OUTLINE); g.rect(21, 18, 3, 3, C.yellow); for (const y of [9, 26]) g.rect(6, y, 20, 1, '#6b4f1c'); }
  });
  door('door-closed', false); door('door-open', true);

  // floor plate: letters, numbers and music notes are drawn on top by the game
  prop('plate', 28, 28, (g) => { g.box(0, 0, 28, 28, '#cfc8bb'); g.rect(1, 1, 26, 2, '#eeeae2'); g.rect(1, 25, 26, 2, '#a9a195'); g.rect(1, 1, 2, 26, '#e2ddd3'); g.rect(25, 1, 2, 26, '#b8b0a3'); });

  // geometry room: holes in the floor and the blocks that fit them
  const hole = (name, shape) => prop(name, 32, 32, (g) => { g.box(1, 1, 30, 30, '#54495f'); shape(g, '#0d0912'); });
  const block = (name, colour, light, shape) => prop(name, 32, 32, (g) => { shape(g, colour); g.outline(); shape2(g, light, name); });
  const sq = (g, c) => g.rect(6, 6, 20, 20, c);
  const tri = (g, c) => g.poly([[16, 5], [27, 26], [5, 26]], c);
  const circ = (g, c) => g.ellipse(16, 16, 10.5, 10.5, c);
  const rock = (g, c) => g.poly([[7, 25], [5, 15], [11, 6], [21, 5], [27, 14], [24, 25]], c);
  function shape2(g, light, name) {
    if (name.includes('square')) { g.rect(8, 8, 16, 3, light); g.rect(8, 8, 3, 16, light); }
    if (name.includes('triangle')) { g.line(15, 9, 9, 22, light); g.line(16, 9, 10, 22, light); }
    if (name.includes('circle')) { g.ellipse(13, 12, 4, 3, light); }
  }
  hole('hole-square', sq); hole('hole-triangle', tri); hole('hole-circle', circ); hole('hole-rock', rock);
  block('block-square', C.red, '#ff8a80', sq);
  block('block-triangle', C.yellow, '#fff3b0', tri);
  block('block-circle', C.blue, '#9fd0ff', circ);

  // furniture
  prop('bookshelf', 32, 40, (g) => {
    g.box(0, 0, 32, 40, '#5a3a22');
    for (const y of [3, 15, 27]) {
      g.rect(2, y, 28, 10, '#22161a');
      let x = 3;
      const rand = makeRandom(y);
      while (x < 27) { const w = 2 + Math.floor(rand() * 2); const h = 6 + Math.floor(rand() * 4); g.rect(x, y + 10 - h, w, h, ['#8a2f2f', '#2f5a8a', '#3d7a3d', '#b9872c', '#6a5c80'][Math.floor(rand() * 5)]); x += w + 1; }
    }
  });
  prop('mirror', 22, 36, (g) => { g.box(0, 0, 22, 36, '#b9872c'); g.rect(3, 3, 16, 30, '#8fb5c9'); g.line(5, 12, 10, 5, '#d6ecf5'); g.line(6, 16, 13, 6, '#d6ecf5'); g.line(11, 20, 16, 30, OUTLINE); g.line(11, 20, 7, 28, OUTLINE); g.line(11, 20, 14, 12, OUTLINE); });
  prop('chest', 26, 20, (g) => { g.box(0, 4, 26, 16, '#8a5a34'); g.box(0, 0, 26, 9, '#a8713a'); g.rect(11, 6, 4, 6, C.yellow); g.rect(12, 8, 2, 2, OUTLINE); g.rect(4, 1, 2, 18, '#55556a'); g.rect(20, 1, 2, 18, '#55556a'); });
  prop('painting', 26, 22, (g) => { g.box(0, 0, 26, 22, '#b9872c'); g.rect(3, 3, 20, 16, '#2a3550'); g.rect(3, 13, 20, 6, '#3f5a3f'); g.rect(13, 8, 7, 6, C.houseBrown); g.rect(15, 11, 2, 3, C.yellow); g.rect(5, 5, 3, 3, '#e8e8f0'); });
  prop('clock', 18, 40, (g) => { g.box(2, 0, 14, 40, '#5a3a22'); g.box(4, 2, 10, 10, C.cream); g.rect(9, 4, 1, 4, OUTLINE); g.rect(9, 7, 3, 1, OUTLINE); g.rect(5, 15, 8, 20, '#22161a'); g.rect(8, 16, 2, 12, C.yellow); g.rect(7, 28, 4, 4, C.yellow); });
  prop('musicbox', 28, 30, (g) => {
    g.rect(3, 16, 22, 13, '#8a5a34');
    g.poly([[13, 16], [9, 4], [1, 0], [0, 10], [8, 12]], C.yellow);
    g.rect(18, 10, 8, 2, '#55556a'); g.rect(24, 6, 2, 6, '#55556a');
    g.outline();
    g.rect(3, 20, 22, 1, OUTLINE); g.rect(6, 23, 3, 3, C.red); g.rect(12, 23, 3, 3, C.glitchGreen); g.rect(18, 23, 3, 3, C.blue);
    g.poly([[4, 4], [2, 3], [2, 8], [6, 9]], '#c99a1d');
  });
  prop('keypad', 18, 24, (g) => { g.box(0, 0, 18, 24, '#55556a'); g.rect(3, 3, 12, 5, '#12301a'); g.rect(4, 4, 6, 3, C.glitchGreen); for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) g.rect(3 + c * 4, 10 + r * 3, 3, 2, '#d8d8e0'); });
  prop('plaque', 26, 18, (g) => { g.box(0, 0, 26, 18, '#b9a060'); g.rect(4, 4, 18, 1, OUTLINE); g.rect(4, 8, 14, 1, OUTLINE); g.rect(4, 12, 16, 1, OUTLINE); });
  prop('candle', 10, 18, (g) => { g.rect(3, 7, 4, 8, C.cream); g.rect(1, 15, 8, 2, '#b9872c'); g.outline(); g.rect(4, 2, 2, 4, C.orange); g.px(4, 1, C.yellow); g.px(5, 4, C.yellow); });
  prop('cobweb', 20, 20, (g) => { const c = '#b8b0c8'; for (const [x, y] of [[19, 0], [19, 10], [10, 19], [0, 19], [14, 14]]) g.line(0, 0, x, y, c); g.line(8, 0, 6, 4, c); g.line(6, 4, 0, 8, c); g.line(15, 0, 11, 8, c); g.line(11, 8, 0, 15, c); });
  prop('lever', 16, 20, (g) => { g.rect(2, 14, 12, 5, '#55556a'); g.line(8, 14, 12, 4, C.wood); g.line(9, 14, 13, 4, C.wood); g.rect(11, 1, 4, 4, C.red); g.outline(); });

  // purple glitch blob that wanders around: 2 frames side by side
  const blob = new Img(32, 16);
  for (let f = 0; f < 2; f++) {
    const g = new Img(16, 16);
    g.rect(3, 4 + f, 10, 10 - f, C.purple); g.rect(2, 7, 12, 6, C.purple); g.rect(5, 2 + f, 6, 3, C.purple);
    if (f) { g.rect(0, 9, 3, 2, C.purple); g.rect(13, 5, 3, 2, C.purple); } else { g.rect(13, 10, 3, 2, C.purple); g.rect(0, 6, 3, 2, C.purple); }
    g.rect(5, 7, 2, 3, C.glitchGreen); g.rect(9, 7, 2, 3, C.glitchGreen);
    g.rect(4, 4 + f, 4, 1, C.purpleLight); g.rect(8, 12, 4, 1, C.purpleDark);
    blob.blit(g, f * 16, 0);
  }
  save(blob, 'props/glitch-blob.png');
}

townTiles();
townProps();
houseTiles();
houseProps();
console.log('Art saved to public/assets/');
