# Lerntyp – Produktkonzept

> **Status:** Entwurf v0.1 (November 2026) · **Quelle:** [Forschungsdossier](research/00-dossier.md) · **Rang:** Dieses Dokument ist verbindlich für alle weiteren Dokumente und den Code. Widersprüche werden gemeldet, nicht stillschweigend aufgelöst.

## 1. Kurzfassung

*Lerntyp* ist eine Tablet-App für **Klassenstufe 4 in Baden-Württemberg** (9–10 Jahre), die eine **ganze Klasse gemeinsam in einer Unterrichtsstunde** nutzt. Die Kinder gehen der Frage nach: **„Wie lerne ich am besten?“**

Die App beantwortet diese Frage **nicht** mit einem Lerntyp-Etikett („Du bist ein visueller Typ“). Stattdessen bekommt jedes Kind:

1. **Lerndetektive:** Die Klasse prüft die Lerntyp-Idee in einem gemeinsamen Experiment. Das erwartete Ergebnis: *Bild + Wort hilft allen.*
2. **Strategie-Parcours:** Kurze Deutsch- und Mathe-Aufgaben nach Bildungsplan V2, bei denen die App beobachtet, *wie* ein Kind lernt (planen, dranbleiben, Hilfen nutzen, sich einschätzen).
3. **Mein Lernprofil:** drei konkrete Stärken und eine *Lern-Superkraft* zum Üben, beschrieben als Verhalten, nicht als Eigenschaft.

## 2. Warum keine Lerntyp-Etiketten

| Befund (Dossier §1.1) | Konsequenz für das Produkt |
|---|---|
| Die Passungshypothese („Unterricht passend zum Lerntyp verbessert Lernen“) ist empirisch nicht überzeugend belegt. In Meta-Analysen ist der Passungseffekt nahe null; wo kleine Effekte gefunden wurden (z. B. g = 0,31 über 21 Studien), zeigte sich die nötige Kreuzinteraktion nur selten. Das ist zu selten und zu klein, um Kinder nach Typen zu sortieren. | Die App ordnet keinem Kind einen Typ zu und filtert keine Inhalte nach Typ. |
| Wer Lerntypen als angeboren versteht (Essentialismus), läuft Gefahr, Lernschwierigkeiten als dauerhaft „falsche Passung“ zu deuten. | Profile beschreiben, was ein Kind **heute getan hat**, nicht, was es **ist**. |
| Über 97 % der Lehramtsstudierenden stimmen dem Mythos zu. Gut erklärende Interventionen reduzieren diesen Glauben deutlich und dauerhaft (d ≈ 1,8–2,0). | Das Klassenexperiment und der Elternbrief nutzen diesen Conceptual-Change-Ansatz. |

**Positionierung:** Wir nehmen die Frage nach dem Lerntyp ernst und lassen die Kinder sie **selbst überprüfen**. „Lerntyp“ bleibt Projektname. In der Kinder-App erscheinen nur *Lerndetektive* und *Mein Lernprofil*. Der endgültige Produktname wird in der Co-Design-Phase R1 festgelegt (siehe [Forschungsplan](05-forschungsplan.md)).

## 3. Zielgruppen und Einsatzsetting

| Gruppe | Rolle | Kernbedürfnis |
|---|---|---|
| Kinder, Klasse 4 (9–10 J.) | Nutzen die App auf dem Tablet | Spannend, verständlich, nicht kindisch; Erfolgserlebnisse ohne Druck |
| Lehrkräfte Klasse 4 | Steuern die Stunde über das Lehrkraft-Cockpit (Beamer) | In 45 Minuten ohne Vorbereitung durchführbar; brauchbare Einsicht in das Lern- und Arbeitsverhalten der Klasse |
| Eltern / Sorgeberechtigte | Informieren sich und willigen in die Forschung ein | Verständliche Erklärung, Datenschutz, kein Konto nötig |
| Forschende | Werten pseudonymisierte Daten aus | Saubere Prozessdaten, Einwilligungsstatus, Export |

**Setting:**
- Eine Schulstunde (45 Min.) plus eine **Folgestunde (15 Min.) eine Woche später** für den verzögerten Test.
- Geteilte Schul-iPads (1:1, notfalls 1:2), ein Lehrkraftgerät am Beamer, **Kopfhörer pro Tablet** (wegen der Audio-Bedingung im Experiment).
- **Zeitfenster im Schuljahr:** nicht während der Übergangsphase Kompass 4 / Grundschulempfehlung (Mitte November bis Ende Februar, Dossier §2.1; *Termine zu verifizieren, R0/L1*). Bevorzugt März bis Juli.

## 4. Leitprinzipien

| Nr. | Prinzip | Herkunft |
|---|---|---|
| P1 | **Verhalten statt Etikett.** Kein Typ, kein Niveau, keine Note, kein Vergleich mit anderen Kindern. | Dossier §1.1 |
| P2 | **Sechs Lernstrategien** (Abschnitt 5) ersetzen Lerntypen. Bild und Wort werden nach dem Inhalt kombiniert, nicht nach der Person. | Dossier §1.2 |
| P3 | **SRL-Schleife *Planen – Üben – Prüfen*** in jeder Aufgabe, mit Hilfen, die schrittweise zurückgenommen werden (Scaffolding). | Dossier §1.3, §6.3 (3) |
| P4 | **Prozessdaten statt Fragebögen:** Ein-Tipp-Einschätzungen und Verhaltensspuren, keine Likert-Inventare. | Dossier §3.2 |
| P5 | **Null Dark Patterns:** keine Streaks, Countdowns zur Druckerzeugung, Ranglisten, Lootboxen oder Endlosschleifen; jede Sitzung hat ein klares Ende. | Dossier §4.3 |
| P6 | **Datenschutz durch Technik:** Alias statt Name, keine Drittanbieter, EU-Hosting im Pilotbetrieb. | Dossier §5, [04](04-datenschutz-genehmigungen.md) |
| P7 | **Klasse zuerst:** Die App ist für die gemeinsame Stunde gebaut, nicht für das Spielen allein zu Hause. | Auftrag |
| P8 | **Nicht für Auslese:** Ergebnisse dienen dem Lernen, **nicht** der Grundschulempfehlung oder Kompass 4. | Dossier §2.1 |

## 5. Die sechs Lernstrategien in Kindersprache

| Strategie (Fachbegriff) | Kindername | So zeigt sie die App |
|---|---|---|
| Aktiver Abruf / Testeffekt | **Gedächtnis-Training** | „Erst selbst erinnern, dann nachschauen“: Mini-Quiz statt Nochmal-Lesen |
| Verteiltes Lernen | **Häppchen-Lernen** | Verzögerter Test nach einer Woche; Wiederholungs-Tipp für zu Hause |
| Duale Kodierung | **Doppelt merken** | Ergebnis der Lerndetektive: Bild + Wort |
| Verschachteltes Üben | **Mischen** | Gemischte Aufgaben im Parcours (z. B. *Verlängern* und *Ableiten* abwechselnd) |
| Elaboration | **Warum-Fragen** | „Warum schreibt man *Hund* mit *d*?“ Begründen mit einer Strategie |
| Konkrete Beispiele / Lösungsbeispiele | **Beispiele** | Ein Musterbeispiel, das man vor der Aufgabe öffnen kann |

Diese sechs Strategien sind die einzigen *Lern-Superkräfte* der App. Jedes Kind kann **alle** lernen.

## 6. Ablauf der Unterrichtsstunde

### 6.1 Hauptstunde (45 Min.)

| Zeit | Phase | Kinder-Tablet | Lehrkraft / Beamer | Erhobene Daten |
|---|---|---|---|---|
| 0–5 | **Start** | Lernausweis-QR scannen, Kopfhörer aufsetzen, Ton-Check | Sitzung starten, QR-Code der Sitzung zeigen, Beitrittsliste (Aliase) | Beitritt, Gerätewechsel |
| 5–25 | **Lerndetektive** | Überzeugungs-Aussagen → Vorliebe-Fragen und Vermutung → Lernphase in 3 Bedingungen → Pause-Aufgabe → Sofort-Test | Steuert die Phasen synchron; danach Klassenergebnis am Beamer und Gespräch | Überzeugungen, Vorlieben, Antworten pro Bedingung, Zeiten (siehe [02](02-lerndetektive-experiment.md) §2) |
| 25–40 | **Strategie-Parcours** | 3 Stationen mit *Planen – Üben – Prüfen* | Live-Fortschritt **nur auf dem Lehrkraftgerät**, nicht am Beamer: wer wo ist und wer Hilfe braucht (ohne Leistungsanzeige) | Prozessspuren (Abschnitt 7.3) |
| 40–45 | **Mein Lernprofil** | Drei Stärken-Karten, eine Lern-Superkraft, Tipp für zu Hause; „Passt das zu dir?“ (4 Smileys) | Abschluss: „Welche Superkraft probierst du diese Woche?“ | Gewählte Superkraft, Profil-Erleben (RQ6) |

### 6.2 Folgestunde (15 Min., eine Woche später)

Verzögerter Test der Lerndetektive-Inhalte (ohne erneutes Lernen), danach die Überzeugungs-Aussagen (nachher). Am Beamer folgt der Vergleich „sofort vs. nach einer Woche“, was das *Häppchen-Lernen* sichtbar macht, mit Nachbesprechung des Mythos. Zum Schluss eine kurze Reflexion: „Hast du deine Superkraft ausprobiert?“ (ja / ein bisschen / nein). Der Zeitplan steht in [02](02-lerndetektive-experiment.md) §2.

## 7. Module

### 7.1 Start und Lernausweis

- Die Lehrkraft druckt vorab **Lernausweise**: Karten mit Alias (z. B. „Fuchs-27“), Tiersymbol und QR-Code. Die Zuordnung Alias ↔ Kind steht **nur auf einer Papierliste** bei der Lehrkraft.
- Mit ihrem Ausweis können Kinder an jedem Tablet weitermachen (Geteiltes iPad, Gerätetausch, Akku leer).
- Ein Ton-Check stellt sicher, dass Kopfhörer funktionieren. Wenn nicht, meldet das Tablet es der Lehrkraft (wichtig für die Experimentbedingung *Wort*).

### 7.2 Lerndetektive

Gemeinsames Klassenexperiment zur Lerntyp-Frage. Die vollständige Spezifikation steht in [02-lerndetektive-experiment.md](02-lerndetektive-experiment.md). Kernregeln:
- Vorlieben werden erhoben, aber **nie als Etikett an ein einzelnes Kind** zurückgegeben.
- Die Ergebnisse werden auf **Klassenebene** am Beamer gezeigt.
- Die Botschaft lautet: „Bild und Wort zusammen helfen fast allen, egal was man am liebsten mag.“

### 7.3 Strategie-Parcours

Drei Stationen à ca. 5 Minuten, angelehnt an den Bildungsplan BW V2 (Dossier §2.2):

| Station | Fach / Bildungsplanbezug | Aufgabe | Eingebaute Strategien |
|---|---|---|---|
| S1 **Wort-Werkstatt** | Deutsch 3.2.1 Rechtschreiben, Grundwortschatz BW | Lückenwörter mit *d/t*, *g/k*, *b/p*, *e/ä* entscheiden und mit *Verlängern* oder *Ableiten* begründen | Warum-Fragen, Mischen, Gedächtnis-Training |
| S2 **Satz-Baukasten** | Deutsch 3.2.2 Sprache untersuchen | *Umstellprobe* per Drag-and-drop, Satzglieder in Farbblöcken | Doppelt merken, Beispiele |
| S3 **Würfel-Baumeister** | Mathe 3.2.2 Raum und Form | Würfelgebäude ↔ Bauplan zuordnen; vorher ein Musterbeispiel | Beispiele, Doppelt merken |

**Jede Station folgt der SRL-Schleife:**

1. **Planen:** „Wie viele von 5 schaffst du?“ (Ziel wählen) und „Wie sicher bist du?“ (4 Smileys).
2. **Üben:** Aufgaben lösen. Das Musterbeispiel und gestufte Hinweise (1: Strategie-Tipp, 2: Teil-Lösung) sind jederzeit freiwillig verfügbar. Nach einem Fehler gibt es eine sofortige, erklärende Rückmeldung und einen zweiten Versuch.
3. **Prüfen:** Ergebnis neben dem eigenen Ziel und der Einschätzung („Du hast dein Ziel erreicht“ bzw. „Du hast 4 geschafft, du hattest 3 geplant“) und die Frage: „Was hat dir geholfen?“ (Auswahl aus Strategie-Symbolen).

   *Ausnahme von der Zahlen-Regel:* Nur hier sieht das Kind eine Anzahl, und zwar ausschließlich als Vergleich mit **seinem eigenen** Ziel. Das ist Selbstkalibrierung, keine Bewertung. Es gibt keine Punkte, keine Prozentwerte und keine Vergleiche mit anderen; im Lernprofil erscheinen keine Zahlen (§7.4).

**Prozessspuren** (Definition der Ereignisse in [03-architektur.md](03-architektur.md)):

| Indikator | Ereignis(se) | Bezug Lern- und Arbeitsverhalten |
|---|---|---|
| Planen | Ziel gesetzt; Abstand Ziel ↔ Ergebnis | Selbsterwartungen |
| Dranbleiben | Zweiter Versuch nach Fehler statt Überspringen | Ausdauer, Umgang mit Rückschlägen |
| Hilfen nutzen | Musterbeispiel geöffnet, Hinweisstufe, Zeitpunkt | Selbstständigkeit |
| Selbsteinschätzung | Zuversicht vorher ↔ Ergebnis (Kalibrierung) | Selbsterwartungen |
| Strategie-Bewusstsein | Antwort auf „Was hat geholfen?“; Begründung in S1 | Metakognition |

„Abstand Ziel ↔ Ergebnis“ und die Zuversicht-Kalibrierung hängen von der Richtigkeit der Antworten ab; sie sind **ausschließlich Forschungsdaten** und fließen nie in die Karten des Lernprofils (§7.4) ein.

Der Schwierigkeitsgrad liegt bewusst im grundlegenden bis mittleren Bereich. Im Parcours geht es um Lernverhalten, nicht um Leistungsdiagnostik. Es werden **keine Niveaustufen (G/M/E) angezeigt**.

### 7.4 Mein Lernprofil

**Zusammensetzung:** aus den Indikatoren in 7.3 und der Teilnahme an den Lerndetektiven. **Nicht** aus der Anzahl richtiger Antworten.

**Ausgabe für das Kind:**
- **Drei Stärken-Karten.** Jede beschreibt ein **beobachtetes Verhalten** in der Vergangenheitsform und mit Bezug zur Station, z. B. „Beim Satz-Baukasten hast du nach einem Fehler noch einmal probiert, und es hat geklappt.“
- **Eine Lern-Superkraft zum Üben.** Das ist die Strategie mit dem größten Entwicklungsspielraum, positiv formuliert: „Probier diese Woche das *Gedächtnis-Training*: Deck die Wörter ab und erinnere dich selbst.“
- **Ein Tipp für zu Hause** (eine Zeile, auch als Ausdruck für die Eltern).

**Sprachregeln (verbindlich, im Code als Textbausteine in `/data`):**

| Erlaubt | Verboten |
|---|---|
| „Du hast …“, „Heute hat dir … geholfen“ | „Du bist ein …-Typ“, „Du lernst am besten mit …“ |
| Konkrete Station und konkretes Verhalten | Prozentwerte, Punkte, Noten, Niveaus |
| Wachstum: „Das kannst du trainieren“ | Vergleiche mit der Klasse oder mit anderen Kindern |

Karten und Lern-Superkraft werden ausschließlich aus Verhaltensindikatoren abgeleitet (Ziel gesetzt, Beispiel geöffnet, Hinweis genutzt, zweiter Versuch nach Fehler, Begründung gewählt, „Was hat geholfen?“ beantwortet, Teilnahme an den Lerndetektiven); Abstand Ziel ↔ Ergebnis und Zuversicht-Kalibrierung (§7.3) sind reine Forschungsdaten und gehen nie in die Karten ein, damit das Profil unabhängig von der Richtigkeit bleibt.

Gibt es zu wenige Daten (z. B. abgebrochene Sitzung), zeigt die App eine allgemeine, ermutigende Karte statt eines Profils.

### 7.5 Lehrkraft-Cockpit

| Ansicht | Inhalt | Nicht enthalten |
|---|---|---|
| **Sitzung steuern** | Phasen starten, pausieren und beenden (alle Tablets synchron); Beitritts-QR | – |
| **Live-Fortschritt** (nur Lehrkraftgerät, nie am Beamer) | Alias, aktuelle Phase oder Station, Handzeichen „Ich brauche Hilfe“, Ton-Problem | Punktzahlen, Ranglisten |
| **Klassenergebnis Lerndetektive** | Beamer-Grafik: Behaltensleistung nach Bedingung für **alle** Kinder; optional aufgeteilt nach der **Vermutung** der Kinder (jede gezeigte Gruppe ≥ 5 Kinder, sonst „Andere“); Gesprächsleitfaden ([02](02-lerndetektive-experiment.md) §7) | Einzelergebnisse, Gruppen nach „Typ“ |
| **Einzelprofile** | Pro Alias die Stärken-Karten und die Superkraft, dazu die Indikatoren in Worten | Ergebnisse aus den Lerndetektiven (Vorlieben, Wiedererkennung), Vergleichswerte, Ranking |
| **Vorbereitung** | Lernausweise drucken, Elternbrief, Einwilligungsstatus pro Alias setzen | Namen |

Jede Ansicht mit Kinderdaten trägt den Hinweis: **„Nur zur Lernbegleitung – nicht für die Grundschulempfehlung oder Kompass 4.“** Diese Formulierung ist verbindlich; alle anderen Dokumente und der Code verwenden genau diesen Wortlaut.

**Mindestgröße für Aggregate:** Jede in einer Grafik oder im Cockpit gezeigte Teilgruppe umfasst **mindestens 5 Kinder**. Kleinere Gruppen werden zu „Andere“ zusammengefasst.

### 7.6 Eltern

- **Elternbrief** (Entwurf in [04](04-datenschutz-genehmigungen.md)): Was die Kinder machen, warum es keine Lerntypen gibt (kurz und alltagssprachlich) und Datenschutz.
- **Profil zum Mitnehmen:** ein Ausdruck der Profilkarten mit dem Tipp für zu Hause. Kein Elternkonto, kein Login, keine App-Installation.

## 8. Gestaltungsregeln (UX)

- **Altersgerecht, nicht kindisch:** klare Flächen, viel Weißraum, ruhige Farbpalette, keine Comic-Maskottchen als Dekoration (Dossier §4.2). Bilder nur, wenn sie Inhalt tragen.
- **Text in Häppchen:** maximal 2 kurze Sätze pro Bildschirm. Jeder Text hat einen **Vorlese-Knopf**.
- **Touch:** große Ziele (mind. 48 × 48 pt), keine Gesten außer Tippen und Ziehen.
- **Rückmeldung:** sofort, sachlich und erklärend („*Hund* → verlängere: *Hunde*, man hört *d*“). Kein Fehler-Ton, keine roten Kreuze.
- **Belohnung:** keine Punkte oder Münzen (die Anzahl gelöster Aufgaben im Prüfen-Schritt ist keine Belohnung, sondern Selbstkalibrierung, §7.3). Abschlussmomente sind die Profilkarten und die Klassenauswertung.
- **Klares Ende:** Nach „Mein Lernprofil“ kommt ein Abschlussbildschirm „Fertig für heute“. Es gibt keinen Weiter-Knopf zu neuen Inhalten.
- **Verbotene Muster (Dossier §4.3, DSA Art. 25):** Streaks, Countdown-Druck, FOMO-Hinweise, Ranglisten, Lootboxen, Zufallsbelohnungen, Autoplay, Endlos-Feeds, In-App-Käufe, externe Links.

## 9. Barrierefreiheit und Sprache

- **DaZ und Leseschwäche:** Vorlesefunktion für alle Texte (vorproduzierte Audiodateien mit einer synthetischen Stimme, siehe [02](02-lerndetektive-experiment.md) §5.1; keine Sprachausgabe zur Laufzeit), einfache Sätze, Bildunterstützung.
- **Kein Zeitdruck** im Parcours. Die festen Darbietungszeiten im Experiment sind kein Leistungsdruck und werden den Kindern als „Detektiv-Regel“ erklärt.
- **Farbsehschwäche:** Farben nie als einziges Unterscheidungsmerkmal (Satzglieder haben Farbe **und** Form oder Symbol).
- **Motorik:** Drag-and-drop hat immer eine Tipp-Alternative.

## 10. Bewusste Nicht-Ziele

- Keine Lerntyp-Diagnose, keine Niveau- oder Notenvorhersage, keine Vorbereitung auf Kompass 4 oder den Potenzialtest.
- Kein Heimgebrauch-Abo, keine Werbung, keine In-App-Käufe (in dieser Projektphase).
- Kein Chat, keine nutzergenerierten Inhalte, keine offenen Weblinks (JMStV, Dossier §5.1).
- Keine psychometrischen Langfragebögen (FEESS, MSLQ o. Ä.) im Produkt.

## 11. Rückverfolgbarkeit: Dossier §6.3 → Konzept

| Nr. | Empfehlung (Dossier §6.3) | Umsetzung | Status |
|---|---|---|---|
| 1 | Keine Lerntyp-Sortierung; Bild und Wort nach Inhalt; Elternhinweis | §2, §5, §7.2, §7.6; [02](02-lerndetektive-experiment.md) | ✅ abgedeckt |
| 2 | Curriculum-Engine BW Kl. 4 (Deutsch und Mathe V2, G/M/E) | §7.3 mit drei Stationen nach V2. G/M/E und Kompass-4-Vorbereitung sind bewusst **ausgeschlossen** (P8) | ◐ teilweise (bewusst eingegrenzt) |
| 3 | SRL-Schleife *Planen – Üben – Prüfen* | §7.3 | ✅ abgedeckt |
| 4 | Prozessdaten statt langer Fragebögen | P4, §7.3, [03](03-architektur.md) | ✅ abgedeckt |
| 5 | Altersgerechte UX ohne Dark Patterns | P5, §8 | ✅ abgedeckt |
| 6 | Rechtskonformität (B2C und B2B) | Schul- und Forschungsspur in [04](04-datenschutz-genehmigungen.md); B2C-Abo ist Nicht-Ziel (§10) | ◐ teilweise (nur Schule und Forschung) |
| 7 | BW-Schul-IT-Kompatibilität (Geteiltes iPad, MDM, AVV, SCHULE@BW) | §7.1 Lernausweis; [03](03-architektur.md), [04](04-datenschutz-genehmigungen.md) | ✅ konzipiert; Details zu verifizieren (R0) |

## 12. Begriffe

| Begriff | Bedeutung |
|---|---|
| **Alias** | Pseudonym eines Kindes (z. B. „Fuchs-27“); einzige Kennung im System |
| **Lernausweis** | Gedruckte Karte mit Alias, Symbol und QR-Code |
| **Sitzung** | Eine durchgeführte Unterrichtsstunde einer Klasse |
| **Bedingung** | Darbietungsform im Experiment: `wort`, `bild`, `bild_wort` |
| **Prozessspur** | Protokolliertes Lernverhalten (Ereignisse), siehe §7.3 |
| **Lernprofil** | Momentaufnahme aus drei Stärken-Karten und einer Lern-Superkraft |
| **Lern-Superkraft** | Eine der sechs Lernstrategien aus §5 |

## 13. Offene Punkte

1. Endgültiger Produktname für Kinder (Co-Design R1).
2. Wie viele Kopfhörer sind an Pilotschulen vorhanden? Wenn keine da sind: Fallback für die Bedingung `wort` (siehe [02](02-lerndetektive-experiment.md), §8).
3. ~~Sollen Lehrkräfte Einzelprofile sehen?~~ **Entschieden:** ja, aber nur Profilkarten und Indikatoren in Worten, nie Experimentergebnisse (§7.5). Überprüfung nach den Lehrkraft-Interviews in R1.
4. Inhalte der drei Parcours-Stationen mit Lehrkräften abstimmen (R1). Sollen OER vom Landesbildungsserver (CC BY 4.0) genutzt werden?
