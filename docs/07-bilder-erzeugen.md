# 07 – Bilder für die Lerndetektive erzeugen (Anleitung für Windows)

Die 120 Bilder entstehen auf deinem PC mit deinem lokalen ComfyUI (SDXL Turbo). Die Prompts liegen in `art/lerndetektive-prompts.json`, der Stil in `.art-style.json`. Die App zeigt ein echtes Bild, sobald seine ID in `data/lerndetektive/bilder.json` steht; sonst bleibt der Platzhalter. Eine Teillieferung (z. B. 20 Bilder) ist also in Ordnung.

## Einmal vorbereiten
1. **ffmpeg installieren** (für die Umwandlung PNG zu WebP): `winget install ffmpeg`, danach ein **neues** Terminal öffnen. Prüfen mit `ffmpeg -version`.
2. Node.js (Version 22 oder neuer) ist für `npm` nötig; `npm install` im Repo-Ordner ausführen.

## Ablauf
1. **Aktuellen Stand holen:** `git pull`.
2. **ComfyUI starten** (wie gewohnt) und **Claude Code im Repo-Ordner starten** (`claude`).
3. **Auftrag geben**, zuerst nur 5 Bilder zur Ansicht:
   > Nutze den game-art-pipeline-Skill und erzeuge die Bilder aus art/lerndetektive-prompts.json. Zuerst nur 5 zur Ansicht. Feste Seed, 1024×1024, Ausgabe nach art/ausgabe/ (je Item `<id>.png`).
4. **Ansehen und beurteilen.** Passt der Stil? Dann den Rest in **Chargen von 20** erzeugen lassen. Die feste Seed sorgt für einen einheitlichen Look; ändere sie nicht zwischendurch.
5. **Aussortieren:** Jedes Bild mit **Buchstaben, Zahlen, Schriftzeichen oder Pseudo-Schrift** (SDXL Turbo malt manchmal buchstabenähnliche Schnörkel) wird verworfen und neu erzeugt, ebenso Bilder mit Personen, unklarem Motiv oder mehreren Objekten. Ein Bild darf das Wort nicht verraten. Auch mehrdeutige Motive neu erzeugen lassen (z. B. Kette: Halskette, nicht Fahrradkette).
6. **Umwandeln** (1024² PNG zu 512² WebP, Dateiname `<id>.webp`):
   `npm run bilder:konvertieren -- art/ausgabe`
   Die PNGs in `art/ausgabe/` sind per `.gitignore` ausgeschlossen und werden nie committet.
7. **Prüfen:** `npm run bilder:pruefen`
   Das Skript prüft Name (= Item-ID), quadratisch und 512×512, meldet fehlende Items und schreibt `data/lerndetektive/bilder.json`.
8. **Ansehen in der App:** `npm run dev`, dann im Browser `http://localhost:5173/?benennen=1` öffnen (Port steht in der Ausgabe von `npm run dev`; mit Basis-Pfad ggf. `/Lerntyp/?benennen=1`).
   Dort siehst du alle 120 Bilder einzeln **ohne Wort**. „Wort zeigen“ blendet das Wort ein, „Weiter“ und „Zurück“ blättern. Das ist zugleich der **Benennungstest** mit deinem Sohn (02 §5.1, 05 L8, 06 §7). Es wird nichts gespeichert.
9. **Committen:** nur
   - `apps/web/public/bilder/*.webp`
   - `data/lerndetektive/bilder.json`

   Dann pushen. `npm run validate:data` prüft, dass jede in `bilder.json` gelistete ID eine Datei hat.

## Hinweise
- Nach `git pull` auf einem anderen Rechner genügt `npm run bilder:pruefen`, um `bilder.json` aus den vorhandenen WebP-Dateien neu zu erzeugen.
- Neu erzeugte Bilder überschreiben gleichnamige WebP-Dateien; danach erneut `bilder:pruefen` ausführen.
- ComfyUI nummeriert Dateien (z. B. `kette_00001_.png`); das Umwandlungsskript nimmt je Item die Datei mit der höchsten Nummer.

## Audio (nur zur Orientierung)
Die Sprachausgabe ist vorproduziert (Piper, Stimme „Thorsten“) und wird mit `npm run audio:erzeugen` neu erzeugt, wenn sich Texte ändern. Die Umgebungsvariablen `PIPER_BIN` und `PIPER_MODEL` zeigen auf Piper und das Stimmenmodell (Windows-Beispiel im Kopf von `scripts/audio/erzeugen.py`). Ohne Textänderung ist nichts zu tun. `npm run validate:data` meldet veraltetes Audio.
