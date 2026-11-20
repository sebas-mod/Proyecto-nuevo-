"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "merchant",
  alias: ["npc", "toko", "tokoku"],
  category: "rpg",
  description: "Jual beli item ke NPC merchant",
  usage: ".merchant <buy/sell> <item> <qty>",
  example: ".merchant buy potion 5",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const SHOP_ITEMS = {
  potion: { name: "🧪 Potion", buyPrice: 100, sellPrice: 50, desc: "Pulihkan 50 HP" },
  manapotion: { name: "💙 Mana Potion", buyPrice: 150, sellPrice: 75, desc: "Pulihkan 50 Mana" },
  antidote: { name: "💊 Antidote", buyPrice: 80, sellPrice: 40, desc: "Sembuhkan racun" },
  bread: { name: "🍞 Roti", buyPrice: 30, sellPrice: 15, desc: "Pulihkan 10 stamina" },
  energydrink: { name: "⚡ Energy Drink", buyPrice: 200, sellPrice: 100, desc: "Pulihkan 50 stamina" },
  pickaxe: { name: "⛏️ Beliung", buyPrice: 500, sellPrice: 250, desc: "Para mining" },
  fishingrod: { name: "🎣 Joran", buyPrice: 400, sellPrice: 200, desc: "Para memancing" },
  wood: { name: "🪵 Kayu", buyPrice: 50, sellPrice: 25, desc: "Material dasar" },
  iron: { name: "🔩 Besi", buyPrice: 80, sellPrice: 40, desc: "Material logam" },
  leather: { name: "🧶 Kulit", buyPrice: 60, sellPrice: 30, desc: "Material armor" },
  string: { name: "🧵 Benang", buyPrice: 40, sellPrice: 20, desc: "Material busur" },
  herb: { name: "🌿 Herba", buyPrice: 70, sellPrice: 35, desc: "Bahan alchemy" },
  gold: { name: "🪙 Emas", buyPrice: 500, sellPrice: 250, desc: "Material langka" },
  diamond: { name: "💎 Berlian", buyPrice: 2000, sellPrice: 1000, desc: "Material mewah" },
};

function handler(m) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const itemKey = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);
  const qty = Math.max(1, parseInt(args[2]) || 1);

  if (!action || !["buy", "sell", "list"].includes(action)) {
    let txt = `🏪 *ᴍᴇʀᴄʜᴀɴᴛ sʜᴏᴘ*\n\n`;
    txt += `¡Feliz cumpleaños a ti en la tienda!\n\n`;
    txt += `*📋 *ᴄᴏᴍᴍᴀɴᴅ:*
\n`;
    txt += `> ${m.prefix}merchant list\n`;
    txt += `> ${m.prefix}merchant buy <item> <qty>\n`;
    txt += `> ${m.prefix}merchant sell <item> <qty>\n`;
    txt += `\n\n`;
    txt += `💰 *Balance:* ${(user.koin || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "list") {
    let txt = `🏪 *ᴅᴀꜰᴛᴀʀ ɪᴛᴇᴍ*\n\n`;
    txt += `*📦 *sʜᴏᴘ:*
\n`;

    for (const [key, item] of Object.entries(SHOP_ITEMS)) {
      txt += `> ${item.name}\n`;
      txt += `♪💵Compra:${item.buyPrice.toLocaleString()}\n`;
      txt += `♪💰Vende:${item.sellPrice.toLocaleString()}\n`;
      txt += `> 📝 ${item.desc}\n`;
      txt += `> → \`${key}\`\n`;
      txt += `> \n`;
    }
    txt += ``;

    return m.reply(txt);
  }

  if (action === "buy") {
    if (!itemKey) {
      return m.reply(`❌Tentukan objeto!\n\n> Ejemplo:\`${m.prefix}merchant buy potion 5\``);
    }

    const item = SHOP_ITEMS[itemKey];
    if (!item) {
      return m.reply(`❌¡El artículo no se encuentra!\n\n> Escribe\`${m.prefix}Lista de comerciantes\`para ver la lista.`);
    }

    const totalCost = item.buyPrice * qty;
    if ((user.koin || 0) < totalCost) {
      return m.reply(`❌ *ʙᴀʟᴀɴᴄᴇ ᴋᴜʀᴀɴɢ*\n\n` + `> Precio:${totalCost.toLocaleString()}\n` + `> Balance: ${(user.koin || 0).toLocaleString()}`);
    }

    user.koin -= totalCost;
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + qty;
    db.save();

    return m.reply(
      `✅ *ᴘᴇᴍʙᴇʟɪᴀɴ ʙᴇʀʜᴀsɪʟ*\n\n` +
        `*🛒 *ᴅᴇᴛᴀɪʟ:*
\n` +
        `♪📦Objeto: *${item.name}*\n` +
        `> 📊 Qty: *${qty}*\n` +
        `> 💵 Total: *-${totalCost.toLocaleString()}*\n` +
        `♪💰Restante: *${user.koin.toLocaleString()}*\n` +
        ``,
    );
  }

  if (action === "sell") {
    if (!itemKey) {
      return m.reply(`❌Tentukan objeto!\n\n> Ejemplo:\`${m.prefix}merchant sell iron 10\``);
    }

    const item = SHOP_ITEMS[itemKey];
    if (!item) {
      return m.reply(`❌¡Los artículos no pueden venderse a la mercancía!`);
    }

    const have = user.inventory[itemKey] || 0;
    if (have < qty) {
      return m.reply(`❌ *ɪᴛᴇᴍ ᴋᴜʀᴀɴɢ*\n\n` + `> Tener:${have}\n` + `# Para vender:${qty}`);
    }

    const totalEarn = item.sellPrice * qty;
    user.koin = (user.koin || 0) + totalEarn;
    user.inventory[itemKey] -= qty;
    if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey];
    db.save();

    return m.reply(
      `✅ *ᴘᴇɴᴊᴜᴀʟᴀɴ ʙᴇʀʜᴀsɪʟ*\n\n` +
        `*💰 *ᴅᴇᴛᴀɪʟ:*
\n` +
        `♪📦Objeto: *${item.name}*\n` +
        `> 📊 Qty: *${qty}*\n` +
        `> 💵 Total: *+${totalEarn.toLocaleString()}*\n` +
        `> 💰 Balance: *${user.koin.toLocaleString()}*\n` +
        ``,
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
