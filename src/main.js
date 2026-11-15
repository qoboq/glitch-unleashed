import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { UIScene } from './scenes/UIScene.js';
import { TownScene } from './scenes/TownScene.js';
import { LettersRoom } from './scenes/rooms/LettersRoom.js';
import { NumbersRoom } from './scenes/rooms/NumbersRoom.js';
import { NotesRoom } from './scenes/rooms/NotesRoom.js';
import { GeometryRoom } from './scenes/rooms/GeometryRoom.js';
import { EndScene } from './scenes/EndScene.js';
import { state } from './state.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0d0912',
  pixelArt: true,    // no blurry smoothing on pixel art
  roundPixels: true, // snap everything to whole pixels
  scale: {
    mode: Phaser.Scale.RESIZE, // canvas fills the browser window
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false },
  },
  scene: [BootScene, TitleScene, TownScene, LettersRoom, NumbersRoom, NotesRoom, GeometryRoom, EndScene, UIScene],
};

// Wait for the pixel font, then start.
const fonts = document.fonts
  ? document.fonts.load('16px "Jersey 15"')
  : Promise.resolve();
fonts.catch(() => {}).then(() => {
  window.game = new Phaser.Game(config);
  window.game.story = state; // handy for testing in the browser console
});
