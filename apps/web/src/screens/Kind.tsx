import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { berechneProfil, type Bedingung, type EventEnvelope, type LernEintrag, type ParcoursTyp } from '@lerntyp/shared';
import type { ApiClient, SitzungsStand, Teilnehmer } from '../api/client';
import { KindLeiste } from '../components/KindLeiste';
import { demo } from '../demoData';
import { daten } from '../lerndetektive/daten';
import { berechneSchritt } from '../lerndetektive/schritt';
import { EreignisSender, naechsteSeq } from '../lerndetektive/sender';
import { istSchnell, zeiten } from '../lerndetektive/zeiten';
import { kartenDaten } from '../parcours/daten';
import { anzeigeFuer, gespeichertesProfil } from '../parcours/profil';
import { Fertig } from './Fertig';
import { AudioStart } from './kind/AudioStart';
import { Lernen } from './kind/Lernen';
import { Mitteilung } from './kind/Mitteilung';
import { PauseAufgabe } from './kind/PauseAufgabe';
import { Profil } from './kind/Profil';
import { StationAnsicht } from './kind/station/Station';
import { Superkraft } from './kind/Superkraft';
import { Test } from './kind/Test';
import { Ueberzeugung } from './kind/Ueberzeugung';
import { Vorliebe } from './kind/Vorliebe';

const hatTyp = (ev: readonly EventEnvelope[], typ: string, pruefe: (p: Record<string, unknown>) => boolean = () => true) =>
  ev.some((e) => e.typ === typ && pruefe(e.payload));

/**
 * Kinder-Ablauf der Lerndetektive: bestimmt mit `naechsterSchritt` den nächsten Schritt rein aus den
 * Ereignissen des Kindes und zeigt je `Schritt.art` einen Bildschirm. Kinder sehen nie Ergebnisse.
 */
export function Kind({ client, alias, onZumStart }: { client: ApiClient; alias: string; onZumStart: () => void }) {
  const [stand, setStand] = useState<SitzungsStand | null>(null);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer | null>(null);
  const [ereignisse, setEreignisse] = useState<EventEnvelope[] | null>(null);
  const [fehler, setFehler] = useState(false);
  const [lernEintrag, setLernEintrag] = useState<LernEintrag | null>(null);
  const [anleitungGesehen, setAnleitungGesehen] = useState(false);
  const [vermutungGesehen, setVermutungGesehen] = useState(false);
  const [nachLernPause, setNachLernPause] = useState(false);
  const ereignisseRef = useRef<EventEnvelope[]>([]);
  const senderRef = useRef<EreignisSender | null>(null);
  const ablauf = useMemo(() => zeiten(daten.ablauf, istSchnell(window.location.search, __DEMO__)), []);

  useEffect(() => {
    let aktiv = true;
    let abmelden: () => void = () => undefined;
    void (async () => {
      try {
        const beitritt = await client.joinSession(demo.sitzungscode, alias);
        const [s, ev] = await Promise.all([client.getStand(), client.getEvents({ alias })]);
        if (!aktiv) return;
        ereignisseRef.current = ev;
        setEreignisse(ev);
        setTeilnehmer(beitritt.teilnehmer);
        setStand(s);
        abmelden = client.abonniere(() => void client.getStand().then((n) => aktiv && setStand(n)));
      } catch {
        if (aktiv) setFehler(true);
      }
    })();
    return () => {
      aktiv = false;
      abmelden();
    };
  }, [client, alias]);

  /** Erzeugt ein Ereignis, hängt es sofort lokal an und schickt es an den Adapter. */
  const senden = useCallback(
    (typ: string, payload: Record<string, unknown>, sitzung: string, modul?: EventEnvelope['modul']) => {
      if (senderRef.current?.sitzung !== sitzung) {
        senderRef.current = new EreignisSender({ sitzung, alias, startSeq: naechsteSeq(ereignisseRef.current, sitzung, alias) });
      }
      const ev = senderRef.current.erzeuge(typ, payload, modul);
      ereignisseRef.current = [...ereignisseRef.current, ev];
      setEreignisse(ereignisseRef.current);
      void client.sendEvents([ev]).catch(() => undefined);
    },
    [client, alias],
  );

  const sitzung = stand?.sitzung ?? '';
  const startNoetig = ereignisse !== null && !ereignisse.some((e) => e.typ === 'audio_check' && e.sitzung === sitzung);
  const schritt = useMemo(
    () => (stand && teilnehmer && ereignisse && !startNoetig ? berechneSchritt(stand, teilnehmer, ereignisse, daten) : null),
    [stand, teilnehmer, ereignisse, startNoetig],
  );

  // Lernphase: Das aktuelle Ding bleibt bis zum Ende seines Takts stehen, auch wenn `item_gezeigt` schon den nächsten Schritt freigibt.
  if (schritt?.art === 'lernen' && lernEintrag === null) setLernEintrag(schritt.eintrag);
  if (schritt?.art === 'pausiert' && lernEintrag !== null) {
    setLernEintrag(null);
    setNachLernPause(true); // Das unterbrochene Ding kommt nicht wieder (02 §8); danach ein ruhiger „Weiter geht's“-Bildschirm.
  }
  if (nachLernPause && schritt && schritt.art !== 'pausiert' && schritt.art !== 'lernen') setNachLernPause(false);

  // `abschliessen`: Die Oberfläche sendet `phase_abgeschlossen` und fragt dann neu (02 §8).
  const abschluss = schritt?.art === 'abschliessen' ? schritt : null;
  useEffect(() => {
    if (!abschluss) return;
    // Das letzte Ding der Lernphase bleibt bis zum Ende seines Takts stehen.
    if (abschluss.phase === 'lernen' && lernEintrag) return;
    if (hatTyp(ereignisseRef.current, 'phase_abgeschlossen', (p) => p['phase'] === abschluss.phase)) return;
    senden('phase_abgeschlossen', { phase: abschluss.phase, abgebrochen: abschluss.abgebrochen }, sitzung);
  }, [abschluss, lernEintrag, senden, sitzung]);

  // Parcours: Das Zeigen einer Aufgabe wird einmal je Aufgabe gemeldet, das Profil einmal berechnet und gespeichert (nur aus Verhaltensspuren).
  const parcoursSchritt = schritt?.art === 'parcours' ? schritt : null;
  const zuZeigen = parcoursSchritt?.schritt.art === 'aufgabe' && parcoursSchritt.schritt.zeigen ? parcoursSchritt.schritt.aufgabe_id : null;
  const zeigeStation = parcoursSchritt?.station;
  const profilFaellig = schritt?.art === 'profil_zeigen';
  useEffect(() => {
    if (!zuZeigen || !zeigeStation) return;
    const schonGezeigt = ereignisseRef.current.some((e) => e.modul === 'parcours' && e.typ === 'aufgabe_gezeigt' && e.payload['aufgabe_id'] === zuZeigen);
    if (!schonGezeigt) senden('aufgabe_gezeigt', { station: zeigeStation, aufgabe_id: zuZeigen }, sitzung, 'parcours');
  }, [zuZeigen, zeigeStation, senden, sitzung]);
  useEffect(() => {
    if (!profilFaellig || ereignisseRef.current.some((e) => e.typ === 'profil_angezeigt')) return;
    const p = berechneProfil(ereignisseRef.current, kartenDaten);
    senden('profil_angezeigt', { karten_ids: p.karten_ids, superkraft: p.superkraft }, sitzung, 'profil');
  }, [profilFaellig, senden, sitzung]);

  if (fehler) return <Rahmen><Mitteilung id="fehler" titel="kind.fehler.titel" text="kind.fehler.text" /></Rahmen>;
  if (!stand || !teilnehmer || !ereignisse) return <Rahmen><Mitteilung id="laedt" titel="kind.laedt.titel" text="kind.laedt.text" /></Rahmen>;

  const audioChecks = ereignisse.filter((e) => e.typ === 'audio_check' && e.sitzung === sitzung);
  const audioOk = audioChecks[audioChecks.length - 1]?.payload['ok'] === true;
  const schrittId = startNoetig
    ? 'start'
    : schritt
      ? `${schritt.art}:${'item_id' in schritt ? schritt.item_id : 'eintrag' in schritt ? schritt.eintrag.position : ''}:${lernEintrag?.position ?? ''}`
      : '';
  const rahmen = (inhalt: React.ReactNode, mitLeiste = true) => (
    <div className="kind" data-testid="kind-bildschirm">
      {mitLeiste && <KindLeiste schrittId={schrittId} onPause={() => senden('pause', { aktiv: true }, sitzung)} onHilfe={() => senden('hilfe_angefordert', {}, sitzung)} />}
      {inhalt}
    </div>
  );

  if (startNoetig) {
    return rahmen(
      <AudioStart
        onFertig={(ok) => {
          if (!hatTyp(ereignisseRef.current, 'rotation_zugewiesen')) senden('rotation_zugewiesen', { rotation: teilnehmer.rotation, seed: teilnehmer.seed }, sitzung);
          senden('audio_check', { ok }, sitzung);
        }}
      />,
    );
  }
  if (!schritt) return null;

  const hatGelernt = hatTyp(ereignisse, 'item_gezeigt');
  const hatV4 = hatTyp(ereignisse, 'vorliebe_beantwortet', (p) => p['item_id'] === 'V4');
  if (hatV4 && !hatGelernt && !vermutungGesehen && stand.stunde === 'haupt' && (schritt.art === 'warten' || schritt.art === 'lernen')) {
    return rahmen(<Mitteilung id="vermutung" titel="kind.vermutung.titel" text="kind.vermutung.text" weiter={{ label: 'kind.weiter', onWeiter: () => setVermutungGesehen(true), testId: 'vermutung-weiter' }} />);
  }

  if (schritt.art === 'lernen' && !hatGelernt && !anleitungGesehen) {
    return rahmen(<Mitteilung id="anleitung" titel="kind.lernen.titel" text="kind.lernen.text" weiter={{ label: 'kind.lernen.los', onWeiter: () => setAnleitungGesehen(true), testId: 'lernen-los' }} />);
  }
  if (nachLernPause && schritt.art === 'lernen') {
    return rahmen(<Mitteilung id="weiter_geht" titel="kind.weiter_geht.titel" text="kind.weiter_geht.text" weiter={{ label: 'kind.weiter', onWeiter: () => setNachLernPause(false), testId: 'weiter-geht' }} />);
  }
  if (lernEintrag && (schritt.art === 'lernen' || schritt.art === 'abschliessen')) {
    return rahmen(
      <Lernen
        key={lernEintrag.position}
        eintrag={lernEintrag}
        zeiten={ablauf}
        audioOk={audioOk}
        onGezeigt={(e) => {
          if (hatTyp(ereignisseRef.current, 'item_gezeigt', (p) => p['position'] === e.position)) return;
          senden('item_gezeigt', { ...e, audio_ok: audioOk }, sitzung);
        }}
        onFertig={() => setLernEintrag(null)}
      />,
    );
  }

  switch (schritt.art) {
    case 'pausiert':
      return rahmen(<Mitteilung id="pausiert" titel="kind.pausiert.titel" text="kind.pausiert.text" weiter={{ label: 'kind.pausiert.weiter', onWeiter: () => senden('pause', { aktiv: false }, sitzung), testId: 'pause-weiter' }} />, false);
    case 'ueberzeugung':
      return rahmen(
        <Ueberzeugung
          key={`${schritt.zeitpunkt}-${schritt.item_id}`}
          itemId={schritt.item_id}
          onAntwort={(antwort, rt_ms) => senden('ueberzeugung_beantwortet', { item_id: schritt.item_id, antwort, zeitpunkt: schritt.zeitpunkt, rt_ms }, sitzung)}
        />,
      );
    case 'vorliebe':
      return rahmen(
        <Vorliebe
          key={schritt.item_id}
          itemId={schritt.item_id}
          onAntwort={(antwort: Bedingung, rt_ms) => senden('vorliebe_beantwortet', { item_id: schritt.item_id, antwort, rt_ms }, sitzung)}
        />,
      );
    case 'lernen':
      return null; // wird oben behandelt (Anleitung bzw. Darbietung)
    case 'pause_aufgabe':
      return rahmen(
        <PauseAufgabe
          dauer_ms={ablauf.pause_aufgabe_ms}
          onFertig={() => {
            if (!hatTyp(ereignisseRef.current, 'phase_abgeschlossen', (p) => p['phase'] === 'pause')) senden('phase_abgeschlossen', { phase: 'pause', abgebrochen: false }, sitzung);
          }}
        />,
      );
    case 'test':
      return rahmen(
        <Test
          key={`${schritt.test}-${schritt.eintrag.position}`}
          test={schritt.test}
          eintrag={schritt.eintrag}
          audioOk={audioOk}
          onAntwort={(antwort, rt_ms) =>
            senden('antwort_abgegeben', { item_id: schritt.eintrag.item_id, test: schritt.test, alt: schritt.eintrag.alt, antwort, rt_ms, position: schritt.eintrag.position }, sitzung)
          }
        />,
      );
    case 'zuschauer':
      return rahmen(<Mitteilung id="zuschauer" titel="kind.zuschauer.titel" text="kind.zuschauer.text" />);
    case 'klassenergebnis':
      return rahmen(<Mitteilung id="klassenergebnis" titel="kind.nach_vorne.titel" text="kind.klassenergebnis.text" />);
    case 'vergleich':
      return rahmen(<Mitteilung id="vergleich" titel="kind.nach_vorne.titel" text="kind.vergleich.text" />);
    case 'superkraft':
      return rahmen(<Superkraft superkraft={gespeichertesProfil(ereignisse)?.superkraft ?? null} onAntwort={(antwort) => senden('superkraft_ausprobiert', { antwort }, sitzung)} />);
    case 'parcours':
      return rahmen(
        <StationAnsicht
          key={schritt.station}
          station={schritt.station}
          schritt={schritt.schritt}
          senden={(typ: ParcoursTyp, payload) => senden(typ, { station: schritt.station, ...payload }, sitzung, 'parcours')}
        />,
      );
    case 'profil_zeigen':
    case 'profil_passt':
      return rahmen(<Profil anzeige={anzeigeFuer(ereignisse)} onPasst={(smiley) => senden('profil_passt', { smiley }, sitzung, 'profil')} />);
    case 'fertig':
      return rahmen(<Fertig onZumStart={onZumStart} />, false);
    case 'abschliessen':
    case 'warten':
      return rahmen(<Mitteilung id="warten" titel="kind.warten.titel" text="kind.warten.text" />);
  }
}

function Rahmen({ children }: { children: React.ReactNode }) {
  return (
    <div className="kind" data-testid="kind-bildschirm">
      {children}
    </div>
  );
}

