import { faceNames, faces } from './cubeState';
import type { Face } from './cubeState';
import type { Move } from './cubeMoves';

export const scrambleLengths = [18, 20, 22, 25] as const;
export type ScrambleLength = (typeof scrambleLengths)[number];
export type ScrambleGenerator = (length: ScrambleLength) => Move[];

function randomInt(max: number) {
  const sample = new Uint32Array(1);
  const range = 0x1_0000_0000;
  const limit = range - (range % max);
  do globalThis.crypto.getRandomValues(sample); while (sample[0] >= limit);
  return sample[0] % max;
}

const suffixes = ['', "'", '2'] as const;

export const generateRandomMoves: ScrambleGenerator = (length) => {
  const moves: Move[] = [];
  let lastFace: Face | undefined;
  for (let i = 0; i < length; i++) {
    const previous = lastFace;
    const candidates = previous ? faceNames.filter((face) => faces[face].axis !== faces[previous].axis) : faceNames;
    const face = candidates[randomInt(candidates.length)];
    moves.push(`${face}${suffixes[randomInt(suffixes.length)]}`);
    lastFace = face;
  }
  return moves;
};
