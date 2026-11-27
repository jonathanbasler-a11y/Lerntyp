# Leitfaden: Informeller Familientest der Demo

> **Status:** v0.1 (November 2026) · **Bezug:** [05-forschungsplan.md](05-forschungsplan.md) (Co-Design R1), [01-konzept.md](01-konzept.md)

## 1. Zweck und Abgrenzung

Eltern im Projektumfeld testen die Demo informell mit ihren eigenen Kindern, bevor die geplanten Co-Design-Runden (R1) stattfinden.

- **Das ist keine Forschungserhebung.** Es gibt keine Einwilligungsformulare und kein genehmigtes Verfahren. Die Beobachtungen fließen daher **nur als Ideen und Hinweise** in die Überarbeitung ein, **nicht** in die Auswertung von RQ1–RQ6.
- **Die Demo speichert nichts Persönliches.** Sie läuft nur im Browser, nutzt erfundene Aliasse und hat keine Texteingabe (Hosting-Stufe 1, [03](03-architektur.md) §7).
- **Notizen ohne Namen.** Keine Fotos, Videos oder Namen von Kindern in Repository, Issues oder Pull Requests. Notizen beschreiben „Kind Kl. 4“ bzw. „Kind Kl. 5“.

## 2. Wer testet was?

| Kind | Rolle beim Test | Besonders darauf achten |
|---|---|---|
| **Klasse 4** (Zielgruppe) | Echte Nutzerperspektive | Versteht es jeden Bildschirm ohne Hilfe? Welche Wörter sind unbekannt? Sind die Knöpfe groß genug? |
| **Klasse 5** (ältere Perspektive) | Prüft, ob die App zu kindisch wirkt; hat Klasse 4 gerade hinter sich | Ton und Optik: „für Kleinere“ oder „passt“? Wie wirkt die App im Rückblick auf das eigene 4. Schuljahr? |

**Kinder einzeln testen**, sonst beeinflussen sie sich gegenseitig. Das Kind aus Klasse 4 zuerst.

## 3. Vorbereitung

- Tablet (am besten iPad) oder Laptop, Demo-Adresse im Browser geöffnet.
- Ab Phase 2: **Kopfhörer** (für das Experiment *Lerndetektive*).
- 15 ruhige Minuten pro Kind, nicht direkt nach Hausaufgaben oder vor dem Schlafengehen.
- Ein Blatt mit dem Beobachtungsbogen (§5) und ein Stift.

## 4. Ablauf (ca. 15 Minuten)

1. **Einstieg (sagen):** „Wir testen eine App, **nicht dich**. Es gibt kein Richtig oder Falsch. Wenn etwas komisch ist, ist die App schuld, nicht du.“
2. **Laut denken:** „Sag einfach laut, was du denkst und was du gerade machen willst.“
3. **Nicht helfen:** Erst nach ca. 30 Sekunden Stocken einen kleinen Tipp geben, und notieren, *wo* das passiert ist.
4. **Durchklicken:** Start → *Kind* → Lernausweis wählen → alle Schritte → „Fertig für heute“.
5. **Nachfragen** (§6), dann bedanken. Die Ergebnisse nicht bewerten.

## 5. Beobachtungsbogen

| Bildschirm | Ohne Hilfe verstanden? (ja / mit Tipp / nein) | Zögern (wo, wie lange) | Unbekannte Wörter | Was hat das Kind gesagt? |
|---|---|---|---|---|
| Start (Rollenwahl) | | | | |
| Lernausweis wählen | | | | |
| Schritt: Start | | | | |
| Schritt: Lerndetektive | | | | |
| Schritt: Strategie-Parcours | | | | |
| Schritt: Mein Lernprofil | | | | |
| Fertig für heute | | | | |

Außerdem notieren: Hat das Kind den **Vorlese-Knopf** bemerkt? Hat es den Hinweis **„Demo – nur Dummy-Daten“** angesprochen?

## 6. Fünf Fragen danach

1. „Erklär mir mal: Was macht man in dieser App?“ (Hat es den Sinn verstanden?)
2. „Gab es ein Wort, das du nicht kanntest?“
3. „Ist die App eher **für Kleinere**, **genau richtig** oder **für Größere**?“ (auf drei Smileys zeigen lassen)
4. „Wenn du eine Sache ändern dürftest, welche?“
5. „Würdest du das gern mit deiner Klasse machen? Warum (nicht)?“

**Nur für das Kind aus Klasse 5, freiwillig und behutsam:** „Wenn du an die 4. Klasse zurückdenkst: Hätte dir so eine Stunde über das Lernen gefallen? Wann im Schuljahr wäre ein guter Zeitpunkt?“ Das Thema Übergang oder Kompass 4 nicht vertiefen, wenn das Kind nicht von sich aus darüber spricht.

## 7. Ab Phase 2: zusätzliche Testpunkte

Diese Punkte entsprechen offenen Fragen aus [02](02-lerndetektive-experiment.md) §11 und [05](05-forschungsplan.md) (R1):

- **Bilder benennen:** Das Kind sagt zu jedem Bild, was es zeigt. Die Abweichungen notieren (z. B. *Tasse* oder *Becher*).
- **Aussagen verstehen:** Versteht das Kind die Überzeugungs-Aussagen `U1`–`U3` und die Vorliebe-Fragen `V1`–`V4`? Kann es sie in eigenen Worten wiederholen?
- **Tempo:** Sind 4 Sekunden pro Ding zu schnell oder zu langsam?
- **Nachbesprechung:** Nach dem Experiment das Ergebnis gemeinsam ansehen und den Mythos auflösen ([02](02-lerndetektive-experiment.md) §7.2). Kein Kind soll mit dem Gefühl „Ich bin ein …-Typ“ aufhören.

## 8. Rückmeldung ins Projekt

Notizen anonym als Issue mit dem Label `familientest` oder als Kommentar am jeweiligen Pull Request: Bildschirm, Beobachtung, Vorschlag. Mehrere Beobachtungen zu einem Bildschirm in einem Eintrag bündeln.
