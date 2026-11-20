"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const EXP_PER_LEVEL = 10000;

const pluginConfig = {
  name: "level",
  alias: ["lvl", "ceklevel"],
  category: "user",
  description: "Cek level user",
  usage: ".level [@user]",
  example: ".level",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function calculateLevel(exp) {
  return Math.floor(exp / EXP_PER_LEVEL) + 1;
}

function expForLevel(level) {
  return (level - 1) * EXP_PER_LEVEL;
}

function expToNextLevel(exp) {
  const currentLevel = calculateLevel(exp);
  const nextLevelExp = expForLevel(currentLevel + 1);
  return nextLevelExp - exp;
}

function getRole(level) {
  if (level >= 100) return "🐉 Mythic";
  if (level >= 80) return "⚔️ Legend";
  if (level >= 60) return "💜 Epic";
  if (level >= 40) return "💪 Grandmaster";
  if (level >= 20) return "🎖️ Master";
  if (level >= 10) return "⭐ Elite";
  return "🛡️ Warrior";
}

function getLevelBar(current, target) {
  const totalBars = 10;
  const filledBars = Math.min(
    Math.floor((current / target) * totalBars),
    totalBars,
  );
  const emptyBars = totalBars - filledBars;
  return "▰".repeat(filledBars) + "▱".repeat(emptyBars);
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );

  let targetJid = m.sender;
  let targetName = m.pushName || "Tu";

  if (m.quoted) {
    targetJid = m.quoted.sender;
    targetName = m.quoted.pushName || targetJid.split("@")[0];
  } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) {
    targetJid = m.mentionedJid[0];
    targetName = targetJid.split("@")[0];
  }

  const user = db.getUser(targetJid) || db.setUser(targetJid);
  if (!user.rpg) user.rpg = {};

  const exp = user.exp || 0;
  const level = calculateLevel(exp);
  const role = getRole(level);
  const currentLevelExp = expForLevel(level);
  const nextLevelExp = expForLevel(level + 1);
  const expInLevel = exp - currentLevelExp;
  const expNeeded = nextLevelExp - currentLevelExp;
  const progress = getLevelBar(expInLevel, expNeeded);

  let txt = `╭━━━━━━━━━━━━━━━━━╮\n`;
  txt += `┃ 📊 *ʟᴇᴠᴇʟ ɪɴꜰᴏ*\n`;
  txt += `╰━━━━━━━━━━━━━━━━━╯\n\n`;

  txt += `╭┈┈⬡「 👤 *ᴜsᴇʀ* 」\n`;
  txt += `┃ 🏷️ Name: *${targetName}*\n`;
  txt += `┃ 🆔 Tag: @${targetJid.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

  txt += `╭┈┈⬡「 📈 *sᴛᴀᴛs* 」\n`;
  txt += `┃ 📊 Level: *${level}*\n`;
  txt += `┃ ${role}\n`;
  txt += `┃ 🚄 Exp: *${exp.toLocaleString("es-AR")}*\n`;
  txt += `┃ 📊 Progress:\n`;
  txt += `┃ ${progress}\n`;
  txt += `┃ ${expInLevel.toLocaleString("es-AR")} / ${expNeeded.toLocaleString("es-AR")}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

  txt += `> Next level: *${expToNextLevel(exp).toLocaleString("es-AR")}exp* otra vez!`;

  await m.reply(txt, { mentions: [targetJid] });
}








exports.config = pluginConfig; exports.handler = handler; exports.calculateLevel = calculateLevel; exports.expForLevel = expForLevel; exports.expToNextLevel = expToNextLevel; exports.getRole = getRole;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
