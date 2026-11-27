# Lerndetektive – Spezifikation des Klassenexperiments

> **Status:** Entwurf v0.1 (November 2026) · **Übergeordnet:** [01-konzept.md](01-konzept.md) §7.2 · **Forschungsfragen und Auswertung:** [05-forschungsplan.md](05-forschungsplan.md) · **Ereignis-Envelope:** [03-architektur.md](03-architektur.md) §4.4

## 1. Ziel

**Didaktisch:** Die Klasse prüft selbst die Vermutung „Jedes Kind hat einen Lerntyp und lernt am besten in seiner Lieblingsform“. Die Kinder erleben, dass **Bild und Wort zusammen** den meisten hilft, unabhängig von ihrer Vorliebe (Dossier §1.1, §1.2).

**Forschung** (Details in [05](05-forschungsplan.md)):
- **RQ1:** Sagt die Vorliebe eines Kindes voraus, welche Bedingung ihm am meisten hilft (Kreuzinteraktion)?
- **RQ2:** Ist *Bild + Wort* in allen Vorliebe-Gruppen überlegen?
- **RQ3:** Verändern sich die Überzeugungen der Kinder zu Lerntypen vom Vorher zum Nachher?

**Unverrückbare Regel:** Kein Kind bekommt seine Vorliebe oder sein Einzelergebnis als Etikett zurück. Ergebnisse gibt es nur auf Klassenebene.

## 2. Ablauf im Überblick

| Teil | Dauer | Inhalt |
|---|---|---|
| **Hauptstunde** | ca. 20 Min. | |
| 0 Ton-Check | 1 Min. | Kopfhörer prüfen (`audio_check`) |
| 1 Überzeugungen (vorher) | 1,5 Min. | 3 Aussagen (§3) |
| 2 Vorlieben und Vermutung | 1,5 Min. | 4 Fragen (§4) |
| 3 Lernphase | ca. 3,5 Min. | 36 Dinge, je 4 s, in 3 Bedingungen (§5) |
| 4 Pause-Aufgabe | 1 Min. | „Sterne zählen“, verhindert Wiederholen im Kopf |
| 5 Sofort-Test | ca. 5 Min. | 72 Wiedererkennungs-Entscheidungen (§6) |
| 6 Klassenergebnis und Gespräch | ca. 6 Min. | Beamer-Grafik und Gesprächsleitfaden (§7) |
| **Folgestunde (+7 Tage)** | ca. 15 Min. | |
| 7 Verzögerter Test | ca. 5 Min. | Gleiche 36 Dinge, neue Ablenker (§6) |
| 8 Überzeugungen (nachher) | 1,5 Min. | Dieselben 3 Aussagen |
| 9 Vergleich und Abschluss | ca. 6 Min. | Sofort vs. nach einer Woche; Botschaft *Häppchen-Lernen* |

Die Zeiten sind Planwerte. Sie werden im Usability-Pilot R2 gemessen und angepasst.

## 3. Überzeugungs-Aussagen (vorher und nachher)

Antwortformat: drei große Knöpfe mit Symbol: 👍 **stimmt** · 👎 **stimmt nicht** · ❓ **weiß nicht**. Alle Aussagen werden vorgelesen.

| ID | Aussage (Entwurf) | Richtung |
|---|---|---|
| `U1` | „Jedes Kind ist entweder ein Bild-Lerner oder ein Hör-Lerner.“ | Mythos (Zustimmung = Mythos) |
| `U2` | „Wer gern Bilder mag, kann mit Wörtern nicht gut lernen.“ | Mythos, essentialistisch |
| `U3` | „Wie man am besten lernt, kann jedes Kind üben.“ | Wachstum (Zustimmung = kein Mythos) |

- Angelehnt an die Essentialismus-Dimension bei Nancekivell et al. (Dossier §1.1). **Kindgerechte Adaption ist zu validieren (R0/R1):** Verständlichkeit im Co-Design prüfen.
- Gemischte Richtung gegen Ja-Sage-Tendenz (Dossier §3.2). Doppelte Verneinungen sind verboten.
- Vor der Lernphase gibt es keine Rückmeldung zu diesen Antworten.

## 4. Vorlieben und Vermutung

Antwortformat: drei Bildkarten.

| Karte | Symbol | Bedeutung |
|---|---|---|
| **Hören und Lesen** | Ohr + Buchstaben | Code `wort` |
| **Bilder** | Bildrahmen | Code `bild` |
| **Beides** | Ohr + Bildrahmen | Code `bild_wort` |

| ID | Frage (Entwurf) |
|---|---|
| `V1` | „Wenn dir jemand etwas Neues erklärt: Was hilft dir am meisten?“ |
| `V2` | „Wenn du dir etwas für einen Test merken willst: Wie machst du es am liebsten?“ |
| `V3` | „Welche Erklärung magst du am liebsten?“ |
| `V4` | **Vermutung:** „Gleich zeigen wir dir viele Dinge. Was glaubst du: Wie merkst du sie dir am besten?“ |

**Vorliebe-Gruppe:**
- Die Gruppe ist der **Mehrheitscode aus V1–V3**. Bei einem Gleichstand gilt `gemischt`.
- `V4` wird getrennt gespeichert. Es ist die individuelle Hypothese für RQ1.

**Rückmeldung an das Kind:** nur „Deine Vermutung ist notiert. Gleich prüfen wir sie als Detektive!“ Die gewählte Kategorie wird **nicht** wiederholt und **nicht** als Eigenschaft benannt.

## 5. Lernphase

### 5.1 Material

- **72 konkrete, bekannte Dinge** (Nomen wie *Kerze*, *Schlüssel*, *Gießkanne*), aufgeteilt in **6 Sets à 12 (A–F)**:
  - **A, B, C:** Lern-Sets.
  - **D:** Ablenker für den Sofort-Test.
  - **E:** Ablenker für den verzögerten Test.
  - **F:** Reserve für Ersatz nach dem Pilot.
- Die Sets werden abgeglichen nach:
  - Silbenzahl
  - Wortfrequenz im Kinderwortschatz (z. B. childLex; *Quelle zu verifizieren, R0*)
  - Bildhaftigkeit
  - **Benennungs-Übereinstimmung** (Kinder nennen das Bild eindeutig gleich, z. B. nicht *Tasse/Becher*)
- **Bilder:** eigene, einheitliche, schlichte Illustrationen (keine Fremd-Cliparts, keine Fotos von Marken). Die Benennungs-Übereinstimmung wird in R1 mit 10–15 Kindern geprüft. Items unter 80 % Übereinstimmung werden ersetzt.
- **Audio:** vorproduzierte Sprachaufnahmen (eine Sprecherin oder ein Sprecher, neutral, Normlautstärke) und keine Sprachsynthese aus der Cloud.

**Warum bekannte Dinge statt Fantasiewesen oder Fremdwörter?** Die Aufgabe misst, ob ein Kind sich merkt, *welche* Dinge gezeigt wurden (episodisches Gedächtnis). Das hat drei Vorteile:
- Es ist ohne Vorwissen fair.
- Es ist schnell.
- Es braucht weder Schreiben noch Rechtschreibung.

Vokabelpaare (Fremdwort ↔ Bedeutung) sind eine Alternative mit höherer Augenscheinvalidität, aber mit Testformat-Problemen (siehe §6.2). Sie werden in R0 als Variante geprüft.

### 5.2 Bedingungen

| Bedingung | Bildschirm | Ton |
|---|---|---|
| `wort` | Geschriebenes Wort, groß und zentriert | Wort wird gesprochen |
| `bild` | Nur das Bild, ohne Beschriftung | Kein Ton |
| `bild_wort` | Bild mit geschriebenem Wort darunter | Wort wird gesprochen |

- **Darbietung:** 4 s pro Ding, dann 1 s leerer Bildschirm. Das Tempo ist fest (kein Selbst-Tempo), damit alle Bedingungen gleich lange sichtbar sind.
- **Instruktion an die Kinder:** „Schau und hör genau hin und merk dir so viele Dinge wie möglich. Wie lange jedes Ding zu sehen ist, ist eine Detektiv-Regel: für alle gleich.“

### 5.3 Ausbalancierung (Lateinisches Quadrat)

| Rotation | Set A | Set B | Set C |
|---|---|---|---|
| R1 | `wort` | `bild` | `bild_wort` |
| R2 | `bild` | `bild_wort` | `wort` |
| R3 | `bild_wort` | `wort` | `bild` |

- **Zuweisung:** Die Rotation ergibt sich beim Beitritt aus einem fortlaufenden Zähler pro Sitzung modulo 3, damit die Rotationen innerhalb einer Klasse gleich häufig vorkommen. Das Ereignis `rotation_zugewiesen` wird gespeichert.
- **Reihenfolge:** Alle 36 Dinge werden **gemischt** dargeboten (pseudozufällig, höchstens 2 gleiche Bedingungen hintereinander). Der Zufalls-Seed wird gespeichert, sodass die Reihenfolge reproduzierbar ist.
- Die ersten und die letzten 2 Positionen sind **Puffer-Items** aus Set F. Sie werden nicht getestet, um Primacy- und Recency-Effekte abzufangen.

## 6. Tests

### 6.1 Sofort-Test und verzögerter Test

| | Sofort-Test | Verzögerter Test (+7 Tage, ±2) |
|---|---|---|
| Alte Items | 36 (A, B, C) | dieselben 36 |
| Neue Items (Ablenker) | 36 (Set D) | 36 (Set E) |
| Reihenfolge | pseudozufällig | pseudozufällig (neuer Seed) |
| Antwort | „**War dabei**“ / „**War nicht dabei**“ (zwei große Knöpfe) | gleich |
| Erfasst | Antwort, Reaktionszeit | gleich |

- **Testreiz:** geschriebenes Wort **und** gesprochenes Wort. Es kommt also für alle Bedingungen ein verbaler Reiz, und kein Bild.
- Zwischen Sofort-Test und verzögertem Test findet **kein erneutes Lernen** statt. Der Sofort-Test ist selbst schon Abruf-Übung. Das ist erwünscht und wird in der Folgestunde thematisiert (*Gedächtnis-Training*).

### 6.2 Bekannte methodische Einschränkungen

| Einschränkung | Umgang |
|---|---|
| **Testformat-Passung:** Ein verbaler Testreiz begünstigt eher `wort`. Die Bildüberlegenheit gilt in der Literatur trotzdem als robust. | Bewusst konservativ: Wenn `bild_wort` trotzdem vorne liegt, ist der Befund stärker. Die Einordnung wird in R0 anhand der Literatur geprüft. |
| **Deckeneffekt:** Bild-Wiedererkennung ist oft nahe 100 %. | Wird in R2 gemessen. Stellschrauben sind Itemzahl, Darbietungszeit (3 s statt 4 s) und Länge der Pause-Aufgabe. |
| **Kleine Itemzahl pro Bedingung (12):** Einzelergebnisse sind stark zufallsbehaftet. | Einer der Gründe, warum **es keine Einzelrückmeldung gibt**. Ausgewertet wird auf Klassen- und Studienebene. |
| **Kein Kopfhörer / Ton defekt:** Dann fehlt der Bedingung `wort` der Ton. | Siehe §8. |

### 6.3 Kennwerte

Die Kennwerte werden **pro Kind und Bedingung** berechnet (Ablenker gehören zu keiner Bedingung):
- **Trefferquote** pro Bedingung.
- **Korrigierte Quote:** Trefferquote minus die Fehlalarmquote des Kindes. Wahlweise *d′* mit Log-linear-Korrektur. Die endgültige Festlegung erfolgt in der Präregistrierung (R0).

## 7. Klassenergebnis und Gespräch

### 7.1 Beamer-Grafik

- **Gruppiertes Balkendiagramm:**
  - x-Achse: Vorliebe-Gruppen (`wort`, `bild`, `bild_wort`, `gemischt`) plus „Alle“.
  - Pro Gruppe drei Balken für die Bedingungen.
  - y-Achse: „So viele Dinge wiedererkannt“, in Prozent der korrigierten Quote.
- **Kleine Gruppen:** Vorliebe-Gruppen mit **weniger als 3 Kindern** werden in „Andere“ zusammengefasst, damit niemand identifizierbar wird. Die Mindestgröße bestätigt [04](04-datenschutz-genehmigungen.md).
- **Barrierefreiheit:** Bedingungen sind durch Farbe **und** Muster (Schraffur) sowie durch Symbole unterscheidbar.
- **Daten:** Die Grafik berechnet sich aus allen anwesenden Kindern (schulischer Zweck). Die Forschungsdaten bleiben davon getrennt, siehe [04](04-datenschutz-genehmigungen.md).

### 7.2 Gesprächsleitfaden für die Lehrkraft

1. **Beobachten:** „Was fällt euch auf? Welcher Balken ist meistens am höchsten?“
2. **Vermutung prüfen:** „Viele haben vorher gesagt, dass ihnen Bilder (oder Hören) am meisten helfen. Haben die *Bild*-Kinder am besten mit Bildern gelernt? Und die *Hör*-Kinder mit Hören?“
3. **Erklären (Kindersprache):** „Wenn du ein Bild siehst und das Wort hörst, legt dein Gehirn zwei Spuren an, eine Bild-Spur und eine Wort-Spur. Zwei Spuren findet man leichter wieder. Das heißt *Doppelt merken*, und es funktioniert bei fast allen.“
4. **Ehrlich bleiben:** Wenn das Klassenergebnis unklar ist oder anders aussieht: „Eine Klasse ist eine kleine Gruppe. Forscherinnen und Forscher machen das mit sehr vielen Klassen, und dort hilft *Bild + Wort* fast allen.“ (Das Klassenergebnis wird nie geschönt.)
5. **Übertragen:** „Wo könntest du *Doppelt merken* nächste Woche benutzen? Zum Beispiel bei Lernwörtern: eine kleine Zeichnung neben das Wort.“

### 7.3 Folgestunde: Vergleich

Grafik „Sofort vs. nach einer Woche“ pro Bedingung, für die ganze Klasse. Botschaft: „Man vergisst mit der Zeit, aber *Doppelt Gemerktes* hält besser. Und wer zwischendurch wiederholt (*Häppchen-Lernen*), vergisst weniger.“ Danach folgen die Überzeugungs-Aussagen (nachher).

## 8. Sonderfälle

| Fall | Verhalten |
|---|---|
| Ton-Check fehlgeschlagen | Das Tablet meldet es der Lehrkraft (Cockpit). Wird der Ton nicht behoben, läuft das Experiment ohne Ton (`audio_ok=false`). Diese Daten gehen nicht in die Hauptauswertung ein, das Kind macht aber normal mit. |
| Kind kommt zu spät | Es steigt bei der nächsten möglichen Phase ein. Ist die Lernphase verpasst, gibt es eine „Zuschauer-Rolle“ (es darf den Sofort-Test nicht machen) und eine kurze Ersatzaufgabe. |
| Kind fehlt in der Folgestunde | Nachholen bis +9 Tage ist möglich (Cockpit-Option). Danach fehlt der Wert. |
| Gerätewechsel | Fortsetzen per Lernausweis. Bereits gezeigte Items werden nicht erneut gezeigt. Die Lernphase wird nicht neu gestartet; eine abgebrochene Lernphase wird markiert (`abgebrochen=true`). |
| Kind ohne Forschungs-Einwilligung | Macht vollständig mit. Seine Daten zählen für die Klassengrafik, gehen aber nicht in den Forschungsexport ein ([04](04-datenschutz-genehmigungen.md)). |
| Kind möchte aufhören | Ein „Pause“-Knopf ist jederzeit verfügbar. Es gibt keine Nachfrage und keinen Druck. Die Lehrkraft sieht den Status. |

## 9. Ereignisse (Payloads)

Alle Ereignisse nutzen den Envelope aus [03-architektur.md](03-architektur.md) §4.4 und tragen `modul: "lerndetektive"`.

| `typ` | Payload |
|---|---|
| `audio_check` | `{ ok: boolean }` |
| `rotation_zugewiesen` | `{ rotation: "R1"\|"R2"\|"R3", seed: number }` |
| `ueberzeugung_beantwortet` | `{ item_id: "U1".."U3", antwort: "stimmt"\|"stimmt_nicht"\|"weiss_nicht", zeitpunkt: "vorher"\|"nachher", rt_ms: number }` |
| `vorliebe_beantwortet` | `{ item_id: "V1".."V4", antwort: "wort"\|"bild"\|"bild_wort", rt_ms: number }` |
| `item_gezeigt` | `{ item_id, set: "A".."F", bedingung: "wort"\|"bild"\|"bild_wort"\|"puffer", position: number, audio_ok: boolean }` |
| `antwort_abgegeben` | `{ item_id, test: "sofort"\|"verzoegert", alt: boolean, antwort: "dabei"\|"nicht_dabei", rt_ms: number, position: number }` |
| `phase_abgeschlossen` | `{ phase: "lernen"\|"pause"\|"sofort_test"\|"verzoegert_test", abgebrochen: boolean }` |

Abgeleitete Werte (Vorliebe-Gruppe, Kennwerte nach §6.3) werden serverseitig berechnet und **nie** an das Kinder-Tablet zurückgegeben.

## 10. Inhaltsdatei

Alle Items, Texte und Rotationen stehen in `/data/lerndetektive/` und nicht im Code:

```json
{
  "version": "0.1",
  "darbietung_ms": 4000,
  "pause_ms": 1000,
  "items": [
    { "id": "kerze", "set": "A", "wort": "Kerze", "bild": "kerze.svg", "audio": "kerze.mp3", "silben": 2 }
  ],
  "rotationen": { "R1": { "A": "wort", "B": "bild", "C": "bild_wort" } },
  "ueberzeugungen": [ { "id": "U1", "text": "…", "audio": "u1.mp3", "richtung": "mythos" } ],
  "vorlieben": [ { "id": "V1", "text": "…", "audio": "v1.mp3" } ]
}
```

## 11. Offene Punkte

1. Literaturprüfung (R0): Gibt es erprobte Kreuzinteraktions-Paradigmen für 9- bis 10-Jährige, die übernommen werden können? Welches Testformat ist am fairsten (§6.2)?
2. Normen für Benennungs-Übereinstimmung und Bildhaftigkeit bei deutschsprachigen Kindern: Quelle finden oder selbst erheben (R1).
3. Deckeneffekt und Zeitbedarf im Pilot R2 messen. Danach Itemzahl und Darbietungszeit festlegen (Präregistrierung erst danach).
4. Verständlichkeit von `U1`–`U3` und `V1`–`V4` im Co-Design R1 prüfen, besonders für Kinder mit DaZ.
