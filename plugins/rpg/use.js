"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "use",
  alias: ["pake", "makan", "open"],
  category: "rpg",
  description: "Use el elemento consumable o abra la caja",
  usage: ".use <item>",
  example: ".use potion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const args = m.args || [];
  const itemKey = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (!itemKey) {
    return m.reply(
      `🎒 *ᴜsᴇ ɪᴛᴇᴍ*\n\n` +
      `*📋 *ᴜsᴀɢᴇ:*
\n` +
      `> > \`.use <nama_item>\`\n` +
      `* Comprobando inventario:\`- Inventario.\`\n` +
      ``,
    );
  }

  user.inventory = user.inventory || {};
  user.rpg = user.rpg || {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = user.rpg.maxMana || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  const count = user.inventory[itemKey] || 0;

  if (count <= 0) {
    return m.reply(
      `❌ *ɪᴛᴇᴍ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\n` +
      `*No lo tienes*${itemKey}*!\n` +
      `* Comprobando inventario*\`- Inventario.\``,
    );
  }

  let msg = "";

  switch (itemKey) {
    case "potion":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤♪ʜᴇᴀʟᴛʜ ᴘᴇɴᴜʜ*\n\n¡Estás lleno!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 50, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🥤*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara beber tu Poción de Heath.\n♪❤* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "mpotion":
      if (user.rpg.mana >= user.rpg.maxMana) {
        return m.reply(`💧*ᴍᴀɴᴀ ᴘᴇɴᴜʜ*\n\n¿Cómo puedes estar lleno?`);
      }
      user.rpg.mana = Math.min(user.rpg.mana + 50, user.rpg.maxMana);
      user.inventory[itemKey]--;
      msg = `🧪*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara verte beber la olla.\n♪💧Mana ahora:${user.rpg.mana}/${user.rpg.maxMana}`;
      break;

    case "stamina":
      if (user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`⚡*ᴛᴀᴍɪɴᴀ ᴘᴇɴᴜʜ*\n\n¡Para que estés lleno!`);
      }
      user.rpg.stamina = Math.min(user.rpg.stamina + 20, user.rpg.maxStamina);
      user.inventory[itemKey]--;
      msg = `⚡*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara beber tu poción de resistencia.\n♪⚡Stamina ahora:${user.rpg.stamina}/${user.rpg.maxStamina}`;
      break;

    case "herb":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤♪ʜᴇᴀʟᴛʜ ᴘᴇɴᴜʜ*\n\n¡Estás lleno!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 20, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🌿*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara verte masticar.\n♪❤* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "leather":
      user.rpg.attack = (user.rpg.attack || 10) + 3;
      user.inventory[itemKey]--;
      msg = `👞*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara verte vestirte como un dúo.\n♪⚔# Hit grow: + 3 ( now:)${user.rpg.attack})`;
      break;

    case "mysterybox": {
      user.inventory[itemKey]--;
      const rewards = [
        { type: "koin", min: 1000, max: 50000, icon: "💰" },
        { type: "exp", min: 500, max: 5000, icon: "✨" },
        { type: "potion", qty: [1, 3], icon: "🥤" },
        { type: "diamond", qty: [1, 2], icon: "💠" },
      ];
      const pick = rewards[Math.floor(Math.random() * rewards.length)];
      let rewardMsg = "";
      if (pick.type === "koin") {
        const amount =
          Math.floor(Math.random() * (pick.max - pick.min)) + pick.min;
        user.koin = (user.koin || 0) + amount;
        rewardMsg = `${pick.icon}Monedas: +${amount.toLocaleString("id-ID")}`;
      } else if (pick.type === "exp") {
        const amount =
          Math.floor(Math.random() * (pick.max - pick.min)) + pick.min;
        db.updateExp(m.sender, amount);
        rewardMsg = `${pick.icon} EXP: +${amount.toLocaleString("id-ID")}`;
      } else {
        const qty =
          Math.floor(Math.random() * (pick.qty[1] - pick.qty[0] + 1)) +
          pick.qty[0];
        user.inventory[pick.type] = (user.inventory[pick.type] || 0) + qty;
        rewardMsg = `${pick.icon} ${pick.type}: +${qty}`;
      }
      msg = `📦*ᴍʏSᴛᴇʀʏ ʙᴏx ᴅɪʙᴜᴋᴀ*\n\n# You open Mystery Bo #x..\n♪${rewardMsg}`;
      break;
    }

    case "bowlramen":
      if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤♪ʜᴇᴀʟᴛʜ ᴘᴇɴᴜʜ*\n\n¡Estás lleno, no más rebosante!`);
      }
      user.rpg.health = Math.min(user.rpg.health + 40, user.rpg.maxHealth);
      user.inventory[itemKey]--;
      msg = `🍜*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara ti usando un ramen caliente.\n♪❤# Heath menach:${user.rpg.health}/${user.rpg.maxHealth}`;
      break;

    case "chakra":
      if (user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`⚡*ᴛᴀᴍɪɴᴀ ᴘᴇɴᴜʜ*\n\n- ¡Estás lleno!`);
      }
      user.rpg.stamina = Math.min(user.rpg.stamina + 30, user.rpg.maxStamina);
      user.inventory[itemKey]--;
      msg = `🌀*ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nA usted absorbió el ojo negro de Chakra.\n♪⚡Staina creció:${user.rpg.stamina}/${user.rpg.maxStamina}`;
      break;

    case "kunai":
    case "shuriken":
      user.rpg.attack = (user.rpg.attack || 10) + 2;
      user.inventory[itemKey]--;
      msg = `🗡♪ɪᴛᴇᴍ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\nPara verte completo con${itemKey.toUpperCase()}*.\n♪⚔# Hit add up: + 2 (ahora:${user.rpg.attack})`;
      break;

    case "scroll": {
      user.inventory[itemKey]--;
      const scrollRewards = [
        { type: "koin", min: 2000, max: 10000, icon: "💰" },
        { type: "exp", min: 1000, max: 8000, icon: "✨" },
      ];
      const sPick = scrollRewards[Math.floor(Math.random() * scrollRewards.length)];
      let sRewardMsg = "";
      if (sPick.type === "koin") {
        const amount = Math.floor(Math.random() * (sPick.max - sPick.min)) + sPick.min;
        user.koin = (user.koin || 0) + amount;
        sRewardMsg = `${sPick.icon}Ryo ( Monedas ): +${amount.toLocaleString("id-ID")}`;
      } else {
        const amount = Math.floor(Math.random() * (sPick.max - sPick.min)) + sPick.min;
        db.updateExp(m.sender, amount);
        sRewardMsg = `${sPick.icon} EXP Ninja: +${amount.toLocaleString("id-ID")}`;
      }
      msg = `📜*ᴄʀᴏʟʟ ᴅɪʙᴀᴄᴀ*\n\nPara verte abrir el Ninja Secret Scroll..\n♪${sRewardMsg}`;
      break;
    }

    case "common":
    case "uncommon":
    case "mythic":
    case "legendary":
      user.inventory[itemKey]--;
      const rewardMoney =
        Math.floor(Math.random() * (itemKey === "legendary" ? 100000 : 10000)) +
        1000;
      const rewardExp =
        Math.floor(Math.random() * (itemKey === "legendary" ? 5000 : 500)) +
        100;

      user.koin = (user.koin || 0) + rewardMoney;
      db.updateExp(m.sender, rewardExp);

      msg =
        `🎁 *ᴄʀᴀᴛᴇ ᴅɪʙᴜᴋᴀ*\n\n` +
        `*Te estás abriendo*${itemKey} Crate*!\n` +
        `> 💰 Money: +Rp ${rewardMoney.toLocaleString("id-ID")}\n` +
        `> 🚄 Exp: +${rewardExp}`;
      break;

    default:
      return m.reply(
        `❌*ɪᴛᴇᴍ ᴛɪᴅᴀᴋ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ*\n\n♪ Artículos ♪${itemKey}* Inutilizable.`,
      );
  }

  db.save();
  await m.reply(msg);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
