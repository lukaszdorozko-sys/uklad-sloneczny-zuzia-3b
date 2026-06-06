import * as THREE from 'three';
import { bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import { getBodyRadius } from '../../utils/scale';

export function SunCorona() {
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const sunRadius = getBodyRadius(bodyById.sun, scaleMode);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[sunRadius * 1.42, 64, 32]} />
        <meshBasicMaterial
          color="#ffb13b"
          opacity={0.12}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[sunRadius * 2.1, 64, 32]} />
        <meshBasicMaterial
          color="#ffe08a"
          opacity={0.045}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
