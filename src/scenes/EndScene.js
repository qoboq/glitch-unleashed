import Phaser from 'phaser';
import { FONT, PURPLE, GLITCH_GREEN } from '../settings.js';
import { ui } from './UIScene.js';
import { resetState } from '../state.js';
import { sfx, stopMusic } from '../sound.js';

// "End of Part 1"
export class EndScene extends Phaser.Scene {
  constructor() {
    super('End');
  }

  create() {
    stopMusic();
    ui.scene.showHelp(false);
    ui.scene.setGame(false);
    ui.hint(null);
    ui.item(null);
    const style = { fontFamily: FONT, color: '#ffffff', align: 'center' };
    this.ghostA = this.add.text(0, 0, 'END OF PART 1', { ...style, color: '#a23ce0' }).setOrigin(0.5);
    this.ghostB = this.add.text(0, 0, 'END OF PART 1', { ...style, color: '#42f56c' }).setOrigin(0.5);
    this.big = this.add.text(0, 0, 'END OF PART 1', style).setOrigin(0.5);
    this.small = this.add.text(0, 0, 'The Entity Mayor is still out there...\n\nTo be continued!', { ...style, color: '#d58cff' }).setOrigin(0.5);
    this.again = this.add.text(0, 0, ui.touch ? 'Tap to go back to the start' : 'Press SPACE to go back to the start', { ...style, color: '#8a8a98' }).setOrigin(0.5);
    this.entity = this.add.sprite(0, 0, 'entity', 0).setOrigin(0.5, 0.9);

    this.time.addEvent({ delay: 120, loop: true, callback: () => this.jitter() });
    this.time.addEvent({ delay: 4000, loop: true, callback: () => sfx.crackle() });
    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
    this.layout();
    this.cameras.main.fadeIn(1200, 0, 0, 0);

    const back = () => {
      resetState();
      this.scene.start('Title');
    };
    this.time.delayedCall(1500, () => {
      this.input.keyboard.on('keydown', (event) => { if (event.key === ' ' || event.key === 'Enter') back(); });
      this.input.on('pointerdown', back);
    });
  }

  layout() {
    const W = this.scale.width, H = this.scale.height;
    const u = Phaser.Math.Clamp(Math.round(Math.min(H / 190, W / 300)), 2, 6);
    this.u = u;
    for (const t of [this.big, this.ghostA, this.ghostB]) t.setPosition(W / 2, H * 0.2).setFontSize(26 * u);
    this.small.setPosition(W / 2, H * 0.44).setFontSize(12 * u);
    this.again.setPosition(W / 2, H - 6 * u).setFontSize(8 * u);
    this.entity.setPosition(W / 2, H * 0.88).setScale(u * 1.25);
  }

  jitter() {
    const W = this.scale.width, u = this.u;
    const on = Math.random() < 0.3;
    this.ghostA.setX(W / 2 + (on ? Phaser.Math.Between(-3, 3) * u : -u));
    this.ghostB.setX(W / 2 + (on ? Phaser.Math.Between(-3, 3) * u : u));
    this.entity.setTint(on ? Phaser.Utils.Array.GetRandom([PURPLE, GLITCH_GREEN, 0xffffff]) : 0xffffff);
    this.entity.setX(W / 2 + (on ? Phaser.Math.Between(-2, 2) * u : 0));
  }
}
