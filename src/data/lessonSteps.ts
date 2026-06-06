export interface LessonStep {
  id: string;
  title: string;
  body: string;
  task: string;
  bodyId?: string;
}

export const lessonSteps: LessonStep[] = [
  {
    id: 'sun-energy',
    title: 'Start w centrum',
    body: 'Słońce jest źródłem światła, ciepła i grawitacyjną kotwicą całego układu.',
    task: 'Sprawdź, jak planety krążą wokół niego w różnych odległościach.',
    bodyId: 'sun',
  },
  {
    id: 'inner-planets',
    title: 'Małe planety skaliste',
    body: 'Merkury, Wenus, Ziemia i Mars są zbudowane głównie ze skał i metali.',
    task: 'Zobacz Merkurego i porównaj jego rozmiar z Ziemią w panelu wiedzy.',
    bodyId: 'mercury',
  },
  {
    id: 'earth-home',
    title: 'Ziemia jako punkt odniesienia',
    body: 'Ziemia pomaga zrozumieć skalę: tu znamy grawitację, atmosferę i długość dnia.',
    task: 'Otwórz Ziemię i zwróć uwagę na chmury oraz wartości w panelu.',
    bodyId: 'earth',
  },
  {
    id: 'moon-orbit',
    title: 'Księżyc i orbity',
    body: 'Księżyce krążą wokół planet, dlatego ich orbity przesuwają się razem z planetą macierzystą.',
    task: 'Wybierz Księżyc i porównaj jego odległość orbitalną z rozmiarem Ziemi.',
    bodyId: 'moon',
  },
  {
    id: 'mars-clues',
    title: 'Mars i ślady wody',
    body: 'Mars jest zimny i suchy, ale jego powierzchnia pokazuje dawne doliny i kanały.',
    task: 'Odszukaj Marsa, a potem włącz śledzenie obiektu na kilka sekund.',
    bodyId: 'mars',
  },
  {
    id: 'gas-giant',
    title: 'Jowisz jako olbrzym',
    body: 'Jowisz ma największą masę spośród planet i silnie wpływa grawitacyjnie na okolicę.',
    task: 'Porównaj Jowisza z Wenus albo Ziemią w narzędziu porównania.',
    bodyId: 'jupiter',
  },
  {
    id: 'rings',
    title: 'Pierścienie Saturna',
    body: 'Pierścienie Saturna są rozległe, ale składają się z drobnych brył lodu i skał.',
    task: 'Przeskocz na Saturna i obejrzyj pierścienie pod innym kątem myszą.',
    bodyId: 'saturn',
  },
  {
    id: 'ice-moon',
    title: 'Lodowa Europa',
    body: 'Europa jest jednym z najciekawszych księżyców, bo pod lodem może kryć ocean.',
    task: 'Wybierz Europę i przeczytaj ciekawostkę w panelu wiedzy.',
    bodyId: 'europa',
  },
  {
    id: 'outer-system',
    title: 'Dalekie planety',
    body: 'Uran i Neptun są znacznie dalej od Słońca, dlatego w skali rzeczywistej odległości rosną bardzo mocno.',
    task: 'Przełącz skalę na rzeczywistą i przejdź do Neptuna.',
    bodyId: 'neptune',
  },
  {
    id: 'quiz-ready',
    title: 'Sprawdzenie wiedzy',
    body: 'Po przejściu trasy warto zrobić quiz: dziesięć pytań daje szybki wynik i powtórkę odpowiedzi.',
    task: 'Otwórz zakładkę Quiz i odpowiedz na komplet pytań.',
  },
];
