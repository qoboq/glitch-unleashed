# Glitch Unleashed

A 2D top-down pixel-art game made by a parent and kid together. You are the
Glitch Inspector. You walk around, talk to people and solve puzzles.

Run it with `npm install` (first time only) and then `npm run dev`.

Controls: arrow keys or WASD to walk, SPACE (or E or Enter) to talk and use
things, M to turn the sound on and off.

## Story, Part 1: The Glitch House

1. We arrive in **Barttown**. The **Mayor** greets us and asks us to
   investigate the house at the end of town, because it glitches.
2. A **Runner** comes by, says hello and suddenly glitches away. Weird!
3. The **Curious Farmer** stands by his house. He tells us to be careful and
   to be aware of the colour purple.
4. The **Miner** is mining rocks. He found a rock that glitches and gives it
   to us. We need it later.
5. The **Village Maker** tells us the house was a normal house when they built
   it, but now the glitch has taken it over and everyone is afraid of it.
6. At the end of town is the **Glitch House**. Purple puddles on the road zap
   you back if you touch them.
7. Inside are four puzzle rooms. It is dark and creepy. If you touch purple
   or get a puzzle wrong, the room starts over.
   - **Letters**: walk over the letters to spell GLITCH.
   - **Numbers**: find three hidden numbers (little sums) and type the code.
   - **Notes**: the music box plays a tune, walk over the coloured tiles in
     the same order. Three tunes, each one longer.
   - **Geometry**: push the square, triangle and circle into their holes,
     and put the Miner's glitching rock into the jagged hole.
8. We are teleported back outside. The house is normal again and everyone
   cheers. But the Mayor is missing...
9. We find him by the fountain in the town centre. He is green and purple and
   glitching: he is the **Entity Mayor**, the villain who made the house
   glitch. He is angry, says we ruined his plans and glitches away.

End of Part 1.

## Characters

All drawn in code in `src/characters.js`, copied from the drawings in
`art/concept/` (blocky, flat colours, thick black outline).

- **Player / Glitch Inspector**: yellow square head, black moustache, yellow
  shirt with a red X, green trousers.
- **The Mayor**: brown hair, black suit, white collar.
- **Entity Mayor**: the Mayor, but green and purple.
- **Runner**: red shirt, black shorts.
- **Miner**: the small one, blue shirt with a brown stripe, yellow boots.
- **Curious Farmer**: tall, yellow hat, black beard, brown overalls, blue sleeves.
- **Village Maker**: tall, bald, black beard, brown coat over a blue shirt.
- **Hunter**: in the drawing, but not in the story yet.

## Where things are

| What | Where |
| --- | --- |
| Everything people say | `src/story.js` |
| How characters look | `src/characters.js` |
| Speeds, sizes, volume | `src/settings.js` |
| Sounds and music (made with code) | `src/sound.js` |
| The town and its story bits | `src/scenes/TownScene.js` |
| The puzzle rooms | `src/scenes/rooms/` (the puzzle settings are at the top of each file) |
| The town map (Tiled format) | `public/assets/maps/town.json` |
| Tiles (16x16) | `public/assets/tiles/` |
| Houses, trees and other things | `public/assets/props/` (one PNG each) |
| The drawings | `art/concept/` |

## Changing the art

- Every house, tree and prop is its own PNG in `public/assets/props/`. To use
  your own pixel art, save it over the file with the same name (for example
  `house-red.png`). Keep it about the same size so it stands in the right spot.
  How much of each picture is solid is set in `src/props.js`.
- The first versions of the tiles and props were drawn by the script
  `tools/make-art.mjs` (`npm run art`). Running it again overwrites the PNGs
  with the code-drawn versions, so do not run it after you have painted your
  own.
- The town map was first made by `tools/make-town.mjs` (`npm run map`). You
  can open `town.json` in the Tiled map editor and move things around. The
  "things" layer has points: type `prop` (name = picture), `npc`, `spawn`,
  `trigger` and `door`. Running the script again overwrites the map.
- Characters are 32x40 pixel frames, 4 rows (down, left, right, up) x 4 walk
  frames.

## Testing tricks

- Progress is saved in the browser. On the title screen, N starts a new game.
- In the browser console (F12), `game.story` shows the story progress. For
  example `game.story.hasRock = true` gives you the rock.

## Feature order

1. ✅ Player movement + walk animation
2. ✅ Barttown: long scrolling town from a Tiled map, with collisions
3. ✅ Dialogue box and all the town characters
4. ✅ The Glitch House: four puzzle rooms
5. ✅ Ending of Part 1, title screen, sounds and music
6. Next ideas: your own pixel-art houses, the Hunter, Part 2
