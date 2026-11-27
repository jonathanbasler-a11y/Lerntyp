import { PHASEN_FOLGE, PHASEN_STUNDE, STATIONEN, parseEvent, type EventEnvelope, type PhaseStunde } from '@lerntyp/shared';
import { beforeEach, describe, expect, it } from 'vitest';
import de from '@data/texte/de.json';
import { createMockClient, demoEreignisse, setzeDemoZurueck } from '../src/api/mock';
import { flaechenFuer } from '../src/components/IsoGebaeude';
import { simParameter } from '../src/demo/simulation';
import { daten } from '../src/lerndetektive/daten';
import { EreignisSender, modulFuer } from '../src/lerndetektive/sender';
import { kindStatus } from '../src/lerndetektive/status';
import { datenAudio } from '../src/parcours/audio';
import { kartenDaten, parcoursDaten } from '../src/parcours/daten';
import { anzeigeFuer, gespeichertesProfil, profilFuer } from '../src/parcours/profil';
import { indikatorZeilen } from '../src/screens/cockpit/Profile';

const VERBOTEN = /%|Punkt|\bNote\b|Noten|Niveau|\bTyp\b|Lerntyp|Rang|besser als|schlechter/i;

async function bis(c: ReturnType<typeof createMockClient>, ziel: PhaseStunde) {
  for (const p of PHASEN_STUNDE.slice(1, PHASEN_STUNDE.indexOf(ziel) + 1)) await c.setFreigabe(p);
}

describe('Ereignisse des Parcours', () => {
  const sender = () => new EreignisSender({ sitzung: 's', alias: 'Fuchs-27', startSeq: 0, jetzt: () => new Date('2027-03-15T08:00:00Z'), neueId: () => 'x' });
  it('antwort_abgegeben gehört je nach Angabe zu Parcours oder Lerndetektive', () => {
    const p = sender().erzeuge('antwort_abgegeben', { station: 's1', aufgabe_id: 's1_a1', korrekt: true, versuch: 1, rt_ms: 1200, antwort: 'd', begruendung: 'verlaengern' }, 'parcours');
    expect(p.modul).toBe('parcours');
    expect(modulFuer('antwort_abgegeben')).toBe('lerndetektive');
    expect(() => sender().erzeuge('antwort_abgegeben', { station: 's1', aufgabe_id: 's1_a1', korrekt: 'ja' }, 'parcours')).toThrow();
  });
  it('Profil-Ereignisse bekommen das Modul „profil“', () => {
    expect(modulFuer('profil_angezeigt')).toBe('profil');
    expect(modulFuer('profil_passt')).toBe('profil');
    expect(modulFuer('superkraft_ausprobiert')).toBe('profil');
    expect(modulFuer('pause')).toBe('lerndetektive');
  });
});

describe('Isometrische Zeichnung', () => {
  it('jede Aufgabe: drei Flächen je Würfel plus Bodenfeld je Zelle', () => {
    for (const a of [parcours().s3.musterbeispiel, ...parcours().s3.aufgaben]) {
      const hoehen = a.gebaeude.flat();
      const flaechen = flaechenFuer(a.gebaeude);
      expect(flaechen.filter((f) => f.schluessel.startsWith('boden'))).toHaveLength(hoehen.length);
      expect(flaechen.filter((f) => !f.schluessel.startsWith('boden'))).toHaveLength(3 * hoehen.reduce((s, h) => s + h, 0));
    }
  });
  it('hinten zuerst: ein vorderer Würfel wird nach dem hinteren gemalt, Deckfläche nach den Seiten', () => {
    const f = flaechenFuer([[1, 0], [0, 1]]).filter((x) => !x.schluessel.startsWith('boden')).map((x) => x.schluessel);
    expect(f.indexOf('t-0-0-0')).toBeLessThan(f.indexOf('t-1-1-0'));
    expect(f.indexOf('l-0-0-0')).toBeLessThan(f.indexOf('t-0-0-0'));
  });
  it('gestapelte Würfel liegen höher (kleineres y)', () => {
    const f = flaechenFuer([[2]]);
    const deckeUnten = f.find((x) => x.schluessel === 't-0-0-0')!;
    const deckeOben = f.find((x) => x.schluessel === 't-0-0-1')!;
    expect(deckeOben.punkte[0]![1]).toBeLessThan(deckeUnten.punkte[0]![1]);
  });
});
const parcours = () => parcoursDaten;

describe('Audio zu Daten-Texten', () => {
  it('jeder Hinweis, jede Rückmeldung, jedes Musterbeispiel und jede Karte hat eine Audiodatei', () => {
    for (const st of STATIONEN) {
      expect(datenAudio(`${st}.muster`)).toHaveLength(1);
      for (const a of parcoursDaten[st].aufgaben) for (const f of ['hinweis1', 'hinweis2', 'fehler']) expect(datenAudio(`${a.id}.${f}`)).toHaveLength(1);
    }
    for (const k of kartenDaten.karten) expect(datenAudio(`karte.${k.id}`)).toHaveLength(1);
    expect(datenAudio('fallback')).toHaveLength(1);
    for (const s of Object.keys(kartenDaten.superkraft)) {
      expect(datenAudio(`superkraft.${s}`)).toHaveLength(1);
      expect(datenAudio(`tipp.${s}`)).toHaveLength(1);
      expect(datenAudio(`sk_frage.${s}`)).toHaveLength(1);
    }
  });
});

describe('Sprachregeln der neuen Kinder-Texte', () => {
  const schluessel = Object.keys(de).filter((k) => /^(parcours|profil)\./.test(k) || k === 'kind.superkraft.frage_profil');
  it('keine Zahlen-, Typ- oder Rangwörter', () => {
    for (const k of schluessel) expect(de[k as keyof typeof de], k).not.toMatch(VERBOTEN);
  });
  it('Prüfen: nur der Vergleich mit dem eigenen Ziel', () => {
    expect(de['parcours.pruefen.ziel_anders']).toBe('Du hast {n} geschafft, du hattest {ziel} geplant.');
    expect(de['parcours.pruefen.ziel_erreicht']).toBe('Du hast dein Ziel erreicht.');
  });
});

describe('Demo: simulierte Kinder durchlaufen Parcours und Profil', () => {
  beforeEach(() => setzeDemoZurueck());

  it('alle Ereignisse sind schema-gültig; jedes simulierte Kind hat 3 Stationen und ein Profil', async () => {
    const c = createMockClient();
    await bis(c, 'profil');
    const alle = demoEreignisse();
    for (const e of alle) expect(() => parseEvent(e)).not.toThrow();
    for (const alias of simParameter.kinder) {
      const eigene = alle.filter((e) => e.teilnehmer_alias === alias);
      expect(eigene.filter((e) => e.modul === 'parcours' && e.typ === 'ziel_gesetzt').map((e) => e.payload['station'])).toEqual([...STATIONEN]);
      expect(eigene.filter((e) => e.modul === 'parcours' && e.typ === 'hilfreich_gewaehlt')).toHaveLength(3);
      const profil = gespeichertesProfil(eigene);
      expect(profil, alias).not.toBeNull();
      expect(profil!.karten_ids.length).toBeGreaterThan(0);
      expect(profil!.karten_ids.length).toBeLessThanOrEqual(3);
      expect(eigene.some((e) => e.typ === 'profil_passt')).toBe(true);
      const status = kindStatus(await c.getStand(), (await c.listTeilnehmer()).find((t) => t.alias === alias)!, alle, daten);
      expect(status.art).toBe('fertig');
    }
  });

  it('Lerndetektive-Auswertung bleibt vom Parcours unberührt (nur 72 Testantworten je Kind)', async () => {
    const c = createMockClient();
    await bis(c, 'profil');
    for (const alias of simParameter.kinder.slice(0, 5)) {
      const lern = demoEreignisse().filter((e) => e.teilnehmer_alias === alias && e.modul === 'lerndetektive' && e.typ === 'antwort_abgegeben');
      expect(lern).toHaveLength(72);
    }
  });

  it('die simulierten Profile unterscheiden sich, und kein Kartentext nennt Zahlen, Typen oder Vergleiche', async () => {
    const c = createMockClient();
    await bis(c, 'profil');
    const alle = demoEreignisse();
    const kombis = new Set<string>();
    for (const alias of simParameter.kinder) {
      const a = anzeigeFuer(alle.filter((e) => e.teilnehmer_alias === alias));
      kombis.add(`${a.karten.map((k) => k.id).join('+')}|${a.superkraft.strategie}`);
      for (const text of [...a.karten.map((k) => k.text), a.superkraft.text, a.tipp]) expect(text).not.toMatch(VERBOTEN);
      for (const k of a.karten) expect(k.text).not.toMatch(/\d/);
    }
    expect(kombis.size).toBeGreaterThan(3);
  });

  it('Cockpit-Indikatoren sind Worte ohne Zahlen und ohne Ergebnisse der Lerndetektive', async () => {
    const c = createMockClient();
    await bis(c, 'profil');
    const alle = demoEreignisse();
    for (const alias of simParameter.kinder) {
      const zeilen = indikatorZeilen(alle.filter((e) => e.teilnehmer_alias === alias));
      expect(zeilen.length).toBeGreaterThan(0);
      for (const z of zeilen) {
        expect(`${z.text} ${z.wo ?? ''}`).not.toMatch(/\d|%|Vermutet|Ergebnis|Vorliebe|wiedererkannt/i);
      }
    }
    expect(indikatorZeilen([])).toEqual([]);
  });

  it('Folgestunde: Superkraft-Frage kennt das gespeicherte Profil', async () => {
    const c = createMockClient();
    await bis(c, 'profil');
    await c.starteFolgestunde();
    const alias = simParameter.kinder[0]!;
    const eigene = demoEreignisse().filter((e) => e.teilnehmer_alias === alias);
    expect(profilFuer(eigene).superkraft).toBe(gespeichertesProfil(eigene)!.superkraft);
    expect(PHASEN_FOLGE[3]).toBe('superkraft');
  });

  it('ohne Verhaltensspur zeigt das Profil die ermutigende Karte', () => {
    const a = anzeigeFuer([] as EventEnvelope[]);
    expect(a.karten).toHaveLength(1);
    expect(a.karten[0]!.station).toBeNull();
    expect(a.karten[0]!.text).toBe(kartenDaten.fallback.text);
  });
});
