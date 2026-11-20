"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "stamina",
  alias: ["energy", "cekstamina"],
  category: "rpg",
  description: "Cek dan pulihkan stamina",
  usage: ".stamina / .stamina isi",
  example: ".stamina",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function createStaminaBar(current, max) {
  const filled = Math.round((current / max) * 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const args = m.args || [];

  if (!user.rpg) user.rpg = {};
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const subCmd = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (subCmd === "isi" || subCmd === "restore" || subCmd === "heal") {
    const potionCost = 5000;

    if (user.rpg.stamina >= user.rpg.maxStamina) {
      return m.reply(`⚡ *sᴛᴀᴍɪɴᴀ ᴘᴇɴᴜʜ*\n\n> Stamina kamu sudah penuh!`);
    }

    if ((user.koin || 0) < potionCost) {
      return m.reply(`❌ *sᴀʟᴅᴏ ᴛɪᴅᴀᴋ ᴄᴜᴋᴜᴘ*\n\n` + `> Biaya: Rp ${potionCost.toLocaleString("id-ID")}\n` + `> Saldo: Rp ${(user.koin || 0).toLocaleString("id-ID")}`);
    }

    user.koin -= potionCost;
    const restored = user.rpg.maxStamina - user.rpg.stamina;
    user.rpg.stamina = user.rpg.maxStamina;

    db.save();

    await m.react("⚡");
    return _ourincontextjs.sendRpgPreview.call(void 0, 
      sock,
      m.chat,
      `⚡ *sᴛᴀᴍɪɴᴀ ᴅɪɪsɪ*\n\n` +
        `*💊 *ʀᴇsᴛᴏʀᴇ:*
\n` +
        `> ⚡ Stamina: *+${restored}*\n` +
        `> 💵 Biaya: *-Rp ${potionCost.toLocaleString("id-ID")}*\n` +
        `> 📊 Sekarang: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n` +
        ``,
      "⚡ STAMINA",
      "Restore",
      { quoted: m },
    );
  }

  const staminaBar = createStaminaBar(user.rpg.stamina, user.rpg.maxStamina);

  let txt = `⚡ *sᴛᴀᴍɪɴᴀ sᴛᴀᴛᴜs*\n\n`;
  txt += `*📊 *ɪɴꜰᴏ:*
\n`;
  txt += `> ⚡ Stamina: *${user.rpg.stamina}/${user.rpg.maxStamina}*\n`;
  txt += `> 📊 [${staminaBar}]\n`;
  txt += `\n\n`;
  txt += `> Isi stamina: \`${m.prefix}stamina isi\` (Rp 5.000)\n`;
  txt += `> Stamina pulih otomatis setiap jam`;

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, txt, "⚡ STAMINA", "Status", {
    quoted: m,
  });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
