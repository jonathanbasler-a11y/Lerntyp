// Erzeugt die originalen PWA-Icons (Lupe auf ruhigem Grün). Nur Node-Bordmittel.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const out = new URL('../apps/web/public/icons/', import.meta.url);
const BG = [47, 111, 115], FG = [244, 239, 230], ACC = [233, 180, 76];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function distSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function color(x, y) { // x,y in 0..1
  const d = Math.hypot(x - 0.45, y - 0.43);
  if (Math.abs(d - 0.2) < 0.045) return FG;               // Linsenring
  if (d < 0.2 && Math.hypot(x - 0.4, y - 0.38) < 0.05) return ACC; // Glanzpunkt
  if (distSeg(x, y, 0.6, 0.58, 0.78, 0.76) < 0.05) return FG;      // Griff
  return BG;
}
function png(size) {
  const ss = 3, rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < ss; sy++) for (let sx = 0; sx < ss; sx++) {
        const c = color((x + (sx + 0.5) / ss) / size, (y + (sy + 0.5) / ss) / size);
        r += c[0]; g += c[1]; b += c[2];
      }
      const n = ss * ss;
      row[1 + x * 3] = r / n; row[2 + x * 3] = g / n; row[3 + x * 3] = b / n;
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]);
}
for (const s of [192, 512]) writeFileSync(new URL(`icon-${s}.png`, out), png(s));
writeFileSync(new URL('icon.svg', out), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#2f6f73"/><circle cx="45" cy="43" r="20" fill="none" stroke="#f4efe6" stroke-width="9"/><circle cx="40" cy="38" r="5" fill="#e9b44c"/><line x1="60" y1="58" x2="78" y2="76" stroke="#f4efe6" stroke-width="10" stroke-linecap="round"/></svg>\n`);
