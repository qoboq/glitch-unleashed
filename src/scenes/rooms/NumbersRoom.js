import Phaser from 'phaser';
import { TILE_SIZE as T } from '../../settings.js';
import { RoomScene, ROOM_W, WALL } from './RoomScene.js';
import { ui } from '../UIScene.js';
import { STORY } from '../../story.js';
import { state, saveState } from '../../state.js';
import { sfx } from '../../sound.js';

// Room 2: find three hidden numbers, then type them into the number pad.
// The numbers are different in every new game.
export class NumbersRoom extends RoomScene {
  constructor() {
    super(2, 'Numbers');
  }

  create(data) {
    this.buildRoom({ intro: STORY.room2, retry: data.retry });

    if (!state.code) {
      // three numbers, each hidden as a little sum like "3 + 4"
      state.code = [0, 1, 2].map(() => {
        const answer = Phaser.Math.Between(2, 9);
        const a = Phaser.Math.Between(1, answer - 1);
        return { answer, sum: `${a} + ${answer - a}` };
      });
      saveState();
    }
    this.clues = [false, false, false];

    const wallY = WALL * T + 12; // things standing against the top wall
    const clue = (n, lines) => () => this.talk(lines, () => {
      if (!this.clues[n]) sfx.good();
      this.clues[n] = true;
      this.showProgress();
    });
    const sum = (n) => state.code[n].sum;

    const shelf = this.addProp('bookshelf', 4 * T, wallY);
    this.addSpot(shelf.x, wallY + 6, 'look at the books', clue(0, [
      ['sign', `A note falls out of a dusty book:\n"The FIRST number is  ${sum(0)}"`],
    ]), { top: 50 });

    const clock = this.addProp('clock', 19 * T, wallY);
    this.addSpot(clock.x, wallY + 6, 'look at the clock', clue(1, [
      ['sign', `Somebody scratched words into the old clock:\n"The SECOND number is  ${sum(1)}"`],
    ]), { top: 50 });

    const chest = this.addProp('chest', 20.5 * T, 12.5 * T);
    this.addSpot(chest.x, chest.y, 'open the chest', clue(2, [
      ['sign', `Inside the chest is one tiny card:\n"The THIRD number is  ${sum(2)}"`],
    ]), { top: 30 });

    const mirror = this.addProp('mirror', 8 * T, wallY);
    this.addSpot(mirror.x, wallY + 6, 'look in the mirror', () => this.talk([
      ['player', 'A cracked mirror. For a second my reflection glitched... Brr.'],
    ]), { top: 46 });

    this.add.image(15.5 * T, WALL * T - 14, 'painting').setDepth(2);
    this.addSpot(15.5 * T, WALL * T + 8, 'look at the painting', () => this.talk([
      ['player', 'A painting of this house, from when it was still normal and cosy.'],
    ]), { radius: 20, top: 40 });

    this.addProp('candle', 2 * T, 12.5 * T);
    this.addProp('candle', (ROOM_W - 2) * T, 5 * T);

    this.add.image(this.doorX + 28, WALL * T - 14, 'keypad').setDepth(2);
    this.addSpot(this.doorX + 28, WALL * T + 8, 'use the number pad', () => this.useKeypad(), { radius: 18, top: 38, when: () => !this.solved });

    // purple blobs on patrol
    this.addBlob(3 * T, 5.5 * T, 21 * T, 5.5 * T, 5200);
    this.addBlob(21 * T, 9.5 * T, 3 * T, 9.5 * T, 6400);
    this.addBlob(7 * T, 7 * T, 7 * T, 12.5 * T, 3000);
    this.addBlob(17 * T, 12.5 * T, 17 * T, 7 * T, 3600);

    this.showProgress();
  }

  showProgress() {
    const names = ['1st', '2nd', '3rd'];
    ui.progress(names.map((name, n) => `${name}:  ${this.clues[n] ? state.code[n].sum : '?'}`).join('      '));
  }

  useKeypad() {
    this.standStill('up');
    ui.askCode(3, (typed) => {
      if (typed === null) return;
      if (typed === state.code.map((c) => c.answer).join('')) this.solve();
      else this.wrong('WRONG CODE!');
    });
  }
}
