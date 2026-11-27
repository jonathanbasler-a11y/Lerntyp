# Lerntyp – Forschungsplan

> **Status:** Entwurf v0.1 (November 2026) · **Ergänzt:** [Forschungsdossier](research/00-dossier.md) · **Bezug:** [01-konzept.md](01-konzept.md), [02-lerndetektive-experiment.md](02-lerndetektive-experiment.md), [04-datenschutz-genehmigungen.md](04-datenschutz-genehmigungen.md)

## 1. Zweck

Das Dossier liefert die wissenschaftliche Begründung (keine Lerntypen, sechs Strategien, SRL) und den Rahmen (Bildungsplan, Recht, Schul-IT). Dieser Plan beschreibt, **was noch herausgefunden werden muss**, und zwar in zwei Teilen:

1. **Wissenslücken schließen** (Schreibtischforschung und Expertengespräche, §2), bevor gebaut und erhoben wird.
2. **Die App empirisch prüfen**: Co-Design, Usability-Pilot und Feldstudie (§3–§7).

## 2. Wissenslücken des Dossiers (Recherche-Aufgaben R0)

| Nr. | Lücke | Warum wichtig | Methode | Ergebnis |
|---|---|---|---|---|
| L1 | Mehrere Angaben stammen aus kommerziellen Prüfungsportalen (Kompass-4-Schwellen, Termine 2026/27, Verteilung G/M/E, Dossier §2.1) | Zeitplanung der Studie; keine falschen Behauptungen in Elterninfos | Abgleich mit Quellen von Kultusministerium und IBBW | Verifizierte Faktenliste; korrigiertes Dossier |
| L2 | Genehmigungsverfahren für Erhebungen an Schulen in BW: zuständige Stelle, Unterlagen, Fristen | Bestimmt den gesamten Zeitplan | Recherche der einschlägigen Verwaltungsvorschrift; Anfrage bei der zuständigen Stelle | Antragsfahrplan in [04](04-datenschutz-genehmigungen.md) |
| L3 | Frei nutzbare, kindgerechte deutsche Items zu Strategienutzung und SRL. FEESS, SESSKO und LSL sind lizenzpflichtig (Dossier §3.1). | Profil-Validierung ohne Lizenzkosten | Literaturrecherche (Dignath, Stoeger, Souvignier); Anfrage bei Autorinnen und Autoren | Itemliste mit Lizenzstatus oder Entscheidung für eigene Items |
| L4 | Erprobte Kreuzinteraktions- bzw. Modalitätsparadigmen für 9- bis 10-Jährige; faires Testformat ([02](02-lerndetektive-experiment.md) §6.2) | Validität von RQ1/RQ2 | Systematische Suche (Pashler et al. 2008 und Folgestudien; Studien zum Bildüberlegenheitseffekt bei Kindern) | Begründete Wahl des Paradigmas, ggf. Anpassung von 02 |
| L5 | Verhalten von PWAs auf Geteiltem iPad (Speicher-Löschung, Gastsitzungen, Web-Clips über Relution/Jamf, Kamera für QR) | Technische Machbarkeit im Klassenzimmer | Gerätetests mit 2–3 iPads im Shared-iPad-Modus; Gespräch mit Kreismedienzentrum | Testprotokoll; Anpassungen in [03](03-architektur.md) |
| L6 | Barrierefreiheit für DaZ und Leseschwäche: Sprachniveau, Audio, Symbole | Faire Teilnahme aller Kinder | Leitfäden für Einfache Sprache; Gespräch mit DaZ-Lehrkraft | Sprachleitfaden für alle App-Texte |
| L7 | Methoden zur UX-Evaluation mit Kindern (z. B. Fun Toolkit / Smileyometer, Think-Aloud mit Kindern) | Messinstrumente für R2 | Literaturrecherche | Instrumentenwahl für RQ4 |
| L8 | Normen für Benennungs-Übereinstimmung und Bildhaftigkeit sowie Wortfrequenz für Kinder (z. B. childLex) | Ausgewogene Item-Sets ([02](02-lerndetektive-experiment.md) §5.1) | Datenbank-Recherche; ggf. eigene Erhebung in R1 | Item-Sets A–F |
| L9 | Ausstattung der Pilotschulen: iPads, WLAN, **Kopfhörer**, MDM | Durchführbarkeit | Kurzumfrage bei interessierten Schulen | Ausstattungsprofil pro Schule |
| L10 | Rechtliche Einordnung der Demo-Stufe auf US-Hosting (GitHub Pages/Vercel) ohne Kinderdaten | Klarheit für Vorführungen an Schulen | Abstimmung mit einer oder einem Datenschutzbeauftragten | Freigabe oder Alternative |

## 3. Forschungsfragen und Hypothesen

| Nr. | Frage | Hypothese / Erwartung | Art |
|---|---|---|---|
| **RQ1** | Sagt die Vorliebe eines Kindes voraus, welche Bedingung ihm am meisten hilft? | **H1:** Es gibt keine bedeutsame Kreuzinteraktion Vorliebe × Bedingung (Äquivalenztest, §6). | konfirmatorisch |
| **RQ2** | Ist *Bild + Wort* allen Bedingungen überlegen, in allen Vorliebe-Gruppen? | **H2:** Es gilt `bild_wort` ≥ `bild` > `wort`, sofort und nach einer Woche. | konfirmatorisch |
| **RQ3** | Sinkt die Zustimmung zum Lerntyp-Mythos durch Experiment und Gespräch? | **H3:** Die Zustimmung zu `U1`/`U2` sinkt und die zu `U3` steigt vom Vorher zum Nachher, stärker als in der Wartekontrollgruppe. | konfirmatorisch (mit Kontrollgruppe) |
| **RQ4** | Lässt sich die Stunde in 45 + 15 Min. auf geteilten iPads durchführen? | Ziel: ≥ 90 % der Kinder schließen alle Phasen ab; ≤ 5 Min. technische Verzögerung pro Stunde | deskriptiv |
| **RQ5** | Wie akzeptieren Lehrkräfte die App, und wie nützlich finden sie sie? | Qualitativ: Nutzen, Aufwand, Bedenken (v. a. Missbrauch für Übergangsentscheidungen) | explorativ |
| **RQ6** | Erleben Kinder ihr Lernprofil als zutreffend und hilfreich, und probieren sie die Superkraft aus? | Ziel: Mehrheit gibt bei „Passt das zu dir?“ ein positives Smiley; Selbstauskunft in der Folgestunde | explorativ |

## 4. Phasen und Zeitplan

Heute ist der 27.11.2026. Die Phase von Kompass 4 und der Grundschulempfehlung (bis Ende Februar 2027, Dossier §2.1, *Termine zu verifizieren, L1*) wird für Erhebungen mit Kindern **gemieden**.

| Phase | Zeitraum | Inhalt | Ergebnis / Tor |
|---|---|---|---|
| **R0 Grundlagen** | Dez 2026 – Jan 2027 | L1–L10; Partnerschaft mit einer Pädagogischen Hochschule; Anträge (Ethikvotum, Schulbehörde) einreichen; Simulation zur Stichprobengröße | **Tor 0:** Anträge eingereicht; Paradigma festgelegt |
| **R1 Co-Design** | Jan – Feb 2027 | 5–8 Interviews mit Lehrkräften; 2 Co-Design-Runden mit je 4–6 Kindern (Papierprototypen; Verständlichkeit von U/V-Items; Benennungstest der Bilder); außerhalb des Unterrichts, mit Einwilligung | **Tor 1:** Konzept und Items überarbeitet; Klick-Prototyp |
| **R2 Usability-Pilot** | Mär – Apr 2027 | 1–2 Klassen; komplette Stunde + Folgestunde mit App-Version P4; Think-Aloud mit 4–6 Kindern; Messung von Zeiten, Deckeneffekt, Sync-Verlusten | **Tor 2:** RQ4-Ziele erreicht; Itemzahl/Timing fixiert; **Präregistrierung (OSF)** |
| **R3 Feldstudie** | Mai – Jul 2027 | 6–10 Klassen (Ziel ca. 150 Kinder mit Einwilligung, bestätigt durch Simulation); die Hälfte als Wartekontrolle (RQ3) | **Tor 3:** Datensatz komplett; Löschfristen eingeleitet |
| **R4 Auswertung und Bericht** | Aug – Okt 2027 | Analyse nach Präregistrierung; Rückmeldung an Schulen (Klassenebene); Bericht und ggf. Publikation | Bericht; Entscheidung über die Weiterentwicklung |

**Planungsregeln:**
- Die Folgestunde (+7 Tage) darf **nicht über Ferien** fallen. Die Pfingstferien in BW werden berücksichtigt (*Termine 2027 zu verifizieren*).
- Verzögern sich die Genehmigungen, rückt R2 auf Mai und R3 auf Juni/Juli. Als Notfall-Option gilt R3 im September/Oktober 2027, vor der Kompass-4-Phase. Die Kinder sind dann aber Klasse-4-Neulinge.

## 5. Studiendesign Feldstudie (R3)

### 5.1 Design

- **Innerhalb der Kinder:** Bedingung (3) × Testzeitpunkt (sofort / +7 Tage), ausbalanciert über Rotationen ([02](02-lerndetektive-experiment.md) §5.3).
- **Zwischen den Kindern:** Vorliebe-Gruppe (gemessen, nicht zugewiesen).
- **Zwischen den Klassen (RQ3):** **Wartekontrollgruppe**, randomisiert auf Klassenebene.
  - Kontrollklassen beantworten `U1`–`U3` zweimal im Abstand von einer Woche, ohne Experiment.
  - Danach bekommen sie die vollständige Stunde, damit keine Klasse benachteiligt wird.

### 5.2 Stichprobe

- **Einschluss:** Klassen der Stufe 4 an öffentlichen Grundschulen in BW. Kinder nehmen am Unterricht teil, unabhängig von der Einwilligung. In die Analyse gehen nur Kinder mit Einwilligung (der Sorgeberechtigten) **und** Zustimmung (des Kindes) ein.
- **Größe:**
  - Die Planung erfolgt per **Simulation** in R0, mit Effektannahmen aus der Literatur und aus R2.
  - Als Orientierung: Für H2 (Bildüberlegenheit, meist mittlerer bis großer Effekt) genügen deutlich unter 100 Kinder.
  - Treibend sind **H1 (Äquivalenztest der Interaktion)** und **H3 (Klassen-Cluster)**. Daher das Ziel von ca. 150 Kindern in 6–10 Klassen.
- **Einwilligungsquote:** Ziel ≥ 70 %. Sie wird als möglicher Selektions-Bias berichtet.

### 5.3 Instrumente

| Konstrukt | Instrument | Quelle |
|---|---|---|
| Wiedererkennung pro Bedingung | Test nach [02](02-lerndetektive-experiment.md) §6 | eigen |
| Vorliebe und Vermutung | `V1`–`V4` | eigen, Verständlichkeit in R1 geprüft |
| Überzeugungen | `U1`–`U3` | angelehnt an Nancekivell et al.; adaptiert, R1 |
| Lernverhalten (Prozess) | Indikatoren aus [01](01-konzept.md) §7.3 | eigen |
| Profil-Erleben (RQ6) | „Passt das zu dir?“ (Smileyometer); „Ausprobiert?“ in der Folgestunde | eigen / Fun Toolkit (L7) |
| Durchführbarkeit (RQ4) | Protokolldaten: Phasenzeiten, Abschlussquoten, Sync-Verluste, Ton-Probleme | automatisch |
| Lehrkraft-Akzeptanz (RQ5) | Leitfadeninterview (15 Min.) und Kurzfragebogen | eigen, R1 entworfen |

## 6. Auswertungsplan (Grundzüge; Details in der Präregistrierung)

| Frage | Modell | Entscheidungsregel |
|---|---|---|
| RQ2 | Generalisiertes lineares gemischtes Modell auf Item-Ebene (Signalentdeckungs-Ansatz: Antwort „dabei“ ~ alt/neu × Bedingung × Testzeitpunkt). Zufallseffekte: Kind (mit Bedingungs-Steigung, falls konvergent), Klasse, Item. | Geplante Kontraste `bild_wort` vs. `wort` und `bild` vs. `wort`; α = .05 |
| RQ1 | Wie RQ2, plus Vorliebe-Gruppe × Bedingung | (a) Likelihood-Ratio-Test der Interaktion. (b) **Äquivalenztest** (TOST) mit kleinstem interessierenden Effekt (SESOI, in R0 festgelegt, z. B. 5 Prozentpunkte Unterschied im Passungsvorteil). (c) Bayes-Faktor als Ergänzung. |
| RQ1 (individuell, anschaulich) | Anteil der Kinder, deren Vermutung (`V4`) ihrer tatsächlich besten Bedingung entspricht | Vergleich mit einer **Permutations-Baseline** (Vermutungen zwischen Kindern vertauscht). Nicht mit 1/3 vergleichen, da sonst die Bildüberlegenheit als „Treffer“ zählt. |
| RQ3 | Ordinal-/multinomiales gemischtes Modell: Antwort ~ Zeitpunkt × Gruppe (Experiment/Kontrolle); Zufallseffekte Kind und Klasse | Interaktion Zeitpunkt × Gruppe; α = .05 |
| RQ4–RQ6 | Deskriptiv; qualitative Inhaltsanalyse der Interviews | Zielwerte aus §3 |

- **Fehlende Werte:** Gemischte Modelle nutzen alle vorhandenen Daten (MAR-Annahme). Fehlende verzögerte Tests werden berichtet.
- **Ausschlüsse:** `audio_ok=false` (in der Bedingung `wort`), abgebrochene Lernphase, Rate- bzw. Antwortmuster (z. B. > 95 % gleiche Antwort). Die Ausschlussregeln werden vorab festgelegt.
- **Werkzeuge:** R (`lme4`/`glmmTMB`, `TOSTER`, `brms` für Bayes). Analyse-Skripte werden versioniert. Anonymisierte Daten werden nur geteilt, wenn die Einwilligung dies erlaubt ([04](04-datenschutz-genehmigungen.md)).

## 7. Ethik und Schutz der Kinder

- Kein Kind erhält ein Lerntyp-Etikett oder ein Einzelergebnis aus dem Experiment ([02](02-lerndetektive-experiment.md) §1).
- Die Teilnahme am Unterricht ist für alle Kinder gleich. Forschungsdaten gibt es nur bei Einwilligung **und** Zustimmung. Der Widerruf ist jederzeit möglich, ohne Nachteile.
- Die Ergebnisse werden **nicht** für Grundschulempfehlung oder Kompass 4 verwendet. Das wird Lehrkräften schriftlich mitgeteilt und im Cockpit angezeigt.
- **Belastung:** kurze Phasen, Pause-Knopf, kein Leistungsdruck. Die Lehrkraft kann jederzeit abbrechen.
- **Ethikvotum:** über die Partner-Hochschule (R0), *Verfahren zu verifizieren*.

## 8. Rollen

| Rolle | Aufgabe |
|---|---|
| Projektleitung | Gesamtsteuerung, Schulkontakte, Entscheidungen an den Toren |
| Wissenschaftliche Partnerin / Partner (PH) | Methodik, Ethikvotum, Auswertung, Publikation |
| Lehrkräfte der Pilotklassen | Durchführung, Interviews, Rückmeldung |
| Entwicklung | App nach [PLAN.md](../PLAN.md), Datenexport, Löschjobs |
| Datenschutzbeauftragte/r (Schule bzw. Träger) | Prüfung von AVV und Datenschutz-Folgenabschätzung, Freigabe |

## 9. Risiken

| Risiko | Wahrscheinlichkeit | Folge | Gegenmaßnahme |
|---|---|---|---|
| Genehmigungen dauern länger | mittel | R2/R3 verschieben sich | Anträge früh in R0; Notfall-Option Herbst 2027 (§4) |
| Niedrige Einwilligungsquote | mittel | Kleine, verzerrte Stichprobe | Elternabend, verständlicher Brief, Kurzvideo; mehr Klassen ansprechen |
| Deckeneffekt in der Wiedererkennung | mittel | RQ1/RQ2 nicht prüfbar | In R2 messen; Itemzahl und Timing anpassen (Tor 2) |
| Zufällige Kreuzinteraktion in einer Klasse | mittel (bei kleinen Gruppen) | Mythos wird scheinbar bestätigt | Gesprächsleitfaden „Eine Klasse ist eine kleine Gruppe“ ([02](02-lerndetektive-experiment.md) §7.2) |
| Missbrauch der Profile für Übergangsentscheidungen | niedrig bis mittel | Ethisches Problem | Zweckbindung, Hinweise, keine Leistungswerte im Profil, Zeitfenster außerhalb der Übergangsphase |
| WLAN- oder Geräteprobleme | hoch | Datenverlust, Zeitverlust | Offline-first, Lernausweis, Gerätetest in R0 (L5) |
| Kopfhörer fehlen | mittel | Bedingung `wort` ohne Ton | Ausstattungsabfrage (L9); Leih-Kopfhörer-Set im Projektbudget |

## 10. Offene Entscheidungen

1. Partner-Hochschule und Ansprechperson (R0).
2. SESOI für den Äquivalenztest (R0, mit Partnerin oder Partner).
3. Wartekontrolle: ist sie für die Schulen akzeptabel? Alternative: Vorher-Nachher ohne Kontrolle, mit entsprechend schwächerer Aussage zu RQ3.
4. Budget: Illustrationen, Sprachaufnahmen, Leih-Kopfhörer, EU-Hosting.
