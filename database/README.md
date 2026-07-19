# Model Data MineFiveID

Versi Netlify menyimpan data terstruktur di **Netlify Blobs** agar tidak membutuhkan server database terpisah. Saat development lokal, data yang sama disimpan pada `database/minefive.json`.

Entitas logis yang disimpan:

- `users` — akun, password hash, status, dan role (`user`, `admin`, `superadmin`).
- `products` — rank/produk, harga, diskon, benefit, badge, durasi, urutan, status aktif, dan command server.
- `orders` — ID pesanan unik, pembeli, platform, username, item, pembayaran, status, serta bukti transfer.
- `settings` — identitas server, IP/port, logo, QRIS, sosial, pengumuman, fitur, dan maintenance.
- `pluginJobs` — antrean command yang diambil MineFiveBridge.
- `serverStatus` — heartbeat, jumlah pemain, versi, MOTD, dan waktu heartbeat terakhir.
- `passwordResetTokens` — token reset yang disimpan dalam bentuk hash.
- `media` — metadata media yang berkasnya disimpan di Blob store terpisah.
- `adminActivityLogs` — audit tindakan admin.

Struktur ini dibuat agar API dan UI tetap dapat dimigrasikan ke PostgreSQL/MySQL di masa depan tanpa mengubah alur transaksi.
