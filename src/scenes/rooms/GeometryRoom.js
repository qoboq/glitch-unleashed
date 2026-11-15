import { TILE_SIZE as T } from '../../settings.js';
import { RoomScene, WALL } from './RoomScene.js';
import { ui } from '../UIScene.js';
import { STORY } from '../../story.js';
import { state, saveState } from '../../state.js';
import { sfx, stopMusic } from '../../sound.js';
import { screenGlitch, twitch } from '../../glitch.js';

// Room 4: push each shape into the hole with the same shape.
// The floor is a grid of big squares (2x2 tiles each), 11 across and 6 down.
// Small letter = a shape you can push, BIG letter = its hole:
//   s S = square,  t T = triangle,  c C = circle,  R = hole for the glitch rock
//   P = purple floor,  L = lever that puts everything back
const GRID = [
  '.....R.....',
  '..s....T...',
  '....P....c.',
  '.t....SP...',
  '...PC......',
  '..........L',
];
const SHAPES = { s: 'square', t: 'triangle', c: 'circle' };
const CELL = 2 * T;
const LEFT = T, TOP = WALL * T; // where the grid starts

export class GeometryRoom extends RoomScene {
  constructor() {
    super(4, 'Geometry');
  }

  create(data) {
    const purple = [];
    GRID.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === 'P') purple.push([1 + i * 2, WALL + j * 2], [2 + i * 2, WALL + j * 2], [1 + i * 2, WALL + 1 + j * 2], [2 + i * 2, WALL + 1 + j * 2]);
    }));
    this.buildRoom({ purple, intro: STORY.room4, retry: data.retry });

    this.blocks = [];
    this.holes = [];
    this.rockPlaced = false;
    this.pushTime = 0;
    GRID.forEach((row, j) => [...row].forEach((ch, i) => {
      const x = LEFT + i * CELL + CELL / 2, y = TOP + j * CELL + CELL / 2;
      if (SHAPES[ch]) {
        const block = this.add.image(x, y, `block-${SHAPES[ch]}`).setDepth(y + 10);
        Object.assign(block, { i, j, shape: SHAPES[ch], solid: this.addSolid(x - 14, y - 14, 28, 28) });
        this.blocks.push(block);
      } else if (SHAPES[ch.toLowerCase()]) {
        const hole = this.add.image(x, y, `hole-${SHAPES[ch.toLowerCase()]}`).setDepth(1);
        this.holes.push(Object.assign(hole, { i, j, shape: SHAPES[ch.toLowerCase()], filled: false }));
      } else if (ch === 'R') {
        this.rockHole = this.add.image(x, y, 'hole-rock').setDepth(1);
        Object.assign(this.rockHole, { i, j });
        this.addSpot(x, y + 4, 'look at the hole', () => this.useRockHole(), { radius: 24, top: 30, when: () => !this.rockPlaced });
      } else if (ch === 'L') {
        const lever = this.addProp('lever', x, y + 8);
        this.addSpot(lever.x, lever.y, 'pull the lever (start again)', () => this.talk(STORY.room4Lever, () => this.scene.restart({ retry: true })), { top: 30 });
      }
    }));
    this.showProgress();
  }

  showProgress() {
    const done = this.holes.filter((h) => h.filled).length + (this.rockPlaced ? 1 : 0);
    ui.progress(`Holes filled:  ${done} of 4`);
  }

  useRockHole() {
    if (!state.hasRock) return this.talk(STORY.room4NoRockYet);
    this.talk([STORY.room4RockHole[0]], () => {
      sfx.pickup();
      this.rockPlaced = true;
      const rock = this.add.image(this.rockHole.x, this.rockHole.y, 'glitch-rock').setScale(1.5).setDepth(1.5);
      twitch(this, rock, { strength: 1 });
      ui.item(null);
      this.talk([STORY.room4RockHole[1]], () => this.checkDone());
    });
  }

  // can a block move into grid square (i, j)?
  free(block, i, j) {
    if (j < 0 || j >= GRID.length || i < 0 || i >= GRID[0].length) return false;
    if ('PL'.includes(GRID[j][i])) return false;
    if (this.blocks.some((b) => b !== block && !b.sunk && b.i === i && b.j === j)) return false;
    if (this.rockHole.i === i && this.rockHole.j === j) return false;
    const hole = this.holes.find((h) => h.i === i && h.j === j);
    if (hole && !hole.filled && hole.shape !== block.shape) return false;
    return true;
  }

  // Is the player leaning against a block? Returns [block, di, dj] or null.
  findPush() {
    const dir = this.moveDir;
    if (!dir || dir.lengthSq() === 0) return null;
    const body = this.player.body;
    for (const block of this.blocks) {
      if (block.sunk || block.moving) continue;
      const left = block.x - 14, right = block.x + 14, top = block.y - 14, bottom = block.y + 14;
      const overlapX = body.right > left + 3 && body.left < right - 3;
      const overlapY = body.bottom > top + 1 && body.top < bottom - 1;
      if (dir.x > 0 && overlapY && Math.abs(body.right - left) < 2.5) return [block, 1, 0];
      if (dir.x < 0 && overlapY && Math.abs(body.left - right) < 2.5) return [block, -1, 0];
      if (dir.y > 0 && overlapX && Math.abs(body.bottom - top) < 2.5) return [block, 0, 1];
      if (dir.y < 0 && overlapX && Math.abs(body.top - bottom) < 2.5) return [block, 0, -1];
    }
    return null;
  }

  pushBlock(block, di, dj) {
    if (!this.free(block, block.i + di, block.j + dj)) return;
    block.i += di;
    block.j += dj;
    block.moving = true;
    sfx.push();
    const x = LEFT + block.i * CELL + CELL / 2, y = TOP + block.j * CELL + CELL / 2;
    this.tweens.add({
      targets: block, x, y, duration: 160,
      onUpdate: () => { block.solid.setPosition(block.x, block.y); block.solid.body.updateFromGameObject(); block.setDepth(block.y + 10); },
      onComplete: () => {
        block.moving = false;
        block.solid.setPosition(x, y);
        block.solid.body.updateFromGameObject();
        const hole = this.holes.find((h) => h.i === block.i && h.j === block.j && h.shape === block.shape && !h.filled);
        if (hole) this.sink(block, hole);
      },
    });
  }

  // the shape drops into its hole
  sink(block, hole) {
    block.sunk = true;
    hole.filled = true;
    this.walls.remove(block.solid, true, true);
    block.setDepth(1.5);
    this.tweens.add({ targets: block, scale: 0.86, duration: 200 });
    sfx.good();
    this.checkDone();
  }

  checkDone() {
    this.showProgress();
    if (this.finished || !this.rockPlaced || this.holes.some((h) => !h.filled)) return;
    this.finished = true;
    state.hasRock = false;
    // the glitch breaks: shaking, flashing, then everything goes white
    this.freeze();
    stopMusic();
    ui.progress(null);
    this.time.delayedCall(500, () => {
      sfx.glitch();
      screenGlitch(this, true);
      this.talk(STORY.houseFixed, () => {
        this.frozen = true;
        this.time.addEvent({ delay: 260, repeat: 8, callback: () => { screenGlitch(this, true); sfx.glitch(); } });
        this.time.delayedCall(1200, () => {
          sfx.success();
          this.cameras.main.fadeOut(1500, 255, 255, 255);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            state.roomsDone = 4;
            state.part = 'after';
            state.townPos = null;
            saveState();
            this.scene.start('Town');
          });
        });
      });
    });
  }

  update(time, delta) {
    this.updateRoom();
    if (this.finished || this.zapping || this.frozen || ui.busy) return;
    // lean on a block for a moment to push it
    const push = this.findPush();
    if (!push) { this.pushTime = 0; return; }
    this.pushTime += delta;
    if (this.pushTime > 220) {
      this.pushTime = 0;
      this.pushBlock(...push);
    }
  }
}
