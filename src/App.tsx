import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, CheckCircle2, CircleAlert, Command, Download, Layers3, Settings2, Volume2 } from 'lucide-react';
import ControlPanel from './components/ControlPanel';
import CubeStatus from './components/CubeStatus';
import HistoryPanel from './components/HistoryPanel';
import Modal from './components/Modal';
import ScrambleDisplay from './components/ScrambleDisplay';
import Timeline from './components/Timeline';
import Viewport from './components/Viewport';
import { usePlayback } from './hooks/usePlayback';
import { useCubeStore } from './stores/cubeStore';
import type { HistoryEntry } from './stores/history';
import { copyText, downloadFile } from './utils/download';
import { exportSizes } from './utils/exportOptions';
import type { ExportOptions, ExportView } from './utils/exportOptions';
import { unlockTurnSound } from './utils/turnSound';

type Dialog = 'settings' | 'export' | 'clear';
type Notice = { message: string; error: boolean };

export default function App() {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [copied, setCopied] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scan, setScan] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [options, setOptions] = useState<ExportOptions>({ size: 'square', transparent: false, includeFormula: false });
  const view = useRef<ExportView | null>(null);
  const sound = useCubeStore((state) => state.sound);

  const getView = useCallback((current: ExportView | null) => {
    view.current = current;
    setCanExport(Boolean(current));
  }, []);
  const onComplete = useCallback(() => setCompleted((value) => value + 1), []);
  usePlayback(onComplete);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function showNotice(message: string, error = false) { setNotice({ message, error }); }

  const generate = useCallback(() => {
    try {
      const saved = useCubeStore.getState().generate();
      setCopied(false);
      setScan((value) => value + 1);
      setNotice({ message: saved ? 'Scramble generated' : 'Scramble generated. History could not be saved on this device.', error: !saved });
    } catch {
      setNotice({ message: 'Unable to generate a scramble. Please try again.', error: true });
    }
  }, []);

  useEffect(() => {
    function shortcuts(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || dialog) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input,select,textarea,[contenteditable]')) return;
      const state = useCubeStore.getState();
      if (event.code === 'Space' && !target?.closest('button,a')) { event.preventDefault(); state.togglePlay(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); state.step(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); state.step(1); }
      if (event.key.toLowerCase() === 'g') generate();
    }
    window.addEventListener('keydown', shortcuts);
    return () => window.removeEventListener('keydown', shortcuts);
  }, [dialog, generate]);

  function load(entry: HistoryEntry) {
    try {
      useCubeStore.getState().load(entry);
      setCopied(false);
      showNotice('Scramble restored');
    } catch { showNotice('Unable to restore this scramble.', true); }
  }

  function clearHistory() {
    const saved = useCubeStore.getState().clearHistory();
    showNotice(saved ? 'Scramble history cleared' : 'Session history cleared. The browser could not update saved history.', !saved);
    setDialog(null);
  }

  async function copyFormula() {
    try {
      await copyText(useCubeStore.getState().moves.join(' '));
      setCopied(true);
      showNotice('Formula copied to clipboard');
    } catch { showNotice('Clipboard access failed. The formula is available as a TXT download.', true); }
  }

  function downloadFormula() {
    const { moves } = useCubeStore.getState();
    downloadFile(new Blob([`${moves.join(' ')}\n`], { type: 'text/plain;charset=utf-8' }), `cubex-${moves.length}-moves.txt`);
  }

  async function exportImage() {
    if (!view.current || exporting) return;
    setExporting(true);
    try {
      const png = await view.current(options);
      const { width, height } = exportSizes[options.size];
      downloadFile(png, `cubex-${width}x${height}.png`);
      setDialog(null);
      showNotice('PNG exported');
    } catch {
      setDialog(null);
      showNotice('Could not render the PNG. Try a smaller resolution or check WebGL support.', true);
    } finally { setExporting(false); }
  }

  return <>
    <header className="site-header">
      <div className="header-inner">
        <div className="identity">
          <span className="logo-mark"><Box size={25} strokeWidth={1.7} /></span>
          <span className="wordmark">CUBE<span>X</span></span>
          <span className="header-divider" />
          <span className="app-name">3D SCRAMBLE LAB</span>
        </div>
        <div className="header-actions">
          <span className="engine-status" data-online={canExport}><i /> {canExport ? 'WebGL ready' : 'WebGL offline'}</span>
          <button className="button settings-button" onClick={() => setDialog('settings')}><Settings2 size={17} /><span>Settings</span></button>
        </div>
      </div>
    </header>
    <main className="workspace">
      <div className="workspace-heading">
        <div><h1>Scramble Lab</h1><p>Generate, visualize, and replay 3×3 cube scrambles.</p></div>
        <div className="generator-type" title="Generates random moves with axis restrictions"><Layers3 size={16} /> Random-Move Scrambler</div>
      </div>
      <div className="dashboard">
        <div className="left-column"><ControlPanel onGenerate={generate} onExport={() => setDialog('export')} canExport={canExport} exporting={exporting} /></div>
        <div className="center-column">
          <Viewport getView={getView} scan={scan} completed={completed} />
          <Timeline />
        </div>
        <aside className="right-column" aria-label="Scramble details">
          <ScrambleDisplay copied={copied} onCopy={() => void copyFormula()} onDownload={downloadFormula} />
          <CubeStatus />
          <HistoryPanel onLoad={load} onClear={() => setDialog('clear')} />
        </aside>
      </div>
      <footer className="workspace-footer">
        <div className="shortcut-label"><Command size={14} /> Keyboard shortcuts</div>
        <div className="shortcuts"><span><kbd>Space</kbd> Play / Pause</span><span><kbd>←</kbd><kbd>→</kbd> Step moves</span><span><kbd>G</kbd> Generate</span></div>
      </footer>
    </main>
    {notice && <div key={notice.message} className="toast" role={notice.error ? 'alert' : 'status'} data-error={notice.error}>
      {notice.error ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}{notice.message}
    </div>}
    {dialog === 'settings' && <Modal title="Settings" onClose={() => setDialog(null)}>
      <label className="modal-switch"><span><Volume2 size={17} /> Turn sound</span><input type="checkbox" checked={sound} onChange={(event) => {
        useCubeStore.getState().setSound(event.target.checked);
        if (event.target.checked) unlockTurnSound();
      }} /></label>
    </Modal>}
    {dialog === 'export' && <Modal title="Export image" onClose={() => { if (!exporting) setDialog(null); }}>
      <p className="modal-description">Save the current 3D pose and camera angle as a PNG.</p>
      <label className="export-size"><span>Resolution</span><select value={options.size} onChange={(event) => setOptions({ ...options, size: event.target.value as ExportOptions['size'] })}>
        {Object.entries(exportSizes).map(([size, { label }]) => <option key={size} value={size}>{label}</option>)}
      </select></label>
      <label className="modal-switch"><span>Transparent background</span><input type="checkbox" checked={options.transparent} onChange={(event) => setOptions({ ...options, transparent: event.target.checked })} /></label>
      <label className="modal-switch"><span>Include scramble formula</span><input type="checkbox" checked={options.includeFormula} onChange={(event) => setOptions({ ...options, includeFormula: event.target.checked })} /></label>
      <button className="button generate modal-action" onClick={() => void exportImage()} disabled={exporting}><Download size={17} /> {exporting ? 'Rendering PNG…' : 'Download PNG'}</button>
    </Modal>}
    {dialog === 'clear' && <Modal title="Clear scramble history?" onClose={() => setDialog(null)}>
      <p className="modal-description">This removes all saved scramble entries from this browser.</p>
      <div className="modal-actions"><button className="button secondary" onClick={() => setDialog(null)}>Cancel</button><button className="button danger" onClick={clearHistory}>Clear history</button></div>
    </Modal>}
  </>;
}
