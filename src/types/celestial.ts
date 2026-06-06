export type BodyType = 'star' | 'planet' | 'moon';

export type ScaleMode = 'educational' | 'realistic';

export type QualityPreset = 'low' | 'medium' | 'high';

export type MobileDrawer = 'none' | 'objects' | 'learn' | 'info';

export type TimeSpeed = 0 | 1 | 10 | 100 | 1000 | 10000;

export type Vector3Tuple = [number, number, number];

export interface DataSource {
  label: string;
  url: string;
}

export interface TextureProfile {
  base: string[];
  accent: string[];
  bands?: boolean;
  craters?: boolean;
  storms?: boolean;
  ice?: boolean;
  seed: number;
}

export interface RingProfile {
  innerRadiusMultiplier: number;
  outerRadiusMultiplier: number;
  color: string;
  opacity: number;
}

export interface CelestialBody {
  id: string;
  name: string;
  type: BodyType;
  parentId?: string;
  diameterKm: number;
  massKg: number;
  averageTemperatureC: number;
  moonCount: number | null;
  gravityMs2: number;
  distanceFromSunKm: number | null;
  orbitRadiusKm: number;
  orbitalPeriodDays: number;
  rotationPeriodHours: number;
  dayLengthHours: number | null;
  yearLengthDays: number | null;
  axialTiltDeg: number;
  orbitalVelocityKms: number;
  atmosphere: string[];
  shortDescription: string;
  funFact: string;
  sources: DataSource[];
  texture: TextureProfile;
  themeColor: string;
  rings?: RingProfile;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  relatedBodyId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'exploration' | 'quiz' | 'knowledge';
  target: number;
}
