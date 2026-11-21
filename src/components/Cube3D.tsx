import { Component, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsHandle } from 'three-stdlib';
import { NoToneMapping, OrthographicCamera as ThreeOrthographicCamera, PCFShadowMap, PerspectiveCamera, VSMShadowMap } from 'three';
import { TriangleAlert } from 'lucide-react';
import { createSolvedCube } from '../engine/cubeState';
import { useCubeStore } from '../stores/cubeStore';
import { makeCubeModel } from './cubeModel';
import { renderCubePng } from '../utils/exportImage';
import type { ExportView } from '../utils/exportOptions';

const cameraPosition: [number, number, number] = [6.6, 5.3, 8.1];
const isoPosition: [number, number, number] = [7, 7.04, 7];

function Unavailable() {
  return <div className="viewport-fallback"><TriangleAlert size={24} /><strong>3D rendering unavailable</strong><span>Enable WebGL 2 or switch to the 2D net to inspect the cube.</span></div>;
}

class ViewportBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <Unavailable /> : this.props.children; }
}

type Cube3DProps = { isometric: boolean; snapToBoundary: boolean; getView: (view: ExportView | null) => void };

function CubeScene({ isometric, snapToBoundary, getView }: Cube3DProps) {
  const { invalidate, camera, gl, scene, size } = useThree();
  const model = useMemo(() => makeCubeModel(createSolvedCube()), []);
  const controls = useRef<OrbitControlsHandle>(null);
  const drawn = useRef({ cursor: 0, fraction: 0, moves: useCubeStore.getState().moves });

  useEffect(() => useCubeStore.subscribe(() => invalidate()), [invalidate]);
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera || camera instanceof ThreeOrthographicCamera)) return;
    getView((options) => renderCubePng({ camera, gl, scene, getPose: () => drawn.current }, options));
    return () => getView(null);
  }, [camera, getView, gl, scene]);

  useLayoutEffect(() => {
    if (!controls.current) return;
    camera.position.set(...(camera instanceof ThreeOrthographicCamera ? isoPosition : cameraPosition));
    controls.current.target.set(0, 0.04, 0);
    controls.current.update();
    invalidate();
  }, [camera, invalidate]);

  useFrame(() => {
    const playback = useCubeStore.getState();
    const { snapshots, moves, cursor } = playback;
    const fraction = snapToBoundary ? 0 : playback.fraction;
    if (drawn.current.moves !== moves || drawn.current.cursor !== cursor || drawn.current.fraction !== fraction) {
      model.setPose(snapshots[cursor], moves[cursor], fraction);
      drawn.current = { cursor, fraction, moves };
      gl.shadowMap.needsUpdate = true;
    }
  });

  return <>
    {isometric && <OrthographicCamera makeDefault position={isoPosition} zoom={size.height / 6.8} near={0.1} far={70} />}
    <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={0.1} minDistance={6.8} maxDistance={19}
      minZoom={size.height / 10} maxZoom={size.height / 4.4} rotateSpeed={0.72} />
    <hemisphereLight args={['#edf5ff', '#9e85dd', 1.6]} />
    <directionalLight color="#f3faff" position={[-3, 10, 4]} intensity={2.25} castShadow shadow-mapSize={[512, 512]}
      shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}
      shadow-camera-far={22} shadow-normalBias={0.02} shadow-radius={10} shadow-blurSamples={12} />
    <directionalLight color="#a99aff" position={[4, 1, -5]} intensity={1.55} />
    <directionalLight color="#759cff" position={[6, 0, 2]} intensity={0.45} />
    <primitive object={model.group} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.32, 0]} receiveShadow>
      <planeGeometry args={[24, 24]} />
      <shadowMaterial opacity={0.28} depthWrite={false} />
    </mesh>
  </>;
}

export default function Cube3D(props: Cube3DProps) {
  return <ViewportBoundary>
    <Canvas className="cube-canvas" frameloop="demand" dpr={[1, 1.6]} shadows={{ type: VSMShadowMap }}
      gl={{ alpha: true, antialias: true, toneMapping: NoToneMapping }}
      onCreated={({ gl }) => {
        if (!gl.extensions.has('EXT_color_buffer_float')) gl.shadowMap.type = PCFShadowMap;
        gl.shadowMap.autoUpdate = false;
        gl.shadowMap.needsUpdate = true;
      }}
      camera={{ position: cameraPosition, fov: 33, near: 0.1, far: 70 }} fallback={<Unavailable />}>
      <CubeScene {...props} />
    </Canvas>
  </ViewportBoundary>;
}
