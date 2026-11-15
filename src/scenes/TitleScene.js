import Phaser from 'phaser';
import { FONT } from '../settings.js';
import { CHARACTERS } from '../characters.js';
import { state, loadState, resetState } from '../state.js';
import { unlockAudio, playMusic, sfx } from '../sound.js';
import { ui } from './UIScene.js';

// The first screen: the hand-drawn logo and everybody from the drawing.
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    this.starting = false;
    this.newText = null;
    this.hasSave = loadState() && state.part !== 'end';
    ui.scene.showHelp(false);
    ui.scene.setGame(false);
    ui.hint(null);
    ui.progress(null);
    ui.item(null);
    ui.dark(false);

    this.sky = this.add.rectangle(0, 0, 10, 10, 0x8fd3ff).setOrigin(0, 0);
    this.grass = this.add.rectangle(0, 0, 10, 10, 0x63b84f).setOrigin(0, 0);
    this.grassTop = this.add.rectangle(0, 0, 10, 10, 0x141414).setOrigin(0, 0);
    this.paper = this.add.rectangle(0, 0, 10, 10, 0x141414);
    this.logo = this.add.image(0, 0, 'logo');
    this.tweens.add({ targets: [this.logo, this.paper], angle: { from: -1.5, to: 1.5 }, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.cast = ['mayor', 'runner', 'player', 'miner', 'farmer', 'maker'].map((key, i) => {
      const sprite = this.add.sprite(0, 0, key, 0).setOrigin(0.5, 0.9);
      if (key in CHARACTERS) sprite.play({ key: `${key}-walk-down`, startFrame: i % 4 });
      return sprite;
    });

    // one button to start; two if there is a saved game. They work with a
    // tap or click as well as with the keys.
    const style = { fontFamily: FONT, color: '#ffffff', stroke: '#141414' };
    const key = (name, label) => (ui.touch ? label : `${name}: ${label}`);
    if (this.hasSave) {
      this.startText = this.add.text(0, 0, key('SPACE', 'Carry on'), style).setOrigin(0.5);
      this.newText = this.add.text(0, 0, key('N', 'New game'), style).setOrigin(0.5);
      this.newText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.startGame(true));
    } else {
      this.startText = this.add.text(0, 0, ui.touch ? 'Tap to start' : 'Press SPACE to start', style).setOrigin(0.5);
      this.input.on('pointerdown', () => this.startGame(false)); // tap anywhere
    }
    this.startText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.startGame(false));
    this.tweens.add({ targets: this.startText, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
    this.partText = this.add.text(0, 0, 'Part 1:  The Glitch House', { fontFamily: FONT, color: '#141414' }).setOrigin(0.5);

    this.input.keyboard.on('keydown', (event) => {
      if (this.starting) return;
      if (event.key === ' ' || event.key === 'Enter') this.startGame(false);
      if (event.key === 'n' || event.key === 'N') this.startGame(true);
    });

    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    this.layout();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    const u = Phaser.Math.Clamp(Math.round(Math.min(H / 190, W / 300)), 2, 6);
    const groundY = Math.round(H * 0.72);
    this.sky.setSize(W, H);
    this.grass.setPosition(0, groundY).setSize(W, H - groundY);
    this.grassTop.setPosition(0, groundY - u).setSize(W, u);

    const logoW = Math.min(W * 0.86, 300 * u);
    const scale = logoW / this.logo.width;
    this.logo.setScale(scale).setPosition(W / 2, H * 0.24);
    this.paper.setSize(this.logo.displayWidth + 4 * u, this.logo.displayHeight + 4 * u).setPosition(W / 2, H * 0.24).setOrigin(0.5);

    const gap = Math.min(40 * u, (W * 0.8) / this.cast.length);
    this.cast.forEach((sprite, i) => sprite.setScale(u * 1.5).setPosition(W / 2 + (i - (this.cast.length - 1) / 2) * gap, groundY + 12 * u));

    this.partText.setPosition(W / 2, H * 0.24 + this.logo.displayHeight / 2 + 10 * u).setFontSize(12 * u);
    const gapX = this.newText ? 50 * u : 0;
    this.startText.setPosition(W / 2 - gapX, H - 14 * u).setFontSize(14 * u).setStroke('#141414', 2 * u);
    this.newText?.setPosition(W / 2 + gapX, H - 14 * u).setFontSize(14 * u).setStroke('#141414', 2 * u);
  }

  startGame(fresh) {
    if (this.starting) return;
    this.starting = true;
    unlockAudio();
    sfx.pickup();
    if (fresh || !this.hasSave) resetState();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(state.part === 'house' ? `Room${Math.min(state.roomsDone + 1, 4)}` : 'Town');
    });
  }
}
