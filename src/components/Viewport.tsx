import { Box, Crosshair, Grid2X2, LoaderCircle, Mouse, Move, ScanLine, ZoomIn } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import CubeNet from './CubeNet';
import type { ExportView } from '../utils/exportOptions';

type ViewportProps = { getView: (view: ExportView | null) => void; scan: number; completed: number };
const Cube3D = lazy(() => import('./Cube3D'));

export default function Viewport({ getView, scan, completed }: ViewportProps) {
  const [mode, setMode] = useState<'3d' | 'net'>('3d');
  const [isometric, setIsometric] = useState(false);
  const reducedMotion = useReducedMotion();
  return <section className="panel viewport" aria-labelledby="viewport-title">
    <div className="viewport-header">
      <div className="panel-title"><Crosshair /><h2 id="viewport-title">Viewport</h2></div>
      <div role="group" className="view-toggle" aria-label="Cube view">
        <button aria-pressed={mode === '3d'} onClick={() => setMode('3d')}><Box size={15} /> 3D View</button>
        <button aria-pressed={mode === 'net'} onClick={() => setMode('net')}><Grid2X2 size={15} /> 2D Net</button>
      </div>
    </div>
    <div className="viewport-stage" data-mode={mode}>
      <div className="stage-grid" aria-hidden="true" />
      <div className="stage-stars" aria-hidden="true" />
      <div className="stage-platform" aria-hidden="true" />
      <div className="view-corner top-left" aria-hidden="true" /><div className="view-corner top-right" aria-hidden="true" />
      <div className="view-corner bottom-left" aria-hidden="true" /><div className="view-corner bottom-right" aria-hidden="true" />
      <div className="live-canvas" aria-hidden={mode === 'net'}>
        <Suspense fallback={<div className="viewport-fallback" role="status"><LoaderCircle className="loading-icon" size={25} /><span>Loading 3D viewport…</span></div>}>
          <Cube3D isometric={isometric} snapToBoundary={mode === 'net'} getView={getView} />
        </Suspense>
      </div>
      {mode === 'net' && <CubeNet />}
      <AnimatePresence>
        {!reducedMotion && scan > 0 && <motion.div key={`scan-${scan}`} className="scan-effect" initial={{ top: '8%', opacity: 0 }}
          animate={{ top: ['8%', '12%', '92%'], opacity: [0, 0.8, 0] }} transition={{ duration: 0.46, ease: 'easeOut' }} aria-hidden="true" />}
        {!reducedMotion && completed > 0 && <motion.div key={`complete-${completed}`} className="complete-effect" initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.38, 0] }} transition={{ duration: 0.9 }} aria-hidden="true" />}
      </AnimatePresence>
      {mode === '3d' && <div className="stage-footer">
        <div className="viewport-hints"><span><Move size={13} /> Drag to orbit</span><span><Mouse size={13} /> Scroll to zoom</span></div>
        <div className="viewport-touch"><ZoomIn size={14} /> Drag or pinch</div>
        <button className="iso-button" aria-pressed={isometric} onClick={() => setIsometric((enabled) => !enabled)} title="Toggle orthographic isometric view"><ScanLine size={14} /> Isometric</button>
      </div>}
    </div>
  </section>;
}
