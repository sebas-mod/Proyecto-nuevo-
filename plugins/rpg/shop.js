"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "shop",
  alias: ["beli", "jual", "toko", "store", "buy", "sell"],
  category: "rpg",
  description: "Comprar y vender artículo RPG",
  usage: ".shop <buy/sell> <item> <jumlah>",
  example: ".shop buy potion 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const ITEMS = {
  potion: { price: 500, type: "buyable", name: "🥤 Health Potion" },
  mpotion: { price: 500, type: "buyable", name: "🧪 Mana Potion" },
  stamina: { price: 1000, type: "buyable", name: "⚡ Stamina Potion" },

  common: { price: 2000, type: "buyable", name: "📦 Common Crate" },
  uncommon: { price: 10000, type: "buyable", name: "🛍️ Uncommon Crate" },
  mythic: { price: 50000, type: "buyable", name: "🎁 Mythic Crate" },
  legendary: { price: 200000, type: "buyable", name: "💎 Legendary Crate" },

  wheat: { price: 50, type: "buyable", name: "🌾 Gandum" },
  rice: { price: 50, type: "buyable", name: "🍚 Beras" },
  egg: { price: 100, type: "buyable", name: "🥚 Telur" },
  meat: { price: 300, type: "buyable", name: "🥩 Daging" },
  herb: { price: 150, type: "buyable", name: "🌿 Herba" },
  carrot: { price: 50, type: "buyable", name: "🥕 Wortel" },
  potato: { price: 50, type: "buyable", name: "🥔 Kentang" },
  strawberry: { price: 80, type: "buyable", name: "🍓 Stroberi" },
  watermelon: { price: 100, type: "buyable", name: "🍉 Semangka" },
  apple: { price: 50, type: "buyable", name: "🍎 Apel" },

  rock: { price: 20, type: "sellable", name: "🪨 Batu" },
  coal: { price: 50, type: "sellable", name: "⚫ Batubara" },
  iron: { price: 200, type: "sellable", name: "⛓️ Besi" },
  gold: { price: 1000, type: "sellable", name: "🥇 Emas" },
  diamond: { price: 5000, type: "sellable", name: "💠 Berlian" },
  emerald: { price: 10000, type: "sellable", name: "💚 Emerald" },

  trash: { price: 10, type: "sellable", name: "🗑️ Sampah" },
  fish: { price: 100, type: "sellable", name: "🐟 Ikan" },
  prawn: { price: 200, type: "sellable", name: "🦐 Udang" },
  octopus: { price: 500, type: "sellable", name: "🐙 Gurita" },
  shark: { price: 2000, type: "sellable", name: "🦈 Hiu" },
  whale: { price: 10000, type: "sellable", name: "🐳 Paus" },
  
  leather: { price: 50, type: "sellable", name: "👞 Kulit" },
  mysterybox: { price: 1500, type: "sellable", name: "📦 Mystery Box" },
  kunai: { price: 100, type: "sellable", name: "🗡️ Kunai" },
  shuriken: { price: 150, type: "sellable", name: "⚔️ Shuriken" },
  chakra: { price: 500, type: "sellable", name: "🌀 Chakra" },
  scroll: { price: 2000, type: "sellable", name: "📜 Scroll Ninja" },
  bowlramen: { price: 800, type: "sellable", name: "🍜 Ramen" },
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const args = m.args || [];

  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (!action || (action !== "buy" && action !== "sell")) {
    let txt = `🏪* Tienda Kelontong RPG *✨\n\n`;
    txt += `Bienvenido a la tienda de comestibles.\n¿Quieres comprar un pop o una cadena de basura?😂\n\n`;
    
    txt += `*Cara Transacción:*💸\n`;
    txt += `Escribe\`Compra compra.<nama> <jumlah>\`crea compra.\n`;
    txt += `Escribe\`. Venta de tienda<nama> <jumlah>\`crea vende.\n\n`;

    txt += `*🛍SONNY SALE\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "buyable") {
        txt += `${item.name}: *Rp ${item.price.toLocaleString("id-ID")}*\n`;
      }
    }
    txt += `\n`;

    txt += `*💰Recibido Barrera ( SILL ): *\n`;
    for (const [key, item] of Object.entries(ITEMS)) {
      if (item.type === "sellable") {
        txt += `${item.name}: *Rp ${item.price.toLocaleString("id-ID")}*\n`;
      }
    }

    return m.reply(txt);
  }

  const itemKey = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);
  const amount = parseInt(args[2]) || 1;

  if (!itemKey || !ITEMS[itemKey]) {
    return m.reply(`Aduh hermano, articulo${args[1] || "itu"}* No, está en la lista!😭❌\nIntente revisar nuevamente la lista de las cosas que tiene.\`. Tienda\`si.`);
  }

  const item = ITEMS[itemKey];

  if (action === "buy") {
    if (item.type !== "buyable") {
      return m.reply(`Hao lho hermano, articulo${item.name}* Es un especial para la venta, no puede comprar!🫣❌`);
    }

    const totalCost = item.price * amount;
    if ((user.koin || 0) < totalCost) {
      return m.reply(`Bueno, tu moneda no vale la pena comprar.${amount}x ${item.name}*😭😭\nKain you: * Rp${(user.koin || 0).toLocaleString("id-ID")}*\nKurang *Rp ${(totalCost - (user.koin || 0)).toLocaleString("id-ID")}" Y pagar primero el dinero ".💸🏃💨`);
    }

    user.koin = (user.koin || 0) - totalCost;
    user.inventory = user.inventory || {};
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + amount;

    db.save();
    return m.reply(`¡Pensaste en muchos niños!🎉✨\n\nTienes el canguro:\n🛒Objeto: *${amount}x ${item.name}*\n💸TOTAL Bayard: * Rp${totalCost.toLocaleString("id-ID")}*\n\nEsperado kedatangannya otra vez si! 💖🛍♪`);
  }

  if (action === "sell") {
    if (item.type !== "sellable") {
      return m.reply(`Lo siento hermano, nuestra tienda te espera${item.name}* This, the talk sold again😂❌`);
    }

    const userInventory = user.inventory || {};
    const userStock = userInventory[itemKey] || 0;

    if (userStock < amount) {
      return m.reply(`Hermano, ¡las cosas no son lo suficientemente buenas!🫣\nAcabas de tener...${userStock}x ${item.name}*, tiempo para ganar *${amount}No te pongas tan alto y poderoso en mí!😂❌`);
    }

    const totalProfit = item.price * amount;

    user.inventory = user.inventory || {};
    user.inventory[itemKey] = userStock - amount;
    user.koin = (user.koin || 0) + totalProfit;

    db.save();
    return m.reply(`Amor, dinero, dinero, dinero, dinero, dinero.💰✨\n\nHiciste un gran trabajo:\n📦Objeto: *${amount}x ${item.name}*\n🤑Total Get: * Rp${totalProfit.toLocaleString("id-ID")}*\n\n¡Gracias por la casa de la piscina!🎉💖`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
