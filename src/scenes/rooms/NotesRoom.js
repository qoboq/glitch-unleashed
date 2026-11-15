import Phaser from 'phaser';
import { TILE_SIZE as T, PURPLE } from '../../settings.js';
import { RoomScene, WALL } from './RoomScene.js';
import { ui } from '../UIScene.js';
import { STORY } from '../../story.js';
import { sfx } from '../../sound.js';

// Room 3: the music box plays a tune on four coloured tiles.
// Walk over the tiles in the same order. Three tunes, each one longer.
const TUNE_LENGTHS = [3, 4, 5];
const COLOURS = [0xff5a4f, 0xffd84a, 0x5fe06a, 0x4fa8ff]; // red, yellow, green, blue

export class NotesRoom extends RoomScene {
  constructor() {
    super(3, 'Notes');
  }

  create(data) {
    this.buildRoom({ intro: STORY.room3, retry: data.retry });
    this.round = 0;
    this.listening = false; // true when it is the player's turn
    this.playing = false;
    this.tune = null;

    // four tiles in a diamond
    const spots = [[12, 5.5], [7, 8.5], [17, 8.5], [12, 11]];
    this.plates = spots.map(([x, y], i) => {
      const plate = this.addPlate(x * T, y * T, '♪', '#141414');
      plate.note = i;
      plate.setTint(COLOURS[i]).setAlpha(0.55);
      return plate;
    });

    const box = this.addProp('musicbox', this.doorX - 52, WALL * T + 14);
    this.addSpot(box.x, box.y, 'play the music box', () => this.useBox(), { top: 40, when: () => !this.solved && !this.playing });

    // purple squares that switch on and off
    this.blinkers = [[9.5, 7], [14.5, 7], [9.5, 10], [14.5, 10]].map(([x, y], i) => {
      const square = this.add.rectangle(x * T, y * T, 26, 26, PURPLE).setDepth(1).setStrokeStyle(1, 0xd58cff);
      square.on = i % 2 === 0;
      return square;
    });
    this.time.addEvent({ delay: 1500, loop: true, callback: () => this.blinkers.forEach((s) => { s.on = !s.on; }) });
    this.hazards.push((px, py) => this.blinkers.some((s) => s.on && Math.abs(px - s.x) < 12 && Math.abs(py - s.y) < 12));

    this.showProgress();
  }

  showProgress() {
    ui.progress(`Tune ${Math.min(this.round + 1, TUNE_LENGTHS.length)} of ${TUNE_LENGTHS.length}`);
  }

  useBox() {
    if (!this.heardRules) {
      this.heardRules = true;
      return this.talk(STORY.room3Box, () => this.playTune(true));
    }
    this.playTune(!this.tune);
  }

  // new = make up a new tune; otherwise play the same one again
  playTune(fresh) {
    if (fresh || !this.tune) {
      this.tune = [];
      while (this.tune.length < TUNE_LENGTHS[this.round]) {
        const note = Phaser.Math.Between(0, 3);
        if (note !== this.tune[this.tune.length - 1]) this.tune.push(note);
      }
    }
    this.playing = true;
    this.listening = false;
    this.freeze();
    this.tune.forEach((note, i) => this.time.delayedCall(500 + i * 650, () => this.light(note)));
    this.time.delayedCall(500 + this.tune.length * 650, () => {
      this.playing = false;
      this.frozen = false;
      this.listening = true;
      this.step = 0;
      this.standingOn = this.plateUnderFeet(this.plates);
      ui.banner('Your turn!', '#ffffff');
    });
  }

  light(note) {
    const plate = this.plates[note];
    sfx.note(note);
    plate.setAlpha(1).setScale(1.15);
    this.tweens.add({ targets: plate, alpha: 0.55, scale: 1, duration: 450 });
  }

  update() {
    this.updateRoom();
    this.blinkers.forEach((s) => s.setAlpha(s.on ? 0.5 + 0.3 * Math.sin(this.time.now / 70) ** 2 + 0.2 : 0.08));
    if (this.solved || this.zapping || this.playing) return;

    const plate = this.plateUnderFeet(this.plates);
    if (plate === this.standingOn) return;
    this.standingOn = plate;
    if (!plate) return;

    this.light(plate.note);
    if (!this.listening) return;
    if (plate.note !== this.tune[this.step]) return this.wrong('WRONG NOTE!');
    this.step++;
    if (this.step < this.tune.length) return;

    // whole tune right!
    this.listening = false;
    this.round++;
    if (this.round === TUNE_LENGTHS.length) return this.solve();
    sfx.good();
    ui.banner('Right! Listen again...', '#42f56c');
    this.showProgress();
    this.tune = null;
    this.time.delayedCall(1600, () => { if (!this.zapping) this.playTune(true); });
  }
}
