const { nextId, appendAdminLog, nowIso } = require('./data-store');

const VALID_STATUSES = [
  'MENUNGGU_PEMBAYARAN',
  'MENUNGGU_VERIFIKASI',
  'PEMBAYARAN_DITERIMA',
  'PESANAN_DIPROSES',
  'PESANAN_SELESAI',
  'PEMBAYARAN_DITOLAK',
  'PESANAN_DIBATALKAN'
];

function normalizeMinecraftUsername(username, platform) {
  const clean = String(username || '').trim().replace(/\s+/g, '');
  if (!/^[A-Za-z0-9_.-]{3,32}$/.test(clean)) {
    throw new Error('Username Minecraft harus 3-32 karakter dan hanya berisi huruf, angka, titik, garis bawah, atau strip.');
  }
  if (platform === 'bedrock') return clean.startsWith('.') ? clean : `.${clean}`;
  return clean.replace(/^\.+/, '');
}

function generateOrderCode(state) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `MF-${yyyy}${mm}${dd}-`;
  let max = 0;
  for (const order of state.orders) {
    if (!String(order.order_code).startsWith(prefix)) continue;
    const serial = Number(String(order.order_code).split('-').pop());
    if (Number.isFinite(serial)) max = Math.max(max, serial);
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

function getOrderDetailsFromState(state, orderIdOrCode) {
  const order = typeof orderIdOrCode === 'number'
    ? state.orders.find((item) => item.id === orderIdOrCode)
    : state.orders.find((item) => item.order_code === String(orderIdOrCode));
  if (!order) return null;
  const user = state.users.find((item) => item.id === order.user_id);
  return {
    ...order,
    email: user?.email || '-',
    display_name: user?.display_name || '-',
    items: Array.isArray(order.items) ? order.items : [],
    payment: order.payment || null,
    proofs: Array.isArray(order.proofs) ? order.proofs : []
  };
}

function buildFulfillmentPayload(order) {
  const commands = [];
  for (const item of order.items || []) {
    const itemCommands = Array.isArray(item.commands)
      ? item.commands
      : safeJson(item.commands_json, []);
    for (const command of itemCommands) {
      commands.push(String(command)
        .replaceAll('%player%', order.minecraft_username_normalized)
        .replaceAll('%username%', order.minecraft_username_normalized)
        .replaceAll('%order_id%', order.order_code)
        .replaceAll('%product%', item.product_name)
        .replaceAll('%platform%', order.platform)
        .replaceAll('%duration%', item.duration || '')
        .replaceAll('%uuid%', ''));
    }
  }
  return {
    orderId: order.id,
    orderCode: order.order_code,
    player: order.minecraft_username_normalized,
    originalPlayer: order.minecraft_username,
    platform: order.platform,
    commands,
    products: (order.items || []).map((item) => item.product_name)
  };
}

function approveAndQueueState(state, orderId, adminUserId = null, source = 'admin') {
  const order = getOrderDetailsFromState(state, Number(orderId));
  if (!order) throw new Error('Pesanan tidak ditemukan.');
  if (['PEMBAYARAN_DITOLAK', 'PESANAN_DIBATALKAN', 'PESANAN_SELESAI'].includes(order.status)) {
    throw new Error(`Pesanan tidak dapat diproses dari status ${order.status}.`);
  }

  const timestamp = nowIso();
  const storedOrder = state.orders.find((item) => item.id === order.id);
  storedOrder.status = 'PESANAN_DIPROSES';
  storedOrder.rejection_reason = null;
  storedOrder.updated_at = timestamp;
  if (storedOrder.payment) {
    storedOrder.payment.status = 'PEMBAYARAN_DITERIMA';
    storedOrder.payment.verified_by = adminUserId;
    storedOrder.payment.verified_at = timestamp;
    storedOrder.payment.updated_at = timestamp;
  }

  let existing = state.pluginJobs
    .filter((job) => job.order_id === order.id && ['pending', 'processing', 'success'].includes(job.status))
    .sort((a, b) => b.id - a.id)[0];

  if (!existing) {
    const id = nextId(state, 'job');
    existing = {
      id,
      order_id: order.id,
      server_id: process.env.PLUGIN_SERVER_ID || 'minefive-main',
      payload: buildFulfillmentPayload(getOrderDetailsFromState(state, order.id)),
      status: 'pending',
      attempts: 0,
      last_error: null,
      created_at: timestamp,
      updated_at: timestamp
    };
    state.pluginJobs.push(existing);
  }

  appendAdminLog(state, adminUserId, 'approve_and_queue', 'order', order.id, { source, jobId: existing.id });
  return { orderId: order.id, jobId: existing.id };
}

function setOrderStatusState(state, orderId, status, adminUserId = null, reason = null, source = 'admin') {
  if (!VALID_STATUSES.includes(status)) throw new Error('Status pesanan tidak valid.');
  const order = state.orders.find((item) => item.id === Number(orderId));
  if (!order) throw new Error('Pesanan tidak ditemukan.');
  const timestamp = nowIso();
  order.status = status;
  order.rejection_reason = reason || null;
  order.updated_at = timestamp;
  if (order.payment) {
    order.payment.status = status;
    order.payment.updated_at = timestamp;
  }
  appendAdminLog(state, adminUserId, 'change_status', 'order', order.id, { status, reason, source });
  return getOrderDetailsFromState(state, order.id);
}

function safeJson(value, fallback) {
  try { return JSON.parse(value); } catch (_) { return fallback; }
}

module.exports = {
  VALID_STATUSES,
  normalizeMinecraftUsername,
  generateOrderCode,
  getOrderDetailsFromState,
  approveAndQueueState,
  setOrderStatusState,
  buildFulfillmentPayload,
  safeJson
};
