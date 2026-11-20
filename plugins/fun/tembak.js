"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikucontextjs = require('../../src/lib/almiku-context.js');
const pluginConfig = {
  name: "tembak",
  alias: ["nembak", "propose"],
  category: "fun",
  description: "Dispara a alguien para un novio",
  usage: ".tembak @tag",
  example: ".tembak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

if (!global.tembakSessions) global.tembakSessions = {};

const SESSION_TIMEOUT = 3600000;
const romanticQuotes = [
  "No soy piloto, pero puedo hacer que tu corazón vuele alto conmigo.💕",
  "¿Sabes por qué amo a los hujans?🌧",
  "Eres la razón por la que sonrío sin poder hacerlo.😊",
  "Si eres una estrella, quiero ser la que siempre te ve.✨",
  "Necesito GPS, porque mi corazón te está mostrando.💘",
  "Sabes, eres un hombre de café, no puedes hacerlo, no puedes dejarme dormir.☕",
  "Boleh pinjam hatimu? Janji bakal dijaga selamanya 💖",
  "Si el amor es una canción, eres la melodía más hermosa🎵",
  "Tres cosas que necesito: sol, luna, y tú.🌙",
  "Eres el último rompecabezas que necesito para completar mi vida.🧩",
];

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];

  let targetJid = null;

  if (m.quoted) {
    targetJid = m.quoted.sender;
  } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]])) {
    targetJid = m.mentionedJid[0];
  } else if (args[0]) {
    let num = args[0].replace(/[^0-9]/g, "");
    if (num.length > 5 && num.length < 20) {
      targetJid = num + "@s.whatsapp.net";
    }
  }

  if (!targetJid) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}tembak @tag\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}tembak @628xxx\`\n` +
        `Responder mensaje +\`${m.prefix}tembak\``,
    );
  }

  if (targetJid === m.sender) {
    return m.reply(`¡No puedes dispararte!`);
  }

  if (targetJid === m.botNumber) {
    return m.reply(`¡Ni siquiera puedo soportar al hombre que amo!`);
  }

  let senderData = db.getUser(m.sender) || {};
  let targetData = db.getUser(targetJid) || {};

  if (!senderData.fun) senderData.fun = {};
  if (!targetData.fun) targetData.fun = {};

  if (senderData.fun.pasangan) {
    const partnerData = db.getUser(senderData.fun.pasangan);
    if (_optionalChain([partnerData, 'optionalAccess', _3 => _3.fun, 'optionalAccess', _4 => _4.pasangan]) === m.sender) {
      return m.reply(
        `❌ *sᴜᴅᴀʜ ᴘᴜɴʏᴀ ᴘᴀsᴀɴɢᴀɴ*\n\n` +
          `Pasanganmu: @${senderData.fun.pasangan.split("@")[0]}\n` +
          `Putus solía ser el mismo${partnerData.name}con cara:\`${m.prefix}putus\``,
        { mentions: [senderData.fun.pasangan] },
      );
    }
  }

  if (targetData.fun.pasangan && targetData.fun.pasangan !== m.sender) {
    const targetPartner = db.getUser(targetData.fun.pasangan);
    if (_optionalChain([targetPartner, 'optionalAccess', _5 => _5.fun, 'optionalAccess', _6 => _6.pasangan]) === targetJid) {
      return m.reply(
        `💔 *ᴅɪᴀ sᴜᴅᴀʜ ᴘᴀᴄᴀʀᴀɴ*\n\n` +
          `Pasangannya: @${targetData.fun.pasangan.split("@")[0]}`,
        { mentions: [targetData.fun.pasangan] },
      );
    }
  }

  if (
    targetData.fun.tembakTarget === m.sender ||
    targetData.fun.pasangan === m.sender
  ) {
    senderData.fun.pasangan = targetJid;
    targetData.fun.pasangan = m.sender;

    db.setUser(m.sender, senderData);
    db.setUser(targetJid, targetData);

    delete global.tembakSessions[`${m.chat}_${targetJid}`];

    await m.react("💕");
    return m.reply(
      `💕 *CIE CIEE :3*\n\n` +
        `@${m.sender.split("@")[0]}y @${targetJid.split("@")[0]}¡Novio oficial!\n\n` +
        `Semoga¡¡Largo tiempo sin ver!💍`,
      { mentions: [m.sender, targetJid] },
    );
  }

  senderData.fun.tembakTarget = targetJid;
  if (!senderData.fun.tembakCount) senderData.fun.tembakCount = 0;
  senderData.fun.tembakCount++;
  db.setUser(m.sender, senderData);

  global.tembakSessions[`${m.chat}_${targetJid}`] = {
    shooter: m.sender,
    target: targetJid,
    chat: m.chat,
    timestamp: Date.now(),
  };

  await m.react("💘");

  const ctx = _almikucontextjs.saluranCtx.call(void 0, );
  ctx.mentionedJid = [targetJid, m.sender];
  const sentMsg = await m.reply(
    `💘* NO JUNK NIHHH*\n\n` +
      `Hei @${targetJid.split("@")[0]}Te disparan @${m.sender.split("@")[0]} nichh\n\n` +
      `⏱*Hagámoslo por una hora*\n` +
      `usa: \`${m.prefix}terima\` / \`${m.prefix}tolak\``,
    { contextInfo: ctx },
  );

  if (_optionalChain([sentMsg, 'optionalAccess', _7 => _7.key, 'optionalAccess', _8 => _8.id])) {
    global.tembakSessions[`${m.chat}_${targetJid}`].messageId = sentMsg.key.id;
  }
}

async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "terima" && text !== "tolak") return false;
  if (!m.quoted) return false;

  const db = _almikudatabasejs.getDatabase.call(void 0, );

  const allSessions = Object.entries(global.tembakSessions || {}).filter(
    ([key, val]) => val.target === m.sender && val.chat === m.chat,
  );

  if (allSessions.length === 0) return false;

  const validSession = allSessions.find(([key, val]) => {
    return Date.now() - val.timestamp < 3600000;
  });

  if (!validSession) return false;

  const [sessKey, sessData] = validSession;

  if (text === "terima") {
    let shooterData = db.getUser(sessData.shooter) || {};
    let targetData = db.getUser(m.sender) || {};

    if (!shooterData.fun) shooterData.fun = {};
    if (!targetData.fun) targetData.fun = {};

    shooterData.fun.pasangan = m.sender;
    targetData.fun.pasangan = sessData.shooter;

    db.setUser(sessData.shooter, shooterData);
    db.setUser(m.sender, targetData);

    delete global.tembakSessions[sessKey];

    await m.react("💕");
    await m.reply(
      `💕 *WIDIHHHH, CIE CIE DITERIMA* @${sessData.shooter.split("@")[0]}\n\n` +
        `@${m.sender.split("@")[0]}y @${sessData.shooter.split("@")[0]}oficial pacaran\n\n` +
        `Ojalá Long y feliz💍`,
      { mentions: [m.sender, sessData.shooter] },
    );

    return true;
  }

  if (text === "tolak") {
    let shooterData = db.getUser(sessData.shooter) || {};
    let targetData = db.getUser(m.sender) || {};

    if (!shooterData.fun) shooterData.fun = {};
    if (!targetData.fun) targetData.fun = {};

    delete shooterData.fun.pasangan;
    delete shooterData.fun.tembakTarget;
    delete targetData.fun.pasangan;

    db.setUser(sessData.shooter, shooterData);
    db.setUser(m.sender, targetData);

    delete global.tembakSessions[sessKey];

    await m.react("💔");
    await m.reply(
      `💔* WADUHH, JANG HAYAK * @${sessData.shooter.split("@")[0]}\n\n` +
        `@${m.sender.split("@")[0]} menolak @${sessData.shooter.split("@")[0]}como pacarnya\n\n` +
        `Harbans sí, hay muchos otros!😢`,
      { mentions: [m.sender, sessData.shooter] },
    );
    return true;
  }

  return false;
}

exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
