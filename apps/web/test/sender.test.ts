import { describe, expect, it } from 'vitest';
import { EreignisSender, modulFuer, naechsteSeq } from '../src/lerndetektive/sender';
import { istSchnell, zeiten } from '../src/lerndetektive/zeiten';
import { daten } from '../src/lerndetektive/daten';

describe('EreignisSender', () => {
  const sender = (startSeq = 0) =>
    new EreignisSender({ sitzung: 's1', alias: 'Fuchs-27', startSeq, jetzt: () => new Date('2026-11-27T08:00:00Z'), neueId: (() => { let n = 0; return () => `id${n++}`; })() });

  it('vergibt streng aufsteigende client_seq ab dem Startwert', () => {
    const s = sender(5);
    const seqs = [
      s.erzeuge('ueberzeugung_beantwortet', { item_id: 'U1', antwort: 'stimmt', zeitpunkt: 'vorher', rt_ms: 800 }),
      s.erzeuge('pause', { aktiv: true }),
      s.erzeuge('hilfe_angefordert', {}),
    ].map((e) => e.client_seq);
    expect(seqs).toEqual([5, 6, 7]);
  });

  it('setzt modul „lerndetektive“, nur superkraft_ausprobiert gehört zu „profil“', () => {
    expect(modulFuer('item_gezeigt')).toBe('lerndetektive');
    expect(modulFuer('pause')).toBe('lerndetektive');
    expect(modulFuer('superkraft_ausprobiert')).toBe('profil');
    const e = sender().erzeuge('superkraft_ausprobiert', { antwort: 'ja' });
    expect(e.modul).toBe('profil');
    expect(e.sitzung).toBe('s1');
    expect(e.teilnehmer_alias).toBe('Fuchs-27');
  });

  it('lehnt ungültige Payloads ab', () => {
    expect(() => sender().erzeuge('antwort_abgegeben', { item_id: 'x' })).toThrow();
  });

  it('naechsteSeq setzt pro Alias und Sitzung fort', () => {
    const s = sender();
    const ev = [s.erzeuge('pause', { aktiv: true }), s.erzeuge('pause', { aktiv: false })];
    expect(naechsteSeq(ev, 's1', 'Fuchs-27')).toBe(2);
    expect(naechsteSeq(ev, 's2', 'Fuchs-27')).toBe(0);
    expect(naechsteSeq(ev, 's1', 'Igel-14')).toBe(0);
  });
});

describe('Schnellmodus', () => {
  it('gilt nur im Demo-Build und nur mit ?schnell=1', () => {
    expect(istSchnell('?schnell=1', true)).toBe(true);
    expect(istSchnell('?schnell=1', false)).toBe(false);
    expect(istSchnell('', true)).toBe(false);
    expect(istSchnell('?schnell=0', true)).toBe(false);
  });
  it('verkürzt nur die Kopie, nie die Daten', () => {
    const vorher = structuredClone(daten.ablauf);
    const z = zeiten(daten.ablauf, true);
    expect(z.darbietung_ms).toBeLessThan(daten.ablauf.darbietung_ms);
    expect(daten.ablauf).toEqual(vorher);
    expect(zeiten(daten.ablauf, false).darbietung_ms).toBe(daten.ablauf.darbietung_ms);
  });
});
