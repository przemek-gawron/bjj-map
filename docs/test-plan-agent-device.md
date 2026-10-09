# Plan testów BJJ Map z agent-device (iOS + Android)

Cel: przejść agentem (agent-device) wszystkie ekrany i przepływy aplikacji na iOS i Androidzie, znaleźć błędy, każdy naprawić od razu i każdą poprawkę natychmiast wypchnąć na `main`. Przy okazji zbudować mały zestaw nagranych przepływów (`.ad`), który potem działa jako test regresji.

Zakres: tylko iOS i Android (web poza zakresem). Wersja: `main`, Expo SDK 57, `bjj-map` store w wersji 5.

---

## 1. Zasady pracy (obowiązkowe)

### 1.1 Każdy fix = osobny commit, od razu wypchnięty na `main`

Żadnego zbierania poprawek w paczki, żadnych gałęzi. Pętla dla każdego znalezionego błędu:

1. **Odtwórz** błąd agent-device na platformie, na której wystąpił. Zapisz dowód: `agent-device screenshot e2e/artifacts/<ID>-before.png` i kroki (ID scenariusza z sekcji 5).
2. **Sprawdź drugą platformę**: czy błąd jest też tam (zapisz to w tabeli błędów).
3. **Napraw** w kodzie: minimalna zmiana, jedna przyczyna. Bez refaktoru „przy okazji”.
4. **Typecheck i lint**: `npx tsc --noEmit` i `npx expo lint` muszą przejść.
5. **Zweryfikuj na obu platformach**: `agent-device metro reload` (zmiana JS) albo przebudowa (zmiana w `app.json`/natywna), potem powtórz kroki scenariusza i nazwane oczekiwanie (`wait text`, `is`, `get`, `find`), nie tylko zrzut ekranu. Zapisz `e2e/artifacts/<ID>-after.png`.
6. **Smoke**: uruchom przepływ dymny (sekcja 8), jeśli fix dotyka store'a, nawigacji albo wspólnego komponentu.
7. **Commit**: `git status` → dodaj tylko pliki tego fixa (`git add <pliki>`, nigdy `git add -A`) → commit.
8. **Push od razu**: `git push origin main`. Jeśli odrzucony: `git pull --rebase origin main`, ponownie typecheck i lint, push.
9. **Odnotuj** w tabeli „Znalezione błędy” (sekcja 11) hash commita.

### 1.2 Wiadomość commita (styl jak w historii repo)

- Tytuł: jedno zdanie po angielsku, w trybie rozkazującym, opisuje efekt dla użytkownika, bez prefiksów `fix:`. Np. `Keep the keyboard from covering a technique's notes`.
- Treść (zawijana ~72 znaki): co było nie tak z perspektywy użytkownika, co się teraz dzieje i dlaczego. Opcjonalnie platforma („on Android only”).
- Bez łączenia niepowiązanych zmian. Zmiany w dokumentacji (ten plik, README) to osobne commity.

### 1.3 Czego nie commitować

- `ios/`, `android/` (generowane przez CNG — patrz 2.1), `e2e/artifacts/` (zrzuty, logi, nagrania).
- Zmian tymczasowych do testów (np. podmienione dane, logi debug).

### 1.4 Reguły kodu przy poprawkach

- Każdy nowy lub zmieniony tekst w `src/i18n/pl.ts` **i** `src/i18n/en.ts`.
- Kolory tylko z motywu (`useTheme`, `useStatusColors`), nie na sztywno.
- Zmiany natywne tylko przez `app.json`/pluginy, nigdy w `ios/`/`android/`.
- Przed użyciem API Expo sprawdzić dokumentację SDK 57 (AGENTS.md).

---

## 2. Przygotowanie (jednorazowe)

### 2.1 Znane blokery z przeglądu kodu — pierwsze commity

| # | Problem | Fix | Commit |
|---|---|---|---|
| P1 | `.gitignore` nie zawiera `/ios` ani `/android`; `expo run:*` je wygeneruje i łatwo je przypadkiem zacommitować. | Dopisać `/ios`, `/android` i `e2e/artifacts/` do `.gitignore`. | `Ignore generated native projects and test artifacts` → push |
| P2 | `app.json` nie ma `android.package`; `npx expo run:android` zatrzyma się na pytaniu o identyfikator. | Dodać `"package": "com.przemekgawrondev.bjjmap"` (spójnie z iOS; potwierdzone przez właściciela). | `Set the Android package name` → push |

### 2.2 Środowisko

1. `npm install`, `npx expo-doctor`, `npx tsc --noEmit`, `npx expo lint` — punkt wyjścia musi być zielony. Każdy problem tutaj = osobny fix → commit → push.
2. Urządzenia: symulator **iPhone 16e (iOS 26.2)** (już uruchomiony), emulator **Pixel_9** (zapasowo `Medium_Phone_API_36.1`). Dodatkowo, jeśli jest czas: mały ekran (iPhone SE 3. gen.) do sprawdzenia układu.
3. Buildy deweloperskie (NativeTabs, `@expo/ui`, `expo-glass-effect` — Expo Go może nie wystarczyć):
   - `npx expo run:ios --device "iPhone 16e"`
   - `npx expo run:android`
   - Kolejne sesje: `npx expo start --dev-client` (Metro w osobnym terminalu, nie zamykać).
4. Sesje agent-device — osobna nazwana sesja na platformę, żeby działać równolegle:
   - `agent-device open com.przemekgawrondev.bjjmap --platform ios --session ios --foreground`
   - `agent-device open com.przemekgawrondev.bjjmap --platform android --session android --foreground`
   - Na start każdej sesji: `agent-device logs start` (logi aplikacji do diagnozy).
5. Zdjęcia testowe do galerii (do zdjęć pozycji):
   - iOS: `xcrun simctl addmedia booted <plik.jpg>`
   - Android: `adb push <plik.jpg> /sdcard/Pictures/` i `adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Pictures/<plik.jpg>`
6. Katalog `e2e/artifacts/` na zrzuty i logi (ignorowany), `e2e/flows/` na nagrane przepływy `.ad` (commitowane).

### 2.3 Ściąga agent-device dla tej aplikacji

| Potrzeba | Polecenie |
|---|---|
| Świeży start aplikacji | `agent-device open <app> --relaunch` |
| Wyczyszczenie danych aplikacji (stan „pierwsze uruchomienie”) | `agent-device settings clear-app-state <app>` i `open --relaunch` |
| Akcja + różnica UI | `press @eN --settle`, `fill @eN "tekst" --settle`, `scroll down --until 'label="…"'` |
| Weryfikacja | `wait text "…"`, `wait absent 'label="…"'`, `is`, `get`, `find` |
| Okna `confirm()` (Alert) | `agent-device alert get`, potem `press` przycisku po etykiecie (np. `label="Usuń"`) albo `alert dismiss` dla „Anuluj” |
| Usuwanie przesunięciem (SwipeToDelete) | `agent-device swipe <x1> <y> <x2> <y>` od prawej do lewej po wierszu (współrzędne z `snapshot -i --json`), potem `press` przycisku „Usuń”/„Usuń z planu” |
| Pinch / pan mapy | `agent-device gesture pinch 1.8 <x> <y>`, `gesture pan <x> <y> <dx> <dy> 500` |
| Przeciągnięcie kafelka | `agent-device gesture pan <środek kafelka> <dx> <dy> 700` |
| Długie przytrzymanie | `agent-device longpress @eN 800` |
| Motyw systemu | `agent-device settings appearance dark|light` |
| Duży tekst | `agent-device settings text-size accessibility-large` (+ `open --relaunch`) |
| Uprawnienia zdjęć | `agent-device settings permission deny|grant|reset photos` |
| Przeładowanie JS po fixie | `agent-device metro reload` |
| Czerwony/żółty ekran RN | `agent-device react-native dismiss-overlay` (najpierw `screenshot --overlay-refs` jako dowód) |
| Nagranie przepływu | `open … --save-script e2e/flows/<nazwa>.ad` … `close` |
| Odtworzenie zestawu | `agent-device test 'e2e/flows/*.ad' --platform ios` (i `android`) |

### 2.4 Podróże w czasie (plan tygodnia, „dziś”, granica tygodnia)

Plan i statystyki zależą od daty urządzenia (`toDateKey`, `weekStartOf` — tydzień od poniedziałku).

- **Sesje z przeszłości**: przez UI, w Dzienniku → wpis → kalendarz (dowolny dzień w przeszłości). Nie potrzeba zmiany zegara.
- **Plan z zeszłego tygodnia (Android)**: Ustawienia systemu → System → Data i czas → wyłącz „Ustaw automatycznie” → ustaw datę +7 dni (agent-device steruje aplikacją Ustawienia). **Po teście przywrócić automatyczny czas.**
- **Plan z zeszłego tygodnia (iOS)**: symulator bierze czas z Maca, więc zamiast zmiany zegara edytujemy dane: zamknąć aplikację, `xcrun simctl get_app_container booted com.przemekgawrondev.bjjmap data`, znaleźć `manifest.json` w `Library/Application Support/…/RCTAsyncLocalStorage_V1/` (duże wartości leżą w osobnych plikach obok), w kluczu `bjj-map` cofnąć `plan.weekStart` o 7 dni, `open --relaunch`. Kopię pliku zrobić przed edycją.
- **Północ**: Android, ustawić zegar na 23:58, zostawić aplikację otwartą na ekranie Planu i technice, poczekać po północy.

---

## 3. Stany danych testowych

| Stan | Jak uzyskać | Zawartość |
|---|---|---|
| **S0 Pierwsze uruchomienie** | `settings clear-app-state` + `open --relaunch` | Domyślny język systemu, ciemny motyw, mapa startowa: 11 pozycji, 21 technik, 12 drilli, wszystkie techniki „Widziałem”, brak sesji, pusty plan. |
| **S1 Po resecie** | Ustawienia → „Usuń wszystkie dane” | Jak S0, ale ustawienia (język, motyw) zostają. |
| **S2 Biblioteka** | S1 + Ustawienia → Przykładowa biblioteka | ~20 pozycji, ~78 technik, ~22 drille z opisami. |
| **S3 Historia** | S2 + ~10 wpisów w dzienniku z ostatnich 6 tygodni (różne długości, techniki, drille, notatki), 3 techniki „Ćwiczę”, 2 „Działa w sparingu”, plan na ten tydzień (3 techniki + 2 drille) | Do testów statystyk, planu i mapy „Moja gra”. |
| **S4 Duże dane** | S3 + 60 wpisów rozłożonych na rok (opcjonalnie nagrany przepływ `.ad` w pętli) | Wydajność dziennika, mapy roku i statystyk. |

Każdy scenariusz poniżej mówi, od jakiego stanu startuje.

---

## 4. Macierz konfiguracji

| Konfiguracja | iOS | Android |
|---|---|---|
| **K1** PL, ciemny (domyślny) | pełny przebieg sekcji 5 | pełny przebieg sekcji 5 |
| **K2** EN, jasny | przebieg skrócony: każdy ekran, teksty, kontrast, układ | to samo |
| **K3** Systemowy język i motyw | przełączenie `settings appearance` w trakcie działania, język systemu PL↔EN | to samo |
| **K4** Duży tekst (`accessibility-large`) | mapa, listy, formularze, pasek zakładek | to samo |
| **K5** Mały ekran (iPhone SE / emulator 360×640) | opcjonalnie | opcjonalnie |

---

## 5. Scenariusze

Format: **ID — tytuł** (stan startowy). Kroki → oczekiwany wynik. Każdy scenariusz robimy na iOS i Androidzie; rozbieżności między platformami to też błąd.

### 5.1 Pierwsze uruchomienie i ustawienia (`settings`)

- **SET-01 — Pierwszy start** (S0). Splash znika w < 3 s, otwiera się Mapa w zakresie „Moja gra (0)” z pustą kartą i przyciskiem „Pokaż całą mapę”. Pasek zakładek: Mapa, Techniki, Plan, Dziennik — etykiety w języku systemu.
- **SET-02 — Zębatka** (S0). Mapa → zębatka → ekran Ustawień z tytułem w nagłówku; wstecz (iOS: przycisk/gest, Android: przycisk systemowy) wraca na mapę.
- **SET-03 — Motyw** (S1). Ciemny → Jasny → Systemowy. Zmienia się tło, nagłówki, pasek statusu, pasek zakładek, okna Alert. W „Systemowy”: `settings appearance light`/`dark` przełącza aplikację bez restartu. Wybór przetrwa `open --relaunch`.
- **SET-04 — Język** (S1). PL → English → Systemowy. Zmieniają się wszystkie ekrany, etykiety zakładek (także dla czytnika ekranu), nazwy startowej mapy (np. pozycje), formaty dat w Dzienniku. Wybór przetrwa restart.
- **SET-05 — Własna nazwa a zmiana języka** (S1). Zmień nazwę startowej pozycji (MAP-11) i startowej techniki → przełącz język → przemianowane zostają, pozostałe się tłumaczą.
- **SET-06 — Biblioteka** (S1). „Przykładowa biblioteka” → okno potwierdzenia (przycisk nie czerwony) → „Anuluj” nic nie zmienia; ponownie → potwierdź → komunikat z liczbą dodanych pozycji, technik i drilli. Drugi raz → „wszystko już jest”, nic się nie dubluje (liczniki na Mapie i w Technikach bez zmian).
- **SET-07 — Biblioteka a własny układ mapy** (S1). Przeciągnij 2 kafelki (MAP-06), wczytaj bibliotekę. **Do sprawdzenia:** `loadLibrary` przelicza układ wszystkich pozycji (`tidyLayout`), więc własny układ znika. Jeśli okno potwierdzenia o tym nie mówi — błąd (ostrzec w treści albo zachować ręczne położenia).
- **SET-08 — Biblioteka w drugim języku** (S1, EN). Wczytaj bibliotekę po angielsku, przełącz na PL — nazwy z biblioteki zostają po angielsku? Ustalić, czy to oczekiwane (zapisać decyzję w tabeli).
- **SET-09 — Usuń wszystkie dane** (S3 + zdjęcie pozycji). Potwierdzenie czerwonym przyciskiem → powrót na Mapę w stanie S1: brak sesji, pusty plan, zdjęcie zniknęło (także plik — sprawdzić katalog dokumentów w kontenerze iOS albo `run-as` na Androidzie). Język i motyw zostają. „Anuluj” nic nie zmienia.
- **SET-10 — O aplikacji** (S0). Wersja `1.0.0`, sekcja konta („brak konta”), teksty w obu językach.

### 5.2 Mapa (`(tabs)/index`, `map-canvas`, `position-sheet`)

- **MAP-01 — Pusta „Moja gra”** (S1). Karta z tytułem, tekstem i przyciskiem → przycisk przełącza na „Wszystko (21)”.
- **MAP-02 — Widok startowy „Wszystko”** (S1). Kafelki nie nachodzą na siebie, nazwy czytelne, strzałki przerywane (status „Widziałem”), podpowiedź „wybierz kafelek” na dole po lewej, nie zasłania przycisków zoomu.
- **MAP-03 — Pan, pinch, podwójne stuknięcie** (S2). `gesture pan` przesuwa mapę; `gesture pinch` w granicach 0,3–2,5×; podwójne stuknięcie przybliża 2× wokół punktu, przy maksymalnym przybliżeniu oddala. Mapa nie „ucieka” poza zasięg na stałe — przycisk ⤢ (dopasuj) zawsze ją przywraca.
- **MAP-04 — Przyciski + / − / ⤢ / ▦** (S2). Działają, mają etykiety dla czytnika (`snapshot -i` pokazuje „Przybliż”, „Oddal”…). ▦ („uporządkuj”) jest tylko w „Wszystko”, pyta o potwierdzenie, „Anuluj” nic nie zmienia.
- **MAP-05 — Wybór kafelka** (S2). Stuknięcie → panel pozycji (pół wysokości), kamera centruje pozycję z sąsiadami nad panelem, aktywne strzałki z etykietami, reszta przygaszona. Ponowne stuknięcie tego samego kafelka zamyka panel. Stuknięcie innego kafelka przełącza panel.
- **MAP-06 — Przeciąganie kafelka** (S2, „Wszystko”). `gesture pan` z kafelka → kafelek i strzałki podążają płynnie, mapa się nie przesuwa razem z nim; po puszczeniu pozycja zapisana; `open --relaunch` → ta sama pozycja. Krótkie dotknięcie (< 4 px) to wybór, nie przeciąganie.
- **MAP-07 — „Moja gra”** (S3). Tylko techniki „Ćwiczę”/„Działa” i ich pozycje, kafelki nie dają się przeciągać, brak ▦. Przy > 12 technikach strzałki przygaszone do wyboru kafelka + podpowiedź.
- **MAP-08 — Filtry typu i grupy** (S2). Każdy typ (Kończenia, Sweepy, Ucieczki, Przejścia gardy, Obalenia, Przejścia) zawęża strzałki; grupa pozycji pokazuje techniki **zaczynające się** w tej grupie; kombinacja typ + grupa; ponowne stuknięcie zdejmuje filtr. Lista grup pokazuje tylko grupy obecne na mapie. Zmiana zakresu „Moja gra”/„Wszystko” zamyka panel.
- **MAP-09 — Panel pozycji: rozmiary** (S2). Przeciągnięcie uchwytu w dół → zwinięty pasek (nazwa + „N z tej pozycji” + ✕); w górę → prawie pełna wysokość; stuknięcie uchwytu przełącza zwinięty/połowa. Rozmiar zostaje przy wyborze innego kafelka. Przyciski zoomu zawsze nad panelem.
- **MAP-10 — Panel pozycji: zawartość** (S2). Sekcje: opis, „Z tej pozycji (N)” z typem i celem, „Drille (N)”, „Jak tu trafić (N)”. Liczba 🔁 na kafelku = liczba drilli w panelu. Stuknięcie w technikę/drill otwiera szczegóły, wstecz wraca do mapy z otwartym panelem.
- **MAP-11 — Edycja pozycji** (S2). „Dodaj opis”/„Edytuj” → modal: pusta nazwa blokuje „Zapisz”; zmiana nazwy i opisu widoczna od razu na kafelku, w panelu, w Technikach i w formularzu techniki. „Anuluj” odrzuca zmiany. Długi opis (2000 znaków) przewija się w panelu.
- **MAP-12 — Zdjęcie pozycji** (S2, zdjęcia w galerii). „Dodaj zdjęcie” → picker → kadrowanie → zdjęcie na kafelku i w panelu. „Zmień zdjęcie” podmienia (bez starego obrazu z pamięci podręcznej). „Usuń zdjęcie” wraca do ilustracji. Zdjęcie przetrwa restart. Anulowanie pickera nic nie zmienia.
- **MAP-13 — Odmowa dostępu do zdjęć** (S2). `settings permission deny photos` → „Dodaj zdjęcie”: brak crasha, jasny komunikat albo picker systemowy. Po `grant` działa normalnie.
- **MAP-14 — Status z panelu** (S2). Stuknięcie w chip statusu przy technice zmienia status cyklicznie (Widziałem → Ćwiczę → Działa → Widziałem) i **nie** otwiera techniki. Strzałka zmienia kolor/styl; licznik „Moja gra (N)” rośnie.
- **MAP-15 — Dodaj technikę / drill z panelu** (S2). „Dodaj technikę z tej pozycji” otwiera formularz z wybraną pozycją startową; „Dodaj drill” — formularz z przypiętą pozycją. Po zapisie nowe elementy są w panelu.
- **MAP-16 — Android: przycisk wstecz** (S2). Z otwartym panelem → zamyka panel, nie wychodzi z aplikacji. Bez panelu → standardowe zachowanie. Po wejściu w technikę z panelu wstecz wraca do mapy (nie zamyka panelu zamiast nawigacji).
- **MAP-17 — Mapa przy dużej bibliotece** (S2/S4). Przeciąganie kafelka i pinch płynne na Androidzie (`agent-device perf` / obserwacja). Uwaga: SVG jest przemontowywane na każdą klatkę przeciągania — jeśli zacina się wyraźnie, to błąd wydajności.

### 5.3 Techniki (`(tabs)/techniques`, `technique/[id]`, `technique/form`)

- **TEC-01 — Lista** (S2). Karty pozycji z liczbą technik i „działa”, pasek postępu statusów, podsumowanie „N z M działa”. Zwijanie/rozwijanie karty (stan „expanded” dla czytnika). Pozycja bez technik: „Brak technik z tej pozycji”.
- **TEC-02 — Filtry** (S3). Status × typ: lista pokazuje tylko pasujące karty, wszystkie rozwinięte; brak wyników → komunikat. Zmiana filtra podmienia listę jednym przejściem, bez dziur i nachodzących kart (iOS).
- **TEC-03 — Wiersz techniki** (S3). Podtytuł: typ → cel · „N× · wczoraj”/„nie trenowana”. Chip statusu zmienia status bez otwierania szczegółów.
- **TEC-04 — Dodawanie: walidacja** (S1). „+” → formularz z fokusem na nazwie. „Zapisz” nieaktywne: bez nazwy, bez pozycji startowej, bez pozycji docelowej dla typów innych niż kończenie. Kończenie nie pokazuje/nie wymaga celu. Same spacje w nazwie = pusta.
- **TEC-05 — Dodawanie: komplet** (S1). Nazwa z polskimi znakami i emoji, typ, z/do, status „Ćwiczę”, wideo `youtube.com/watch?v=…` (bez `https://`), notatka. Po zapisie: na liście, na mapie, w „Moja gra”, link zapisany z `https://`.
- **TEC-06 — Ta sama pozycja z/do** (S1). Wybór „do” = „z”, potem zmiana „z” na tę samą — cel czyści się. Sprawdzić, czy da się zapisać technikę z celem równym startowi i jak to wygląda na mapie.
- **TEC-07 — Edycja** (S3). Zmiana pozycji startowej przenosi technikę do innej karty i strzałkę na mapie; zmiana typu na kończenie usuwa cel; historia treningów zostaje.
- **TEC-08 — Usuwanie przesunięciem** (S3, technika w planie, dzienniku i drillu). Swipe → „Usuń” → potwierdzenie. „Anuluj” zamyka wiersz (wraca na miejsce). Potwierdź: technika znika z listy, mapy, planu, drilla; wpis w dzienniku, który miał tylko ją, znika; inne wpisy zostają.
- **TEC-09 — Usuwanie z formularza, z każdego wejścia** (S3). Technika otwarta z: listy Technik, panelu mapy, Planu, szczegółów drilla → Edytuj → Usuń → potwierdź. Za każdym razem ląduje na sensownym ekranie (nie na ekranie usuniętej techniki, nie na pustym stosie; `router.dismissAll()`).
- **TEC-10 — Szczegóły: trening** (S3). „Trenowałem dziś” → przycisk zmienia kolor i tekst, licznik i „ostatnio” się aktualizują, wpis dzisiejszy w Dzienniku ma tę technikę. Ponowne stuknięcie cofa (a jeśli wpis był tylko z tą techniką — wpis znika). Chipy z ostatnich 13 dni działają tak samo. Historia zgodna z Dziennikiem.
- **TEC-11 — Wideo** (S3). Z linkiem: „Obejrzyj wideo” otwiera przeglądarkę/YouTube; bez linku: „Szukaj na YouTube” z nazwą techniki w zapytaniu (polskie znaki zakodowane). Powrót: `agent-device open <app>` — stan ekranu zachowany.
- **TEC-12 — Zły link** (S1). Wideo: `moje wideo` (spacja), `javascript:alert(1)`, `ftp://x`. Po zapisie i stuknięciu: brak czerwonego ekranu/nieobsłużonego `Promise` (sprawdzić `agent-device logs`). Jeśli `Linking.openURL` rzuca — błąd do naprawy (walidacja przy zapisie albo `catch`).
- **TEC-13 — Drille techniki** (S2). Sekcja drilli w szczegółach, „Dodaj drill” z przypiętą techniką.
- **TEC-14 — Nieistniejąca technika** (S1). Deep link `bjjmap://technique/nie-ma` (`agent-device open bjjmap://technique/nie-ma --platform …`) → komunikat „technika usunięta”, da się wrócić.

### 5.4 Drille (`Techniki → Drille`, `drill/[id]`, `drill/form`)

- **DRL-01 — Lista i wyszukiwanie** (S2). Przełącznik Techniki/Drille, „+” w nagłówku zmienia się na „Dodaj drill”. Wyszukiwanie: wielkość liter, fragment słowa, brak wyników. Szukanie bez polskich znaków (`mostek` vs `Mostek`, `sciaganie` vs `ściąganie`) znajduje wyniki (6.1) — także w wyszukiwarce Planu i Dziennika.
- **DRL-02 — Dodawanie** (S2). Tylko nazwa wymagana. Dawka `3×10`, przypięcie do 2 pozycji i 3 technik, wideo, opis. Drill widoczny: w panelu przypiętej pozycji, w panelu pozycji startowej przypiętej techniki, w szczegółach techniki; licznik 🔁 na kafelkach rośnie.
- **DRL-03 — Szczegóły** (S2). „Zrobiłem dziś” i chipy dni → wpis w Dzienniku (drill w sekcji drilli); cofnięcie. Linki do pozycji/technik prowadzą do właściwych ekranów.
- **DRL-04 — Edycja i usuwanie** (S3, drill w planie i dzienniku). Odpięcie pozycji zmienia liczniki 🔁. Usunięcie (swipe na liście i z formularza) → znika z planu, dziennika (puste wpisy znikają), mapy. Po usunięciu z formularza otwartego ze szczegółów — powrót na sensowny ekran.

### 5.5 Plan (`(tabs)/plan`, `plan/pick`)

- **PLN-01 — Pusty plan** (S1). Zakres tygodnia `pn – nd` (np. `06.10 – 12.10`), karta „pusty plan”, przycisk „Wybierz”.
- **PLN-02 — Wybór** (S3). Modal: sekcja „Ćwiczę” na górze, techniki pogrupowane po pozycjach, drille, wyszukiwarka. Zaznaczanie zmienia plan od razu; „Gotowe”/zamknięcie gestem zachowuje wybór. Przycisk w nagłówku zmienia się na „Edytuj”.
- **PLN-03 — Odhaczanie** (S3). Checkbox przy technice → wpis dzisiejszy w Dzienniku, „N× w tym tygodniu”, pasek „zrobione X z Y”. Odznaczenie cofa. Status techniki zmieniany chipem z Planu.
- **PLN-04 — Usuwanie z planu** (S3). Swipe → „Usuń z planu” (bez potwierdzenia) → znika, postęp przeliczony; wpisy w Dzienniku zostają.
- **PLN-05 — Wideo z planu** (S3). Przycisk wideo / szukania przy technice i drillu.
- **PLN-06 — Nowy tydzień i przeniesienie planu** (S3, podróż w czasie 2.4). Plan z zeszłego tygodnia nie jest pokazywany jako bieżący; karta „Zeszły tydzień: przećwiczone X z Y” (X = elementy z zeszłego planu trenowane w tamtym tygodniu); „Przenieś” wstawia cały zeszły plan do bieżącego tygodnia; karta znika. Elementy usunięte w międzyczasie nie wracają.
- **PLN-07 — Granica tygodnia** (Android, zegar na niedzielę 23:58 → poniedziałek). Zakres tygodnia się zmienia (po powrocie na ekran albo restarcie), poniedziałek to pierwszy dzień tygodnia.
- **PLN-08 — Północ przy otwartej aplikacji** (Android, 23:58). Po północy odhaczenie w Planie i „Trenowałem dziś” zapisują się na **nowy** dzień. **Do sprawdzenia:** `today` liczony przy renderze — jeśli ekran nie przerenderował się po północy, wpis może trafić do wczoraj.

### 5.6 Dziennik (`(tabs)/journal`, `journal/entry`, statystyki)

- **JRN-01 — Pusty dziennik** (S1). Karta „pusty dziennik”, liczniki 0 / 0 / 0.
- **JRN-02 — Nowy wpis** (S2). „+” → formularz: dziś zaznaczony, szybki wybór 7 ostatnich dni, kalendarz („Pokaż kalendarz”), długość (domyślnie 1,5 h), techniki z wyszukiwarką, drille, notatka. „Zapisz” nieaktywne, dopóki nie ma techniki, drilla ani notatki.
- **JRN-03 — Kalendarz** (S2). Strzałki miesięcy; nie da się przejść za bieżący miesiąc ani wybrać dnia z przyszłości (wyszarzone, `disabled` dla czytnika); dni z treningiem oznaczone; dziś obwiedzione.
- **JRN-04 — „+” gdy dziś jest już wpis** (S3). Otwiera edycję dzisiejszego wpisu, nie nowy.
- **JRN-05 — Scalanie** (S3). Nowy wpis na dzień, który ma już wpis: komunikat „połączymy”, pokazana długość istniejącego treningu. Po zapisie jeden wpis: techniki i drille zsumowane bez duplikatów, notatki połączone pustą linią, długość istniejąca (chyba że wybrano inną).
- **JRN-06 — Zmiana daty wpisu** (S3). Edycja wpisu i przeniesienie na dzień z innym wpisem → scalenie jak w JRN-05, stary wpis znika.
- **JRN-07 — Oś czasu** (S3). Grupy tygodniowe od najnowszych, nagłówek „Ten tydzień · N×” / zakres dat; kolejność dni malejąco; „wczoraj / 3 dni temu” do 6 dni, potem sama data; chipy technik w kolorze statusu; usunięte techniki nie zostawiają pustych chipów.
- **JRN-08 — Usuwanie** (S3). Swipe → potwierdzenie → wpis znika, liczniki i statystyki przeliczone. Usuwanie z formularza wpisu.
- **JRN-09 — Statystyki miesiąca** (S3). Kalendarz z treningami, godziny na macie (1,5 h domyślnie, własne długości), wykres godzin na tydzień, najczęściej trenowane techniki i drille. Nawigacja po miesiącach.
- **JRN-10 — Statystyki roku** (S4). Mapa roku (heatmapa) zgodna z wpisami, wykres miesięczny, nawigacja po latach; przewijanie mapy roku na wąskim ekranie.
- **JRN-11 — Klawiatura** (S2). Notatka na dole formularza: klawiatura nie zasłania pola (iOS `automaticallyAdjustKeyboardInsets`, Android), da się ją schować i zapisać.

### 5.7 Nawigacja i przekrojowe

- **NAV-01 — Zakładki** (S3). Przełączanie zakładek zachowuje stan (filtry, przewinięcie) w ramach sesji. Etykiety i ikony natywnego paska w obu motywach.
- **NAV-02 — Modale** (S3). Każdy modal (`technique/form`, `drill/form`, `position/form`, `plan/pick`, `journal/entry`): „Anuluj” odrzuca zmiany, gest w dół (iOS) i wstecz (Android) też; przy niezapisanych zmianach pojawia się pytanie, czy je odrzucić (6.1); bez zmian formularz zamyka się od razu.
- **NAV-03 — Głęboki stos** (S3). Mapa → panel → technika → drill → technika → edycja → wstecz ×N: każdy krok wraca o jeden ekran, tytuły nagłówków poprawne, przycisk „wstecz” iOS ma tekst w bieżącym języku.
- **NAV-04 — Deep linki** (S2). `bjjmap://`, `bjjmap://technique/<id>`, `bjjmap://drill/<id>` przy zamkniętej i otwartej aplikacji.
- **X-01 — Trwałość** (S3). Po każdej grupie scenariuszy: `close` + `open --relaunch` → dane, ustawienia, układ mapy, zdjęcia zostały.
- **X-02 — Długie teksty** (S1). Nazwy 80+ znaków (pozycja, technika, drill), notatka 2000 znaków: zawijanie na kafelku (2 linie), w nagłówkach (bez wypychania przycisków), na chipach, w planie, w dzienniku.
- **X-03 — Duży tekst** (K4). Kafelki mapy, chipy, segmenty, pasek zakładek, przyciski nagłówka nie nachodzą na siebie i nie są ucięte w sposób uniemożliwiający użycie.
- **X-04 — Dostępność** (S3). `snapshot -i` na każdym ekranie: przyciski mają rolę i etykietę w bieżącym języku (zoom, zębatka, „+”, ✕ panelu, checkbox planu ze stanem, wybrane chipy). Wiersze techniki/drilla w panelu mapy i na listach — sprawdzić, czy czytnik wie, że to przyciski.
- **X-05 — Safe area i pasek zakładek** (S3). Ostatni element każdej listy da się przewinąć ponad pasek zakładek; panel mapy i przyciski zoomu nad paskiem; wycięcie ekranu/Dynamic Island nie zasłania nagłówków.
- **X-06 — Logi** (wszystko). Po każdej grupie: `agent-device logs path` → przejrzeć ostrzeżenia i błędy (React key, nieobsłużone Promise, VirtualizedList, Reanimated). Każde powtarzalne ostrzeżenie z naszego kodu = fix.
- **X-07 — Tło i powrót** (S3). Wyjście do ekranu głównego w trakcie edycji formularza i powrót: stan formularza zachowany (lub świadomie nie), brak crasha.

### 5.8 Build produkcyjny (smoke, na koniec)

- **REL-01** `npx expo run:ios --configuration Release` i `npx expo run:android --variant release`: start, splash, mapa, jeden przepływ każdej zakładki, brak ekranów deweloperskich, wydajność mapy przy S2.
- **REL-02** Toast aktualizacji (`update-toast`): w Release nie pokazuje się przy zwykłym starcie z wbudowanego bundle'a.
- **REL-03 (opcjonalnie) Migracja danych**: zainstalować build z commita sprzed drilli (store v4), dodać dane, zainstalować bieżący build bez czyszczenia → dane zostają, pojawiają się startowe drille (migracja v5).

---

## 6. Hipotezy z przeglądu kodu (sprawdzić w pierwszej kolejności)

| # | Gdzie | Co może być nie tak | Scenariusz |
|---|---|---|---|
| H1 | `.gitignore` | Brak `/ios`, `/android` | P1 |
| H2 | `app.json` | Brak `android.package` | P2 |
| H3 | `store.loadLibrary` | Wczytanie biblioteki nadpisuje ręczny układ mapy | SET-07 |
| H4 | `drill-list`, `plan/pick`, `journal/entry` | Wyszukiwanie wrażliwe na polskie znaki → **naprawić** (6.1) | DRL-01 |
| H5 | `technique/[id]`, `drill/[id]`, `plan` | `Linking.openURL` bez obsługi błędu przy złym linku | TEC-12 |
| H6 | `plan/index`, `technique/[id]` | „Dziś” liczone przy renderze — zapis na wczoraj po północy | PLN-08 |
| H7 | `technique/form` | Technika z celem = start (pętla na mapie) | TEC-06 |
| H8 | `settings.tsx` (`#EF4444`), `technique/[id]`/`drill/[id]` (czerwony wideo) | Kolory na sztywno zamiast z motywu — sprawdzić kontrast w jasnym motywie; poprawka tylko, jeśli widać problem | K2 |
| H9 | `dates.ts` | Format `12.09` i nazwy dni także po angielsku → **angielski format** (6.1) | SET-04 |
| H10 | wszystkie modale | Brak ostrzeżenia o niezapisanych zmianach → **dodać** (6.1) | NAV-02 |

Hipoteza potwierdzona → błąd w sekcji 11 → pętla z 1.1. Inne sprawy „do decyzji” (np. SET-08) → zapisać w tabeli i zapytać właściciela, nie zmieniać na własną rękę.

### 6.1 Decyzje właściciela

- **H4**: wyszukiwanie ma ignorować polskie znaki (`sciaganie` znajduje `ściąganie`, `Ł`/`ł` jak `l`) — we wszystkich wyszukiwarkach (Drille, Plan, Dziennik).
- **H9**: po angielsku daty w angielskim formacie (np. `Sep 12`, `Sat, Sep 27`, `Sep 22 – 28`); po polsku bez zmian (`12.09`, `sob 27.09`).
- **H10**: formularze ostrzegają przed utratą niezapisanych zmian (Anuluj, gest w dół na iOS, wstecz na Androidzie).

Każda z tych zmian to osobny commit z pushem, sprawdzony na obu platformach.

---

## 7. Klasyfikacja błędów

- **Krytyczny**: crash, utrata danych, nie da się wykonać głównego przepływu → naprawić natychmiast, przed dalszymi testami.
- **Poważny**: zły wynik (złe liczniki, zły dzień, zły ekran po usunięciu), błąd tylko na jednej platformie w głównym przepływie → naprawić w bieżącej sekcji.
- **Drobny**: układ, tekst, kontrast, dostępność → naprawić przed końcem sesji testów.
- **Do decyzji**: zachowanie, które może być zamierzone → tylko zapisać i zapytać.

Wszystkie poprawki — niezależnie od wagi — według pętli 1.1: jeden fix, jeden commit, od razu push.

---

## 8. Nagrane przepływy (regresja)

Podczas testów nagrywamy najważniejsze przepływy do `e2e/flows/` (`agent-device open … --save-script e2e/flows/<nazwa>.ad`), żeby po każdym fixie dało się je szybko odtworzyć:

| Plik | Zawartość |
|---|---|
| `smoke.ad` | Start → każda zakładka → Ustawienia → wstecz. Weryfikuje tytuły ekranów. |
| `technique-crud.ad` | Dodanie techniki → edycja → „Trenowałem dziś” → usunięcie. |
| `plan-week.ad` | Wybór 2 technik i drilla → odhaczenie → swipe usuń z planu. |
| `journal-entry.ad` | Nowy wpis z przeszłą datą → scalenie z istniejącym → usunięcie. |
| `settings-reset.ad` | Biblioteka → usuń wszystkie dane → stan startowy. |

- Każdy przepływ zaczyna od `settings clear-app-state` + `open --relaunch` i kończy `close`.
- Uruchomienie: `agent-device test 'e2e/flows/*.ad' --platform ios` i `--platform android` (opcjonalnie `--record-video --artifacts-dir e2e/artifacts`).
- Po każdym fixie dotykającym store'a, nawigacji lub wspólnego komponentu: co najmniej `smoke.ad` na obu platformach przed pushem.
- Dodanie/zmiana przepływów to osobne commity (`Add agent-device flows for the plan tab`), też od razu pushowane.

---

## 9. Kolejność pracy

1. **Sekcja 2**: blokery P1, P2 (commit + push każdy), buildy, sesje, zdjęcia testowe.
2. **5.1 Ustawienia** (S0/S1) — motyw, język, reset są potrzebne do reszty.
3. **5.2 Mapa** → **5.3 Techniki** → **5.4 Drille** → **5.5 Plan** → **5.6 Dziennik** (K1, obie platformy równolegle w sesjach `ios`/`android`).
4. Hipotezy z sekcji 6, które jeszcze nie zostały pokryte.
5. **5.7 przekrojowe** + konfiguracje K2–K4 (+ K5 opcjonalnie).
6. **Sekcja 8**: nagranie i dopracowanie przepływów `.ad`, przebieg całego zestawu na obu platformach.
7. **5.8 Release** smoke.
8. Zamknięcie: aktualizacja tabeli błędów i sekcji „Wyniki” w tym pliku → commit `Record the results of the agent-device test pass` → push.

---

## 10. Kryteria zakończenia

- Wszystkie scenariusze z sekcji 5 wykonane na iOS i Androidzie w K1, skrócone w K2–K4; wynik każdego zapisany (✅ / ❌ + numer błędu / ⏭ z powodem).
- Brak otwartych błędów krytycznych i poważnych; drobne naprawione albo świadomie odłożone z uzasadnieniem.
- Każdy fix ma własny commit na `origin/main` (hash w tabeli), `git status` czysty, `git log origin/main..main` pusty.
- `npx tsc --noEmit`, `npx expo lint` zielone; `agent-device test 'e2e/flows/*.ad'` zielony na obu platformach.
- Sprawy „do decyzji” zebrane w jednym miejscu dla właściciela.

---

## 11. Znalezione błędy

| # | ID scen. | Platforma | Waga | Opis | Status | Commit |
|---|---|---|---|---|---|---|
| | | | | | | |

## 12. Wyniki

| Sekcja | iOS K1 | Android K1 | K2 | K3 | K4 | Uwagi |
|---|---|---|---|---|---|---|
| 5.1 Ustawienia | | | | | | |
| 5.2 Mapa | | | | | | |
| 5.3 Techniki | | | | | | |
| 5.4 Drille | | | | | | |
| 5.5 Plan | | | | | | |
| 5.6 Dziennik | | | | | | |
| 5.7 Przekrojowe | | | | | | |
| 5.8 Release | | | | | | |
