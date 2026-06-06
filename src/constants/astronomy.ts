export const ASTRONOMICAL_UNIT_KM = 149_597_870.7;
export const EARTH_DIAMETER_KM = 12_742;
export const SUN_DIAMETER_KM = 1_392_700;
export const BASE_DAYS_PER_SECOND = 0.08;

export const TIME_SPEEDS = [0, 1, 10, 100, 1000, 10000] as const;

export const SOURCE_REFERENCES = {
  nasaFactSheet: {
    label: 'NASA Planetary Fact Sheet',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/',
  },
  nasaSolarSystem: {
    label: 'NASA Solar System Exploration',
    url: 'https://science.nasa.gov/solar-system/',
  },
  jplHorizons: {
    label: 'JPL Solar System Dynamics',
    url: 'https://ssd.jpl.nasa.gov/',
  },
  esaScience: {
    label: 'ESA Space Science',
    url: 'https://www.esa.int/Science_Exploration/Space_Science',
  },
} as const;
