import { useState } from 'react';
import type { ParcoursTyp, Station, StationSchritt, Strategie } from '@lerntyp/shared';
import { parcoursDaten } from '../../../parcours/daten';
import { AufgabeRahmen } from './AufgabeRahmen';
import { Pruefen } from './Pruefen';
import { Sicherheit, ZielWahl } from './Planen';
import { Rueckmeldung } from './Rueckmeldung';
import { S1Aufgabe, S1Muster, type AntwortDaten } from './S1';
import { S2Aufgabe, S2Muster } from './S2';
import { S3Aufgabe, S3Muster } from './S3';

export type StationAufgabeSchritt = Extract<StationSchritt, { art: 'aufgabe' }>;

interface Rueck {
  aufgabeId: string;
  korrekt: boolean;
  versuch: 1 | 2;
  erklaerung: string;
}

/**
 * Eine Station mit der SRL-Schleife Planen – Üben – Prüfen (01 §7.3). Der nächste Schritt kommt aus den Ereignissen
 * (`stationSchritt`); lokal merkt sich die Komponente nur die Rückmeldung nach einer Antwort, bis das Kind „Weiter“ tippt.
 */
export function StationAnsicht({
  station,
  schritt,
  senden,
}: {
  station: Station;
  schritt: Exclude<StationSchritt, { art: 'fertig' }>;
  senden: (typ: ParcoursTyp, payload: Record<string, unknown>) => void;
}) {
  const [rueck, setRueck] = useState<Rueck | null>(null);
  const daten = parcoursDaten[station];

  if (rueck) return <Rueckmeldung {...rueck} onWeiter={() => setRueck(null)} />;

  switch (schritt.art) {
    case 'planen_ziel':
      return <ZielWahl station={station} onZiel={(ziel) => senden('ziel_gesetzt', { station, ziel })} />;
    case 'planen_sicherheit':
      return <Sicherheit station={station} onSmiley={(smiley) => senden('sicherheit_vorher', { station, smiley })} />;
    case 'pruefen':
      return <Pruefen ziel={schritt.ziel} geschafft={schritt.geschafft} zielErreicht={schritt.ziel_erreicht} onFertig={(strategien: Strategie[]) => senden('hilfreich_gewaehlt', { station, strategien })} />;
    case 'aufgabe':
      break;
  }

  const ref = { station, aufgabe_id: schritt.aufgabe_id };
  const antwort = (erklaerung: string) => (a: AntwortDaten) => {
    senden('antwort_abgegeben', { ...ref, korrekt: a.korrekt, versuch: schritt.versuch, rt_ms: a.rt_ms, antwort: a.antwort, ...(a.begruendung ? { begruendung: a.begruendung } : {}) });
    setRueck({ aufgabeId: schritt.aufgabe_id, korrekt: a.korrekt, versuch: schritt.versuch, erklaerung });
  };
  const rahmen = {
    station,
    nummer: schritt.nummer,
    aufgabeId: schritt.aufgabe_id,
    hinweisStufe: schritt.hinweis_stufe,
    onBeispiel: () => !schritt.beispiel_geoeffnet && senden('beispiel_geoeffnet', ref),
    onHinweis: (stufe: 1 | 2) => schritt.hinweis_stufe < stufe && senden('hinweis_genutzt', { ...ref, stufe }),
    onUeberspringen: () => senden('aufgabe_uebersprungen', ref),
  };
  // Die Komponenten merken sich ihre Eingabe je Aufgabe und Versuch: neuer Schlüssel = leere Eingabe.
  const schluessel = `${schritt.aufgabe_id}-${schritt.versuch}`;

  if (daten.station === 's1') {
    const a = daten.aufgaben.find((x) => x.id === schritt.aufgabe_id);
    if (!a) return null;
    return (
      <AufgabeRahmen key={schritt.aufgabe_id} {...rahmen} aufgabeText="parcours.s1.luecke" hinweis1={a.hinweis1} hinweis2={a.hinweis2} muster={<S1Muster muster={daten.musterbeispiel} />}>
        <S1Aufgabe key={schluessel} aufgabe={a} onAntwort={antwort(a.fehler)} />
      </AufgabeRahmen>
    );
  }
  if (daten.station === 's2') {
    const a = daten.aufgaben.find((x) => x.id === schritt.aufgabe_id);
    if (!a) return null;
    return (
      <AufgabeRahmen key={schritt.aufgabe_id} {...rahmen} aufgabeText="parcours.s2.aufgabe" hinweis1={a.hinweis1} hinweis2={a.hinweis2} muster={<S2Muster muster={daten.musterbeispiel} anzeige={daten.anzeige} />}>
        <S2Aufgabe key={schluessel} aufgabe={a} anzeige={daten.anzeige} onAntwort={antwort(a.fehler)} />
      </AufgabeRahmen>
    );
  }
  const a = daten.aufgaben.find((x) => x.id === schritt.aufgabe_id);
  if (!a) return null;
  return (
    <AufgabeRahmen key={schritt.aufgabe_id} {...rahmen} aufgabeText="parcours.s3.aufgabe" hinweis1={a.hinweis1} hinweis2={a.hinweis2} muster={<S3Muster muster={daten.musterbeispiel} />}>
      <S3Aufgabe key={schluessel} aufgabe={a} onAntwort={antwort(a.fehler)} />
    </AufgabeRahmen>
  );
}
