# Opis w sklepach

App Store: teksty, słowa kluczowe, kategorie i ocena wieku są w [`store.config.json`](../store.config.json) i wysyła je `npx eas-cli@latest metadata:push` (po pierwszym buildzie wysłanym do App Store Connect). Google Play nie ma takiego narzędzia, więc poniżej są teksty do wklejenia w Play Console. Polityka prywatności: [`PRIVACY.md`](../PRIVACY.md).

## Google Play

| Pole | Limit | Polski | English |
|---|---|---|---|
| Nazwa | 30 | BJJ Map: mapa technik BJJ | BJJ Map: Jiu-Jitsu Journal |
| Krótki opis | 80 | Mapa pozycji i technik BJJ, plan tygodnia, drille i dziennik treningów. | Map your BJJ positions and techniques, plan the week, log every session. |
| Pełny opis | 4000 | jak `description` dla `pl` w `store.config.json` | as `description` for `en-US` in `store.config.json` |

- **Kategoria:** Sport
- **Tagi:** Sztuki walki, Fitness, Dziennik treningowy
- **E-mail kontaktowy:** wymagany przez Play Console, uzupełnij swój
- **Polityka prywatności:** https://github.com/przemek-gawron/bjj-map/blob/main/PRIVACY.md

### Bezpieczeństwo danych (Data safety)

- Czy aplikacja zbiera lub udostępnia dane użytkownika? **Nie**
- Dane są szyfrowane w trakcie przesyłania: nie dotyczy (aplikacja nie przesyła danych użytkownika)
- Użytkownik może poprosić o usunięcie danych: dane są tylko na urządzeniu, Ustawienia → „Usuń wszystkie dane”

### Ocena treści (ankieta IARC)

Kategoria: narzędzia / referencje. Brak przemocy, treści seksualnych, wulgaryzmów, hazardu, zakupów i interakcji między użytkownikami. Spodziewana ocena: PEGI 3 / Everyone.

## App Store — prywatność aplikacji

- Etykieta prywatności: **Data Not Collected** (aplikacja nie zbiera danych)
- Śledzenie (App Tracking Transparency): nie
- Szyfrowanie: `ITSAppUsesNonExemptEncryption = false` jest już w `app.json`

## Notatka dla recenzenta App Store

> BJJ Map is an offline personal training journal for Brazilian jiu-jitsu. No account or sign-in is needed, and all data is stored locally on the device. To see a filled-in app, open the gear icon on the Map tab → Data → "Load the sample library".

Dane kontaktowe recenzenta (imię, nazwisko, e-mail, telefon) wpisz w App Store Connect albo dodaj jako `apple.review` w `store.config.json`.

## Zrzuty ekranu

Do zrobienia przed publikacją: iPhone 6,9" (1320×2868) i Android telefon. Proponowana kolejność: Mapa („Moja gra”), panel pozycji z technikami, Plan tygodnia, Dziennik ze statystykami, ekran techniki z wideo.
