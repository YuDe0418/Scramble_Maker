import { faceNames, getCubeNet } from './cubeState';
import type { CubeState, StickerColor } from './cubeState';

export function hasValidFacelets(state: CubeState) {
  const net = getCubeNet(state);
  const counts = new Map<StickerColor, number>();
  for (const face of faceNames) {
    const stickers = net[face];
    if (stickers.length !== 9 || [...stickers].some((color) => !color)) return false;
    for (const color of stickers) counts.set(color, (counts.get(color) ?? 0) + 1);
  }
  return counts.size === 6 && [...counts.values()].every((count) => count === 9);
}
