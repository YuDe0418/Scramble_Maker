import { createSolvedCube, faces } from './cubeState';
import type { Axis, CubeState, Face, Vector } from './cubeState';

export type Move = `${Face}${'' | "'" | '2'}`;

export function parseFormula(formula: string): Move[] {
  const moves = formula.trim().split(/\s+/).filter(Boolean);
  if (moves.some((move) => !/^[RLUDFB](?:'|2)?$/.test(move))) {
    throw new Error('Formula contains an invalid cube move.');
  }
  return moves as Move[];
}

export function getTurn(move: Move) {
  const { axis, side } = faces[move[0] as Face];
  // Clockwise as seen from outside: negative around the outward normal.
  const quarters = -side * (move.endsWith('2') ? 2 : move.endsWith("'") ? -1 : 1);
  return { axis, side, quarters, angle: quarters * Math.PI / 2 };
}

function negate(value: number) {
  return value === 0 ? 0 : -value;
}

function rotateQuarter([x, y, z]: Vector, axis: Axis): Vector {
  if (axis === 0) return [x, negate(z), y];
  if (axis === 1) return [z, y, negate(x)];
  return [negate(y), x, z];
}

export function applyMove(state: CubeState, move: Move): CubeState {
  const { axis, side, quarters } = getTurn(move);
  const turns = (quarters + 4) % 4;
  function rotate(vector: Vector) {
    for (let i = 0; i < turns; i++) vector = rotateQuarter(vector, axis);
    return vector;
  }
  return state.map((cubie) => {
    if (cubie.position[axis] !== side) return cubie;
    const [x, y, z] = cubie.orientation;
    return { ...cubie, position: rotate(cubie.position), orientation: [rotate(x), rotate(y), rotate(z)] };
  });
}

export function buildSnapshots(moves: readonly Move[]): CubeState[] {
  const snapshots = [createSolvedCube()];
  for (const move of moves) snapshots.push(applyMove(snapshots.at(-1)!, move));
  return snapshots;
}

export function invertFormula(moves: readonly Move[]): Move[] {
  return [...moves].reverse().map((move): Move => {
    if (move.endsWith('2')) return move;
    const face = move[0] as Face;
    return move.endsWith("'") ? face : `${face}'`;
  });
}
