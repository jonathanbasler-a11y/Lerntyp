import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  KartenDatenSchema,
  LerndetektiveDatenSchema,
  PHASEN_STUNDE,
  PHASEN_HAUPT,
  PRIORITAET,
  REGELVERSION,
  S1DatenSchema,
  S2DatenSchema,
  S3DatenSchema,
  STATIONEN,
  STRATEGIEN,
  SUPERKRAFT_REIHENFOLGE,
  TexteSchema,
  berechneProfil,
  evidenz,
  indikatoren,
  naechsterSchritt,
  naechsterSchrittStunde,
  parseEvent,
  profilAnzeige,
  pruefeS1,
  pruefeS2,
  pruefeS3,
  satzText,
  stationSchritt,
  waehleSuperkraft,
  type AblaufKontext,
  type EventEnvelope,
  type KartenDaten,
  type ParcoursDaten,
  type PhaseStunde,
  type Station,
  type Strategie,
  type StundeSchritt,
} from '../src';

const lese = (rel: string) => JSON.parse(readFileSync(join(__dirname, '../../../data', rel), 'utf8'));
const ld = LerndetektiveDatenSchema.parse(lese('lerndetektive/experiment.json'));
const parcours: ParcoursDaten = {
  s1: S1DatenSchema.parse(lese('parcours/s1-wort-werkstatt.json')),
  s2: S2DatenSchema.parse(lese('parcours/s2-satz-baukasten.json')),
  s3: S3DatenSchema.parse(lese('parcours/s3-wuerfel-baumeister.json')),
};
const karten: KartenDaten = KartenDatenSchema.parse(lese('profil/karten.json'));
const texte = TexteSchema.parse(lese('texte/de.json'));

// ---------------------------------------------------------------------------
describe('Parcours-Inhalte', () => {
  it('jede Station hat ein Musterbeispiel und genau fünf Aufgaben', () => {
    for (const s of STATIONEN) {
      expect(parcours[s].aufgaben).toHaveLength(5);
      expect(parcours[s].musterbeispiel).toBeTruthy();
    }
  });
  it('S1: alle Lückentypen, mindestens eine e/ä-Aufgabe, Verlängern und Ableiten gemischt', () => {
    const typen = new Set(parcours.s1.aufgaben.map((a) => a.luecke_typ));
    expect(typen).toEqual(new Set(['d_t', 'g_k', 'b_p', 'e_ae']));
    expect(new Set(parcours.s1.aufgaben.map((a) => a.grund.art))).toEqual(new Set(['verlaengern', 'ableiten']));
    for (const a of parcours.s1.aufgaben) expect(a.luecke.replace('_', a.richtig)).toBe(a.wort);
  });
  it('S1: verkehrter Buchstabe oder falsche Lücke scheitert im Schema', () => {
    const d = structuredClone(lese('parcours/s1-wort-werkstatt.json'));
    d.aufgaben[0].richtig = 't';
    expect(S1DatenSchema.safeParse(d).success).toBe(false);
  });
  it('S2: jede gespeicherte Reihenfolge ist gültig (Verb an Position 1, jeder Block genau einmal)', () => {
    for (const a of [parcours.s2.musterbeispiel, ...parcours.s2.aufgaben]) {
      const verb = a.bloecke.findIndex((b) => b.art === 'praedikat');
      expect(a.bloecke.filter((b) => b.art === 'praedikat')).toHaveLength(1);
      for (const r of a.erlaubte_reihenfolgen) {
        expect(r[1]).toBe(verb);
        expect([...r].sort()).toEqual(a.bloecke.map((_, i) => i));
      }
      expect(a.erlaubte_reihenfolgen.some((r) => r[0] !== 0)).toBe(true);
      expect(a.bloecke.length).toBeGreaterThanOrEqual(3);
      expect(a.bloecke.length).toBeLessThanOrEqual(4);
    }
    expect(parcours.s2.aufgaben.filter((a) => a.bloecke.length === 4).length).toBeGreaterThanOrEqual(1);
  });
  it('S2: Verb nicht an zweiter Stelle oder fehlendes Original scheitert im Schema', () => {
    const d = structuredClone(lese('parcours/s2-satz-baukasten.json'));
    d.aufgaben[0].erlaubte_reihenfolgen.push([1, 0, 2]);
    expect(S2DatenSchema.safeParse(d).success).toBe(false);
    const e = structuredClone(lese('parcours/s2-satz-baukasten.json'));
    e.aufgaben[0].erlaubte_reihenfolgen = [[2, 1, 0]];
    expect(S2DatenSchema.safeParse(e).success).toBe(false);
  });
  it('S3: jede Aufgabe hat genau einen passenden Bauplan, Raster höchstens 3×3 mit Höhen 0–3', () => {
    for (const a of [parcours.s3.musterbeispiel, ...parcours.s3.aufgaben]) {
      const passend = a.plaene.filter((p) => JSON.stringify(p.raster) === JSON.stringify(a.gebaeude));
      expect(passend).toHaveLength(1);
      expect(passend[0]!.id).toBe(a.richtig);
      expect(new Set(a.plaene.map((p) => JSON.stringify(p.raster))).size).toBe(3);
      for (const r of [a.gebaeude, ...a.plaene.map((p) => p.raster)]) {
        expect(r.length).toBeLessThanOrEqual(3);
        for (const zeile of r) {
          expect(zeile.length).toBeLessThanOrEqual(3);
          for (const h of zeile) expect(h >= 0 && h <= 3).toBe(true);
        }
      }
    }
  });
  it('S3: zwei passende Baupläne scheitern im Schema', () => {
    const d = structuredClone(lese('parcours/s3-wuerfel-baumeister.json'));
    d.aufgaben[0].plaene[0].raster = d.aufgaben[0].gebaeude;
    d.aufgaben[0].plaene[1].raster = d.aufgaben[0].gebaeude;
    expect(S3DatenSchema.safeParse(d).success).toBe(false);
  });
  it('Parcours-Ereignisse werden per zod validiert', () => {
    const basis = { id: 'x', sitzung: 's', teilnehmer_alias: 'Fuchs-27', modul: 'parcours', typ: 'ziel_gesetzt', zeitstempel: '2027-03-15T08:00:00.000Z', client_seq: 0 };
    expect(() => parseEvent({ ...basis, payload: { station: 's1', ziel: 3 } })).not.toThrow();
    expect(() => parseEvent({ ...basis, payload: { station: 's1', ziel: 6 } })).toThrow();
    expect(() => parseEvent({ ...basis, payload: { station: 's9', ziel: 3 } })).toThrow();
  });
});

// ---------------------------------------------------------------------------
describe('Richtigkeitsprüfung', () => {
  it('S1: Buchstabe und Begründung müssen stimmen', () => {
    const a = parcours.s1.aufgaben[0]!; // Hund, verlängern
    expect(pruefeS1(a, { buchstabe: 'd', grund: 'verlaengern' }).korrekt).toBe(true);
    expect(pruefeS1(a, { buchstabe: 'd', grund: 'ableiten' })).toEqual({ korrekt: false, buchstabe_ok: true, grund_ok: false });
    expect(pruefeS1(a, { buchstabe: 't', grund: 'verlaengern' })).toEqual({ korrekt: false, buchstabe_ok: false, grund_ok: true });
  });
  it('S2: nur erlaubte Reihenfolge mit anderem ersten Block ist richtig', () => {
    const a = parcours.s2.aufgaben[0]!; // der Hund | bellt | im Garten
    expect(pruefeS2(a, [2, 1, 0])).toEqual({ korrekt: true, grammatisch: true, anderer_anfang: true });
    expect(pruefeS2(a, [0, 1, 2])).toEqual({ korrekt: false, grammatisch: true, anderer_anfang: false });
    expect(pruefeS2(a, [1, 0, 2]).korrekt).toBe(false);
    expect(pruefeS2(a, [2, 1]).korrekt).toBe(false);
    const lena = parcours.s2.aufgaben[1]!;
    expect(pruefeS2(lena, [2, 1, 0, 3]).korrekt).toBe(true);
    expect(pruefeS2(lena, [3, 1, 0, 2]).korrekt).toBe(true);
    expect(pruefeS2(lena, [0, 1, 3, 2]).korrekt).toBe(false);
    expect(pruefeS2(lena, [2, 1, 3, 0]).grammatisch).toBe(false);
  });
  it('S2: Satzanzeige schreibt nur den Satzanfang groß, Eigennamen bleiben groß, Punkt am Ende', () => {
    const lena = parcours.s2.aufgaben[1]!;
    const t = lena.bloecke.map((b) => b.text);
    expect(satzText(t, [2, 1, 0, 3])).toBe('Ihrer Oma schenkt Lena eine Blume.');
    expect(satzText(t, [0, 1, 2, 3])).toBe('Lena schenkt ihrer Oma eine Blume.');
    const hund = parcours.s2.aufgaben[0]!.bloecke.map((b) => b.text);
    expect(satzText(hund, [2, 1, 0])).toBe('Im Garten bellt der Hund.');
  });
  it('S3: gewählter Bauplan', () => {
    const a = parcours.s3.aufgaben[0]!;
    expect(pruefeS3(a, a.richtig)).toBe(true);
    expect(pruefeS3(a, a.richtig === 'a' ? 'b' : 'a')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tablet: simuliert ein Kind durch die ganze Hauptstunde
// ---------------------------------------------------------------------------
const START = Date.parse('2027-03-15T08:00:00.000Z');

interface Verhalten {
  beispiel: boolean;
  hinweis: boolean;
  begruendung: boolean;
  geholfen: Strategie[];
  /** Aufgabennummern (1..5), bei denen der erste Versuch falsch ist. */
  fehlerBeiErstem: number[];
  /** Ist der zweite Versuch richtig? (Richtigkeit, kein Verhalten) */
  zweiteRichtig: boolean;
  /** Richtigkeit der Erstversuche, die nicht in `fehlerBeiErstem` stehen. */
  ersteRichtig: boolean;
}
const VERHALTEN: Verhalten = { beispiel: true, hinweis: true, begruendung: true, geholfen: ['beispiele'], fehlerBeiErstem: [2], zweiteRichtig: true, ersteRichtig: true };

class Tablet {
  ereignisse: EventEnvelope[] = [];
  seq = 0;
  zeit = START;
  constructor(
    public freigabe: PhaseStunde,
    public v: Verhalten = VERHALTEN,
    public alias = 'Fuchs-27',
  ) {}
  senden(modul: EventEnvelope['modul'], typ: string, payload: Record<string, unknown>, dtMs = 1000) {
    this.zeit += dtMs;
    this.ereignisse.push(
      parseEvent({ id: `e${this.ereignisse.length}`, sitzung: 'haupt', teilnehmer_alias: this.alias, modul, typ, zeitstempel: new Date(this.zeit).toISOString(), client_seq: this.seq++, payload }),
    );
  }
  schritt(): StundeSchritt {
    return naechsterSchrittStunde({ sitzung: 'haupt', freigabe: this.freigabe, daten: ld, parcours, rotation: 'ROT2', seed: 1234, ereignisse: this.ereignisse });
  }
  tun(s: StundeSchritt): boolean {
    const takt = ld.ablauf.darbietung_ms + ld.ablauf.leer_ms;
    switch (s.art) {
      case 'ueberzeugung':
        this.senden('lerndetektive', 'ueberzeugung_beantwortet', { item_id: s.item_id, antwort: 'weiss_nicht', zeitpunkt: s.zeitpunkt, rt_ms: 800 });
        return true;
      case 'vorliebe':
        this.senden('lerndetektive', 'vorliebe_beantwortet', { item_id: s.item_id, antwort: 'bild_wort', rt_ms: 700 });
        return true;
      case 'lernen':
        this.senden('lerndetektive', 'item_gezeigt', { ...s.eintrag, audio_ok: true }, takt);
        return true;
      case 'pause_aufgabe':
        this.senden('lerndetektive', 'phase_abgeschlossen', { phase: 'pause', abgebrochen: false }, ld.ablauf.pause_aufgabe_ms);
        return true;
      case 'test':
        this.senden('lerndetektive', 'antwort_abgegeben', { item_id: s.eintrag.item_id, test: s.test, alt: s.eintrag.alt, antwort: s.eintrag.alt ? 'dabei' : 'nicht_dabei', rt_ms: 900, position: s.eintrag.position });
        return true;
      case 'abschliessen':
        this.senden('lerndetektive', 'phase_abgeschlossen', { phase: s.phase, abgebrochen: s.abgebrochen });
        return true;
      case 'parcours': {
        const st = s.schritt;
        const station = s.station;
        switch (st.art) {
          case 'planen_ziel':
            this.senden('parcours', 'ziel_gesetzt', { station, ziel: 3 });
            return true;
          case 'planen_sicherheit':
            this.senden('parcours', 'sicherheit_vorher', { station, smiley: 2 });
            return true;
          case 'aufgabe': {
            const ref = { station, aufgabe_id: st.aufgabe_id };
            if (st.zeigen) this.senden('parcours', 'aufgabe_gezeigt', ref);
            else if (this.v.beispiel && st.nummer === 1 && !st.beispiel_geoeffnet) this.senden('parcours', 'beispiel_geoeffnet', ref);
            else if (this.v.hinweis && st.nummer === 2 && st.hinweis_stufe === 0) this.senden('parcours', 'hinweis_genutzt', { ...ref, stufe: 1 });
            else {
              const korrekt = st.versuch === 2 ? this.v.zweiteRichtig : this.v.fehlerBeiErstem.includes(st.nummer) ? false : this.v.ersteRichtig;
              const extra = station === 's1' && this.v.begruendung ? { begruendung: 'verlaengern' } : {};
              this.senden('parcours', 'antwort_abgegeben', { ...ref, korrekt, versuch: st.versuch, rt_ms: 2000, ...extra });
            }
            return true;
          }
          case 'pruefen':
            this.senden('parcours', 'hilfreich_gewaehlt', { station, strategien: this.v.geholfen });
            return true;
        }
        return false;
      }
      case 'profil_zeigen': {
        const p = berechneProfil(this.ereignisse, karten);
        this.senden('profil', 'profil_angezeigt', { karten_ids: p.karten_ids, superkraft: p.superkraft });
        return true;
      }
      case 'profil_passt':
        this.senden('profil', 'profil_passt', { smiley: 3 });
        return true;
      default:
        return false;
    }
  }
  laufen(max = 800): StundeSchritt['art'][] {
    const arten: StundeSchritt['art'][] = [];
    for (let i = 0; i < max; i++) {
      const s = this.schritt();
      arten.push(s.art);
      if (!this.tun(s)) return arten;
    }
    throw new Error('Ablauf endet nicht');
  }
  /** Gesamte Hauptstunde: alle Phasen nacheinander freigeben. */
  ganzeStunde(): void {
    for (const p of PHASEN_STUNDE) {
      this.freigabe = p;
      this.laufen();
    }
  }
}

/** Tablet, das nach dem Experiment alle Stationen spielt. */
function profilFuer(v: Verhalten): { tablet: Tablet; profil: ReturnType<typeof berechneProfil> } {
  const t = new Tablet('ergebnis', v);
  t.ganzeStunde();
  return { tablet: t, profil: berechneProfil(t.ereignisse, karten) };
}

describe('Station: Ablauf', () => {
  const ids = parcours.s1.aufgaben.map((a) => a.id);
  const kontext = (ereignisse: EventEnvelope[]) => ({ station: 's1' as Station, aufgaben: ids, ereignisse });
  let n = 0;
  const ev = (typ: string, payload: Record<string, unknown>): EventEnvelope =>
    parseEvent({ id: `x${n}`, sitzung: 'haupt', teilnehmer_alias: 'Fuchs-27', modul: 'parcours', typ, zeitstempel: new Date(START + 1000 * n).toISOString(), client_seq: n++, payload });

  it('Planen vor Üben: erst Ziel, dann Zuversicht, dann Aufgabe 1', () => {
    const e: EventEnvelope[] = [];
    expect(stationSchritt(kontext(e)).art).toBe('planen_ziel');
    e.push(ev('ziel_gesetzt', { station: 's1', ziel: 4 }));
    expect(stationSchritt(kontext(e)).art).toBe('planen_sicherheit');
    e.push(ev('sicherheit_vorher', { station: 's1', smiley: 3 }));
    expect(stationSchritt(kontext(e))).toMatchObject({ art: 'aufgabe', aufgabe_id: ids[0], nummer: 1, versuch: 1, nach_fehler: false, zeigen: true });
  });
  it('nach einem Fehler folgt der zweite Versuch, danach geht es weiter (egal ob richtig)', () => {
    const e = [ev('ziel_gesetzt', { station: 's1', ziel: 4 }), ev('sicherheit_vorher', { station: 's1', smiley: 3 }), ev('aufgabe_gezeigt', { station: 's1', aufgabe_id: ids[0] })];
    e.push(ev('hinweis_genutzt', { station: 's1', aufgabe_id: ids[0], stufe: 1 }), ev('beispiel_geoeffnet', { station: 's1', aufgabe_id: ids[0] }));
    e.push(ev('antwort_abgegeben', { station: 's1', aufgabe_id: ids[0], korrekt: false, versuch: 1, rt_ms: 10 }));
    expect(stationSchritt(kontext(e))).toMatchObject({ aufgabe_id: ids[0], versuch: 2, nach_fehler: true, hinweis_stufe: 1, beispiel_geoeffnet: true, zeigen: false });
    e.push(ev('antwort_abgegeben', { station: 's1', aufgabe_id: ids[0], korrekt: false, versuch: 2, rt_ms: 10 }));
    expect(stationSchritt(kontext(e))).toMatchObject({ aufgabe_id: ids[1], versuch: 1, nummer: 2 });
  });
  it('Überspringen und richtige Antwort beenden eine Aufgabe', () => {
    const e = [ev('ziel_gesetzt', { station: 's1', ziel: 2 }), ev('sicherheit_vorher', { station: 's1', smiley: 1 })];
    e.push(ev('antwort_abgegeben', { station: 's1', aufgabe_id: ids[0], korrekt: true, versuch: 1, rt_ms: 10 }));
    e.push(ev('aufgabe_uebersprungen', { station: 's1', aufgabe_id: ids[1] }));
    expect(stationSchritt(kontext(e))).toMatchObject({ aufgabe_id: ids[2] });
  });
  it('Prüfen: Ziel gegen eigenes Ergebnis, dann „Was hat geholfen?“, dann fertig', () => {
    const e = [ev('ziel_gesetzt', { station: 's1', ziel: 3 }), ev('sicherheit_vorher', { station: 's1', smiley: 4 })];
    ids.forEach((id, i) => {
      e.push(ev('antwort_abgegeben', { station: 's1', aufgabe_id: id, korrekt: i < 3, versuch: 1, rt_ms: 5 }));
      if (i >= 3) e.push(ev('antwort_abgegeben', { station: 's1', aufgabe_id: id, korrekt: false, versuch: 2, rt_ms: 5 }));
    });
    expect(stationSchritt(kontext(e))).toEqual({ art: 'pruefen', ziel: 3, geschafft: 3, anzahl: 5, ziel_erreicht: true });
    e.push(ev('hilfreich_gewaehlt', { station: 's1', strategien: ['beispiele'] }));
    expect(stationSchritt(kontext(e)).art).toBe('fertig');
  });
  it('Ereignisse anderer Stationen stören nicht', () => {
    const e = [ev('ziel_gesetzt', { station: 's2', ziel: 3 })];
    expect(stationSchritt(kontext(e)).art).toBe('planen_ziel');
  });
});

describe('Hauptstunde: Parcours und Profil', () => {
  it('Phasen: Lerndetektive-Phasen plus parcours und profil', () => {
    expect(PHASEN_STUNDE).toEqual([...PHASEN_HAUPT, 'parcours', 'profil']);
  });
  it('bis „ergebnis“ liefert die Hülle genau den Schritt der Lerndetektive', () => {
    const t = new Tablet('ueberzeugung_vorher');
    for (const p of PHASEN_HAUPT) {
      t.freigabe = p;
      for (let i = 0; i < 400; i++) {
        const mein = t.schritt();
        const alt = naechsterSchritt({ stunde: 'haupt', sitzung: 'haupt', freigabe: p, daten: ld, rotation: 'ROT2', seed: 1234, ereignisse: t.ereignisse } as AblaufKontext);
        expect(mein).toEqual(alt);
        if (!t.tun(mein)) break;
      }
    }
  });
  it('Durchlauf: Lerndetektive → S1 → S2 → S3 → Profil → Fertig, ohne weiteren Knopf', () => {
    const t = new Tablet('ueberzeugung_vorher');
    const alle: string[] = [];
    for (const p of PHASEN_STUNDE) {
      t.freigabe = p;
      const arten = t.laufen();
      alle.push(...arten);
      if (p === 'ergebnis') expect(arten.at(-1)).toBe('klassenergebnis');
      if (p === 'parcours') expect(arten.at(-1)).toBe('warten');
    }
    expect(alle.at(-1)).toBe('fertig');
    // Stationen nacheinander
    const stationen = t.ereignisse.filter((e) => e.typ === 'ziel_gesetzt').map((e) => e.payload['station']);
    expect(stationen).toEqual(['s1', 's2', 's3']);
    const haupt = t.ereignisse.filter((e) => e.modul === 'parcours' && e.typ === 'antwort_abgegeben');
    expect(haupt.length).toBe(15 + 3); // je Station 5 Aufgaben + ein zweiter Versuch (Aufgabe 2)
    // Profil: ≤ 3 Karten, höchstens eine je Station, alle IDs aus den Daten, Superkraft gültig
    const angezeigt = t.ereignisse.find((e) => e.typ === 'profil_angezeigt')!;
    const ids = angezeigt.payload['karten_ids'] as string[];
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.length).toBeLessThanOrEqual(3);
    const bekannt = new Set([...karten.karten.map((k) => k.id), 'fallback']);
    for (const id of ids) expect(bekannt.has(id)).toBe(true);
    const stationen2 = ids.map((id) => id.split('.')[1]);
    expect(new Set(stationen2).size).toBe(stationen2.length);
    expect(STRATEGIEN).toContain(angezeigt.payload['superkraft']);
    expect(t.ereignisse.some((e) => e.typ === 'profil_passt')).toBe(true);
    // nach „fertig“ bleibt es bei „fertig“
    expect(t.schritt().art).toBe('fertig');
  });
  it('Pause gilt auch im Parcours', () => {
    const t = new Tablet('ergebnis');
    t.laufen();
    t.freigabe = 'parcours';
    t.senden('start', 'pause', { aktiv: true });
    expect(t.schritt().art).toBe('pausiert');
    t.senden('start', 'pause', { aktiv: false });
    expect(t.schritt().art).toBe('parcours');
  });
  it('wiederaufnehmen auf anderem Tablet: gleiche Ereignisse, gleicher Schritt', () => {
    const t = new Tablet('parcours');
    for (let i = 0; i < 12; i++) t.tun(t.schritt());
    const neu = new Tablet('parcours');
    neu.ereignisse = [...t.ereignisse];
    expect(neu.schritt()).toEqual(t.schritt());
  });
  it('Lehrkraft geht ins Profil, Kind hat den Parcours nicht gemacht: Profil kommt trotzdem', () => {
    const t = new Tablet('ergebnis');
    t.laufen();
    t.freigabe = 'profil';
    expect(t.schritt().art).toBe('profil_zeigen');
  });
});

// ---------------------------------------------------------------------------
describe('Profil', () => {
  it('Regelversion ist gesetzt', () => {
    expect(berechneProfil([], karten).regelversion).toBe(REGELVERSION);
  });
  it('gleiches Verhalten, andere Richtigkeit des zweiten Versuchs → identische Karten und Superkraft', () => {
    const a = profilFuer({ ...VERHALTEN, zweiteRichtig: true }).profil;
    const b = profilFuer({ ...VERHALTEN, zweiteRichtig: false }).profil;
    expect(b).toEqual(a);
  });
  it('alle `korrekt`-Werte umgedreht → identisches Profil', () => {
    const { tablet, profil } = profilFuer({ ...VERHALTEN, fehlerBeiErstem: [1, 3] });
    const gekippt = tablet.ereignisse.map((e) => (e.modul === 'parcours' && e.typ === 'antwort_abgegeben' ? { ...e, payload: { ...e.payload, korrekt: !e.payload['korrekt'] } } : e));
    expect(berechneProfil(gekippt, karten)).toEqual(profil);
    expect(indikatoren(gekippt)).toEqual(indikatoren(tablet.ereignisse));
  });
  it('Sicherheit (Smiley) und Ziel-Abstand ändern das Profil nicht', () => {
    const { tablet, profil } = profilFuer(VERHALTEN);
    const anders = tablet.ereignisse.map((e) =>
      e.typ === 'sicherheit_vorher' ? { ...e, payload: { ...e.payload, smiley: 4 } } : e.typ === 'ziel_gesetzt' ? { ...e, payload: { ...e.payload, ziel: 5 } } : e,
    );
    expect(berechneProfil(anders, karten)).toEqual(profil);
  });
  it('anderes Verhalten → andere Karten (Verhalten zählt)', () => {
    const mit = profilFuer(VERHALTEN).profil;
    const ohne = profilFuer({ ...VERHALTEN, fehlerBeiErstem: [], beispiel: false, hinweis: false, begruendung: false, geholfen: [] }).profil;
    expect(ohne.karten_ids).not.toEqual(mit.karten_ids);
    expect(mit.karten_ids.some((id) => id.startsWith('zweiter_versuch.'))).toBe(true);
  });
  it('höchstens drei Karten, höchstens eine je Station, Prioritätsreihenfolge', () => {
    const { tablet, profil } = profilFuer({ ...VERHALTEN, fehlerBeiErstem: [1, 2, 3, 4, 5] });
    expect(profil.karten_ids).toHaveLength(3);
    expect(new Set(profil.karten_ids.map((id) => id.split('.')[1])).size).toBe(3);
    // Jede Station hat zweiter_versuch: höchste Priorität zuerst, dann je Station eine andere Karte.
    expect(profil.karten_ids[0]).toBe('zweiter_versuch.s1');
    expect(indikatoren(tablet.ereignisse).zweiter_versuch).toEqual({ s1: true, s2: true, s3: true, lerndetektive: false });
  });
  it('abgebrochene Sitzung: nur Überzeugungen beantwortet → allgemeine ermutigende Karte', () => {
    const t = new Tablet('ueberzeugung_vorher');
    t.tun(t.schritt());
    t.tun(t.schritt());
    const p = berechneProfil(t.ereignisse, karten);
    expect(p.fallback).toBe(true);
    expect(p.karten_ids).toEqual(['fallback']);
    expect(profilAnzeige(p, karten).karten[0]!.text).toBe(karten.fallback.text);
    expect(berechneProfil([], karten).fallback).toBe(true);
  });
  it('abgebrochene Lernphase zählt nicht als Teilnahme', () => {
    const t = new Tablet('lernen');
    for (let i = 0; i < 10; i++) t.tun(t.schritt());
    t.senden('lerndetektive', 'phase_abgeschlossen', { phase: 'lernen', abgebrochen: true });
    expect(indikatoren(t.ereignisse).teilnahme.lerndetektive).toBe(false);
  });
  it('Superkraft: Tie-Break deterministisch; geringste Evidenz gewinnt', () => {
    const gleich = Object.fromEntries(STRATEGIEN.map((s) => [s, 2])) as Record<Strategie, number>;
    expect(waehleSuperkraft(gleich)).toBe(SUPERKRAFT_REIHENFOLGE[0]);
    for (const s of STRATEGIEN) {
      const ev = { ...gleich, [s]: 0 };
      expect(waehleSuperkraft(ev)).toBe(s);
    }
    // zwei gleich wenige: die frühere in der Reihenfolge
    const zwei = { ...gleich, beispiele: 0, mischen: 0 };
    expect(waehleSuperkraft(zwei)).toBe('beispiele');
    expect(SUPERKRAFT_REIHENFOLGE).toHaveLength(6);
    expect(new Set(SUPERKRAFT_REIHENFOLGE).size).toBe(6);
  });
  it('Evidenz hängt vom Verhalten ab, nicht von der Reihenfolge der Ereignisse', () => {
    const { tablet } = profilFuer(VERHALTEN);
    const rueckwaerts = [...tablet.ereignisse].reverse();
    expect(evidenz(rueckwaerts)).toEqual(evidenz(tablet.ereignisse));
    expect(berechneProfil(rueckwaerts, karten)).toEqual(berechneProfil(tablet.ereignisse, karten));
    expect(berechneProfil(tablet.ereignisse, karten)).toEqual(berechneProfil(tablet.ereignisse, karten));
  });
  it('Beispiele geöffnet → Beispiele ist nicht die Superkraft', () => {
    const { profil } = profilFuer({ ...VERHALTEN, geholfen: [] });
    expect(profil.superkraft).not.toBe('beispiele');
  });
  it('Karten-Prioritätsliste deckt alle Verhaltensweisen ab', () => {
    expect(new Set(PRIORITAET).size).toBe(7);
    for (const k of karten.karten) expect(PRIORITAET).toContain(k.verhalten);
  });
});

// ---------------------------------------------------------------------------
describe('Sprachregeln (01 §7.4)', () => {
  const VERBOTEN: [string, RegExp][] = [
    ['Typ', /\bTyp|Lerntyp|-Typ\b/i],
    ['Prozent', /%|Prozent/i],
    ['Punkte', /\bPunkt/i],
    ['Note', /\bNote\b|\bNoten\b/],
    ['Niveau', /Niveau/i],
    ['besser als', /besser als/i],
    ['schlechter als', /schlechter als/i],
    ['die Klasse', /die Klasse/i],
    ['du bist ein', /\bdu bist (ein|eine)\b/i],
    ['Ranking', /Rang(liste|folge)|\bPlatz\b/i],
  ];
  const pruefen = (label: string, t: string) => {
    for (const [name, re] of VERBOTEN) expect(re.test(t), `„${name}“ in ${label}: ${t}`).toBe(false);
  };

  const profilTexte: [string, string][] = [
    ...karten.karten.map((k): [string, string] => [`Karte ${k.id}`, k.text]),
    ['Fallback', karten.fallback.text],
    ...STRATEGIEN.flatMap((s): [string, string][] => [[`Superkraft ${s}`, karten.superkraft[s]], [`Tipp ${s}`, karten.tipps[s]]]),
    ...Object.entries(karten.indikatoren).map(([k, t]): [string, string] => [`Indikator ${k}`, t]),
  ];
  const parcoursTexte: [string, string][] = Object.entries(texte).filter(([k]) => /^(parcours|profil|strategie)\./.test(k)).map(([k, t]) => [`de.json ${k}`, t]);
  const aufgabenTexte: [string, string][] = [];
  for (const s of STATIONEN) {
    for (const a of [parcours[s].musterbeispiel, ...parcours[s].aufgaben]) {
      const o = a as Record<string, unknown>;
      for (const f of ['erklaerung', 'hinweis1', 'hinweis2', 'fehler']) if (typeof o[f] === 'string') aufgabenTexte.push([`${s} ${f}`, o[f] as string]);
    }
  }

  it('Profil-Textbausteine enthalten keine verbotenen Muster', () => {
    expect(profilTexte.length).toBeGreaterThan(30);
    for (const [l, t] of profilTexte) pruefen(l, t);
  });
  it('Parcours-Texte (de.json) und Aufgabentexte enthalten keine verbotenen Muster', () => {
    expect(parcoursTexte.length).toBeGreaterThan(30);
    for (const [l, t] of [...parcoursTexte, ...aufgabenTexte]) pruefen(l, t);
  });
  it('Profilkarten, Superkraft- und Tipp-Texte enthalten keine Ziffern', () => {
    for (const [l, t] of profilTexte) expect(/\d/.test(t), `Ziffer in ${l}: ${t}`).toBe(false);
    for (const [k, t] of Object.entries(texte)) if (k.startsWith('profil.')) expect(/\d/.test(t), `Ziffer in ${k}`).toBe(false);
  });
  it('Karten stehen in der Vergangenheit und nennen die Station', () => {
    const namen: Record<string, string> = { s1: texte['parcours.station.s1.titel']!, s2: texte['parcours.station.s2.titel']!, s3: texte['parcours.station.s3.titel']!, lerndetektive: 'Lerndetektiven' };
    for (const k of karten.karten) {
      expect(k.text, k.id).toMatch(/\bhast\b/);
      expect(k.text, k.id).not.toMatch(/\b(bist|machst|setzt|schaffst)\b/);
      expect(k.text, k.id).toContain(namen[k.station]!);
    }
  });
  it('erzeugte Beispielprofile verletzen keine Regel', () => {
    const varianten: Verhalten[] = [
      VERHALTEN,
      { ...VERHALTEN, fehlerBeiErstem: [1, 2, 3, 4, 5], geholfen: ['mischen', 'warum_fragen'] },
      { ...VERHALTEN, beispiel: false, hinweis: false, begruendung: false, fehlerBeiErstem: [], geholfen: [] },
    ];
    for (const v of varianten) {
      const { profil } = profilFuer(v);
      const a = profilAnzeige(profil, karten);
      for (const k of a.karten) {
        pruefen(k.id, k.text);
        expect(/\d/.test(k.text)).toBe(false);
      }
      pruefen('Superkraft', a.superkraft.text);
      pruefen('Tipp', a.tipp);
    }
    expect(profilAnzeige(berechneProfil([], karten), karten).karten).toHaveLength(1);
  });
  it('die Prüfmuster erkennen Verstöße (Selbsttest)', () => {
    const schlecht = ['Du bist ein Bildtyp', 'Du hast 80 % geschafft', 'Du hast 5 Punkte', 'Note 1', 'besser als die anderen', 'Niveau G', 'Du bist ein Profi'];
    for (const s of schlecht) expect(VERBOTEN.some(([, re]) => re.test(s)), s).toBe(true);
  });
});
