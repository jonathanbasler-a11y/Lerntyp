import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BEDINGUNGEN,
  LerndetektiveDatenSchema,
  ROTATIONEN,
  berechneKennwerte,
  klassenErgebnis,
  lernSequenz,
  lernenUnterbrochen,
  mischeMitFolgeGrenze,
  naechsterSchritt,
  normalQuantil,
  parseEvent,
  rotationFuerBeitritt,
  teilnahme,
  testSequenz,
  vergleichSofortVerzoegert,
  vorliebeGruppe,
  erzeugeZufall,
  type AblaufKontext,
  type Bedingung,
  type EventEnvelope,
  type KindTestwert,
  type LerndetektiveDaten,
  type Schritt,
  type TestAntwort,
  type TestEintrag,
} from '../src';

const roh = JSON.parse(readFileSync(join(__dirname, '../../../data/lerndetektive/experiment.json'), 'utf8'));
const daten: LerndetektiveDaten = LerndetektiveDatenSchema.parse(roh);
const N_ALT = 36;
const N_PUFFER = daten.ablauf.puffer_anfang + daten.ablauf.puffer_ende;

/** Längste Folge gleicher Werte. */
function laengsteFolge<T>(xs: readonly T[]): number {
  let max = 0;
  let lauf = 0;
  xs.forEach((x, i) => {
    lauf = i > 0 && xs[i - 1] === x ? lauf + 1 : 1;
    max = Math.max(max, lauf);
  });
  return max;
}

const kopie = () => structuredClone(roh);

// ---------------------------------------------------------------------------
describe('Inhaltsdatei', () => {
  it('die echte Datei ist gültig', () => {
    expect(daten.items).toHaveLength(120);
  });
  it('ein verletztes Lateinisches Quadrat scheitert', () => {
    const d = kopie();
    d.rotationen.ROT2 = { A: 'wort', B: 'bild_wort', C: 'bild' }; // A bekommt in ROT1 und ROT2 „wort“
    expect(LerndetektiveDatenSchema.safeParse(d).success).toBe(false);
  });
  it('eine Rotation mit doppelter Bedingung scheitert', () => {
    const d = kopie();
    d.rotationen.ROT1 = { A: 'wort', B: 'wort', C: 'bild_wort' };
    expect(LerndetektiveDatenSchema.safeParse(d).success).toBe(false);
  });
  it('zu wenige Ablenker scheitern (D muss so groß sein wie A+B+C)', () => {
    const d = kopie();
    d.items = d.items.filter((it: { set: string }, i: number) => !(it.set === 'D' && i % 2 === 0));
    expect(LerndetektiveDatenSchema.safeParse(d).success).toBe(false);
  });
  it('Mindestgruppe unter 5 scheitert', () => {
    const d = kopie();
    d.ablauf.mindestgruppe = 4;
    expect(LerndetektiveDatenSchema.safeParse(d).success).toBe(false);
  });
  it('doppelte Wörter scheitern (auch bei anderer Schreibweise)', () => {
    const d = kopie();
    d.items[1].wort = d.items[0].wort.toUpperCase();
    expect(LerndetektiveDatenSchema.safeParse(d).success).toBe(false);
  });
  it('nur V4 darf die Vermutung sein', () => {
    const d = kopie();
    d.vorlieben[0].rolle = 'vermutung';
    expect(LerndetektiveDatenSchema.safeParse(d).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe('Rotation beim Beitritt', () => {
  it('verteilt fortlaufend und gleichmäßig', () => {
    const r = Array.from({ length: 30 }, (_, i) => rotationFuerBeitritt(i));
    expect(r.slice(0, 4)).toEqual(['ROT1', 'ROT2', 'ROT3', 'ROT1']);
    for (const rot of ROTATIONEN) expect(r.filter((x) => x === rot)).toHaveLength(10);
  });
  it('lehnt ungültige Nummern ab', () => {
    expect(() => rotationFuerBeitritt(-1)).toThrow();
    expect(() => rotationFuerBeitritt(1.5)).toThrow();
  });
  it('über eine Klasse bekommt jedes Lern-Item jede Bedingung gleich oft', () => {
    const zaehl = new Map<string, Record<Bedingung, number>>();
    for (let kind = 0; kind < 30; kind++) {
      for (const e of lernSequenz(daten, rotationFuerBeitritt(kind), kind)) {
        if (e.bedingung === 'puffer') continue;
        const z = zaehl.get(e.item_id) ?? { wort: 0, bild: 0, bild_wort: 0 };
        z[e.bedingung]++;
        zaehl.set(e.item_id, z);
      }
    }
    expect(zaehl.size).toBe(N_ALT);
    for (const z of zaehl.values()) expect(z).toEqual({ wort: 10, bild: 10, bild_wort: 10 });
  });
});

// ---------------------------------------------------------------------------
describe('mischeMitFolgeGrenze', () => {
  it('hält die Grenze ein und verbraucht alle Kategorien', () => {
    for (let s = 0; s < 300; s++) {
      const f = mischeMitFolgeGrenze({ a: 12, b: 12, c: 12 }, 2, erzeugeZufall(s));
      expect(f).toHaveLength(36);
      expect(laengsteFolge(f)).toBeLessThanOrEqual(2);
      expect(f.filter((x) => x === 'a')).toHaveLength(12);
    }
  });
  it('meldet unmögliche Vorgaben', () => {
    expect(() => mischeMitFolgeGrenze({ a: 5, b: 0 }, 2, erzeugeZufall(1))).toThrow();
  });
});

// ---------------------------------------------------------------------------
describe('Lernsequenz (02 §5.3)', () => {
  const SEEDS = 400;

  it('Aufbau: Puffer außen, alle Lern-Items genau einmal, Bedingung aus der Rotation', () => {
    for (const rot of ROTATIONEN) {
      for (let s = 0; s < SEEDS; s++) {
        const seq = lernSequenz(daten, rot, s);
        expect(seq).toHaveLength(N_ALT + N_PUFFER);
        expect(seq.map((e) => e.position)).toEqual(seq.map((_, i) => i));
        const anfang = seq.slice(0, daten.ablauf.puffer_anfang);
        const ende = seq.slice(seq.length - daten.ablauf.puffer_ende);
        for (const e of [...anfang, ...ende]) {
          expect(e.bedingung).toBe('puffer');
          expect(e.set).toBe('F');
        }
        const kern = seq.slice(daten.ablauf.puffer_anfang, seq.length - daten.ablauf.puffer_ende);
        expect(kern.every((e) => e.bedingung !== 'puffer')).toBe(true);
        expect(new Set(seq.map((e) => e.item_id)).size).toBe(seq.length);
        for (const e of kern) expect(e.bedingung).toBe(daten.rotationen[rot][e.set as 'A' | 'B' | 'C']);
        expect(laengsteFolge(kern.map((e) => e.bedingung))).toBeLessThanOrEqual(daten.ablauf.max_gleiche_bedingung_folge);
      }
    }
  });

  it('ist reproduzierbar und unterscheidet sich zwischen Seeds', () => {
    expect(lernSequenz(daten, 'ROT2', 42)).toEqual(lernSequenz(daten, 'ROT2', 42));
    const a = lernSequenz(daten, 'ROT2', 42).map((e) => e.item_id).join();
    const b = lernSequenz(daten, 'ROT2', 43).map((e) => e.item_id).join();
    expect(a).not.toBe(b);
  });

  it('keine Positionsverzerrung: jede Bedingung steht an jeder Position etwa gleich oft', () => {
    const n = 6000;
    const kernLaenge = N_ALT;
    const zaehl = Array.from({ length: kernLaenge }, () => ({ wort: 0, bild: 0, bild_wort: 0 }));
    for (let s = 0; s < n; s++) {
      const kern = lernSequenz(daten, ROTATIONEN[s % 3]!, s + 100000).slice(daten.ablauf.puffer_anfang, -daten.ablauf.puffer_ende);
      kern.forEach((e, i) => zaehl[i]![e.bedingung as Bedingung]++);
    }
    // Erwartet 1/3 je Bedingung und Position; Toleranz ±0,04 (≈ 6 Standardfehler bei n = 6000).
    for (const z of zaehl) for (const b of BEDINGUNGEN) expect(Math.abs(z[b] / n - 1 / 3)).toBeLessThan(0.04);
  });

  it('jedes Item steht über viele Kinder an vielen verschiedenen Positionen', () => {
    const positionen = new Map<string, Set<number>>();
    for (let s = 0; s < 300; s++)
      for (const e of lernSequenz(daten, 'ROT1', s))
        if (e.bedingung !== 'puffer') (positionen.get(e.item_id) ?? positionen.set(e.item_id, new Set()).get(e.item_id)!).add(e.position);
    for (const p of positionen.values()) expect(p.size).toBeGreaterThan(25);
  });
});

// ---------------------------------------------------------------------------
describe('Testsequenz (02 §6.1)', () => {
  it('Aufbau: 36 alt + 36 neu, Ablenker aus D bzw. E, keine Puffer, Bedingung korrekt', () => {
    for (const rot of ROTATIONEN) {
      for (let s = 0; s < 200; s++) {
        const lern = new Map(lernSequenz(daten, rot, s).map((e) => [e.item_id, e]));
        for (const test of ['sofort', 'verzoegert'] as const) {
          const seq = testSequenz(daten, rot, s, test);
          expect(seq).toHaveLength(72);
          const alt = seq.filter((e) => e.alt);
          const neu = seq.filter((e) => !e.alt);
          expect(alt).toHaveLength(36);
          expect(neu.every((e) => e.set === (test === 'sofort' ? 'D' : 'E') && e.bedingung === null)).toBe(true);
          for (const e of alt) expect(e.bedingung).toBe(lern.get(e.item_id)!.bedingung);
          expect(seq.some((e) => e.set === 'F')).toBe(false);
          expect(laengsteFolge(seq.map((e) => e.alt))).toBeLessThanOrEqual(daten.ablauf.max_gleiche_testart_folge);
        }
      }
    }
  });
  it('verzögerter Test hat eine neue Reihenfolge, beide sind reproduzierbar', () => {
    const s1 = testSequenz(daten, 'ROT3', 7, 'sofort').filter((e) => e.alt).map((e) => e.item_id);
    const s2 = testSequenz(daten, 'ROT3', 7, 'verzoegert').filter((e) => e.alt).map((e) => e.item_id);
    expect(s1).not.toEqual(s2);
    expect(testSequenz(daten, 'ROT3', 7, 'sofort')).toEqual(testSequenz(daten, 'ROT3', 7, 'sofort'));
  });
});

// ---------------------------------------------------------------------------
describe('Kennwerte (02 §6.3)', () => {
  it('normalQuantil stimmt mit Referenzwerten überein', () => {
    const ref: [number, number][] = [
      [1e-6, -4.753424308822899],
      [0.001, -3.090232306167813],
      [0.02425, -1.9729610513118845],
      [0.1, -1.2815515655446008],
      [0.3, -0.5244005127080407],
      [0.5, 0],
      [0.97575, 1.9729610513118847],
      [0.999, 3.090232306167813],
    ];
    for (const [p, z] of ref) expect(normalQuantil(p)).toBeCloseTo(z, 7);
    expect(() => normalQuantil(0)).toThrow();
    expect(() => normalQuantil(1)).toThrow();
  });

  /** Kleine, handgebaute Sequenz: 12 alte Items je Bedingung, 36 neue. */
  function sequenz(): TestEintrag[] {
    const s: TestEintrag[] = [];
    for (const b of BEDINGUNGEN) for (let i = 0; i < 12; i++) s.push({ position: s.length, item_id: `${b}_${i}`, set: 'A', alt: true, bedingung: b });
    for (let i = 0; i < 36; i++) s.push({ position: s.length, item_id: `neu_${i}`, set: 'D', alt: false, bedingung: null });
    return s;
  }
  const antwort = (e: TestEintrag, dabei: boolean, test: 'sofort' | 'verzoegert' = 'sofort'): TestAntwort => ({
    item_id: e.item_id,
    test,
    alt: e.alt,
    antwort: dabei ? 'dabei' : 'nicht_dabei',
    rt_ms: 900,
    position: e.position,
  });

  it('rechnet Treffer, Fehlalarme, korrigierte Quote und d′ korrekt', () => {
    const seq = sequenz();
    const treffer: Record<Bedingung, number> = { wort: 6, bild: 9, bild_wort: 12 };
    const a = seq.map((e) => {
      if (!e.alt) return antwort(e, Number(e.item_id.split('_')[1]) < 6); // 6 von 36 Fehlalarme
      const idx = Number(e.item_id.split('_').pop());
      return antwort(e, idx < treffer[e.bedingung!]);
    });
    const k = berechneKennwerte(seq, a, 'sofort');
    expect(k.vollstaendig).toBe(true);
    expect(k.fehlalarm).toEqual({ n_neu: 36, beantwortet: 36, fehlalarme: 6, quote: 6 / 36 });
    expect(k.bedingungen.bild.trefferquote).toBeCloseTo(9 / 12, 12);
    expect(k.bedingungen.bild.korrigiert).toBeCloseTo(9 / 12 - 6 / 36, 12);
    expect(k.bedingungen.bild.d_prime).toBeCloseTo(1.5471124169391637, 7);
    // 12/12 Treffer bleibt endlich dank Log-linear-Korrektur
    expect(k.bedingungen.bild_wort.d_prime).toBeCloseTo(normalQuantil(12.5 / 13) - normalQuantil(6.5 / 37), 9);
    expect(Number.isFinite(k.bedingungen.bild_wort.d_prime!)).toBe(true);
  });

  it('zählt nur die erste Antwort, ignoriert Fremd-Items und anderen Testzeitpunkt, markiert Unvollständigkeit', () => {
    const seq = sequenz();
    const e0 = seq[0]!;
    const a: TestAntwort[] = [
      antwort(e0, true),
      antwort(e0, false), // Doppelantwort nach Gerätewechsel
      { ...antwort(e0, true), item_id: 'gibt_es_nicht' },
      antwort(seq[1]!, true, 'verzoegert'), // anderer Test
      { ...antwort(seq[2]!, true), alt: false }, // inkonsistentes alt-Flag
    ];
    const k = berechneKennwerte(seq, a, 'sofort');
    expect(k.beantwortet).toBe(2);
    expect(k.ignoriert).toBe(2);
    expect(k.inkonsistent).toBe(1);
    expect(k.vollstaendig).toBe(false);
    expect(k.bedingungen.wort).toMatchObject({ beantwortet: 2, treffer: 2, trefferquote: 1 });
    // ohne beantwortete Ablenker gibt es weder Fehlalarmquote noch korrigierte Quote
    expect(k.fehlalarm.quote).toBeNull();
    expect(k.bedingungen.wort.korrigiert).toBeNull();
    expect(k.bedingungen.bild.trefferquote).toBeNull();
  });

  it('vorliebeGruppe: Mehrheit, Gleichstand, zu wenige Antworten; V4 zählt nicht', () => {
    const m = (o: Record<string, Bedingung>) => new Map(Object.entries(o));
    expect(vorliebeGruppe(m({ V1: 'bild', V2: 'bild', V3: 'wort' }))).toBe('bild');
    expect(vorliebeGruppe(m({ V1: 'bild', V2: 'wort', V3: 'bild_wort' }))).toBe('gemischt');
    expect(vorliebeGruppe(m({ V1: 'bild', V2: 'wort' }))).toBe('gemischt');
    expect(vorliebeGruppe(m({ V1: 'bild', V4: 'bild' }))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe('Klassenergebnis (02 §7.1, 01 §7.5)', () => {
  const kind = (vermutung: Bedingung | null, w: number, b: number, bw: number): KindTestwert => ({
    vermutung,
    korrigiert: { wort: w, bild: b, bild_wort: bw },
  });
  const viele = (n: number, v: Bedingung | null, x = 0.5) => Array.from({ length: n }, () => kind(v, x, x, x));

  it('Alle: Mittelwerte und n, null-Werte werden ausgelassen', () => {
    const k = [kind('bild', 0.2, 0.4, 0.6), kind('wort', 0.4, 0.6, 0.8), { vermutung: null, korrigiert: { wort: null, bild: 0.2, bild_wort: 1 } }];
    const e = klassenErgebnis(k, 5);
    expect(e.alle.n).toBe(3);
    expect(e.alle.mittel.wort).toBeCloseTo(0.3, 12);
    expect(e.alle.mittel.bild).toBeCloseTo(0.4, 12);
    expect(e.alle.mittel.bild_wort).toBeCloseTo(0.8, 12);
  });
  it('zeigt die Aufteilung nur, wenn jede gezeigte Gruppe ≥ 5 ist', () => {
    const e = klassenErgebnis([...viele(8, 'bild_wort'), ...viele(6, 'bild'), ...viele(3, 'wort'), ...viele(2, null)], 5);
    expect(e.nachVermutung!.map((g) => [g.gruppe, g.werte.n])).toEqual([
      ['bild', 6],
      ['bild_wort', 8],
      ['andere', 5],
    ]);
  });
  it('keine Aufteilung, wenn die Restgruppe „andere“ zu klein ist (Rückrechnung verhindern)', () => {
    expect(klassenErgebnis([...viele(10, 'bild_wort'), ...viele(7, 'bild'), ...viele(4, 'wort')], 5).nachVermutung).toBeNull();
  });
  it('keine Aufteilung bei nur einer Gruppe', () => {
    expect(klassenErgebnis(viele(20, 'bild_wort'), 5).nachVermutung).toBeNull();
  });
  it('Mindestgruppe unter 5 wird abgelehnt', () => {
    expect(() => klassenErgebnis([], 4)).toThrow();
  });
  it('Vergleich sofort/verzögert ist gepaart und braucht ≥ 5 Kinder', () => {
    const r = (x: number) => ({ wort: x, bild: x, bild_wort: x });
    const kinder = [...Array.from({ length: 5 }, () => ({ sofort: r(0.8), verzoegert: r(0.6) })), { sofort: r(0), verzoegert: null }];
    const v = vergleichSofortVerzoegert(kinder, 5)!;
    expect(v.n).toBe(5);
    expect(v.sofort.wort).toBeCloseTo(0.8, 12); // das Kind ohne verzögerten Test zieht den Sofort-Wert nicht herunter
    expect(v.verzoegert.bild).toBeCloseTo(0.6, 12);
    expect(vergleichSofortVerzoegert(kinder.slice(0, 4), 5)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe('Ablauf (02 §2, §8)', () => {
  const ALIAS = 'Fuchs-27';
  const START = Date.parse('2027-03-15T08:00:00.000Z');

  /** Simuliert ein Tablet: beantwortet jeden Schritt und erzeugt die passenden Ereignisse. */
  class Tablet {
    seq = 0;
    zeit = START;
    constructor(
      public ereignisse: EventEnvelope[],
      public ctx: Omit<AblaufKontext, 'ereignisse'>,
    ) {}
    senden(modul: EventEnvelope['modul'], typ: string, payload: Record<string, unknown>, dtMs = 1000) {
      this.zeit += dtMs;
      const ev = parseEvent({
        id: `e${this.ereignisse.length}`,
        sitzung: this.ctx.stunde,
        teilnehmer_alias: ALIAS,
        modul,
        typ,
        zeitstempel: new Date(this.zeit).toISOString(),
        client_seq: this.seq++,
        payload,
      });
      this.ereignisse.push(ev);
    }
    schritt(): Schritt {
      return naechsterSchritt({ ...this.ctx, ereignisse: this.ereignisse } as AblaufKontext);
    }
    /** Führt einen Schritt aus; gibt false zurück, wenn das Kind warten/zuschauen muss. */
    tun(s: Schritt, antwortDabei = true): boolean {
      const takt = daten.ablauf.darbietung_ms + daten.ablauf.leer_ms;
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
          this.senden('lerndetektive', 'phase_abgeschlossen', { phase: 'pause', abgebrochen: false }, daten.ablauf.pause_aufgabe_ms);
          return true;
        case 'test':
          this.senden('lerndetektive', 'antwort_abgegeben', {
            item_id: s.eintrag.item_id,
            test: s.test,
            alt: s.eintrag.alt,
            antwort: antwortDabei === s.eintrag.alt ? 'dabei' : 'nicht_dabei',
            rt_ms: 900,
            position: s.eintrag.position,
          });
          return true;
        case 'abschliessen':
          this.senden('lerndetektive', 'phase_abgeschlossen', { phase: s.phase, abgebrochen: s.abgebrochen });
          return true;
        case 'superkraft':
          this.senden('profil', 'superkraft_ausprobiert', { antwort: 'ja' });
          return true;
        default:
          return false;
      }
    }
    /** Läuft, bis das Kind auf die Lehrkraft warten muss; liefert die Schrittarten. */
    laufen(max = 500): Schritt['art'][] {
      const arten: Schritt['art'][] = [];
      for (let i = 0; i < max; i++) {
        const s = this.schritt();
        arten.push(s.art);
        if (!this.tun(s)) return arten;
      }
      throw new Error('Ablauf endet nicht');
    }
  }

  const haupt = (freigabe: Extract<AblaufKontext, { stunde: 'haupt' }>['freigabe']) =>
    ({ stunde: 'haupt', sitzung: 'haupt', freigabe, daten, rotation: 'ROT2', seed: 1234 }) as const;
  const folge = (freigabe: Extract<AblaufKontext, { stunde: 'folge' }>['freigabe']) =>
    ({ stunde: 'folge', sitzung: 'folge', freigabe, daten, rotation: 'ROT2', seed: 1234 }) as const;
  const typen = (ev: EventEnvelope[], typ: string) => ev.filter((e) => e.typ === typ);

  it('vollständige Haupt- und Folgestunde', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('ueberzeugung_vorher'));
    t.senden('lerndetektive', 'audio_check', { ok: true });
    expect(t.laufen().at(-1)).toBe('warten');
    expect(typen(ev, 'ueberzeugung_beantwortet')).toHaveLength(3);

    t.ctx = haupt('vorlieben');
    t.laufen();
    expect(typen(ev, 'vorliebe_beantwortet')).toHaveLength(4);

    t.ctx = haupt('lernen');
    t.laufen();
    expect(typen(ev, 'item_gezeigt')).toHaveLength(N_ALT + N_PUFFER);
    expect(typen(ev, 'phase_abgeschlossen').map((e) => e.payload)).toEqual([{ phase: 'lernen', abgebrochen: false }]);

    t.ctx = haupt('pause');
    t.laufen();
    t.ctx = haupt('sofort_test');
    t.laufen();
    expect(typen(ev, 'antwort_abgegeben')).toHaveLength(72);

    t.ctx = haupt('ergebnis');
    expect(t.schritt()).toEqual({ art: 'klassenergebnis' });

    // Kennwerte aus den echten Ereignissen: dieses Kind antwortet perfekt
    const ant = typen(ev, 'antwort_abgegeben').map((e) => e.payload as TestAntwort);
    const k = berechneKennwerte(testSequenz(daten, 'ROT2', 1234, 'sofort'), ant, 'sofort');
    for (const b of BEDINGUNGEN) expect(k.bedingungen[b].korrigiert).toBe(1);
    expect(teilnahme(ev, daten)).toEqual({ audio_ok: true, hat_gelernt: true, lernen_abgebrochen: false });

    // Folgestunde eine Woche später
    t.zeit += 7 * 24 * 3600 * 1000;
    t.ctx = folge('verzoegert_test');
    t.laufen();
    expect(typen(ev, 'antwort_abgegeben').filter((e) => e.payload['test'] === 'verzoegert')).toHaveLength(72);
    t.ctx = folge('ueberzeugung_nachher');
    t.laufen();
    expect(typen(ev, 'ueberzeugung_beantwortet').filter((e) => e.payload['zeitpunkt'] === 'nachher')).toHaveLength(3);
    t.ctx = folge('vergleich');
    expect(t.schritt()).toEqual({ art: 'vergleich' });
    t.ctx = folge('superkraft');
    t.laufen();
    t.ctx = folge('fertig');
    expect(t.schritt()).toEqual({ art: 'fertig' });
  });

  it('Gerätewechsel mitten in der Lernphase: kein Neustart, keine Wiederholung, als unterbrochen markiert', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('vorlieben'));
    t.laufen();
    t.ctx = haupt('lernen');
    for (let i = 0; i < 10; i++) t.tun(t.schritt());
    // neues Tablet: gleiche Ereignisse, 2 Minuten später
    const neu = new Tablet(ev, haupt('lernen'));
    neu.zeit = t.zeit + 120000;
    neu.seq = t.seq;
    const s = neu.schritt();
    expect(s).toMatchObject({ art: 'lernen', eintrag: { position: 10 } });
    neu.laufen();
    const positionen = typen(ev, 'item_gezeigt').map((e) => e.payload['position']);
    expect(new Set(positionen).size).toBe(positionen.length); // nichts doppelt gezeigt
    expect(lernenUnterbrochen(ev, daten)).toBe(true);
    expect(typen(ev, 'phase_abgeschlossen').at(-1)!.payload).toEqual({ phase: 'lernen', abgebrochen: true });
  });

  it('Lehrkraft geht weiter, während das Kind noch lernt: Lernphase wird als abgebrochen geschlossen, Test bleibt möglich', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('lernen'));
    for (let i = 0; i < 3 + 4 + 5; i++) t.tun(t.schritt()); // U1–U3, V1–V4 und 5 Lern-Items
    expect(typen(ev, 'item_gezeigt')).toHaveLength(5);
    t.ctx = haupt('sofort_test');
    expect(t.schritt()).toEqual({ art: 'abschliessen', phase: 'lernen', abgebrochen: true });
    t.tun(t.schritt());
    expect(t.schritt()).toEqual({ art: 'abschliessen', phase: 'pause', abgebrochen: true });
    t.tun(t.schritt());
    expect(t.schritt().art).toBe('test');
    expect(teilnahme(ev, daten).lernen_abgebrochen).toBe(true);
  });

  it('zu spät gekommen (Lernphase verpasst): keine Vorher-Messung, keine Vorlieben, Zuschauer statt Test', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('sofort_test'));
    expect(t.schritt()).toEqual({ art: 'zuschauer', test: 'sofort' });
    t.ctx = haupt('ergebnis');
    expect(t.schritt()).toEqual({ art: 'klassenergebnis' });
    expect(ev).toHaveLength(0);
    // Folgestunde: kein verzögerter Test ohne Lernphase, aber Nachher-Messung
    t.ctx = folge('ueberzeugung_nachher');
    expect(t.schritt()).toMatchObject({ art: 'ueberzeugung', zeitpunkt: 'nachher' });
    t.ctx = folge('verzoegert_test');
    expect(t.schritt()).toEqual({ art: 'zuschauer', test: 'verzoegert' });
  });

  it('kommt während der Lernphase: holt Vorher-Messung und Vorlieben vor dem eigenen Lernen nach, lernt vollständig', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('lernen'));
    const arten = t.laufen();
    expect(arten.slice(0, 7)).toEqual(['ueberzeugung', 'ueberzeugung', 'ueberzeugung', 'vorliebe', 'vorliebe', 'vorliebe', 'vorliebe']);
    expect(arten[7]).toBe('lernen');
    expect(typen(ev, 'item_gezeigt')).toHaveLength(N_ALT + N_PUFFER);
  });

  it('wer schon lernt, wird nicht mehr zur Vorher-Messung zurückgeschickt', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('lernen'));
    // Kind hat U übersprungen (z. B. altes Gerät) und schon 1 Item gesehen
    for (const id of ['V1', 'V2', 'V3', 'V4']) t.senden('lerndetektive', 'vorliebe_beantwortet', { item_id: id, antwort: 'bild', rt_ms: 500 });
    t.senden('lerndetektive', 'item_gezeigt', { ...lernSequenz(daten, 'ROT2', 1234)[0]!, audio_ok: true });
    expect(t.schritt()).toMatchObject({ art: 'lernen', eintrag: { position: 1 } });
  });

  it('Pause-Knopf hat Vorrang und gibt danach den alten Schritt zurück', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('ueberzeugung_vorher'));
    const vorher = t.schritt();
    t.senden('lerndetektive', 'pause', { aktiv: true });
    expect(t.schritt()).toEqual({ art: 'pausiert' });
    t.senden('lerndetektive', 'pause', { aktiv: false });
    expect(t.schritt()).toEqual(vorher);
  });

  it('eine offene Pause aus der Hauptstunde blockiert die Folgestunde nicht', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('lernen'));
    t.laufen();
    t.senden('lerndetektive', 'pause', { aktiv: true }); // Pause-Knopf am Stundenende nicht gelöst
    expect(t.schritt()).toEqual({ art: 'pausiert' });
    t.ctx = folge('verzoegert_test');
    expect(t.schritt().art).toBe('test');
  });

  it('Test nach Gerätewechsel: bereits beantwortete Items kommen nicht wieder', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('lernen'));
    t.laufen();
    t.ctx = haupt('pause');
    t.laufen();
    t.ctx = haupt('sofort_test');
    for (let i = 0; i < 20; i++) t.tun(t.schritt());
    const neu = new Tablet(ev, haupt('sofort_test'));
    neu.zeit = t.zeit;
    neu.seq = t.seq;
    neu.laufen();
    const ids = typen(ev, 'antwort_abgegeben').map((e) => e.payload['item_id']);
    expect(ids).toHaveLength(72);
    expect(new Set(ids).size).toBe(72);
  });

  it('audio_ok ist falsch, wenn der Ton-Check fehlschlug oder eine Ton-Darbietung ohne Ton lief', () => {
    const ev: EventEnvelope[] = [];
    const t = new Tablet(ev, haupt('lernen'));
    t.senden('lerndetektive', 'audio_check', { ok: false });
    t.laufen();
    expect(teilnahme(ev, daten).audio_ok).toBe(false);
  });
});
