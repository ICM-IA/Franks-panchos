// Regenera assets.json leyendo la carpeta assets/ y convirtiendo a base64.
// Logos: franks-red/cream/black.png -> LOGO_RED / LOGO_CREAM / LOGO_BLACK
// Fotos: galeriaN.(jpg|jpeg|png) -> G{N}
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const aDir = path.join(dir, 'assets');

const mime = e => e === '.png' ? 'image/png'
  : (e === '.jpg' || e === '.jpeg') ? 'image/jpeg'
  : e === '.webp' ? 'image/webp' : 'application/octet-stream';

const toDataURI = f => {
  const ext = path.extname(f).toLowerCase();
  const b64 = fs.readFileSync(path.join(aDir, f)).toString('base64');
  return 'data:' + mime(ext) + ';base64,' + b64;
};

const out = {};
const logos = { 'franks-red': 'LOGO_RED', 'franks-cream': 'LOGO_CREAM', 'franks-black': 'LOGO_BLACK' };

for (const f of fs.readdirSync(aDir)) {
  const base = path.basename(f, path.extname(f)).toLowerCase();
  if (logos[base]) { out[logos[base]] = toDataURI(f); continue; }
  const m = base.match(/^galeria(\d+)$/);
  if (m) { out['G' + m[1]] = toDataURI(f); continue; }
}

fs.writeFileSync(path.join(dir, 'assets.json'), JSON.stringify(out, null, 0));
const keys = Object.keys(out).sort();
console.log('assets.json regenerado con', keys.length, 'assets:', keys.join(', '));
