import { t } from '../text';

export function DemoBanner() {
  return (
    <div className="demo-banner" role="note" data-testid="demo-banner">
      {t('demo.banner')}
    </div>
  );
}
