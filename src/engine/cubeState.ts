export type Vector = readonly [number, number, number];
export type Axis = 0 | 1 | 2;

// +X is right, +Y is up, +Z is front. White is opposite yellow,
// red is opposite orange, and green is opposite blue.
export const faces = {
  R: { axis: 0, side: 1, color: 'red', normal: [1, 0, 0], right: [0, 0, -1], up: [0, 1, 0] },
  L: { axis: 0, side: -1, color: 'orange', normal: [-1, 0, 0], right: [0, 0, 1], up: [0, 1, 0] },
  U: { axis: 1, side: 1, color: 'white', normal: [0, 1, 0], right: [1, 0, 0], up: [0, 0, -1] },
  D: { axis: 1, side: -1, color: 'yellow', normal: [0, -1, 0], right: [1, 0, 0], up: [0, 0, 1] },
  F: { axis: 2, side: 1, color: 'green', normal: [0, 0, 1], right: [1, 0, 0], up: [0, 1, 0] },
  B: { axis: 2, side: -1, color: 'blue', normal: [0, 0, -1], right: [-1, 0, 0], up: [0, 1, 0] },
} as const;

export type Face = keyof typeof faces;
export type StickerColor = (typeof faces)[Face]['color'];
export type Orientation = readonly [Vector, Vector, Vector];
export type Sticker = { readonly color: StickerColor; readonly normal: Vector };
export type Cubie = {
  readonly id: string;
  readonly position: Vector;
  readonly orientation: Orientation;
  readonly stickers: readonly Sticker[];
};
export type CubeState = readonly Cubie[];
export const faceNames = Object.keys(faces) as Face[];

export function createSolvedCube(): CubeState {
  const cubies: Cubie[] = [];
  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        if (x === 0 && y === 0 && z === 0) continue;
        const position: Vector = [x, y, z];
        const stickers = faceNames.map((face) => faces[face])
          .filter(({ axis, side }) => position[axis] === side)
          .map(({ color, normal }) => ({ color, normal }));
        cubies.push({
          id: position.join(','), position, stickers,
          orientation: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        });
      }
    }
  }
  return cubies;
}

export function dot(a: Vector, b: Vector) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function worldNormal({ orientation }: Cubie, [x, y, z]: Vector): Vector {
  return [
    orientation[0][0] * x + orientation[1][0] * y + orientation[2][0] * z,
    orientation[0][1] * x + orientation[1][1] * y + orientation[2][1] * z,
    orientation[0][2] * x + orientation[1][2] * y + orientation[2][2] * z,
  ];
}

export type CubeNet = Record<Face, StickerColor[]>;

export function getCubeNet(state: CubeState): CubeNet {
  const net: CubeNet = { R: [], L: [], U: [], D: [], F: [], B: [] };
  for (const cubie of state) {
    for (const sticker of cubie.stickers) {
      const normal = worldNormal(cubie, sticker.normal);
      const face = faceNames.find((name) => dot(normal, faces[name].normal) === 1)!;
      const { right, up } = faces[face];
      const column = 1 + dot(cubie.position, right);
      const row = 1 - dot(cubie.position, up);
      net[face][row * 3 + column] = sticker.color;
    }
  }
  return net;
}

export function getFaceletKey(state: CubeState) {
  const net = getCubeNet(state);
  return faceNames.map((face) => net[face].map((color) => color[0]).join('')).join('/');
}
