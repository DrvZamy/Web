# MineFiveID V4 — Website, Store, AI, Galeri, Discord, dan Plugin Minecraft

Website resmi MineFiveID versi UI/UX V4 yang disiapkan untuk Netlify. Paket ini mencakup landing page responsif, store QRIS manual, akun pengguna, dashboard admin, galeri server, tema gelap/terang, MineFive Assistant, notifikasi Discord interaktif, status pemain, dan plugin `MineFiveBridge` untuk Paper 1.21.11.

## Fitur utama

- Desain baru yang responsif untuk HP, tablet, laptop, dan desktop.
- Hero sinematik, bento layout, galeri mosaik, scroll reveal, hover, parallax ringan, skeleton, toast, modal, dan transisi halaman.
- Tema gelap dan terang dengan pilihan yang disimpan pada perangkat pengguna.
- Home, Store, Detail Produk, Checkout, QRIS, Upload Bukti, Status Pesanan, Profil, dan Riwayat Pembelian.
- Dashboard admin untuk overview, produk/rank, transaksi, pengguna, galeri, media, dan pengaturan website.
- Galeri server memakai empat foto awal yang diberikan. Admin dapat menambah, mengganti, mengurutkan, memberi deskripsi, menandai unggulan, dan menghapus foto.
- MineFive Assistant memakai MinervaX melalui backend. AI dibatasi untuk menjawab topik MineFiveID saja.
- Status server menggabungkan heartbeat plugin dengan public ping Java dan Bedrock untuk `minefive.my.id:19011`.
- Discord Bot/Application dengan tombol Pending, Done/Berikan Rank, dan Cancel.
- Plugin Paper 1.21.11 mengambil antrean command rank dan mengirim heartbeat jumlah pemain.
- Data online memakai Netlify Blobs; data produk, pengguna, pesanan, dan galeri tidak disimpan hanya di frontend.

## File penting

- Website Netlify: seluruh folder proyek ini.
- Plugin siap pakai: `minecraft-plugin/target/MineFiveBridge-1.2.0.jar`.
- Akun admin awal: `ADMIN-LOGIN.txt`.
- Logo: `public/assets/minefive-logo.png`.
- QRIS: `public/assets/qris-minefive.jpg`.
- Foto awal: `public/assets/gallery/`.
- Konfigurasi environment: `.env.example`.
- Konfigurasi Netlify: `netlify.toml`.

## Akun superadmin awal

Data login ada di `ADMIN-LOGIN.txt`. Setelah login pertama, segera buka **Profil → Ganti Password**. Jangan mengunggah `ADMIN-LOGIN.txt` ke repository publik setelah website berhasil dipasang.

Database Netlify Blobs yang sudah pernah dibuat dari versi lama tidak otomatis menerima ulang akun bawaan. Pada kondisi tersebut, gunakan akun admin lama atau jalankan `npm run make-admin -- email@kamu.com superadmin` dengan kredensial Netlify yang sesuai.

## Preview di Acode

1. Ekstrak ZIP.
2. Buka folder proyek di Acode.
3. Buka `public/index.html`.
4. Tekan Preview.

Preview Acode menampilkan Home, Store, Galeri, tema, animasi, dan data demo. Login, dashboard admin, checkout, upload, Discord, status live, dan MineFive Assistant memerlukan Netlify Functions sehingga baru aktif setelah deployment penuh.

## Deployment Netlify

### Melalui GitHub atau GitLab

1. Upload seluruh isi proyek ke repository privat.
2. Pilih **Add new site → Import an existing project** di Netlify.
3. Pilih repository.
4. Tambahkan Environment Variables.
5. Deploy.

`netlify.toml` sudah mengatur:

```text
Build command : npm run build
Publish folder: public
Functions     : netlify/functions
Node          : 22
```

Drag-and-drop folder `public` saja hanya menghasilkan website statis. Backend, akun, database, AI, admin, Discord, dan plugin API memerlukan deployment seluruh proyek.

### Melalui Netlify CLI

```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --build --prod
```

## Environment Variables wajib

Buka **Site configuration → Environment variables** dan isi:

```env
APP_URL=https://domain-kamu.netlify.app
ADMIN_WHATSAPP=6283830287126
JWT_SECRET=SECRET_ACAK_PANJANG_1
CSRF_SECRET=SECRET_ACAK_PANJANG_2
PLUGIN_API_KEY=SECRET_ACAK_PANJANG_3
PLUGIN_SERVER_ID=minefive-main
NETLIFY_DATA_STORE=minefive-data
NETLIFY_FILE_STORE=minefive-files
```

Buat secret acak:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Gunakan nilai berbeda untuk setiap secret.

## MineFive Assistant — MinervaX Opus 4.8

Tambahkan Environment Variables berikut di Netlify:

```env
MINERVAX_API_KEY=ISI_API_KEY_MINERVAX_KAMU
MINERVAX_BASE_URL=https://ai.minervax.dev
MINERVAX_MODEL=mvx/claude-opus-4-8
MINERVAX_API_STYLE=auto
```

API key hanya dibaca oleh Netlify Function dan tidak dikirim ke browser. Jangan menaruh API key pada `public/app.js`, HTML, repository, atau file yang dapat diunduh publik.

Pembatasan AI diterapkan dua lapis:

1. Filter lokal menolak pertanyaan yang tidak berkaitan dengan MineFiveID sebelum request AI dikirim.
2. System prompt mewajibkan AI memakai data server, produk, status, fitur, dan FAQ dari database serta menolak topik di luar MineFiveID.

Admin dapat mengatur status aktif AI, pesan pembuka, aturan tambahan, dan FAQ dari **Dashboard Admin → Pengaturan Website**.

## Status server dan jumlah pemain

Website memakai tiga sumber:

1. Public ping Java untuk `minefive.my.id`.
2. Public ping Bedrock untuk `minefive.my.id:19011`.
3. Heartbeat langsung dari plugin `MineFiveBridge`.

Website memilih data online yang paling relevan dan mengambil jumlah pemain tertinggi dari public ping serta heartbeat plugin. Hasil public ping di-cache singkat oleh aplikasi untuk mengurangi request. Apabila public ping gagal, website otomatis memakai heartbeat plugin. Apabila keduanya belum tersedia, tampilan fallback tetap rapi.

Untuk mematikan public ping dan hanya memakai plugin:

```env
DISABLE_PUBLIC_SERVER_PING=true
```

## Alur transaksi

1. Pemain register/login dan memilih produk.
2. Pemain memilih Java atau Bedrock, memasukkan username Minecraft, dan nomor WhatsApp.
3. Username Java tetap tanpa titik. Username Bedrock otomatis diberi titik di depan, contoh `.AzzamHD`.
4. Sistem membuat ID seperti `MF-20260719-0001` dan menampilkan QRIS.
5. Pemain mengunggah bukti JPG, PNG, atau WEBP maksimal 4 MB.
6. Detail dan bukti dikirim ke Discord.
7. Admin memilih Pending, Done/Berikan Rank, atau Cancel.
8. Saat disetujui, command produk masuk antrean plugin.
9. Plugin menjalankan command melalui console dan mengirim hasilnya kembali ke website.

## Placeholder command produk

Atur di **Dashboard Admin → Produk & Rank**. Satu command per baris tanpa `/`.

```text
%player% atau %username% — username yang sudah dinormalisasi
%order_id%              — ID transaksi
%product%               — nama produk
%platform%              — java atau bedrock
%duration%              — durasi produk
%uuid%                  — disiapkan untuk integrasi berikutnya
```

Contoh:

```text
lp user %player% parent addtemp five 30d
crate key give %player% vote 3
```

## Discord Application dan tombol transaksi

Isi Environment Variables:

```env
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=
DISCORD_APPLICATION_ID=
DISCORD_PUBLIC_KEY=
DISCORD_ADMIN_ROLE_IDS=
```

Setelah website online, isi **Interactions Endpoint URL** pada Discord Application:

```text
https://DOMAIN-KAMU/api/discord/interactions
```

Berikan bot izin View Channel, Send Messages, Embed Links, dan Attach Files. Webhook biasa tidak cukup untuk memverifikasi klik tombol; gunakan Discord Application/Bot.

## Instalasi plugin Paper 1.21.11

Gunakan:

```text
minecraft-plugin/target/MineFiveBridge-1.2.0.jar
```

Langkah:

1. Jalankan Paper 1.21.11 dengan Java 21.
2. Masukkan JAR ke folder `plugins/`.
3. Jalankan server sekali.
4. Edit `plugins/MineFiveBridge/config.yml`:

```yaml
api-base-url: "https://DOMAIN-WEBSITE-KAMU"
api-key: "SAMA_DENGAN_PLUGIN_API_KEY_DI_NETLIFY"
server-id: "minefive-main"
poll-interval-seconds: 5
heartbeat-interval-seconds: 20
http-timeout-seconds: 15
log-commands: true
```

5. Restart server atau jalankan:

```text
/minefivebridge reload
/minefivebridge status
```

Plugin hanya membuka koneksi HTTPS keluar menuju website dan tidak membutuhkan RCON atau port tambahan.

### Build ulang plugin

```bash
npm run build-plugin
```

Atau:

```bash
cd minecraft-plugin
mvn clean package
```

Output: `minecraft-plugin/target/MineFiveBridge-1.2.0.jar`.

## Development lokal

```bash
cp .env.example .env
npm install
npm run dev
```

Buka `http://localhost:3000`.

Saat lokal, data berada di `database/minefive.json` dan upload berada di `uploads/`. Saat Netlify, data dan file memakai Netlify Blobs.

## Keamanan

- Password memakai bcrypt.
- JWT berada pada cookie HttpOnly dan Secure di production.
- Request perubahan data memakai CSRF protection.
- Role admin diperiksa pada backend, bukan sekadar menyembunyikan menu.
- Login, register, upload, dan AI memiliki rate limit.
- Input divalidasi dan disanitasi.
- Upload dibatasi tipe dan ukuran.
- Discord interactions diverifikasi dengan signature Ed25519.
- Plugin memakai Bearer API key dan perbandingan konstan.
- API key AI, token Discord, dan secret aplikasi hanya disimpan sebagai Environment Variables.
- Build akan gagal apabila pola API key MinervaX terdeteksi di source frontend/backend utama.

## Catatan

- Pembayaran saat ini menggunakan QRIS statis dan verifikasi manual.
- Periksa nominal serta bukti sebelum memberi rank.
- Struktur dapat dikembangkan ke payment gateway otomatis menggunakan webhook provider yang diverifikasi.
