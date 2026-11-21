import { Braces, Check, Copy, Download } from 'lucide-react';
import { useCubeStore } from '../stores/cubeStore';

type ScrambleDisplayProps = { copied: boolean; onCopy: () => void; onDownload: () => void };

export default function ScrambleDisplay({ copied, onCopy, onDownload }: ScrambleDisplayProps) {
  const moves = useCubeStore((state) => state.moves);
  const cursor = useCubeStore((state) => state.cursor);
  const moving = useCubeStore((state) => state.playing || state.fraction > 0);
  const seek = useCubeStore((state) => state.seek);
  return <section className="panel formula-panel" aria-labelledby="formula-title">
    <div className="panel-title"><Braces /><h2 id="formula-title">Scramble Formula</h2></div>
    <div className="move-grid" role="group" aria-label="Scramble moves">
      {moves.map((move, index) => <button key={index} title={`Go to move ${index + 1}: ${move}`}
        aria-label={`Move ${index + 1}: ${move}`} aria-current={moving && index === cursor ? 'step' : undefined}
        data-applied={index < cursor} onClick={() => seek(index + 1)}>{move}</button>)}
    </div>
    <div className="formula-actions">
      <button className="button secondary" onClick={onCopy}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}</button>
      <button className="button secondary" onClick={onDownload}><Download size={15} /> TXT</button>
    </div>
  </section>;
}
