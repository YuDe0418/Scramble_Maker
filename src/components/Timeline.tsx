import type { CSSProperties } from 'react';
import { useCubeStore } from '../stores/cubeStore';
import PlaybackControls from './PlaybackControls';

export default function Timeline() {
  const cursor = useCubeStore((state) => state.cursor);
  const fraction = useCubeStore((state) => state.fraction);
  const total = useCubeStore((state) => state.moves.length);
  const seek = useCubeStore((state) => state.seek);
  const value = cursor + fraction;
  return <section className="panel timeline" aria-labelledby="timeline-title">
    <div className="timeline-header">
      <h2 id="timeline-title">Playback Timeline</h2>
      <span><b>{String(cursor).padStart(2, '0')}</b> / {total} MOVES</span>
    </div>
    <div className="timeline-body">
      <div className="mobile-transport"><PlaybackControls /></div>
      <div className="scrubber">
        <div className="slider-track" style={{ '--playhead': value / total } as CSSProperties}>
          <input type="range" min={0} max={total} step={1} value={cursor} aria-label="Playback position"
            aria-valuetext={`${cursor} of ${total} moves`} onChange={(event) => seek(event.target.valueAsNumber)} />
          <i aria-hidden="true" />
        </div>
        <div className="timeline-ticks" aria-hidden="true"><span>0</span><span>{Math.round(total / 4)}</span><span>{Math.round(total / 2)}</span><span>{Math.round(total * 3 / 4)}</span><span>{total}</span></div>
      </div>
    </div>
  </section>;
}
