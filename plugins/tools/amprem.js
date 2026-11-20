const axios = require('axios');

const BASE_URL = 'https://am.zervida.my.id';
const API_LINK = `${BASE_URL}/api/amprem/link`;
const API_CLAIM = `${BASE_URL}/api/amprem/claim`;
const TIMEOUT_MS = 5 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINK_RE = /^https?:\/\/alight-creative\.firebaseapp\.com\/\S+$/i;

if (!global.ampremState) global.ampremState = {};

const react = async (sock, m, emoji) => {
  try {
    await sock.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  } catch {}
};

const send = (sock, m, text) => m.reply(text);

function cancelState(userId) {
  if (global.ampremState[userId]?.timer) {
    clearTimeout(global.ampremState[userId].timer);
  }
  delete global.ampremState[userId];
}

function waitForLink(sock, m, email) {
  const userId = m.sender;
  cancelState(userId);
  const timer = setTimeout(() => {
    if (global.ampremState[userId]?.timer !== timer) return;
    delete global.ampremState[userId];
    send(sock, m, '⌛ Proses Alight Motion dibatalkan otomatis (timeout 5 menit).').catch(() => null);
  }, TIMEOUT_MS);
  if (timer.unref) timer.unref();
  global.ampremState[userId] = { email, timer };
}

async function claim(sock, m, email, link) {
  await send(sock, m, '⏳ *Memverifikasi & klaim Alight Motion Premium...*');
  try {
    const { data = {} } = await axios.post(
      API_CLAIM,
      { email, link },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000,
      }
    );
    if (data.status === 'premium' || data.success) {
      await send(
        sock,
        m,
        `🎉 *ALIGHT MOTION PREMIUM AKTIF!*\n\n` +
          `📧 *Email:* \`${email}\`\n` +
          `💎 *Status:* PREMIUM\n\n` +
          `📱 Silakan buka aplikasi Alight Motion di HP kamu!`
      );
      return react(sock, m, '✅');
    }
    await send(sock, m, `⚠️ *Klaim belum berhasil.*\n\nError: ${data.error || data.message || 'Coba lagi nanti'}`);
    return react(sock, m, '❌');
  } catch (err) {
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Coba lagi nanti';
    await send(sock, m, `❌ *Gagal klaim:* ${errMsg}`);
    return react(sock, m, '❌');
  }
}

const pluginConfig = {
  name: 'amprem',
  alias: ['alightprem', 'batalkan'],
  category: 'tools',
  description: 'Klaim akun Alight Motion Premium via Email / Magic Link',
  usage: '.amprem <email> [link] atau .batalkan',
  example: '.amprem user@gmail.com',
  isOwner: false,
  isPremium: false, // Diperiksa di dalam handler agar .batalkan bisa diakses semua user yang memulai
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  limit: 1,
  isEnabled: true,
};

async function handler(m, context) {
  const { sock, text, command, prefix } = context;
  const userId = m.sender;
  const p = prefix || '.';
  const cmd = (command || '').toLowerCase();
  const body = (m.text || text || '').trim();

  // Command: .batalkan
  if (cmd === 'batalkan') {
    if (!global.ampremState[userId]) {
      return m.reply('⚠️ Tidak ada proses Alight Motion yang sedang berjalan.');
    }
    cancelState(userId);
    await react(sock, m, '🛑');
    return m.reply(`✅ Proses Alight Motion dibatalkan.\nKetik \`${p}amprem email@kamu.com\` untuk memulai kembali.`);
  }

  // Cek izin premium untuk memulai .amprem
  if (!m.isOwner && !m.isPremium) {
    return m.reply('⚠️ Fitur *Alight Motion Premium* khusus untuk Owner dan User Premium.');
  }

  const parts = body.split(/\s+/).filter(Boolean);
  const email = parts.find((v) => EMAIL_RE.test(v));
  const link = parts.find((v) => LINK_RE.test(v));

  if (!email && !global.ampremState[userId]) {
    return m.reply(
      `🚀 *ALIGHT MOTION PREMIUM*\n\n` +
        `Masukkan email kamu bersamaan dengan command:\n` +
        `> \`${p}amprem emailkamu@gmail.com\`\n\n` +
        `Atau jika sudah punya link login:\n` +
        `> \`${p}amprem emailkamu@gmail.com https://alight-creative.firebaseapp.com/...\``
    );
  }

  // Jika input mengandung link langsung
  if (link && (email || global.ampremState[userId]?.email)) {
    const targetEmail = email || global.ampremState[userId].email;
    cancelState(userId);
    return claim(sock, m, targetEmail, link);
  }

  if (email) {
    await react(sock, m, '⏳');
    try {
      const { data } = await axios.post(
        API_LINK,
        { email },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        }
      );
      if (data?.status === 'premium') {
        cancelState(userId);
        await react(sock, m, '✅');
        return m.reply('🎉 *Akun Alight Motion ini sudah Premium!*');
      }
    } catch (err) {
      cancelState(userId);
      await react(sock, m, '❌');
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Gagal mengirim link.';
      return m.reply(`❌ *Gagal kirim link:* ${msg}`);
    }

    waitForLink(sock, m, email);
    await react(sock, m, '📩');
    return m.reply(
      `📩 *Magic link telah dikirim ke:* \`${email}\`\n\n` +
        `1. Cek Inbox / Spam email kamu.\n` +
        `2. Salin tautan *"Sign in to Alight Creative"*.\n` +
        `3. Kirim link tersebut ke sini dalam waktu 5 menit.\n\n` +
        `Untuk membatalkan, ketik: \`${p}batalkan\``
    );
  }

  // Jika user mengirimkan link magic link yang sedang dinanti
  const state = global.ampremState[userId];
  if (state && LINK_RE.test(body)) {
    clearTimeout(state.timer);
    const targetEmail = state.email;
    delete global.ampremState[userId];
    return claim(sock, m, targetEmail, body);
  }
}

module.exports = {
  config: pluginConfig,
  handler,
};
