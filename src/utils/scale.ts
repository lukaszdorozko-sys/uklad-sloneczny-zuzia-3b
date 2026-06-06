import { ASTRONOMICAL_UNIT_KM, EARTH_DIAMETER_KM, SUN_DIAMETER_KM } from '../constants/astronomy';
import type { CelestialBody, ScaleMode, Vector3Tuple } from '../types/celestial';

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const getPlanetOrbitRadius = (body: CelestialBody, mode: ScaleMode): number => {
  if (body.type === 'star') {
    return 0;
  }

  if (body.type === 'moon') {
    return getMoonOrbitRadius(body, mode, 0);
  }

  const au = body.orbitRadiusKm / ASTRONOMICAL_UNIT_KM;
  return mode === 'educational' ? Math.pow(au, 0.62) * 8 : au * 18;
};

export const getBodyRadius = (body: CelestialBody, mode: ScaleMode): number => {
  if (body.type === 'star') {
    return mode === 'educational' ? 3.2 : (SUN_DIAMETER_KM / EARTH_DIAMETER_KM) * 0.08;
  }

  if (body.type === 'moon') {
    const base = mode === 'educational' ? 0.32 : 0.08;
    const min = mode === 'educational' ? 0.13 : 0.035;
    const max = mode === 'educational' ? 0.42 : 0.13;
    return clamp(Math.sqrt(body.diameterKm / EARTH_DIAMETER_KM) * base, min, max);
  }

  if (mode === 'realistic') {
    return clamp((body.diameterKm / EARTH_DIAMETER_KM) * 0.08, 0.045, 0.9);
  }

  return clamp(Math.sqrt(body.diameterKm / EARTH_DIAMETER_KM) * 0.45, 0.24, 1.55);
};

export const getMoonOrbitRadius = (
  moon: CelestialBody,
  mode: ScaleMode,
  parentRadius: number,
): number => {
  const base = mode === 'educational' ? 1.7 : 1.1;
  const minimumGap = mode === 'educational' ? 1.1 : 0.55;
  return parentRadius + minimumGap + Math.pow(moon.orbitRadiusKm / 384_400, 0.38) * base;
};

export const getOverviewCameraPosition = (mode: ScaleMode): Vector3Tuple =>
  mode === 'educational' ? [0, 54, 92] : [0, 260, 620];

export const getCameraDistanceForBody = (body: CelestialBody, mode: ScaleMode): number => {
  const radius = getBodyRadius(body, mode);
  if (body.type === 'star') {
    return radius * 5.2;
  }
  if (body.type === 'moon') {
    return Math.max(2.4, radius * 7);
  }
  return Math.max(4.2, radius * 6.2);
};
