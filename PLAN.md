# Lerntyp – Build-Roadmap (PLAN.md)

Diese Roadmap setzt die Spezifikation in `docs/` in Phasen um. Rangfolge der Quellen: 1. `docs/*.md`, 2. dieses PLAN.md, 3. Code. Konflikte werden gemeldet, nicht stillschweigend gelöst (siehe [CLAUDE.md](CLAUDE.md)).

## Arbeitsweise

- Strikt Phase für Phase; keine Phase beginnt, bevor die vorige abgenommen ist.
- **Ein Commit pro Phase**, Nachricht `phase-N: <kurzbeschreibung>` (z. B. `phase-1: Monorepo-Gerüst und Demo-Modus`).
- Nach jeder Phase: (1) **Tests ausführen** (`npx vitest run`, ab P3 zusätzlich Playwright) und grün bekommen; (2) **Dokumenten-Konformitätsprüfung gegen `docs/`** (Sprachregeln 01 §7.4, Verbotene Muster 01 §8, Datenmodell 03 §4, Hosting-Stufen 03 §7, Datenschutz 04); (3) erst dann committen.
- Konflikte zwischen Doc und Umsetzung stehen im Phasenbericht, nicht im Code-Workaround.
- Alle Inhalte, Items und UI-Texte liegen in `/data` (JSON, per zod geprüft); nichts davon wird in `/src` hartkodiert.
- Rechtliches, das in den Docs mit „zu verifizieren (R0)“ markiert ist, bleibt unverifiziert, bis R0 es bestätigt.

## Zeitbezug zur Forschung (docs/05, §4)

| Forschungsphase | Zeitraum | Benötigter Build-Stand |
|---|---|---|
| R0 Grundlagen | Dez 2026 – Jan 2027 | Phase 0 (Docs); P1 als Demo für Gespräche/Anträge |
| R1 Co-Design | Jan – Feb 2027 | P1 (Demo-Modus) und P2 als Klick-Prototyp (Tor 1) |
| R2 Usability-Pilot | Mär – Apr 2027 | **P4 fertig bis Anfang März 2027** (05 §4: „App-Version P4“) |
| R3 Feldstudie | Mai – Jul 2027 | **P5 fertig vor Mai 2027** |

Rückwärtsplanung: P1 bis Mitte Dez 2026, P2 bis Mitte Jan 2027, P3 bis Ende Jan 2027, P4 bis Mitte Feb 2027 (Puffer für Co-Design-Änderungen), P5 vor R3. Hinweis: 04 §5 nennt „EU-Hosting aktiv“ bereits für R2; siehe Abschnitt „Offene Punkte“.

---

## Phase 0: Konzept (erledigt mit diesem PR)

**Ziel:** Spezifikation als Source of Truth.
**Umfang:** `docs/01`–`05`, Dossier unter `docs/research/00-dossier.md`, README, CLAUDE.md, PLAN.md.
**Abnahme (erledigt):**
- [x] Alle Dossier-Empfehlungen §6.3 in der Rückverfolgbarkeit (01 §11).
- [x] Relative Links zwischen Docs lösen auf.
- [x] Keine Lerntyp-Etiketten in kindbezogenen Texten.
- [x] Nicht Verifiziertes ist als „zu verifizieren (R0)“ markiert.

---

## Phase 1: Monorepo-Gerüst + Demo-Modus auf GitHub Pages

**Ziel:** Lauffähiges Gerüst, das ohne Backend im Browser mit Mock-Daten demonstriert werden kann.

**Umfang**
- Struktur `apps/web`, `apps/api` (Stub), `packages/shared`, `data/`, `deploy/` (03 §3.1); TypeScript, Workspaces, Vitest, Playwright-Konfiguration mit iPad-Viewport (03 §3.2).
- `apps/web`: React + Vite + `vite-plugin-pwa`, Web-Manifest, App-Shell; selbst gehostete Schriften, keine externen Requests (03 §8).
- Schnittstelle des API-Clients mit **Mock-Adapter** (Demo-Modus), Modus `demo | live` per Build-Flag (03 §7.2); Live-Build enthält den Mock nicht.
- `packages/shared`: zod-Schemas für Ereignis-Envelope und Basistypen (03 §4.4).
- Laden und Validieren von `/data`-JSON; Build schlägt bei ungültigem JSON fehl (03 §3.2).
- GitHub-Action: Build und Deployment auf GitHub Pages (nur Demo, 03 §7 Stufe 1); sichtbarer Demo-Hinweis „Nur Dummy-Daten“.
- Lernausweis-Einstieg als Platzhalter (01 §7.1); Textbausteine nur aus `/data`.

**Abnahmekriterien**
- [ ] `npm run build` erzeugt statischen `dist/`; `npx vitest run` grün.
- [ ] Demo-URL auf GitHub Pages erreichbar, läuft vollständig ohne Backend.
- [ ] Netzwerk-Test (Playwright): keine Requests an fremde Hosts (keine CDNs, Fonts, Analytics).
- [ ] Ungültige `/data`-JSON lässt den Build fehlschlagen (Test).
- [ ] Live-Build enthält keinen Mock-Adapter (Bundle-Prüfung).
- [ ] Kein hartkodierter UI-Text in `/src` (Grep-Prüfung).

**Abhängigkeiten:** Phase 0. Zeitlich: vor R1 (Demo für Gespräche und Anträge).

---

## Phase 2: Lerndetektive-Modul

**Ziel:** Das Klassenexperiment vollständig im Kind-Client spielbar (Demo-Modus), nach Spezifikation 02.

**Umfang**
- Ablauf und Screen-Timing (02 §2); Überzeugungs-Aussagen vorher/nachher (02 §3); Vorlieben und Vermutung (02 §4).
- Lernphase mit Material und den Bedingungen `wort`, `bild`, `bild_wort` (02 §5.1–5.2); Ausbalancierung per Lateinischem Quadrat (02 §5.3).
- Sofort-Test, verzögerter Test, Kennwerte (02 §6); Sonderfälle wie Kopfhörer-Fallback, DaZ, Lesehilfe (02 §8; 01 §9) mit Vorlese-Knopf.
- Ereignis-Payloads gemäß 02 §9; Inhaltsdatei gemäß 02 §10 in `/data`.
- Folgestunde (Vergleich, 02 §7.3) und Beamer-Grafik als clientseitige Aggregation im Demo-Modus (02 §7.1); Gesprächsleitfaden (02 §7.2).
- UX-Regeln (01 §8): keine Punkte, kein Fehler-Ton, klares Ende.

**Abnahmekriterien**
- [ ] Ein vollständiger Durchlauf im Demo-Modus erzeugt alle Ereignisse nach 02 §9 (schema-valide).
- [ ] Zuordnung Items×Bedingungen×Reihenfolge entspricht dem Lateinischen Quadrat (Unit-Test, alle Zellen ausbalanciert).
- [ ] Beamer-Grafik zeigt nur Klassenebene (Behaltensleistung je Bedingung nach Vorliebe-Gruppe), keine Einzelergebnisse.
- [ ] Kein Text, kein Datenfeld und keine Ausgabe ordnet ein Kind einem Typ zu (Grep- und Schema-Test).
- [ ] Jeder Bildschirm hat max. 2 kurze Sätze und einen Vorlese-Knopf; Touch-Ziele ≥ 48 pt.
- [ ] Sonderfälle aus 02 §8 haben je einen Testfall.
- [ ] Zeitbudget Lerndetektive ≈ 20 Min. im Durchlauf (Zeitmessung im Test-Skript).

**Abhängigkeiten:** P1. Zeitlich: für R1-Klick-Prototyp (Jan–Feb 2027).

---

## Phase 3: API + Lehrkraft-Cockpit + Offline-Sync

**Ziel:** Echte Mehrgeräte-Sitzung: Lehrkraft steuert, Tablets synchronisieren, offline-fähig.

**Umfang**
- `apps/api`: Fastify, Repository-Schicht, SQLite (Postgres optional), Datenmodell Klasse, Sitzung, Teilnehmer, Ereignis, Antwort (03 §4.1–4.5); zod-Validierung beim Ingest.
- Sitzungsablauf und Echtzeit (03 §5): Live-Kanal; **Entscheidung SSE vs. WebSocket per Prototyp** (03 §11).
- Offline-first: IndexedDB-Queue, idempotenter Upload (03 §6.1–6.2), Resume auf beliebigem Tablet per Lernausweis-QR (03 §6.3).
- Lehrkraft-Cockpit (01 §7.5): Sitzung steuern, Live-Fortschritt, Klassenergebnis, Vorbereitung (Lernausweise drucken, Einwilligungsstatus je Alias); Hinweis „Nur zur Lernbegleitung – nicht für die Grundschulempfehlung oder Kompass 4.“ in jeder Ansicht mit Kinderdaten.
- Sicherheit (03 §8): Lehrkraft-Zugang über Klassencode, Rate-Limits, CSP, keine externen Requests.
- `deploy/docker-compose.yml` (Entwurf) mit `web`, `api`, Volume `data`.
- Plattformannahmen aus 03 §6.4 als Testplan (Echtgerätetest Shared iPad bleibt R0/R2-Aufgabe).

**Abnahmekriterien**
- [ ] Integrationstest: Events werden genau einmal gespeichert, auch bei Wiederholung des Uploads (Idempotenz).
- [ ] Playwright (iPad-Viewport, WebKit): Netz trennen, Durchlauf fortsetzen, Netz zurück → alle Events synchron, keine Verluste.
- [ ] Resume per Alias-QR auf einem zweiten Tablet funktioniert.
- [ ] Cockpit zeigt Live-Fortschritt von mindestens 3 simulierten Tablets; Phasenstart/-pause wirkt synchron.
- [ ] Datenmodell enthält kein Namensfeld; Aliasse nur als Pseudonym (Schema-Test).
- [ ] Cockpit-Ansichten enthalten keine Punktzahlen, Ranglisten oder Vergleichswerte; Hinweis „nicht für Grundschulempfehlung/Kompass 4“ in jeder Ansicht mit Kinderdaten (E2E-Test).
- [ ] `docker compose up` startet den Stack lokal; Demo-Modus funktioniert weiterhin.

**Abhängigkeiten:** P1, P2. Zeitlich: Ende Jan 2027.

---

## Phase 4: Strategie-Parcours + Lernprofil

**Ziel:** Vollständige 45-Minuten-Stunde inkl. Prozessspur und „Mein Lernprofil“; **bereit für Usability-Pilot R2 (März 2027)**.

**Umfang**
- Strategie-Parcours mit Stationen, Aufgaben und Prozessspur-Indikatoren (01 §7.3; Bildungsplan-Bezug Deutsch/Mathe); Aufgaben nur in `/data`; Schwierigkeit grundlegend bis mittel, keine G/M/E-Niveaus.
- Die sechs Lernstrategien in Kindersprache (01 §5); Ereignistypen für Prozessspur (03 §4.4).
- Profil-Berechnung (03 §4.6) und „Mein Lernprofil“ (01 §7.4): drei Stärken-Karten (beobachtetes Verhalten, Vergangenheitsform, Stationsbezug), eine **Lern-Superkraft**, ein Tipp für zu Hause; Textbausteine in `/data`; Fallback-Karte bei zu wenig Daten.
- Abschlussbildschirm „Fertig für heute“; Einzelprofile im Lehrkraft-Cockpit (01 §7.5); Ausdruck „Profil zum Mitnehmen“ (01 §7.6).
- Gesamtablauf Hauptstunde 45 Min. und Folgestunde 15 Min. (01 §6.1–6.2); Elternbrief-Entwurf verlinkt (04 §6.1).
- Instrumente für R2: Zeitmessung, Smileyometer/„Passt das zu dir?“ (05 §5.3, RQ4/RQ6).

**Abnahmekriterien**
- [ ] Profil-Sprachregeltest: Ausgaben enthalten nur erlaubte Formen (Vergangenheit, konkrete Station); verbotene Muster (Typ-Aussagen, Prozent, Punkte, Noten, Niveaus, Klassenvergleich) werden per Test über alle Textbausteine und ein Beispielprofil ausgeschlossen.
- [ ] Profil hängt nicht von der Zahl richtiger Antworten ab (Test mit gleichem Verhalten, unterschiedlicher Richtigkeit → gleiche Karten).
- [ ] Bei abgebrochener Sitzung erscheint die allgemeine ermutigende Karte.
- [ ] Kein Dark Pattern: keine Streaks, Countdowns, Ranglisten, Belohnungs-Zufall, Autoplay, Links nach außen; Abschluss ohne „Weiter“-Knopf (E2E).
- [ ] Vollständiger Durchlauf (Hauptstunde) im Test-Skript ≤ 45 Min. Soll-Zeit; Folgestunde ≤ 15 Min.
- [ ] Alle Items und Texte in `/data`; Grep zeigt keine Texte in `/src`.
- [ ] Cockpit-Einzelprofil zeigt Karten und Superkraft, keine Vergleichswerte.
- [ ] Echtgerätetest auf Shared iPad durchgeführt und dokumentiert (Voraussetzung für Tor 2).

**Abhängigkeiten:** P3. **Zeitlich: fertig bis Anfang März 2027 für R2.** Änderungen aus R1 (Items, Konzept) fließen vorher ein.

---

## Phase 5: Pilot-Härtung (EU-Hosting, Löschjobs, Export)

**Ziel:** Betrieb mit echten Klassen auf EU-Host; **vor R3 (Mai 2027)** abgeschlossen.

**Umfang**
- Hosting-Stufe 2 (03 §7): Frontend statisch via Caddy/nginx **und** API/DB in Docker Compose auf deutschem/EU-Host mit **AVV** (z. B. Hetzner, IONOS, Schulträger-Server); `.env`-Konfiguration, TLS, CSP; Wechsel von Stufe 1 nur per Konfiguration (03 §7.2).
- Datenlebenszyklus (03 §10): täglicher Löschjob nach `loeschdatum` (inkl. Backups), vorzeitige Löschung je Klasse/Kind, Anonymisierung nach Analyse.
- Forschungsexport: pseudonymisierte CSV nur bei `consent_research = true`, Export-Pseudonym, Export-Protokoll (03 §10).
- Datenschutz-Umsetzung nach 04: TOM-Übersicht (04 §6.6), Löschkonzept und Betroffenenrechte (04 §7), AVV-Checkliste (04 §6.5); Datenkatalog (04 §3) wird mit dem Datenmodell abgeglichen.
- Backups, Monitoring ohne Drittanbieter, Rate-Limits; Lasttest für Klassengröße.
- Rechtsfragen bleiben „zu verifizieren (R0)“, bis bestätigt.

**Abnahmekriterien**
- [ ] Frontend und API laufen auf EU-Host ohne Requests an US-Dienste (Netzwerk-Test gegen Live-Build).
- [ ] Live-Build ist ohne Mock-Adapter; Modus `live` per Konfiguration.
- [ ] Löschjob-Test: Klasse mit `loeschdatum` in der Vergangenheit wird vollständig entfernt (Sitzungen, Teilnehmer, Ereignisse, Antworten, Profile); Backup-Frist dokumentiert.
- [ ] Export enthält nur Kinder mit `consent_research = true`, ohne Alias und Direktidentifikatoren; Export-Protokoll wird geschrieben (Test).
- [ ] Widerruf/vorzeitige Löschung eines Kindes entfernt dessen Daten (Test).
- [ ] Wiederherstellungstest aus Backup.
- [ ] Doc-Konformität zu 04 (TOM, Löschkonzept) bestätigt; offene Rechtsfragen sind weiterhin als „zu verifizieren (R0)“ geführt.

**Abhängigkeiten:** P4; Ergebnisse aus R0 (Hoster, AVV, Rechtsbewertung) und die Genehmigungen (04 §5). **Zeitlich: vor R3 (Mai 2027).**

---

## Offene Punkte für die Roadmap

- **EU-Hosting vor R2?** 04 §5 nennt „EU-Hosting aktiv“ für den Usability-Pilot (Mär–Apr 2027). Diese Roadmap verlegt den vollständigen Betrieb nach P5; falls R2 mit echten Kinderdaten läuft, muss mindestens die Hosting-Stufe 2 (Compose-Stack auf EU-Host) schon zu R2 stehen. Klärung in R0.
- Live-Kanal SSE vs. WebSocket (03 §11) – Entscheidung in P3.
- Sollen Lehrkräfte Einzelprofile sehen (01 §13, Punkt 3)? Entscheidung nach R1-Interviews, beeinflusst P3/P4-Cockpit.
