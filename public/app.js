'use strict';

const state = {
  bootstrap: null,
  user: null,
  adminCache: {},
  lastOrder: null,
  aiHistory: [],
  aiOpen: false
};

const app = document.querySelector('#app');
const header = document.querySelector('#site-header');
const footer = document.querySelector('#site-footer');
const toastRoot = document.querySelector('#toast-root');
const modalRoot = document.querySelector('#modal-root');

const savedTheme = localStorage.getItem('mf-theme');
const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.dataset.theme = initialTheme;

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('mf-theme', next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = next === 'light' ? '#f3f4ef' : '#070908';
  document.querySelectorAll('[data-theme-icon]').forEach((node) => { node.textContent = next === 'light' ? '☾' : '☀'; });
}


// Acode hanya menjalankan file statis dan tidak menyalakan Netlify Functions.
// Mode preview ini memastikan tampilan tetap bisa dibuka dari /public/index.html
// tanpa mengubah perilaku website ketika sudah dideploy ke Netlify.
const isAcodePreview = location.protocol === 'file:'
  || ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') && location.pathname.includes('/public/'));

const previewPublicBase = (() => {
  if (!isAcodePreview) return '';
  const marker = '/public/';
  const index = location.pathname.indexOf(marker);
  return index >= 0 ? `${location.pathname.slice(0, index)}/public` : '.';
})();

function publicAsset(value) {
  const path = String(value || '');
  if (!isAcodePreview || !path.startsWith('/assets/')) return path;
  return `${previewPublicBase}${path}`;
}

function createPreviewBootstrap() {
  const products = [
    {
      id: 1,
      slug: 'rank-five',
      name: 'Rank Five',
      iconUrl: '✦',
      imageUrl: '',
      normalPrice: 35000,
      salePrice: 29900,
      finalPrice: 29900,
      discountPercent: 15,
      description: 'Rank premium awal untuk pemain yang ingin mendapat kenyamanan tambahan.',
      duration: '30 Hari',
      badge: 'Rekomendasi',
      active: true,
      sortOrder: 1,
      commands: ['lp user %player% parent addtemp five 30d'],
      benefits: ['Prefix eksklusif', 'Akses /hat', 'Tambahan homes', 'Bonus key rank']
    },
    {
      id: 2,
      slug: 'rank-legend',
      name: 'Rank Legend',
      iconUrl: '◆',
      imageUrl: '',
      normalPrice: 65000,
      salePrice: 55000,
      finalPrice: 55000,
      discountPercent: 15,
      description: 'Rank premium dengan benefit lebih lengkap untuk petualanganmu.',
      duration: '30 Hari',
      badge: 'Terlaris',
      active: true,
      sortOrder: 2,
      commands: ['lp user %player% parent addtemp legend 30d'],
      benefits: ['Semua benefit Rank Five', 'Tambahan claim', 'Akses efek kosmetik', 'Bonus balance']
    },
    {
      id: 3,
      slug: 'rank-mythic',
      name: 'Rank Mythic',
      iconUrl: '♛',
      imageUrl: '',
      normalPrice: 110000,
      salePrice: 89000,
      finalPrice: 89000,
      discountPercent: 19,
      description: 'Paket premium tertinggi dengan benefit maksimal.',
      duration: '30 Hari',
      badge: 'Promo',
      active: true,
      sortOrder: 3,
      commands: ['lp user %player% parent addtemp mythic 30d'],
      benefits: ['Semua benefit Legend', 'Prioritas antrean', 'Lebih banyak homes dan claim', 'Bonus key eksklusif']
    }
  ];

  return {
    settings: {
      serverName: 'MineFiveID',
      serverIp: 'minefive.my.id',
      serverPort: '19011',
      serverDescription: 'MineFiveID adalah server Minecraft Survival Economy yang ringan dan nyaman dimainkan bersama teman-teman.',
      discordUrl: '#',
      whatsappUrl: 'https://wa.me/6283830287126',
      rulesUrl: '#',
      announcement: 'Selamat datang di MineFiveID!',
      maintenanceStore: false,
      logoUrl: publicAsset('/assets/minefive-logo.png'),
      qrisUrl: publicAsset('/assets/qris-minefive.jpg'),
      backgroundUrl: publicAsset('/assets/gallery/gallery-04.webp'),
      aiEnabled: true,
      aiWelcome: 'Halo! Saya asisten MineFiveID. Tanyakan cara join, fitur server, rank, pembayaran, atau status server.',
      aiFaq: [],
      adminWhatsApp: '6283830287126',
      features: [
        { title: 'Survival Economy', description: 'Bangun, berdagang, dan berkembang dalam ekonomi yang seimbang.', icon: '⛏' },
        { title: 'Java & Bedrock', description: 'Main bareng dari Java Edition maupun Bedrock Edition.', icon: '▣' },
        { title: 'Rank Premium', description: 'Benefit menarik tanpa merusak pengalaman survival.', icon: '✦' },
        { title: 'Event Komunitas', description: 'Event rutin, hadiah, dan aktivitas bersama pemain lain.', icon: '⚑' },
        { title: 'Vote Reward', description: 'Dapatkan hadiah setiap kali membantu vote server.', icon: '✓' },
        { title: 'Custom Features', description: 'Item dan fitur tambahan yang membuat gameplay lebih seru.', icon: '◆' }
      ]
    },
    status: {
      online: true,
      playersOnline: 32,
      playersMax: 100,
      version: '1.21.11',
      motd: 'MineFiveID Survival Economy',
      source: 'preview'
    },
    gallery: [
      { id: 1, title: 'Petualangan di Laut', description: 'Momen pemain MineFiveID menjelajah dunia dengan kosmetik eksklusif.', imageUrl: publicAsset('/assets/gallery/gallery-01.webp'), sortOrder: 1, featured: true },
      { id: 2, title: 'Komunitas MineFiveID', description: 'Aktivitas komunitas dan momen seru bersama pemain lain.', imageUrl: publicAsset('/assets/gallery/gallery-02.webp'), sortOrder: 2, featured: false },
      { id: 3, title: 'Foto Bersama', description: 'Kenangan komunitas MineFiveID yang tumbuh bersama.', imageUrl: publicAsset('/assets/gallery/gallery-03.webp'), sortOrder: 3, featured: false },
      { id: 4, title: 'Dunia Survival Economy', description: 'Suasana dunia MineFiveID yang nyaman untuk bermain santai.', imageUrl: publicAsset('/assets/gallery/gallery-04.webp'), sortOrder: 4, featured: true }
    ],
    products,
    user: null,
    orderStatuses: Object.keys(statusLabels)
  };
}

function normalizeBootstrapAssets(data) {
  if (!data || !data.settings) return data;
  data.settings.logoUrl = publicAsset(data.settings.logoUrl || '/assets/minefive-logo.png');
  data.settings.qrisUrl = publicAsset(data.settings.qrisUrl || '/assets/qris-minefive.jpg');
  data.settings.backgroundUrl = publicAsset(data.settings.backgroundUrl || '');
  data.products = (data.products || []).map((product) => ({
    ...product,
    imageUrl: publicAsset(product.imageUrl || '')
  }));
  data.gallery = (data.gallery || []).map((item) => ({ ...item, imageUrl: publicAsset(item.imageUrl || '') }));
  return data;
}

const statusLabels = {
  MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
  MENUNGGU_VERIFIKASI: 'Menunggu Verifikasi',
  PEMBAYARAN_DITERIMA: 'Pembayaran Diterima',
  PESANAN_DIPROSES: 'Pesanan Diproses',
  PESANAN_SELESAI: 'Pesanan Selesai',
  PEMBAYARAN_DITOLAK: 'Pembayaran Ditolak',
  PESANAN_DIBATALKAN: 'Pesanan Dibatalkan'
};

const statusOrder = [
  'MENUNGGU_PEMBAYARAN',
  'MENUNGGU_VERIFIKASI',
  'PEMBAYARAN_DITERIMA',
  'PESANAN_DIPROSES',
  'PESANAN_SELESAI'
];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function rupiah(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount || 0));
}

function dateTime(value) {
  if (!value) return '-';
  const parsed = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed);
}

function getCookie(name) {
  const item = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.split('=').slice(1).join('=')) : '';
}

async function api(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();

  if (isAcodePreview && String(url).startsWith('/api/')) {
    const preview = createPreviewBootstrap();
    if (method === 'GET' && url === '/api/public/bootstrap') return preview;
    if (method === 'GET' && url === '/api/server-status') return preview.status;
    if (method === 'GET' && url.startsWith('/api/products/')) {
      const slug = decodeURIComponent(url.split('/').pop() || '');
      const product = preview.products.find((item) => item.slug === slug);
      if (product) return { product };
      const error = new Error('Produk preview tidak ditemukan.');
      error.status = 404;
      throw error;
    }
    throw new Error('Fitur akun, checkout, upload, dan dashboard memerlukan Netlify Functions. Deploy proyek ke Netlify untuk mengujinya.');
  }

  const config = { credentials: 'same-origin', ...options, headers: { ...(options.headers || {}) } };
  const isFormData = options.body instanceof FormData;
  if (options.body && !isFormData && typeof options.body !== 'string') {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }
  if (!['GET', 'HEAD'].includes(String(config.method || 'GET').toUpperCase())) {
    config.headers['X-CSRF-Token'] = getCookie('mf_csrf');
  }
  const response = await fetch(url, config);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const error = new Error(data?.error || `Permintaan gagal (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function toast(message, type = 'success', title = type === 'error' ? 'Terjadi kesalahan' : 'Berhasil') {
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.innerHTML = `<span>${type === 'error' ? '!' : '✓'}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
  toastRoot.appendChild(node);
  setTimeout(() => node.remove(), 4300);
}

function showModal(content, wide = false) {
  modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><div class="modal ${wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true">${content}</div></div>`;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalRoot.innerHTML = '';
  document.body.style.overflow = '';
}

function routeTo(path) {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}

function currentRoute() {
  const raw = window.location.hash.slice(1) || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path.startsWith('/') ? path : `/${path}`, params: new URLSearchParams(query) };
}

function isAdmin() {
  return ['admin', 'superadmin'].includes(state.user?.role);
}

function activeClass(prefix) {
  const route = currentRoute().path;
  return route === prefix || route.startsWith(`${prefix}/`) ? 'active' : '';
}

function renderHeader() {
  const s = state.bootstrap?.settings || {};
  const online = state.bootstrap?.status?.online;
  const themeIcon = currentTheme() === 'light' ? '☾' : '☀';
  header.innerHTML = `
    <nav class="navbar">
      <a class="brand" href="#/" aria-label="MineFiveID Home">
        <span class="brand-mark"><img src="${escapeHtml(s.logoUrl || '/assets/minefive-logo.png')}" alt="Logo MineFiveID" /></span>
        <span>${escapeHtml(s.serverName || 'MineFiveID')}<small>Survival Economy</small></span>
      </a>
      <div class="nav-links" id="nav-links">
        <a class="nav-link ${activeClass('/')}" href="#/">Home</a>
        <a class="nav-link ${activeClass('/gallery')}" href="#/gallery">Galeri</a>
        <a class="nav-link ${activeClass('/store')}" href="#/store">Store</a>
        ${state.user ? `<a class="nav-link ${activeClass('/history')}" href="#/history">Pesanan</a>` : ''}
        ${isAdmin() ? `<a class="nav-link ${activeClass('/admin')}" href="#/admin">Admin</a>` : ''}
      </div>
      <div class="nav-actions">
        <span class="live-mini hide-mobile"><span class="dot" style="background:${online ? 'var(--green)' : 'var(--red)'}"></span>${online ? `${state.bootstrap.status.playersOnline} online` : 'checking'}</span>
        <button class="icon-button" data-action="toggle-theme" aria-label="Ganti tema" title="Ganti tema"><span data-theme-icon>${themeIcon}</span></button>
        <button class="icon-button mobile-toggle" data-action="toggle-menu" aria-label="Buka navigasi">☰</button>
        ${state.user
          ? `<a class="btn btn-sm hide-mobile" href="#/profile">${escapeHtml(state.user.displayName)}</a><button class="btn btn-sm hide-mobile" data-action="logout">Logout</button>`
          : `<a class="btn btn-sm hide-mobile" href="#/login">Login</a><a class="btn btn-primary btn-sm" href="#/register">Register</a>`}
      </div>
    </nav>`;
}

function renderFooter() {
  const s = state.bootstrap?.settings || {};
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-cta fade-up">
        <div><span class="eyebrow">Siap bermain?</span><h2>Masuk ke MineFiveID hari ini.</h2><p>Survival Economy yang santai, crossplay, dan nyaman dimainkan bersama teman.</p></div>
        <div class="button-row"><button class="btn btn-primary" data-action="copy-ip">Copy IP</button><a class="btn" href="#/store">Buka Store</a></div>
      </div>
      <div class="footer-grid">
        <div>
          <a class="brand" href="#/"><span class="brand-mark"><img src="${escapeHtml(s.logoUrl || '/assets/minefive-logo.png')}" alt="Logo" /></span><span>${escapeHtml(s.serverName || 'MineFiveID')}<small>Java & Bedrock</small></span></a>
          <p class="footer-copy">${escapeHtml(s.serverDescription || '')}</p>
          <div class="server-address"><span>${escapeHtml(s.serverIp || '')}</span><small>Bedrock ${escapeHtml(s.serverPort || '')}</small><button data-action="copy-ip" aria-label="Salin IP">↗</button></div>
        </div>
        <div><div class="footer-title">Navigasi</div><div class="footer-links"><a href="#/">Home</a><a href="#/gallery">Galeri</a><a href="#/store">Store</a><a href="#/history">Riwayat Pembelian</a></div></div>
        <div><div class="footer-title">Bantuan</div><div class="footer-links"><a href="${escapeHtml(s.discordUrl || '#')}" target="_blank" rel="noopener">Discord</a><a href="${escapeHtml(s.whatsappUrl || '#')}" target="_blank" rel="noopener">WhatsApp</a><a href="${escapeHtml(s.rulesUrl || '#')}" target="_blank" rel="noopener">Peraturan</a><a href="#/order-status">Cek Pesanan</a></div></div>
      </div>
      <div class="footer-bottom"><span>© ${new Date().getFullYear()} MineFiveID.</span><span>Java & Bedrock • Survival Economy</span></div>
    </div>`;
}

function statusChip(status) {
  const danger = ['PEMBAYARAN_DITOLAK', 'PESANAN_DIBATALKAN'].includes(status);
  const success = ['PEMBAYARAN_DITERIMA', 'PESANAN_DIPROSES', 'PESANAN_SELESAI'].includes(status);
  return `<span class="status-chip ${danger ? 'danger' : success ? 'success' : ''}">${escapeHtml(statusLabels[status] || status)}</span>`;
}

function productCard(product, index = 0) {
  const icon = product.imageUrl
    ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}">`
    : escapeHtml(product.iconUrl || '✦');
  const productCode = `MF / ${String(index + 1).padStart(2, '0')}`;
  return `
    <article class="card product-card fade-up tilt-card" style="--delay:${Math.min(index * 70, 350)}ms">
      <div class="product-top"><div><div class="product-code">${productCode}</div><div class="product-icon" style="margin-top:12px">${icon}</div></div>${product.badge ? `<span class="badge">${escapeHtml(product.badge)}</span>` : ''}</div>
      <h3 style="font-size:1.45rem;margin-top:20px">${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description)}</p>
      <div class="price"><strong>${rupiah(product.finalPrice)}</strong>${product.salePrice != null ? `<del>${rupiah(product.normalPrice)}</del><span class="discount">-${product.discountPercent}%</span>` : ''}</div>
      <ul class="benefits">${product.benefits.slice(0, 4).map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul>
      <div class="product-actions"><a class="btn btn-primary" href="#/checkout/${encodeURIComponent(product.slug)}">Beli Sekarang</a><a class="btn" href="#/product/${encodeURIComponent(product.slug)}">Detail</a></div>
    </article>`;
}

function galleryCard(item, index = 0, compact = false) {
  return `<article class="gallery-card ${compact ? 'compact' : ''} fade-up" style="--delay:${Math.min(index * 80, 320)}ms" data-action="open-gallery" data-id="${item.id}" tabindex="0">
    <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy">
    <div class="gallery-overlay"><span>${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || '')}</p></div><b>↗</b></div>
  </article>`;
}

function renderHome() {
  const { settings: s, status, products, gallery = [] } = state.bootstrap;
  const online = status.online;
  const serverVersion = String(status.version || '-').replace(/^Paper\s*/i, '');
  const heroImage = s.backgroundUrl || gallery.find((x) => x.featured)?.imageUrl || gallery[0]?.imageUrl || publicAsset('/assets/gallery/gallery-04.webp');
  const marqueeItems = ['Survival Economy', 'Java & Bedrock', 'Community First', 'Vote Rewards', 'Custom Features', 'Premium Ranks'];
  const marquee = [...marqueeItems, ...marqueeItems].map((item) => `<span><i></i>${escapeHtml(item)}</span>`).join('');
  const previewGallery = gallery.slice(0, 4);
  app.innerHTML = `
    <div class="home-page">
      <section class="cinematic-hero" style="--hero-image:url('${escapeHtml(heroImage)}')">
        <div class="hero-image-layer" aria-hidden="true"></div><div class="hero-grid-lines" aria-hidden="true"></div>
        <div class="hero-content page-shell">
          <div class="hero-copy-wrap">
            <div class="hero-kicker"><span class="dot" style="background:${online ? 'var(--green)' : 'var(--red)'}"></span><span>${online ? 'Server Online' : 'Status Diperbarui'}</span><em>${status.playersOnline || 0} pemain</em></div>
            <h1><span>Tempat pulang</span><strong>para survivor.</strong></h1>
            <p>${escapeHtml(s.serverDescription)} Nikmati progres yang terasa, ekonomi yang hidup, dan komunitas yang seru tanpa harus bermain terburu-buru.</p>
            <div class="hero-actions"><button class="btn btn-primary btn-lg" data-action="copy-ip">Main Sekarang <span>↗</span></button><a class="btn btn-lg glass-btn" href="#/store">Kunjungi Store</a></div>
          </div>
          <div class="hero-data-panel fade-up">
            <div class="hero-data-head"><span>LIVE SERVER</span><b class="status-chip ${online ? 'success' : 'danger'}">${online ? 'ONLINE' : 'CHECKING'}</b></div>
            <button class="ip-command" data-action="copy-ip"><span><small>SERVER ADDRESS</small><strong>${escapeHtml(s.serverIp)}</strong></span><b>Copy</b></button>
            <div class="hero-data-grid"><div><small>PLAYERS</small><strong data-count="${Number(status.playersOnline || 0)}">${status.playersOnline || 0}</strong><span>/ ${status.playersMax || '?'}</span></div><div><small>VERSION</small><strong>${escapeHtml(serverVersion)}</strong></div><div><small>BEDROCK</small><strong>${escapeHtml(s.serverPort)}</strong></div><div><small>CROSSPLAY</small><strong>READY</strong></div></div>
          </div>
        </div>
        <a class="scroll-cue" href="#features" aria-label="Scroll ke fitur"><span></span>Explore</a>
      </section>

      <div class="marquee-shell"><div class="marquee-track">${marquee}</div></div>

      <div class="page-shell content-shell">
        <section id="features" class="section intro-section"><div class="section-number">01</div><div class="section-heading"><span class="eyebrow">Tentang MineFiveID</span><h2>Server yang dibuat untuk <em>dimainkan</em>, bukan sekadar dipandang.</h2></div><div class="intro-copy"><p>Mulai dengan mudah, bangun ekonomi, kumpulkan item, ikuti event, dan buat cerita bersama pemain lain.</p><a href="#/gallery">Lihat kehidupan server <span>↗</span></a></div></section>

        <section class="feature-bento section">${(s.features || []).map((f, index) => `<article class="feature-card fade-up ${index === 0 || index === 5 ? 'wide' : ''}" style="--delay:${index * 60}ms"><span class="feature-index">${String(index + 1).padStart(2, '0')}</span><div class="feature-symbol">${escapeHtml(f.icon || '◆')}</div><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.description)}</p></article>`).join('')}</section>

        <section class="section gallery-preview"><div class="section-heading split"><div><span class="eyebrow">Galeri Server</span><h2>Momen nyata dari dunia MineFiveID.</h2></div><a class="text-link" href="#/gallery">Lihat semua foto ↗</a></div>${previewGallery.length ? `<div class="gallery-mosaic">${previewGallery.map((item,index)=>galleryCard(item,index,true)).join('')}</div>` : emptyState('Galeri belum tersedia','Admin belum menambahkan foto server.')}</section>

        <section class="section status-experience"><div class="status-visual" style="background-image:url('${escapeHtml(gallery[0]?.imageUrl || heroImage)}')"><div class="status-visual-label"><span class="dot"></span> LIVE WORLD</div></div><div class="status-content"><span class="eyebrow">Status Server</span><h2>${online ? 'Dunia sedang aktif.' : 'Status sedang diperbarui.'}</h2><p>${online ? `${status.playersOnline} pemain sedang berada di MineFiveID. Bergabung dan mulai progresmu sekarang.` : 'Bridge dan public ping sedang melakukan sinkronisasi data terbaru.'}</p><div class="status-list"><div><span>Pemain Online</span><strong>${status.playersOnline || 0}</strong></div><div><span>Maksimal Pemain</span><strong>${status.playersMax || '-'}</strong></div><div><span>Versi Minecraft</span><strong>${escapeHtml(serverVersion)}</strong></div><div><span>Bedrock Port</span><strong>${escapeHtml(s.serverPort)}</strong></div></div><button class="btn btn-primary" data-action="copy-ip">Salin IP Server</button></div></section>

        <section class="section join-section"><div class="section-heading center"><span class="eyebrow">Cara Bergabung</span><h2>Empat langkah, lalu petualangan dimulai.</h2></div><div class="join-tabs"><article class="join-card fade-up"><div class="join-label"><span>JAVA</span><b>01</b></div><ol><li>Buka Minecraft Java Edition.</li><li>Masuk ke menu Multiplayer.</li><li>Pilih Add Server.</li><li>Masukkan <strong>${escapeHtml(s.serverIp)}</strong>.</li></ol><button class="btn" data-action="copy-ip">Copy Java IP</button></article><article class="join-card fade-up"><div class="join-label"><span>BEDROCK</span><b>02</b></div><ol><li>Buka Minecraft Bedrock Edition.</li><li>Pilih menu Server.</li><li>Tambahkan server baru.</li><li>IP <strong>${escapeHtml(s.serverIp)}</strong>, port <strong>${escapeHtml(s.serverPort)}</strong>.</li></ol><button class="btn" data-action="copy-bedrock">Copy IP + Port</button></article></div></section>

        <section class="section store-preview"><div class="section-heading split"><div><span class="eyebrow">MineFiveID Store</span><h2>Benefit tambahan, tanpa merusak survival.</h2></div><a class="text-link" href="#/store">Semua produk ↗</a></div><div class="grid grid-3">${products.slice(0,3).map((product,index)=>productCard(product,index)).join('')}</div></section>
      </div>
    </div>`;
}

function renderGallery() {
  const gallery = state.bootstrap.gallery || [];
  app.innerHTML = `<div class="page-shell"><div class="page-title gallery-title"><div class="breadcrumb">Home / Galeri</div><span class="eyebrow">MineFiveID Gallery</span><h1>Dunia kami,<br><em>dari sudut pemain.</em></h1><p>Kumpulan momen, bangunan, event, dan perjalanan komunitas MineFiveID.</p></div>${gallery.length ? `<div class="gallery-full-grid">${gallery.map((item,index)=>galleryCard(item,index)).join('')}</div>` : emptyState('Galeri belum tersedia','Admin belum menambahkan foto server.')}</div>`;
}

function renderStore() {
  const { settings: s, products } = state.bootstrap;
  if (s.maintenanceStore && !isAdmin()) return renderMaintenance();
  app.innerHTML = `<div class="page-shell"><div class="page-title"><div class="breadcrumb">Home / Store</div><span class="eyebrow">MineFiveID Store</span><h1>Rank dan produk server.</h1><p>Pilih produk, masukkan username Minecraft, bayar melalui QRIS, lalu pantau prosesnya dari akunmu.</p></div>${products.length ? `<div class="grid grid-3">${products.map((product, index) => productCard(product, index)).join('')}</div>` : emptyState('Produk belum tersedia','Admin belum menambahkan produk aktif.')}</div>`;
}

async function renderProduct(slug) {
  app.innerHTML = loadingPage();
  const { product } = await api(`/api/products/${encodeURIComponent(slug)}`);
  const icon = product.imageUrl ? `<img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}">` : escapeHtml(product.iconUrl || '✦');
  app.innerHTML = `<div class="page-shell"><div class="breadcrumb">Home / Store / ${escapeHtml(product.name)}</div><div class="checkout-layout"><article class="card"><div class="product-top"><div class="product-icon" style="width:90px;height:90px;font-size:2.5rem">${icon}</div>${product.badge ? `<span class="badge">${escapeHtml(product.badge)}</span>` : ''}</div><h1 style="font-size:clamp(2.8rem,7vw,5rem);margin-top:25px">${escapeHtml(product.name)}</h1><p class="hero-copy">${escapeHtml(product.description)}</p><h3 style="margin-top:30px">Benefit Rank</h3><ul class="benefits">${product.benefits.map((x) => `<li>${escapeHtml(x)}</li>`).join('')}</ul></article><aside class="card sticky-card"><span class="eyebrow">Ringkasan Produk</span><div class="price"><strong>${rupiah(product.finalPrice)}</strong>${product.salePrice != null ? `<del>${rupiah(product.normalPrice)}</del>` : ''}</div><div class="summary-row"><span>Durasi</span><strong>${escapeHtml(product.duration)}</strong></div><div class="summary-row"><span>Status</span><strong>${product.active ? 'Tersedia' : 'Tidak tersedia'}</strong></div><a class="btn btn-primary btn-block" style="margin-top:20px" href="#/checkout/${encodeURIComponent(product.slug)}">Beli Sekarang</a><a class="btn btn-block" style="margin-top:9px" href="#/store">Kembali ke Store</a></aside></div></div>`;
}

async function renderCheckout(slug) {
  if (!state.user) {
    routeTo(`/login?redirect=${encodeURIComponent(`/checkout/${slug}`)}`);
    return;
  }
  app.innerHTML = loadingPage();
  const { product } = await api(`/api/products/${encodeURIComponent(slug)}`);
  app.innerHTML = `<div class="page-shell"><div class="page-title"><div class="breadcrumb">Store / Checkout</div><span class="eyebrow">Checkout Aman</span><h1>Lengkapi data pemain.</h1><p>Username Bedrock otomatis diberi tanda titik di depan. Username Java tidak menggunakan tanda titik.</p></div><div class="checkout-layout"><form id="checkout-form" class="card"><div class="form-group"><label>Username Minecraft</label><input class="input" name="minecraftUsername" placeholder="Contoh: AzzamHD" minlength="3" maxlength="32" required><span class="help" id="username-preview">Nama yang dikirim ke server akan tampil di sini.</span></div><div class="form-group"><label>Platform</label><div class="platform-options"><label class="radio-card"><input type="radio" name="platform" value="java" checked><strong>Java Edition</strong><p>Username tanpa titik di depan.</p></label><label class="radio-card"><input type="radio" name="platform" value="bedrock"><strong>Bedrock Edition</strong><p>Otomatis menjadi .Username</p></label></div></div><div class="form-group"><label>Nomor WhatsApp</label><input class="input" name="whatsapp" value="${escapeHtml(state.user.whatsapp || '')}" placeholder="08xxxxxxxxxx" required><span class="help">Digunakan untuk konfirmasi transaksi dan menghubungi admin.</span></div><label style="display:flex;gap:10px;align-items:flex-start;color:var(--muted);font-size:.88rem"><input type="checkbox" required style="margin-top:4px"> Saya memastikan username, platform, dan nomor WhatsApp sudah benar.</label><button class="btn btn-primary btn-block" style="margin-top:22px" type="submit">Lanjut ke Pembayaran QRIS</button></form><aside class="card sticky-card"><span class="eyebrow">Ringkasan Pesanan</span><h2 style="margin:18px 0 8px">${escapeHtml(product.name)}</h2><p>${escapeHtml(product.duration)}</p><div class="summary-row total"><span>Total</span><strong>${rupiah(product.finalPrice)}</strong></div><p class="help" style="margin-top:14px">Pembayaran diverifikasi manual oleh admin. Setelah diterima, plugin akan menjalankan command rank yang sudah diatur pada produk.</p></aside></div></div>`;

  const form = document.querySelector('#checkout-form');
  const preview = document.querySelector('#username-preview');
  const updatePreview = () => {
    const raw = form.minecraftUsername.value.trim().replace(/\s+/g, '');
    const platform = form.platform.value;
    const normalized = platform === 'bedrock' ? (raw.startsWith('.') ? raw : `.${raw}`) : raw.replace(/^\.+/, '');
    preview.textContent = raw ? `Username yang dikirim ke server: ${normalized}` : 'Nama yang dikirim ke server akan tampil di sini.';
  };
  form.addEventListener('input', updatePreview);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true; submit.textContent = 'Membuat pesanan...';
    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.productId = product.id;
      const result = await api('/api/orders', { method: 'POST', body: payload });
      state.lastOrder = result.order;
      toast(result.message);
      routeTo(`/payment/${result.order.orderCode}`);
    } catch (error) { toast(error.message, 'error'); }
    finally { submit.disabled = false; submit.textContent = 'Lanjut ke Pembayaran QRIS'; }
  });
}

async function renderPayment(code) {
  if (!state.user) return routeTo('/login');
  app.innerHTML = loadingPage();
  const { order } = await api(`/api/orders/${encodeURIComponent(code)}`);
  const s = state.bootstrap.settings;
  app.innerHTML = `<div class="page-shell"><div class="page-title"><div class="breadcrumb">Checkout / Pembayaran</div><span class="eyebrow">ID ${escapeHtml(order.orderCode)}</span><h1>Bayar menggunakan QRIS.</h1><p>Scan QRIS, transfer sesuai total, lalu unggah bukti pembayaran yang jelas.</p></div><div class="payment-grid"><div class="card"><div class="qris-wrap"><img src="${escapeHtml(s.qrisUrl)}" alt="QRIS MineFiveID"></div><div class="summary-row total"><span>Total Pembayaran</span><strong>${rupiah(order.totalAmount)}</strong></div><p class="help">QRIS bersifat statis. Pastikan jumlah transfer tepat agar verifikasi lebih cepat.</p></div><div class="card"><span class="eyebrow">Kirim Bukti Transfer</span><h2 style="margin:18px 0 8px">${escapeHtml(order.items[0]?.productName || 'Produk MineFiveID')}</h2><div class="summary-row"><span>Username</span><strong>${escapeHtml(order.normalizedUsername)}</strong></div><div class="summary-row"><span>Platform</span><strong>${escapeHtml(order.platform.toUpperCase())}</strong></div><div class="summary-row"><span>Status</span>${statusChip(order.status)}</div><form id="proof-form" style="margin-top:22px"><div class="form-group"><label>Bukti Pembayaran</label><input class="input" type="file" name="proof" accept="image/jpeg,image/png,image/webp" required><span class="help">Format JPG, PNG, atau WEBP. Maksimal 5 MB.</span></div><button class="btn btn-primary btn-block" type="submit">Kirim Bukti Transfer</button></form><p class="help" style="margin-top:14px">Setelah dikirim, transaksi otomatis masuk ke Discord admin dengan tombol Pending, Done, dan Cancel.</p></div></div></div>`;

  const form = document.querySelector('#proof-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button');
    submit.disabled = true; submit.textContent = 'Mengunggah...';
    try {
      const data = new FormData(form);
      const result = await api(`/api/orders/${encodeURIComponent(code)}/proof`, { method: 'POST', body: data });
      toast(result.message);
      showModal(`<div class="modal-head"><h2>Bukti berhasil dikirim</h2><button class="icon-button" data-action="close-modal">×</button></div><p>Pesanan <strong>${escapeHtml(result.order.orderCode)}</strong> sekarang berstatus ${statusChip(result.order.status)}.</p><p style="color:var(--muted)">Sambil menunggu verifikasi, kamu dapat menghubungi admin melalui WhatsApp.</p><div class="button-row"><a class="btn btn-primary" href="${escapeHtml(result.whatsappUrl)}" target="_blank" rel="noopener">Hubungi Admin</a><a class="btn" href="#/order/${encodeURIComponent(code)}" data-action="close-modal">Lihat Status</a></div>`);
    } catch (error) { toast(error.message, 'error'); }
    finally { submit.disabled = false; submit.textContent = 'Kirim Bukti Transfer'; }
  });
}

function orderTimeline(order) {
  const rejected = ['PEMBAYARAN_DITOLAK', 'PESANAN_DIBATALKAN'].includes(order.status);
  if (rejected) return `<div class="timeline"><div class="timeline-item active"><strong>${escapeHtml(statusLabels[order.status])}</strong><div>${escapeHtml(order.rejectionReason || 'Hubungi admin untuk informasi lebih lanjut.')}</div></div></div>`;
  const index = statusOrder.indexOf(order.status);
  return `<div class="timeline">${statusOrder.map((status, i) => `<div class="timeline-item ${i <= index ? 'active' : ''}"><strong>${escapeHtml(statusLabels[status])}</strong><div>${i <= index ? 'Tahap ini sudah tercapai.' : 'Menunggu proses sebelumnya.'}</div></div>`).join('')}</div>`;
}

async function renderOrder(code) {
  if (!state.user) return routeTo('/login');
  app.innerHTML = loadingPage();
  const { order } = await api(`/api/orders/${encodeURIComponent(code)}`);
  const waNumber = state.bootstrap.settings.adminWhatsApp;
  const waText = encodeURIComponent(`Halo Admin MineFiveID, saya ingin menanyakan pesanan ${order.orderCode} atas nama ${order.normalizedUsername}.`);
  app.innerHTML = `<div class="page-shell"><div class="page-title"><div class="breadcrumb">Pesanan / ${escapeHtml(order.orderCode)}</div><span class="eyebrow">Detail Transaksi #${order.id}</span><h1>Status pesananmu.</h1><p>Halaman ini akan menampilkan perubahan status setelah admin atau plugin memproses pesanan.</p></div><div class="checkout-layout"><div class="card"><div style="display:flex;justify-content:space-between;gap:15px;align-items:center"><div><h2 style="margin-bottom:4px">${escapeHtml(order.orderCode)}</h2><p>${dateTime(order.createdAt)}</p></div>${statusChip(order.status)}</div>${orderTimeline(order)}</div><aside class="card sticky-card"><h3>Detail Pembelian</h3><div class="summary-row"><span>Produk</span><strong>${escapeHtml(order.items.map((x) => x.productName).join(', '))}</strong></div><div class="summary-row"><span>Minecraft</span><strong>${escapeHtml(order.normalizedUsername)}</strong></div><div class="summary-row"><span>Platform</span><strong>${escapeHtml(order.platform.toUpperCase())}</strong></div><div class="summary-row"><span>WhatsApp</span><strong>${escapeHtml(order.whatsapp)}</strong></div><div class="summary-row total"><span>Total</span><strong>${rupiah(order.totalAmount)}</strong></div>${order.status === 'MENUNGGU_PEMBAYARAN' ? `<a class="btn btn-primary btn-block" style="margin-top:18px" href="#/payment/${encodeURIComponent(order.orderCode)}">Lanjut Bayar</a>` : ''}<a class="btn btn-block" style="margin-top:9px" href="https://wa.me/${escapeHtml(waNumber)}?text=${waText}" target="_blank" rel="noopener">Hubungi Admin</a></aside></div></div>`;
}

async function renderHistory() {
  if (!state.user) return routeTo('/login');
  app.innerHTML = loadingPage();
  const { orders } = await api('/api/orders');
  app.innerHTML = `<div class="page-shell"><div class="page-title"><div class="breadcrumb">Akun / Riwayat Pembelian</div><span class="eyebrow">Pesanan Saya</span><h1>Semua transaksi dalam satu tempat.</h1><p>Pantau pembayaran, proses pemberian rank, dan hasil transaksi.</p></div>${orders.length ? `<div class="table-wrap"><table><thead><tr><th>ID Pesanan</th><th>Minecraft</th><th>Produk</th><th>Total</th><th>Status</th><th>Tanggal</th><th></th></tr></thead><tbody>${orders.map((o) => `<tr><td><strong>${escapeHtml(o.orderCode)}</strong><br><small>#${o.id}</small></td><td>${escapeHtml(o.normalizedUsername)}<br><small>${escapeHtml(o.platform.toUpperCase())}</small></td><td>${escapeHtml(o.items.map((x) => x.productName).join(', '))}</td><td>${rupiah(o.totalAmount)}</td><td>${statusChip(o.status)}</td><td>${dateTime(o.createdAt)}</td><td><a class="btn btn-sm" href="#/order/${encodeURIComponent(o.orderCode)}">Detail</a></td></tr>`).join('')}</tbody></table></div>` : emptyState('Belum ada transaksi','Pilih produk di store untuk membuat pesanan pertamamu.', '<a class="btn btn-primary" href="#/store">Buka Store</a>')}</div>`;
}

function renderOrderLookup() {
  app.innerHTML = `<div class="page-shell"><div class="page-title"><span class="eyebrow">Cek Pesanan</span><h1>Cari status transaksi.</h1><p>Masukkan ID transaksi seperti MF-20260719-0001. Kamu harus login dengan akun pemilik transaksi.</p></div><form id="lookup-form" class="card form-card"><div class="form-group"><label>ID Pesanan</label><input class="input" name="code" placeholder="MF-20260719-0001" required></div><button class="btn btn-primary btn-block">Lihat Status</button></form></div>`;
  document.querySelector('#lookup-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get('code').trim();
    if (code) routeTo(`/order/${encodeURIComponent(code)}`);
  });
}

function authPage(type) {
  const isLogin = type === 'login';
  const isRegister = type === 'register';
  const title = isLogin ? 'Masuk ke akunmu.' : isRegister ? 'Buat akun MineFiveID.' : 'Reset password.';
  app.innerHTML = `<div class="page-shell"><div class="page-title" style="text-align:center"><span class="eyebrow">Akun MineFiveID</span><h1>${title}</h1><p style="margin-inline:auto">${isLogin ? 'Akses riwayat transaksi dan status pesananmu.' : isRegister ? 'Akun baru selalu dibuat sebagai user biasa, bukan admin.' : 'Kami akan mengirim tautan reset jika email terdaftar.'}</p></div><form id="auth-form" class="card form-card">${isRegister ? `<div class="form-group"><label>Nama</label><input class="input" name="displayName" minlength="2" required></div>` : ''}<div class="form-group"><label>Email</label><input class="input" name="email" type="email" required></div>${type !== 'forgot' ? `<div class="form-group"><label>Password</label><input class="input" name="password" type="password" minlength="8" required></div>` : ''}${isRegister ? `<div class="form-group"><label>Nomor WhatsApp</label><input class="input" name="whatsapp" placeholder="08xxxxxxxxxx" required></div>` : ''}<button class="btn btn-primary btn-block" type="submit">${isLogin ? 'Login' : isRegister ? 'Register' : 'Kirim Tautan Reset'}</button>${isLogin ? `<div class="auth-switch"><a href="#/forgot-password">Lupa password?</a><br>Belum punya akun? <a href="#/register">Register</a></div>` : isRegister ? `<div class="auth-switch">Sudah punya akun? <a href="#/login">Login</a></div>` : `<div class="auth-switch"><a href="#/login">Kembali ke Login</a></div>`}</form></div>`;
  const form = document.querySelector('#auth-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const original = button.textContent;
    button.disabled = true; button.textContent = 'Memproses...';
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const endpoint = isLogin ? '/api/auth/login' : isRegister ? '/api/auth/register' : '/api/auth/forgot-password';
      const result = await api(endpoint, { method: 'POST', body });
      toast(result.message);
      if (type === 'forgot' && result.devResetUrl) {
        const token = new URL(result.devResetUrl).hash.split('token=')[1];
        showModal(`<div class="modal-head"><h2>Mode development</h2><button class="icon-button" data-action="close-modal">×</button></div><p>SMTP belum diatur. Gunakan tautan reset berikut untuk pengujian:</p><a class="btn btn-primary btn-block" href="#/reset-password?token=${escapeHtml(token)}" data-action="close-modal">Buka Halaman Reset</a>`);
      }
      if (isLogin || isRegister) {
        state.user = result.user;
        await loadBootstrap();
        const redirect = currentRoute().params.get('redirect');
        routeTo(redirect || '/');
      }
    } catch (error) { toast(error.message, 'error'); }
    finally { button.disabled = false; button.textContent = original; }
  });
}

function renderResetPassword(params) {
  const token = params.get('token') || '';
  app.innerHTML = `<div class="page-shell"><div class="page-title" style="text-align:center"><span class="eyebrow">Reset Password</span><h1>Buat password baru.</h1><p style="margin-inline:auto">Token reset berlaku selama 30 menit.</p></div><form id="reset-form" class="card form-card"><input type="hidden" name="token" value="${escapeHtml(token)}"><div class="form-group"><label>Password Baru</label><input class="input" name="password" type="password" minlength="8" required></div><div class="form-group"><label>Ulangi Password</label><input class="input" name="confirm" type="password" minlength="8" required></div><button class="btn btn-primary btn-block">Simpan Password</button></form></div>`;
  document.querySelector('#reset-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    if (values.password !== values.confirm) return toast('Konfirmasi password tidak sama.', 'error');
    try {
      const result = await api('/api/auth/reset-password', { method: 'POST', body: { token: values.token, password: values.password } });
      toast(result.message);
      routeTo('/login');
    } catch (error) { toast(error.message, 'error'); }
  });
}

function renderProfile() {
  if (!state.user) return routeTo('/login');
  app.innerHTML = `<div class="page-shell"><div class="page-title"><span class="eyebrow">Profil User</span><h1>Kelola akunmu.</h1><p>Role akun: <strong>${escapeHtml(state.user.role)}</strong></p></div><div class="grid grid-2"><form id="profile-form" class="card form-card" style="margin:0;max-width:none"><span class="eyebrow">Informasi Profil</span><h2 style="margin:16px 0 22px">Data akun</h2><div class="form-group"><label>Nama</label><input class="input" name="displayName" value="${escapeHtml(state.user.displayName)}" required></div><div class="form-group"><label>Email</label><input class="input" value="${escapeHtml(state.user.email)}" disabled></div><div class="form-group"><label>WhatsApp</label><input class="input" name="whatsapp" value="${escapeHtml(state.user.whatsapp || '')}" required></div><button class="btn btn-primary">Simpan Perubahan</button></form><form id="password-form" class="card form-card" style="margin:0;max-width:none"><span class="eyebrow">Keamanan</span><h2 style="margin:16px 0 22px">Ganti password</h2><div class="form-group"><label>Password Saat Ini</label><input class="input" type="password" name="currentPassword" autocomplete="current-password" required></div><div class="form-group"><label>Password Baru</label><input class="input" type="password" name="newPassword" minlength="8" autocomplete="new-password" required><span class="help">Minimal 8 karakter. Gunakan kombinasi huruf, angka, dan simbol.</span></div><div class="form-group"><label>Ulangi Password Baru</label><input class="input" type="password" name="confirmPassword" minlength="8" autocomplete="new-password" required></div><button class="btn">Perbarui Password</button></form></div></div>`;
  document.querySelector('#profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { const result = await api('/api/me', { method: 'PUT', body: Object.fromEntries(new FormData(event.currentTarget).entries()) }); state.user = result.user; renderHeader(); toast(result.message); } catch (error) { toast(error.message, 'error'); }
  });
  document.querySelector('#password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    if (body.newPassword !== body.confirmPassword) return toast('Konfirmasi password baru tidak sama.', 'error');
    try { const result = await api('/api/me/password', { method: 'PUT', body }); toast(result.message); form.reset(); } catch (error) { toast(error.message, 'error'); }
  });
}

function adminLayout(content, active = 'overview') {
  const links = [
    ['overview', '/admin', 'Overview', '⌂'],
    ['products', '/admin/products', 'Produk & Rank', '◇'],
    ['orders', '/admin/orders', 'Pesanan', '▤'],
    ['gallery', '/admin/gallery', 'Galeri Server', '▧'],
    ['users', '/admin/users', 'User', '◉'],
    ['settings', '/admin/settings', 'Pengaturan', '⚙']
  ];
  return `<div class="page-shell"><div class="admin-shell"><aside class="admin-sidebar"><div class="admin-sidebar-title">ADMIN PANEL</div>${links.map(([key, href, label, icon]) => `<a class="admin-link ${active === key ? 'active' : ''}" href="#${href}"><span>${icon}</span>${escapeHtml(label)}</a>`).join('')}</aside><section class="admin-main">${content}</section></div></div>`;
}

async function requireAdminPage() {
  if (!state.user) { routeTo('/login'); return false; }
  if (!isAdmin()) { render403(); return false; }
  return true;
}

async function renderAdminOverview() {
  if (!(await requireAdminPage())) return;
  app.innerHTML = adminLayout(loadingBlock(), 'overview');
  const data = await api('/api/admin/overview');
  const maxRevenue = Math.max(1, ...data.chart.map((x) => Number(x.revenue)));
  const content = `<div class="admin-header"><div><span class="eyebrow">Dashboard Admin</span><h1>Overview</h1></div><a class="btn btn-primary" href="#/admin/orders">Verifikasi Pesanan</a></div><div class="grid grid-4"><div class="card metric"><span>Total Pendapatan</span><strong>${rupiah(data.stats.revenue)}</strong></div><div class="card metric"><span>Total Pesanan</span><strong>${data.stats.orders}</strong></div><div class="card metric"><span>Menunggu Verifikasi</span><strong>${data.stats.pendingVerification}</strong></div><div class="card metric"><span>User / Produk</span><strong>${data.stats.users} / ${data.stats.products}</strong></div></div><div class="grid grid-2" style="margin-top:18px"><div class="card"><h3>Grafik Penjualan 14 Hari</h3><div class="chart">${data.chart.length ? data.chart.map((x) => `<div class="chart-bar" style="height:${Math.max(8, Number(x.revenue) / maxRevenue * 190)}px" data-label="${escapeHtml(x.day)} • ${rupiah(x.revenue)}"></div>`).join('') : '<p>Belum ada data penjualan.</p>'}</div></div><div class="card"><h3>Status Server</h3><div class="status-main"><div class="status-orb ${data.serverStatus.online ? '' : 'offline'}">${data.serverStatus.online ? '✓' : '!'}</div><div><strong>${data.serverStatus.online ? 'Online' : 'Offline / Heartbeat lama'}</strong><p>${data.serverStatus.playersOnline}/${data.serverStatus.playersMax || '?'} pemain • ${escapeHtml(data.serverStatus.version)}</p></div></div></div></div><div class="card" style="margin-top:18px"><h3>Transaksi Terbaru</h3>${ordersTable(data.recent, true)}</div>`;
  app.innerHTML = adminLayout(content, 'overview');
}

async function renderAdminProducts() {
  if (!(await requireAdminPage())) return;
  app.innerHTML = adminLayout(loadingBlock(), 'products');
  const { products } = await api('/api/admin/products');
  state.adminCache.products = products;
  const content = `<div class="admin-header"><div><span class="eyebrow">Manajemen Produk</span><h1>Produk & Rank</h1></div><button class="btn btn-primary" data-action="product-form">Tambah Produk</button></div>${products.length ? `<div class="table-wrap"><table><thead><tr><th>Produk</th><th>Harga</th><th>Durasi</th><th>Status</th><th>Urutan</th><th>Aksi</th></tr></thead><tbody>${products.map((p) => `<tr><td><strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml(p.slug)} • ${escapeHtml(p.badge || '-')}</small></td><td>${rupiah(p.finalPrice)}${p.salePrice != null ? `<br><small><del>${rupiah(p.normalPrice)}</del> -${p.discountPercent}%</small>` : ''}</td><td>${escapeHtml(p.duration)}</td><td>${p.active ? '<span class="status-chip success">Aktif</span>' : '<span class="status-chip danger">Nonaktif</span>'}</td><td>${p.sortOrder}</td><td><div class="table-actions"><button class="btn btn-sm" data-action="product-form" data-id="${p.id}">Edit</button><button class="btn btn-sm btn-danger" data-action="delete-product" data-id="${p.id}">Hapus</button></div></td></tr>`).join('')}</tbody></table></div>` : emptyState('Belum ada produk','Klik Tambah Produk untuk membuat rank pertama.')}`;
  app.innerHTML = adminLayout(content, 'products');
}

function productFormModal(product = null) {
  const p = product || { name: '', slug: '', iconUrl: '✦', imageUrl: '', normalPrice: 0, salePrice: '', discountPercent: 0, description: '', duration: '30 Hari', badge: '', active: true, sortOrder: 0, benefits: [], commands: [] };
  showModal(`<div class="modal-head"><h2>${product ? 'Edit' : 'Tambah'} Produk</h2><button class="icon-button" data-action="close-modal">×</button></div><form id="product-form"><div class="grid grid-2"><div class="form-group"><label>Nama Rank</label><input class="input" name="name" value="${escapeHtml(p.name)}" required></div><div class="form-group"><label>Slug URL</label><input class="input" name="slug" value="${escapeHtml(p.slug)}" placeholder="rank-five"></div><div class="form-group"><label>Ikon / Emoji</label><input class="input" name="iconUrl" value="${escapeHtml(p.iconUrl || '')}"></div><div class="form-group"><label>URL Gambar Produk</label><input class="input" name="imageUrl" value="${escapeHtml(p.imageUrl || '')}" placeholder="/media/gambar.png"></div><div class="form-group"><label>Harga Normal</label><input class="input" type="number" name="normalPrice" min="0" value="${p.normalPrice}" required></div><div class="form-group"><label>Harga Diskon</label><input class="input" type="number" name="salePrice" min="0" value="${p.salePrice ?? ''}"></div><div class="form-group"><label>Persentase Diskon</label><input class="input" type="number" name="discountPercent" min="0" max="100" value="${p.discountPercent || 0}"></div><div class="form-group"><label>Durasi</label><input class="input" name="duration" value="${escapeHtml(p.duration)}"></div><div class="form-group"><label>Badge</label><input class="input" name="badge" value="${escapeHtml(p.badge || '')}" placeholder="Terlaris / Promo"></div><div class="form-group"><label>Urutan</label><input class="input" type="number" name="sortOrder" value="${p.sortOrder || 0}"></div></div><div class="form-group"><label>Deskripsi</label><textarea name="description">${escapeHtml(p.description)}</textarea></div><div class="form-group"><label>Benefit (satu per baris)</label><textarea name="benefits">${escapeHtml((p.benefits || []).join('\n'))}</textarea></div><div class="form-group"><label>Command Server (satu per baris)</label><textarea name="commands" placeholder="lp user %player% parent addtemp five 30d">${escapeHtml((p.commands || []).join('\n'))}</textarea><span class="help">Placeholder: %player%, %username%, %order_id%, %product%, %platform%, %duration%, %uuid%</span></div><label style="display:flex;gap:9px;align-items:center"><input type="checkbox" name="active" ${p.active ? 'checked' : ''}> Produk aktif dan tampil di store</label><div class="button-row" style="justify-content:flex-end"><button type="button" class="btn" data-action="close-modal">Batal</button><button class="btn btn-primary" type="submit">Simpan Produk</button></div></form>`, true);
  document.querySelector('#product-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    values.active = form.active.checked;
    values.benefits = values.benefits.split('\n');
    values.commands = values.commands.split('\n');
    try {
      const result = await api(product ? `/api/admin/products/${product.id}` : '/api/admin/products', { method: product ? 'PUT' : 'POST', body: values });
      toast(result.message); closeModal(); renderAdminProducts();
    } catch (error) { toast(error.message, 'error'); }
  });
}

async function renderAdminOrders() {
  if (!(await requireAdminPage())) return;
  app.innerHTML = adminLayout(loadingBlock(), 'orders');
  const { params } = currentRoute();
  const q = params.get('q') || '';
  const status = params.get('status') || '';
  const data = await api(`/api/admin/orders?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`);
  state.adminCache.orders = data.orders;
  const content = `<div class="admin-header"><div><span class="eyebrow">Manajemen Pesanan</span><h1>Transaksi</h1></div></div><form id="order-filter" class="filter-bar"><input class="input" name="q" value="${escapeHtml(q)}" placeholder="Cari ID, username, WA, email"><select name="status"><option value="">Semua Status</option>${Object.entries(statusLabels).map(([k,v]) => `<option value="${k}" ${status === k ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select><button class="btn">Filter</button></form>${ordersTable(data.orders, true)}`;
  app.innerHTML = adminLayout(content, 'orders');
  document.querySelector('#order-filter').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    routeTo(`/admin/orders?q=${encodeURIComponent(form.get('q'))}&status=${encodeURIComponent(form.get('status'))}`);
  });
}

function ordersTable(orders, admin = false) {
  if (!orders.length) return emptyState('Tidak ada transaksi','Belum ada transaksi yang cocok dengan filter.');
  return `<div class="table-wrap"><table><thead><tr><th>Transaksi</th><th>Pemain</th><th>Produk</th><th>Total</th><th>Status</th><th>Bukti</th><th>Aksi</th></tr></thead><tbody>${orders.map((o) => `<tr><td><strong>${escapeHtml(o.orderCode)}</strong><br><small>#${o.id} • ${dateTime(o.createdAt)}</small></td><td>${escapeHtml(o.normalizedUsername)}<br><small>${escapeHtml(o.platform.toUpperCase())} • ${escapeHtml(o.whatsapp)}</small></td><td>${escapeHtml(o.items.map((x) => x.productName).join(', '))}</td><td>${rupiah(o.totalAmount)}</td><td>${statusChip(o.status)}</td><td>${o.proofs?.length ? `<a class="btn btn-sm" href="${escapeHtml(o.proofs[0].fileUrl)}" target="_blank">Lihat Bukti</a>` : '-'}</td><td>${admin ? `<div class="table-actions"><button class="btn btn-sm btn-success" data-action="approve-order" data-id="${o.id}">Done</button><button class="btn btn-sm" data-action="pending-order" data-id="${o.id}">Pending</button><button class="btn btn-sm btn-danger" data-action="cancel-order" data-id="${o.id}">Cancel</button><button class="btn btn-sm" data-action="order-detail" data-id="${o.id}">Detail</button></div>` : `<a class="btn btn-sm" href="#/order/${encodeURIComponent(o.orderCode)}">Detail</a>`}</td></tr>`).join('')}</tbody></table></div>`;
}

function orderDetailModal(order) {
  showModal(`<div class="modal-head"><h2>${escapeHtml(order.orderCode)}</h2><button class="icon-button" data-action="close-modal">×</button></div><div class="grid grid-2"><div class="card"><h3>Detail Pembeli</h3><div class="summary-row"><span>Nama</span><strong>${escapeHtml(order.displayName || '-')}</strong></div><div class="summary-row"><span>Email</span><strong>${escapeHtml(order.email || '-')}</strong></div><div class="summary-row"><span>WhatsApp</span><strong>${escapeHtml(order.whatsapp)}</strong></div><div class="summary-row"><span>Minecraft</span><strong>${escapeHtml(order.normalizedUsername)}</strong></div></div><div class="card"><h3>Detail Transaksi</h3><div class="summary-row"><span>Urutan</span><strong>#${order.id}</strong></div><div class="summary-row"><span>Produk</span><strong>${escapeHtml(order.items.map((x) => x.productName).join(', '))}</strong></div><div class="summary-row"><span>Total</span><strong>${rupiah(order.totalAmount)}</strong></div><div class="summary-row"><span>Status</span>${statusChip(order.status)}</div></div></div>${order.proofs?.length ? `<div class="button-row"><a class="btn btn-primary" href="${escapeHtml(order.proofs[0].fileUrl)}" target="_blank">Buka Bukti Transfer</a></div>` : ''}<div class="form-group" style="margin-top:20px"><label>Ubah Status</label><select id="modal-order-status">${Object.entries(statusLabels).map(([k,v]) => `<option value="${k}" ${order.status === k ? 'selected' : ''}>${escapeHtml(v)}</option>`).join('')}</select></div><div class="form-group"><label>Alasan (opsional)</label><textarea id="modal-order-reason">${escapeHtml(order.rejectionReason || '')}</textarea></div><button class="btn btn-primary" data-action="save-order-status" data-id="${order.id}">Simpan Status</button>`, true);
}

function galleryFormModal(item = null) {
  const g = item || { title: '', description: '', sortOrder: 0, featured: false, imageUrl: '' };
  showModal(`<div class="modal-head"><div><span class="eyebrow">Galeri Server</span><h2>${item ? 'Edit Foto' : 'Tambah Foto'}</h2></div><button class="icon-button" data-action="close-modal">×</button></div><form id="gallery-form" enctype="multipart/form-data">${item ? `<div class="gallery-edit-preview"><img src="${escapeHtml(item.imageUrl)}" alt="Preview"></div>` : ''}<div class="form-group"><label>Foto ${item ? '(opsional jika tidak diganti)' : ''}</label><input class="input" type="file" name="image" accept="image/jpeg,image/png,image/webp" ${item ? '' : 'required'}></div><div class="grid grid-2"><div class="form-group"><label>Judul Foto</label><input class="input" name="title" value="${escapeHtml(g.title)}" required maxlength="120"></div><div class="form-group"><label>Urutan</label><input class="input" type="number" name="sortOrder" value="${Number(g.sortOrder || 0)}"></div></div><div class="form-group"><label>Deskripsi</label><textarea name="description" maxlength="1000">${escapeHtml(g.description || '')}</textarea></div><label class="check-row"><input type="checkbox" name="featured" ${g.featured ? 'checked' : ''}> Tandai sebagai foto unggulan</label><div class="button-row modal-actions"><button type="button" class="btn" data-action="close-modal">Batal</button><button class="btn btn-primary" type="submit">Simpan Foto</button></div></form>`, true);
  document.querySelector('#gallery-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    body.set('featured', form.featured.checked ? 'true' : 'false');
    try {
      const result = await api(item ? `/api/admin/gallery/${item.id}` : '/api/admin/gallery', { method: item ? 'PUT' : 'POST', body });
      toast(result.message); closeModal(); renderAdminGallery(); await loadBootstrap();
    } catch (error) { toast(error.message, 'error'); }
  });
}

async function renderAdminGallery() {
  if (!(await requireAdminPage())) return;
  app.innerHTML = adminLayout(loadingBlock(), 'gallery');
  const data = await api('/api/admin/gallery');
  state.adminCache.gallery = data.gallery;
  const content = `<div class="admin-header"><div><span class="eyebrow">Manajemen Galeri</span><h1>Foto Server</h1><p>Tambah, edit, urutkan, dan hapus foto yang tampil pada website.</p></div><button class="btn btn-primary" data-action="gallery-form">Tambah Foto</button></div>${data.gallery.length ? `<div class="admin-gallery-grid">${data.gallery.map((item,index)=>`<article class="admin-gallery-card"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}"><div><span>${String(index+1).padStart(2,'0')} ${item.featured ? '• UNGGULAN' : ''}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || 'Tanpa deskripsi')}</p><div class="table-actions"><button class="btn btn-sm" data-action="gallery-form" data-id="${item.id}">Edit</button><button class="btn btn-sm btn-danger" data-action="delete-gallery" data-id="${item.id}">Hapus</button></div></div></article>`).join('')}</div>` : emptyState('Belum ada foto','Klik Tambah Foto untuk mengisi galeri server.')}`;
  app.innerHTML = adminLayout(content, 'gallery');
}

async function renderAdminUsers() {
  if (!(await requireAdminPage())) return;
  app.innerHTML = adminLayout(loadingBlock(), 'users');
  const { params } = currentRoute();
  const q = params.get('q') || '';
  const data = await api(`/api/admin/users?q=${encodeURIComponent(q)}`);
  state.adminCache.users = data.users;
  const content = `<div class="admin-header"><div><span class="eyebrow">Manajemen User</span><h1>Daftar User</h1></div></div><form id="user-filter" class="filter-bar"><input class="input" name="q" value="${escapeHtml(q)}" placeholder="Cari nama, email, atau WhatsApp"><button class="btn">Cari</button></form>${data.users.length ? `<div class="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Pesanan</th><th>Terdaftar</th><th>Aksi</th></tr></thead><tbody>${data.users.map((u) => `<tr><td><strong>${escapeHtml(u.displayName)}</strong><br><small>${escapeHtml(u.email)} • ${escapeHtml(u.whatsapp || '-')}</small></td><td><span class="badge">${escapeHtml(u.role)}</span></td><td>${u.status === 'active' ? '<span class="status-chip success">Aktif</span>' : '<span class="status-chip danger">Nonaktif</span>'}</td><td>${u.orderCount}</td><td>${dateTime(u.createdAt)}</td><td><div class="table-actions"><button class="btn btn-sm" data-action="toggle-user" data-id="${u.id}" data-status="${u.status === 'active' ? 'inactive' : 'active'}">${u.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}</button>${state.user.role === 'superadmin' ? `<button class="btn btn-sm" data-action="change-role" data-id="${u.id}">Ubah Role</button>` : ''}</div></td></tr>`).join('')}</tbody></table></div>` : emptyState('User tidak ditemukan','Coba kata kunci lain.')}`;
  app.innerHTML = adminLayout(content, 'users');
  document.querySelector('#user-filter').addEventListener('submit', (event) => { event.preventDefault(); routeTo(`/admin/users?q=${encodeURIComponent(new FormData(event.currentTarget).get('q'))}`); });
}

async function renderAdminSettings() {
  if (!(await requireAdminPage())) return;
  app.innerHTML = adminLayout(loadingBlock(), 'settings');
  const { settings: s } = await api('/api/admin/settings');
  const faqText = (typeof s.ai_faq_json === 'string' ? (() => { try { return JSON.parse(s.ai_faq_json); } catch (_) { return []; } })() : (s.ai_faq_json || []))
    .map((item) => `${item.question || ''} | ${item.answer || ''}`).join('\n');
  const content = `<div class="admin-header"><div><span class="eyebrow">Pengaturan Website</span><h1>Konfigurasi</h1><p>Kelola identitas server, integrasi AI, link komunitas, dan mode maintenance.</p></div></div><form id="settings-form"><div class="settings-stack"><section class="card"><h3>Informasi Server</h3><div class="grid grid-2"><div class="form-group"><label>Nama Server</label><input class="input" name="server_name" value="${escapeHtml(s.server_name)}"></div><div class="form-group"><label>IP Server</label><input class="input" name="server_ip" value="${escapeHtml(s.server_ip)}"></div><div class="form-group"><label>Port Bedrock</label><input class="input" name="server_port" value="${escapeHtml(s.server_port)}"></div><div class="form-group"><label>Pengumuman</label><input class="input" name="announcement" value="${escapeHtml(s.announcement)}"></div></div><div class="form-group"><label>Deskripsi Server</label><textarea name="server_description">${escapeHtml(s.server_description)}</textarea></div></section><section class="card"><h3>Visual & Link</h3><div class="grid grid-2"><div class="form-group"><label>Link Discord</label><input class="input" name="discord_url" value="${escapeHtml(s.discord_url)}"></div><div class="form-group"><label>Link WhatsApp</label><input class="input" name="whatsapp_url" value="${escapeHtml(s.whatsapp_url)}"></div><div class="form-group"><label>Link Peraturan</label><input class="input" name="rules_url" value="${escapeHtml(s.rules_url)}"></div><div class="form-group"><label>URL Logo</label><input class="input" name="logo_url" value="${escapeHtml(s.logo_url)}"></div><div class="form-group"><label>URL QRIS</label><input class="input" name="qris_url" value="${escapeHtml(s.qris_url)}"></div><div class="form-group"><label>URL Background Hero</label><input class="input" name="background_url" value="${escapeHtml(s.background_url)}"></div></div></section><section class="card ai-settings-card"><div class="settings-title-row"><div><span class="eyebrow">MineFive Assistant</span><h3>Asisten AI Khusus Server</h3></div><label class="switch"><input type="checkbox" name="ai_enabled" ${s.ai_enabled === 'true' ? 'checked' : ''}><span></span></label></div><div class="form-group"><label>Pesan Pembuka</label><input class="input" name="ai_welcome" value="${escapeHtml(s.ai_welcome || '')}"></div><div class="form-group"><label>Aturan Tambahan AI</label><textarea name="ai_rules">${escapeHtml(s.ai_rules || '')}</textarea><span class="help">AI tetap dikunci agar hanya membahas MineFiveID.</span></div><div class="form-group"><label>FAQ AI — satu baris: Pertanyaan | Jawaban</label><textarea name="ai_faq_lines" rows="8">${escapeHtml(faqText)}</textarea></div></section><section class="card"><div class="settings-title-row"><div><h3>Status Website</h3><p>Mode maintenance hanya memblokir halaman store untuk user biasa.</p></div><label class="switch"><input type="checkbox" name="maintenance_store" ${s.maintenance_store === 'true' ? 'checked' : ''}><span></span></label></div><button class="btn btn-primary">Simpan Semua Pengaturan</button></section></div></form><div class="card media-upload-card"><h3>Upload Media Umum</h3><p>Untuk logo, QRIS, background, atau ikon produk. Foto galeri dikelola dari menu Galeri Server.</p><form id="media-form" class="button-row"><input class="input" type="file" name="image" accept="image/jpeg,image/png,image/webp" required><button class="btn">Upload</button></form><div id="media-result"></div></div>`;
  app.innerHTML = adminLayout(content, 'settings');
  document.querySelector('#settings-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    body.maintenance_store = form.maintenance_store.checked ? 'true' : 'false';
    body.ai_enabled = form.ai_enabled.checked ? 'true' : 'false';
    body.ai_faq_json = String(body.ai_faq_lines || '').split('\n').map((line) => { const [question, ...answer] = line.split('|'); return { question: question?.trim(), answer: answer.join('|').trim() }; }).filter((item) => item.question && item.answer);
    delete body.ai_faq_lines;
    try { const result = await api('/api/admin/settings', { method: 'PUT', body }); toast(result.message); await loadBootstrap(); renderAdminSettings(); } catch (error) { toast(error.message, 'error'); }
  });
  document.querySelector('#media-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { const result = await api('/api/admin/media', { method: 'POST', body: new FormData(event.currentTarget) }); document.querySelector('#media-result').innerHTML = `<div class="server-address media-url"><span>${escapeHtml(result.url)}</span><button data-action="copy-text" data-value="${escapeHtml(result.url)}">Copy</button></div>`; toast(result.message); } catch (error) { toast(error.message, 'error'); }
  });
}

function renderMaintenance() {
  app.innerHTML = `<div class="page-shell"><div class="card" style="text-align:center;padding:80px 25px"><div class="icon-box" style="margin-inline:auto">⚙</div><span class="eyebrow">Maintenance</span><h1 style="font-size:clamp(3rem,8vw,6rem)">Store sedang dirawat.</h1><p class="hero-copy" style="margin-inline:auto">Admin sedang melakukan pembaruan. Halaman home dan informasi server tetap dapat diakses.</p><a class="btn btn-primary" href="#/">Kembali ke Home</a></div></div>`;
}

function render404() {
  app.innerHTML = `<div class="page-shell"><div class="card" style="text-align:center;padding:80px 25px"><span class="eyebrow">404</span><h1 style="font-size:clamp(4rem,15vw,9rem)">Tersesat?</h1><p class="hero-copy" style="margin-inline:auto">Halaman yang kamu cari tidak ditemukan.</p><a class="btn btn-primary" href="#/">Kembali ke Home</a></div></div>`;
}

function render403() {
  app.innerHTML = `<div class="page-shell"><div class="card" style="text-align:center;padding:80px 25px"><span class="eyebrow">403</span><h1 style="font-size:clamp(3rem,10vw,7rem)">Akses ditolak.</h1><p class="hero-copy" style="margin-inline:auto">Halaman ini hanya dapat dibuka oleh akun admin.</p><a class="btn btn-primary" href="#/">Kembali</a></div></div>`;
}

function emptyState(title, text, action = '') {
  return `<div class="empty"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(text)}</p>${action}</div>`;
}

function loadingPage() {
  return `<div class="page-shell"><div class="skeleton hero-skeleton"></div><div class="grid grid-3"><div class="skeleton card-skeleton"></div><div class="skeleton card-skeleton"></div><div class="skeleton card-skeleton"></div></div></div>`;
}

function loadingBlock() {
  return `<div class="skeleton" style="height:500px"></div>`;
}

function observeAnimations() {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08, rootMargin: '0px 0px -30px' });
  document.querySelectorAll('.fade-up').forEach((node, index) => {
    if (!node.style.getPropertyValue('--delay')) node.style.setProperty('--delay', `${Math.min((index % 6) * 55, 275)}ms`);
    observer.observe(node);
  });

  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (window.matchMedia('(max-width: 760px)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(850px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  document.querySelectorAll('[data-count]').forEach((node) => {
    const target = Number(node.dataset.count || 0);
    if (!Number.isFinite(target) || target <= 0) return;
    const started = performance.now();
    const duration = 850;
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      node.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  const consoleCard = document.querySelector('[data-parallax-card]');
  if (consoleCard && !window.matchMedia('(max-width: 1020px)').matches) {
    consoleCard.addEventListener('pointermove', (event) => {
      const rect = consoleCard.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      consoleCard.style.transform = `rotateY(${x * 8 - 5}deg) rotateX(${-y * 6 + 2}deg) translateY(-3px)`;
    });
    consoleCard.addEventListener('pointerleave', () => { consoleCard.style.transform = 'rotateY(-5deg) rotateX(2deg)'; });
  }
}

function renderAiWidget() {
  let root = document.querySelector('#ai-assistant-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'ai-assistant-root';
    document.body.appendChild(root);
  }
  const settings = state.bootstrap?.settings || {};
  if (!settings.aiEnabled) { root.innerHTML = ''; return; }
  const welcome = settings.aiWelcome || 'Halo! Saya asisten MineFiveID.';
  root.innerHTML = `<button class="ai-launcher ${state.aiOpen ? 'open' : ''}" data-action="toggle-ai" aria-label="Buka MineFive Assistant"><span class="ai-launcher-logo">MF</span><span class="ai-launcher-label"><b>MineFive AI</b><small>Tanya tentang server</small></span><i>${state.aiOpen ? '×' : '✦'}</i></button><section class="ai-panel ${state.aiOpen ? 'open' : ''}" aria-label="MineFive Assistant"><header><div><span class="ai-avatar">MF</span><div><strong>MineFive Assistant</strong><small><span class="dot"></span> Khusus server MineFiveID</small></div></div><button data-action="toggle-ai">×</button></header><div class="ai-messages" id="ai-messages">${state.aiHistory.length ? state.aiHistory.map((item) => `<div class="ai-message ${item.role}"><span>${item.role === 'assistant' ? 'MF' : 'Kamu'}</span><p>${escapeHtml(item.content).replaceAll('\n','<br>')}</p></div>`).join('') : `<div class="ai-message assistant"><span>MF</span><p>${escapeHtml(welcome)}</p></div><div class="ai-suggestions"><button data-action="ai-suggest" data-value="Bagaimana cara join MineFiveID?">Cara join</button><button data-action="ai-suggest" data-value="Berapa pemain yang sedang online di server?">Status server</button><button data-action="ai-suggest" data-value="Bagaimana cara membeli rank?">Beli rank</button></div>`}</div><form id="ai-form" class="ai-input"><textarea name="message" rows="1" maxlength="700" placeholder="Tanyakan tentang MineFiveID..." required></textarea><button type="submit" aria-label="Kirim">↗</button></form><footer>AI hanya menjawab pertanyaan tentang MineFiveID.</footer></section>`;
  const messages = root.querySelector('#ai-messages');
  if (messages) messages.scrollTop = messages.scrollHeight;
  const form = root.querySelector('#ai-form');
  if (form) form.addEventListener('submit', submitAiMessage);
}

async function submitAiMessage(event) {
  event?.preventDefault();
  const form = event?.currentTarget || document.querySelector('#ai-form');
  const input = form?.elements?.message;
  const message = String(input?.value || '').trim();
  if (!message) return;
  const historyForApi = state.aiHistory.slice(-8);
  state.aiHistory.push({ role: 'user', content: message });
  if (input) input.value = '';
  renderAiWidget();
  const messages = document.querySelector('#ai-messages');
  if (messages) { messages.insertAdjacentHTML('beforeend', '<div class="ai-typing"><i></i><i></i><i></i></div>'); messages.scrollTop = messages.scrollHeight; }
  try {
    const result = await api('/api/ai/chat', { method: 'POST', body: { message, history: historyForApi } });
    state.aiHistory.push({ role: 'assistant', content: result.answer });
  } catch (error) {
    state.aiHistory.push({ role: 'assistant', content: error.message || 'Maaf, AI sedang tidak dapat diakses.' });
  }
  state.aiHistory = state.aiHistory.slice(-20);
  renderAiWidget();
}

async function loadBootstrap() {
  state.bootstrap = normalizeBootstrapAssets(await api('/api/public/bootstrap'));
  state.user = state.bootstrap.user;
  renderHeader();
  renderFooter();
  renderAiWidget();
}

async function router() {
  closeModal();
  renderHeader();
  const { path, params } = currentRoute();
  try {
    if (path === '/') renderHome();
    else if (path === '/gallery') renderGallery();
    else if (path === '/store') renderStore();
    else if (path.startsWith('/product/')) await renderProduct(decodeURIComponent(path.split('/')[2] || ''));
    else if (path.startsWith('/checkout/')) await renderCheckout(decodeURIComponent(path.split('/')[2] || ''));
    else if (path.startsWith('/payment/')) await renderPayment(decodeURIComponent(path.split('/')[2] || ''));
    else if (path.startsWith('/order/')) await renderOrder(decodeURIComponent(path.split('/')[2] || ''));
    else if (path === '/order-status') renderOrderLookup();
    else if (path === '/history') await renderHistory();
    else if (path === '/login') authPage('login');
    else if (path === '/register') authPage('register');
    else if (path === '/forgot-password') authPage('forgot');
    else if (path === '/reset-password') renderResetPassword(params);
    else if (path === '/profile') renderProfile();
    else if (path === '/admin') await renderAdminOverview();
    else if (path === '/admin/products') await renderAdminProducts();
    else if (path === '/admin/orders') await renderAdminOrders();
    else if (path === '/admin/gallery') await renderAdminGallery();
    else if (path === '/admin/users') await renderAdminUsers();
    else if (path === '/admin/settings') await renderAdminSettings();
    else if (path === '/maintenance') renderMaintenance();
    else render404();
  } catch (error) {
    if (error.status === 401) { state.user = null; renderHeader(); routeTo(`/login?redirect=${encodeURIComponent(path)}`); return; }
    app.innerHTML = `<div class="page-shell">${emptyState('Gagal memuat halaman', error.message, '<a class="btn" href="#/">Kembali</a>')}</div>`;
    toast(error.message, 'error');
  }
  requestAnimationFrame(() => { app.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); observeAnimations(); });
}

document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'close-modal') { if (event.target.classList.contains('modal-backdrop') || target !== event.target.closest('.modal')) closeModal(); return; }
  if (action === 'toggle-menu') { document.querySelector('#nav-links')?.classList.toggle('open'); return; }
  if (action === 'toggle-theme') { applyTheme(currentTheme() === 'light' ? 'dark' : 'light'); renderHeader(); return; }
  if (action === 'toggle-ai') { state.aiOpen = !state.aiOpen; renderAiWidget(); return; }
  if (action === 'ai-suggest') { const form = document.querySelector('#ai-form'); if (form) { form.elements.message.value = target.dataset.value || ''; form.requestSubmit(); } return; }
  if (action === 'copy-bedrock') { const s = state.bootstrap.settings; await navigator.clipboard.writeText(`${s.serverIp}:${s.serverPort}`); toast(`Alamat Bedrock ${s.serverIp}:${s.serverPort} berhasil disalin.`, 'success', 'Alamat disalin'); return; }
  if (action === 'open-gallery') { const item = (state.bootstrap.gallery || []).find((x) => x.id === Number(target.dataset.id)); if (item) showModal(`<div class="gallery-lightbox"><button class="lightbox-close" data-action="close-modal">×</button><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}"><div><span class="eyebrow">MineFiveID Gallery</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description || '')}</p></div></div>`, true); return; }
  if (action === 'copy-ip') {
    const s = state.bootstrap.settings;
    await navigator.clipboard.writeText(s.serverIp);
    toast(`IP ${s.serverIp} berhasil disalin.`, 'success', 'IP disalin');
    return;
  }
  if (action === 'copy-text') { await navigator.clipboard.writeText(target.dataset.value || ''); toast('Teks berhasil disalin.'); return; }
  if (action === 'logout') {
    try { await api('/api/auth/logout', { method: 'POST', body: {} }); state.user = null; await loadBootstrap(); toast('Logout berhasil.'); routeTo('/'); } catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (action === 'product-form') {
    const product = target.dataset.id ? state.adminCache.products?.find((p) => p.id === Number(target.dataset.id)) : null;
    productFormModal(product);
    return;
  }
  if (action === 'delete-product') {
    const product = state.adminCache.products?.find((p) => p.id === Number(target.dataset.id));
    showModal(`<div class="modal-head"><h2>Hapus Produk?</h2><button class="icon-button" data-action="close-modal">×</button></div><p>Produk <strong>${escapeHtml(product?.name || '')}</strong> akan dihapus. Tindakan ini tidak dapat dibatalkan.</p><div class="button-row" style="justify-content:flex-end"><button class="btn" data-action="close-modal">Batal</button><button class="btn btn-danger" data-action="confirm-delete-product" data-id="${target.dataset.id}">Ya, Hapus</button></div>`);
    return;
  }
  if (action === 'confirm-delete-product') {
    try { const result = await api(`/api/admin/products/${target.dataset.id}`, { method: 'DELETE', body: {} }); toast(result.message); closeModal(); renderAdminProducts(); } catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (action === 'gallery-form') {
    const item = target.dataset.id ? state.adminCache.gallery?.find((x) => x.id === Number(target.dataset.id)) : null;
    galleryFormModal(item);
    return;
  }
  if (action === 'delete-gallery') {
    const item = state.adminCache.gallery?.find((x) => x.id === Number(target.dataset.id));
    showModal(`<div class="modal-head"><h2>Hapus Foto?</h2><button class="icon-button" data-action="close-modal">×</button></div><p>Foto <strong>${escapeHtml(item?.title || '')}</strong> akan dihapus dari galeri.</p><div class="button-row modal-actions"><button class="btn" data-action="close-modal">Batal</button><button class="btn btn-danger" data-action="confirm-delete-gallery" data-id="${target.dataset.id}">Hapus Foto</button></div>`);
    return;
  }
  if (action === 'confirm-delete-gallery') {
    try { const result = await api(`/api/admin/gallery/${target.dataset.id}`, { method: 'DELETE', body: {} }); toast(result.message); closeModal(); await loadBootstrap(); renderAdminGallery(); } catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (['approve-order', 'pending-order', 'cancel-order'].includes(action)) {
    const id = Number(target.dataset.id);
    const endpoint = action === 'approve-order' ? `/api/admin/orders/${id}/approve` : `/api/admin/orders/${id}/status`;
    const body = action === 'pending-order' ? { status: 'MENUNGGU_VERIFIKASI' } : action === 'cancel-order' ? { status: 'PEMBAYARAN_DITOLAK', reason: 'Pembayaran ditolak oleh admin.' } : {};
    const question = action === 'approve-order' ? 'Terima pembayaran dan kirim command rank ke plugin?' : action === 'cancel-order' ? 'Tolak pembayaran ini?' : 'Tetapkan sebagai menunggu verifikasi?';
    showModal(`<div class="modal-head"><h2>Konfirmasi</h2><button class="icon-button" data-action="close-modal">×</button></div><p>${escapeHtml(question)}</p><div class="button-row" style="justify-content:flex-end"><button class="btn" data-action="close-modal">Batal</button><button class="btn ${action === 'cancel-order' ? 'btn-danger' : 'btn-primary'}" data-action="confirm-order-action" data-endpoint="${endpoint}" data-body="${escapeHtml(JSON.stringify(body))}">Konfirmasi</button></div>`);
    return;
  }
  if (action === 'confirm-order-action') {
    try { const result = await api(target.dataset.endpoint, { method: target.dataset.endpoint.endsWith('/approve') ? 'POST' : 'PATCH', body: JSON.parse(target.dataset.body || '{}') }); toast(result.message); closeModal(); renderAdminOrders(); } catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (action === 'order-detail') {
    const order = state.adminCache.orders?.find((o) => o.id === Number(target.dataset.id));
    if (order) orderDetailModal(order);
    return;
  }
  if (action === 'save-order-status') {
    try {
      const result = await api(`/api/admin/orders/${target.dataset.id}/status`, { method: 'PATCH', body: { status: document.querySelector('#modal-order-status').value, reason: document.querySelector('#modal-order-reason').value } });
      toast(result.message); closeModal(); renderAdminOrders();
    } catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (action === 'toggle-user') {
    try { const result = await api(`/api/admin/users/${target.dataset.id}/status`, { method: 'PATCH', body: { status: target.dataset.status } }); toast(result.message); renderAdminUsers(); } catch (error) { toast(error.message, 'error'); }
    return;
  }
  if (action === 'change-role') {
    const user = state.adminCache.users?.find((u) => u.id === Number(target.dataset.id));
    showModal(`<div class="modal-head"><h2>Ubah Role</h2><button class="icon-button" data-action="close-modal">×</button></div><p>${escapeHtml(user?.displayName || '')} • ${escapeHtml(user?.email || '')}</p><div class="form-group"><label>Role Baru</label><select id="role-select"><option value="user" ${user?.role === 'user' ? 'selected' : ''}>User</option><option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option><option value="superadmin" ${user?.role === 'superadmin' ? 'selected' : ''}>Superadmin</option></select></div><button class="btn btn-primary" data-action="confirm-role" data-id="${target.dataset.id}">Simpan Role</button>`);
    return;
  }
  if (action === 'confirm-role') {
    try { const result = await api(`/api/admin/users/${target.dataset.id}/role`, { method: 'PATCH', body: { role: document.querySelector('#role-select').value } }); toast(result.message); closeModal(); renderAdminUsers(); } catch (error) { toast(error.message, 'error'); }
  }
});

window.addEventListener('hashchange', () => {
  document.querySelector('#nav-links')?.classList.remove('open');
  router();
});
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
  const progress = document.querySelector('#scroll-progress');
  if (progress) {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(100, (window.scrollY / max) * 100)}%`;
  }
}, { passive: true });

window.addEventListener('pointermove', (event) => {
  const glow = document.querySelector('#cursor-glow');
  if (glow) glow.style.transform = `translate(${event.clientX - 140}px, ${event.clientY - 140}px)`;
}, { passive: true });

(async function start() {
  try {
    applyTheme(initialTheme);
    await loadBootstrap();
    await router();
    if (isAcodePreview) {
      setTimeout(() => toast('Tampilan frontend aktif. Login, checkout, upload, Discord, dan database baru aktif setelah deploy ke Netlify.', 'success', 'Mode Preview Acode'), 450);
    }
    setInterval(async () => {
      try {
        const status = await api('/api/server-status');
        state.bootstrap.status = status;
        if (currentRoute().path === '/') renderHome(), observeAnimations();
        renderHeader();
      } catch (_) {}
    }, 30000);
  } catch (error) {
    app.innerHTML = `<div class="page-shell">${emptyState('Website belum dapat dimuat', error.message)}</div>`;
  }
})();
