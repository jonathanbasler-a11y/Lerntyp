#!/usr/bin/env python3
"""Erzeugt alle Audiodateien der Lerndetektive (vorproduziert, synthetische Stimme, keine Sprachausgabe zur Laufzeit).

Pipeline je Text: Piper -> WAV -> ffmpeg (Stille vorn/hinten weg, loudnorm -16 LUFS, mono, 22050 Hz, MP3 64 kbit/s)
-> apps/web/public/audio/<datei>.mp3. Schreibt data/audio/manifest.json, data/audio/vorlesen.json (Textschlüssel aus de.json) und data/audio/vorlesen-daten.json (Texte aus Parcours- und Profil-Daten).
Unveränderte Texte (gleicher SHA-256) werden übersprungen; `--alle` erzwingt die Neuerzeugung.

Aufruf (nur Standardbibliothek, `-I` schützt vor fremden Modulen im Arbeitsverzeichnis):
  Linux/macOS:  PIPER_BIN=/pfad/zu/piper PIPER_MODEL=/pfad/zu/de_DE-thorsten-high.onnx python3 -I scripts/audio/erzeugen.py
  Windows (PowerShell):
    $env:PIPER_BIN = "C:\\piper\\venv\\Scripts\\piper.exe"
    $env:PIPER_MODEL = "C:\\piper\\voice\\de_DE-thorsten-high.onnx"
    py -3 -I scripts\\audio\\erzeugen.py
  Oder mit Argumenten: --piper <Programm> --modell <onnx-Datei> [--ffmpeg <Programm>] [--alle]
Voraussetzungen: Piper (pip install piper-tts) mit Stimme de_DE-thorsten-high und ffmpeg im PATH.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

WURZEL = Path(__file__).resolve().parents[2]
DATEN = WURZEL / "data"
AUSGABE = WURZEL / "apps" / "web" / "public" / "audio"
STIMME = "de_DE-thorsten-high (Piper)"
LIZENZ = "Datensatz CC0 (Thorsten-Voice); Basismodell en_US-lessac – Lizenz zu verifizieren (R0)"

# Kindgerichtete Oberflächentexte mit Vorlese-Knopf: exakte Schlüssel aus data/texte/de.json.
# Nur Texte, die ein Kind liest (keine Knopfbeschriftungen, keine Lehrkraft-Texte, keine Platzhalter wie {n}).
UI_SCHLUESSEL = [
    "start.titel",
    "start.untertitel",
    "lernausweis.titel",
    "lernausweis.hinweis",
    "fertig.titel",
    "fertig.text",
    "kind.laedt.titel",
    "kind.laedt.text",
    "kind.fehler.titel",
    "kind.fehler.text",
    "kind.pausiert.titel",
    "kind.pausiert.text",
    "kind.start.titel",
    "kind.start.text",
    "kind.vermutung.titel",
    "kind.vermutung.text",
    "kind.lernen.titel",
    "kind.lernen.text",
    "kind.sterne.titel",
    "kind.sterne.frage",
    "kind.test.frage",
    "kind.test.frage_verzoegert",
    "kind.zuschauer.titel",
    "kind.zuschauer.text",
    "kind.nach_vorne.titel",
    "kind.klassenergebnis.text",
    "kind.vergleich.text",
    "kind.warten.titel",
    "kind.warten.text",
    "kind.superkraft.frage",
    "kind.weiter_geht.titel",
    "kind.weiter_geht.text",
    # Strategie-Parcours und Lernprofil (Phase 4)
    "parcours.station.s1.titel",
    "parcours.station.s1.einleitung",
    "parcours.station.s2.titel",
    "parcours.station.s2.einleitung",
    "parcours.station.s3.titel",
    "parcours.station.s3.einleitung",
    "parcours.planen.frage",
    "parcours.planen.sicherheit",
    "parcours.smiley.1",
    "parcours.smiley.2",
    "parcours.smiley.3",
    "parcours.smiley.4",
    "parcours.pruefen.titel",
    "parcours.pruefen.ziel_erreicht",
    "parcours.pruefen.geholfen",
    "parcours.pruefen.nichts",
    "parcours.s1.luecke",
    "parcours.s1.warum",
    "parcours.s2.aufgabe",
    "parcours.s2.bloecke",
    "parcours.s3.aufgabe",
    "parcours.richtig",
    "parcours.warten",
    "strategie.gedaechtnis_training",
    "strategie.haeppchen_lernen",
    "strategie.doppelt_merken",
    "strategie.mischen",
    "strategie.warum_fragen",
    "strategie.beispiele",
    "profil.titel",
    "profil.staerken",
    "profil.superkraft",
    "profil.tipp",
    "profil.passt",
    "profil.smiley.1",
    "profil.smiley.2",
    "profil.smiley.3",
    "profil.smiley.4",
]


def daten_texte() -> list[dict]:
    """Kindtexte aus den Datendateien (Parcours, Profil): [{key, datei, text}].

    Schlüssel (auch in apps/web und scripts/validate-data.ts):
    `<aufgabe>.hinweis1|hinweis2|fehler`, `<station>.muster`, `karte.<id>`, `fallback`,
    `superkraft.<strategie>`, `tipp.<strategie>`, `sk_frage.<strategie>`.
    """
    de = lies_json(DATEN / "texte" / "de.json")
    karten = lies_json(DATEN / "profil" / "karten.json")
    out: list[dict] = []

    def add(key: str, text: str) -> None:
        out.append({"key": key, "datei": "pc-" + key.replace(".", "-").replace("_", "-") + ".mp3", "text": text})

    for datei, station in (("s1-wort-werkstatt.json", "s1"), ("s2-satz-baukasten.json", "s2"), ("s3-wuerfel-baumeister.json", "s3")):
        d = lies_json(DATEN / "parcours" / datei)
        add(f"{station}.muster", d["musterbeispiel"]["erklaerung"])
        for a in d["aufgaben"]:
            for feld in ("hinweis1", "hinweis2", "fehler"):
                add(f"{a['id']}.{feld}", a[feld])
    for k in karten["karten"]:
        add("karte." + k["id"], k["text"])
    add("fallback", karten["fallback"]["text"])
    for s, text in karten["superkraft"].items():
        add(f"superkraft.{s}", text)
        add(f"sk_frage.{s}", de["kind.superkraft.frage_profil"].replace("{name}", de[f"strategie.{s}"]))
    for s, text in karten["tipps"].items():
        add(f"tipp.{s}", text)
    return out


def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def lies_json(pfad: Path):
    return json.loads(pfad.read_text(encoding="utf-8"))


def ui_datei(schluessel: str) -> str:
    return "ui-" + schluessel.replace(".", "-").replace("_", "-") + ".mp3"


def sammle_texte() -> list[dict]:
    """Liefert [{datei, text, sprich}]: `text` ist der Quelltext (Hash), `sprich` das, was Piper bekommt."""
    exp = lies_json(DATEN / "lerndetektive" / "experiment.json")
    de = lies_json(DATEN / "texte" / "de.json")
    eintraege: list[dict] = []
    for item in exp["items"]:
        # Einzelwort mit Schlusspunkt: natürlichere Betonung.
        eintraege.append({"datei": item["audio"], "text": item["wort"], "sprich": item["wort"] + "."})
    for liste in (exp["ueberzeugungen"], exp["vorlieben"]):
        for e in liste:
            eintraege.append({"datei": e["audio"], "text": e["text"], "sprich": e["text"]})
    eintraege.append({"datei": "check.mp3", "text": de["audio.check_satz"], "sprich": de["audio.check_satz"]})
    for k in UI_SCHLUESSEL:
        eintraege.append({"datei": ui_datei(k), "text": de[k], "sprich": de[k]})
    for e in daten_texte():
        eintraege.append({"datei": e["datei"], "text": e["text"], "sprich": e["text"]})
    dateien = [e["datei"] for e in eintraege]
    doppelt = {d for d in dateien if dateien.count(d) > 1}
    if doppelt:
        sys.exit(f"Doppelte Dateinamen: {sorted(doppelt)}")
    return eintraege


def erzeuge(eintrag: dict, piper: str, modell: str, ffmpeg: str) -> None:
    ziel = AUSGABE / eintrag["datei"]
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "roh.wav"
        subprocess.run([piper, "-m", modell, "-f", str(wav)], input=eintrag["sprich"].encode("utf-8"), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        filt = (
            "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,"
            "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.02,areverse,"
            "loudnorm=I=-16:TP=-1.5:LRA=11,"
            # kurze Ruhe vorn und hinten, damit Wörter nicht abgehackt beginnen/enden
            "adelay=80:all=1,apad=pad_dur=0.15"
        )
        subprocess.run(
            [ffmpeg, "-y", "-loglevel", "error", "-i", str(wav), "-af", filt, "-ac", "1", "-ar", "22050", "-c:a", "libmp3lame", "-b:a", "64k", str(ziel)],
            check=True,
        )


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--piper", default=os.environ.get("PIPER_BIN", "piper"))
    ap.add_argument("--modell", default=os.environ.get("PIPER_MODEL"))
    ap.add_argument("--ffmpeg", default=os.environ.get("FFMPEG_BIN", "ffmpeg"))
    ap.add_argument("--alle", action="store_true", help="alle Dateien neu erzeugen, auch unveränderte")
    a = ap.parse_args()
    if not a.modell:
        sys.exit("Stimmenmodell fehlt: --modell <de_DE-thorsten-high.onnx> oder Umgebungsvariable PIPER_MODEL setzen.")

    AUSGABE.mkdir(parents=True, exist_ok=True)
    (DATEN / "audio").mkdir(parents=True, exist_ok=True)
    manifest_pfad = DATEN / "audio" / "manifest.json"
    alt = {e["datei"]: e for e in (lies_json(manifest_pfad) if manifest_pfad.exists() else [])}

    texte = sammle_texte()
    neu = 0
    for e in texte:
        h = sha256(e["text"])
        vorhanden = (AUSGABE / e["datei"]).exists()
        if not a.alle and vorhanden and alt.get(e["datei"], {}).get("sha256") == h:
            continue
        erzeuge(e, a.piper, a.modell, a.ffmpeg)
        neu += 1
        print(f"erzeugt: {e['datei']}  ({e['text'][:50]})")

    manifest = [{"datei": e["datei"], "text": e["text"], "sha256": sha256(e["text"]), "stimme": STIMME, "lizenz": LIZENZ} for e in texte]
    manifest_pfad.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    vorlesen = [{"key": k, "datei": ui_datei(k)} for k in UI_SCHLUESSEL]
    (DATEN / "audio" / "vorlesen.json").write_text(json.dumps(vorlesen, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    vorlesen_daten = [{"key": e["key"], "datei": e["datei"]} for e in daten_texte()]
    (DATEN / "audio" / "vorlesen-daten.json").write_text(json.dumps(vorlesen_daten, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Verwaiste Dateien (Text entfernt) bleiben liegen; Hinweis statt stilles Löschen.
    soll = {e["datei"] for e in texte}
    verwaist = sorted(p.name for p in AUSGABE.glob("*.mp3") if p.name not in soll)
    if verwaist:
        print("Hinweis: nicht mehr referenziert (bitte prüfen/löschen):", ", ".join(verwaist))
    gesamt = sum((AUSGABE / e["datei"]).stat().st_size for e in texte)
    print(f"{len(texte)} Dateien, {neu} neu erzeugt, {gesamt / 1024:.0f} KiB gesamt")
    return 0


if __name__ == "__main__":
    sys.exit(main())
