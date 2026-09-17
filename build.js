const fs = require('fs');
const path = require('path');
const dir = __dirname;
const assets = JSON.parse(fs.readFileSync(dir + '/assets.json', 'utf8'));

// Carpeta de salida lista para Vercel / GitHub
const OUT = path.join(dir, 'site');
fs.mkdirSync(OUT, { recursive: true });

// URLs relativas dentro del mismo sitio (Vercel)
const INST_URL = process.env.INST_URL || '/';
const COPA_URL = process.env.COPA_URL || '/copa.html';

// Cabecera mínima: sin esto el celular renderiza a ~980px y encoge todo
const HEAD =
  '<!DOCTYPE html>\n' +
  '<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  '<link rel="icon" type="image/png" href="/favicon.png">\n' +
  '<link rel="apple-touch-icon" href="/favicon.png">\n';

function build(srcFile, outFile, extra) {
  let html = HEAD + fs.readFileSync(dir + '/' + srcFile, 'utf8');
  const map = Object.assign({}, assets, extra);
  for (const k in map) {
    html = html.split('%%' + k + '%%').join(map[k]);
  }
  const leftover = html.match(/%%[A-Z0-9_]+%%/g);
  if (leftover) console.log('WARN leftover tokens in', outFile, [...new Set(leftover)]);
  const dest = path.join(OUT, outFile);
  fs.writeFileSync(dest, html);
  console.log('built', outFile, (fs.statSync(dest).size / 1024).toFixed(0) + 'kb');
}

// Copia de medios pesados (video del hero) como archivos reales, no base64
const MEDIA = path.join(dir, 'assets-media');
let HERO_VIDEO = '';
if (fs.existsSync(path.join(MEDIA, 'hero.mp4'))) {
  fs.copyFileSync(path.join(MEDIA, 'hero.mp4'), path.join(OUT, 'hero.mp4'));
  HERO_VIDEO = 'hero.mp4';
  console.log('copied hero.mp4', (fs.statSync(path.join(OUT, 'hero.mp4')).size / 1024 / 1024).toFixed(2) + 'MB');
}

// Favicon: emblema oficial Frank's (manual de marca) como archivo real en la raiz
if (fs.existsSync(path.join(MEDIA, 'favicon.png'))) {
  fs.copyFileSync(path.join(MEDIA, 'favicon.png'), path.join(OUT, 'favicon.png'));
  console.log('copied favicon.png', (fs.statSync(path.join(OUT, 'favicon.png')).size / 1024).toFixed(0) + 'kb');
}

// Logo de ICM-IA (footer) como archivo real, referenciado por URL relativa
let LOGO_ICM = '';
if (fs.existsSync(path.join(MEDIA, 'icm-ia.png'))) {
  fs.copyFileSync(path.join(MEDIA, 'icm-ia.png'), path.join(OUT, 'icm-ia.png'));
  LOGO_ICM = 'icm-ia.png';
  console.log('copied icm-ia.png', (fs.statSync(path.join(OUT, 'icm-ia.png')).size / 1024).toFixed(0) + 'kb');
}

build('inst.src.html', 'index.html', { COPA_URL, HERO_VIDEO, LOGO_ICM });
build('copa.src.html', 'copa.html',  { INST_URL, LOGO_ICM });
build('bases.src.html', 'bases.html', { INST_URL, COPA_URL, LOGO_ICM });
build('admin.src.html', 'admin.html', { INST_URL, COPA_URL });

// config.js se copia tal cual (el cliente lo edita con sus datos de Supabase)
fs.copyFileSync(dir + '/config.js', path.join(OUT, 'config.js'));
console.log('copied config.js');

console.log('\nListo -> carpeta', OUT);
