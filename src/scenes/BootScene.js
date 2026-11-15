import Phaser from 'phaser';
import { PROPS } from '../props.js';
import { makeAllCharacters } from '../characters.js';

// Loads all the pictures and the map, draws the characters, then shows the title.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('town-tiles', 'assets/tiles/town-tiles.png');
    this.load.image('house-tiles', 'assets/tiles/house-tiles.png');
    this.load.tilemapTiledJSON('town', 'assets/maps/town.json');
    this.load.image('logo', 'assets/title/logo.jpg');
    for (const key of Object.keys(PROPS)) this.load.image(key, `assets/props/${key}.png`);
    this.load.spritesheet('glitch-blob', 'assets/props/glitch-blob.png', { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    makeAllCharacters(this);
    this.textures.get('logo').setFilter(Phaser.Textures.FilterMode.LINEAR); // the drawing should stay smooth

    // small helper pictures made with code
    const dot = this.textures.createCanvas('dot', 4, 4);
    dot.getContext().fillStyle = '#ffffff';
    dot.getContext().fillRect(0, 0, 4, 4);
    dot.refresh();

    const bubble = this.textures.createCanvas('bubble', 9, 12);
    const b = bubble.getContext();
    b.fillStyle = '#141414'; b.fillRect(0, 0, 9, 10); b.fillRect(3, 10, 3, 2);
    b.fillStyle = '#ffffff'; b.fillRect(1, 1, 7, 8); b.fillRect(4, 9, 1, 2);
    b.fillStyle = '#d8423a'; b.fillRect(4, 2, 1, 4); b.fillRect(4, 7, 1, 1);
    bubble.refresh();

    // the darkness inside the Glitch House: see-through in the middle, dark at the edges
    const dark = this.textures.createCanvas('darkness', 256, 256);
    const d = dark.getContext();
    const grad = d.createRadialGradient(128, 128, 14, 128, 128, 128);
    grad.addColorStop(0, 'rgba(10,3,20,0)');
    grad.addColorStop(0.35, 'rgba(10,3,20,0.55)');
    grad.addColorStop(0.7, 'rgba(10,3,20,0.9)');
    grad.addColorStop(1, 'rgba(10,3,20,0.96)');
    d.fillStyle = grad;
    d.fillRect(0, 0, 256, 256);
    dark.refresh();

    this.anims.create({ key: 'blob', frames: this.anims.generateFrameNumbers('glitch-blob', { start: 0, end: 1 }), frameRate: 5, repeat: -1 });

    this.scene.launch('UI');
    this.scene.start('Title');
  }
}
