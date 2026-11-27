import { ProfilInhalt } from '../../components/ProfilInhalt';
import type { Klasse } from '../../lerndetektive/hooks';
import { anzeigeFuer } from '../../parcours/profil';
import { fuelle, t } from '../../text';

/**
 * „Profil zum Mitnehmen“ (01 §7.6): ein Blatt pro Alias mit Karten, Superkraft und Tipp für zu Hause, sonst nichts.
 * Kein Name, keine Ergebnisse, keine Vergleichswerte. Der Bildschirm-Rahmen (Knöpfe, Hinweis) wird im Druck ausgeblendet.
 */
export function ProfilDruck({ klasse, alias, onZurueck }: { klasse: Klasse; alias: string; onZurueck: () => void }) {
  const anzeige = anzeigeFuer(klasse.ereignisse.filter((e) => e.teilnehmer_alias === alias));
  return (
    <section className="druck-seite" aria-labelledby="h" data-testid="druck-ansicht">
      <div className="no-print druck-leiste">
        <button type="button" className="btn btn-primary" data-testid="druck-knopf" onClick={() => window.print()}>
          {t('cockpit.druck.drucken')}
        </button>
        <button type="button" className="btn btn-quiet" data-testid="druck-zurueck" onClick={onZurueck}>
          {t('cockpit.druck.zurueck')}
        </button>
      </div>
      <article className="druck-blatt" data-testid="druck-blatt">
        <h1 id="h">{t('profil.titel')}</h1>
        <p className="druck-alias" data-testid="druck-alias">
          {fuelle(t('cockpit.druck.alias'), { alias })}
        </p>
        <ProfilInhalt anzeige={anzeige} />
      </article>
      <p className="notice no-print" role="note" data-testid="hinweis-lernbegleitung">
        {t('hinweis.lernbegleitung')}
      </p>
    </section>
  );
}
