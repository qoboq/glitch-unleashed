// Every picture in public/assets/props/, and how much of it you bump into.
// [width, height] is the solid part at the bottom of the picture, in pixels.
// null means you can walk right through it.

export const PROPS = {
  'tree': [10, 8], 'tree-apple': [10, 8], 'tree-autumn': [10, 8], 'tree-dead': [8, 6],
  'bush': [14, 8], 'bush-berry': [14, 8],
  'house-red': [68, 34], 'house-blue': [68, 34], 'house-green': [68, 34],
  'house-farmer': [96, 26], 'house-frame': [64, 14],
  'glitch-house': [128, 60], 'glitch-house-fixed': [128, 60],
  'fountain': [50, 16], 'stall-fruit': [48, 14], 'stall-bread': [48, 14],
  'well': [24, 12], 'bench': [26, 8], 'lamp': [6, 4],
  'sign-town': [50, 6], 'sign-arrow': [6, 4], 'sign-danger': [6, 4],
  'rock-big': [26, 12], 'rock-small': [12, 6], 'rock-ore': [26, 12],
  'mine': [72, 34], 'minecart': [26, 8], 'pickaxe': null,
  'scarecrow': [6, 4], 'haystack': [22, 10], 'pumpkin': [8, 4], 'cart': [30, 10],
  'barrel': [12, 8], 'crate': [14, 8], 'logs': [28, 8], 'workbench': [30, 8],
  'pond': [60, 28], 'flowerbed': [28, 6],
  'glitch-puddle': null, 'glitch-rock': null,
  // inside the Glitch House
  'door-closed': null, 'door-open': null, 'plate': null,
  'hole-square': null, 'hole-triangle': null, 'hole-circle': null, 'hole-rock': null,
  'block-square': null, 'block-triangle': null, 'block-circle': null,
  'bookshelf': [32, 12], 'mirror': [22, 8], 'chest': [26, 12], 'painting': null, 'clock': [14, 8],
  'musicbox': [24, 10], 'keypad': null, 'plaque': null, 'candle': [6, 4], 'cobweb': null, 'lever': [12, 6],
};

// Things that lie flat on the ground (drawn under the characters).
export const FLAT = ['pond', 'glitch-puddle', 'plate', 'hole-square', 'hole-triangle', 'hole-circle', 'hole-rock', 'cobweb'];
