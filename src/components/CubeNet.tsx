import { useMemo } from 'react';
import { faces, getCubeNet } from '../engine/cubeState';
import type { Face } from '../engine/cubeState';
import { useCubeStore } from '../stores/cubeStore';
import { stickerColors } from './stickerColors';

const netFaces: Face[] = ['U', 'L', 'F', 'R', 'B', 'D'];

export default function CubeNet() {
  const snapshot = useCubeStore((state) => state.snapshots[state.cursor]);
  const midTurn = useCubeStore((state) => state.fraction > 0);
  const net = useMemo(() => getCubeNet(snapshot), [snapshot]);
  return <div className="net-wrap">
    <div className="cube-net" aria-label="Six-face cube net">
      {netFaces.map((face) => <figure className={`net-face net-${face}`} key={face} aria-label={`${face} face`}>
        <div className="net-stickers">
          {net[face].map((color, index) => <span className="net-sticker" key={index} title={`${face}${index + 1} · ${color}`}
            aria-label={`${face}${index + 1} ${color}`} style={{ backgroundColor: stickerColors[color] }} />)}
        </div>
        <figcaption><strong>{face}</strong><span>{faces[face].color}</span></figcaption>
      </figure>)}
    </div>
    {midTurn && <span className="net-note">Showing the last completed move</span>}
  </div>;
}
