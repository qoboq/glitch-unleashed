// Everything the characters say, in one place, so it is easy to change.
// Each line is [who, 'what they say']. "who" is a character from
// src/characters.js, or 'sign' for signs and notes (no face).

export const STORY = {
  mayorHello: [
    ['mayor', 'Welcome to Barttown, Glitch Inspector! I am the Mayor. We are SO happy you came!'],
    ['mayor', 'Barttown is a jolly little town. But there is one house, at the very end of the road...'],
    ['mayor', 'Strange things happen there. Things flicker. Things jump. Things... GLITCH.'],
    ['mayor', 'Please go and investigate it for us. Just follow the road to the east. Good luck!'],
    ['player', 'A glitching house? Leave it to me, Mayor.'],
  ],
  mayorAgain: [
    ['mayor', 'The house is at the end of the road, to the east. Do be careful in there... heh heh.'],
  ],

  runnerHello: [
    ['runner', 'Hello, hello! You must be the new inspector! Lovely day for a run, isn\'t it?'],
    ['runner', 'I run around Barttown ten times every morning. Today I am going for eleven! I just need to—'],
  ],
  runnerGone: [
    ['player', 'Wait... where did he go?!'],
    ['player', 'He just glitched out and vanished. Hmm. This is weird.'],
  ],

  farmer: [
    ['farmer', 'Oh! A visitor! Hello there. I am the Curious Farmer. I am curious about EVERYTHING!'],
    ['farmer', 'You are going to THAT house? Hmm, hmm. Be careful, my friend.'],
    ['farmer', 'And listen: be aware of the colour PURPLE. If you see something purple, do NOT touch it!'],
    ['player', 'Stay away from purple. Got it. Thank you!'],
  ],
  farmerAgain: [
    ['farmer', 'Remember: purple is trouble!'],
  ],

  miner: [
    ['miner', 'Clang! Clang! Oh, hello! I am the Miner. I dig up rocks all day long.'],
    ['miner', 'Look what I found this morning. This rock keeps flickering and buzzing. It GLITCHES!'],
    ['miner', 'I do not want it anywhere near my mine. Here, you take it, Inspector.'],
  ],
  minerGotRock: [
    ['sign', 'You got the GLITCHING ROCK!'],
    ['player', 'A rock that glitches... I will keep it. It might be useful later.'],
  ],
  minerAgain: [
    ['miner', 'Clang! Clang! Take good care of that funny rock!'],
  ],

  maker: [
    ['maker', 'Good day, Inspector. I am the Village Maker. I built every house in Barttown.'],
    ['maker', 'The house you are looking for is at the very end of town. Just keep walking east.'],
    ['maker', 'It was a normal, cosy house when we built it. I painted the door yellow myself.'],
    ['maker', 'But one day the glitch took it over. Now everyone is afraid to go inside.'],
    ['maker', 'If you can fix it... the whole town will thank you.'],
  ],
  makerAgain: [
    ['maker', 'The Glitch House is at the end of the road, to the east. Good luck, Inspector.'],
  ],

  dangerSign: [
    ['sign', 'DANGER!  Glitch House ahead.  Do NOT touch the purple!'],
  ],
  townSign: [
    ['sign', 'WELCOME TO BARTTOWN!  The jolliest town around.'],
  ],
  firstZap: [
    ['player', 'Yikes! That purple stuff zapped me right back here. The Farmer was right!'],
  ],

  doorNotReady: [
    ['player', 'This must be the Glitch House... but I do not feel ready yet.'],
    ['player', 'I should talk to everyone in town first. Maybe someone has something useful for me.'],
  ],
  doorEnter: [
    ['player', 'This is it. The Glitch House.'],
    ['player', 'It is all flickery and creepy... but a Glitch Inspector is never scared. Well. Almost never.'],
  ],

  // ───── inside the house ─────
  room1: [
    ['player', 'It is so dark in here... and that purple floor looks dangerous.'],
    ['player', 'There is a sign on the wall next to the door. I should read it.'],
  ],
  room1Sign: [
    ['sign', 'I make things flicker, jump and twitch.\nStep on my name:  I am the  _ _ _ _ _ _'],
    ['sign', '(Walk over the letters in the right order. A wrong letter sends you back to the start!)'],
  ],
  room2: [
    ['player', 'A locked door with a number pad. The code must be hidden somewhere in this room.'],
    ['player', 'And those purple blobs are MOVING. I must not let them touch me.'],
  ],
  room3: [
    ['player', 'A music box... and four coloured tiles on the floor.'],
    ['player', 'I will listen to the music box first.'],
  ],
  room3Box: [
    ['sign', 'Listen to the tune. Then walk over the coloured tiles in the same order.'],
  ],
  room4: [
    ['player', 'The last room! Shapes and holes...'],
    ['player', 'I can push each shape into the hole that fits. But one hole looks very strange.'],
  ],
  room4RockHole: [
    ['player', 'This hole is all jagged... just like the Miner\'s glitching rock!'],
    ['sign', 'You put the GLITCHING ROCK into the hole. It fits perfectly!'],
  ],
  room4NoRockYet: [
    ['player', 'A jagged hole. None of these shapes will fit in there...'],
  ],
  room4Lever: [
    ['sign', 'You pull the lever. Everything goes back to where it started.'],
  ],
  houseFixed: [
    ['player', 'The whole house is shaking! The glitch is breaking apart!'],
  ],

  // ───── the ending ─────
  cheer: [
    ['player', 'I am outside again! And look... the house is normal!'],
    ['maker', 'You did it! The yellow door is shining again, just like the day I painted it!'],
    ['farmer', 'Hooray for the Glitch Inspector! No more purple!'],
    ['miner', 'Three cheers! Hip hip... HOORAY!'],
    ['runner', 'I am back! I glitched all the way to the other side of town. What a run!'],
    ['farmer', 'Hmm, curious... Where is the Mayor? He should be cheering with us.'],
    ['player', 'That IS strange. I had better look for him. Maybe he is in the town centre.'],
  ],
  cheerAgain: {
    maker: [['maker', 'Thank you, Inspector. Barttown will never forget this.']],
    farmer: [['farmer', 'Curious, very curious. Where could the Mayor be?']],
    miner: [['miner', 'Hooray! Hooray! Hooray!']],
    runner: [['runner', 'Try the town centre, by the fountain. I will race you there! ...Just kidding, I am tired.']],
  },
  entity: [
    ['player', 'Mayor? Is that you? You look... green. And PURPLE!'],
    ['entity', 'Zzzt... YOU! You meddling little inspector!'],
    ['entity', 'I made that house glitch! It took me AGES! Soon ALL of Barttown would have been mine!'],
    ['entity', 'And you RUINED my plans, with your silly puzzles and your silly rock!'],
    ['player', 'It was YOU all along?!'],
    ['entity', 'This is not over, Glitch Inspector. I will be back... and next time EVERYTHING will glitch! Zzzzzt!'],
  ],
  entityGone: [
    ['player', 'He is gone. The Mayor was the villain the whole time...'],
    ['player', 'I have a feeling this is only the beginning.'],
  ],
};
