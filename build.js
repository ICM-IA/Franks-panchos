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

function build(srcFile, outFile, extra) {
  let html = fs.readFileSync(dir + '/' + srcFile, 'utf8');
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

build('inst.src.html', 'index.html', { COPA_URL });
build('copa.src.html', 'copa.html',  { INST_URL });
build('admin.src.html', 'admin.html', { INST_URL, COPA_URL });

// config.js se copia tal cual (el cliente lo edita con sus datos de Supabase)
fs.copyFileSync(dir + '/config.js', path.join(OUT, 'config.js'));
console.log('copied config.js');

console.log('\nListo -> carpeta', OUT);
