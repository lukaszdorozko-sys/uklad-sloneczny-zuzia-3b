import { bodyById, celestialBodies, moons, planets, selectableBodies } from '../data/celestialBodies';
import type { BodyType } from '../types/celestial';

export const astronomyService = {
  all: () => celestialBodies,
  selectable: () => selectableBodies,
  planets: () => planets,
  moons: () => moons,
  byId: (id: string) => bodyById[id],
  byType: (type: BodyType) => celestialBodies.filter((body) => body.type === type),
  search: (query: string) => {
    const normalized = query.trim().toLowerCase();
    return normalized
      ? celestialBodies.filter((body) => body.name.toLowerCase().includes(normalized))
      : celestialBodies;
  },
};
