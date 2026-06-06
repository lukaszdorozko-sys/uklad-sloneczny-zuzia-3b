import { memo, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BASE_DAYS_PER_SECOND } from '../../constants/astronomy';
import { CelestialLabel } from '../labels/CelestialLabel';
import { useSolarStore } from '../../stores/useSolarStore';
import type { CelestialBody, QualityPreset } from '../../types/celestial';
import { getBodyPosition } from '../../utils/orbits';
import { getBodyRadius } from '../../utils/scale';
import {
  createBodyTexture,
  createBumpTexture,
  createCloudTexture,
  createNormalTexture,
  createRoughnessTexture,
} from '../../utils/textures';
import { SaturnRings } from './SaturnRings';

interface CelestialBodyMeshProps {
  body: CelestialBody;
}

const TAU = Math.PI * 2;

const geometrySegments: Record<
  QualityPreset,
  {
    star: [number, number];
    body: [number, number];
    halo: [number, number];
  }
> = {
  low: {
    star: [48, 24],
    body: [32, 16],
    halo: [28, 14],
  },
  medium: {
    star: [72, 36],
    body: [48, 24],
    halo: [40, 20],
  },
  high: {
    star: [96, 48],
    body: [64, 32],
    halo: [48, 24],
  },
};

export const CelestialBodyMesh = memo(function CelestialBodyMesh({ body }: CelestialBodyMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const hoveredBodyId = useSolarStore((state) => state.hoveredBodyId);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const qualityPreset = useSolarStore((state) => state.qualityPreset);
  const selectBody = useSolarStore((state) => state.selectBody);
  const setHoveredBody = useSolarStore((state) => state.setHoveredBody);

  const active = selectedBodyId === body.id;
  const hovered = hoveredBodyId === body.id;
  const radius = useMemo(() => getBodyRadius(body, scaleMode), [body, scaleMode]);
  const bodySegments = geometrySegments[qualityPreset][body.type === 'star' ? 'star' : 'body'];
  const haloSegments = geometrySegments[qualityPreset].halo;
  const colorTexture = useMemo(() => createBodyTexture(body), [body]);
  const cloudTexture = useMemo(() => createCloudTexture(body), [body]);
  const bumpTexture = useMemo(() => createBumpTexture(body), [body]);
  const normalTexture = useMemo(() => createNormalTexture(body), [body]);
  const roughnessTexture = useMemo(() => createRoughnessTexture(body), [body]);
  const normalScale = useMemo(
    () => new THREE.Vector2(body.type === 'moon' ? 0.08 : 0.045, body.type === 'moon' ? 0.08 : 0.045),
    [body.type],
  );

  useFrame((_, delta) => {
    if (!groupRef.current || !meshRef.current || !tiltRef.current) {
      return;
    }

    const { simulatedDays, timeSpeed } = useSolarStore.getState();
    const position = getBodyPosition(body, simulatedDays, scaleMode);
    groupRef.current.position.set(position[0], position[1], position[2]);
    tiltRef.current.rotation.z = THREE.MathUtils.degToRad(body.axialTiltDeg);

    if (timeSpeed > 0) {
      const rotationDirection = body.rotationPeriodHours < 0 ? -1 : 1;
      const periodHours = Math.max(1, Math.abs(body.rotationPeriodHours));
      meshRef.current.rotation.y +=
        rotationDirection * delta * BASE_DAYS_PER_SECOND * timeSpeed * (24 / periodHours) * TAU;
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={tiltRef}>
        <mesh
          ref={meshRef}
          castShadow={body.type !== 'star'}
          receiveShadow={body.type !== 'star'}
          onClick={(event) => {
            event.stopPropagation();
            selectBody(body.id);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setHoveredBody(body.id);
          }}
          onPointerOut={() => setHoveredBody('')}
        >
          <sphereGeometry args={[radius, bodySegments[0], bodySegments[1]]} />
          {body.type === 'star' ? (
            <meshBasicMaterial map={colorTexture} color="#ffe08a" />
          ) : (
            <meshStandardMaterial
              map={colorTexture}
              bumpMap={bumpTexture}
              bumpScale={body.type === 'moon' ? 0.045 : 0.025}
              normalMap={normalTexture}
              normalScale={normalScale}
              roughnessMap={roughnessTexture}
              roughness={body.texture.ice ? 0.48 : 0.72}
              metalness={0.02}
              emissive={active || hovered ? body.themeColor : '#000000'}
              emissiveIntensity={active ? 0.18 : hovered ? 0.08 : 0}
            />
          )}
        </mesh>
        {body.rings ? <SaturnRings radius={radius} rings={body.rings} /> : null}
        {cloudTexture ? (
          <mesh scale={1.012}>
            <sphereGeometry args={[radius, bodySegments[0], bodySegments[1]]} />
            <meshStandardMaterial
              map={cloudTexture}
              transparent
              opacity={0.42}
              depthWrite={false}
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        ) : null}
      </group>

      {(active || hovered) && (
        <mesh scale={1.12}>
          <sphereGeometry args={[radius, haloSegments[0], haloSegments[1]]} />
          <meshBasicMaterial
            color={body.themeColor}
            opacity={active ? 0.19 : 0.1}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      <CelestialLabel body={body} radius={radius} active={active} hovered={hovered} />
    </group>
  );
});
