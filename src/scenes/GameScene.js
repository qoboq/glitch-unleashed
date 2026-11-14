import Phaser from 'phaser';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, PIXEL_SCALE, PLAYER } from '../settings.js';
import { makeGroundTiles, makeDummySheet, GROUND_TILES, DIRECTIONS } from '../placeholders.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    if (PLAYER.sheet) {
      this.load.spritesheet('player', PLAYER.sheet, {
        frameWidth: PLAYER.frameSize,
        frameHeight: PLAYER.frameSize,
      });
    }
  }

  create() {
    this.createGround();
    this.createPlayer();
    this.createControls();

    const worldW = MAP_WIDTH * TILE_SIZE;
    const worldH = MAP_HEIGHT * TILE_SIZE;
    this.physics.world.setBounds(0, 0, worldW, worldH);

    const cam = this.cameras.main;
    cam.setZoom(PIXEL_SCALE);
    cam.setBounds(0, 0, worldW, worldH);
    cam.startFollow(this.player, true, 0.15, 0.15); // a little smoothing
  }

  // A flat field of grass. Later this will come from a Tiled JSON map.
  createGround() {
    makeGroundTiles(this, 'ground');

    const data = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
      const row = [];
      for (let x = 0; x < MAP_WIDTH; x++) {
        const r = Math.random();
        if (r < 0.04) row.push(GROUND_TILES.FLOWERS);
        else if (r < 0.07) row.push(GROUND_TILES.PEBBLES);
        else row.push(Phaser.Utils.Array.GetRandom(GROUND_TILES.GRASS));
      }
      data.push(row);
    }

    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tiles = map.addTilesetImage('ground', 'ground', TILE_SIZE, TILE_SIZE, 0, 0);
    map.createLayer(0, tiles, 0, 0);
  }

  createPlayer() {
    if (!PLAYER.sheet) {
      makeDummySheet(this, 'player', PLAYER.frameSize, PLAYER.framesPerRow);
    }

    // Walk animations: one row of the sheet per direction.
    DIRECTIONS.forEach((dir, row) => {
      const start = row * PLAYER.framesPerRow;
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers('player', { start, end: start + PLAYER.framesPerRow - 1 }),
        frameRate: PLAYER.walkFps,
        repeat: -1,
      });
    });

    const startX = (MAP_WIDTH * TILE_SIZE) / 2;
    const startY = (MAP_HEIGHT * TILE_SIZE) / 2;
    this.player = this.physics.add.sprite(startX, startY, 'player', 0);
    this.player.setCollideWorldBounds(true);

    // Collision box only around the feet, so the head can overlap things above.
    const s = PLAYER.frameSize;
    this.player.body.setSize(s * 0.4, s * 0.2);
    this.player.body.setOffset(s * 0.3, s * 0.75);

    this.facing = 'down';
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const { cursors, wasd, player } = this;
    const left = cursors.left.isDown || wasd.A.isDown;
    const right = cursors.right.isDown || wasd.D.isDown;
    const up = cursors.up.isDown || wasd.W.isDown;
    const down = cursors.down.isDown || wasd.S.isDown;

    const dir = new Phaser.Math.Vector2((right ? 1 : 0) - (left ? 1 : 0), (down ? 1 : 0) - (up ? 1 : 0));
    dir.normalize().scale(PLAYER.speed); // same speed diagonally
    player.setVelocity(dir.x, dir.y);

    if (dir.lengthSq() === 0) {
      // standing still: first frame of the direction we last faced
      player.anims.stop();
      player.setFrame(DIRECTIONS.indexOf(this.facing) * PLAYER.framesPerRow);
      return;
    }

    if (dir.x !== 0) this.facing = dir.x < 0 ? 'left' : 'right';
    else this.facing = dir.y < 0 ? 'up' : 'down';
    player.anims.play(`walk-${this.facing}`, true);
  }
}
