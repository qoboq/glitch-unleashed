// What has happened in the story so far. It is saved in the browser, so you
// can close the game and carry on later.

const SAVE_KEY = 'glitch-unleashed-save-1';

const fresh = () => ({
  started: false,
  met: {},            // who we have talked to: mayor, runner, farmer, miner, maker
  hasRock: false,     // the Miner's glitching rock
  zappedOnce: false,  // touched the purple at least once
  roomsDone: 0,       // how many puzzle rooms are finished (0 to 4)
  part: 'town',       // 'town' -> 'house' -> 'after' -> 'end'
  cheered: false,     // the town has cheered for us
  code: null,         // the secret numbers of the number room
});

export const state = fresh();

export function resetState() {
  Object.assign(state, fresh());
  saveState();
}

export function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* no saving, no problem */ }
}

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved && saved.started) { Object.assign(state, fresh(), saved); return true; }
  } catch (e) { /* broken save: start fresh */ }
  return false;
}
