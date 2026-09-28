export const pl = {
  common: {
    back: 'Wstecz',
    cancel: 'Anuluj',
    delete: 'Usuń',
  },
  tabs: {
    map: 'Mapa',
    techniques: 'Techniki',
    plan: 'Plan',
    journal: 'Dziennik',
  },
  settings: {
    title: 'Ustawienia',
    about: 'O aplikacji',
    aboutText:
      'Twoja mapa BJJ: pozycje, techniki między nimi i to, co już działa u Ciebie w sparingu. Planuj, co ćwiczyć w tym tygodniu, i zapisuj treningi w dzienniku.',
    version: (v: string) => `Wersja ${v}`,
    language: 'Język',
    languageSystem: 'Systemowy',
    account: 'Konto',
    logout: 'Wyloguj',
    noAccount: 'Konta jeszcze nie ma. Dane są zapisane tylko na tym urządzeniu.',
    data: 'Dane',
    deleteAll: 'Usuń wszystkie dane',
    deleteAllTitle: 'Usunąć wszystkie dane?',
    deleteAllMessage:
      'Znikną treningi, plan, notatki, zdjęcia i Twoje techniki. Mapa wróci do stanu początkowego. Tego nie da się cofnąć.',
    deleteAllConfirm: 'Usuń wszystko',
  },
};

export type Dict = typeof pl;
