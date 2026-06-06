import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { celestialBodies } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';

export function ObjectSearch() {
  const [query, setQuery] = useState('');
  const selectBody = useSolarStore((state) => state.selectBody);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return [];
    }

    return celestialBodies.filter((body) => body.name.toLowerCase().includes(normalized)).slice(0, 8);
  }, [query]);

  return (
    <div className="search-box">
      <Search aria-hidden="true" size={18} />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Szukaj obiektu"
        aria-label="Szukaj obiektu w Układzie Słonecznym"
      />
      {results.length > 0 ? (
        <div className="search-results" role="listbox" aria-label="Wyniki wyszukiwania">
          {results.map((body) => (
            <button
              type="button"
              key={body.id}
              onClick={() => {
                selectBody(body.id);
                setQuery('');
              }}
            >
              <span style={{ backgroundColor: body.themeColor }} />
              {body.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
