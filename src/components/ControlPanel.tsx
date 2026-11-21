import { Download, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { scrambleLengths } from '../engine/scrambleGenerator';
import { playbackSpeeds, useCubeStore } from '../stores/cubeStore';
import PlaybackControls from './PlaybackControls';

type ControlPanelProps = { onGenerate: () => void; onExport: () => void; canExport: boolean; exporting: boolean };

export default function ControlPanel({ onGenerate, onExport, canExport, exporting }: ControlPanelProps) {
  const length = useCubeStore((state) => state.length);
  const speed = useCubeStore((state) => state.speed);
  const setLength = useCubeStore((state) => state.setLength);
  const setSpeed = useCubeStore((state) => state.setSpeed);
  const seek = useCubeStore((state) => state.seek);
  return <section className="panel controls" aria-labelledby="controls-title">
    <div className="panel-title"><SlidersHorizontal /><h2 id="controls-title">Controls</h2></div>
    <button className="button generate" onClick={onGenerate}><Sparkles size={18} /> Generate Scramble</button>
    <div className="control-group">
      <div className="control-label" id="length-label">Scramble Length <span>STEPS</span></div>
      <div className="option-grid" role="group" aria-labelledby="length-label">
        {scrambleLengths.map((value) => <button key={value} aria-pressed={length === value} onClick={() => setLength(value)}>{value}</button>)}
      </div>
    </div>
    <div className="control-group">
      <div className="control-label" id="speed-label">Animation Speed</div>
      <div className="option-grid speed-options" role="group" aria-labelledby="speed-label">
        {playbackSpeeds.map((value) => <button key={value} aria-pressed={speed === value} onClick={() => setSpeed(value)}>{value}×</button>)}
      </div>
    </div>
    <div className="control-group desktop-transport"><div className="control-label">Playback</div><PlaybackControls /></div>
    <div className="control-actions">
      <button className="button secondary" onClick={() => seek(0)}><RotateCcw size={16} /> Reset Cube</button>
      <button className="button export-button" disabled={!canExport || exporting} onClick={onExport}><Download size={16} /> {exporting ? 'Rendering PNG…' : 'Export Image'}</button>
    </div>
  </section>;
}
