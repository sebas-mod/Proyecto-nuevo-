"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "terima",
  alias: ["accept", "yes"],
  category: "fun",
  description: "Menerima tembakan dari seseorang",
  usage: ".terima @tag",
  example: ".terima @628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const celebrationQuotes = [
  "Semoga langgeng sampai ke pelaminan! 💍",
  "Dari teman jadi cinta, indahnya! 💕",
  "Love is in the air! 💖",
  "Couple goals detected! 💑",
  "Jangan lupa undang pas nikah ya! 💒",
  "Selamat menempuh hidup berduaan! 🥰",
  "Chemistry-nya kuat banget! 🔥",
  "Match made in heaven! ✨",
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
        `> Reply pesan tembakan + \`${m.prefix}terima\`\n` +
        `> Atau \`${m.prefix}terima @tag\``,
    );
  }

  if (shooterJid === m.sender) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak bisa menerima diri sendiri!`);
  }

  if (shooterJid === m.botNumber) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Bot tidak bisa pacaran!`);
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
        `> @${shooterJid.split("@")[0]} tidak sedang menembakmu`,
      { mentions: [shooterJid] },
    );
  }

  shooterData.fun.pasangan = m.sender;
  shooterData.fun.jadiPacar = Date.now();
  delete shooterData.fun.tembakTarget;
  myData.fun.pasangan = shooterJid;
  myData.fun.jadiPacar = Date.now();

  if (!shooterData.fun.terimaCount) shooterData.fun.terimaCount = 0;
  shooterData.fun.terimaCount++;

  db.setUser(shooterJid, shooterData);
  db.setUser(m.sender, myData);

  const sessionKey = `${m.chat}_${m.sender}`;
  if (_optionalChain([global, 'access', _3 => _3.tembakSessions, 'optionalAccess', _4 => _4[sessionKey]])) {
    delete global.tembakSessions[sessionKey];
  }

  const quote =
    celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)];
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");

  await m.react("💕");
  const ctx = _ourincontextjs.saluranCtx.call(void 0, );
  ctx.mentionedJid = [m.sender, shooterJid];

  await m.reply(
    `💕 *WIDIHHHH, CIE CIE DITERIMA* @${shooterJid.split("@")[0]}\n\n` +
      `@${m.sender.split("@")[0]} dan @${shooterJid.split("@")[0]} resmi pacaran\n\n` +
      `Semoga langgeng dan bahagia 💍`,
    { contextInfo: ctx },
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
