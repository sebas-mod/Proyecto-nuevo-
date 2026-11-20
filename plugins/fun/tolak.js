"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "tolak",
  alias: ["reject", "no", "gaktau"],
  category: "fun",
  description: "Rechazar el disparo de alguien",
  usage: ".tolak @tag",
  example: ".tolak @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const rejectionQuotes = [
  "Sabar ya, ¡mejor debe venir!🌟",
  "\" Mating beem \" no significa que no haya coincidencia.💪",
  "Move on! Banyak ikan di laut! 🐟",
  "El paciente es, el amor del mundo está viniendo.💕",
  "¡No rompas el espíritu, mantenlo en pie!🔥",
  "La rechazo es el comienzo del éxito💪",
  "¡Es muy malo que haya demasiadas posibilidades ahí fuera!✨",
  "¡Asegúrese de que haya más de ustedes!🌈",
];

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );

  let shooterJid = null;

  if (m.quoted) {
    shooterJid = m.quoted.sender;
  } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]])) {
    shooterJid = m.mentionedJid[0];
  }

  if (!shooterJid) {
    const sessions = global.tembakSessions || {};
    const mySession = Object.entries(sessions).find(
      ([key, val]) => val.target === m.sender && val.chat === m.chat,
    );

    if (mySession) {
      shooterJid = mySession[1].shooter;
    }
  }

  if (!shooterJid) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `Responder a un mensaje de disparo +\`${m.prefix}tolak\`\n` +
        `> O\`${m.prefix}tolak @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡No puede ayudarse!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*No tienes corazón que ser negado!*`);
  }

  let shooterData = db.getUser(shooterJid) || {};
  let myData = db.getUser(m.sender) || {};

  if (!shooterData.fun) shooterData.fun = {};
  if (!myData.fun) myData.fun = {};

  if (
    shooterData.fun.pasangan !== m.sender &&
    shooterData.fun.tembakTarget !== m.sender
  ) {
    return m.reply(
      `❌ *ᴛɪᴅᴀᴋ ᴍᴇɴᴇᴍʙᴀᴋ*\n\n` +
        `> @${shooterJid.split("@")[0]}No te disparo.`,
      { mentions: [shooterJid] },
    );
  }

  delete shooterData.fun.pasangan;
  delete shooterData.fun.tembakTarget;
  delete myData.fun.pasangan;

  if (!shooterData.fun.ditolakCount) shooterData.fun.ditolakCount = 0;
  shooterData.fun.ditolakCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (_optionalChain([global, 'access', _3 => _3.tembakSessions, 'optionalAccess', _4 => _4[sessionKey]])) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    rejectionQuotes[Math.floor(Math.random() * rejectionQuotes.length)];

  await m.react("💔");
  const ctx = _ourincontextjs.saluranCtx.call(void 0, );
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💔* WADUHH, JANG HAYAK * @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} menolak @${shooterJid.split("@")[0]}como pacarnya\n\n` +
      `Harbans sí, hay muchos otros!😢`,
    { contextInfo: ctx },
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
