const axios = require('axios');

const BASE_URL = 'https://am.zervida.my.id';
const API_LINK = `${BASE_URL}/fuego/amprem/enlace`;
const API_CLAIM = `${BASE_URL}/fuego/amprem/claim`;
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
        `🎉¡Profesional de la luna de sol!\n\n` +
          `📧*Correo:*\`${email}\`\n` +
          `💎 *Status:* PREMIUM\n\n` +
          `📱Por favor, abra la aplicación Alight Motion en su HP!`
      );
      return react(sock, m, '✅');
    }
    await send(sock, m, `⚠> 91; Sigue llorando " #93; ' no lo entiende ".\n\nError:${data.error || data.message || 'Coba lagi nanti'}`);
    return react(sock, m, '❌');
  } catch (err) {
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Coba lagi nanti';
    await send(sock, m, `❌*Fallido klaim:*${errMsg}`);
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
  isPremium: false, //Perspectiva en los manipuladores de para que. Destierrado se puede realizar todos los usuarios lamentables
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

  //Comando:.cancela
  if (cmd === 'batalkan') {
    if (!global.ampremState[userId]) {
      return m.reply('⚠No existe un proceso de moción de la luz en el camino.');
    }
    cancelState(userId);
    await react(sock, m, '🛑');
    return m.reply(`✅La mano derecha @-@ a @-@ movimiento de luz de mano se cancela.\nEscribe\`${p}amprem correo@tu.com\`Para revalorizar.`);
  }

  //Cheque de permiso de primera calidad para halagar.
  if (!m.isOwner && !m.isPremium) {
    return m.reply('⚠*El Modo* *Brillo Motion Premium*');
  }

  const parts = body.split(/\s+/).filter(Boolean);
  const email = parts.find((v) => EMAIL_RE.test(v));
  const link = parts.find((v) => LINK_RE.test(v));

  if (!email && !global.ampremState[userId]) {
    return m.reply(
      `🚀* ALIGHT MOTION PREMUM*\n\n` +
        `Introduzca su correo electrónico con el comando:\n` +
        `> \`${p}amprem emailkamu@gmail.com\`\n\n` +
        `Sé si tengo un registro de enlace:\n` +
        `> \`${p}amprem emailkamu@gmail.com https://alight-creative.firebaseapp.com/...\``
    );
  }

  //Si la entrada es langsung embarazada enlaces
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
        return m.reply('🎉¡Esto es Premium!');
      }
    } catch (err) {
      cancelState(userId);
      await react(sock, m, '❌');
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'El truco envía un enlace.';
      return m.reply(`❌* Gaggle send enlace: *${msg}`);
    }

    waitForLink(sock, m, email);
    await react(sock, m, '📩');
    return m.reply(
      `📩* El enlace mágico ha sido enviado a: *\`${email}\`\n\n` +
        `1.x- Su ervao electroco spam.\n` +
        `2. Copia enlace *"Sign in to Alight Creative"*.\n` +
        `El Kpenplink debe estar aquí en cinco minutos.\n\n` +
        `Para dar vueltas, amigo:\`${p}batalkan\``
    );
  }

  //Si el usuario envía el enlace de espera actual Enlace mágico
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
