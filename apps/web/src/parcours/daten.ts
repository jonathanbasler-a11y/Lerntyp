import { KartenDatenSchema, S1DatenSchema, S2DatenSchema, S3DatenSchema, type ParcoursDaten } from '@lerntyp/shared';
import s1Roh from '@data/parcours/s1-wort-werkstatt.json';
import s2Roh from '@data/parcours/s2-satz-baukasten.json';
import s3Roh from '@data/parcours/s3-wuerfel-baumeister.json';
import kartenRoh from '@data/profil/karten.json';

/** Inhalte des Strategie-Parcours und der Profil-Bausteine, beim Start gegen die Schemas geprüft (Quelle: /data). */
export const parcoursDaten: ParcoursDaten = {
  s1: S1DatenSchema.parse(s1Roh),
  s2: S2DatenSchema.parse(s2Roh),
  s3: S3DatenSchema.parse(s3Roh),
};
export const kartenDaten = KartenDatenSchema.parse(kartenRoh);
