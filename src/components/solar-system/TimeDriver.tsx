import { useFrame } from '@react-three/fiber';
import { BASE_DAYS_PER_SECOND } from '../../constants/astronomy';
import { useSolarStore } from '../../stores/useSolarStore';

export function TimeDriver() {
  useFrame((_, delta) => {
    const { timeSpeed, advanceTime } = useSolarStore.getState();
    if (timeSpeed > 0) {
      advanceTime(delta * BASE_DAYS_PER_SECOND * timeSpeed);
    }
  });

  return null;
}
