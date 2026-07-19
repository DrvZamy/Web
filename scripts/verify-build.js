const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const required = [
  'public/index.html',
  'public/app.js',
  'public/styles.css',
  'public/assets/minefive-logo.png',
  'public/assets/qris-minefive.jpg',
  'public/assets/gallery/gallery-01.webp',
  'public/assets/gallery/gallery-02.webp',
  'public/assets/gallery/gallery-03.webp',
  'public/assets/gallery/gallery-04.webp',
  'netlify/functions/api.js',
  'netlify.toml',
  'minecraft-plugin/target/MineFiveBridge-1.2.0.jar'
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error(`Build gagal. File tidak ditemukan: ${missing.join(', ')}`);
  process.exit(1);
}

for (const file of ['public/app.js', 'src/app.js', 'src/data-store.js']) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  if (/sk-mvx-[A-Za-z0-9_-]{20,}/.test(text)) {
    console.error(`Build dibatalkan: API key MinervaX terdeteksi di ${file}. Simpan key di Environment Variables.`);
    process.exit(1);
  }
}

const backend = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
for (const marker of ['/api/ai/chat', '/api/admin/gallery', '/api/plugin/heartbeat']) {
  if (!backend.includes(marker)) {
    console.error(`Build gagal: endpoint ${marker} tidak ditemukan.`);
    process.exit(1);
  }
}

console.log('MineFiveID V4 siap dideploy ke Netlify.');
