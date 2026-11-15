import Phaser from 'phaser';
import { FONT } from '../settings.js';
import { CHARACTERS } from '../characters.js';
import { sfx, toggleMute, unlockAudio } from '../sound.js';

// Everything drawn on top of the game: the talking box, hints, the item you
// carry and the number pad. Other scenes use it through `ui`:
//
//   ui.say(STORY.farmer, () => { ...what happens after... });
//   ui.hint('SPACE: talk');
export const ui = {
  scene: null,
  busy: false,       // true while a talking box or number pad is open
  closedAt: 0,
  say(lines, onDone) { this.scene.say(lines, onDone); },
  hint(text) { this.scene.setHint(text); },
  progress(text) { this.scene.setProgress(text); },
  banner(text, colour) { this.scene.showBanner(text, colour); },
  item(key, label) { this.scene.setItem(key, label); },
  askCode(length, onDone) { this.scene.askCode(length, onDone); },
  dark(on) { this.scene.setDark(on); },
  // true right after a box closed, so one key press does not do two things
  justClosed() { return performance.now() - this.closedAt < 250; },
};

const NAME_COLOURS = {
  player: '#c9940a', mayor: '#5a4a52', entity: '#8a2fd0', runner: '#d8423a',
  miner: '#2f6fc4', farmer: '#7a4a25', maker: '#3d6fc4',
};

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UI');
  }

  create() {
    ui.scene = this;
    this.lines = [];
    this.darkStyle = false;

    this.panel = this.add.graphics();
    this.faceFrame = this.add.graphics();
    this.portrait = this.add.image(0, 0, 'player', 'face').setOrigin(0, 0);
    this.nameText = this.add.text(0, 0, '', { fontFamily: FONT });
    this.bodyText = this.add.text(0, 0, '', { fontFamily: FONT });
    this.arrow = this.add.text(0, 0, '▼', { fontFamily: FONT, color: '#d8423a' });
    this.tweens.add({ targets: this.arrow, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    this.box = [this.panel, this.faceFrame, this.portrait, this.nameText, this.bodyText, this.arrow];
    this.box.forEach((o) => o.setVisible(false));

    this.hintText = this.add.text(0, 0, '', { fontFamily: FONT, color: '#ffffff', backgroundColor: '#141414cc', padding: { x: 10, y: 5 } }).setOrigin(0.5, 1).setVisible(false);
    this.progressText = this.add.text(0, 0, '', { fontFamily: FONT, color: '#ffffff', backgroundColor: '#141414cc', padding: { x: 12, y: 6 }, align: 'left' }).setOrigin(0, 0).setVisible(false);
    this.bannerText = this.add.text(0, 0, '', { fontFamily: FONT, color: '#ffffff', stroke: '#141414', align: 'center' }).setOrigin(0.5).setAlpha(0);
    this.helpText = this.add.text(0, 0, 'Arrows / WASD: walk    SPACE: talk, use    M: sound', { fontFamily: FONT, color: '#ffffff' }).setAlpha(0.6).setVisible(false);

    this.itemBox = this.add.graphics().setVisible(false);
    this.itemIcon = this.add.image(0, 0, 'glitch-rock').setVisible(false);
    this.itemLabel = this.add.text(0, 0, '', { fontFamily: FONT, color: '#ffffff', stroke: '#141414', strokeThickness: 4 }).setOrigin(0.5, 0).setVisible(false);

    // number pad
    this.codePanel = this.add.graphics().setVisible(false);
    this.codeTitle = this.add.text(0, 0, 'Type the secret code', { fontFamily: FONT, color: '#42f56c' }).setOrigin(0.5).setVisible(false);
    this.codeDigits = this.add.text(0, 0, '', { fontFamily: FONT, color: '#42f56c' }).setOrigin(0.5).setVisible(false);
    this.codeHelp = this.add.text(0, 0, 'Number keys: type    ENTER: OK    ESC: go back', { fontFamily: FONT, color: '#d8d8e0' }).setOrigin(0.5).setVisible(false);
    this.codeParts = [this.codePanel, this.codeTitle, this.codeDigits, this.codeHelp];

    this.input.keyboard.on('keydown', (event) => this.onKey(event));
    this.scale.on('resize', () => this.layout());
    this.layout();
  }

  // u = the size of one "UI pixel"; everything is measured in it so the UI
  // grows with the window
  layout() {
    const W = this.scale.width, H = this.scale.height;
    const u = Phaser.Math.Clamp(Math.round(Math.min(H / 190, W / 300)), 2, 6);
    this.u = u;
    const bw = Math.min(W - 8 * u, 250 * u), bh = 52 * u;
    const bx = Math.round((W - bw) / 2), by = H - bh - 5 * u;
    this.boxRect = { bx, by, bw, bh };
    this.drawPanel();

    this.portrait.setPosition(bx + 6 * u, by + 10 * u).setScale(2 * u);
    this.nameText.setPosition(bx + 44 * u, by + 4 * u).setFontSize(12 * u);
    this.bodyText.setPosition(bx + 44 * u, by + 17 * u).setFontSize(10 * u).setWordWrapWidth(bw - 52 * u).setLineSpacing(u);
    this.arrow.setPosition(bx + bw - 12 * u, by + bh - 13 * u).setFontSize(7 * u);

    this.hintText.setPosition(W / 2, H - 8 * u).setFontSize(9 * u);
    this.progressText.setPosition(4 * u, 3 * u).setFontSize(11 * u);
    this.bannerText.setPosition(W / 2, H * 0.36).setFontSize(18 * u).setStroke('#141414', 3 * u);
    this.helpText.setPosition(4 * u, 3 * u).setFontSize(7 * u);

    const ix = W - 30 * u, iy = 5 * u;
    this.itemBox.clear().fillStyle(0x141414, 1).fillRect(ix - 2 * u, iy - 2 * u, 24 * u, 24 * u).fillStyle(0xfff6dc, 1).fillRect(ix, iy, 20 * u, 20 * u);
    this.itemIcon.setPosition(ix + 10 * u, iy + 10 * u).setScale(u);
    this.itemLabel.setPosition(ix + 10 * u, iy + 23 * u).setFontSize(7 * u);

    const cw = 150 * u, ch = 70 * u, cx = W / 2, cy = H / 2;
    this.codePanel.clear().fillStyle(0x141414, 1).fillRect(cx - cw / 2, cy - ch / 2, cw, ch).fillStyle(0x12301a, 1).fillRect(cx - cw / 2 + 2 * u, cy - ch / 2 + 2 * u, cw - 4 * u, ch - 4 * u);
    this.codeTitle.setPosition(cx, cy - 22 * u).setFontSize(11 * u);
    this.codeDigits.setPosition(cx, cy).setFontSize(20 * u);
    this.codeHelp.setPosition(cx, cy + 24 * u).setFontSize(7 * u);
  }

  drawPanel() {
    const { bx, by, bw, bh } = this.boxRect;
    const u = this.u;
    const paper = this.darkStyle ? 0x241a30 : 0xfff6dc;
    this.panel.clear();
    this.panel.fillStyle(0x141414, 1).fillRect(bx, by, bw, bh);
    this.panel.fillStyle(this.darkStyle ? 0xa23ce0 : 0xf5c933, 1).fillRect(bx + 2 * u, by + 2 * u, bw - 4 * u, bh - 4 * u);
    this.panel.fillStyle(paper, 1).fillRect(bx + 3 * u, by + 3 * u, bw - 6 * u, bh - 6 * u);
    // frame around the face
    this.faceFrame.clear();
    this.faceFrame.fillStyle(0x141414, 1).fillRect(bx + 5 * u, by + 9 * u, 34 * u, 34 * u);
    this.faceFrame.fillStyle(this.darkStyle ? 0x3b2a4d : 0xbfe6ff, 1).fillRect(bx + 6 * u, by + 10 * u, 32 * u, 32 * u);
    this.bodyText.setColor(this.darkStyle ? '#f0e8ff' : '#141414');
  }

  // dark talking box inside the Glitch House
  setDark(on) {
    this.darkStyle = on;
    this.drawPanel();
  }

  // ───── talking ─────
  say(lines, onDone) {
    this.lines = lines.slice();
    this.onDone = onDone;
    ui.busy = true;
    this.openedAt = performance.now();
    this.box.forEach((o) => o.setVisible(true));
    this.hintText.setVisible(false);
    this.nextLine();
  }

  nextLine() {
    const line = this.lines.shift();
    if (!line) return this.closeBox();
    const [who, text] = line;
    const person = CHARACTERS[who];
    this.portrait.setVisible(!!person);
    this.faceFrame.setVisible(!!person);
    if (person) this.portrait.setTexture(who, 'face');
    this.nameText.setText(person ? person.name : '').setColor(this.darkStyle && who !== 'entity' ? '#f5c933' : NAME_COLOURS[who] || '#141414');
    const { bx, by } = this.boxRect;
    const left = person ? 44 : 10;
    this.nameText.setX(bx + left * this.u);
    this.bodyText.setX(bx + left * this.u).setY(by + (person ? 17 : 12) * this.u).setWordWrapWidth(this.boxRect.bw - (left + 8) * this.u);
    this.fullText = text;
    this.shown = 0;
    this.bodyText.setText('');
    this.arrow.setVisible(false);
    this.typing?.remove();
    this.typing = this.time.addEvent({
      delay: 22,
      repeat: text.length - 1,
      callback: () => {
        this.shown++;
        this.bodyText.setText(this.fullText.slice(0, this.shown));
        if (this.shown % 3 === 0 && this.fullText[this.shown - 1] !== ' ') sfx.talk();
        if (this.shown >= this.fullText.length) this.arrow.setVisible(true);
      },
    });
  }

  closeBox() {
    this.typing?.remove();
    this.box.forEach((o) => o.setVisible(false));
    ui.busy = false;
    ui.closedAt = performance.now();
    const done = this.onDone;
    this.onDone = null;
    if (done) done();
  }

  // ───── number pad ─────
  askCode(length, onDone) {
    ui.busy = true;
    this.code = { length, typed: '', onDone };
    this.openedAt = performance.now();
    this.codeParts.forEach((o) => o.setVisible(true));
    this.hintText.setVisible(false);
    this.showCode();
  }

  showCode() {
    const { length, typed } = this.code;
    this.codeDigits.setText(typed.padEnd(length, '_').split('').join(' '));
  }

  closeCode(result) {
    const { onDone } = this.code;
    this.code = null;
    this.codeParts.forEach((o) => o.setVisible(false));
    ui.busy = false;
    ui.closedAt = performance.now();
    onDone(result);
  }

  onKey(event) {
    unlockAudio();
    if (event.key === 'm' || event.key === 'M') {
      this.showBanner(toggleMute() ? 'Sound off' : 'Sound on');
      return;
    }
    if (performance.now() - this.openedAt < 200) return;

    if (this.code) {
      if (/^[0-9]$/.test(event.key) && this.code.typed.length < this.code.length) { this.code.typed += event.key; sfx.key(); }
      else if (event.key === 'Backspace') this.code.typed = this.code.typed.slice(0, -1);
      else if (event.key === 'Escape') return this.closeCode(null);
      else if (event.key === 'Enter' && this.code.typed.length === this.code.length) return this.closeCode(this.code.typed);
      this.showCode();
      return;
    }

    if (!ui.busy) return;
    if (![' ', 'Enter', 'e', 'E'].includes(event.key)) return;
    if (this.shown < this.fullText.length) {
      // still typing: show the whole line at once
      this.typing?.remove();
      this.shown = this.fullText.length;
      this.bodyText.setText(this.fullText);
      this.arrow.setVisible(true);
    } else {
      sfx.next();
      this.nextLine();
    }
  }

  // ───── small things ─────
  setHint(text) {
    if (ui.busy) return this.hintText.setVisible(false);
    if (this.hintText.text !== (text || '')) this.hintText.setText(text || '');
    this.hintText.setVisible(!!text);
  }

  setProgress(text) {
    this.progressText.setText(text || '').setVisible(!!text);
  }

  showBanner(text, colour = '#ffffff') {
    this.bannerText.setText(text).setColor(colour).setAlpha(1);
    this.tweens.killTweensOf(this.bannerText);
    this.tweens.add({ targets: this.bannerText, alpha: 0, delay: 1300, duration: 500 });
  }

  setItem(key, label) {
    const on = !!key;
    [this.itemBox, this.itemIcon, this.itemLabel].forEach((o) => o.setVisible(on));
    if (on) { this.itemIcon.setTexture(key); this.itemLabel.setText(label || ''); }
  }

  showHelp(on) {
    this.helpText.setVisible(on);
  }
}
