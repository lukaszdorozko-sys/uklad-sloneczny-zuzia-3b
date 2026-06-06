import * as THREE from 'three';
import type { RingProfile } from '../../types/celestial';

interface SaturnRingsProps {
  radius: number;
  rings: RingProfile;
}

export function SaturnRings({ radius, rings }: SaturnRingsProps) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh receiveShadow>
        <ringGeometry
          args={[radius * rings.innerRadiusMultiplier, radius * rings.outerRadiusMultiplier, 192, 10]}
        />
        <meshStandardMaterial
          color={rings.color}
          roughness={0.82}
          metalness={0.05}
          opacity={rings.opacity}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[radius * 1.72, radius * 1.78, 192]} />
        <meshBasicMaterial color="#5f5a4d" opacity={0.42} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
