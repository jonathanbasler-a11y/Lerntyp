import { PayloadSchemas, parseEvent, type EventEnvelope } from '@lerntyp/shared';

/**
 * Modul eines Ereignistyps, wenn es nicht angegeben wird: Profil-Ereignisse gehören zu „profil“, alles andere zu „lerndetektive“ (02 §9).
 * Parcours-Ereignisse müssen das Modul „parcours“ ausdrücklich angeben (`antwort_abgegeben` gibt es in beiden Modulen).
 */
export function modulFuer(typ: string): 'lerndetektive' | 'profil' {
  return Object.hasOwn(PayloadSchemas.profil, typ) ? 'profil' : 'lerndetektive';
}

/** Nächste `client_seq` für Alias und Sitzung: streng aufsteigend, auch nach Neustart der Ansicht. */
export function naechsteSeq(ereignisse: readonly EventEnvelope[], sitzung: string, alias: string): number {
  let max = -1;
  for (const e of ereignisse) if (e.sitzung === sitzung && e.teilnehmer_alias === alias && e.client_seq > max) max = e.client_seq;
  return max + 1;
}

export interface SenderOptionen {
  sitzung: string;
  alias: string;
  startSeq: number;
  jetzt?: () => Date;
  neueId?: () => string;
}

/** Erzeugt validierte Ereignisse im Envelope-Format (03 §4.4) mit fortlaufender `client_seq`. */
export class EreignisSender {
  private seq: number;
  private readonly jetzt: () => Date;
  private readonly neueId: () => string;

  constructor(private readonly opt: SenderOptionen) {
    this.seq = opt.startSeq;
    this.jetzt = opt.jetzt ?? (() => new Date());
    this.neueId = opt.neueId ?? (() => crypto.randomUUID());
  }

  get sitzung(): string {
    return this.opt.sitzung;
  }

  erzeuge(typ: string, payload: Record<string, unknown>, modul: EventEnvelope['modul'] = modulFuer(typ)): EventEnvelope {
    return parseEvent({
      id: this.neueId(),
      sitzung: this.opt.sitzung,
      teilnehmer_alias: this.opt.alias,
      modul,
      typ,
      zeitstempel: this.jetzt().toISOString(),
      client_seq: this.seq++,
      payload,
    });
  }
}
