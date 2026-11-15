import Phaser from 'phaser';
import { TILE_SIZE, PURPLE, GLITCH_GREEN } from '../settings.js';
import { DIRECTIONS, FRAMES_PER_ROW } from '../characters.js';
import { WorldScene } from './WorldScene.js';
import { ui } from './UIScene.js';
import { STORY } from '../story.js';
import { state, saveState } from '../state.js';
import { sfx, playMusic, stopMusic } from '../sound.js';
import { glitchOut, twitch, screenGlitch } from '../glitch.js';

const SPOOKY_FROM = 168 * TILE_SIZE; // where the town turns creepy

// Barttown: one long town, the camera follows you.
// The map comes from public/assets/maps/town.json (made in the Tiled format).
export class TownScene extends WorldScene {
  constructor() {
    super('Town');
  }

  create() {
    this.startWorld();
    this.after = state.part === 'after'; // true once the Glitch House is fixed
    this.entity = null;
    this.musicOff = false;
    ui.dark(false);
    ui.progress(null);
    ui.item(state.hasRock ? 'glitch-rock' : null, 'Glitch rock');

    const map = this.make.tilemap({ key: 'town' });
    const tiles = map.addTilesetImage('town-tiles', 'town-tiles');
    const ground = map.createLayer('ground', tiles);
    const fences = map.createLayer('walls', tiles);
    fences.setCollisionByProperty({ collides: true });
    fences.setDepth(2);

    if (this.after) {
      // the creepy ground turns back into grass and a normal road
      const heal = { 14: 1, 15: 2, 16: 8, 19: 8, 17: 10, 18: 11, 29: 3 };
      ground.forEachTile((tile) => { if (heal[tile.index]) tile.index = heal[tile.index]; });
    }

    this.spawns = {};
    this.people = {};
    const things = map.getObjectLayer('things').objects;
    for (const thing of things) if (thing.type === 'spawn') this.spawns[thing.name] = thing;
    for (const thing of things) this.addThing(thing);

    const spawn = state.townPos || this.spawns[this.after ? 'house-door' : 'start'];
    this.addPlayer(spawn.x, spawn.y, this.after ? 'down' : 'right');
    this.physics.add.collider(this.player, fences);
    this.setupCamera(map.widthInPixels, map.heightInPixels, true);

    if (!this.after) this.addCreepyShade(map);
    if (this.after) this.startEnding();

    this.cameras.main.fadeIn(500, this.after ? 255 : 0, this.after ? 255 : 0, this.after ? 255 : 0);
    this.updateMusic();
  }

  addThing(thing) {
    const { name, type, x, y } = thing;
    if (type === 'prop') return this.addTownProp(name, x, y);
    if (type === 'trigger' && name === 'runner') this.runnerX = x;
    if (type === 'door') {
      this.addSpot(x, y, this.after ? 'look at the house' : 'open the door', () => this.useDoor(), { radius: 22, top: 30 });
    }
    if (type === 'npc') this.addTownPerson(name, x, y);
  }

  addTownProp(name, x, y) {
    if (this.after) {
      if (name === 'glitch-puddle' || name === 'sign-danger') return;
      if (name === 'tree-dead') name = 'tree-autumn';
      if (name === 'glitch-house') name = 'glitch-house-fixed';
    }
    const prop = this.addProp(name, x, y);

    if (name === 'glitch-puddle') {
      this.tweens.add({ targets: prop, alpha: 0.65, scaleX: 1.08, duration: 300 + Math.random() * 300, yoyo: true, repeat: -1 });
      twitch(this, prop, { strength: 1, chance: 0.15 });
      this.hazards.push((px, py) => Math.abs(px - x) < 15 && py > y - 19 && py < y);
    }
    if (name === 'glitch-house') {
      twitch(this, prop, { strength: 2, chance: 0.12, tints: [0xd58cff, 0xe8d0ff, 0xb8ffc8] });
      this.add.particles(x, y, 'dot', {
        x: { min: -62, max: 62 }, y: { min: -112, max: -4 }, lifespan: 700, speedY: { min: -25, max: -6 },
        scale: { start: 0.6, end: 0 }, tint: [PURPLE, PURPLE, GLITCH_GREEN], frequency: 90,
      }).setDepth(y + 1);
    }
    if (name === 'glitch-house-fixed') {
      this.add.particles(x, y, 'dot', {
        x: { min: -62, max: 62 }, y: { min: -112, max: -4 }, lifespan: 900, speedY: { min: -12, max: -4 },
        scale: { start: 0.5, end: 0 }, tint: [0xffffff, 0xfff3b0], frequency: 260,
      }).setDepth(y + 1);
    }
    if (name === 'fountain') {
      this.add.particles(x, y - 44, 'dot', {
        speedX: { min: -16, max: 16 }, speedY: { min: -34, max: -14 }, gravityY: 90, lifespan: 650,
        scale: 0.5, tint: [0x9fd6f7, 0xffffff, 0x4aa8e8], frequency: 60,
      }).setDepth(y + 1);
    }
    if (name === 'house-farmer') {
      this.add.particles(x + 32, y - 62, 'dot', {
        speedX: { min: 1, max: 6 }, speedY: { min: -14, max: -8 }, lifespan: 2200,
        scale: { start: 0.6, end: 1.8 }, alpha: { start: 0.8, end: 0 }, tint: [0x9a9aa6, 0xb8b8c4], frequency: 380,
      }).setDepth(y + 1);
    }
    if (name === 'sign-danger') this.addSpot(x, y, 'read the sign', () => this.talk(STORY.dangerSign), { radius: 20, top: 34 });
    if (name === 'sign-town') this.addSpot(x, y, 'read the sign', () => this.talk(STORY.townSign), { radius: 26, top: 42 });
  }

  addTownPerson(name, x, y) {
    if (this.after) return; // after the house is fixed everyone is at the party
    const person = this.addPerson(name, x, y);
    this.people[name] = person;
    const say = {
      mayor: () => this.talk(state.met.mayor ? STORY.mayorAgain : STORY.mayorHello, () => this.met('mayor')),
      farmer: () => this.talk(state.met.farmer ? STORY.farmerAgain : STORY.farmer, () => this.met('farmer')),
      maker: () => this.talk(state.met.maker ? STORY.makerAgain : STORY.maker, () => this.met('maker')),
      miner: () => {
        if (state.hasRock) return this.talk(STORY.minerAgain);
        this.talk(STORY.miner, () => {
          sfx.pickup();
          state.hasRock = true;
          ui.item('glitch-rock', 'Glitch rock');
          this.talk(STORY.minerGotRock, () => this.met('miner'));
        });
      },
    };
    const title = { mayor: 'Mayor', farmer: 'Farmer', miner: 'Miner', maker: 'Village Maker' }[name];
    this.addSpot(x, y, `talk to the ${title}`, () => {
      this.lookAtPlayer(person);
      say[name]();
    });

    if (name === 'miner') {
      // he swings his pickaxe at the rock next to him
      person.setFrame(DIRECTIONS.indexOf('left') * FRAMES_PER_ROW);
      const pick = this.add.image(x - 8, y - 12, 'pickaxe').setOrigin(0.9, 0.9).setFlipX(true).setDepth(y + 1);
      this.tweens.add({ targets: pick, angle: { from: 30, to: -50 }, duration: 380, yoyo: true, repeat: -1, repeatDelay: 250, ease: 'Quad.easeIn' });
    }
  }

  lookAtPlayer(person) {
    const dx = this.player.x - person.x, dy = this.player.y - person.y;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
    person.setFrame(DIRECTIONS.indexOf(dir) * FRAMES_PER_ROW);
  }

  // remember who we talked to, and where we are
  met(name) {
    state.met[name] = true;
    this.remember();
  }

  remember() {
    state.started = true;
    state.townPos = { x: Math.round(this.player.x), y: Math.round(this.player.y) };
    saveState();
  }

  // darker, purple air over the creepy end of town
  addCreepyShade(map) {
    for (let i = 0; i < 6; i++) {
      this.add.rectangle(SPOOKY_FROM - 48 + i * 16, 0, i === 5 ? map.widthInPixels : 16, map.heightInPixels, 0x1a0a2a, 0.05 + i * 0.045)
        .setOrigin(0, 0).setDepth(9000);
    }
  }

  updateMusic() {
    const creepy = !this.after && this.player.x > SPOOKY_FROM;
    if (this.musicOff) return;
    playMusic(creepy ? 'house' : 'town');
  }

  // ───── the story bits ─────
  update() {
    this.updateWorld();
    this.updateMusic();
    if (this.frozen || ui.busy || this.zapping) return;
    const player = this.player;

    if (!this.after) {
      const mayor = this.people.mayor;
      if (!state.met.mayor && mayor && player.x > mayor.x - 46) {
        this.lookAtPlayer(mayor);
        this.talk(STORY.mayorHello, () => this.met('mayor'));
      } else if (!state.met.runner && player.x > this.runnerX) {
        this.runnerScene();
      }
    } else if (state.cheered && this.entity && player.x < this.entity.x + 70) {
      this.entityScene();
    }
  }

  // The Runner comes running, says hello... and glitches away.
  runnerScene() {
    this.freeze('right');
    const player = this.player;
    const startX = this.cameras.main.worldView.right + 24;
    const runner = this.add.sprite(startX, player.y, 'runner').setOrigin(0.5, 0.9).setDepth(player.y);
    runner.play('runner-walk-left');
    runner.anims.timeScale = 1.7;
    this.tweens.add({
      targets: runner,
      x: player.x + 30,
      duration: ((startX - player.x - 30) / 150) * 1000,
      onComplete: () => {
        runner.anims.stop();
        runner.setFrame(DIRECTIONS.indexOf('left') * FRAMES_PER_ROW);
        ui.say(STORY.runnerHello, () => {
          screenGlitch(this);
          glitchOut(this, runner, { time: 900 }, () => {
            runner.destroy();
            this.time.delayedCall(500, () => ui.say(STORY.runnerGone, () => {
              this.frozen = false;
              this.met('runner');
            }));
          });
        });
      },
    });
  }

  afterZap() {
    const back = this.spawns['after-zap'];
    this.player.setPosition(back.x, back.y);
    this.standStill('right');
    glitchOut(this, this.player, { appear: true, time: 350, sound: false }, () => {
      this.zapping = false;
      if (!state.zappedOnce) {
        state.zappedOnce = true;
        this.talk(STORY.firstZap, () => this.remember());
      }
    });
  }

  useDoor() {
    if (this.after) return this.talk([['player', 'The house is cosy and quiet again. No more glitches here.']]);
    if (!state.hasRock) return this.talk(STORY.doorNotReady);
    this.talk(STORY.doorEnter, () => {
      this.frozen = true;
      state.part = 'house';
      state.townPos = null;
      state.started = true;
      saveState();
      sfx.door();
      this.cameras.main.fadeOut(900, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(`Room${state.roomsDone + 1}`));
    });
  }

  // ───── after the house is fixed ─────
  startEnding() {
    const spot = this.spawns.cheer;
    const party = [['maker', -34, 2, 'right'], ['farmer', -14, 14, 'right'], ['miner', 10, 16, 'up'], ['runner', 32, 6, 'up']];
    party.forEach(([name, dx, dy, facing], i) => {
      const person = this.addPerson(name, spot.x + dx, spot.y + dy, facing);
      this.people[name] = person;
      this.tweens.add({ targets: person, y: person.y - 6, duration: 220, yoyo: true, repeat: -1, repeatDelay: 300, delay: i * 130, ease: 'Quad.easeOut' });
      this.addSpot(person.x, person.y, 'talk', () => this.talk(STORY.cheerAgain[name]));
    });
    this.add.particles(spot.x, spot.y - 150, 'dot', {
      x: { min: -120, max: 120 }, speedY: { min: 30, max: 70 }, speedX: { min: -15, max: 15 }, lifespan: 3200,
      scale: 0.6, rotate: { min: 0, max: 360 }, tint: [0xd8423a, 0xf5c933, 0x3d8fe0, 0x63b84f, 0xff8fc0, 0xffffff], frequency: 45,
    }).setDepth(9100);

    // the Mayor is not at the party... he is by the fountain, and he has changed
    const centre = this.spawns['town-centre'];
    this.entity = this.add.sprite(centre.x, centre.y, 'entity', 0).setOrigin(0.5, 0.9).setDepth(centre.y);
    twitch(this, this.entity, { strength: 2, chance: 0.35, tints: [0xd58cff, 0x42f56c, 0xffffff] });
    this.add.particles(centre.x, centre.y, 'dot', {
      x: { min: -12, max: 12 }, y: { min: -38, max: 0 }, lifespan: 600, speedY: { min: -30, max: -8 },
      scale: { start: 0.6, end: 0 }, tint: [PURPLE, GLITCH_GREEN], frequency: 70,
    }).setDepth(centre.y + 1);

    if (!state.cheered) {
      this.freeze('down');
      this.time.delayedCall(900, () => {
        sfx.cheer();
        ui.banner('The house is fixed!', '#f5c933');
        this.time.delayedCall(1400, () => ui.say(STORY.cheer, () => {
          state.cheered = true;
          this.frozen = false;
          this.remember();
        }));
      });
    }
  }

  // The Mayor shows who he really is.
  entityScene() {
    this.freeze('left');
    this.musicOff = true;
    stopMusic();
    sfx.sting();
    screenGlitch(this, true);
    const shade = this.add.rectangle(0, 0, 4000, 400, 0x1a0a2a, 0).setOrigin(0, 0).setDepth(9000);
    this.tweens.add({ targets: shade, fillAlpha: 0.35, duration: 800 });
    this.entity.setFrame(DIRECTIONS.indexOf('right') * FRAMES_PER_ROW);
    this.time.delayedCall(1200, () => ui.say(STORY.entity, () => {
      screenGlitch(this, true);
      glitchOut(this, this.entity, { time: 1300 }, () => {
        this.time.delayedCall(700, () => ui.say(STORY.entityGone, () => {
          state.part = 'end';
          saveState();
          this.cameras.main.fadeOut(1500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('End'));
        }));
      });
    }));
  }
}
