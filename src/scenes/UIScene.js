import Phaser from 'phaser';
import { FONT } from '../settings.js';
import { CHARACTERS } from '../characters.js';
import { sfx, toggleMute, isMuted, unlockAudio, stopMusic } from '../sound.js';
import { resetState } from '../state.js';

// Everything drawn on top of the game: the talking box, hints, the item you
// carry and the number pad. Other scenes use it through `ui`:
//
//   ui.say(STORY.farmer, () => { ...what happens after... });
//   ui.hint('talk to the Farmer');
//
// It also holds the menu (ESC or the button in the corner) and the touch
// controls for phones and tablets: a thumb stick on the left, a "!" button
// on the right.
export const ui = {
  scene: null,
  busy: false,       // true while a talking box, number pad or menu is open
  touch: false,      // true on phones and tablets: show the touch controls
  inGame: false,     // false on the title and end screens
  pad: { x: 0, y: 0 }, // where the thumb stick points (-1 to 1)
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

    // buttons on the number pad, so it also works without a keyboard
    this.codeButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'DEL', 'OK', 'BACK'].map((label) => {
      const button = this.add.text(0, 0, label, { fontFamily: FONT, color: '#141414', backgroundColor: '#d8d8e0', align: 'center' }).setOrigin(0.5).setVisible(false);
      button.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.codeKey(label === 'DEL' ? 'Backspace' : label === 'OK' ? 'Enter' : label === 'BACK' ? 'Escape' : label));
      return button;
    });
    this.codeParts.push(...this.codeButtons);

    // menu button in the corner
    this.menuButton = this.add.graphics().setVisible(false);
    this.menuPanel = this.add.graphics().setVisible(false).setDepth(50);
    this.menuTitle = this.add.text(0, 0, '', { fontFamily: FONT, color: '#141414', align: 'center' }).setOrigin(0.5).setVisible(false).setDepth(51);
    this.menuTexts = [];

    // touch controls
    this.stickBase = this.add.circle(0, 0, 10, 0xffffff, 0.18).setStrokeStyle(2, 0x141414, 0.6).setVisible(false);
    this.stickKnob = this.add.circle(0, 0, 10, 0xffffff, 0.55).setStrokeStyle(2, 0x141414, 0.8).setVisible(false);
    this.actionButton = this.add.circle(0, 0, 10, 0xf5c933, 0.75).setStrokeStyle(3, 0x141414, 0.9).setVisible(false);
    this.actionLabel = this.add.text(0, 0, '!', { fontFamily: FONT, color: '#141414' }).setOrigin(0.5).setVisible(false);
    this.turnText = this.add.text(0, 0, 'Turn your phone sideways\nto play', { fontFamily: FONT, color: '#ffffff', backgroundColor: '#141414', align: 'center', padding: { x: 16, y: 12 } }).setOrigin(0.5).setDepth(100).setVisible(false);
    this.stick = null;

    const device = this.sys.game.device;
    ui.touch = device.input.touch && !device.os.desktop;
    this.input.addPointer(2); // enough fingers for the stick and the button together
    this.input.on('pointerdown', (pointer, over) => this.onPointerDown(pointer, over));
    this.input.on('pointermove', (pointer) => this.onPointerMove(pointer));
    this.input.on('pointerup', (pointer) => this.onPointerUp(pointer));
    this.input.on('pointerupoutside', (pointer) => this.onPointerUp(pointer));

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
    this.progressText.setPosition(20 * u, 3 * u).setFontSize(11 * u);
    this.bannerText.setPosition(W / 2, H * 0.36).setFontSize(18 * u).setStroke('#141414', 3 * u);
    this.helpText.setPosition(20 * u, 4 * u).setFontSize(7 * u);

    const ix = W - 30 * u, iy = 5 * u;
    this.itemBox.clear().fillStyle(0x141414, 1).fillRect(ix - 2 * u, iy - 2 * u, 24 * u, 24 * u).fillStyle(0xfff6dc, 1).fillRect(ix, iy, 20 * u, 20 * u);
    this.itemIcon.setPosition(ix + 10 * u, iy + 10 * u).setScale(u);
    this.itemLabel.setPosition(ix + 10 * u, iy + 23 * u).setFontSize(7 * u);

    const cw = 150 * u, ch = 116 * u, cx = W / 2, cy = H / 2;
    this.codePanel.clear().fillStyle(0x141414, 1).fillRect(cx - cw / 2, cy - ch / 2, cw, ch).fillStyle(0x12301a, 1).fillRect(cx - cw / 2 + 2 * u, cy - ch / 2 + 2 * u, cw - 4 * u, ch - 4 * u);
    this.codeTitle.setPosition(cx, cy - 46 * u).setFontSize(11 * u);
    this.codeDigits.setPosition(cx, cy - 27 * u).setFontSize(18 * u);
    this.codeButtons.forEach((button, i) => {
      const wide = i >= 10;
      const col = wide ? i - 10 : i % 5, row = wide ? 2 : Math.floor(i / 5);
      button.setFontSize(11 * u).setPadding(wide ? 5 * u : 6 * u, 2 * u, wide ? 5 * u : 6 * u, 2 * u);
      button.setPosition(wide ? cx + (col - 1) * 42 * u : cx + (col - 2) * 24 * u, cy - 5 * u + row * 19 * u);
    });
    this.codeHelp.setPosition(cx, cy + 50 * u).setFontSize(7 * u).setText(ui.touch ? '' : 'Number keys: type    ENTER: OK    ESC: go back');

    // menu button: three bars in a dark square
    this.menuRect = new Phaser.Geom.Rectangle(2 * u, 2 * u, 15 * u, 14 * u);
    this.menuButton.clear().fillStyle(0x141414, 0.8).fillRect(2 * u, 2 * u, 15 * u, 14 * u).fillStyle(0xffffff, 1);
    for (let i = 0; i < 3; i++) this.menuButton.fillRect(5 * u, (5 + i * 3.5) * u, 9 * u, 1.5 * u);
    if (this.menu) this.drawMenu();

    // touch controls
    this.stickRadius = 17 * u;
    this.stickHome = { x: 34 * u, y: H - 34 * u };
    this.stickBase.setRadius(this.stickRadius).setPosition(this.stickHome.x, this.stickHome.y);
    this.stickKnob.setRadius(8 * u).setPosition(this.stickHome.x, this.stickHome.y);
    this.actionButton.setRadius(14 * u).setPosition(W - 30 * u, H - 34 * u);
    this.actionLabel.setPosition(W - 30 * u, H - 34 * u).setFontSize(20 * u);
    this.turnText.setPosition(W / 2, H / 2).setFontSize(12 * u);
    this.helpText.setText(ui.touch ? 'Left thumb: walk    ! button: talk, use' : 'Arrows / WASD: walk    SPACE: talk, use    ESC: menu');
    this.refreshControls();
  }

  // show or hide the menu button and the touch controls
  refreshControls() {
    const game = ui.inGame;
    const controls = game && ui.touch && !ui.busy;
    this.menuButton.setVisible(game);
    [this.stickBase, this.stickKnob, this.actionButton, this.actionLabel].forEach((o) => o.setVisible(controls));
    this.turnText.setVisible(ui.touch && this.scale.height > this.scale.width);
    if (!controls) this.dropStick();
  }

  // called by the game scenes (true) and the title and end screens (false)
  setGame(on) {
    ui.inGame = on;
    this.refreshControls();
  }

  // the place the player is walking around in right now
  world() {
    return this.scene.manager.getScenes(true).find((scene) => scene.useNearest);
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
    this.refreshControls();
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
    ui.busy = !!this.menu;
    ui.closedAt = performance.now();
    this.refreshControls();
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
    this.refreshControls();
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
    this.refreshControls();
    onDone(result);
  }

  // one key of the number pad (from the keyboard or an on-screen button)
  codeKey(key) {
    if (!this.code || performance.now() - this.openedAt < 200) return;
    if (/^[0-9]$/.test(key) && this.code.typed.length < this.code.length) { this.code.typed += key; sfx.key(); }
    else if (key === 'Backspace') this.code.typed = this.code.typed.slice(0, -1);
    else if (key === 'Escape') return this.closeCode(null);
    else if (key === 'Enter' && this.code.typed.length === this.code.length) return this.closeCode(this.code.typed);
    this.showCode();
  }

  // ───── menu ─────
  // options = [['what it says', () => what it does], ...]
  openMenu(title, options) {
    this.closeMenu();
    ui.busy = true;
    this.menu = { title, options, index: 0 };
    this.openedAt = performance.now();
    this.menuTexts = options.map(([label, action], i) => {
      const text = this.add.text(0, 0, label, { fontFamily: FONT, color: '#141414', align: 'center' }).setOrigin(0.5).setDepth(51);
      text.setInteractive({ useHandCursor: true });
      text.on('pointerover', () => { this.menu.index = i; this.drawMenu(); });
      text.on('pointerdown', () => { if (performance.now() - this.openedAt > 200) this.pickMenu(i); });
      return text;
    });
    this.menuPanel.setVisible(true);
    this.menuTitle.setVisible(true).setText(title);
    this.hintText.setVisible(false);
    this.refreshControls();
    this.drawMenu();
  }

  drawMenu() {
    const W = this.scale.width, H = this.scale.height, u = this.u;
    const { options, index } = this.menu;
    const w = Math.min(W - 8 * u, 170 * u), h = (30 + options.length * 17) * u;
    const x = (W - w) / 2, y = (H - h) / 2;
    this.menuPanel.clear().fillStyle(0x000000, 0.55).fillRect(0, 0, W, H);
    this.menuPanel.fillStyle(0x141414, 1).fillRect(x, y, w, h).fillStyle(0xf5c933, 1).fillRect(x + 2 * u, y + 2 * u, w - 4 * u, h - 4 * u);
    this.menuPanel.fillStyle(0xfff6dc, 1).fillRect(x + 3 * u, y + 3 * u, w - 6 * u, h - 6 * u);
    this.menuTitle.setPosition(W / 2, y + 14 * u).setFontSize(12 * u).setWordWrapWidth(w - 12 * u);
    this.menuTexts.forEach((text, i) => {
      const chosen = i === index;
      text.setPosition(W / 2, y + (32 + i * 17) * u).setFontSize(11 * u).setPadding(6 * u, 1 * u, 6 * u, 1 * u);
      text.setBackgroundColor(chosen ? '#141414' : '#e8dcb8').setColor(chosen ? '#f5c933' : '#141414');
    });
  }

  pickMenu(i) {
    const action = this.menu.options[i][1];
    sfx.next();
    this.closeMenu();
    action();
  }

  closeMenu() {
    if (!this.menu) return;
    this.menu = null;
    this.menuTexts.forEach((text) => text.destroy());
    this.menuTexts = [];
    this.menuPanel.setVisible(false);
    this.menuTitle.setVisible(false);
    ui.busy = this.box[0].visible || !!this.code;
    ui.closedAt = performance.now();
    this.refreshControls();
  }

  // the menu you get with ESC or the button in the corner
  openPauseMenu() {
    const options = [
      ['Carry on', () => {}],
      [`Sound: ${isMuted() ? 'off' : 'on'}`, () => { toggleMute(); this.openPauseMenu(); }],
    ];
    if (this.scale.fullscreen.available) {
      options.push([this.scale.isFullscreen ? 'Leave full screen' : 'Full screen', () => this.scale.toggleFullscreen()]);
    }
    options.push(['New game', () => this.openMenu('Start the whole game again?', [
      ['No, carry on', () => {}],
      ['Yes, start again', () => this.newGame()],
    ])]);
    this.openMenu('Glitch Unleashed', options);
  }

  // forget everything and go back to the title screen
  newGame() {
    resetState();
    stopMusic();
    this.typing?.remove();
    this.onDone = null;
    this.box.forEach((o) => o.setVisible(false));
    ui.busy = false;
    for (const scene of this.scene.manager.getScenes(true)) if (scene !== this) scene.scene.stop();
    this.scene.run('Title');
  }

  // ───── touch and mouse ─────
  onPointerDown(pointer, over) {
    unlockAudio();
    if (pointer.wasTouch && !ui.touch) { ui.touch = true; this.layout(); }
    if (over.length || this.menu || this.code) return; // a button took this tap
    if (performance.now() - this.openedAt < 200) return;
    if (ui.busy) return this.advance(); // tap anywhere to read on
    if (!ui.inGame) return;
    if (this.menuRect.contains(pointer.x, pointer.y)) return this.openPauseMenu();
    if (!ui.touch) return;

    const button = this.actionButton;
    if (Phaser.Math.Distance.Between(pointer.x, pointer.y, button.x, button.y) < button.radius * 1.4) {
      button.setScale(0.85);
      this.time.delayedCall(120, () => button.setScale(1));
      this.world()?.useNearest();
    } else if (pointer.x < this.scale.width * 0.5 && !this.stick) {
      // the stick appears where the thumb lands
      this.stick = { id: pointer.id, x: pointer.x, y: pointer.y };
      this.stickBase.setPosition(pointer.x, pointer.y);
      this.stickKnob.setPosition(pointer.x, pointer.y);
    }
  }

  onPointerMove(pointer) {
    if (!this.stick || pointer.id !== this.stick.id) return;
    const offset = new Phaser.Math.Vector2(pointer.x - this.stick.x, pointer.y - this.stick.y);
    const pull = Math.min(offset.length() / this.stickRadius, 1);
    offset.setLength(pull * this.stickRadius);
    this.stickKnob.setPosition(this.stick.x + offset.x, this.stick.y + offset.y);
    if (pull < 0.25) ui.pad.x = ui.pad.y = 0; // a little wobble does nothing
    else { offset.normalize(); ui.pad.x = offset.x; ui.pad.y = offset.y; }
  }

  onPointerUp(pointer) {
    if (this.stick && pointer.id === this.stick.id) this.dropStick();
  }

  dropStick() {
    this.stick = null;
    ui.pad.x = ui.pad.y = 0;
    this.stickBase.setPosition(this.stickHome.x, this.stickHome.y);
    this.stickKnob.setPosition(this.stickHome.x, this.stickHome.y);
  }

  onKey(event) {
    unlockAudio();
    if (event.key === 'm' || event.key === 'M') {
      this.showBanner(toggleMute() ? 'Sound off' : 'Sound on');
      return;
    }
    if (performance.now() - this.openedAt < 200) return;

    if (this.menu) {
      const count = this.menu.options.length;
      if (['ArrowUp', 'w', 'W'].includes(event.key)) this.menu.index = (this.menu.index + count - 1) % count;
      else if (['ArrowDown', 's', 'S'].includes(event.key)) this.menu.index = (this.menu.index + 1) % count;
      else if ([' ', 'Enter', 'e', 'E'].includes(event.key)) return this.pickMenu(this.menu.index);
      else if (event.key === 'Escape') return this.closeMenu();
      return this.drawMenu();
    }
    if (this.code) return this.codeKey(event.key);
    if (event.key === 'Escape' && ui.inGame && !ui.busy) return this.openPauseMenu();

    if (!ui.busy) return;
    if (![' ', 'Enter', 'e', 'E'].includes(event.key)) return;
    this.advance();
  }

  // show the rest of the line, or go to the next one
  advance() {
    if (!this.box[0].visible) return;
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
    if (text) text = `${ui.touch ? 'Tap !' : 'SPACE'}: ${text}`;
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
