import { useEffect, useRef, useState } from 'react';
import type { LernEintrag } from '@lerntyp/shared';
import { PlatzhalterBild } from '../../components/PlatzhalterBild';
import { spiele } from '../../lerndetektive/audio';
import { itemFuer } from '../../lerndetektive/daten';
import type { Zeiten } from '../../lerndetektive/zeiten';

/**
 * Darbietung eines Dings mit festem Takt (02 §5.2): `darbietung_ms` sichtbar, dann `leer_ms` leer.
 * wort = nur geschriebenes Wort, bild = nur Bild ohne Text, bild_wort (und Puffer) = Bild mit Wort darunter.
 */
export function Lernen({
  eintrag,
  zeiten,
  audioOk,
  onGezeigt,
  onFertig,
}: {
  eintrag: LernEintrag;
  zeiten: Zeiten;
  audioOk: boolean;
  onGezeigt: (eintrag: LernEintrag) => void;
  onFertig: () => void;
}) {
  const [leer, setLeer] = useState(false);
  const item = itemFuer(eintrag.item_id);
  const aktuell = useRef({ eintrag, onGezeigt, onFertig });
  useEffect(() => {
    aktuell.current = { eintrag, onGezeigt, onFertig };
  });

  const { darbietung_ms, leer_ms } = zeiten;
  useEffect(() => {
    const { eintrag: e, onGezeigt: gezeigt } = aktuell.current;
    gezeigt(e);
    if (audioOk && e.bedingung !== 'bild') spiele(itemFuer(e.item_id).audio);
    const zuLeer = setTimeout(() => setLeer(true), darbietung_ms);
    const zuEnde = setTimeout(() => aktuell.current.onFertig(), darbietung_ms + leer_ms);
    return () => {
      clearTimeout(zuLeer);
      clearTimeout(zuEnde);
    };
    // Ein neuer Eintrag mountet die Komponente neu (key = Position); der Takt startet genau einmal.
  }, [darbietung_ms, leer_ms, audioOk]);

  const mitBild = eintrag.bedingung !== 'wort';
  const mitWort = eintrag.bedingung !== 'bild';
  return (
    <section className="lern-buehne" data-testid="schritt-lernen" data-bedingung={eintrag.bedingung} data-position={eintrag.position} aria-live="off">
      {!leer && (
        <div className="lern-inhalt">
          {mitBild && <PlatzhalterBild item={item} />}
          {mitWort && (
            <p className={mitBild ? 'lern-wort lern-wort-klein' : 'lern-wort'} data-testid="lernen-wort">
              {item.wort}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
