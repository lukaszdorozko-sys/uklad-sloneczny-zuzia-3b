import { memo, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import type { CelestialBody, QualityPreset } from '../../types/celestial';
import { getBodyPosition } from '../../utils/orbits';
import { getBodyRadius, getMoonOrbitRadius, getPlanetOrbitRadius } from '../../utils/scale';

interface OrbitLineProps {
  body: CelestialBody;
}

const orbitSegments: Record<QualityPreset, { planet: number; moon: number }> = {
  low: { planet: 96, moon: 56 },
  medium: { planet: 176, moon: 96 },
  high: { planet: 256, moon: 128 },
};

export const OrbitLine = memo(function OrbitLine({ body }: OrbitLineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const qualityPreset = useSolarStore((state) => state.qualityPreset);

  const radius = useMemo(() => {
    if (body.type === 'planet') {
      return getPlanetOrbitRadius(body, scaleMode);
    }

    if (body.type === 'moon' && body.parentId) {
      const parent = bodyById[body.parentId];
      return getMoonOrbitRadius(body, scaleMode, getBodyRadius(parent, scaleMode));
    }

    return 0;
  }, [body, scaleMode]);

  useFrame(() => {
    if (!groupRef.current || body.type !== 'moon' || !body.parentId) {
      return;
    }

    const { simulatedDays } = useSolarStore.getState();
    const parent = bodyById[body.parentId];
    const parentPosition = getBodyPosition(parent, simulatedDays, scaleMode);
    groupRef.current.position.set(parentPosition[0], parentPosition[1], parentPosition[2]);
  });

  if (body.type === 'star' || radius <= 0) {
    return null;
  }

  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <ringGeometry
          args={[radius - 0.012, radius + 0.012, orbitSegments[qualityPreset][body.type === 'planet' ? 'planet' : 'moon']]}
        />
        <meshBasicMaterial
          color={body.type === 'planet' ? '#8cc8ff' : body.themeColor}
          opacity={body.type === 'planet' ? 0.18 : 0.32}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
});
