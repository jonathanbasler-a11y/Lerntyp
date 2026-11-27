import { ROTATIONEN, type Bedingung, type ItemSet, type Rotation, type TestZeitpunkt } from '../events';
import { LERN_SETS, bedingungFuer, type Item, type LerndetektiveDaten } from './daten';
import { ableitenSeed, erzeugeZufall, mische, type Zufall } from './zufall';

/**
 * Rotation beim Beitritt (02 §5.3): fortlaufender Zähler pro Sitzung modulo 3,
 * damit die Rotationen innerhalb einer Klasse gleich häufig vorkommen.
 * `beitrittsNummer` ist 0 für das erste Kind der Sitzung.
 */
export function rotationFuerBeitritt(beitrittsNummer: number): Rotation {
  if (!Number.isInteger(beitrittsNummer) || beitrittsNummer < 0) throw new Error('beitrittsNummer muss eine ganze Zahl ≥ 0 sein');
  return ROTATIONEN[beitrittsNummer % ROTATIONEN.length]!;
}

/**
 * Mischt Kategorien so, dass keine Kategorie öfter als `maxFolge`-mal hintereinander vorkommt.
 * Gewichtete Zufallswahl nach Restanzahl; bei einer Sackgasse neuer Versuch mit demselben
 * Zufallsstrom (deterministisch für einen Seed).
 */
export function mischeMitFolgeGrenze<K extends string>(anzahl: Readonly<Record<K, number>>, maxFolge: number, zufall: Zufall): K[] {
  const kategorien = Object.keys(anzahl) as K[];
  const gesamt = kategorien.reduce((s, k) => s + anzahl[k], 0);
  for (let versuch = 0; versuch < 1000; versuch++) {
    const rest = { ...anzahl } as Record<K, number>;
    const folge: K[] = [];
    let ok = true;
    while (folge.length < gesamt) {
      const letzte = folge.slice(-maxFolge);
      const gesperrt = letzte.length === maxFolge && letzte.every((k) => k === letzte[0]) ? letzte[0] : undefined;
      const erlaubt = kategorien.filter((k) => rest[k] > 0 && k !== gesperrt);
      if (erlaubt.length === 0) {
        ok = false;
        break;
      }
      const summe = erlaubt.reduce((s, k) => s + rest[k], 0);
      let r = zufall() * summe;
      let wahl = erlaubt[erlaubt.length - 1]!;
      for (const k of erlaubt) {
        r -= rest[k];
        if (r < 0) {
          wahl = k;
          break;
        }
      }
      folge.push(wahl);
      rest[wahl]--;
    }
    if (ok) return folge;
  }
  throw new Error('Keine Reihenfolge mit dieser Folge-Grenze gefunden');
}

export interface LernEintrag {
  position: number;
  item_id: string;
  set: ItemSet;
  bedingung: Bedingung | 'puffer';
}

/**
 * Lernsequenz eines Kindes (02 §5.3):
 * - Puffer-Items aus Set F am Anfang und Ende (nicht getestet),
 * - dazwischen alle Items der Sets A–C, gemischt, höchstens `max_gleiche_bedingung_folge`
 *   gleiche Bedingungen hintereinander,
 * - Bedingung je Set aus der Rotation.
 * Reproduzierbar: gleiche Daten + Rotation + Seed ⇒ gleiche Sequenz.
 */
export function lernSequenz(daten: LerndetektiveDaten, rotation: Rotation, seed: number): LernEintrag[] {
  const z = erzeugeZufall(ableitenSeed(seed, 'lernen'));
  const { puffer_anfang, puffer_ende, max_gleiche_bedingung_folge } = daten.ablauf;

  const nachBedingung = new Map<Bedingung, Item[]>();
  for (const set of LERN_SETS) {
    const b = bedingungFuer(daten, rotation, set);
    const items = daten.items.filter((it) => it.set === set);
    nachBedingung.set(b, mische(items, z));
  }
  const anzahl = Object.fromEntries([...nachBedingung].map(([b, its]) => [b, its.length])) as Record<Bedingung, number>;
  const muster = mischeMitFolgeGrenze(anzahl, max_gleiche_bedingung_folge, z);

  const puffer = mische(
    daten.items.filter((it) => it.set === 'F'),
    z,
  ).slice(0, puffer_anfang + puffer_ende);

  const zeiger = new Map<Bedingung, number>();
  const kern: Omit<LernEintrag, 'position'>[] = muster.map((b) => {
    const i = zeiger.get(b) ?? 0;
    zeiger.set(b, i + 1);
    const it = nachBedingung.get(b)![i]!;
    return { item_id: it.id, set: it.set, bedingung: b };
  });
  const alsPuffer = (it: Item) => ({ item_id: it.id, set: it.set, bedingung: 'puffer' as const });

  return [...puffer.slice(0, puffer_anfang).map(alsPuffer), ...kern, ...puffer.slice(puffer_anfang).map(alsPuffer)].map((e, position) => ({
    ...e,
    position,
  }));
}

export interface TestEintrag {
  position: number;
  item_id: string;
  set: ItemSet;
  alt: boolean;
  /** Bedingung in der Lernphase; `null` für Ablenker. */
  bedingung: Bedingung | null;
}

/**
 * Testsequenz (02 §6.1): alle alten Items aus A–C plus Ablenker (Sofort-Test: Set D,
 * verzögerter Test: Set E), gemischt mit neuem Seed je Test; höchstens
 * `max_gleiche_testart_folge` alte bzw. neue Items hintereinander. Puffer werden nie getestet.
 */
export function testSequenz(daten: LerndetektiveDaten, rotation: Rotation, seed: number, test: TestZeitpunkt): TestEintrag[] {
  const z = erzeugeZufall(ableitenSeed(seed, `test_${test}`));
  const alte = mische(
    LERN_SETS.flatMap((set) => daten.items.filter((it) => it.set === set).map((it) => ({ it, bedingung: bedingungFuer(daten, rotation, set) }))),
    z,
  );
  const ablenkerSet: ItemSet = test === 'sofort' ? 'D' : 'E';
  const neue = mische(
    daten.items.filter((it) => it.set === ablenkerSet),
    z,
  );
  const muster = mischeMitFolgeGrenze({ alt: alte.length, neu: neue.length }, daten.ablauf.max_gleiche_testart_folge, z);
  let ia = 0;
  let in_ = 0;
  return muster.map((art, position) => {
    if (art === 'alt') {
      const { it, bedingung } = alte[ia++]!;
      return { position, item_id: it.id, set: it.set, alt: true, bedingung };
    }
    const it = neue[in_++]!;
    return { position, item_id: it.id, set: it.set, alt: false, bedingung: null };
  });
}
