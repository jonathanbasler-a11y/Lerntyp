import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlatzhalterBild } from '../src/components/PlatzhalterBild';
import { itemFuer } from '../src/lerndetektive/daten';

describe('PlatzhalterBild', () => {
  const item = itemFuer('kette');
  it('zeigt den Platzhalter, solange das Item nicht in bilder.json steht', () => {
    const html = renderToStaticMarkup(<PlatzhalterBild item={item} echte={new Set()} />);
    expect(html).toContain('data-testid="platzhalter-bild"');
    expect(html).not.toContain('<img');
    expect(html).not.toContain(item.wort);
  });
  it('zeigt das echte Bild (dekorativ, ohne Text) für gelistete Items', () => {
    const html = renderToStaticMarkup(<PlatzhalterBild item={item} echte={new Set(['kette'])} />);
    expect(html).toContain('<img');
    expect(html).toContain('bilder/kette.webp');
    expect(html).toContain('alt=""');
    expect(html).toContain('draggable="false"');
    expect(html).not.toContain('platzhalter-bild');
  });
});
