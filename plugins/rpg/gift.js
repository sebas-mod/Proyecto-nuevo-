"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "gift",
  alias: ["kasih", "hadiah"],
  category: "rpg",
  description: "Dar un regalo a los pares para mejorar el amor",
  usage: ".gift <item> <jumlah>",
  example: ".gift diamond 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`❌ *ʙᴇʟᴜᴍ ᴍᴇɴɪᴋᴀʜ*\n\n` + `¡No estás casado todavía!\n` + `Que tengas un buen día con\`(Marry @ USER)\``);
  }

  const args = m.args || [];
  const itemKey = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const amount = parseInt(args[1]) || 1;

  if (!itemKey) {
    return m.reply(
      `🎁 *ɢɪꜰᴛ*\n\n` +
        `*📋 *ᴜsᴀɢᴇ:*
\n` +
        `# Eligelo para dárselo\n` +
        `> > \`.gift diamond 1\`\n` +
        ``,
    );
  }

  user.inventory = user.inventory || {};

  if ((user.inventory[itemKey] || 0) < amount) {
    return m.reply(`❌ *ɪᴛᴇᴍ ᴛɪᴅᴀᴋ ᴄᴜᴋᴜᴘ*\n\n` + `♪ Artículos ♪${itemKey}* tu:${user.inventory[itemKey] || 0}\n` + `> Necesito:${amount}`);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  if (!partner) {
    return m.reply(`❌*ᴘᴀSᴀɴɢᴀɴ ɴᴏᴛ ꜰᴏᴜɴᴅ*\n\n¡No se encuentra la cita en la base de datos!`);
  }

  partner.inventory = partner.inventory || {};

  user.inventory[itemKey] -= amount;
  partner.inventory[itemKey] = (partner.inventory[itemKey] || 0) + amount;

  user.rpg.love = (user.rpg.love || 0) + amount * 10;
  if (partner.rpg) partner.rpg.love = (partner.rpg.love || 0) + amount * 10;

  db.save();

  let txt = `🎁 *ɢɪꜰᴛ sᴜᴋsᴇs*\n\n`;
  txt += `♪💝Tu dando${amount}x ${itemKey}\n`;
  txt += `♪👤Para: @${spouseJid.split("@")[0]}\n`;
  txt += `> 💕 Love: +${amount * 10}\n\n`;
  txt += `> _So sweet! 💖_`;

  await m.reply(txt, { mentions: [spouseJid] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
