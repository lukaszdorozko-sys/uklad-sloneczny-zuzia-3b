import { useEffect } from 'react';
import { TIME_SPEEDS } from '../constants/astronomy';
import { useSolarStore } from '../stores/useSolarStore';
import type { TimeSpeed } from '../types/celestial';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.tagName === 'TEXTAREA') {
        return;
      }

      const store = useSolarStore.getState();

      if (event.key === ' ') {
        event.preventDefault();
        store.setTimeSpeed(store.timeSpeed === 0 ? 100 : 0);
      }

      if (event.key === 'Escape') {
        store.clearSelection();
      }

      if (event.key.toLowerCase() === 'f' && store.selectedBodyId) {
        store.setFollowBody(store.selectedBodyId);
      }

      if (event.key.toLowerCase() === 'r') {
        store.goToOverview();
      }

      if (event.key === '+' || event.key === '=') {
        const currentIndex = TIME_SPEEDS.indexOf(store.timeSpeed);
        const nextSpeed = TIME_SPEEDS[Math.min(TIME_SPEEDS.length - 1, currentIndex + 1)] as TimeSpeed;
        store.setTimeSpeed(nextSpeed);
      }

      if (event.key === '-' || event.key === '_') {
        const currentIndex = TIME_SPEEDS.indexOf(store.timeSpeed);
        const nextSpeed = TIME_SPEEDS[Math.max(0, currentIndex - 1)] as TimeSpeed;
        store.setTimeSpeed(nextSpeed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
