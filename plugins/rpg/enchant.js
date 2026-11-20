"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
const pluginConfig = {
  name: "enchant",
  alias: ["upgrade", "enhance", "tingkatkan"],
  category: "rpg",
  description: "Upgrade equipment dengan enchantment",
  usage: ".enchant <item>",
  example: ".enchant sword",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 2,
  isEnabled: true,
};

const ENCHANTABLE = {
  sword: { name: "⚔️ Pedang", stat: "attack", bonus: 5, cost: 500, successRate: 70 },
  shield: { name: "🛡️ Perisai", stat: "defense", bonus: 4, cost: 500, successRate: 70 },
  armor: { name: "🦺 Armor", stat: "health", bonus: 20, cost: 800, successRate: 60 },
  helmet: { name: "⛑️ Helm", stat: "defense", bonus: 3, cost: 400, successRate: 75 },
  bow: { name: "🏹 Busur", stat: "attack", bonus: 4, cost: 450, successRate: 72 },
  goldsword: { name: "🗡️ Pedang Emas", stat: "attack", bonus: 10, cost: 2000, successRate: 50 },
  diamondarmor: { name: "💎 Armor Berlian", stat: "health", bonus: 50, cost: 5000, successRate: 40 },
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};
  if (!user.rpg.enchants) user.rpg.enchants = {};

  const args = m.args || [];
  const itemName = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (!itemName) {
    let txt = `✨ *ᴇɴᴄʜᴀɴᴛ - ᴜᴘɢʀᴀᴅᴇ ᴇǫᴜɪᴘ*\n\n`;
    txt += `> Tingkatkan equipment untuk bonus stats!\n\n`;
    txt += `*📦 *ɪᴛᴇᴍ:*
\n`;

    for (const [key, item] of Object.entries(ENCHANTABLE)) {
      const currentLevel = user.rpg.enchants[key] || 0;
      txt += `> ${item.name}\n`;
      txt += `> 📊 Level: ${currentLevel}/10\n`;
      txt += `> 💪 Bonus: +${item.bonus} ${item.stat}\n`;
      txt += `> 💰 Cost: ${item.cost.toLocaleString()}\n`;
      txt += `> 🎯 Rate: ${item.successRate}%\n`;
      txt += `> → \`${key}\`\n> \n`;
    }
    txt += ``;

    return m.reply(txt);
  }

  const item = ENCHANTABLE[itemName];
  if (!item) {
    return m.reply(`❌ Item tidak bisa di-enchant!\n\n> Ketik \`${m.prefix}enchant\` untuk melihat daftar.`);
  }

  if ((user.inventory[itemName] || 0) < 1) {
    return m.reply(`❌ Kamu tidak punya ${item.name}!`);
  }

  const currentLevel = user.rpg.enchants[itemName] || 0;
  if (currentLevel >= 10) {
    return m.reply(`❌ ${item.name} sudah level MAX (10)!`);
  }

  const cost = item.cost * (currentLevel + 1);
  if ((user.koin || 0) < cost) {
    return m.reply(`❌ *ʙᴀʟᴀɴᴄᴇ ᴋᴜʀᴀɴɢ*\n\n` + `> Butuh: ${cost.toLocaleString()}\n` + `> Balance: ${(user.koin || 0).toLocaleString()}`);
  }

  user.koin -= cost;

  await m.react("✨");
  await m.reply(`✨ *ᴍᴇɴɢ-ᴇɴᴄʜᴀɴᴛ ${item.name.toUpperCase()}...*\n\n> Level ${currentLevel} → ${currentLevel + 1}`);
  await new Promise((r) => setTimeout(r, 2000));

  const adjustedRate = Math.max(20, item.successRate - currentLevel * 5);
  const isSuccess = Math.random() * 100 < adjustedRate;

  if (isSuccess) {
    user.rpg.enchants[itemName] = currentLevel + 1;
    user.rpg[item.stat] = (user.rpg[item.stat] || 0) + item.bonus;

    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, 150);
    db.save();

    await m.react("🎉");
    return m.reply(
      `🎉 *ᴇɴᴄʜᴀɴᴛ ʙᴇʀʜᴀsɪʟ!*\n\n` +
        `*✨ *ʀᴇsᴜʟᴛ:*
\n` +
        `> 📦 Item: *${item.name}*\n` +
        `> 📊 Level: *${currentLevel} → ${currentLevel + 1}*\n` +
        `> 💪 Bonus: *+${item.bonus} ${item.stat}*\n` +
        `> 💰 Cost: *-${cost.toLocaleString()}*\n` +
        `> ✨ EXP: *+150*\n` +
        ``,
    );
  } else {
    db.save();

    await m.react("💔");
    return m.reply(
      `💔 *ᴇɴᴄʜᴀɴᴛ ɢᴀɢᴀʟ!*\n\n` +
        `*😢 *ʀᴇsᴜʟᴛ:*
\n` +
        `> 📦 Item: *${item.name}*\n` +
        `> 📊 Level: *${currentLevel}* (tidak naik)\n` +
        `> 💰 Cost: *-${cost.toLocaleString()}* (hangus)\n` +
        `\n\n` +
        `💡 *Tips:* Coba lagi! Rate: ${adjustedRate}%`,
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
