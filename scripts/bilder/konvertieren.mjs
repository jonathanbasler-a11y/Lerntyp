#!/usr/bin/env node
// Wandelt ComfyUI-PNGs (1024×1024) in 512×512-WebP um: apps/web/public/bilder/<id>.webp.
// Aufruf: npm run bilder:konvertieren -- art/ausgabe   (Ordner mit <id>.png; Dateien mit Zähler wie „kette_00001_.png“ werden erkannt)
// Voraussetzung: ffmpeg im PATH (Windows: `winget install ffmpeg`, danach neues Terminal).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(import.meta.url), '../../..');
const quelle = resolve(process.argv[2] ?? join(root, 'art/ausgabe'));
const ziel = join(root, 'apps/web/public/bilder');
const ffmpeg = process.env.FFMPEG_BIN ?? 'ffmpeg';

if (!existsSync(quelle)) {
  console.error(`Ordner nicht gefunden: ${quelle}`);
  process.exit(1);
}
const ids = new Set(JSON.parse(readFileSync(join(root, 'data/lerndetektive/experiment.json'), 'utf8')).items.map((i) => i.id));
mkdirSync(ziel, { recursive: true });

// Neueste Datei je Item gewinnt (bei „kette_00001_.png“, „kette_00002_.png“ die höchste Nummer).
const nachId = new Map();
for (const name of readdirSync(quelle).sort()) {
  const m = /^([a-z0-9]+(?:_[a-z0-9]+)*?)(?:_\d+_?)?\.png$/i.exec(name);
  if (!m) continue;
  const id = m[1].toLowerCase();
  if (ids.has(id)) nachId.set(id, name);
  else console.warn(`übersprungen (kein Item): ${name}`);
}

let n = 0;
for (const [id, name] of nachId) {
  try {
    execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-i', join(quelle, name), '-vf', 'scale=512:512:flags=lanczos', '-c:v', 'libwebp', '-quality', '85', join(ziel, `${id}.webp`)], { stdio: 'inherit' });
    n++;
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.error('ffmpeg nicht gefunden. Windows: `winget install ffmpeg`, dann ein neues Terminal öffnen.');
      process.exit(1);
    }
    throw e;
  }
}
console.log(`${n} Bilder nach apps/web/public/bilder/ geschrieben. Weiter mit: npm run bilder:pruefen`);
