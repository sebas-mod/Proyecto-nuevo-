"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
const pluginConfig = {
  name: "jodoh",
  alias: ["match", "shipcouple", "ship"],
  category: "fun",
  description: "Compelled 2 foto aleatoria con partido",
  usage: ".jodoh",
  example: ".jodoh",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

let thumbFun = null;
try {
  const thumbPath = _path2.default.join(
    process.cwd(),
    "assets",
    "images",
    "ourin-games.jpg",
  );
  if (_fs2.default.existsSync(thumbPath)) thumbFun = _fs2.default.readFileSync(thumbPath);
} catch (e) {}

const loveQuotes = [
  "El amor verdadero nunca conoce el camino💕",
  "Los dos corazones unidos no están separados💗",
  "Ustedes son como rompecabezas perfectos.🧩",
  "Match made in heaven! ✨",
  "¡La química es un brazalete!🔥",
  "Couple goals banget sih kalian 💑",
  "Destiny brought you together 🌟",
  "Perfect match detected! 💘",
];

const compatibilityEmoji = (percent) => {
  if (percent >= 90) return "💕💕💕💕💕";
  if (percent >= 70) return "💕💕💕💕";
  if (percent >= 50) return "💕💕💕";
  if (percent >= 30) return "💕💕";
  return "💕";
};

const compatibilityText = (percent) => {
  if (percent >= 90) return "JODOH SEJATI! 💍";
  if (percent >= 70) return "Sangat Cocok! 💖";
  if (percent >= 50) return "Lumayan Cocok 💗";
  if (percent >= 30) return "Puede Intentado💓";
  return "Es un gran problema.💔";
};

const isRegistrationRequired = (db) => {
  return (
    _nullishCoalesce(_nullishCoalesce(db.setting("registrationRequired"), () => ( _optionalChain([_configjs2.default, 'access', _ => _.registration, 'optionalAccess', _2 => _2.enabled]))), () => ( false))
  );
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const botNumber = _optionalChain([sock, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.id, 'optionalAccess', _5 => _5.split, 'call', _6 => _6(":"), 'access', _7 => _7[0]]) + "@s.whatsapp.net";

  let groupMeta;
  try {
    groupMeta = m.groupMetadata;
  } catch (e) {
    return m.reply("❌*ɢᴀɢᴀʟ*\n\n¡No puede obtener los datos del grupo!");
  }

  const participants = groupMeta.participants || [];
  const memberJids = participants
    .map((p) => p.jid || p.id)
    .filter((jid) => jid && jid !== botNumber);

  if (memberJids.length < 2) {
    return m.reply("❌*ɢᴀɢᴀʟ*\n\n¡Al menos dos!");
  }

  const allUsers = db.getAllUsers();
  const registrationRequired = isRegistrationRequired(db);
  const registeredMembers = memberJids.filter((jid) => {
    const cleanJid = jid.replace(/@.+/g, "");
    return _optionalChain([allUsers, 'access', _8 => _8[cleanJid], 'optionalAccess', _9 => _9.isRegistered]);
  });
  const registeredInGroup = memberJids.filter((jid) => {
    const cleanJid = jid.replace(/@.+/g, "");
    const user = allUsers[cleanJid];
    return _optionalChain([user, 'optionalAccess', _10 => _10.isRegistered]) && user.regGender;
  });

  if (registrationRequired && registeredMembers.length < 2) {
    return m.reply(
      "❌*ɢᴀɢᴀʟ*\n\nLa lista de modos está activa. Al menos dos de las fotos ya están registradas en este grupo!",
    );
  }

  let person1 = null;
  let person2 = null;
  let usedRegistration = false;

  if (registeredInGroup.length >= 2) {
    const males = registeredInGroup.filter((jid) => {
      const cleanJid = jid.replace(/@.+/g, "");
      return _optionalChain([allUsers, 'access', _11 => _11[cleanJid], 'optionalAccess', _12 => _12.regGender]) === "Laki-laki";
    });
    const females = registeredInGroup.filter((jid) => {
      const cleanJid = jid.replace(/@.+/g, "");
      return _optionalChain([allUsers, 'access', _13 => _13[cleanJid], 'optionalAccess', _14 => _14.regGender]) === "Perempuan";
    });

    if (males.length > 0 && females.length > 0) {
      person1 = males[Math.floor(Math.random() * males.length)];
      person2 = females[Math.floor(Math.random() * females.length)];
      usedRegistration = true;
    } else {
      const shuffled = registeredInGroup.sort(() => Math.random() - 0.5);
      person1 = shuffled[0];
      person2 = shuffled[1];
      usedRegistration = true;
    }
  }

  if (!person1 || !person2) {
    const candidateMembers = registrationRequired
      ? registeredMembers
      : memberJids;
    const shuffled = candidateMembers.sort(() => Math.random() - 0.5);
    person1 = shuffled[0];
    person2 = shuffled[1];
  }

  const compatibility = Math.floor(Math.random() * 100) + 1;
  const quote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)];

  const user1Data = allUsers[person1.replace(/@.+/g, "")];
  const user2Data = allUsers[person2.replace(/@.+/g, "")];

  let label1 = "👨";
  let label2 = "👩";
  let name1 = `@${person1.split("@")[0]}`;
  let name2 = `@${person2.split("@")[0]}`;

  if (_optionalChain([user1Data, 'optionalAccess', _15 => _15.regGender]) === "Laki-laki") label1 = "👨";
  else if (_optionalChain([user1Data, 'optionalAccess', _16 => _16.regGender]) === "Perempuan") label1 = "👩";
  else label1 = Math.random() > 0.5 ? "👨" : "👩";

  if (_optionalChain([user2Data, 'optionalAccess', _17 => _17.regGender]) === "Laki-laki") label2 = "👨";
  else if (_optionalChain([user2Data, 'optionalAccess', _18 => _18.regGender]) === "Perempuan") label2 = "👩";
  else label2 = label1 === "👨" ? "👩" : "👨";

  if (_optionalChain([user1Data, 'optionalAccess', _19 => _19.regName]))
    name1 = `*${user1Data.regName}* (@${person1.split("@")[0]})`;
  if (_optionalChain([user2Data, 'optionalAccess', _20 => _20.regName]))
    name2 = `*${user2Data.regName}* (@${person2.split("@")[0]})`;

  const progressBar = (() => {
    const filled = Math.floor(compatibility / 10);
    const empty = 10 - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  })();

  let text = `💘 *ᴊᴏᴅᴏʜ ʀᴀɴᴅᴏᴍ*\n\n`;
  text += `╭┈┈⬡「 💑 *ᴘᴀsᴀɴɢᴀɴ* 」\n`;
  text += `┃ ${label1} ${name1}\n`;
  text += `┃ ❤️\n`;
  text += `┃ ${label2} ${name2}\n`;
  text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  text += `╭┈┈⬡「 📊 *ᴋᴇᴄᴏᴄᴏᴋᴀɴ* 」\n`;
  text += `┃ ${progressBar} *${compatibility}%*\n`;
  text += `┃ ${compatibilityEmoji(compatibility)}\n`;
  text += `┃ Status: *${compatibilityText(compatibility)}*\n`;
  text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  if (usedRegistration) {
    text += `> ✨ _Dijodohkan berdasarkan data registrasi_\n`;
  }
  if (registrationRequired) {
    text += `♪🔒Modo de Ez es la lista activa, sólo se seleccionan las fotos seleccionadas\n`;
  }
  text += `> _"${quote}"_`;

  await m.react("💕");
  await m.reply(text, { mentions: [person1, person2] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
