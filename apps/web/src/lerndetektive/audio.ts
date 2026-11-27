import vorlesenRoh from '@data/audio/vorlesen.json';
import type { TextKey } from '../text';

/** Vorproduzierte Audiodateien (synthetische Stimme, keine Sprachausgabe zur Laufzeit). Fehlt eine Datei, läuft alles ohne Ton (`audio_ok=false`, 02 §8). */
export const audioUrl = (datei: string): string => `${import.meta.env.BASE_URL}audio/${datei}`;

const vorlesenDatei = new Map<string, string>(vorlesenRoh.map((v) => [v.key, v.datei]));

/** Audiodateien für die Textschlüssel eines Bildschirms (nur Schlüssel mit Eintrag in data/audio/vorlesen.json). */
export function vorlesenDateien(keys: readonly TextKey[]): string[] {
  return keys.flatMap((k) => vorlesenDatei.get(k) ?? []);
}

export async function audioVerfuegbar(): Promise<boolean> {
  try {
    const res = await fetch(audioUrl('check.mp3'), { method: 'HEAD' });
    // Ein SPA-Fallback liefert HTML mit Status 200: nur echte Audio-Antworten zählen.
    return res.ok && (res.headers.get('content-type') ?? '').startsWith('audio/');
  } catch {
    return false;
  }
}

export function spiele(datei: string): void {
  try {
    void new Audio(audioUrl(datei)).play().catch(() => undefined);
  } catch {
    // Kein Ton ist kein Fehler.
  }
}

let aktuell: HTMLAudioElement | null = null;

/** Beendet eine laufende Vorlese-Folge. */
export function stoppe(): void {
  if (aktuell) {
    aktuell.onended = null;
    aktuell.pause();
    aktuell = null;
  }
}

/** Spielt die Dateien nacheinander (nur auf Tipp des Kindes, nie automatisch). */
export function spieleFolge(dateien: readonly string[]): void {
  stoppe();
  let i = 0;
  const weiter = () => {
    const datei = dateien[i++];
    if (datei === undefined) {
      aktuell = null;
      return;
    }
    try {
      const a = new Audio(audioUrl(datei));
      a.onended = weiter;
      aktuell = a;
      void a.play().catch(() => undefined);
    } catch {
      aktuell = null;
    }
  };
  weiter();
}
