import { Pause, Play, RotateCw, SkipBack, SkipForward } from 'lucide-react';
import { useCubeStore } from '../stores/cubeStore';

export default function PlaybackControls() {
  const atStart = useCubeStore((state) => state.cursor === 0 && state.fraction === 0);
  const atEnd = useCubeStore((state) => state.cursor === state.moves.length);
  const playing = useCubeStore((state) => state.playing);
  const togglePlay = useCubeStore((state) => state.togglePlay);
  const restart = useCubeStore((state) => state.restart);
  const step = useCubeStore((state) => state.step);
  return <div className="transport" role="group" aria-label="Playback controls">
    <button className="icon-button transport-control" title="Previous move (←)" aria-label="Previous move" disabled={atStart} onClick={() => step(-1)}><SkipBack size={16} /></button>
    <button className="icon-button play-button" title={playing ? 'Pause (Space)' : 'Play (Space)'} aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay}>
      {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
    </button>
    <button className="icon-button transport-control" title="Next move (→)" aria-label="Next move" disabled={atEnd} onClick={() => step(1)}><SkipForward size={16} /></button>
    <button className="icon-button transport-control restart" title="Restart playback" aria-label="Restart playback" onClick={restart}><RotateCw size={16} /></button>
  </div>;
}
