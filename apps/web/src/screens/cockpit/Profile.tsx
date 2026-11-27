import { PROFIL_STATIONEN, VERHALTEN, indikatoren, type EventEnvelope } from '@lerntyp/shared';
import { ProfilInhalt } from '../../components/ProfilInhalt';
import type { Klasse } from '../../lerndetektive/hooks';
import { kartenDaten } from '../../parcours/daten';
import { anzeigeFuer } from '../../parcours/profil';
import { fuelle, t, type TextKey } from '../../text';

/** Indikatoren eines Kindes in Worten (01 §7.5): nur beobachtetes Verhalten im Parcours, nie Ergebnisse der Lerndetektive. */
export function indikatorZeilen(ereignisse: readonly EventEnvelope[]): { verhalten: string; text: string; wo: string | null }[] {
  const ind = indikatoren(ereignisse);
  return VERHALTEN.flatMap((v) => {
    const stationen = PROFIL_STATIONEN.filter((s) => ind[v][s]);
    if (stationen.length === 0) return [];
    // Begründung gibt es nur in S1 (steht schon im Text), Teilnahme nur bei den Lerndetektiven.
    const wo = v === 'begruendung' || v === 'teilnahme' ? null : fuelle(t('cockpit.profil.bei'), { liste: stationen.map((s) => t(`parcours.station.${s}.titel` as TextKey)).join(', ') });
    return [{ verhalten: v, text: kartenDaten.indikatoren[v], wo }];
  });
}

/** Einzelprofile (01 §7.5): pro Alias Stärken-Karten, Lern-Superkraft und Indikatoren in Worten. */
export function Profile({ klasse, alias, onAlias, onDruck }: { klasse: Klasse; alias: string | null; onAlias: (alias: string | null) => void; onDruck: (alias: string) => void }) {
  const setAlias = onAlias;
  const kinder = [...klasse.teilnehmer].sort((a, b) => Number(a.simuliert) - Number(b.simuliert) || a.alias.localeCompare(b.alias, 'de'));

  if (alias) {
    const eigene = klasse.ereignisse.filter((e) => e.teilnehmer_alias === alias);
    const zeilen = indikatorZeilen(eigene);
    return (
      <div data-testid="profil-ansicht" data-alias={alias}>
        <button type="button" className="btn btn-quiet" data-testid="profil-zurueck" onClick={() => setAlias(null)}>
          {t('cockpit.profil.zurueck_liste')}
        </button>
        <h2 data-testid="profil-alias">{alias}</h2>
        <ProfilInhalt anzeige={anzeigeFuer(eigene)} ueberschrift="h3" />
        <h3>{t('cockpit.profil.indikatoren')}</h3>
        {zeilen.length === 0 ? (
          <p className="hint">{t('cockpit.profil.keine')}</p>
        ) : (
          <ul className="indikatoren" data-testid="indikatoren">
            {zeilen.map((z) => (
              <li key={z.verhalten}>
                <span>{z.text}</span>
                {z.wo && <span className="hint indikator-wo">{z.wo}</span>}
              </li>
            ))}
          </ul>
        )}
        <p className="hint">{t('cockpit.profil.hinweis')}</p>
        <button type="button" className="btn btn-primary" data-testid="profil-drucken" onClick={() => onDruck(alias)}>
          {t('cockpit.profil.mitnehmen')}
        </button>
      </div>
    );
  }
  return (
    <div data-testid="profil-liste">
      <h2>{t('cockpit.profil.titel')}</h2>
      <p className="hint">{t('cockpit.profil.waehle')}</p>
      <ul className="liste">
        {kinder.map((k) => (
          <li key={k.alias}>
            <button type="button" className="btn btn-secondary profil-alias-knopf" data-testid={`profil-alias-${k.alias}`} onClick={() => setAlias(k.alias)}>
              <span>{k.alias}</span>
              {k.simuliert && <span className="marke">{t('cockpit.simuliert')}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
