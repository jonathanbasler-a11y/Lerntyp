/** Audio-Dateien (noch nicht vorhanden): Fehlt die Datei, läuft alles ohne Ton (`audio_ok=false`, 02 §8). */
export const audioUrl = (datei: string): string => `${import.meta.env.BASE_URL}audio/${datei}`;

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
