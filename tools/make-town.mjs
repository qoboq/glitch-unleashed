// Builds the first version of the Barttown map: public/assets/maps/town.json
// Run it with:   node tools/make-town.mjs
//
// The map is saved in the Tiled format, so you can open town.json in the
// Tiled map editor (mapeditor.org) and move things around by hand.
// Running this script again OVERWRITES the map, so if you have edited it in
// Tiled, do not run this again (or save your version under another name).
import fs from 'node:fs';
import { makeRandom } from './png.mjs';

const W = 210, H = 20, T = 16;
const rand = makeRandom(2026);
const pick = (list) => list[Math.floor(rand() * list.length)];

// Tile numbers in town-tiles.png (counting from 0, left to right, top to bottom).
const TILES = {
  grass: [0, 1, 2], flowers: [3, 4], pebbles: 5, tallGrass: 6,
  dirt: [7, 7, 8], dirtTop: 9, dirtBottom: 10,
  stone: [11, 12],
  dead: [13, 13, 14], spookDirt: [18, 18, 15], spookTop: 16, spookBottom: 17,
  fence: 20, fenceLeft: 21, fenceRight: 22, hedge: 23,
  wheat: 24, sprouts: 25, gravel: [26, 26, 27], fade: 28,
};
const SOLID = [20, 21, 22, 23];

const ROAD_TOP = 9, ROAD_BOTTOM = 12;     // the road runs along these rows
const SPOOKY_FROM = 168;                  // where the town turns creepy
const ROAD_END = 207;

const ground = Array.from({ length: H }, () => new Array(W).fill(0));
const walls = Array.from({ length: H }, () => new Array(W).fill(-1));
const fill = (layer, x0, y0, x1, y1, tile) => {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) layer[y][x] = Array.isArray(tile) ? pick(tile) : tile;
};

// grass everywhere, with a few flowers
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (x > SPOOKY_FROM) ground[y][x] = pick(TILES.dead);
  else if (x === SPOOKY_FROM) ground[y][x] = TILES.fade;
  else {
    const r = rand();
    ground[y][x] = r < 0.06 ? pick(TILES.flowers) : r < 0.08 ? TILES.pebbles : r < 0.13 ? TILES.tallGrass : pick(TILES.grass);
  }
}
// quarry floor around the mine
fill(ground, 114, 3, 136, 8, TILES.gravel);
fill(ground, 116, 13, 132, 15, TILES.gravel);
// the road
for (let x = 0; x <= ROAD_END; x++) {
  const spooky = x >= SPOOKY_FROM;
  ground[ROAD_TOP][x] = spooky ? TILES.spookTop : TILES.dirtTop;
  ground[ROAD_BOTTOM][x] = spooky ? TILES.spookBottom : TILES.dirtBottom;
  for (let y = ROAD_TOP + 1; y < ROAD_BOTTOM; y++) ground[y][x] = pick(spooky ? TILES.spookDirt : TILES.dirt);
}
// town square
fill(ground, 84, 3, 103, 17, TILES.stone);
// the farmer's field
for (let y = 14; y <= 17; y++) for (let x = 49; x <= 64; x++) ground[y][x] = (x + y) % 5 === 0 ? TILES.sprouts : TILES.wheat;
for (let x = 48; x <= 65; x++) {
  if (x !== 56 && x !== 57) walls[13][x] = x === 55 ? TILES.fenceRight : x === 58 ? TILES.fenceLeft : TILES.fence;
  walls[18][x] = TILES.fence;
}
for (let y = 14; y <= 17; y++) { walls[y][48] = TILES.hedge; walls[y][65] = TILES.hedge; }

// ───────── things standing on the map ─────────
// Positions are in tiles. For props and people, the spot is where their feet are.
const things = [];
let nextId = 1;
const put = (type, name, tx, ty) => things.push({
  id: nextId++, name, type, x: Math.round(tx * T), y: Math.round(ty * T),
  width: 0, height: 0, point: true, rotation: 0, visible: true,
});
const props = (name, spots) => spots.forEach(([x, y]) => put('prop', name, x, y));

put('spawn', 'start', 3, 10.8);
put('spawn', 'after-zap', 170, 10.8);
put('spawn', 'house-door', 200, 9.4);
put('spawn', 'town-centre', 93.5, 10.9);
put('spawn', 'cheer', 196, 11);

// 1. the way in, where the Mayor waits
props('sign-town', [[6.5, 8.7]]);
props('lamp', [[11, 8.8], [33, 8.8], [86, 8.8], [101, 8.8], [123, 13.6], [147, 13.6]]);
props('flowerbed', [[12.5, 14], [19.5, 8.6], [86, 14.2], [101, 14.2], [24, 13.7]]);
props('bench', [[18.5, 14], [36, 13.9], [90, 5.5], [97, 5.5], [106, 13.9]]);
put('npc', 'mayor', 15, 9.7);

// 2. first houses, where the Runner comes by
props('house-red', [[27, 8.4], [108, 8.4]]);
props('house-blue', [[39, 8.4], [79, 18.9]]);
props('house-green', [[79.5, 8.4], [108, 18.9], [143, 18.9]]);
props('pond', [[31, 17.6]]);
props('tree-apple', [[22, 16.5], [44, 17], [72, 16.5], [112, 15]]);
props('bush', [[21, 8.6], [33.5, 14.2], [45, 8.7], [75, 14.5], [110, 14], [139, 8.7], [160, 15]]);
props('bush-berry', [[24, 16.8], [42, 14.5], [74, 8.7], [141, 14.4]]);
put('trigger', 'runner', 31, 10.5);

// 3. the farm
props('house-farmer', [[56, 8.4]]);
put('npc', 'farmer', 64.5, 9.7);
props('haystack', [[68, 8.7], [70, 8.4], [46.6, 16]]);
props('cart', [[49, 8.8]]);
props('scarecrow', [[57, 16.4]]);
props('pumpkin', [[66.8, 14.8], [67.8, 16.1], [68.6, 14.9], [67, 17.2]]);
props('well', [[73, 8.6]]);
props('barrel', [[62, 8.6], [84.5, 16.4], [103, 16.2]]);

// 4. the town centre
props('fountain', [[93.5, 8.2]]);
props('stall-fruit', [[88.5, 16.8]]);
props('stall-bread', [[98.5, 16.8]]);
props('crate', [[92, 16.6], [93, 16.6], [92.5, 15.9], [102, 16.6]]);
props('tree-autumn', [[85, 5], [102, 5]]);

// 5. the quarry and the mine
props('mine', [[128, 8.4]]);
put('npc', 'miner', 120, 9.7);
props('rock-ore', [[118, 9.5], [134.5, 6]]);
props('rock-big', [[115, 6], [122, 5.5], [136, 8], [118, 15], [130, 14.6]]);
props('rock-small', [[117, 7.5], [124, 7.6], [133, 8.6], [121, 14.2], [126, 15.2], [113, 8.7]]);
props('minecart', [[134, 8.9]]);

// 6. the Village Maker and his half-built house
props('house-frame', [[150, 8.4]]);
props('workbench', [[156, 8.7]]);
put('npc', 'maker', 159.5, 9.7);
props('logs', [[145, 8.8], [153, 14.4]]);
props('crate', [[162.5, 8.8], [163.6, 8.6]]);
props('sign-arrow', [[165.5, 8.9]]);

// 7. the creepy end of town and the Glitch House
props('sign-danger', [[171, 8.9]]);
props('tree-dead', [[173, 6], [178, 4.5], [183, 7.2], [188, 5], [176, 16], [181, 18.5], [186, 15.4], [192, 17.5], [197, 15.6], [204, 17.6], [207.5, 14.5], [208, 6]]);
props('glitch-puddle', [[177, 10.9], [183, 12.9], [189, 10.9], [186, 14.6], [193.5, 12.7]]);
props('glitch-house', [[200, 8.5]]);
put('door', 'glitch-house', 200, 8.9);

// trees along the top and bottom edge of the map
const blockedTop = [[190, 210]];
for (let x = 1; x < W; x += 2 + rand() * 1.5) {
  const spooky = x > SPOOKY_FROM;
  if (!blockedTop.some(([a, b]) => x > a && x < b)) put('prop', spooky ? 'tree-dead' : pick(['tree', 'tree', 'tree-apple', 'tree-autumn']), x, 2.4 + rand() * 0.6);
}
for (let x = 1; x < W; x += 2 + rand() * 1.5) {
  const spooky = x > SPOOKY_FROM;
  const busy = [[26, 36], [47, 66], [74, 84], [84, 104], [104, 113], [139, 148]].some(([a, b]) => x > a && x < b);
  if (!busy) put('prop', spooky ? 'tree-dead' : pick(['tree', 'tree', 'tree-autumn']), x, 19.9);
}

// ───────── write the Tiled file ─────────
const layer = (id, name, grid) => ({
  id, name, type: 'tilelayer', x: 0, y: 0, width: W, height: H, opacity: 1, visible: true,
  data: grid.flat().map((t) => t + 1), // Tiled counts tiles from 1; 0 means empty
});
const map = {
  type: 'map', version: '1.10', tiledversion: '1.10.2', orientation: 'orthogonal', renderorder: 'right-down',
  width: W, height: H, tilewidth: T, tileheight: T, infinite: false,
  nextlayerid: 4, nextobjectid: nextId,
  tilesets: [{
    firstgid: 1, name: 'town-tiles', image: '../tiles/town-tiles.png', imagewidth: 128, imageheight: 64,
    tilewidth: T, tileheight: T, tilecount: 32, columns: 8, margin: 0, spacing: 0,
    tiles: SOLID.map((id) => ({ id, properties: [{ name: 'collides', type: 'bool', value: true }] })),
  }],
  layers: [
    layer(1, 'ground', ground),
    layer(2, 'walls', walls),
    { id: 3, name: 'things', type: 'objectgroup', draworder: 'topdown', x: 0, y: 0, opacity: 1, visible: true, objects: things },
  ],
};
const out = new URL('../public/assets/maps/town.json', import.meta.url);
fs.mkdirSync(new URL('.', out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(map));
console.log(`Map saved: ${W}x${H} tiles, ${things.length} things`);
