import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { achievements } from '../data/achievements';
import { celestialBodies, moons, planets } from '../data/celestialBodies';
import type { MobileDrawer, QualityPreset, ScaleMode, TimeSpeed, Vector3Tuple } from '../types/celestial';

interface SolarState {
  selectedBodyId: string;
  hoveredBodyId: string;
  followBodyId: string;
  scaleMode: ScaleMode;
  qualityPreset: QualityPreset;
  mobileDrawer: MobileDrawer;
  timeSpeed: TimeSpeed;
  simulatedDays: number;
  comparisonIds: [string, string];
  visitedBodyIds: string[];
  discoveredFunFactIds: string[];
  quizAnswered: number;
  quizCorrect: number;
  unlockedAchievementIds: string[];
  resetCameraRequest: number;
  cameraPosition: Vector3Tuple;
  selectBody: (id: string) => void;
  clearSelection: () => void;
  setHoveredBody: (id: string) => void;
  setScaleMode: (mode: ScaleMode) => void;
  setQualityPreset: (preset: QualityPreset) => void;
  setMobileDrawer: (drawer: MobileDrawer) => void;
  setTimeSpeed: (speed: TimeSpeed) => void;
  setFollowBody: (id: string) => void;
  stopFollowing: () => void;
  goToOverview: () => void;
  advanceTime: (days: number) => void;
  setComparisonId: (slot: 0 | 1, id: string) => void;
  markFunFactDiscovered: (id: string) => void;
  recordQuizAnswer: (correct: boolean) => void;
  setCameraPosition: (position: Vector3Tuple) => void;
}

const uniquePush = (items: string[], value: string): string[] =>
  items.includes(value) ? items : [...items, value];

const getUnlockedAchievements = (state: Pick<SolarState, 'visitedBodyIds' | 'discoveredFunFactIds' | 'quizAnswered'>) => {
  const unlocked = new Set<string>();

  if (planets.every((planet) => state.visitedBodyIds.includes(planet.id))) {
    unlocked.add('visit-all-planets');
  }
  if (moons.every((moon) => state.visitedBodyIds.includes(moon.id))) {
    unlocked.add('visit-all-moons');
  }
  if (state.quizAnswered >= 10) {
    unlocked.add('ten-quiz-answers');
  }
  if (celestialBodies.every((body) => state.discoveredFunFactIds.includes(body.id))) {
    unlocked.add('all-fun-facts');
  }

  return achievements.filter((achievement) => unlocked.has(achievement.id)).map((achievement) => achievement.id);
};

export const useSolarStore = create<SolarState>()(
  persist(
    (set) => ({
      selectedBodyId: 'earth',
      hoveredBodyId: '',
      followBodyId: '',
      scaleMode: 'educational',
      qualityPreset: 'medium',
      mobileDrawer: 'none',
      timeSpeed: 100,
      simulatedDays: 0,
      comparisonIds: ['earth', 'mars'],
      visitedBodyIds: ['earth'],
      discoveredFunFactIds: [],
      quizAnswered: 0,
      quizCorrect: 0,
      unlockedAchievementIds: [],
      resetCameraRequest: 0,
      cameraPosition: [0, 36, 72],
      selectBody: (id) =>
        set((state) => {
          const visitedBodyIds = uniquePush(state.visitedBodyIds, id);
          const nextState = { ...state, visitedBodyIds };
          return {
            selectedBodyId: id,
            followBodyId: state.followBodyId ? id : '',
            mobileDrawer: 'info',
            visitedBodyIds,
            unlockedAchievementIds: getUnlockedAchievements(nextState),
          };
        }),
      clearSelection: () => set({ selectedBodyId: '', followBodyId: '', mobileDrawer: 'none' }),
      setHoveredBody: (id) => set({ hoveredBodyId: id }),
      setScaleMode: (mode) => set({ scaleMode: mode, resetCameraRequest: Date.now() }),
      setQualityPreset: (preset) => set({ qualityPreset: preset }),
      setMobileDrawer: (drawer) => set({ mobileDrawer: drawer }),
      setTimeSpeed: (speed) => set({ timeSpeed: speed }),
      setFollowBody: (id) => set({ followBodyId: id, selectedBodyId: id, mobileDrawer: 'info' }),
      stopFollowing: () => set({ followBodyId: '' }),
      goToOverview: () =>
        set((state) => ({
          selectedBodyId: '',
          followBodyId: '',
          mobileDrawer: 'none',
          resetCameraRequest: state.resetCameraRequest + 1,
        })),
      advanceTime: (days) => set((state) => ({ simulatedDays: state.simulatedDays + days })),
      setComparisonId: (slot, id) =>
        set((state) => {
          const next: [string, string] = [...state.comparisonIds];
          next[slot] = id;
          return { comparisonIds: next };
        }),
      markFunFactDiscovered: (id) =>
        set((state) => {
          const discoveredFunFactIds = uniquePush(state.discoveredFunFactIds, id);
          const nextState = { ...state, discoveredFunFactIds };
          return {
            discoveredFunFactIds,
            unlockedAchievementIds: getUnlockedAchievements(nextState),
          };
        }),
      recordQuizAnswer: (correct) =>
        set((state) => {
          const nextState = {
            ...state,
            quizAnswered: state.quizAnswered + 1,
            quizCorrect: correct ? state.quizCorrect + 1 : state.quizCorrect,
          };
          return {
            quizAnswered: nextState.quizAnswered,
            quizCorrect: nextState.quizCorrect,
            unlockedAchievementIds: getUnlockedAchievements(nextState),
          };
        }),
      setCameraPosition: (position) => set({ cameraPosition: position }),
    }),
    {
      name: 'interactive-solar-system-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        scaleMode: state.scaleMode,
        qualityPreset: state.qualityPreset,
        comparisonIds: state.comparisonIds,
        visitedBodyIds: state.visitedBodyIds,
        discoveredFunFactIds: state.discoveredFunFactIds,
        quizAnswered: state.quizAnswered,
        quizCorrect: state.quizCorrect,
        unlockedAchievementIds: state.unlockedAchievementIds,
      }),
    },
  ),
);
