import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import { createSolvedCube, getFaceletKey } from '../engine/cubeState';
import { useCubeStore } from '../stores/cubeStore';

const solvedFacelets = getFaceletKey(createSolvedCube());

export default function CubeStatus() {
  const cursor = useCubeStore((state) => state.cursor);
  const total = useCubeStore((state) => state.moves.length);
  const progress = useCubeStore((state) => Math.round(100 * (state.cursor + state.fraction) / state.moves.length));
  const moving = useCubeStore((state) => state.playing || state.fraction > 0);
  const snapshot = useCubeStore((state) => state.snapshots[state.cursor]);
  const solved = useMemo(() => getFaceletKey(snapshot) === solvedFacelets, [snapshot]);
  const status = moving ? 'In progress' : solved ? 'Solved' : cursor === total ? 'Scrambled' : 'Partial';
  return <section className="panel status-panel" aria-labelledby="status-title">
    <div className="panel-title"><Activity /><h2 id="status-title">Cube State</h2></div>
    <div className="state-row"><span>Current state</span><span className="state-pill" data-status={status}><i />{status}</span></div>
    <div className="metric-grid">
      <div><span>Moves applied</span><strong>{String(cursor).padStart(2, '0')} <small>/ {total}</small></strong></div>
      <div><span>Progress</span><strong>{progress}<small>%</small></strong></div>
    </div>
  </section>;
}
