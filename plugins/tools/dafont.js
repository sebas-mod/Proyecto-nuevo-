"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _dafontjs = require('../../src/scraper/dafont.js');

if (!global.dafontSessions) global.dafontSessions = {};

const SESSION_TIMEOUT = 120000;

function getSessionKey(jid) {
  return String(jid || "").replace(/[^0-9]/g, "") || String(jid).toLowerCase();
}

function getSession(jid) {
  const key = getSessionKey(jid);
  return global.dafontSessions[key] || null;
}

function setSession(jid, data) {
  const key = getSessionKey(jid);
  clearSession(jid);
  global.dafontSessions[key] = {
    data,
    chat: null,
    startedAt: Date.now(),
    timeout: setTimeout(() => {
      delete global.dafontSessions[key];
    }, SESSION_TIMEOUT),
  };
  return global.dafontSessions[key];
}

function clearSession(jid) {
  const key = getSessionKey(jid);
  const session = global.dafontSessions[key];
  if (_optionalChain([session, 'optionalAccess', _ => _.timeout])) clearTimeout(session.timeout);
  delete global.dafontSessions[key];
}

const pluginConfig = {
  name: "dafont",
  alias: ["font", "daffont", "carifont"],
  category: "tools",
  description: "Busca y descargas fuente de DFITT",
  usage: ".dafont <nama font>",
  example: ".dafont arial",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    m.react("❌");
    return m.reply(
      `🔤 *DaFont Search*\n\n` +
        `Busca font de DFont, luego responder al número de descargas.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}dafont <nama font>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}dafont arial*\n` +
        `> *${m.prefix}dafont horror*\n\n` +
        `Una vez que aparece una lista, responda un mensaje bot con un número de fuente haga descarga_`
    );
  }

  m.react("🕕");

  try {
    const result = await _dafontjs.DaFont.call(void 0, text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌*DaFont Fallido*\n\n♪${result.error}`);
    }

    const items = result.results.slice(0, 10);

    let txt = `🔤 *DaFont — ${result.count} Font Ditemukan*\n\n`;
    txt += `# Buscadme #${text}*\n\n`;

    items.forEach((v, i) => {
      txt += `*${i + 1}.* ${v.name}\n`;
      txt += `   ├ 👤 Author: ${v.author}\n`;
      txt += `   ├ 📥 Downloads: ${v.downloads || "-"}\n`;
      txt += `   └ 📜 License: ${v.license || "-"}\n`;
    });

    txt += `\nResponder Genevieve mensaje con un núudus de fuentes para hacer las descargas campo - links _`;

    const session = setSession(m.sender, items);
    session.chat = m.chat;

    await m.reply(txt);
    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌Pegatina buscando la fuente, intente más tarde");
  }
}

async function dafontAnswerHandler(m, sock) {
  const session = getSession(m.sender);
  if (!session) return false;
  if (m.chat !== session.chat) return false;

  const text = (m.body || m.text || "").trim();
  const index = parseInt(text) - 1;

  if (isNaN(index) || index < 0 || index >= session.data.length) return false;

  const v = session.data[index];

  let detail = `🔤 *${v.name}*\n\n` +
    `> 👤 Author: ${v.author}\n` +
    `> 📥 Downloads: ${v.downloads || "-"}\n` +
    `> 📜 License: ${v.license || "-"}`;

  if (v.preview) {
    await sock.sendMedia(m.chat, v.preview, detail, m, { type: "image" });
  } else {
    await m.reply(detail);
  }

  if (v.download) {
    await sock.sendMessage(
      m.chat,
      {
        document: { url: v.download },
        fileName: v.name + ".zip",
        mimetype: "application/zip",
      },
      { quoted: m },
    );
  }

  clearSession(m.sender);
  return true;
}

exports.config = pluginConfig; exports.handler = handler; exports.dafontAnswerHandler = dafontAnswerHandler; exports.clearSession = clearSession;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
