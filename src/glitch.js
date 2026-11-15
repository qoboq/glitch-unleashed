// The "glitch" look: colours split apart, things jump about and flicker.

import { sfx } from './sound.js';

// Make a sprite glitch away (or glitch in, with { appear: true }).
export function glitchOut(scene, sprite, { appear = false, time = 700, sound = true } = {}, onDone) {
  if (sound) sfx.glitch();
  const homeX = sprite.x;
  const ghosts = [0xff3df2, 0x3df2ff].map((tint) => {
    const g = scene.add.sprite(sprite.x, sprite.y, sprite.texture.key, sprite.frame.name);
    g.setOrigin(sprite.originX, sprite.originY).setScale(sprite.scaleX, sprite.scaleY);
    g.setTint(tint).setAlpha(0.6).setDepth(sprite.depth + 1);
    return g;
  });
  sprite.setVisible(true);
  const flicker = scene.time.addEvent({
    delay: 45,
    loop: true,
    callback: () => {
      sprite.x = homeX + Phaser.Math.Between(-3, 3);
      sprite.setVisible(Math.random() < 0.7);
      const h = sprite.frame.height;
      const top = Phaser.Math.Between(0, h - 8);
      if (Math.random() < 0.5) sprite.setCrop(0, top, sprite.frame.width, Phaser.Math.Between(6, h - top));
      else sprite.setCrop();
      ghosts.forEach((g, i) => {
        g.x = homeX + Phaser.Math.Between(-7, 7) * (i ? 1 : -1);
        g.y = sprite.y + Phaser.Math.Between(-2, 2);
        g.setVisible(Math.random() < 0.8);
      });
    },
  });
  scene.time.delayedCall(time, () => {
    flicker.remove();
    ghosts.forEach((g) => g.destroy());
    sprite.setCrop();
    sprite.x = homeX;
    sprite.setVisible(appear);
    if (onDone) onDone();
  });
}

// Keep something twitching forever (the Glitch House, the Entity Mayor).
// Returns the timer; call .remove() on it to stop.
export function twitch(scene, sprite, { strength = 2, tints = [0xd58cff, 0x42f56c], chance = 0.25 } = {}) {
  const homeX = sprite.x;
  return scene.time.addEvent({
    delay: 110,
    loop: true,
    callback: () => {
      if (!sprite.active) return;
      if (Math.random() < chance) {
        sprite.x = homeX + Phaser.Math.Between(-strength, strength);
        sprite.setTint(Phaser.Utils.Array.GetRandom(tints));
      } else {
        sprite.x = homeX;
        sprite.clearTint();
      }
    },
  });
}

// The whole screen hiccups.
export function screenGlitch(scene, strong = false) {
  const cam = scene.cameras.main;
  cam.shake(strong ? 350 : 150, strong ? 0.012 : 0.005);
  cam.flash(strong ? 300 : 120, 162, 60, 224);
}
