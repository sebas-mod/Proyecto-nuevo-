const axios = require('axios');

const pluginConfig = {
  name: 'reactch',
  alias: ['rch', 'reactchannel', 'chreact'],
  category: 'tools',
  description: 'Sentencia de una reacción emoji al mensaje de Channel WhatsApp',
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
      `❌*Formato Incorrecto!*\n\n` +
        `Usa formato:\n` +
        `> \`${p}${cmd} <url-pesan-channel> <emoji>\`\n\n` +
        `Ejemplo:\n` +
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

  //1. Método Intenta camarellaa ingenua si el servidor está disponible y boletín informativo ReactMessage es compatible
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
      //Ingenua socket falló, retroceso a la Fuego de nube
    }
  }

  //2. Retroceder a Fuego Cloud si la ingenua falla o URL sin servidor separado
  if (!reactSuccess) {
    try {
      const apiUrl = `https://api-cloud.my.id/tools/rchv2?link=${encodeURIComponent(targetUrl)}&emoji=${encodeURIComponent(reactionEmoji)}`;
      const res = await axios.get(apiUrl, { timeout: 15000 });
      const data = res.data || {};

      if (data.status === true || data.status === 200 || data.success) {
        reactSuccess = true;
        methodUsed = 'Cloud Channel API Provider';
      } else {
        throw new Error(data.message || data.msg || 'La esterendomidad envía reacciones al Canal');
      }
    } catch (apiErr) {
      const errMsg = apiErr.response?.data?.message || apiErr.message || 'El truco envía reacciones.';
      return m.reply(`❌* Steendom envía reacción al Canal: *\n•${errMsg}`);
    }
  }

  if (reactSuccess) {
    return m.reply(
      `✅* REACTION CHANNEL EXPLOSIONS *\n\n` +
        `📢*Enlace:*${targetUrl}\n` +
        `💬 *Reaction:* ${reactionEmoji}\n` +
        `⚙️ *Metodo:*${methodUsed}`
    );
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  parseChannelUrl,
};
