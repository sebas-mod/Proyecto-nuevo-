"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "hourly",
  alias: ["jam", "perjam"],
  category: "rpg",
  description: "Klaim hadiah per jam",
  usage: ".hourly",
  example: ".hourly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

function msToTime(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${minutes} menit ${seconds} detik`;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const isPremium = _optionalChain([_configjs2.default, 'access', _ => _.isPremium, 'optionalCall', _2 => _2(m.sender)]) || false;

  if (!user.rpg) user.rpg = {};

  const COOLDOWN = 3600000;
  const lastClaim = user.rpg.lastHourly || 0;
  const now = Date.now();

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim);
    return m.reply(`Eits, buru-buru amat kak! 😂\n\nJatah jam ini udah kamu ambil, tunggu *${msToTime(remaining)}* lagi ya baru balik ke sini! 🏃💨`);
  }

  const expReward = isPremium ? 1000 : 200;
  const moneyReward = isPremium ? 5000 : 1000;

  user.rpg.lastHourly = now;
  user.koin = (user.koin || 0) + moneyReward;

  const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);
  db.save();

  await m.react("⏰");

  let txt = `WAKTUNYA GAJIAN JAM-JAMAN! ⏰✨\n\n`;
  txt += `Ini dia jatah kamu:\n`;
  txt += `💸 Koin: *+Rp ${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n\n`;
  txt += `Balik lagi 1 jam kemudian ya kak! 😘`;

  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
