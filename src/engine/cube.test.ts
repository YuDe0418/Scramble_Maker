import { describe, expect, it } from 'vitest';
import { applyMove, buildSnapshots, invertFormula, parseFormula } from './cubeMoves';
import { createSolvedCube, faces, getCubeNet } from './cubeState';
import { hasValidFacelets } from './cubeValidator';
import { generateRandomMoves, scrambleLengths } from './scrambleGenerator';
import type { Face } from './cubeState';

const solved = createSolvedCube();

describe('cube moves', () => {
  it.each(['R R R R', "R R'", 'R2 R2'])('%s restores every cubie', (formula) => {
    expect(buildSnapshots(parseFormula(formula)).at(-1)).toEqual(solved);
  });

  it('turns exactly nine pieces in the expected direction, as seen from outside', () => {
    const right = applyMove(solved, 'R');
    expect(right.filter((cubie, index) => cubie !== solved[index])).toHaveLength(9);
    expect(right.find((cubie) => cubie.id === '1,1,1')?.position).toEqual([1, 1, -1]);
    expect(applyMove(solved, 'U').find((cubie) => cubie.id === '1,1,1')?.position).toEqual([-1, 1, 1]);
    expect(applyMove(solved, 'F').find((cubie) => cubie.id === '1,1,1')?.position).toEqual([1, -1, 1]);
    expect(applyMove(solved, "F'").find((cubie) => cubie.id === '1,1,1')?.position).toEqual([-1, 1, 1]);
    expect(getCubeNet(right).F).toEqual(['green', 'green', 'yellow', 'green', 'green', 'yellow', 'green', 'green', 'yellow']);
  });

  it('maps all 54 facelets and reconstructs the solved cube by reversing legal sequences', () => {
    const examples = [parseFormula("F2 L' D R U' B2 R' D2 F B'"), ...scrambleLengths.map(generateRandomMoves)];
    for (const moves of examples) {
      expect(buildSnapshots(moves).every(hasValidFacelets)).toBe(true);
      expect(buildSnapshots([...moves, ...invertFormula(moves)]).at(-1)).toEqual(solved);
    }
  });

  it('generates the requested lengths with legal moves and alternating axes', () => {
    for (const length of scrambleLengths) {
      for (let run = 0; run < 12; run++) {
        const moves = generateRandomMoves(length);
        expect(moves).toHaveLength(length);
        expect(parseFormula(moves.join(' '))).toEqual(moves);
        for (let i = 1; i < moves.length; i++) {
          expect(faces[moves[i][0] as Face].axis).not.toBe(faces[moves[i - 1][0] as Face].axis);
        }
      }
    }
  });
});
