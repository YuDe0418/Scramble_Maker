import { MathUtils, WebGLRenderer } from 'three';
import type { OrthographicCamera, PerspectiveCamera, Scene } from 'three';
import type { Move } from '../engine/cubeMoves';
import { exportSizes } from './exportOptions';
import type { ExportOptions } from './exportOptions';
export type RenderedPose = { cursor: number; fraction: number; moves: readonly Move[] };
type CubeCamera = PerspectiveCamera | OrthographicCamera;
type CubeSceneView = {
  camera: CubeCamera;
  gl: WebGLRenderer;
  scene: Scene;
  getPose: () => RenderedPose;
};

export function getExportCamera(source: CubeCamera, width: number, height: number, includeFormula: boolean) {
  const aspect = width / height;
  const margin = includeFormula ? 1.12 : 1;
  if ('isOrthographicCamera' in source) {
    const camera = source.clone();
    const sourceHeight = source.top - source.bottom;
    const fit = Math.max(1, Math.min(1, (source.right - source.left) / sourceHeight) / aspect);
    camera.top = sourceHeight * fit * margin / 2;
    camera.bottom = -camera.top;
    camera.right = camera.top * aspect;
    camera.left = -camera.right;
    if (includeFormula) camera.setViewOffset(width, height, 0, Math.round(height * 0.065), width, height);
    camera.updateProjectionMatrix();
    return camera;
  }
  const camera = source.clone();
  camera.aspect = aspect;
  const fit = Math.max(1, Math.min(1, source.aspect) / aspect);
  const vertical = Math.tan(MathUtils.degToRad(source.fov / 2)) * fit * margin;
  camera.fov = MathUtils.radToDeg(Math.atan(vertical)) * 2;
  if (includeFormula) camera.setViewOffset(width, height, 0, Math.round(height * 0.065), width, height);
  camera.updateProjectionMatrix();
  return camera;
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = context.createRadialGradient(width / 2, height * 0.54, 0, width / 2, height * 0.54, Math.max(width, height) * 0.72);
  gradient.addColorStop(0, '#2c2253');
  gradient.addColorStop(0.62, '#111426');
  gradient.addColorStop(1, '#080b14');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawFormula(context: CanvasRenderingContext2D, width: number, height: number, pose: RenderedPose, transparent: boolean) {
  const scale = height / 1080;
  const panelWidth = Math.min(width * 0.9, 1500 * scale);
  const panelHeight = 100 * scale;
  const x = (width - panelWidth) / 2;
  const y = height - panelHeight - 34 * scale;
  context.fillStyle = transparent ? 'rgba(12, 17, 30, 0.88)' : '#12182c';
  context.beginPath();
  context.roundRect(x, y, panelWidth, panelHeight, 14 * scale);
  context.fill();
  const current = pose.fraction ? ` · ${pose.moves[pose.cursor]} in progress` : '';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#74e5eb';
  context.font = `600 ${17 * scale}px system-ui, sans-serif`;
  context.fillText(`CUBEX  /  ${pose.cursor} of ${pose.moves.length} moves applied${current}`, width / 2, y + 28 * scale);
  context.fillStyle = '#eef2ff';
  context.font = `${23 * scale}px monospace`;
  context.fillText(pose.moves.join(' '), width / 2, y + 66 * scale, panelWidth - 40 * scale);
}

export async function renderCubePng(view: CubeSceneView, options: ExportOptions): Promise<Blob> {
  const { width, height } = exportSizes[options.size];
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const context = output.getContext('2d');
  if (!context) throw new Error('The browser could not prepare a PNG canvas.');

  const camera = getExportCamera(view.camera, width, height, options.includeFormula);
  const pose = view.getPose();
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
  try {
    renderer.setSize(width, height, false);
    renderer.toneMapping = view.gl.toneMapping;
    renderer.toneMappingExposure = view.gl.toneMappingExposure;
    renderer.outputColorSpace = view.gl.outputColorSpace;
    renderer.shadowMap.enabled = view.gl.shadowMap.enabled;
    renderer.shadowMap.type = view.gl.shadowMap.type;
    renderer.setClearColor(0x000000, 0);
    renderer.render(view.scene, camera);
    if (!options.transparent) drawBackground(context, width, height);
    context.drawImage(renderer.domElement, 0, 0);
    if (options.includeFormula) drawFormula(context, width, height, pose, options.transparent);
  } finally {
    renderer.dispose();
    renderer.forceContextLoss();
  }

  return new Promise((resolve, reject) => {
    output.toBlob((blob) => blob ? resolve(blob) : reject(new Error('PNG encoding failed.')), 'image/png');
  });
}
