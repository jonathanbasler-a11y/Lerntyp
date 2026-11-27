import { describe, expect, it } from 'vitest';
import { DemoSchema, EventEnvelopeSchema, TexteSchema, parseEvent } from '../src';

const ok = {
  id: 'e1',
  sitzung: 's1',
  teilnehmer_alias: 'Fuchs-27',
  modul: 'start',
  typ: 'beitritt',
  zeitstempel: '2026-01-01T10:00:00.000Z',
  client_seq: 0,
  payload: {},
};

describe('Ereignis-Envelope', () => {
  it('akzeptiert ein gültiges Ereignis', () => {
    expect(parseEvent(ok).typ).toBe('beitritt');
  });
  it('lehnt unbekanntes Modul ab', () => {
    expect(EventEnvelopeSchema.safeParse({ ...ok, modul: 'quiz' }).success).toBe(false);
  });
  it('lehnt ungültigen Zeitstempel und negative Sequenz ab', () => {
    expect(EventEnvelopeSchema.safeParse({ ...ok, zeitstempel: 'gestern' }).success).toBe(false);
    expect(EventEnvelopeSchema.safeParse({ ...ok, client_seq: -1 }).success).toBe(false);
  });
  it('validiert den Payload je Typ', () => {
    expect(() => parseEvent({ ...ok, typ: 'pause', payload: {} })).toThrow();
    expect(parseEvent({ ...ok, typ: 'pause', payload: { aktiv: true } }).typ).toBe('pause');
  });
});

describe('Daten-Schemas', () => {
  it('Texte: leere Texte und schlechte Schlüssel scheitern', () => {
    expect(TexteSchema.safeParse({ 'a.b': 'x' }).success).toBe(true);
    expect(TexteSchema.safeParse({ 'a.b': '' }).success).toBe(false);
    expect(TexteSchema.safeParse({ ohnepunkt: 'x' }).success).toBe(false);
  });
  it('Demo: Alias-Format und Eindeutigkeit', () => {
    const a = { alias: 'Fuchs-27', symbol: 'F' };
    expect(DemoSchema.safeParse({ sitzungscode: 'X', aliasse: [a] }).success).toBe(true);
    expect(DemoSchema.safeParse({ sitzungscode: 'X', aliasse: [{ alias: 'Max Mustermann', symbol: 'F' }] }).success).toBe(false);
    expect(DemoSchema.safeParse({ sitzungscode: 'X', aliasse: [a, a] }).success).toBe(false);
  });
});
