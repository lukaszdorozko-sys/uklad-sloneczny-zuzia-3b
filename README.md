# Interaktywny Symulator Układu Słonecznego 3D

Kompletny projekt React 19 + TypeScript + Vite z interaktywną sceną 3D Układu Słonecznego. Aplikacja jest przygotowana dla dzieci od około 10 roku życia, nauczycieli i osób zainteresowanych astronomią.

## Wersja online

https://uklad-sloneczny-zuzia-3b.netlify.app

## Funkcje

- Scena 3D w React Three Fiber i Three.js.
- Słońce, osiem planet oraz księżyce: Księżyc, Io, Europa, Ganimedes, Kallisto, Tytan i Tryton.
- Tryb skali edukacyjnej oraz rzeczywistej dla odległości planet.
- Sterowanie czasem: pauza, 1x, 10x, 100x, 1000x, 10000x.
- Obracanie, przesuwanie i przybliżanie kamery przez `OrbitControls`.
- Klikanie obiektów, podświetlenie, panel wiedzy i płynny przelot kamery.
- Śledzenie wybranego obiektu oraz powrót do widoku całego układu.
- Etykiety 3D z wysokim kontrastem.
- Wyszukiwarka, lista obiektów, minimapa, porównywarka, quiz i osiągnięcia.
- Tryb Lekcja z 10 krokami prowadzącymi przez najważniejsze obiekty.
- Presety jakości grafiki: niska, średnia i wysoka.
- Mobilne szuflady dla listy obiektów, panelu wiedzy i narzędzi nauki.
- Legenda skali oraz znak wodny autora: Zuzia D. klasa 3B.
- Dane astronomiczne i linki źródłowe oddzielone od komponentów.
- Hybrydowe tekstury: proceduralny fallback plus lokalne realistyczne mapy WebP wybranych obiektów, bump mapy, gwiazdy, poświata Słońca i pierścienie Saturna.
- Responsywny interfejs z obsługą klawiatury i stanami focus.

## Wymagania

- Node.js 20 lub nowszy
- npm 10 lub nowszy

## Uruchomienie krok po kroku

1. Otwórz terminal w folderze projektu.
2. Zainstaluj zależności:

```bash
npm install
```

3. Uruchom serwer developerski:

```bash
npm run dev
```

4. Otwórz adres pokazany w terminalu, zwykle:

```text
http://localhost:5173
```

## Budowanie wersji produkcyjnej

```bash
npm run build
```

Gotowe pliki produkcyjne znajdziesz w folderze `dist/`.

Podgląd wersji produkcyjnej:

```bash
npm run preview
```

## Testy

Testy automatyczne:

```bash
npm run test
```

Pełna weryfikacja, razem z typecheckiem, lintem, buildem produkcyjnym, lokalnym preview i UAT w przeglądarce:

```bash
npm run test:all
```

Końcowy UX audit wykonuje automatyczną kontrolę desktop/mobile, sprawdza widoczność sceny 3D, brak kolizji paneli, brak przelewającego się tekstu i zapisuje screenshoty do `ux-screenshots/`:

```bash
npm run test:ux
```

Sam UAT wymaga działającej aplikacji pod `http://127.0.0.1:4173` albo własnego adresu w `UAT_URL`:

```bash
UAT_URL=http://127.0.0.1:4173 npm run test:uat
```

## Struktura

```text
src/
├── assets/
├── components/
│   ├── ui/
│   ├── solar-system/
│   ├── labels/
│   ├── minimap/
│   ├── quiz/
│   └── comparison/
├── hooks/
├── stores/
├── pages/
├── scenes/
├── types/
├── data/
├── utils/
├── constants/
├── services/
└── styles/
```

## Dane i źródła

Dane są w `src/data/celestialBodies.ts`. Każdy obiekt ma parametry astronomiczne, opis edukacyjny, ciekawostkę i listę źródeł. Projekt odwołuje się do materiałów NASA, ESA i JPL:

- NASA Planetary Fact Sheet
- NASA Solar System Exploration
- JPL Solar System Dynamics
- ESA Space Science

## Tekstury

Lokalne tekstury WebP w `public/textures/real/` są ładowane leniwie dla najważniejszych obiektów: Słońca, Merkurego, Wenus, Ziemi, chmur Ziemi i Księżyca. Pozostałe obiekty korzystają z ulepszonych tekstur proceduralnych, więc scena startuje od razu i nie jest zależna od hotlinkowania zewnętrznych obrazów.

Źródła użytych map:

- Wikimedia Commons / Solar System Scope texture maps
- Three.js examples texture assets

## Najważniejsze pliki

- `src/scenes/SolarSystemScene.tsx` - scena 3D, światła, gwiazdy, obiekty i kamera.
- `src/components/solar-system/CelestialBodyMesh.tsx` - renderowanie ciał niebieskich, tekstur, rotacji i kliknięć.
- `src/components/solar-system/CameraRig.tsx` - płynny przelot kamery i śledzenie obiektów.
- `src/stores/useSolarStore.ts` - stan Zustand: czas, wybór, skala, quiz, osiągnięcia.
- `src/utils/orbits.ts` - obliczanie pozycji orbitalnych.
- `src/utils/textures.ts` - proceduralne tekstury i mapy wypukłości.
- `src/components/lesson/LessonPanel.tsx` - tryb lekcji krok po kroku.
- `src/components/ui/MobileDrawerControls.tsx` - mobilne szuflady paneli.
- `src/components/comparison/ComparisonPanel.tsx` - tabela i wykresy porównawcze.
- `src/components/quiz/QuizPanel.tsx` - losowanie pytań, punkty i poprawne odpowiedzi.

## Notatka o skali

Rzeczywiste odległości i średnice w kosmosie są zbyt ekstremalne, aby jednocześnie wygodnie oglądać Słońce, planety i księżyce. Dlatego dane liczbowe pozostają rzeczywiste, a scena stosuje dwa tryby wizualizacji:

- `Skala edukacyjna` kompresuje odległości, aby łatwo porównywać obiekty.
- `Skala rzeczywista` zachowuje mocniejsze relacje odległości planet od Słońca, ale nadal powiększa najmniejsze obiekty i księżyce, żeby dało się je kliknąć i zobaczyć.
