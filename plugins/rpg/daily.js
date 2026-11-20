"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "daily",
  alias: ["harian", "claim"],
  category: "rpg",
  description: "Klaim hadiah harian",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

function msToTime(duration) {
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const seconds = Math.floor((duration / 1000) % 60);
  return `${hours}hora${minutes}minuto${seconds}segundo`;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const isPremium = _optionalChain([_configjs2.default, 'access', _ => _.isPremium, 'optionalCall', _2 => _2(m.sender)]) || false;

  if (!user.rpg) user.rpg = {};

  const COOLDOWN = 86400000;
  const lastClaim = user.rpg.lastDaily || 0;
  const now = Date.now();

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim);
    return m.reply(`Sabar hermano, ratah absen día que te toman!😂\n\n*Entonces, vamos*${msToTime(remaining)}¡No seas tan malo!🏃💨`);
  }

  const expReward = isPremium ? 5000 : 1000;
  const moneyReward = isPremium ? 25000 : 5000;
  const energiReward = isPremium ? 10 : 3;

  user.rpg.lastDaily = now;
  user.koin = (user.koin || 0) + moneyReward;
  user.energi = (user.energi || 0) + energiReward;

  const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);
  db.save();

  await m.react("🎁");

  let txt = `Hermano, vas a pagar por tu día.🎉✨\n\n`;
  txt += `Aquí está la orden que hizo hoy:\n`;
  txt += `💸Monedas: *+Rp${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `⚡Energía: *+${energiReward}*\n\n`;
  
  if (isPremium) {
    txt += `👑# 91; Wih, miembro de bonificación Premium emanang beda!😎💸`;
  } else {
    txt += `¿Quieres hacer un bono más grande?🤑💎`;
  }

  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
