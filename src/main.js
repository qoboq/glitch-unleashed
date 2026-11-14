import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#1b1b2f',
  pixelArt: true,   // no blurry smoothing on pixel art
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
  scene: [GameScene],
};

new Phaser.Game(config);
