import { Trophy } from 'lucide-react';
import { achievements } from '../../data/achievements';
import { celestialBodies, moons, planets } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';

const progressForAchievement = (
  id: string,
  visited: string[],
  funFacts: string[],
  quizAnswered: number,
): number => {
  if (id === 'visit-all-planets') {
    return planets.filter((planet) => visited.includes(planet.id)).length;
  }
  if (id === 'visit-all-moons') {
    return moons.filter((moon) => visited.includes(moon.id)).length;
  }
  if (id === 'all-fun-facts') {
    return celestialBodies.filter((body) => funFacts.includes(body.id)).length;
  }
  if (id === 'ten-quiz-answers') {
    return Math.min(10, quizAnswered);
  }
  return 0;
};

export function AchievementsPanel() {
  const visitedBodyIds = useSolarStore((state) => state.visitedBodyIds);
  const discoveredFunFactIds = useSolarStore((state) => state.discoveredFunFactIds);
  const quizAnswered = useSolarStore((state) => state.quizAnswered);
  const unlockedAchievementIds = useSolarStore((state) => state.unlockedAchievementIds);

  return (
    <section className="dock-panel" aria-label="System osiągnięć">
      <div className="dock-panel-header">
        <div className="section-heading">
          <Trophy aria-hidden="true" size={16} />
          <h2>Osiągnięcia</h2>
        </div>
        <strong>{unlockedAchievementIds.length}/{achievements.length}</strong>
      </div>

      <div className="achievements-grid">
        {achievements.map((achievement) => {
          const progress = progressForAchievement(
            achievement.id,
            visitedBodyIds,
            discoveredFunFactIds,
            quizAnswered,
          );
          const unlocked = unlockedAchievementIds.includes(achievement.id);
          const percent = Math.min(100, (progress / achievement.target) * 100);

          return (
            <article key={achievement.id} className={unlocked ? 'is-unlocked' : ''}>
              <div>
                <Trophy aria-hidden="true" size={18} />
                <h3>{achievement.title}</h3>
              </div>
              <p>{achievement.description}</p>
              <div className="achievement-progress">
                <span style={{ width: `${percent}%` }} />
              </div>
              <strong>{progress}/{achievement.target}</strong>
            </article>
          );
        })}
      </div>
    </section>
  );
}
