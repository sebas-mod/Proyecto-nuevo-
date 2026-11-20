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
      throw new Error(data.message || 'Steer tomyla cuenta Viu del servador.');
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
      throw new Error(`Solicitar tiempo después de${TIMEOUT_MS / 1000}segundo`);
    }
    const msg = err.response?.data?.message || err.message || 'La conexión con el servidor Viu falló.';
    throw new Error(msg);
  }
}

async function handler(m, context) {
  const { sock, text, command, prefix } = context;
  const p = prefix || '.';
  const raw = String(text || m.quoted?.text || '').trim();

  if (/^(help|\?|-h|--help)$/i.test(raw)) {
    return m.reply(
      `🎬* VIU PREMUM ACCOUNT *\n\n` +
        `Las cuentas de viu premiere gratis de servador público.\n` +
        `Estoy atado a la id del diablo.\n\n` +
        `*Como usarlo:*\n` +
        `• \`${p}viuprem\`\n` +
        `  ↳Generar nueva cuenta (dispositivosdapakeid al azar )\n` +
        `• \`${p}viuprem <device_id>\`\n` +
        `  ↳Iniciar sesión usando el dispositivodnknid\n` +
        `• \`${p}viuprem --device <id>\`\n` +
        `  ↳Formato flag\n\n` +
        `* Aplausos *\`${p}viuprem\`_`
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
      `✅* VIU PREMUM ACCOUNT *🎬✨\n\n` +
      `╭┈┈⬡「 🔐 *KREDENSIAL* 」\n` +
      `┃ 📧*Correo:*${acc.email || '-'}\n` +
      `┃ 🔑 *Password:* ${acc.password || '-'}\n` +
      `┃ 🆔 *Device ID:* \`${result.device_id}\`\n` +
      `┃ 🏷️ *Status:* ${status}\n` +
      `┃ 🌐*Servidor:*${result.message}\n` +
      `┃ 🕒*Tiempo:*${new Date(result.fetched_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `•🔒* ¡Ahorra tu dispositivo!\n` +
      `•📱Login en:https://viu.com (elige "Login via correo")\n` +
      `•⚠No cambie su contraseña. Ag se puede utilizar juntos.`;

    await m.reply(resultText);
    try {
      await sock.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch {}
  } catch (err) {
    try {
      await sock.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    } catch {}

    return m.reply(
      `❌* Steenless toma una cuenta de VlU *\n\n` +
        `╭┈┈⬡「 🧾 *DETAIL ERROR* 」\n` +
        `┃ ${err.message}\n` +
        `┃ 🆔 Device ID: \`${deviceId}\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `Por favor, intente de nuevo o use dispositivodapaid de forma diferente.\n` +
        `Si sigue fallando, la posibilidad de servadores Fuego está kajada / mantenimiento.`
    );
  }
}

module.exports = {
  config: pluginConfig,
  handler,
  fetchViuAccount,
  generateDeviceId,
};
