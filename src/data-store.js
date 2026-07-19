const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const LOCAL_DATA_PATH = path.resolve(process.env.LOCAL_DATA_PATH || path.join(ROOT, 'database', 'minefive.json'));
const DATA_STORE_NAME = process.env.NETLIFY_DATA_STORE || 'minefive-data';
const FILE_STORE_NAME = process.env.NETLIFY_FILE_STORE || 'minefive-files';
const STATE_KEY = 'state.json';

let localQueue = Promise.resolve();

function nowIso() {
  return new Date().toISOString();
}

function createInitialState() {
  const createdAt = nowIso();
  return {
    version: 3,
    counters: {
      user: 1,
      product: 3,
      order: 0,
      payment: 0,
      proof: 0,
      media: 0,
      gallery: 4,
      job: 0,
      log: 0,
      resetToken: 0
    },
    settings: {
      server_name: 'MineFiveID',
      server_ip: 'minefive.my.id',
      server_port: '19011',
      server_description: 'MineFiveID adalah server Minecraft Survival Economy yang ringan dan nyaman dimainkan bersama teman-teman.',
      discord_url: '#',
      whatsapp_url: 'https://wa.me/6283830287126',
      rules_url: '#',
      announcement: 'Selamat datang di MineFiveID!',
      maintenance_store: 'false',
      logo_url: '/assets/minefive-logo.png',
      qris_url: '/assets/qris-minefive.jpg',
      background_url: '/assets/gallery/gallery-04.webp',
      ai_enabled: 'true',
      ai_welcome: 'Halo! Saya asisten MineFiveID. Tanyakan cara join, fitur server, rank, pembayaran, atau status server.',
      ai_rules: 'Jawab hanya pertanyaan tentang MineFiveID. Jika informasi tidak tersedia, arahkan member menghubungi admin.',
      ai_faq_json: JSON.stringify([
        { question: 'Bagaimana cara join?', answer: 'Java: gunakan IP minefive.my.id. Bedrock: gunakan IP minefive.my.id dan port 19011.' },
        { question: 'Apakah Java dan Bedrock bisa bermain bersama?', answer: 'Ya, MineFiveID mendukung Java dan Bedrock crossplay.' },
        { question: 'Bagaimana cara membeli rank?', answer: 'Buka Store, pilih rank, login, isi username serta WhatsApp, lalu bayar melalui QRIS dan unggah bukti transfer.' }
      ]),
      features_json: JSON.stringify([
        { title: 'Survival Economy', description: 'Bangun, berdagang, dan berkembang dalam ekonomi yang seimbang.', icon: '⛏' },
        { title: 'Java & Bedrock', description: 'Main bareng dari Java Edition maupun Bedrock Edition.', icon: '▣' },
        { title: 'Rank Premium', description: 'Benefit menarik tanpa merusak pengalaman survival.', icon: '✦' },
        { title: 'Event Komunitas', description: 'Event rutin, hadiah, dan aktivitas bersama pemain lain.', icon: '⚑' },
        { title: 'Vote Reward', description: 'Dapatkan hadiah setiap kali membantu vote server.', icon: '✓' },
        { title: 'Custom Features', description: 'Item dan fitur tambahan yang membuat gameplay lebih seru.', icon: '◆' }
      ])
    },
    users: [{
      id: 1,
      email: 'admin@minefive.my.id',
      password_hash: '$2a$12$vDsQauMfx2DpBh88RBUTjuK2bkApFXDqn9Srd4tK9aCdOcd396Z1O',
      display_name: 'MineFive Admin',
      whatsapp: '083830287126',
      role_name: 'superadmin',
      status: 'active',
      created_at: createdAt,
      updated_at: createdAt
    }],
    products: [
      {
        id: 1,
        slug: 'rank-five',
        name: 'Rank Five',
        icon_url: '✦',
        image_url: '',
        normal_price: 35000,
        sale_price: 29900,
        discount_percent: 15,
        description: 'Rank premium awal untuk pemain yang ingin mendapat kenyamanan tambahan.',
        duration: '30 Hari',
        badge: 'Rekomendasi',
        is_active: true,
        sort_order: 1,
        commands_json: JSON.stringify(['lp user %player% parent addtemp five 30d']),
        benefits: ['Prefix eksklusif', 'Akses /hat', 'Tambahan homes', 'Bonus key rank'],
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: 2,
        slug: 'rank-legend',
        name: 'Rank Legend',
        icon_url: '◆',
        image_url: '',
        normal_price: 65000,
        sale_price: 55000,
        discount_percent: 15,
        description: 'Rank premium dengan benefit lebih lengkap untuk petualanganmu.',
        duration: '30 Hari',
        badge: 'Terlaris',
        is_active: true,
        sort_order: 2,
        commands_json: JSON.stringify(['lp user %player% parent addtemp legend 30d']),
        benefits: ['Semua benefit Rank Five', 'Tambahan claim', 'Akses efek kosmetik', 'Bonus balance'],
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: 3,
        slug: 'rank-mythic',
        name: 'Rank Mythic',
        icon_url: '♛',
        image_url: '',
        normal_price: 110000,
        sale_price: 89000,
        discount_percent: 19,
        description: 'Paket premium tertinggi dengan benefit maksimal.',
        duration: '30 Hari',
        badge: 'Promo',
        is_active: true,
        sort_order: 3,
        commands_json: JSON.stringify(['lp user %player% parent addtemp mythic 30d']),
        benefits: ['Semua benefit Legend', 'Prioritas antrean', 'Lebih banyak homes dan claim', 'Bonus key eksklusif'],
        created_at: createdAt,
        updated_at: createdAt
      }
    ],
    orders: [],
    pluginJobs: [],
    serverStatus: {},
    passwordResetTokens: [],
    media: [],
    gallery: [
      { id: 1, title: 'Petualangan di Laut', description: 'Momen pemain MineFiveID menjelajah dunia dengan kosmetik eksklusif.', image_url: '/assets/gallery/gallery-01.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 1, featured: true, created_at: createdAt, updated_at: createdAt },
      { id: 2, title: 'Komunitas MineFiveID', description: 'Aktivitas komunitas dan momen seru bersama pemain lain.', image_url: '/assets/gallery/gallery-02.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 2, featured: false, created_at: createdAt, updated_at: createdAt },
      { id: 3, title: 'Foto Bersama', description: 'Kenangan komunitas MineFiveID yang tumbuh bersama.', image_url: '/assets/gallery/gallery-03.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 3, featured: false, created_at: createdAt, updated_at: createdAt },
      { id: 4, title: 'Dunia Survival Economy', description: 'Suasana dunia MineFiveID yang nyaman untuk bermain santai.', image_url: '/assets/gallery/gallery-04.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 4, featured: true, created_at: createdAt, updated_at: createdAt }
    ],
    adminActivityLogs: []
  };
}

function migrateState(state) {
  const createdAt = nowIso();
  state.version = Math.max(Number(state.version || 1), 3);
  state.counters = state.counters || {};
  state.settings = state.settings || {};
  state.media = Array.isArray(state.media) ? state.media : [];
  state.gallery = Array.isArray(state.gallery) ? state.gallery : [];
  state.adminActivityLogs = Array.isArray(state.adminActivityLogs) ? state.adminActivityLogs : [];

  const settingDefaults = {
    background_url: '/assets/gallery/gallery-04.webp',
    ai_enabled: 'true',
    ai_welcome: 'Halo! Saya asisten MineFiveID. Tanyakan cara join, fitur server, rank, pembayaran, atau status server.',
    ai_rules: 'Jawab hanya pertanyaan tentang MineFiveID. Jika informasi tidak tersedia, arahkan member menghubungi admin.',
    ai_faq_json: JSON.stringify([
      { question: 'Bagaimana cara join?', answer: 'Java: gunakan IP minefive.my.id. Bedrock: gunakan IP minefive.my.id dan port 19011.' },
      { question: 'Apakah Java dan Bedrock bisa bermain bersama?', answer: 'Ya, MineFiveID mendukung Java dan Bedrock crossplay.' },
      { question: 'Bagaimana cara membeli rank?', answer: 'Buka Store, pilih rank, login, isi username serta WhatsApp, lalu bayar melalui QRIS dan unggah bukti transfer.' }
    ])
  };
  for (const [key, value] of Object.entries(settingDefaults)) {
    if (state.settings[key] == null || state.settings[key] === '') state.settings[key] = value;
  }

  if (state.gallery.length === 0) {
    state.gallery.push(
      { id: 1, title: 'Petualangan di Laut', description: 'Momen pemain MineFiveID menjelajah dunia dengan kosmetik eksklusif.', image_url: '/assets/gallery/gallery-01.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 1, featured: true, created_at: createdAt, updated_at: createdAt },
      { id: 2, title: 'Komunitas MineFiveID', description: 'Aktivitas komunitas dan momen seru bersama pemain lain.', image_url: '/assets/gallery/gallery-02.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 2, featured: false, created_at: createdAt, updated_at: createdAt },
      { id: 3, title: 'Foto Bersama', description: 'Kenangan komunitas MineFiveID yang tumbuh bersama.', image_url: '/assets/gallery/gallery-03.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 3, featured: false, created_at: createdAt, updated_at: createdAt },
      { id: 4, title: 'Dunia Survival Economy', description: 'Suasana dunia MineFiveID yang nyaman untuk bermain santai.', image_url: '/assets/gallery/gallery-04.webp', blob_key: null, mime_type: 'image/webp', file_size: 0, sort_order: 4, featured: true, created_at: createdAt, updated_at: createdAt }
    );
  }
  state.counters.gallery = Math.max(Number(state.counters.gallery || 0), ...state.gallery.map((item) => Number(item.id || 0)), 4);
  return state;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isNetlifyRuntime() {
  return process.env.NETLIFY === 'true'
    || Boolean(process.env.CONTEXT || process.env.DEPLOY_ID || process.env.SITE_ID)
    || Boolean(process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN);
}

function blobOptions() {
  if (process.env.NETLIFY === 'true' || process.env.CONTEXT || process.env.DEPLOY_ID || process.env.SITE_ID) return undefined;
  if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
    return { siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN };
  }
  return undefined;
}

function getBlobStore(name) {
  const { getStore } = require('@netlify/blobs');
  const options = blobOptions();
  return options ? getStore(name, options) : getStore(name);
}

async function ensureLocalState() {
  await fs.promises.mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  try {
    await fs.promises.access(LOCAL_DATA_PATH, fs.constants.F_OK);
  } catch (_) {
    const initial = createInitialState();
    await writeLocalAtomic(initial);
  }
}

async function writeLocalAtomic(state) {
  await fs.promises.mkdir(path.dirname(LOCAL_DATA_PATH), { recursive: true });
  const temporary = `${LOCAL_DATA_PATH}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  await fs.promises.writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  await fs.promises.rename(temporary, LOCAL_DATA_PATH);
}

async function readLocalState() {
  await ensureLocalState();
  const raw = await fs.promises.readFile(LOCAL_DATA_PATH, 'utf8');
  return migrateState(JSON.parse(raw));
}

async function readBlobState() {
  const store = getBlobStore(DATA_STORE_NAME);
  const entry = await store.getWithMetadata(STATE_KEY, { type: 'json', consistency: 'strong' });
  if (entry && entry.data) return { state: migrateState(entry.data), etag: entry.etag };

  const initial = createInitialState();
  const created = await store.setJSON(STATE_KEY, initial, { onlyIfNew: true });
  if (created.modified) return { state: initial, etag: created.etag };

  const reread = await store.getWithMetadata(STATE_KEY, { type: 'json', consistency: 'strong' });
  if (!reread?.data) throw new Error('Gagal menginisialisasi penyimpanan Netlify Blobs.');
  return { state: migrateState(reread.data), etag: reread.etag };
}

async function readState() {
  if (isNetlifyRuntime()) {
    const { state } = await readBlobState();
    return clone(state);
  }
  await localQueue;
  return clone(await readLocalState());
}

async function mutateLocal(mutator) {
  const operation = localQueue.then(async () => {
    const state = await readLocalState();
    const result = await mutator(state);
    await writeLocalAtomic(state);
    return clone(result);
  });
  localQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

async function mutateBlob(mutator, attempts = 10) {
  const store = getBlobStore(DATA_STORE_NAME);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { state, etag } = await readBlobState();
    const result = await mutator(state);
    const options = etag ? { onlyIfMatch: etag } : { onlyIfNew: true };
    const written = await store.setJSON(STATE_KEY, state, options);
    if (written.modified) return clone(result);
    await new Promise((resolve) => setTimeout(resolve, 20 + Math.floor(Math.random() * 50) + attempt * 10));
  }
  const error = new Error('Data sedang diperbarui oleh request lain. Silakan coba lagi.');
  error.status = 409;
  throw error;
}

async function mutateState(mutator) {
  if (isNetlifyRuntime()) return mutateBlob(mutator);
  return mutateLocal(mutator);
}

async function saveFile({ key, buffer, mimeType, originalName, metadata = {} }) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  if (isNetlifyRuntime()) {
    const store = getBlobStore(FILE_STORE_NAME);
    await store.set(key, buffer, {
      metadata: {
        mimeType,
        originalName: originalName || '',
        size: buffer.length,
        ...metadata
      }
    });
    return key;
  }

  const localPath = path.join(ROOT, 'uploads', key);
  await fs.promises.mkdir(path.dirname(localPath), { recursive: true });
  await fs.promises.writeFile(localPath, buffer);
  await fs.promises.writeFile(`${localPath}.json`, JSON.stringify({ mimeType, originalName, size: buffer.length, ...metadata }), 'utf8');
  return key;
}

async function getFile(key) {
  if (isNetlifyRuntime()) {
    const store = getBlobStore(FILE_STORE_NAME);
    const entry = await store.getWithMetadata(key, { type: 'arrayBuffer', consistency: 'strong' });
    if (!entry?.data) return null;
    return {
      buffer: Buffer.from(entry.data),
      metadata: entry.metadata || {}
    };
  }

  const localPath = path.join(ROOT, 'uploads', key);
  try {
    const [buffer, metadataRaw] = await Promise.all([
      fs.promises.readFile(localPath),
      fs.promises.readFile(`${localPath}.json`, 'utf8').catch(() => '{}')
    ]);
    return { buffer, metadata: JSON.parse(metadataRaw) };
  } catch (_) {
    return null;
  }
}

async function deleteFile(key) {
  if (!key) return;
  if (isNetlifyRuntime()) {
    const store = getBlobStore(FILE_STORE_NAME);
    await store.delete(key);
    return;
  }
  const localPath = path.join(ROOT, 'uploads', key);
  await Promise.allSettled([
    fs.promises.unlink(localPath),
    fs.promises.unlink(`${localPath}.json`)
  ]);
}

function nextId(state, name) {
  state.counters[name] = Number(state.counters[name] || 0) + 1;
  return state.counters[name];
}

function appendAdminLog(state, adminUserId, action, entityType, entityId, metadata = {}) {
  const id = nextId(state, 'log');
  state.adminActivityLogs.push({
    id,
    admin_user_id: adminUserId ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId == null ? null : String(entityId),
    metadata_json: JSON.stringify(metadata),
    created_at: nowIso()
  });
  if (state.adminActivityLogs.length > 2000) state.adminActivityLogs.splice(0, state.adminActivityLogs.length - 2000);
  return id;
}

module.exports = {
  createInitialState,
  readState,
  mutateState,
  saveFile,
  getFile,
  deleteFile,
  nextId,
  appendAdminLog,
  nowIso,
  isNetlifyRuntime
};
