"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "meditation",
  alias: ["rest", "istirahat", "tidur", "sleep"],
  category: "rpg",
  description: "Descanse para el duro giro de HP y la resistencia",
  usage: ".meditation",
  example: ".meditation",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 600,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const currentStamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));
  const currentHealth = user.rpg.health || 100;
  const currentMana = user.rpg.mana || 50;

  const maxStamina = 100;
  const maxHealth = 100 + (user.level || 1) * 5;
  const maxMana = 50 + (user.level || 1) * 3;

  if (currentStamina >= maxStamina && currentHealth >= maxHealth && currentMana >= maxMana) {
    return m.reply(
      `💤 *sᴜᴅᴀʜ ꜰᴜʟʟ*\n\n` +
        `> ⚡ Stamina: ${currentStamina}/${maxStamina}\n` +
        `> ❤️ Health: ${currentHealth}/${maxHealth}\n` +
        `> 💙 Mana: ${currentMana}/${maxMana}\n\n` +
        `💡¡Ya estás en la condición prima!`,
    );
  }

  await m.react("💤");
  await m.reply(`💤*ʙᴇʀɪSᴛɪʀᴀʜᴀᴛ...\n\n" Reducir la energía..`);
  await new Promise((r) => setTimeout(r, 3000));

  const staminaRecovered = Math.min(maxStamina - currentStamina, 40 + Math.floor(Math.random() * 20));
  const healthRecovered = Math.min(maxHealth - currentHealth, 30 + Math.floor(Math.random() * 20));
  const manaRecovered = Math.min(maxMana - currentMana, 25 + Math.floor(Math.random() * 15));

  user.rpg.stamina = Math.min(maxStamina, currentStamina + staminaRecovered);
  user.rpg.health = Math.min(maxHealth, currentHealth + healthRecovered);
  user.rpg.mana = Math.min(maxMana, currentMana + manaRecovered);

  db.save();

  await m.react("✨");
  return m.reply(
    `✨ *ɪsᴛɪʀᴀʜᴀᴛ sᴇʟᴇsᴀɪ!*\n\n` +
      `*💖 *ᴘᴜʟɪʜ:*
\n` +
      `> ⚡ Stamina: *+${staminaRecovered}* (${user.rpg.stamina}/${maxStamina})\n` +
      `> ❤️ Health: *+${healthRecovered}* (${user.rpg.health}/${maxHealth})\n` +
      `> 💙 Mana: *+${manaRecovered}* (${user.rpg.mana}/${maxMana})\n` +
      `\n\n` +
      `- ¡Te sientes mejor!🌟`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
