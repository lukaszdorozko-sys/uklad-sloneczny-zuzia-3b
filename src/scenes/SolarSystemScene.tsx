import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';
import { celestialBodies } from '../data/celestialBodies';
import { CelestialBodyMesh } from '../components/solar-system/CelestialBodyMesh';
import { OrbitLine } from '../components/solar-system/OrbitLine';
import { CameraRig } from '../components/solar-system/CameraRig';
import { SunCorona } from '../components/solar-system/SunCorona';
import { TimeDriver } from '../components/solar-system/TimeDriver';
import { useSolarStore } from '../stores/useSolarStore';
import type { QualityPreset } from '../types/celestial';
import { getOverviewCameraPosition } from '../utils/scale';

const qualityConfig: Record<
  QualityPreset,
  {
    dpr: [number, number];
    stars: number;
    sparkles: number;
    sparkleSize: number;
    shadows: boolean;
    shadowMap: number;
  }
> = {
  low: {
    dpr: [1, 1],
    stars: 2600,
    sparkles: 40,
    sparkleSize: 2.1,
    shadows: false,
    shadowMap: 512,
  },
  medium: {
    dpr: [1, 1.5],
    stars: 5200,
    sparkles: 110,
    sparkleSize: 2.8,
    shadows: true,
    shadowMap: 1024,
  },
  high: {
    dpr: [1, 2],
    stars: 7600,
    sparkles: 210,
    sparkleSize: 3.3,
    shadows: true,
    shadowMap: 1536,
  },
};

export function SolarSystemScene() {
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const qualityPreset = useSolarStore((state) => state.qualityPreset);
  const cameraPosition = useMemo(() => getOverviewCameraPosition(scaleMode), [scaleMode]);
  const config = qualityConfig[qualityPreset];

  return (
    <div className="scene-shell" role="img" aria-label="Interaktywny model 3D Układu Słonecznego">
      <Canvas
        shadows={config.shadows}
        dpr={config.dpr}
        camera={{ position: cameraPosition, fov: 48, near: 0.05, far: scaleMode === 'educational' ? 500 : 1600 }}
        gl={{ antialias: qualityPreset !== 'low', powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#03050b']} />
        <fog attach="fog" args={['#03050b', scaleMode === 'educational' ? 70 : 440, scaleMode === 'educational' ? 180 : 1200]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.12} />
          <pointLight
            position={[0, 0, 0]}
            intensity={scaleMode === 'educational' ? 850 : 1800}
            distance={scaleMode === 'educational' ? 190 : 900}
            color="#fff4d0"
            castShadow={config.shadows}
            shadow-mapSize-width={config.shadowMap}
            shadow-mapSize-height={config.shadowMap}
          />
          <SunCorona />
          <Stars radius={scaleMode === 'educational' ? 180 : 900} depth={80} count={config.stars} factor={4} fade speed={0.35} />
          <Sparkles
            count={scaleMode === 'educational' ? config.sparkles : Math.round(config.sparkles * 1.7)}
            scale={scaleMode === 'educational' ? 118 : 540}
            size={scaleMode === 'educational' ? config.sparkleSize : config.sparkleSize * 1.8}
            speed={0.12}
            color="#8cc8ff"
            opacity={0.35}
          />
          {celestialBodies.map((body) => (
            <OrbitLine key={`orbit-${body.id}`} body={body} />
          ))}
          {celestialBodies.map((body) => (
            <CelestialBodyMesh key={body.id} body={body} />
          ))}
          <CameraRig />
          <TimeDriver />
        </Suspense>
      </Canvas>
    </div>
  );
}
