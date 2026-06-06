import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';
import type { CelestialBody } from '../../types/celestial';
import { useSolarStore } from '../../stores/useSolarStore';

interface CelestialLabelProps {
  body: CelestialBody;
  radius: number;
  active: boolean;
  hovered: boolean;
}

export function CelestialLabel({ body, radius, active, hovered }: CelestialLabelProps) {
  const selectBody = useSolarStore((state) => state.selectBody);
  const setHoveredBody = useSolarStore((state) => state.setHoveredBody);

  return (
    <Html
      center
      distanceFactor={body.type === 'moon' ? 8 : 12}
      position={[0, radius + 0.35, 0]}
      transform={false}
      zIndexRange={[30, 0]}
    >
      <button
        type="button"
        className={`label-pill ${active ? 'label-pill--active' : ''} ${hovered ? 'label-pill--hovered' : ''}`}
        style={{ '--label-color': body.themeColor } as CSSProperties}
        aria-label={`Wybierz obiekt ${body.name}`}
        onClick={(event) => {
          event.stopPropagation();
          selectBody(body.id);
        }}
        onMouseEnter={() => setHoveredBody(body.id)}
        onMouseLeave={() => setHoveredBody('')}
      >
        {body.name}
      </button>
    </Html>
  );
}
