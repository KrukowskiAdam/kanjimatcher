# Svelte Kanji Match

Prosta gra typu Language Match oparta o Joyo kanji. Uzywa SvelteKit i lokalnego pliku danych.

Progress: 1300/2136 kanji reviewed (61% complete)

Approximately 836 kanji remain in groups 1301-2136, with an estimated 160-200 more corrections needed.



## Dane

- Plik: `static/Jōyō_Kanji/Jōyō_Kanji.txt`
- Mapa tlumaczen: `static/joyo_kanji_en.json` (z hiragana i angielskimi znaczeniami, katakana)
- Wczytywanie po stronie klienta przez `fetch("/joyo_kanji_en.json")`
- Kazdy kanji zawiera:
  - **kanji** - znak japonski
  - **hiragana** - czytanie fonetyczne (wyswietlane jako podpowiedz pod kanji)
  - **meaning** - angielskie znaczenie
- Taby tworzone sa po 50 par na runde w ramach kazdego zakresu

## Azure TTS

Potrzebne zmienne srodowiskowe (w pliku `.env`):

```
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
AZURE_SPEECH_VOICE=ja-JP-NanamiNeural
```

## Generowanie mapy tlumaczen

Generator korzysta z lokalnego slownika `static/kanjiapi_full.json` (bez Azure Translator).
Tworzy JSON z trzema kolumnami: **Kanji**, **Hiragana** (czytanie fonetyczne), **English meaning**.

Dodatkowo:
- Czyszczenie czytań: usuwa prefiksy/przyrostki i wybiera najdluzsze czytanie
- Priorytet czytań kun (jeśli dostępne), inaczej on z konwersją na hiragana
- Override'y: `tools/kanji_overrides.json` zawiera ręczne poprawki dla ~236 najważniejszych kanji

```sh
node tools/joyo_translate.mjs
```

## Uruchomienie lokalne

```sh
npm run dev
```

## Build

```sh
npm run build
npm run preview
firebase deploy
```
## Build
git add .
git commit -m "cos tam"
git push
