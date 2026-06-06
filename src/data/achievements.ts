import type { Achievement } from '../types/celestial';

export const achievements: Achievement[] = [
  {
    id: 'visit-all-planets',
    title: 'Planetarny odkrywca',
    description: 'Odwiedź wszystkie planety.',
    category: 'exploration',
    target: 8,
  },
  {
    id: 'visit-all-moons',
    title: 'Łowca księżyców',
    description: 'Obejrzyj wszystkie księżyce w symulatorze.',
    category: 'exploration',
    target: 7,
  },
  {
    id: 'ten-quiz-answers',
    title: 'Mistrz quizów',
    description: 'Rozwiąż 10 pytań quizowych.',
    category: 'quiz',
    target: 10,
  },
  {
    id: 'all-fun-facts',
    title: 'Kolekcjoner ciekawostek',
    description: 'Odkryj ciekawostkę przy każdym obiekcie.',
    category: 'knowledge',
    target: 16,
  },
];
