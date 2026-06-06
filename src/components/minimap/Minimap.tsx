import { useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { Crosshair } from 'lucide-react';
import { bodyById, planets } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import { getBodyPosition } from '../../utils/orbits';
import { getPlanetOrbitRadius } from '../../utils/scale';

const MINIMAP_SIZE = 220;
const CENTER = MINIMAP_SIZE / 2;

export function Minimap() {
  const simulatedDays = useSolarStore((state) => state.simulatedDays);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const cameraPosition = useSolarStore((state) => state.cameraPosition);
  const selectBody = useSolarStore((state) => state.selectBody);

  const maxOrbit = useMemo(() => {
    const neptune = bodyById.neptune;
    return getPlanetOrbitRadius(neptune, scaleMode) * 1.08;
  }, [scaleMode]);

  const project = (x: number, z: number) => ({
    x: CENTER + (x / maxOrbit) * (CENTER - 16),
    y: CENTER + (z / maxOrbit) * (CENTER - 16),
  });

  const selectedBody = selectedBodyId ? bodyById[selectedBodyId] : null;
  const selectedPosition = selectedBody ? getBodyPosition(selectedBody, simulatedDays, scaleMode) : null;
  const cameraDot = project(cameraPosition[0], cameraPosition[2]);
  const selectableMapBodies = [bodyById.sun, ...planets];

  const handleKeySelect = (event: KeyboardEvent<SVGGElement>, bodyId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectBody(bodyId);
    }
  };

  return (
    <aside className="minimap" aria-label="Minimapa Układu Słonecznego">
      <div className="section-heading">
        <Crosshair aria-hidden="true" size={16} />
        <h2>Minimapa</h2>
      </div>
      <svg viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`} role="img" aria-label="Położenie planet i kamery">
        {planets.map((planet) => {
          const orbit = getPlanetOrbitRadius(planet, scaleMode);
          return (
            <circle
              key={`orbit-${planet.id}`}
              cx={CENTER}
              cy={CENTER}
              r={(orbit / maxOrbit) * (CENTER - 16)}
              fill="none"
              stroke="rgba(180, 216, 255, 0.16)"
              strokeWidth="1"
            />
          );
        })}

        {selectableMapBodies.map((body) => {
          const position = getBodyPosition(body, simulatedDays, scaleMode);
          const dot = project(position[0], position[2]);
          const isSelected = body.id === selectedBodyId;

          return (
            <g
              key={body.id}
              className={`minimap-object ${isSelected ? 'is-selected' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Przejdź do obiektu ${body.name}`}
              onClick={() => selectBody(body.id)}
              onKeyDown={(event) => handleKeySelect(event, body.id)}
            >
              <title>{body.name}</title>
              <circle cx={dot.x} cy={dot.y} r={body.type === 'star' ? 10 : 8} fill="transparent" />
              <circle
                cx={dot.x}
                cy={dot.y}
                r={isSelected ? 5 : body.type === 'star' ? 4 : 3}
                fill={body.themeColor}
              />
            </g>
          );
        })}

        {selectedPosition ? (
          <circle
            cx={project(selectedPosition[0], selectedPosition[2]).x}
            cy={project(selectedPosition[0], selectedPosition[2]).y}
            r="9"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ) : null}
        <path
          d={`M ${cameraDot.x - 5} ${cameraDot.y} L ${cameraDot.x} ${cameraDot.y - 8} L ${cameraDot.x + 5} ${cameraDot.y} Z`}
          fill="#f5f7fb"
          opacity="0.92"
        />
      </svg>
    </aside>
  );
}
