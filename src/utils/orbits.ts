import { bodyById } from '../data/celestialBodies';
import type { CelestialBody, ScaleMode, Vector3Tuple } from '../types/celestial';
import { getBodyRadius, getMoonOrbitRadius, getPlanetOrbitRadius } from './scale';

const TAU = Math.PI * 2;

const phaseForBody = (body: CelestialBody): number => (body.texture.seed % 360) * (Math.PI / 180);

export const getBodyPosition = (
  body: CelestialBody,
  simulatedDays: number,
  mode: ScaleMode,
): Vector3Tuple => {
  if (body.type === 'star') {
    return [0, 0, 0];
  }

  const period = Math.abs(body.orbitalPeriodDays) || 1;
  const direction = body.orbitalPeriodDays < 0 ? -1 : 1;
  const angle = phaseForBody(body) + direction * (simulatedDays / period) * TAU;

  if (body.type === 'moon' && body.parentId) {
    const parent = bodyById[body.parentId];
    const parentPosition = getBodyPosition(parent, simulatedDays, mode);
    const parentRadius = getBodyRadius(parent, mode);
    const moonOrbitRadius = getMoonOrbitRadius(body, mode, parentRadius);
    return [
      parentPosition[0] + Math.cos(angle) * moonOrbitRadius,
      parentPosition[1] + Math.sin(angle * 0.7) * moonOrbitRadius * 0.08,
      parentPosition[2] + Math.sin(angle) * moonOrbitRadius,
    ];
  }

  const orbitRadius = getPlanetOrbitRadius(body, mode);
  return [
    Math.cos(angle) * orbitRadius,
    Math.sin(angle * 0.32) * orbitRadius * 0.018,
    Math.sin(angle) * orbitRadius,
  ];
};

export const getFocusCameraPosition = (
  body: CelestialBody,
  simulatedDays: number,
  mode: ScaleMode,
): Vector3Tuple => {
  const position = getBodyPosition(body, simulatedDays, mode);
  const distance = body.type === 'star' ? getBodyRadius(body, mode) * 5 : getBodyRadius(body, mode) * 7;
  const minimum = body.type === 'moon' ? 2.5 : 4.5;
  const offset = Math.max(distance, minimum);
  return [position[0] + offset, position[1] + offset * 0.55, position[2] + offset];
};
