const crypto = require('crypto');
const axios = require('axios');

const VIU_API = 'https://viu.interflazz.my.id/?action=account';
const TIMEOUT_MS = 25000;
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';

const pluginConfig = {
  name: 'viuprem',
  alias: ['viu', 'viupremium'],
  category: 'tools',
  description: 'Generate akun Viu Premium gratis terikat Device ID',
  usage: '.viuprem [device_id]',
  example: '.viuprem',
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  limit: 1,
  isEnabled: true,
};

function generateDeviceId(seed = null) {
  if (seed) {
    return crypto.createHash('md5').update(String(seed)).digest('hex');
  }
  return crypto.randomBytes(16).toString('hex');
}

async function fetchViuAccount(deviceId) {
  try {
    const res = await axios.post(
      VIU_API,
      { device_id: deviceId },
      {
        headers: {
          'User-Agent': UA,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Origin: 'https://viu.interflazz.my.id',
        },
        timeout: TIMEOUT_MS,
      }
    );

    const data = res.data || {};
    if (!data.success) {
      throw new Error(data.message || 'Gagal mengambil akun Viu dari server.');
    }

    return {
      success: true,
      message: data.message || 'OK',
      is_new: Boolean(data.is_new),
      device_id: data.device_id || deviceId,
      account: {
        email: data.account?.email || null,
        password: data.account?.password || null,
      },
      fetched_at: new Date().toISOString(),
    };
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      throw new Error(`Request timeout setelah ${TIMEOUT_MS / 1000} detik`);
    }
    const msg = err.response?.data?.message || err.message || 'Koneksi ke server Viu gagal.';
    throw new Error(msg);
  }
}

async function handler(m, context) {
  const { sock, text, command, prefix } = context;
  const p = prefix || '.';
  const raw = String(text || m.quoted?.text || '').trim();

  if (/^(help|\?|-h|--help)$/i.test(raw)) {
    return m.reply(
      `🎬 *VIU PREMIUM ACCOUNT*\n\n` +
        `> Dapatkan akun VIU premium gratis dari server publik.\n` +
        `> Akun terikat dengan *device_id* (gunakan ID yang sama untuk akun yang sama).\n\n` +
        `*CARA PENGGUNAAN:*\n` +
        `• \`${p}viuprem\`\n` +
        `  ↳ Generate akun baru (device_id acak)\n` +
        `• \`${p}viuprem <device_id>\`\n` +
        `  ↳ Login pakai device_id tertentu\n` +
        `• \`${p}viuprem --device <id>\`\n` +
        `  ↳ Format flag\n\n` +
        `_Contoh: \`${p}viuprem\`_`
    );
  }

  let deviceId = '';
  const flagMatch = raw.match(/(?:--device|-d)\s+([a-f0-9]{32})/i);
  if (flagMatch) {
    deviceId = flagMatch[1].toLowerCase();
  } else {
    const idMatch = raw.match(/\b([a-f0-9]{32})\b/i);
    if (idMatch) {
      deviceId = idMatch[1].toLowerCase();
    }
  }

  if (!deviceId && raw) {
    deviceId = generateDeviceId(raw);
  } else if (!deviceId) {
    deviceId = generateDeviceId();
  }

  try {
    await sock.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
  } catch {}

  try {
    const result = await fetchViuAccount(deviceId);
    const acc = result.account || {};
    const status = result.is_new ? '🆕 *AKUN BARU*' : '♻️ *AKUN EXISTING*';

    const resultText =
      `✅ *VIU PREMIUM ACCOUNT* 🎬✨\n\n` +
      `╭┈┈⬡「 🔐 *KREDENSIAL* 」\n` +
      `┃ 📧 *Email:* ${acc.email || '-'}\n` +
      `┃ 🔑 *Password:* ${acc.password || '-'}\n` +
      `┃ 🆔 *Device ID:* \`${result.device_id}\`\n` +
      `┃ 🏷️ *Status:* ${status}\n` +
      `┃ 🌐 *Server:* ${result.message}\n` +
      `┃ 🕒 *Waktu:* ${new Date(result.fetched_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> 🔒 *Simpan device_id kamu!* Pakai device_id yang sama untuk login ulang.\n` +
      `> 📱 Login di: https://viu.com (pilih "Login via email")\n` +
      `> ⚠️ Jangan ganti password agar bisa dipakai bersama.`;

    await m.reply(resultText);
    try {
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch {}
  } catch (err) {
    try {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    } catch {}

    return m.reply(
      `❌ *Gagal mengambil akun VIU*\n\n` +
        `╭┈┈⬡「 🧾 *DETAIL ERROR* 」\n` +
        `┃ ${err.message}\n` +
        `┃ 🆔 Device ID: \`${deviceId}\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Silakan coba beberapa saat lagi atau gunakan device_id berbeda.\n` +
        `> Jika terus gagal, kemungkinan server API sedang down/maintenance.`
    );
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  fetchViuAccount,
  generateDeviceId,
};
