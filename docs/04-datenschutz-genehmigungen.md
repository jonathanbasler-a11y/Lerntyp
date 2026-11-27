# 04 – Datenschutz, Rechtsrahmen & Genehmigungen

> **Hinweis – keine Rechtsberatung.** Dieses Dokument ist eine fachliche Arbeitsgrundlage des Projektteams. Es ersetzt keine Rechtsberatung und muss vor jedem Einsatz mit echten Kindern von der/dem **schulischen Datenschutzbeauftragten**, der Schulleitung und ggf. der Rechtsberatung der Partner-Hochschule geprüft werden. Alle Aussagen mit **„zu verifizieren (R0)“** sind bewusst nicht als gesichert formuliert und werden in Forschungsphase R0 geklärt (siehe [05-forschungsplan.md](05-forschungsplan.md)).

Verwandte Dokumente: [01-konzept.md](01-konzept.md) · [02-lerndetektive-experiment.md](02-lerndetektive-experiment.md) · [03-architektur.md](03-architektur.md) · [05-forschungsplan.md](05-forschungsplan.md) · Quelle: [research/00-dossier.md](research/00-dossier.md) (§1.1, §2.1, §5.1, §5.2)

---

## 1. Zweck & Grundsätze

**Zweck.** Lerntyp unterstützt Klassen 4 in Baden-Württemberg dabei, gemeinsam zu erforschen, *wie* Lernen funktioniert: ein stärkenorientiertes **Lernprofil** (kein Lerntyp-Etikett) und das Klassenexperiment **„Lerndetektive“** (siehe [01-konzept.md](01-konzept.md), [02-lerndetektive-experiment.md](02-lerndetektive-experiment.md)). Zusätzlich werden Daten – nur mit Einwilligung – für eine Begleitstudie genutzt.

| Grundsatz | Konkrete Festlegung |
|---|---|
| **Datenminimierung** (Art. 5 Abs. 1 lit. c DSGVO) | Keine Namen, kein Geburtsdatum, kein Geschlecht, keine Fotos, keine Audioaufnahmen, kein Freitext-Chat. Nur Alias, Antworten, Prozessdaten und daraus berechnetes Profil. |
| **Pseudonymisierung** (Art. 4 Nr. 5, Art. 25 DSGVO) | Kinder melden sich mit gedruckten Alias-Karten an („Fuchs-27“, QR-Code). Die Zuordnung Alias ↔ Name existiert **nur auf Papier bei der Lehrkraft**, nie im System. |
| **Pseudonym ≠ anonym** | Pseudonymisierte Daten bleiben personenbezogen (ErwG 26 DSGVO), weil die Schule über die Papierliste re-identifizieren kann. Die Aussage im Dossier §5.2 Punkt 4, Aliasse würden DSGVO/LDSG „gänzlich vermeiden“, wird **nicht** übernommen – wir behandeln alle Alias-Daten als personenbezogen. |
| **Kein Profiling i. S. v. Werbung oder automatisierten Entscheidungen** (Art. 22 DSGVO, DSA Art. 28 Abs. 2) | Das Lernprofil ist eine Rückmeldung *für* Kind und Lehrkraft, keine Entscheidung *über* das Kind. Keine Werbung, keine Tracking-SDKs, keine Weitergabe an Dritte. |
| **Zweckbindung** (Art. 5 Abs. 1 lit. b DSGVO) | Daten dienen ausschließlich (a) dem Unterricht mit Lerntyp und (b) bei Einwilligung der Begleitstudie. **Ausdrücklich ausgeschlossen:** Verwendung für die Grundschulempfehlung, die pädagogische Gesamtwürdigung der Klassenkonferenz, Kompass 4 (inkl. überfachlichem Teil „Lern- und Arbeitsverhalten“), Potenzialtest, Noten oder Zeugnisse (Kontext: Dossier §2.1). |
| **Transparenz** (Art. 12–14 DSGVO) | Kindgerechte Datenschutzinfo (Abschnitt 6.3), Elterninformation (6.1). |
| **Freiwilligkeit der Forschung** | Kinder ohne Einwilligung nehmen ganz normal teil; ihre Daten gelangen nie in den Forschungsexport. |

**Produktregeln, die daraus folgen** (gelten auch für [03-architektur.md](03-architektur.md)):
- Das Lernprofil ist in der Lehrkraft-Ansicht mit dem Hinweis versehen: „Nicht für Übergangsentscheidungen oder Leistungsbewertung bestimmt.“
- Kein Export von Einzelprofilen in Formaten, die für Zeugnis- oder Beratungsunterlagen gedacht sind (Gestaltungsentscheidung; zu prüfen, ob eine organisatorische Zusage der Schule zusätzlich nötig ist – zu verifizieren (R0)).
- Die Feldphasen liegen außerhalb der Übergangsphase Dez. 2026 – Feb. 2027 (siehe [05-forschungsplan.md](05-forschungsplan.md)).

---

## 2. Zwei Spuren

### (A) Schulischer Einsatz

- **Verantwortliche:** die **Schule** (vertreten durch die Schulleitung). Dass bei öffentlichen Schulen in BW die Schule selbst Verantwortliche i. S. d. Art. 4 Nr. 7 DSGVO ist, entspricht gängiger Praxis – genaue Zuordnung (Schule vs. Land/Schulträger) zu verifizieren (R0).
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. e, Abs. 3 DSGVO i. V. m. dem Schulgesetz BW und dem LDSG BW (Erfüllung des öffentlichen Bildungsauftrags). **Konkrete Paragrafen** (Datenverarbeitungsbefugnis im SchG BW, einschlägige Norm im LDSG BW) und die Frage, ob der Einsatz einer digitalen Lernanwendung davon gedeckt ist oder zusätzlich eine Einwilligung verlangt wird: zu verifizieren (R0). Laut Suchergebnissen wurde das SchG BW u. a. zum 05.12.2023 geändert; ob dies die Datenverarbeitungsnormen betrifft und welche Fassung gilt, zu verifizieren (R0).
- **Betreiber (Projektteam bzw. Hosting-Partner):** **Auftragsverarbeiter** nach Art. 28 DSGVO mit **AVV** (Checkliste: Abschnitt 6.5). Weisungsgebunden, keine eigenen Zwecke.
- **Art. 8 DSGVO** (Einwilligung ab 16 in DE, Dossier §5.1) greift in Spur A nicht als Rechtsgrundlage, weil keine Einwilligung zugrunde liegt – Bewertung zu verifizieren (R0).

### (B) Forschungsnutzung

- **Rechtsgrundlage:** **schriftliche Einwilligung der Sorgeberechtigten** (Art. 6 Abs. 1 lit. a, Art. 7 DSGVO) **plus altersgerechte Zustimmung (Assent) des Kindes**. Ob beide Sorgeberechtigte unterschreiben müssen: zu verifizieren (R0).
- **Freiwilligkeit:** Keine Nachteile bei Nicht-Teilnahme; Kinder ohne Einwilligung machen alles mit, werden nur nicht exportiert. Kein Hinweis in der Kinder-UI, wer teilnimmt.
- **Widerruf** jederzeit ohne Begründung (Art. 7 Abs. 3 DSGVO) → Löschung der Forschungsdaten (Abschnitt 7). Nach Anonymisierung ist eine Löschung nicht mehr möglich – das steht in der Einwilligungserklärung.
- **Verantwortliche für die Forschungsdaten:** voraussichtlich die forschende Institution (Partner-PH) bzw. Projektleitung; ob getrennte oder gemeinsame Verantwortlichkeit (Art. 26 DSGVO) mit der Schule vorliegt: zu verifizieren (R0).
- **Forschungsprivilegien** (Art. 89 DSGVO, Forschungsnorm im LDSG BW) werden **nicht** als Ersatz für Einwilligung genutzt; sie können für Aufbewahrung/Betroffenenrechte relevant sein – zu verifizieren (R0).
- **Technik:** Die Lehrkraft setzt pro Alias `consent_research = true` erst nach Vorliegen von Einwilligung **und** Assent. Nur diese Aliasse erscheinen im pseudonymisierten Forschungsexport; der Alias wird dabei durch eine zweite, zufällige Forschungs-ID ersetzt (siehe [03-architektur.md](03-architektur.md)).

### Übersicht: Daten × Spur × Rechtsgrundlage × Aufbewahrung

| Daten | Spur A (Schule) | Spur B (Forschung) | Rechtsgrundlage | Aufbewahrung |
|---|---|---|---|---|
| Alias, Klassencode | ja | nur als Forschungs-ID | A: Art. 6 (1) e DSGVO + SchG/LDSG BW (zu verifizieren); B: Einwilligung | A: bis Schuljahresende; B: Zuordnung Alias↔Forschungs-ID bis Abschluss der Datenerhebung (R3) |
| Antworten auf Aufgaben | ja | nur mit `consent_research` | wie oben | A: Schuljahresende; B: bis Anonymisierung |
| Prozessdaten (Zeiten, Hinweise, Sicherheit) | ja | nur mit `consent_research` | wie oben | wie oben |
| Präferenzantworten „Lerndetektive“ | ja | nur mit `consent_research` | wie oben | wie oben |
| Berechnetes Lernprofil | ja | nur mit `consent_research` (aggregierbar) | wie oben | wie oben |
| Einwilligungs-/Assent-Unterlagen (Papier) | – | ja | Nachweispflicht Art. 7 Abs. 1 DSGVO | Dauer zu verifizieren (R0) |
| Anonymisierte Auswertungsdaten | – | ja | keine personenbezogenen Daten mehr | nach Regeln guter wiss. Praxis (Frist zu verifizieren (R0)) |

---

## 3. Datenkatalog

| Datum | Personenbezug | Zweck | Speicherort | Löschfrist |
|---|---|---|---|---|
| Alias („Fuchs-27“) + QR | pseudonym | Anmeldung, Zuordnung von Ereignissen | Server-DB (EU); Karte auf Papier | Schuljahresende |
| Alias↔Name-Liste | **ja** (direkt) | Rückgabe an Kind, Elternkontakt | **nur Papier bei der Lehrkraft**, nie im System | in Verantwortung der Schule, spätestens Schuljahresende vernichten |
| Klassencode, Sitzungen | pseudonym (über Klasse) | Organisation der Unterrichtsstunde | Server-DB | Schuljahresende |
| Lehrkraft-Zugang (Kennung, Passwort-Hash) | **ja** | Zugang zum Lehrkraft-Cockpit | Server-DB | bei Kontolöschung / Projektende |
| `consent_research`-Flag | pseudonym | Steuerung des Forschungsexports | Server-DB | Schuljahresende bzw. bei Widerruf auf `false` + Löschung Forschungsdaten |
| Antworten (Auswahl, Zahlen) | pseudonym | Feedback, Lernprofil, ggf. Forschung | Tablet (IndexedDB-Warteschlange, bis Sync) → Server-DB | lokal: nach erfolgreichem Sync; Server: Schuljahresende |
| Prozessdaten: Bearbeitungszeiten, genutzte Hinweise, Sicherheitsurteile | pseudonym | Lernprofil, Experiment, ggf. Forschung | wie Antworten | wie Antworten |
| Präferenzantworten „Lerndetektive“ | pseudonym | Klassenexperiment, Forschung (RQ1, RQ3) | wie Antworten | wie Antworten |
| Berechnetes Lernprofil (Stärken, Strategien) | pseudonym | Rückmeldung an Kind und Lehrkraft | Server-DB (berechnet) | Schuljahresende |
| Freitext | **nicht vorgesehen** | – | – | – |
| **IP-Adresse** des Tablets | **ja** (EuGH C-582/14 „Breyer“ zu dynamischen IP-Adressen) | technisch zwingend für Verbindung | Webserver-/Proxy-Logs | IP-Logging minimieren/kürzen; Frist mit DSB festlegen (Vorschlag: wenige Tage) – zu verifizieren (R0) |
| Forschungsexport (CSV) | pseudonym (Forschungs-ID) | Auswertung | gesicherter Speicher der Partner-PH | Forschungs-ID-Zuordnung löschen nach R3 → anonym |
| Demo-/Mock-Daten | keiner | Prototyp, Review | GitHub Pages / Vercel | beliebig |

**Warum EU-Hosting im Pilot:** Jeder Seitenaufruf überträgt die IP-Adresse des Schul-Tablets an den Hoster. GitHub und Vercel sind US-Unternehmen; LfDI BW ist bei US-Clouddiensten an Schulen streng (Dossier §5.2, Beispiel Microsoft 365). Deshalb gilt:
- **Demo/Prototyp:** GitHub Pages oder Vercel, **nur Mock-Daten**, keine echten Kinderdaten, kein Einsatz im Unterricht mit Klassen.
- **Pilot (R2/R3):** Frontend **und** API/DB bei einem deutschen/EU-Hoster mit AVV oder auf einem Server des Schulträgers (siehe [03-architektur.md](03-architektur.md)). Ob das EU-US Data Privacy Framework für den Schulkontext in BW ausreichen würde, wird bewusst nicht geprüft; wir vermeiden die Frage durch EU-Hosting.

---

## 4. Rechtsrahmen-Checkliste

Status: ✔ = im Produktkonzept umgesetzt · ◐ = teilweise / organisatorisch offen · ? = zu verifizieren (R0)

| Norm | Anforderung | Umsetzung im Produkt | Status |
|---|---|---|---|
| DSGVO Art. 5 | Grundsätze (Rechtmäßigkeit, Zweckbindung, Minimierung, Speicherbegrenzung, Integrität) | Abschnitt 1; Löschkonzept Abschnitt 7 | ✔ |
| DSGVO Art. 6 | Rechtsgrundlage je Verarbeitung | Spur A: lit. e + Landesrecht; Spur B: lit. a | ◐ Landesrechtsnormen ? |
| DSGVO Art. 7 | Nachweisbare, widerrufbare Einwilligung | Papierformular, Flag im System, Widerrufsweg über Schule | ✔ / Formular-Review ? |
| DSGVO Art. 8 | Einwilligung bei Diensten der Informationsgesellschaft für Kinder < 16 (DE) | Nicht Rechtsgrundlage in Spur A; Spur B: Einwilligung der Sorgeberechtigten | ? Anwendbarkeit |
| DSGVO Art. 9 | Besondere Kategorien (z. B. Gesundheit) | **Keine** Erhebung von Diagnosen (LRS, Dyskalkulie, ADHS, Förderbedarf). Barrierefreiheitsoptionen werden nicht als Merkmal gespeichert. | ✔ (bei Erweiterung neu prüfen) |
| DSGVO Art. 12–14 | Präzise, verständliche, kindgerechte Information | Kinderinfo 6.3, Elternbrief 6.1, Infoblatt für Lehrkräfte | ◐ Texte im Entwurf |
| DSGVO Art. 22 | Keine ausschließlich automatisierte Entscheidung mit rechtlicher/erheblicher Wirkung | Profil ist Rückmeldung, keine Entscheidung; Zweckbindung gegen Übergangsentscheidungen | ✔ |
| DSGVO Art. 25 | Datenschutz durch Technikgestaltung und Voreinstellungen | Aliasse, keine Namen, `consent_research` standardmäßig `false`, keine Dritt-SDKs | ✔ |
| DSGVO Art. 28 | AVV mit Auftragsverarbeiter, auch Unterauftragsverarbeiter (Hoster) | AVV-Checkliste 6.5 | ◐ Vertrag offen |
| DSGVO Art. 30 | Verzeichnis von Verarbeitungstätigkeiten (VVT) | Schule führt VVT-Eintrag; Betreiber liefert Vorlage und eigenes Verzeichnis als Auftragsverarbeiter (Art. 30 Abs. 2) | ◐ |
| DSGVO Art. 32 | Sicherheit der Verarbeitung | TOM-Übersicht 6.6 | ◐ |
| DSGVO Art. 35 | Datenschutz-Folgenabschätzung (DSFA) | **Empfehlung: DSFA durchführen** (siehe unten) | ◐ |
| DSGVO Art. 44 ff. | Drittlandübermittlung | Pilot ohne US-Dienste; keine externen Requests, selbst gehostete Schriften | ✔ |
| LDSG BW | Ergänzende Landesregeln für öffentliche Stellen, inkl. Forschung | Abgleich mit DSB | ? Normen und Inhalt |
| Schulgesetz BW (+ ggf. Datenschutz-VwV für Schulen) | Befugnis der Schule zur Datenverarbeitung; Mitwirkung der Gremien | Spur A stützt sich darauf | ? Normen, Gremienbeteiligung |
| DSA Art. 25 | Keine Dark Patterns (für Online-Plattformen) | Null Dark Patterns, keine Streaks/Druck, siehe [01-konzept.md](01-konzept.md) | ✔ freiwillig |
| DSA Art. 28 | Schutz Minderjähriger; keine profilbasierte Werbung an Minderjährige | Keine Werbung überhaupt, datenschutzfreundliche Defaults | ✔ freiwillig; ? ob Lerntyp überhaupt „Online-Plattform“ i. S. d. DSA ist (vermutlich nicht, da keine öffentliche Verbreitung von Nutzerinhalten) |
| JMStV / JuSchG | Entwicklungsbeeinträchtigungen vermeiden; ggf. Jugendschutzbeauftragte/r bei Chat, UGC, offenen Links, Lootboxen (Dossier §5.1) | **Geschlossene Umgebung:** kein Chat, keine nutzergenerierten Inhalte, keine externen Links, keine In-App-Käufe, keine Lootboxen; Inhalte kuratiert in `/data` | ✔; ? ob Pflichten (z. B. JSB) bei schulischer, nicht-kommerzieller Nutzung überhaupt greifen |
| JMStV § 6 (Fassung lt. Dossier ab 1.12.2025) | Kein Ausnutzen des Vertrauens in Eltern/Lehrkräfte | Keine kommerziellen Inhalte, keine imitierten Lehrkraft-Aufforderungen | ✔; ? aktuelle Fassung |
| UWG Anhang zu § 3 Abs. 3, Nr. 28 | Keine unmittelbaren Kaufaufforderungen an Kinder | Kein Kauf, kein Abo, keine Upgrade-Hinweise in der Kinder-UI; App ist kostenfrei für Schulen | ✔ |
| TDDDG (vormals TTDSG) § 25 | Speichern/Zugriff auf Endgerät nur mit Einwilligung, außer unbedingt erforderlich für den ausdrücklich gewünschten Dienst | IndexedDB-Warteschlange und Service-Worker-Cache sind für Offline-Betrieb der genutzten App technisch erforderlich → Ausnahme § 25 Abs. 2 Nr. 2; **keine** Analyse-/Tracking-Speicherung, keine Cookies außer Session. Lokale Daten werden nach Sync und beim Abmelden gelöscht (Shared iPad). | ◐ Ausnahme im Schulkontext (wer „wünscht“ den Dienst?) zu verifizieren (R0) |

**DSFA-Einschätzung (Art. 35).** Für eine DSFA sprechen: Betroffene sind Kinder (besonders schutzbedürftig, ErwG 38/75), systematische Auswertung von Lernverhalten (Prozessdaten → Profil), neue Technologie im Unterricht, Forschungsnutzung. Dagegen spricht: Pseudonymisierung, keine Entscheidungen, kleiner Umfang. Ob die Muss-Liste der Aufsichtsbehörden (DSK-Liste/LfDI BW) den Fall erfasst: zu verifizieren (R0). **Empfehlung: DSFA in R0 durchführen** (Vorlage durch Projektteam, Verantwortung bei der Schule bzw. für Spur B bei der forschenden Institution), auch als Grundlage für DSB und Ethikkommission.

---

## 5. Genehmigungen & Abstimmungen

**Wissenschaftliche Erhebungen an Schulen in BW.** Laut öffentlich verfügbaren Hochschul-Leitfäden und Antragsformularen der Regierungspräsidien gilt die Verwaltungsvorschrift des Kultusministeriums **„Werbung, Wettbewerbe und Erhebungen in Schulen“** (Nr. 4: Erhebungen durch Personen/Institutionen außerhalb der Schulverwaltung sind genehmigungspflichtig). Die Zuständigkeit richtet sich danach nach dem Umfang: **eine Schule → Schulleitung; mehrere Schulen in einem Regierungsbezirk → Regierungspräsidium (obere Schulaufsicht); mehrere Regierungsbezirke → Kultusministerium.** Quellen (nur über Suchauszüge eingesehen, Volltext im Projekt-Netz nicht abrufbar):
- PH Weingarten, „Regelungen für wissenschaftliche Untersuchungen“: <https://ph-weingarten.de/media/3878/download/Regelungen%20f%C3%BCr%20wissenschaftliche%20Untersuchungen.pdf>
- RP Tübingen, Antragsformular „Genehmigung einer wissenschaftlichen Erhebung“: <https://rpt.baden-wuerttemberg.de/fileadmin/RP-Internet/Tuebingen/Abteilung_7/_DocumentLibraries/Schulformulare/Genehmigung_einer_wissenschaftlichen_Erhebung_Antrag.pdf>
- PH Heidelberg, Abdruck der VwV: <https://www.ph-heidelberg.de/fileadmin/de/forschung/formulare-richtlinien/ErhebungVO.pdf>
- RP Freiburg, „Datenschutzrechtliche Hinweise zur Durchführung von Erhebungen an Schulen“ (2026-05): <https://rpf.baden-wuerttemberg.de/fileadmin/RP-Internet/Freiburg/Abteilung_7/Schulformulare/Sonstige/2026-05_Datenschutzrechtliche_Hinweise_Durchf%C3%BChrung_Erhebungen_Schulen.pdf>

**Zu verifizieren (R0):** aktuelle Fassung und Datum der VwV (die Quellen nennen unterschiedliche Fassungen: 1985 bzw. 2002, jeweils zuletzt geändert 2005), ob sie noch gilt oder ersetzt wurde, das zuständige RP für die Pilotschulen, einzureichende Unterlagen, Bearbeitungsdauer, ob die Erhebung im Unterricht stattfinden darf. Laut RP-Tübingen-Formular muss in Informationsschreiben klargestellt werden, dass eine Genehmigung **keine wissenschaftliche Qualitätskontrolle** bedeutet – in Elternbrief aufnehmen, Wortlaut zu verifizieren (R0). Bei 5–8 Klassen an mehreren Schulen (R3) ist voraussichtlich das RP oder bei regionaler Streuung das KM zuständig → Schulauswahl regional bündeln.

### Reihenfolge, Vorlauf, Zuordnung zu R0–R3

Vorlaufzeiten sind **eigene Planungsannahmen**, keine offiziellen Fristen – jeweils bei der Stelle erfragen (R0).

| # | Stelle | Was | Abhängig von | Phase | Planungsannahme Vorlauf |
|---|---|---|---|---|---|
| 1 | **Partner-PH** (Projektleitung, ggf. Datenschutz der PH) | Kooperation, Klärung Verantwortlichkeit Spur B | – | R0 (Dez. 2026) | sofort beginnen |
| 2 | **Ethikkommission der Partner-PH** | Ethikvotum (Studienprotokoll, Einwilligungen, Assent, DSFA-Auszug) | 1, Entwürfe Abschnitt 6 | R0 (Antrag Dez./Jan.) | Sitzungstermine der Kommission erfragen; mehrere Wochen einplanen |
| 3 | **Schulleitungen** der Pilotschulen | Grundsatzzusage; bei Einzelschule ggf. Genehmigungsinstanz nach VwV | 1 | R0 | – |
| 4 | **Schulische/r Datenschutzbeauftragte/r** (bzw. DSB beim Staatlichen Schulamt – Zuständigkeit zu verifizieren (R0)) | Prüfung DSFA, VVT, AVV, Texte | Entwürfe, DSFA | R0–R1 | vor Genehmigungsantrag |
| 5 | **Gesamtlehrerkonferenz und/oder Schulkonferenz** | Information/Zustimmung zum Einsatz und zur Studie – **welches Gremium zustimmen muss, zu verifizieren (R0)** | 3 | R1 | nächster regulärer Konferenztermin |
| 6 | **Regierungspräsidium / KM** (je nach Umfang) | Genehmigung der Erhebung nach VwV | 2 (ggf. vorzulegen), 4 | Antrag R0, Genehmigung vor R2 | Bearbeitungsdauer erfragen |
| 7 | **Schulträger** (Kommune/Kreis) | nur falls Hosting auf Schulträger-Server oder Nutzung der Schul-MDM (Relution/Jamf über Kreismedienzentrum, Dossier §5.2) | 4 | R1 | – |
| 8 | **Eltern** | Elternabend + Elternbrief, Einwilligung Forschung | 2, 6 | vor R2 (Pilot) bzw. vor R3 (Feld) | Rücklauf 2–3 Wochen einplanen |
| 9 | **Kinder** | Kindgerechte Info + Assent im Unterricht | 8 | Beginn R2/R3 | am Tag 1 |

Hinweise zur Phasenzuordnung:
- **R0 (Dez. 2026 – Jan. 2027):** Anträge, DSFA, AVV-Entwurf – **keine Datenerhebung mit Kindern** (Übergangsphase, Dossier §2.1).
- **R1 (Jan. – Feb. 2027):** Lehrkraft-Interviews (erwachsene Teilnehmende; eigene Einwilligung, ggf. ebenfalls genehmigungspflichtig – zu verifizieren (R0)); Co-Design mit Papierprototypen mit Kindern **erst nach Genehmigung** und Einwilligung, nicht vor Ende der Übergangsphase.
- **R2 (Mär. – Apr. 2027):** Usability-Pilot 1–2 Klassen, EU-Hosting aktiv. Think-aloud nur protokolliert, **keine Audioaufnahme** ohne gesonderte Einwilligung.
- **R3 (Mai – Jul. 2027):** Feldstudie; Anonymisierung nach verzögertem Test.

---

## 6. Entwürfe

> **Entwurf – keine Rechtsberatung, vor Einsatz prüfen lassen.** Alle folgenden Texte sind Gliederungen bzw. Rohfassungen für die Abstimmung mit DSB, Ethikkommission und Schulleitung.

### 6.1 Elternbrief (Gliederung)
1. Worum geht es? Lerntyp im Unterricht der Klasse 4, Zeitraum, Umfang (z. B. 2–3 Unterrichtsstunden).
2. **Warum keine „Lerntypen“?** (Kurzabsatz, Grundlage Dossier §1.1):
   > *Viele kennen die Idee, jedes Kind sei ein „visueller“, „auditiver“ oder „haptischer“ Lerntyp und lerne am besten, wenn der Unterricht dazu passt. Die Forschung hat das gründlich geprüft: Kinder lernen nicht besser, wenn der Unterricht an einen solchen Typ angepasst wird. Was nachweislich hilft, ist für alle ähnlich – zum Beispiel Bild und Wort zu kombinieren, sich selbst abzufragen und Lernen zu verteilen. Ein Etikett wie „Ich bin halt visuell“ kann Kinder sogar entmutigen. Deshalb zeigt Lerntyp keinen Typ an, sondern was Ihr Kind schon gut kann und welche Lernstrategien ihm helfen. Im Experiment „Lerndetektive“ prüft die Klasse die Lerntyp-Idee selbst.*
3. Datenschutz in Kürze: Alias-Karten, keine Namen im System, EU-Server, Löschung am Schuljahresende, keine Werbung, keine Käufe.
4. **Kein Einfluss auf Noten, Grundschulempfehlung oder Kompass 4.**
5. Begleitstudie: freiwillig, eigenes Formular, kein Nachteil bei Nein, Widerruf jederzeit.
6. Hinweis zur Genehmigung (Wortlaut lt. Genehmigungsbescheid; ggf. „keine wissenschaftliche Qualitätskontrolle“ – zu verifizieren (R0)).
7. Kontakt: Lehrkraft, Schulleitung, schulische/r DSB, Projektleitung PH. Einladung zum Elternabend.

### 6.2 Einwilligungserklärung Forschung (Gliederung)
1. Titel der Studie, verantwortliche Stelle (Spur B), Projektleitung, Kontakt DSB.
2. Zweck, Forschungsfragen in einfacher Sprache (RQ1–RQ5, [05-forschungsplan.md](05-forschungsplan.md)).
3. Welche Daten (Liste aus Abschnitt 3, nur Forschungsspalte); was ausdrücklich **nicht** erhoben wird.
4. Pseudonymisierung (Alias → Forschungs-ID), wer Zugriff hat, Speicherort EU.
5. Dauer, Anonymisierung nach Auswertung, Aufbewahrung anonymer Daten (Frist zu verifizieren (R0)), ggf. Veröffentlichung nur aggregiert, ggf. Datenteilen (Open Data) nur anonymisiert – gesondert ankreuzbar.
6. Freiwilligkeit, keine Nachteile, Teilnahme am Unterricht unabhängig davon.
7. Widerruf: wie (über Lehrkraft/Schule oder direkt an Projektleitung), Folge (Löschung), Grenze (nach Anonymisierung nicht mehr möglich).
8. Betroffenenrechte (Art. 15–21 DSGVO), Beschwerderecht bei der Aufsichtsbehörde (LfDI BW).
9. Kein Einsatz für Übergangsentscheidungen.
10. Unterschrift(en) Sorgeberechtigte (ob beide nötig: zu verifizieren (R0)), Datum, Klasse/Alias wird **von der Lehrkraft** zugeordnet (Formular selbst enthält den Namen, verbleibt in der Schule bzw. bei der Projektleitung – Ablage zu klären).

### 6.3 Kindgerechte Datenschutzinfo (Rohtext, Lesestufe Klasse 4)

> **Was passiert mit deinen Daten bei Lerntyp?**
>
> Bei Lerntyp hast du einen Tiernamen, zum Beispiel „Fuchs-27“. Deinen echten Namen schreibst du nie in die App. Nur deine Lehrerin oder dein Lehrer weiß, welcher Tiername zu dir gehört. Das steht auf einem Zettel in der Schule. Die App merkt sich deine Antworten und wie lange du für eine Aufgabe brauchst. Daraus zeigt sie dir, was du schon gut kannst und welche Lern-Tricks dir helfen. Lerntyp gibt keine Noten und hat nichts mit deinem Zeugnis oder der Empfehlung für die nächste Schule zu tun. Es gibt keine Werbung, und du kannst nichts kaufen. Am Ende des Schuljahres wird alles gelöscht. Manche Kinder helfen außerdem Forscherinnen und Forschern – das geht nur, wenn deine Eltern und du Ja sagen. Du darfst immer Nein sagen oder aufhören, und niemand ist dir deshalb böse. Wenn du Fragen hast, frag deine Lehrerin oder deinen Lehrer.

(Prüfen in R1 mit Kindern: Verständlichkeit, ggf. Vorlesefunktion und DaZ-Version, siehe [05-forschungsplan.md](05-forschungsplan.md).)

### 6.4 Zustimmung des Kindes – Assent (Gliederung)
- **Form:** kurzes Gespräch mit der Klasse + einseitiges Blatt; Lehrkraft liest vor. Nur für Kinder, deren Eltern eingewilligt haben, aber **ohne** dass die Klasse sieht, wer das ist (z. B. Blatt für alle, Einsammeln im Umschlag).
- **Text (Entwurf):** „Forscherinnen und Forscher wollen herausfinden, wie Kinder gut lernen. Deine Eltern haben erlaubt, dass sie deine Antworten aus Lerntyp anschauen – ohne deinen Namen. Möchtest du mitmachen?“
- **Piktogramme (Vorschlag):** großer Daumen hoch („Ja, ich mache mit“), Daumen runter („Nein, lieber nicht“), Fragezeichen („Ich möchte erst noch etwas fragen“); zusätzlich ein **Stopp-Schild** als Symbol für „Ich darf jederzeit aufhören“. Ankreuzen statt Schreiben.
- **Regeln:** Ein Nein des Kindes gilt, auch wenn die Eltern Ja gesagt haben → `consent_research` bleibt `false`. Späteres Nein jederzeit über die Lehrkraft.
- **Offen:** ob Assent schriftlich dokumentiert werden muss oder mündlich + Vermerk genügt (Ethikkommission) – zu verifizieren (R0).

### 6.5 AVV-Checkliste (Art. 28 Abs. 3 DSGVO)
- [ ] Gegenstand, Dauer, Art und Zweck der Verarbeitung; Datenarten; Kategorien Betroffener (Kinder, Lehrkräfte)
- [ ] Weisungsgebundenheit; Dokumentation von Weisungen
- [ ] Vertraulichkeitsverpflichtung aller Beteiligten
- [ ] TOM als Anlage (6.6)
- [ ] Unterauftragsverarbeiter (Hoster) benannt, mit Sitz/Serverstandort EU; Genehmigungs-/Widerspruchsverfahren bei Wechsel
- [ ] Unterstützung bei Betroffenenrechten, DSFA, Meldung von Datenpannen (Art. 33/34) mit Frist
- [ ] Löschung/Rückgabe nach Vertragsende; Löschung zum Schuljahresende
- [ ] Nachweis- und Kontrollrechte der Schule
- [ ] Keine Drittlandübermittlung
- [ ] Ob ein vom Land/LfDI BW bereitgestelltes Muster zu verwenden ist: zu verifizieren (R0)

### 6.6 TOM-Übersicht (Art. 32 DSGVO)
| Bereich | Maßnahme |
|---|---|
| Pseudonymisierung | Alias statt Name; zweite Forschungs-ID im Export; Alias↔Name nur auf Papier |
| Verschlüsselung | TLS für alle Verbindungen; Verschlüsselung der DB/Backups at rest |
| Zugriff | Lehrkraft sieht nur eigene Klassen; Forschungsexport nur durch berechtigte Projektrolle; starke Passwörter, ggf. 2FA |
| Shared iPad | Lokale IndexedDB-Warteschlange nach Sync und beim Abmelden löschen; keine Daten im iCloud-Backup (Dossier §5.2) |
| Keine Dritten | Keine Analytics, keine Tracking-SDKs, keine externen Schriften/CDNs; CSP blockiert externe Requests |
| Protokollierung | Minimale Server-Logs, IP gekürzt oder kurze Frist; Zugriffsprotokoll für Exporte |
| Verfügbarkeit | Regelmäßige verschlüsselte Backups beim EU-Hoster; Wiederherstellung getestet |
| Löschung | Automatischer Job zum Schuljahresende; Widerrufs-Löschung binnen festgelegter Frist |
| Organisation | Verpflichtung auf Vertraulichkeit; Pannen-Meldeweg an Schule |

---

## 7. Löschkonzept & Betroffenenrechte

| Ereignis | Was passiert | Wer |
|---|---|---|
| Erfolgreicher Sync / Abmelden am Tablet | Lokale Ereignis-Warteschlange (IndexedDB) wird geleert | App automatisch |
| **Schuljahresende** | Alle Klassen-, Alias-, Antwort-, Ereignis- und Profildaten der Spur A werden auf dem Server gelöscht; Lehrkraft vernichtet Alias↔Name-Liste | Server-Job; Lehrkraft |
| **Widerruf der Einwilligung** | `consent_research → false`; bereits exportierte Forschungsdaten zur Forschungs-ID werden gelöscht (Lehrkraft meldet Alias, System ermittelt Forschungs-ID). Schulische Nutzung (Spur A) läuft weiter. | Lehrkraft → Projektleitung; Frist festlegen (zu verifizieren (R0)) |
| Ende Datenerhebung (nach verzögertem Test, R3) | Zuordnungstabelle Alias↔Forschungs-ID wird gelöscht → Forschungsdaten anonym; Prüfung, ob kleine Klassen + Prozessdaten Re-Identifikation erlauben (ggf. Vergröberung) | Projektleitung |
| Nach Auswertung | Nur anonymisierte Daten bleiben (Aufbewahrung nach Regeln guter wiss. Praxis; Frist zu verifizieren (R0)) | Partner-PH |

**Betroffenenrechte (Art. 15–21 DSGVO).**
- **Auskunft, Berichtigung, Löschung** laufen **über die Schule**, weil nur dort Alias und Name zusammengeführt werden können. Der Betreiber unterstützt als Auftragsverarbeiter (Export aller Daten zu einem Alias, Löschung eines Alias).
- **Widerspruch** (Art. 21) gegen die schulische Verarbeitung: Umgang (z. B. Teilnahme ohne Speicherung / „Gastmodus“) mit DSB klären – zu verifizieren (R0).
- Forschungsspur: Rechte gegenüber der forschenden Institution; Einschränkungen nach Art. 89 Abs. 2 DSGVO / LDSG BW werden **nicht** vorausgesetzt – zu verifizieren (R0).
- Beschwerderecht bei der Aufsichtsbehörde (LfDI BW).

---

## 8. Offene Rechtsfragen

Alle Punkte: **zu verifizieren (R0)**, Verantwortlich: Projektleitung mit DSB / Rechtsberatung der Partner-PH.

1. Welche konkreten Normen in **SchG BW** und **LDSG BW** decken den schulischen Einsatz (Spur A)? Verlangt das Land für digitale Lernanwendungen zusätzlich eine Einwilligung oder eine Freigabe (z. B. Positivliste)?
2. Ist die Schule oder eine andere Stelle (Land, Schulträger) **Verantwortliche**? Wer unterzeichnet den AVV?
3. **Verantwortlichkeit Spur B:** eigenständig (PH) oder gemeinsam mit der Schule (Art. 26)?
4. Aktuelle Fassung der **VwV „Werbung, Wettbewerbe und Erhebungen in Schulen“**, zuständiges RP/KM, Unterlagen, Bearbeitungsdauer, Zulässigkeit während der Unterrichtszeit.
5. Muss **Gesamtlehrerkonferenz, Schulkonferenz** oder Elternbeirat zustimmen oder nur informiert werden?
6. Unterschrift **eines oder beider Sorgeberechtigten**? Umgang mit getrennt lebenden Eltern.
7. Form des **Assent** (schriftlich/mündlich), Anforderungen der Ethikkommission.
8. Ist eine **DSFA verpflichtend** (DSK-/LfDI-Muss-Liste)? Wer führt sie (Schule vs. PH)?
9. Reicht die Ausnahme **§ 25 Abs. 2 Nr. 2 TDDDG** für IndexedDB/Service Worker auf Schulgeräten, wenn die Schule (nicht das Kind) den Dienst anfordert?
10. Gelten **JMStV-/JuSchG-Pflichten** (z. B. Jugendschutzbeauftragte/r, Alterskennzeichnung) für eine nicht-kommerzielle, geschlossene Schul-PWA? Aktuelle Fassung von § 6 JMStV.
11. Ist Lerntyp ein Dienst, auf den **DSA Art. 25/28** anwendbar ist (Online-Plattform)? (Umsetzung erfolgt ohnehin freiwillig.)
12. **Aufbewahrungsfristen**: Einwilligungsformulare, anonymisierte Forschungsdaten, Server-Logs mit IP.
13. Sind die anonymisierten Daten bei kleinen Klassen tatsächlich **anonym** (Re-Identifikationsrisiko durch Prozessdaten + Klassenkontext)?
14. Datenschutzrechtliche Hinweise des RP Freiburg (2026-05, Link in Abschnitt 5) auswerten und auf alle RPs übertragbar?
15. Organisatorische Absicherung der **Zweckbindung** gegenüber Übergangsentscheidungen: reicht die Produktgestaltung, oder braucht es eine schriftliche Zusage der Schule/Lehrkraft?
16. Lehrkraft-Interviews (R1): ebenfalls genehmigungspflichtig nach VwV?
