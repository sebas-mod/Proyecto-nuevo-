"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "blacksmith",
  alias: ["tempa", "forge", "pandai"],
  category: "rpg",
  description: "*La armadura y armadura del material*",
  usage: ".blacksmith <item>",
  example: ".blacksmith sword",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

const RECIPES = {
  sword: { materials: { iron: 3, wood: 2 }, result: "sword", name: "⚔️ Pedang Besi", exp: 200, price: 500 },
  shield: { materials: { iron: 4, leather: 2 }, result: "shield", name: "🛡️ Perisai Besi", exp: 250, price: 600 },
  helmet: { materials: { iron: 2, leather: 1 }, result: "helmet", name: "⛑️ Helm Besi", exp: 150, price: 400 },
  armor: { materials: { iron: 5, leather: 3 }, result: "armor", name: "🦺 Armor Besi", exp: 350, price: 800 },
  axe: { materials: { iron: 2, wood: 3 }, result: "axe", name: "🪓 Kapak Besi", exp: 180, price: 450 },
  pickaxe: { materials: { iron: 3, wood: 2 }, result: "pickaxe", name: "⛏️ Beliung", exp: 180, price: 450 },
  bow: { materials: { wood: 4, string: 2 }, result: "bow", name: "🏹 Busur", exp: 200, price: 500 },
  arrow: { materials: { wood: 1, iron: 1 }, result: "arrow", name: "🏹 Anak Panah x10", exp: 50, price: 100, qty: 10 },
  goldsword: { materials: { gold: 5, diamond: 2, iron: 3 }, result: "goldsword", name: "🗡️ Pedang Emas", exp: 500, price: 2000 },
  diamondarmor: { materials: { diamond: 8, iron: 5, leather: 3 }, result: "diamondarmor", name: "💎 Armor Berlian", exp: 800, price: 5000 },
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const itemName = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (!itemName) {
    let txt = `Bienvenido al lugar Pandai Bessi!🔨⚒♪\n¿Puedo ayudarte hoy?\n\n`;
    txt += `* Lista de armas con armadura:\n`;

    for (const [key, recipe] of Object.entries(RECIPES)) {
      const mats = Object.entries(recipe.materials)
        .map(([m, qty]) => `${qty}x ${m}`)
        .join(", ");
      txt += `\n*${recipe.name}*\n`;
      txt += `📦 Bahan: ${mats}\n`;
      txt += `📈 EXP: +${recipe.exp}\n`;
      txt += `👉Escribe:\`Herreros.${key}\`\n`;
    }
    txt += `\n💡* Consejos: * Los materiales pueden ser buscados\`. minería\`o\`. Caza\`¡Iho!`;

    return m.reply(txt);
  }

  const recipe = RECIPES[itemName];
  if (!recipe) {
    return m.reply(`¡No estoy en mi cuaderno!😂\nLista de verificación de la pata\`Herreros.\`si!`);
  }

  const missingMaterials = [];
  for (const [material, needed] of Object.entries(recipe.materials)) {
    const have = user.inventory[material] || 0;
    if (have < needed) {
      missingMaterials.push(`• ${material}: ${have}/${needed}`);
    }
  }

  if (missingMaterials.length > 0) {
    return m.reply(`Eits, the material is 't enough for a pipe.${recipe.name}* aquí!😭\n\nKekurangannya:\n${missingMaterials.join("\n")}\n\nKumpulin antes, nuevo balik a sini! 🏃💨`);
  }

  await m.react("🔨");
  await m.reply(`¡Ting!🔥🔨\nMetal forjado para hacer *${recipe.name}... el proceso es un poco de comida!`);
  await new Promise((r) => setTimeout(r, 4000));

  for (const [material, needed] of Object.entries(recipe.materials)) {
    user.inventory[material] -= needed;
    if (user.inventory[material] <= 0) delete user.inventory[material];
  }

  const resultQty = recipe.qty || 1;
  user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty;

  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, recipe.exp);
  db.save();

  await m.react("✅");

  let txt = `¡El tiroteo está sucediendo!⚔♪🛡♪\n\n`;
  txt += `Gila,¡el resultado es un Mucho!\n`;
  txt += `🔨Objeto: *${recipe.name}*\n`;
  txt += `📊Cantidad: *+${resultQty}*\n`;
  txt += `📈 EXP Crafting: *+${recipe.exp}*\n\n`;
  txt += `¡Prepárense para luchar!😎🔥`;

  return m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
