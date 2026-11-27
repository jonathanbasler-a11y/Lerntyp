import { PHASEN_FOLGE, PHASEN_HAUPT, klassenErgebnis, parseEvent, testSequenz, vergleichSofortVerzoegert, type EventEnvelope } from '@lerntyp/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMockClient, demoEreignisse, setzeDemoZurueck } from '../src/api/mock';
import { alleGruppen, formatProzent, nachVermutungGruppen, vergleichGruppen } from '../src/lerndetektive/diagramm';
import { wertePro } from '../src/lerndetektive/auswertung';
import { daten } from '../src/lerndetektive/daten';
import { kindStatus } from '../src/lerndetektive/status';
import { simParameter } from '../src/demo/simulation';

async function bisZurFreigabe(client: ReturnType<typeof createMockClient>, phasen: readonly string[], ziel: string) {
  for (const p of phasen.slice(1, phasen.indexOf(ziel) + 1)) await client.setFreigabe(p as never);
}

describe('Demo-Simulation', () => {
  beforeEach(() => setzeDemoZurueck());

  it('erzeugt ~22 simulierte Kinder; mit dem Demo-Kind ~23', async () => {
    const c = createMockClient();
    await c.joinSession('X', 'Fuchs-27');
    const tn = await c.listTeilnehmer();
    expect(tn.filter((t) => t.simuliert)).toHaveLength(simParameter.kinder.length);
    expect(tn).toHaveLength(simParameter.kinder.length + 1);
  });

  it('alle Ereignisse sind schema-gültig, client_seq steigt je Alias und Sitzung streng', async () => {
    const c = createMockClient();
    await bisZurFreigabe(c, PHASEN_HAUPT, 'ergebnis');
    await c.starteFolgestunde();
    await bisZurFreigabe(c, PHASEN_FOLGE, 'fertig');
    const alle = demoEreignisse();
    expect(alle.length).toBeGreaterThan(1000);
    const letzte = new Map<string, number>();
    for (const e of alle) {
      expect(() => parseEvent(e)).not.toThrow();
      const key = `${e.sitzung}/${e.teilnehmer_alias}`;
      expect(e.client_seq).toBe((letzte.get(key) ?? -1) + 1);
      letzte.set(key, e.client_seq);
    }
    // IDs eindeutig
    expect(new Set(alle.map((e) => e.id)).size).toBe(alle.length);
  });

  it('Hauptstunde: jedes simulierte Kind beantwortet 72 Testitems; Klassenergebnis mit Aufteilung nach Vermutung', async () => {
    const c = createMockClient();
    await bisZurFreigabe(c, PHASEN_HAUPT, 'ergebnis');
    const alle = await c.getEvents();
    for (const k of simParameter.kinder) {
      expect(alle.filter((e) => e.teilnehmer_alias === k && e.typ === 'antwort_abgegeben')).toHaveLength(72);
      expect(alle.filter((e) => e.teilnehmer_alias === k && e.typ === 'item_gezeigt')).toHaveLength(40);
    }
    const tn = await c.listTeilnehmer();
    const kinder = wertePro(tn, alle, daten).filter((k) => k.sofort);
    const erg = klassenErgebnis(kinder.map((k) => ({ vermutung: k.vermutung, korrigiert: k.sofort! })), daten.ablauf.mindestgruppe);
    expect(erg.alle.n).toBe(simParameter.kinder.length);
    expect(erg.nachVermutung).not.toBeNull();
    const gruppen = alleGruppen(erg);
    expect(gruppen).toHaveLength(1);
    expect(gruppen[0]!.balken.map((b) => b.bedingung)).toEqual(['wort', 'bild', 'bild_wort']);
    expect(nachVermutungGruppen(erg)!.length).toBeGreaterThanOrEqual(2);
    // Bild + Wort liegt in der simulierten Klasse vorn (so sind die Wahrscheinlichkeiten gesetzt).
    const m = erg.alle.mittel;
    expect(m.bild_wort!).toBeGreaterThan(m.wort!);
  });

  it('Folgestunde: Vergleich sofort vs. verzögert für anwesende Kinder (gepaart)', async () => {
    const c = createMockClient();
    await bisZurFreigabe(c, PHASEN_HAUPT, 'ergebnis');
    await c.starteFolgestunde();
    await bisZurFreigabe(c, PHASEN_FOLGE, 'vergleich');
    const tn = await c.listTeilnehmer();
    const kinder = wertePro(tn, await c.getEvents(), daten).filter((k) => k.sofort);
    const v = vergleichSofortVerzoegert(kinder.map((k) => ({ sofort: k.sofort!, verzoegert: k.verzoegert })), daten.ablauf.mindestgruppe);
    expect(v).not.toBeNull();
    expect(v!.n).toBe(simParameter.kinder.length - simParameter.fehlt_in_folgestunde);
    expect(v!.verzoegert.bild_wort!).toBeLessThan(v!.sofort.bild_wort!);
    const gruppen = vergleichGruppen(v!);
    expect(gruppen).toHaveLength(3);
    expect(gruppen.every((g) => g.balken.length === 2 && g.balken[1]!.verzoegert)).toBe(true);
  });

  it('Live-Status zeigt nur Schrittart und Flags, keine Ergebnisse', async () => {
    const c = createMockClient();
    await c.joinSession('X', 'Fuchs-27');
    const stand = await c.getStand();
    const [tn, ev] = [await c.listTeilnehmer(), await c.getEvents()];
    const s = kindStatus(stand, tn.find((t) => t.alias === 'Fuchs-27')!, ev, daten);
    expect(Object.keys(s).sort()).toEqual(['alias', 'art', 'hilfe', 'pausiert', 'simuliert']);
    expect(s.art).toBe('start');
    const sim = kindStatus(stand, tn.find((t) => t.simuliert)!, ev, daten);
    expect(sim.art).toBe('warten');
  });

  it('Teilnehmer behalten Rotation und Seed; Beitritt wird nur einmal je Sitzung gespeichert', async () => {
    const c = createMockClient();
    const a = await c.joinSession('X', 'Igel-14');
    const b = await c.joinSession('X', 'Igel-14');
    expect(b.teilnehmer).toEqual(a.teilnehmer);
    const ev: EventEnvelope[] = await c.getEvents({ alias: 'Igel-14' });
    expect(ev.filter((e) => e.typ === 'beitritt')).toHaveLength(1);
  });

  it('abonniere meldet Änderungen', async () => {
    const c = createMockClient();
    let n = 0;
    const ab = c.abonniere(() => n++);
    await c.setFreigabe('vorlieben');
    ab();
    await c.setFreigabe('lernen');
    expect(n).toBe(1);
  });
});

describe('Diagramm-Hilfen', () => {
  it('formatiert Prozent ohne Nachkommastellen', () => {
    expect(formatProzent(0.5849)).toBe('58 %');
    expect(formatProzent(null)).toBe('–');
  });
});

describe('Vergleichsdiagramm nutzt nur Kinder mit beiden Tests', () => {
  it('Kinder ohne verzögerten Test fließen weder in n noch in die Mittelwerte ein', async () => {
    const c = createMockClient();
    const stamm = (await c.listTeilnehmer()).filter((k) => k.simuliert).slice(0, 7);
    // Perfekte Antworten (alt = dabei) auf beiden Tests; die letzten zwei Kinder haben nur den Sofort-Test und antworten dort ausnahmslos „nicht dabei“.
    const ev: EventEnvelope[] = [];
    stamm.forEach((k, i) => {
      const fehlt = i >= 5;
      for (const test of ['sofort', 'verzoegert'] as const) {
        if (fehlt && test === 'verzoegert') continue;
        for (const e of testSequenz(daten, k.rotation, k.seed, test)) {
          const antwort = fehlt ? 'nicht_dabei' : e.alt ? 'dabei' : 'nicht_dabei';
          ev.push({ modul: 'lerndetektive', teilnehmer_alias: k.alias, typ: 'antwort_abgegeben', payload: { item_id: e.item_id, test, alt: e.alt, antwort, rt_ms: 900, position: e.position } } as unknown as EventEnvelope);
        }
      }
    });
    const kinder = wertePro(stamm, ev, daten).filter((k) => k.sofort !== null);
    expect(kinder).toHaveLength(7);
    const v = vergleichSofortVerzoegert(kinder.map((k) => ({ sofort: k.sofort!, verzoegert: k.verzoegert })), daten.ablauf.mindestgruppe);
    expect(v).not.toBeNull();
    expect(v!.n).toBe(5);
    // Wären die zwei Kinder ohne Folgetest mitgezählt, läge „sofort“ unter 1.
    for (const b of ['wort', 'bild', 'bild_wort'] as const) {
      expect(v!.sofort[b]).toBeCloseTo(1, 5);
      expect(v!.verzoegert[b]).toBeCloseTo(1, 5);
    }
    const gruppen = vergleichGruppen(v!);
    expect(gruppen[0]!.balken.map((b) => b.srLabel)).toEqual(['Wort – sofort', 'Wort – nach 1 Woche']);
  });
});
