import { Clock3, History, Trash2 } from 'lucide-react';
import { useCubeStore } from '../stores/cubeStore';
import type { HistoryEntry } from '../stores/history';

const formatDate = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function HistoryPanel({ onLoad, onClear }: { onLoad: (entry: HistoryEntry) => void; onClear: () => void }) {
  const history = useCubeStore((state) => state.history);
  const selectedId = useCubeStore((state) => state.selectedId);
  return <section className="panel history-panel" aria-labelledby="history-title">
    <div className="panel-title"><History /><h2 id="history-title">Scramble History</h2>
      <button className="icon-button clear-history" title="Clear history" aria-label="Clear history" disabled={history.length === 0} onClick={onClear}><Trash2 size={15} /></button>
    </div>
    {history.length ? <ul className="history-list">
      {history.map((entry) => <li key={entry.id}>
        <button aria-pressed={selectedId === entry.id} onClick={() => onLoad(entry)} title={entry.formula}>
          <div className="history-meta"><time dateTime={entry.createdAt}>{formatDate.format(new Date(entry.createdAt))}</time><span>{entry.length} moves</span></div>
          <span className="history-formula">{entry.formula}</span>
        </button>
      </li>)}
    </ul> : <div className="history-empty"><Clock3 size={19} /><strong>No scrambles yet</strong><span>Generated formulas appear here.</span></div>}
  </section>;
}
