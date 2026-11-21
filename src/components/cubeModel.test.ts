import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { applyMove, buildSnapshots, parseFormula } from '../engine/cubeMoves';
import { createSolvedCube, worldNormal } from '../engine/cubeState';
import { makeCubeModel } from './cubeModel';
import type { CubeState } from '../engine/cubeState';

function expectModelToMatch(model: ReturnType<typeof makeCubeModel>, state: CubeState) {
  model.group.updateMatrixWorld(true);
  for (const cubie of state) {
    const part = model.group.getObjectByName(cubie.id)!;
    expect(part.position.distanceTo(new Vector3(...cubie.position))).toBeLessThan(1e-10);
    for (const sticker of cubie.stickers) {
      const mesh = part.getObjectByName(sticker.color)!;
      const normal = new Vector3(0, 0, 1).transformDirection(mesh.matrixWorld);
      expect(normal.distanceTo(new Vector3(...worldNormal(cubie, sticker.normal)))).toBeLessThan(1e-10);
    }
  }
}

describe('3D model', () => {
  it('contains 26 individually posed cubies and all 54 stickers', () => {
    const solved = createSolvedCube();
    const model = makeCubeModel(solved);
    expect(model.group.children).toHaveLength(26);
    expect(model.group.children.flatMap((part) => part.children.slice(1))).toHaveLength(54);
    expectModelToMatch(model, solved);
  });

  it('animates only the selected layer and agrees with every logical boundary', () => {
    const moves = parseFormula("R U2 F' L2 D B' R' F2 U L B D2");
    const snapshots = buildSnapshots(moves);
    const model = makeCubeModel(snapshots[0]);
    for (const [i, move] of moves.entries()) {
      model.setPose(snapshots[i], move, 1);
      expectModelToMatch(model, applyMove(snapshots[i], move));
      model.setPose(snapshots[i + 1]);
      expectModelToMatch(model, snapshots[i + 1]);
    }
    model.setPose(snapshots[0], 'R', 0.5);
    expect(model.group.getObjectByName('1,1,1')?.position.z).toBeCloseTo(0);
    expect(model.group.getObjectByName('-1,1,1')?.position.toArray()).toEqual([-1, 1, 1]);
    model.setPose(snapshots[0]);
    expectModelToMatch(model, snapshots[0]);
  });
});
