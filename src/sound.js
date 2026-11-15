// All sounds and music are made with code (little beeps), no sound files.
// Press M in the game to turn sound on and off.

import { VOLUME } from './settings.js';

let ctx = null;
let master = null;
let muted = false;
let musicTimer = null;
let musicNodes = [];
let currentSong = null;

// Browsers only allow sound after a key press or click, so call this then.
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : VOLUME;
  return muted;
}

// note number (60 = middle C) to frequency
const hz = (note) => 440 * Math.pow(2, (note - 69) / 12);

// one beep
function tone(freq, { at = 0, len = 0.12, type = 'square', vol = 0.15, slideTo = null, out = master } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + len);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + len + 0.05);
}

// a burst of crackle
function noise({ at = 0, len = 0.15, vol = 0.12 } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let hold = 0;
  for (let i = 0; i < data.length; i++) {
    if (i % 24 === 0) hold = Math.random() * 2 - 1; // chunky, like a broken game
    data[i] = hold;
  }
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  src.buffer = buffer;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(gain).connect(master);
  src.start(t);
}

export const sfx = {
  talk: () => tone(520 + Math.random() * 180, { len: 0.04, vol: 0.05 }),
  next: () => tone(660, { len: 0.06, vol: 0.08 }),
  pickup: () => [72, 76, 79, 84].forEach((n, i) => tone(hz(n), { at: i * 0.07, len: 0.12 })),
  success: () => [67, 72, 76, 79, 84].forEach((n, i) => tone(hz(n), { at: i * 0.09, len: 0.2, type: 'triangle', vol: 0.25 })),
  good: () => { tone(hz(76), { len: 0.08 }); tone(hz(83), { at: 0.07, len: 0.14 }); },
  fail: () => { tone(220, { len: 0.35, type: 'sawtooth', slideTo: 55, vol: 0.2 }); noise({ len: 0.3 }); },
  glitch: () => {
    for (let i = 0; i < 6; i++) tone(120 + Math.random() * 1400, { at: i * 0.045, len: 0.05, type: 'square', vol: 0.1 });
    noise({ len: 0.3, vol: 0.1 });
  },
  crackle: () => noise({ len: 0.08, vol: 0.04 }),
  push: () => tone(90, { len: 0.1, type: 'triangle', vol: 0.3, slideTo: 60 }),
  door: () => { tone(180, { len: 0.25, type: 'sawtooth', vol: 0.12, slideTo: 90 }); tone(hz(60), { at: 0.2, len: 0.2, type: 'triangle', vol: 0.2 }); },
  key: () => tone(880, { len: 0.05, vol: 0.08 }),
  cheer: () => [60, 64, 67, 72, 67, 72, 76].forEach((n, i) => tone(hz(n), { at: i * 0.11, len: 0.2, type: 'square', vol: 0.14 })),
  sting: () => { [45, 51, 57].forEach((n) => tone(hz(n), { len: 1.6, type: 'sawtooth', vol: 0.12 })); noise({ len: 0.5 }); },
  // the four notes of the music room
  note: (i) => tone(hz([60, 64, 67, 72][i]), { len: 0.4, type: 'triangle', vol: 0.3 }),
};

// ───────────────────────── music ─────────────────────────
// Songs are lists of note numbers, 8 notes per bar. 0 means "rest".
const SONGS = {
  // happy and bouncy, for Barttown
  town: {
    tempo: 138,
    lead: [
      72, 76, 79, 76, 72, 76, 79, 0, 81, 79, 76, 72, 74, 0, 67, 0,
      72, 76, 79, 76, 81, 79, 76, 79, 77, 76, 74, 71, 72, 0, 0, 0,
      77, 81, 84, 81, 77, 81, 84, 0, 76, 79, 84, 79, 76, 0, 72, 0,
      74, 77, 81, 77, 79, 83, 86, 83, 84, 79, 76, 79, 72, 0, 0, 0,
    ],
    bass: [
      48, 0, 55, 0, 48, 0, 55, 0, 48, 0, 55, 0, 43, 0, 55, 0,
      48, 0, 55, 0, 53, 0, 60, 0, 43, 0, 55, 0, 48, 0, 55, 0,
      53, 0, 60, 0, 53, 0, 60, 0, 48, 0, 55, 0, 48, 0, 55, 0,
      50, 0, 57, 0, 43, 0, 55, 0, 48, 0, 55, 0, 48, 0, 0, 0,
    ],
  },
};

function stopNodes() {
  for (const n of musicNodes) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { /* already stopped */ } }
  musicNodes = [];
}

export function stopMusic() {
  currentSong = null;
  clearInterval(musicTimer);
  musicTimer = null;
  stopNodes();
}

export function playMusic(name) {
  if (!ctx || currentSong === name) return;
  stopMusic();
  currentSong = name;
  if (name === 'house') return playCreepy();

  const song = SONGS[name];
  const stepLen = 60 / song.tempo / 2;
  const bus = ctx.createGain();
  bus.gain.value = 0.5;
  bus.connect(master);
  musicNodes.push(bus);
  let step = 0;
  let nextTime = ctx.currentTime + 0.1;
  const schedule = () => {
    while (nextTime < ctx.currentTime + 0.3) {
      const at = nextTime - ctx.currentTime;
      const lead = song.lead[step % song.lead.length];
      const bass = song.bass[step % song.bass.length];
      if (lead) tone(hz(lead), { at, len: stepLen * 0.9, type: 'square', vol: 0.09, out: bus });
      if (bass) tone(hz(bass), { at, len: stepLen * 1.6, type: 'triangle', vol: 0.22, out: bus });
      step++;
      nextTime += stepLen;
    }
  };
  schedule();
  musicTimer = setInterval(schedule, 100);
}

// low hum and lonely, wrong-sounding notes, for the Glitch House
function playCreepy() {
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 2);
  bus.connect(master);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 260;
  filter.connect(bus);
  for (const f of [55, 55.7, 82.4]) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    osc.connect(g).connect(filter);
    osc.start();
    musicNodes.push(osc);
  }
  musicNodes.push(bus);
  const spooky = [57, 60, 63, 64, 68, 69, 75];
  musicTimer = setInterval(() => {
    if (Math.random() < 0.45) {
      const n = spooky[Math.floor(Math.random() * spooky.length)];
      tone(hz(n), { len: 2.2, type: 'sine', vol: 0.12, out: bus });
      tone(hz(n) * 1.012, { at: 0.15, len: 2.2, type: 'sine', vol: 0.08, out: bus });
    } else if (Math.random() < 0.2) {
      tone(1800 + Math.random() * 900, { len: 0.05, vol: 0.02, out: bus });
    }
  }, 1700);
}
