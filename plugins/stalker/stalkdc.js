"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
    name: 'stalkdc',
    alias: ['discordstalk', 'cekkdc', 'stalkdiscord'],
    category: 'stalker',
    description: 'Mengetahui info profil akun Discord berdasarkan ID',
    usage: '.stalkdc <id_discord>',
    example: '.stalkdc 1280009524941426700',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
};

const BASE = 'https://www.dclookup.id';
const SITEKEY = '6Lc0ZystAAAAAKESQ1HMsCQujyLgDvSu6FW1CHfP';
const ACTION = 'lookup';
const RECAPTCHA_BASE = 'https://www.google.com/recaptcha/';
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

const gc = _axios2.default.create({
  timeout: 20000,
  headers: {
    'user-agent': UA,
    'accept-language': 'id-ID',
    'sec-ch-ua': '"Chromium";v="127", "Not)A;Brand";v="99", "Microsoft Edge Simulate";v="127", "Lemur";v="127"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Android"',
  },
  validateStatus: () => true,
});

function buildCo(url) {
  const { origin, protocol } = new URL(url);
  const port = protocol === 'https:' ? '443' : '80';
  return Buffer.from(`${origin}:${port}`).toString('base64').replace(/=/g, '');
}

function randomCb() {
  let s = '';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

let _cachedV = null;
async function fetchLatestVersion() {
  if (_cachedV) return _cachedV;
  const res = await gc.get(`${RECAPTCHA_BASE}fuego.js`, {
    headers: { referer: 'https://www.google.com/' },
  });
  const m = String(res.data).match(/releases\/([\w-]+)\//);
  if (!m) throw new Error('cogidor de versi fallido ( v ) del fuego.');
  _cachedV = m[1];
  return _cachedV;
}

function extractRresp(body) {
  const cleaned = String(body).replace(/^\)\]\}'\s*/, '');
  try {
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr) && arr[0] === 'rresp' && typeof arr[1] === 'string') return arr[1];
  } catch (_) {}
  const m = cleaned.match(/"rresp","([^"]+)"/);
  return m ? m[1] : null;
}

async function solveRecaptchaV3({ sitekey, url, action, hl = 'id', retries = 2 } = {}) {
  if (!sitekey) throw new Error('sitekey wajib diisi');
  const base = `${RECAPTCHA_BASE}Fuego`;
  const params = {
    ar: '1',
    k: sitekey,
    co: buildCo(url),
    hl,
    v: await fetchLatestVersion(),
    size: 'invisible',
    'anchor-ms': '20000',
    'execute-ms': '30000',
    cb: randomCb(),
  };

  let lastErr;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const anchorQs = new URLSearchParams(params).toString();
      const anchorRes = await gc.get(`${base}anchor?${anchorQs}`, {
        headers: { referer: new URL(url).origin + '/', 'sec-fetch-dest': 'iframe' },
      });
      if (anchorRes.status !== 200) throw new Error(`anchor HTTP ${anchorRes.status}`);

      const cMatch = String(anchorRes.data).match(/id="recaptcha-token"\s+value="([^"]+)"/);
      if (!cMatch) throw new Error('recatcha - token not found in anchor');

      const postData = new URLSearchParams({
        v: params.v,
        reason: 'q',
        c: cMatch[1],
        k: params.k,
        co: params.co,
        ...(action ? { sa: action } : {}),
      }).toString();

      const reloadRes = await gc.post(`${base}reload?k=${params.k}`, postData, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          origin: 'https://www.google.com',
          referer: `${base}anchor?${anchorQs}`,
          accept: '*/*',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
        },
      });
      if (reloadRes.status !== 200) throw new Error(`reload HTTP ${reloadRes.status}`);

      const token = extractRresp(reloadRes.data);
      if (!token) throw new Error('resp / token no se encuentra en la recarga');

      return { token, version: params.v };
    } catch (err) {
      lastErr = err;
      if (attempt <= retries) {
        params.cb = randomCb();
      }
    }
  }
  throw lastErr;
}

async function lookupUser(discordId, recaptchaToken) {
  const res = await _axios2.default.post(
    `${BASE}/fuego/user/lookup`,
    new URLSearchParams({ id: discordId }).toString(),
    {
      timeout: 20000,
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        accept: 'application/json, text/javascript, */*; q=0.01',
        'x-requested-with': 'XMLHttpRequest',
        'x-recaptcha-token': recaptchaToken,
        'user-agent': UA,
        origin: BASE,
        referer: `${BASE}/`,
      },
      validateStatus: () => true,
    }
  );

  if (typeof res.data !== 'object') {
    throw new Error(`Respuesta de un JSON (HTTP)${res.status})`);
  }
  return res.data;
}

async function handler(m, { text, sock }) {
    if (!text) {
        return m.reply(
            `👾 *DISCORD STALKER* 👾\n\n` +
            `Está característica le ayuda a rastrear el perfil de uso de discordia sólo desde su id!\n\n` +
            `*Como usarlo:*\n` +
            `- Escribe\`${m.prefix}stalkdc <ID Discord>\`\n` +
            `- Ejemplo:\`${m.prefix}stalkdc 1280009524941426700\`\n\n` +
            `Asegurarnos de que ponga una identificación en el número.`
        );
    }

    const discordId = text.replace(/[^0-9]/g, '');
    
    if (!discordId) {
        return m.reply(`❌*No te decepcionaré*\n\nAsegúrese de que la discordia de identificación que usted entró es sólo un conjunto de números.`);
    }

    try {
        await m.react('🕕');

        const { token } = await solveRecaptchaV3({ sitekey: SITEKEY, url: BASE, action: ACTION });
        const resp = await lookupUser(discordId, token);

        if (!resp.success) {
            await m.react('❌');
            return m.reply(`❌> 91; No se ha encontrado en el sitio > 93;\n\nEl sistema no encontró una cuenta con id *${discordId}*. tal vez el id estaba equivocado o la cuenta había sido hackeado.\n\nError de Mensaje:${resp.message || '-'}_`);
        }

        const d = resp.data || {};
        const isBot = d.is_bot ? 'Ya (Bot)' : 'No (User)';
        const badges = (d.badges || []).map((b) => b.name).join(', ') || '-';
        
        let caption = `👾 *DISCORD STALKER* 👾\n\n`;
        caption += `Búsqueda exitosa! Aft es la información de perfil de la discordia:\n\n`;
        caption += `👤 *Username:* ${d.username}\n`;
        caption += `🏷️ *Global Name:* ${d.global_name || '-'}\n`;
        caption += `🆔 *User ID:* ${d.id}\n`;
        caption += `🤖¿Qué pasa?${isBot}\n`;
        caption += `🗓* Made Tasty: *${d.creation_date || '-'}\n`;
        caption += `🏅 *Badges:* ${badges}\n`;
        
        if (d.clan) {
            caption += `🛡️ *Clan:* ${d.clan.tag} (${d.clan.name})\n`;
        }
        
        caption += `\n_Powered by dclookup.id_`;

        if (d.avatar_url || d.default_avatar_url || d.avatar) {
            const avaUrl = d.avatar_url || d.default_avatar_url || d.avatar;
            await sock.sendMessage(m.chat, { image: { url: avaUrl }, caption: caption }, { quoted: m });
        } else {
            await m.reply(caption);
        }

        await m.react('✅');
    } catch (e) {
        console.error("DC Lookup Error:", e);
        await m.react('❌');
        m.reply(`❌*FILED THROUSTAND SHE END *\n\nLo sentimos, el erosá experimentando interferencias mientras hace el bypass reCAPTCHA o llamando a Fuego. Por favor, inténtelo de nuevo en un momento.\n\n- Ernor:${e.message}_`);
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
