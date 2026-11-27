import { t } from '../text';

/** Platzhalter: kein TTS, keine Netzwerkzugriffe (Vorlesen folgt später). */
export function VorleseKnopf() {
  return (
    <button type="button" className="btn btn-quiet vorlesen" disabled title={t('vorlesen.hinweis')} aria-label={t('vorlesen.hinweis')}>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
        <path d="M3 9v6h4l5 4V5L7 9H3z" />
        <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>{t('vorlesen.label')}</span>
    </button>
  );
}
