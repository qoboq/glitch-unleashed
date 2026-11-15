import Phaser from 'phaser';
import { TILE_SIZE as T, PURPLE, GLITCH_GREEN } from '../../settings.js';
import { WorldScene } from '../WorldScene.js';
import { ui } from '../UIScene.js';
import { state, saveState } from '../../state.js';
import { sfx, playMusic } from '../../sound.js';
import { screenGlitch } from '../../glitch.js';

// Tile numbers in house-tiles.png
const FLOOR = [0, 0, 0, 0, 1, 4], WALL_FRONT = 2, WALL_TOP = 3, PURPLE_FLOOR = 5;

// Size of every puzzle room, in tiles.
export const ROOM_W = 24, ROOM_H = 15;
// The top wall is this many tiles tall; the floor starts right below it.
export const WALL = 2;

// The shared part of the four puzzle rooms in the Glitch House: dark walls,
// a locked door at the top, purple floor that zaps you, creepy darkness.
// If you get zapped or get the puzzle wrong, the room starts over.
export class RoomScene extends WorldScene {
  constructor(number, title) {
    super(`Room${number}`);
    this.number = number;
    this.title = title;
  }

  // purple = list of [x, y] floor tiles that are purple
  buildRoom({ purple = [], intro = null, retry = false } = {}) {
    this.startWorld();
    this.solved = false;
    this.leaving = false;
    ui.dark(true);
    ui.scene.showHelp(false); // the room is small, keep the screen clear
    ui.item(state.hasRock ? 'glitch-rock' : null, 'Glitch rock');

    // walls all around; the top wall is 2 tiles tall so the door fits in it
    const data = [];
    for (let y = 0; y < ROOM_H; y++) {
      const row = [];
      for (let x = 0; x < ROOM_W; x++) {
        const edge = x === 0 || x === ROOM_W - 1 || y === ROOM_H - 1;
        if (y < WALL) row.push(x === 0 || x === ROOM_W - 1 ? WALL_TOP : WALL_FRONT);
        else if (edge) row.push(WALL_TOP);
        else row.push(Phaser.Utils.Array.GetRandom(FLOOR));
      }
      data.push(row);
    }
    for (const [x, y] of purple) data[y][x] = PURPLE_FLOOR;

    const map = this.make.tilemap({ data, tileWidth: T, tileHeight: T });
    const tiles = map.addTilesetImage('house-tiles', 'house-tiles', T, T, 0, 0);
    this.floor = map.createLayer(0, tiles, 0, 0);
    this.floor.setCollision([WALL_FRONT, WALL_TOP]);
    this.hazards.push((px, py) => this.floor.getTileAtWorldXY(px, py)?.index === PURPLE_FLOOR);

    // the door, in the middle of the top wall
    this.doorX = (ROOM_W / 2) * T;
    this.door = this.add.image(this.doorX, WALL * T, 'door-closed').setOrigin(0.5, 1).setDepth(2);

    this.addPlayer(this.doorX, (ROOM_H - 2) * T + 8, 'up');
    this.physics.add.collider(this.player, this.floor);
    this.setupCamera(ROOM_W * T, ROOM_H * T, false);

    // darkness with a little light around the player
    const size = Math.max(ROOM_W, ROOM_H) * T * 2.4;
    this.darkness = this.add.image(this.player.x, this.player.y, 'darkness').setDepth(9000).setDisplaySize(size, size);

    this.addCreepyStuff();
    playMusic('house');
    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.events.once('shutdown', () => ui.progress(null));

    ui.banner(`Room ${this.number}:  ${this.title}`, '#d58cff');
    if (intro && !retry) {
      this.freeze('up');
      this.time.delayedCall(900, () => ui.say(intro, () => { this.frozen = false; }));
    }
  }

  // eyes that blink in the dark, and little glitches now and then
  addCreepyStuff() {
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(2, ROOM_W - 3) * T + 4;
      const y = i < 3 ? 6 : (ROOM_H - 1) * T + 6;
      const eyes = this.add.container(x, y, [
        this.add.rectangle(0, 0, 2, 2, GLITCH_GREEN), this.add.rectangle(5, 0, 2, 2, GLITCH_GREEN),
      ]).setDepth(9100).setAlpha(0);
      this.tweens.add({ targets: eyes, alpha: 1, duration: 300, yoyo: true, hold: 1500, repeat: -1, repeatDelay: Phaser.Math.Between(3000, 9000), delay: Phaser.Math.Between(500, 8000) });
    }
    this.add.image(T, WALL * T, 'cobweb').setOrigin(0, 0).setDepth(3).setAlpha(0.7);
    this.add.image((ROOM_W - 1) * T, WALL * T, 'cobweb').setOrigin(0, 0).setDepth(3).setAlpha(0.7).setFlipX(true).setOrigin(1, 0);

    const hiccup = () => {
      if (!this.frozen && !ui.busy && !this.zapping) {
        this.cameras.main.shake(120, 0.003);
        sfx.crackle();
        const flash = this.add.rectangle(Phaser.Math.Between(20, ROOM_W * T - 60), Phaser.Math.Between(40, ROOM_H * T - 20), Phaser.Math.Between(20, 70), Phaser.Math.Between(2, 5), Math.random() < 0.7 ? PURPLE : GLITCH_GREEN).setDepth(9200);
        this.time.delayedCall(140, () => flash.destroy());
      }
      this.time.delayedCall(Phaser.Math.Between(3500, 9000), hiccup);
    };
    this.time.delayedCall(4000, hiccup);
  }

  // a purple blob that walks back and forth between two points (in pixels)
  addBlob(x1, y1, x2, y2, time) {
    const blob = this.add.sprite(x1, y1, 'glitch-blob').play('blob');
    this.tweens.add({ targets: blob, x: x2, y: y2, duration: time, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onUpdate: () => blob.setDepth(blob.y + 6) });
    this.hazards.push((px, py) => Phaser.Math.Distance.Between(px, py, blob.x, blob.y + 3) < 11);
    return blob;
  }

  // a floor plate (28x28) with its middle at (x, y)
  addPlate(x, y, label, colour = '#141414') {
    const plate = this.add.image(x, y, 'plate').setDepth(1);
    plate.label = this.add.text(x, y - 1, label, { fontFamily: '"Jersey 15", monospace', fontSize: '24px', color: colour }).setOrigin(0.5).setDepth(1.5);
    return plate;
  }

  // which plate are the player's feet on? (null if none)
  plateUnderFeet(plates) {
    const px = this.player.x, py = this.player.y - 3;
    return plates.find((p) => Math.abs(px - p.x) < 11 && Math.abs(py - p.y) < 11) || null;
  }

  // puzzle done: the door opens
  solve() {
    if (this.solved) return;
    this.solved = true;
    sfx.success();
    this.time.delayedCall(350, () => sfx.door());
    this.door.setTexture('door-open');
    ui.progress(null);
    ui.banner('The door is open!', '#42f56c');
  }

  wrong(message) {
    this.zap(message);
  }

  afterZap() {
    this.scene.restart({ retry: true });
  }

  updateRoom() {
    this.updateWorld();
    this.darkness.setPosition(this.player.x, this.player.y - 14);
    // walk through the open door
    if (this.solved && !this.leaving && Math.abs(this.player.x - this.doorX) < 10 && this.player.y < WALL * T + 12) this.leave();
  }

  leave() {
    this.leaving = true;
    this.frozen = true;
    this.player.setVelocity(0, 0);
    state.roomsDone = Math.max(state.roomsDone, this.number);
    saveState();
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(`Room${this.number + 1}`));
  }

  update() {
    this.updateRoom();
  }
}
