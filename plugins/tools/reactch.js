const axios = require('axios');

const pluginConfig = {
  name: 'reactch',
  alias: ['rch', 'reactchannel', 'chreact'],
  category: 'tools',
  description: 'Mengirim reaction emoji ke pesan WhatsApp Channel',
  usage: '.rch <url pesan channel> [emoji]',
  example: '.rch https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D/100 👍',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  limit: 1,
  isEnabled: true,
};

function parseChannelUrl(url) {
  const match = String(url || '').trim().match(/whatsapp\.com\/channel\/([A-Za-z0-9_-]+)(?:\/(\d+))?/i);
  if (!match) return null;
  return {
    code: match[1],
    serverId: match[2] || null,
  };
}

async function handler(m, context) {
  const { sock, text, command, prefix } = context;
  const p = prefix || '.';
  const cmd = command || 'rch';

  if (!text) {
    return m.reply(
      `❌ *Format Salah!*\n\n` +
        `Gunakan format:\n` +
        `> \`${p}${cmd} <url-pesan-channel> <emoji>\`\n\n` +
        `Contoh:\n` +
        `> \`${p}${cmd} https://whatsapp.com/channel/0029VaBOlsv002TEjlntTE2D/123 👍\``
    );
  }

  const args = text.trim().split(/\s+/);
  const targetUrl = args[0];
  const reactionEmoji = args[1] || '👍';

  const parsed = parseChannelUrl(targetUrl);
  if (!parsed) {
    return m.reply('❌ URL tidak valid. Pastikan format URL WhatsApp Channel benar (contoh: https://whatsapp.com/channel/...)');
  }

  let reactSuccess = false;
  let methodUsed = '';

  // 1. Coba metode native cantarelllaa jika serverId tersedia dan newsletterReactMessage didukung
  if (parsed.serverId && typeof sock.newsletterReactMessage === 'function') {
    try {
      let channelJid = null;
      if (typeof sock.newsletterMetadata === 'function') {
        const meta = await sock.newsletterMetadata('invite', parsed.code);
        if (meta && meta.id) channelJid = meta.id;
      }

      if (channelJid) {
        await sock.newsletterReactMessage(channelJid, parsed.serverId, reactionEmoji);
        reactSuccess = true;
        methodUsed = 'Native WhatsApp Socket (cantarelllaa)';
      }
    } catch (nativeErr) {
      // Native socket failed, fallback to cloud API
    }
  }

  // 2. Fallback ke API Cloud jika native gagal atau URL tanpa serverId terpisah
  if (!reactSuccess) {
    try {
      const apiUrl = `https://api-cloud.my.id/tools/rchv2?link=${encodeURIComponent(targetUrl)}&emoji=${encodeURIComponent(reactionEmoji)}`;
      const res = await axios.get(apiUrl, { timeout: 15000 });
      const data = res.data || {};

      if (data.status === true || data.status === 200 || data.success) {
        reactSuccess = true;
        methodUsed = 'Cloud Channel API Provider';
      } else {
        throw new Error(data.message || data.msg || 'Gagal mengirim reaction ke channel');
      }
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.message || apiErr.message || 'Gagal mengirim reaction.';
      return m.reply(`❌ *Gagal mengirim reaction ke channel:*\n> ${errMsg}`);
    }
  }

  if (reactSuccess) {
    return m.reply(
      `✅ *REACTION CHANNEL BERHASIL!*\n\n` +
        `📢 *Tautan:* ${targetUrl}\n` +
        `💬 *Reaction:* ${reactionEmoji}\n` +
        `⚙️ *Metode:* ${methodUsed}`
    );
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  parseChannelUrl,
};
