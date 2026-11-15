import Phaser from 'phaser';
import { PIXEL_SCALE, PLAYER, FRAME_W, FRAME_H } from '../settings.js';
import { DIRECTIONS, FRAMES_PER_ROW } from '../characters.js';
import { PROPS, FLAT } from '../props.js';
import { ui } from './UIScene.js';
import { sfx, unlockAudio } from '../sound.js';
import { glitchOut, screenGlitch } from '../glitch.js';

const FEET = 36 / FRAME_H; // where the feet are inside a character frame

// The shared part of every place you can walk around in (the town and the
// rooms of the Glitch House): the player, walls, things to talk to, and the
// purple stuff that zaps you.
export class WorldScene extends Phaser.Scene {
  startWorld() {
    this.walls = this.physics.add.staticGroup();
    this.spots = [];     // things you can talk to or use
    this.hazards = [];   // purple things: () => true when they touch the player
    this.frozen = false; // true during little story scenes
    this.zapping = false;
    this.facing = 'down';

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown', (event) => {
      unlockAudio();
      if ([' ', 'Enter', 'e', 'E'].includes(event.key)) this.useNearest();
    });

    this.bubble = this.add.image(0, 0, 'bubble').setDepth(9500).setVisible(false);

    this.scale.on('resize', this.fitCamera, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fitCamera, this));
    ui.scene.showHelp(true);
    ui.hint(null);
  }

  // ───── building the place ─────
  addSolid(x, y, w, h) {
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
    this.physics.add.existing(zone, true);
    this.walls.add(zone);
    return zone;
  }

  // a picture standing at (x, y): x is its middle, y is its bottom edge
  addProp(key, x, y, { solid = true } = {}) {
    const img = this.add.image(x, y, key).setOrigin(0.5, 1);
    img.setDepth(FLAT.includes(key) ? 1 : y);
    const body = PROPS[key];
    if (solid && body) {
      const [w, h] = body;
      img.solid = this.addSolid(x - w / 2, y - h - (key === 'pond' ? 5 : 0), w, h);
    }
    return img;
  }

  // a character standing at (x, y) = where the feet are
  addPerson(key, x, y, facing = 'down') {
    const sprite = this.add.sprite(x, y, key, DIRECTIONS.indexOf(facing) * FRAMES_PER_ROW).setOrigin(0.5, FEET);
    sprite.setDepth(y);
    sprite.solid = this.addSolid(x - 7, y - 6, 14, 7);
    return sprite;
  }

  // something you can walk up to and press SPACE at
  addSpot(x, y, label, action, { radius = 26, top = 44, when = null } = {}) {
    const spot = { x, y, label, action, radius, top, when };
    this.spots.push(spot);
    return spot;
  }

  addPlayer(x, y, facing = 'down') {
    this.player = this.physics.add.sprite(x, y, 'player', 0).setOrigin(0.5, FEET);
    this.player.body.setSize(12, 6);
    this.player.body.setOffset((FRAME_W - 12) / 2, 36 - 6);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);
    this.facing = facing;
    this.player.setFrame(DIRECTIONS.indexOf(facing) * FRAMES_PER_ROW);
    return this.player;
  }

  // Zoom in by a whole number so pixels stay crisp.
  // follow = true: big world, the camera follows the player.
  // follow = false: small room, shown whole in the middle of the screen.
  setupCamera(worldW, worldH, follow) {
    this.view = { worldW, worldH, follow };
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.fitCamera();
    if (follow) this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
  }

  fitCamera() {
    if (!this.view) return;
    const { worldW, worldH, follow } = this.view;
    const cam = this.cameras.main;
    const W = this.scale.width, H = this.scale.height;
    if (follow) {
      cam.setZoom(Math.max(PIXEL_SCALE, Math.ceil(H / worldH)));
      cam.setBounds(0, 0, worldW, worldH);
    } else {
      cam.setZoom(Math.max(1, Math.floor(Math.min(W / worldW, H / worldH))));
      cam.centerOn(worldW / 2, worldH / 2);
    }
  }

  // ───── every frame ─────
  updateWorld() {
    const player = this.player;
    const stop = this.frozen || ui.busy || this.zapping;
    const { cursors, wasd } = this;
    const left = cursors.left.isDown || wasd.A.isDown;
    const right = cursors.right.isDown || wasd.D.isDown;
    const up = cursors.up.isDown || wasd.W.isDown;
    const down = cursors.down.isDown || wasd.S.isDown;

    const dir = new Phaser.Math.Vector2((right ? 1 : 0) - (left ? 1 : 0), (down ? 1 : 0) - (up ? 1 : 0));
    if (stop) dir.set(0, 0);
    dir.normalize().scale(PLAYER.speed); // same speed diagonally
    player.setVelocity(dir.x, dir.y);
    this.moveDir = dir;

    if (dir.lengthSq() === 0) {
      if (!this.frozen) this.standStill();
    } else {
      if (dir.x !== 0) this.facing = dir.x < 0 ? 'left' : 'right';
      else this.facing = dir.y < 0 ? 'up' : 'down';
      player.anims.play(`player-walk-${this.facing}`, true);
    }
    player.setDepth(player.y);

    // which thing are we standing next to?
    this.near = null;
    if (!stop) {
      let best = Infinity;
      for (const spot of this.spots) {
        if (spot.when && !spot.when()) continue;
        const d = Phaser.Math.Distance.Between(player.x, player.y, spot.x, spot.y);
        if (d < spot.radius && d < best) { best = d; this.near = spot; }
      }
    }
    if (this.near) {
      this.bubble.setPosition(this.near.x, this.near.y - this.near.top + Math.round(Math.sin(this.time.now / 160) * 1.5)).setVisible(true);
      ui.hint(`SPACE: ${this.near.label}`);
    } else {
      this.bubble.setVisible(false);
      ui.hint(null);
    }

    // purple!
    if (!stop) {
      for (const touches of this.hazards) {
        if (touches(player.x, player.y - 3)) { this.zap(); break; }
      }
    }
  }

  standStill(facing = this.facing) {
    this.facing = facing;
    this.player.setVelocity(0, 0);
    this.player.anims.stop();
    this.player.setFrame(DIRECTIONS.indexOf(facing) * FRAMES_PER_ROW);
  }

  // stop the player for a little story scene (unfreeze with this.frozen = false)
  freeze(facing = this.facing) {
    this.frozen = true;
    this.standStill(facing);
  }

  useNearest() {
    if (ui.busy || ui.justClosed() || this.frozen || this.zapping || !this.near) return;
    this.player.setVelocity(0, 0);
    this.near.action();
  }

  // touched the purple, or got a puzzle wrong
  zap(message = 'ZAPPED!') {
    if (this.zapping) return;
    this.zapping = true;
    this.player.setVelocity(0, 0);
    sfx.fail();
    screenGlitch(this);
    ui.banner(message, '#d58cff');
    glitchOut(this, this.player, { time: 650, sound: false }, () => this.afterZap());
  }

  // each place decides what happens after a zap
  afterZap() {
    this.zapping = false;
    this.player.setVisible(true);
  }

  // say some lines with the player standing still
  talk(lines, onDone) {
    this.standStill();
    ui.say(lines, onDone);
  }
}
