import { Moon, Orbit } from 'lucide-react';
import { moons, planets } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';

export function ObjectList() {
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const selectBody = useSolarStore((state) => state.selectBody);

  return (
    <aside className="object-list" aria-label="Lista obiektów">
      <section>
        <div className="section-heading">
          <Orbit aria-hidden="true" size={16} />
          <h2>Planety</h2>
        </div>
        <div className="object-buttons">
          {planets.map((body) => (
            <button
              type="button"
              key={body.id}
              className={selectedBodyId === body.id ? 'is-selected' : ''}
              onClick={() => selectBody(body.id)}
            >
              <span style={{ backgroundColor: body.themeColor }} />
              {body.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <Moon aria-hidden="true" size={16} />
          <h2>Księżyce</h2>
        </div>
        <div className="object-buttons">
          {moons.map((body) => (
            <button
              type="button"
              key={body.id}
              className={selectedBodyId === body.id ? 'is-selected' : ''}
              onClick={() => selectBody(body.id)}
            >
              <span style={{ backgroundColor: body.themeColor }} />
              {body.name}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
