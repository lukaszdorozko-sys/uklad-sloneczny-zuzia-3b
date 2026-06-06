require('./register-ts.cjs');

const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const { bodyById, moons, planets } = require('../src/data/celestialBodies.ts');
const { getBodyPosition, getFocusCameraPosition } = require('../src/utils/orbits.ts');
const {
  getBodyRadius,
  getCameraDistanceForBody,
  getMoonOrbitRadius,
  getOverviewCameraPosition,
  getPlanetOrbitRadius,
} = require('../src/utils/scale.ts');

const distance3 = (a, b = [0, 0, 0]) =>
  Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('scale model', () => {
  it('keeps the Sun centered and larger than planets in educational mode', () => {
    assert.deepEqual(getBodyPosition(bodyById.sun, 100, 'educational'), [0, 0, 0]);
    assert.ok(getBodyRadius(bodyById.sun, 'educational') > getBodyRadius(bodyById.jupiter, 'educational'));
  });

  it('orders planet orbital radii by distance from the Sun in both modes', () => {
    for (const mode of ['educational', 'realistic']) {
      const radii = planets.map((planet) => getPlanetOrbitRadius(planet, mode));
      for (let index = 1; index < radii.length; index += 1) {
        assert.ok(radii[index] > radii[index - 1], `${mode} orbit ${index} should be larger than previous`);
      }
    }
  });

  it('makes realistic mode more spread out than educational mode', () => {
    assert.ok(getPlanetOrbitRadius(bodyById.neptune, 'realistic') > getPlanetOrbitRadius(bodyById.neptune, 'educational'));
    assert.ok(getOverviewCameraPosition('realistic')[2] > getOverviewCameraPosition('educational')[2]);
  });

  it('keeps moons outside their parent surface', () => {
    for (const moon of moons) {
      const parent = bodyById[moon.parentId];
      for (const mode of ['educational', 'realistic']) {
        const orbitRadius = getMoonOrbitRadius(moon, mode, getBodyRadius(parent, mode));
        assert.ok(orbitRadius > getBodyRadius(parent, mode), `${moon.id} should orbit outside ${parent.id}`);
      }
    }
  });
});

describe('orbit positions', () => {
  it('places each planet approximately on its scaled orbital radius', () => {
    for (const mode of ['educational', 'realistic']) {
      for (const planet of planets) {
        const position = getBodyPosition(planet, planet.orbitalPeriodDays / 3, mode);
        const expected = getPlanetOrbitRadius(planet, mode);
        assert.ok(Math.abs(distance3(position) - expected) < expected * 0.02 + 0.001);
      }
    }
  });

  it('moves planets after simulated time advances', () => {
    const start = getBodyPosition(bodyById.earth, 0, 'educational');
    const later = getBodyPosition(bodyById.earth, 10, 'educational');
    assert.ok(distance3(start, later) > 0.1);
  });

  it('positions moons near their parent body', () => {
    const days = 42;
    for (const moon of moons) {
      const parent = bodyById[moon.parentId];
      const moonPosition = getBodyPosition(moon, days, 'educational');
      const parentPosition = getBodyPosition(parent, days, 'educational');
      const parentRadius = getBodyRadius(parent, 'educational');
      const expectedOrbit = getMoonOrbitRadius(moon, 'educational', parentRadius);
      assert.ok(Math.abs(distance3(moonPosition, parentPosition) - expectedOrbit) < expectedOrbit * 0.04 + 0.001);
    }
  });

  it('creates focus camera positions with positive distance from target', () => {
    for (const body of [bodyById.sun, bodyById.earth, bodyById.moon, bodyById.saturn]) {
      const target = getBodyPosition(body, 12, 'educational');
      const camera = getFocusCameraPosition(body, 12, 'educational');
      assert.ok(distance3(camera, target) >= getCameraDistanceForBody(body, 'educational') * 0.6);
    }
  });
});
