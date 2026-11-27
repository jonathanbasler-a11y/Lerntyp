# CLAUDE.md – Lerntyp

Tablet-Lern-App für Klassenstufe 4 in Baden-Württemberg (9–10 Jahre). Kinder erkunden gemeinsam im Unterricht, **wie** sie lernen: mit einem stärkenorientierten **Lernprofil** („Mein Lernprofil“: drei Stärken + eine Lern-Superkraft) und dem Klassenexperiment **Lerndetektive** (Bedingungen `wort`, `bild`, `bild_wort`). Lehrkräfte steuern die **Sitzung** über das **Lehrkraft-Cockpit**; Kinder nutzen einen **Lernausweis** mit **Alias**. Stand: Demo auf GitHub Pages mit dem vollständigen Lerndetektive-Experiment (Mock-Daten, synthetische Stimme, Bild-Werkzeuge). Offen: P3 (Server, getrennte Geräte) und P4 (Strategie-Parcours, Lernprofil).

## Die wichtigste Regel
**Keine Lerntyp-Etiketten.** Kein UI-Text, kein Datenfeld, kein Ergebnis und kein Export ordnet einem Kind einen Typ, ein Niveau, eine Note, ein Ranking oder einen Vergleich zu. Profile beschreiben **beobachtetes Verhalten** (Vergangenheitsform, konkrete Station). Verbindliche Sprachregeln: `docs/01-konzept.md` §7.4. Hintergrund: Dossier §1.1.

## Rangfolge der Quellen
1. `docs/*.md` (Spezifikation) 2. `PLAN.md` (Build-Reihenfolge und Abnahme) 3. Code.
Der Code richtet sich nach den Docs, nie umgekehrt. Widersprüche werden im Phasenbericht **gemeldet**, nicht stillschweigend gelöst.

## Workflow
- Strikt Phase für Phase nach `PLAN.md`; ein Commit pro Phase, Nachricht `phase-N: <kurzbeschreibung>`.
- Nach jeder Phase: Tests laufen lassen, dann Dokumenten-Konformitätsprüfung gegen `docs/`, erst danach committen.
- Nicht committen oder pushen, wenn nicht ausdrücklich verlangt.

## Unverletzliche Invarianten
- **Nur Aliasse**, nie echte Namen (kein Namensfeld im Datenmodell; Zuordnung nur auf der Papierliste der Lehrkraft).
- **Keine Drittanbieter**: keine SDKs, kein Analytics, keine CDNs, keine externen Schriften/Icons, keine Sprachausgabe zur Laufzeit. Keine externen Requests. Audio wird einmalig offline erzeugt (`npm run audio:erzeugen`, Piper) und als Datei ausgeliefert.
- **Alle Inhalte, Items und UI-Texte liegen in `/data` (JSON, per zod geprüft).** Wenn du einen Text oder ein Item in `/src` hartkodierst: stopp.
- **Null Dark Patterns:** keine Streaks, kein Countdown-Druck, keine FOMO-Hinweise, keine Ranglisten, keine Lootboxen/Zufallsbelohnungen, kein Autoplay, keine Endlos-Feeds, keine In-App-Käufe, keine externen Links; klares Sitzungsende („Fertig für heute“). Siehe `docs/01-konzept.md` §8.
- **Deutsche Oberfläche.** Kinder-Texte: max. 2 kurze Sätze pro Bildschirm, Vorlese-Knopf.
- **Ergebnisse nie für Grundschulempfehlung oder Kompass 4.** Jede Cockpit-Ansicht mit Kinderdaten trägt den Hinweis dazu.
- **Hosting-Stufen** (`docs/03-architektur.md` §7): Demo auf GitHub Pages/Vercel **nur mit Mock-Daten**; echte Kinderdaten (inkl. realer Geräte-IPs) **nur auf EU-Host mit AVV**. Keine herstellerspezifischen Features (kein Vercel Functions/Edge Config).
- Rechtliche Aussagen, die in den Docs „zu verifizieren (R0)“ heißen, bleiben unverifiziert, bis R0 sie bestätigt. Keine Rechtsaussagen als Fakt ergänzen.
- Forschungsdaten nur für Teilnehmer mit `consent_research = true`; nicht einwilligende Kinder nehmen teil, ihre Daten gehen nie in den Export.

## Befehle
- `npm run dev` – Entwicklungsserver (Demo-Modus; `?schnell=1` kürzt die Zeiten, `?benennen=1` öffnet den Benennungstest)
- `npx vitest run` – Unit- und Integrationstests
- `npm run lint` · `npm run validate:data` – Lint und Datenprüfung
- `npm run build` · `npm run build:live` · `npm run check:live` – Demo-Build, Live-Build, Prüfung „kein Mock im Live-Build“
- `npm run e2e -- --trace off` – Playwright (iPad-Viewport)
- `npm run audio:erzeugen` · `npm run bilder:konvertieren -- art/ausgabe` · `npm run bilder:pruefen` – Medien

## Bilder (game-art-pipeline-Skill)
- Stil: `.art-style.json` (Thema `objekt`), Prompts: `art/lerndetektive-prompts.json`, Anleitung: `docs/07-bilder-erzeugen.md`.
- **Projektkonvention statt Skill-Standardpfad:** ComfyUI-Ausgabe nach `art/ausgabe/<id>.png` (nicht eingecheckt), dann `npm run bilder:konvertieren -- art/ausgabe` → `apps/web/public/bilder/<id>.webp` (512×512), dann `npm run bilder:pruefen`.
- Bilder ohne Buchstaben, Zahlen oder Personen; nur eigene, original erzeugte Bilder, keine Cliparts oder Fremdbilder.

## Struktur (`docs/03-architektur.md` §3.1)
`apps/web` (PWA), `apps/api` (Fastify), `packages/shared` (zod-Schemas), `data/` (Inhalte), `deploy/` (Docker Compose), `docs/`.

## Begriffe
Lernausweis, Alias, Sitzung, Bedingung (`wort`/`bild`/`bild_wort`), Lern-Superkraft, Lehrkraft-Cockpit, Hosting-Stufen – Definitionen in `docs/01-konzept.md` §12.
