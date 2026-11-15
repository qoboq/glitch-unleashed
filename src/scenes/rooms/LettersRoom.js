import { TILE_SIZE as T } from '../../settings.js';
import { RoomScene, WALL } from './RoomScene.js';
import { ui } from '../UIScene.js';
import { STORY } from '../../story.js';
import { sfx } from '../../sound.js';

// Room 1: walk over the letters to spell the secret word.
// Change WORD and LETTERS to make a different puzzle (every letter of WORD
// must be on the floor exactly once).
const WORD = 'GLITCH';
const LETTERS = [
  'TAHOC',
  'BLEIN',
  'GRSWU',
];
// purple floor tiles, as [x, y] in tiles
const PURPLE_TILES = [[1, 3], [2, 3], [1, 4], [2, 4], [5, 6], [6, 6], [5, 7], [6, 7], [13, 3], [14, 3], [13, 4], [14, 4], [17, 9], [18, 9], [17, 10], [18, 10], [21, 6], [22, 6], [21, 7], [22, 7]];

export class LettersRoom extends RoomScene {
  constructor() {
    super(1, 'Letters');
  }

  create(data) {
    this.buildRoom({ purple: PURPLE_TILES, intro: STORY.room1, retry: data.retry });
    this.found = 0;
    this.plates = [];
    LETTERS.forEach((row, j) => [...row].forEach((letter, i) => {
      const plate = this.addPlate((4 + i * 4) * T, (4 + j * 3) * T, letter);
      plate.letter = letter;
      this.plates.push(plate);
    }));

    const sign = this.add.image(this.doorX - 44, WALL * T - 12, 'plaque').setDepth(2);
    this.addSpot(sign.x, WALL * T + 8, 'read the sign', () => this.talk(STORY.room1Sign), { radius: 24, top: 36 });
    this.showProgress();
  }

  showProgress() {
    ui.progress([...WORD].map((letter, i) => (i < this.found ? letter : '_')).join(' '));
  }

  update() {
    this.updateRoom();
    if (this.solved || this.zapping) return;
    const plate = this.plateUnderFeet(this.plates);
    if (plate === this.standingOn) return;
    this.standingOn = plate;
    if (!plate || plate.done) return;

    if (plate.letter === WORD[this.found]) {
      plate.done = true;
      plate.setTint(0x7dff9a);
      sfx.note(this.found % 4);
      this.found++;
      this.showProgress();
      if (this.found === WORD.length) this.solve();
    } else {
      plate.setTint(0xd58cff);
      this.wrong('WRONG LETTER!');
    }
  }
}
