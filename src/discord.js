const nacl = require('tweetnacl');
const { readState, mutateState, getFile } = require('./data-store');
const {
  getOrderDetailsFromState,
  approveAndQueueState,
  setOrderStatusState
} = require('./orders');

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ');
}

function buildComponents(orderId, disabled = false) {
  return [{
    type: 1,
    components: [
      { type: 2, style: 2, label: 'Pending', custom_id: `mf_pending:${orderId}`, disabled },
      { type: 2, style: 3, label: 'Done / Berikan Rank', custom_id: `mf_done:${orderId}`, disabled },
      { type: 2, style: 4, label: 'Cancel', custom_id: `mf_cancel:${orderId}`, disabled }
    ]
  }];
}

function buildEmbed(order, title = 'Transaksi Baru MineFiveID') {
  const products = (order.items || []).map((item) => `${item.product_name} ×${item.quantity}`).join('\n') || '-';
  return {
    title,
    description: 'Bukti pembayaran baru telah dikirim dan menunggu tindakan admin.',
    fields: [
      { name: 'ID Transaksi', value: order.order_code, inline: true },
      { name: 'Urutan Transaksi', value: `#${order.id}`, inline: true },
      { name: 'Status', value: statusLabel(order.status), inline: true },
      { name: 'Minecraft', value: `${order.minecraft_username_normalized} (${String(order.platform).toUpperCase()})`, inline: true },
      { name: 'WhatsApp', value: order.whatsapp || '-', inline: true },
      { name: 'Total', value: formatCurrency(order.total_amount), inline: true },
      { name: 'Produk', value: products, inline: false },
      { name: 'Akun Website', value: `${order.display_name} • ${order.email}`, inline: false }
    ],
    timestamp: new Date(order.updated_at || order.created_at).toISOString(),
    footer: { text: 'MineFiveID Store • Verifikasi pembayaran dengan teliti' }
  };
}

function hasDiscordPermission(body) {
  const allowedRoles = String(process.env.DISCORD_ADMIN_ROLE_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const memberRoles = Array.isArray(body.member?.roles) ? body.member.roles : [];
  if (allowedRoles.length > 0 && memberRoles.some((id) => allowedRoles.includes(id))) return true;

  try {
    const permissions = BigInt(body.member?.permissions || '0');
    const administrator = 1n << 3n;
    const manageGuild = 1n << 5n;
    return (permissions & administrator) !== 0n || (permissions & manageGuild) !== 0n;
  } catch (_) {
    return false;
  }
}

function verifyDiscordSignature(req) {
  const publicKey = String(process.env.DISCORD_PUBLIC_KEY || '').trim();
  const signature = String(req.get('x-signature-ed25519') || '').trim();
  const timestamp = String(req.get('x-signature-timestamp') || '').trim();
  if (!publicKey || !signature || !timestamp || !req.rawBody) return false;
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + req.rawBody.toString('utf8')),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex')
    );
  } catch (_) {
    return false;
  }
}

async function sendDiscordMessage(payload, file) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!token || !channelId) return null;

  const endpoint = `https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`;
  let body;
  const headers = { Authorization: `Bot ${token}` };

  if (file?.buffer) {
    const extension = file.mimeType === 'image/png' ? 'png' : file.mimeType === 'image/webp' ? 'webp' : 'jpg';
    const filename = `bukti-${Date.now()}.${extension}`;
    payload.embeds[0].image = { url: `attachment://${filename}` };
    const form = new FormData();
    form.append('payload_json', JSON.stringify(payload));
    form.append('files[0]', new Blob([file.buffer], { type: file.mimeType }), filename);
    body = form;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = await fetch(endpoint, { method: 'POST', headers, body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Discord HTTP ${response.status}: ${data.message || 'gagal mengirim pesan'}`);
  return data;
}

async function notifyNewPaymentProof(orderId) {
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CHANNEL_ID) return null;
  const state = await readState();
  const order = getOrderDetailsFromState(state, Number(orderId));
  if (!order) throw new Error('Pesanan tidak ditemukan.');
  const latestProof = order.proofs?.[0];
  let proofFile = null;
  if (latestProof?.blob_key) {
    const file = await getFile(latestProof.blob_key);
    if (file) proofFile = { buffer: file.buffer, mimeType: latestProof.mime_type };
  }

  const sent = await sendDiscordMessage({
    embeds: [buildEmbed(order)],
    components: buildComponents(order.id)
  }, proofFile);
  if (!sent) return null;

  await mutateState((draft) => {
    const stored = draft.orders.find((item) => item.id === order.id);
    if (stored) {
      stored.discord_message_id = sent.id;
      stored.discord_channel_id = sent.channel_id || process.env.DISCORD_CHANNEL_ID;
      stored.updated_at = new Date().toISOString();
    }
    return sent.id;
  });
  return sent.id;
}

async function handleDiscordInteraction(req, res) {
  if (!verifyDiscordSignature(req)) return res.status(401).send('invalid request signature');
  const interaction = req.body || {};
  if (interaction.type === 1) return res.json({ type: 1 });
  if (interaction.type !== 3 || !interaction.data?.custom_id?.startsWith('mf_')) {
    return res.json({ type: 4, data: { content: 'Interaction tidak didukung.', flags: 64 } });
  }
  if (!hasDiscordPermission(interaction)) {
    return res.json({ type: 4, data: { content: 'Kamu tidak memiliki izin untuk mengubah transaksi ini.', flags: 64 } });
  }

  const [action, rawOrderId] = String(interaction.data.custom_id).split(':');
  const orderId = Number(rawOrderId);
  if (!Number.isInteger(orderId)) {
    return res.json({ type: 4, data: { content: 'ID pesanan tidak valid.', flags: 64 } });
  }

  try {
    const updated = await mutateState((draft) => {
      if (action === 'mf_done') {
        approveAndQueueState(draft, orderId, null, `discord:${interaction.member?.user?.id || 'unknown'}`);
      } else if (action === 'mf_pending') {
        setOrderStatusState(draft, orderId, 'MENUNGGU_VERIFIKASI', null, null, `discord:${interaction.member?.user?.id || 'unknown'}`);
      } else if (action === 'mf_cancel') {
        setOrderStatusState(
          draft,
          orderId,
          'PEMBAYARAN_DITOLAK',
          null,
          'Dibatalkan melalui Discord oleh admin.',
          `discord:${interaction.member?.user?.id || 'unknown'}`
        );
      } else {
        const error = new Error('Tindakan tidak dikenal.');
        error.status = 400;
        throw error;
      }
      return getOrderDetailsFromState(draft, orderId);
    });

    const finalState = ['PESANAN_DIPROSES', 'PEMBAYARAN_DITOLAK', 'PESANAN_DIBATALKAN', 'PESANAN_SELESAI'].includes(updated.status);
    return res.json({
      type: 7,
      data: {
        embeds: [buildEmbed(updated, `Transaksi ${updated.order_code}`)],
        components: buildComponents(orderId, finalState)
      }
    });
  } catch (error) {
    console.error('[Discord] Interaction gagal:', error);
    return res.json({ type: 4, data: { content: `Gagal memproses tindakan: ${error.message}`, flags: 64 } });
  }
}

module.exports = {
  buildEmbed,
  buildComponents,
  notifyNewPaymentProof,
  handleDiscordInteraction
};
