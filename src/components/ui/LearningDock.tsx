import { lazy, Suspense, useState } from 'react';
import { BarChart3, Brain, GraduationCap, Trophy } from 'lucide-react';

const ComparisonPanel = lazy(() =>
  import('../comparison/ComparisonPanel').then((module) => ({ default: module.ComparisonPanel })),
);
const QuizPanel = lazy(() => import('../quiz/QuizPanel').then((module) => ({ default: module.QuizPanel })));
const LessonPanel = lazy(() => import('../lesson/LessonPanel').then((module) => ({ default: module.LessonPanel })));
const AchievementsPanel = lazy(() =>
  import('./AchievementsPanel').then((module) => ({ default: module.AchievementsPanel })),
);

const tabs = [
  { id: 'comparison', label: 'Porównanie', icon: BarChart3 },
  { id: 'lesson', label: 'Lekcja', icon: GraduationCap },
  { id: 'quiz', label: 'Quiz', icon: Brain },
  { id: 'achievements', label: 'Osiągnięcia', icon: Trophy },
] as const;

type DockTab = (typeof tabs)[number]['id'];

export function LearningDock() {
  const [activeTab, setActiveTab] = useState<DockTab>('comparison');

  return (
    <aside className="learning-dock" aria-label="Panel nauki">
      <div className="dock-tabs" role="tablist" aria-label="Narzędzia edukacyjne">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              key={tab.id}
              className={activeTab === tab.id ? 'is-active' : ''}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <Icon aria-hidden="true" size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <Suspense fallback={<div className="dock-loading">Ładowanie...</div>}>
        {activeTab === 'comparison' ? <ComparisonPanel /> : null}
        {activeTab === 'lesson' ? <LessonPanel /> : null}
        {activeTab === 'quiz' ? <QuizPanel /> : null}
        {activeTab === 'achievements' ? <AchievementsPanel /> : null}
      </Suspense>
    </aside>
  );
}
