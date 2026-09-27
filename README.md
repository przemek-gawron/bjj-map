# BJJ Map

Osobista mapa i dziennik treningowy do brazylijskiego jiu-jitsu. Notujesz techniki poznane na zajęciach, planujesz, co ćwiczyć w tygodniu, i widzisz, co i kiedy było trenowane. Aplikacja jest pisana z myślą o białych pasach — rośnie razem z Tobą, zamiast zasypywać Cię gotową encyklopedią.

Aplikacja mobilna (iOS / Android) w Expo, działa też w przeglądarce.

## Zakładki

| Zakładka | Co robi | Status |
|---|---|---|
| **Mapa** | Graf pozycji i technik: pozycje to kafelki z ilustracją (lub własnym zdjęciem), techniki to strzałki między nimi. Filtry po typie techniki i grupie pozycji, przesuwanie kafelków, przesuwanie i przybliżanie mapy, panel pozycji z technikami „z tej pozycji” i „jak tu trafić”. | ✅ |
| **Techniki** | Lista technik pogrupowana po pozycji startowej. Filtry po statusie i typie, dodawanie i edycja, link do wideo, „Trenowałem dziś”, historia treningów. | ✅ |
| **Plan** | Techniki wybrane na ten tydzień razem z wideo (lub wyszukiwaniem na YouTube), odhaczanie po treningu, postęp tygodnia, przeniesienie planu z poprzedniego tygodnia. | ✅ |
| **Dziennik** | Oś czasu treningów pogrupowana tygodniami: data, przećwiczone techniki, notatka. Liczniki tygodnia i miesiąca. | ✅ |

Każda technika ma status: **Widziałem → Ćwiczę → Działa w sparingu**.

### Planowane

- wykresy: ile razy i kiedy trenowana była technika
- przypomnienia o technikach, które nie są jeszcze opanowane
- synchronizacja i konto

## Uruchomienie

```bash
npm install
npx expo start
```

W menu, które się pojawi:

- `i` — symulator iOS (przez Expo Go)
- `a` — emulator Androida
- `w` — przeglądarka

Na telefonie: zeskanuj kod QR aplikacją Expo Go.

Przed commitem:

```bash
npx tsc --noEmit
npx expo lint
```

## Technologie

- [Expo](https://expo.dev) SDK 57, React Native, TypeScript, React Compiler
- [Expo Router](https://docs.expo.dev/router/introduction/) — nawigacja oparta na plikach, natywny dolny pasek (`NativeTabs`)
- [zustand](https://github.com/pmndrs/zustand) + AsyncStorage — stan zapisywany lokalnie na urządzeniu
- react-native-svg, react-native-gesture-handler, Reanimated — mapa (rysowanie, przeciąganie, pinch-zoom)
- expo-image-picker, expo-file-system — własne zdjęcia pozycji

## Struktura

```
src/
  app/                  ekrany (każdy plik to trasa)
    _layout.tsx         dolny pasek zakładek
    index.tsx           Mapa
    techniques/         lista, szczegóły ([id]), formularz (modal)
    plan/               plan tygodnia, wybór technik (modal)
    journal/            oś czasu, wpis treningu (modal)
  components/           wspólne komponenty (Screen, Chip, StatusChip, zakładki, PositionIllustration)
    map/                płótno mapy, geometria strzałek, panel pozycji
  data/
    types.ts            model: Position, Technique, Session, WeeklyPlan
    store.ts            store zustand z akcjami i zapisem
    seed.ts             startowa mapa białego pasa (11 pozycji, 21 technik)
    stats.ts            statystyki treningów wyliczane z dziennika
    dates.ts, labels.ts
```

### Model danych w skrócie

- **Pozycja** ma grupę (stójka, closed guard, open guard, half guard, side control, mount, plecy) i stronę (góra / dół).
- **Technika** prowadzi z jednej pozycji do drugiej; kończenie (submission) nie ma pozycji docelowej.
- **Trening** (sesja) to jeden dzień: lista przećwiczonych technik i notatka. To jedyne źródło prawdy o tym, co i kiedy było trenowane — liczniki, „ostatnio trenowane” i przyszłe statystyki są z niego wyliczane. Jeden dzień = jeden wpis.

## Prototyp

Wczesny prototyp ekranu głównego (4 warianty do porównania) leży na gałęzi `prototype/main-screen` razem z wnioskiem, które warianty weszły do aplikacji.
