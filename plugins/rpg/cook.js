"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "cook",
  alias: ["masak"],
  category: "rpg",
  description: "Instalar alimentos para agregar salud",
  usage: ".cook",
  example: ".cook",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

const RECIPES = {
  fish_soup: { name: "🍲 Sup Ikan", materials: { fish: 2 }, heal: 30 },
  grilled_meat: { name: "🍖 Daging Panggang", materials: { rabbit: 1, wood: 1 }, heal: 40 },
  apple_pie: { name: "🥧 Pie Apel", materials: { apple: 3 }, heal: 25 },
  steak: { name: "🥩 Steak", materials: { boar: 1, coal: 1 }, heal: 60 },
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;

  if (user.rpg.health >= user.rpg.maxHealth) {
    return m.reply(`¡Estás cansado, hermana!🤢\nNo cocines primero, y luego llegarás tarde a la carretera!🏃💨`);
  }

  let cooked = null;
  for (const [key, recipe] of Object.entries(RECIPES)) {
    let canCook = true;
    for (const [mat, qty] of Object.entries(recipe.materials)) {
      if ((user.inventory[mat] || 0) < qty) {
        canCook = false;
        break;
      }
    }
    if (canCook) {
      cooked = { key, ...recipe };
      break;
    }
  }

  if (!cooked) {
    let txt = `¿Qué estás cocinando hoy?🍳👨‍🍳\n\n`;
    txt += `Aquí hay una lista de recetas que puedes decir:\n\n`;
    for (const [key, recipe] of Object.entries(RECIPES)) {
      txt += `*${recipe.name}*\n`;
      txt += `❤️ Heal: +${recipe.heal} HP\n`;
      txt += `📦Bahan necesitaba:\n`;
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        const has = user.inventory[mat] || 0;
        txt += `• ${has >= qty ? "✅" : "❌"} ${mat}: ${has}/${qty}\n`;
      }
      txt += `\n`;
    }
    txt += `(Para cocinar una cocina automática de la primera receta que es suficiente! )`;
    return m.reply(txt);
  }

  for (const [mat, qty] of Object.entries(cooked.materials)) {
    user.inventory[mat] -= qty;
  }

  await m.react("🍳");
  await m.reply(`Srenggg.. Srengg..🔥🍳\nCocina otra vez${cooked.name}* aquí, wanginya sabroso mucho! 🤤`);
  await new Promise((r) => setTimeout(r, 3000));

  const oldHealth = user.rpg.health;
  user.rpg.health = Math.min(user.rpg.health + cooked.heal, user.rpg.maxHealth);

  db.save();

  await m.react("✅");

  let txt = `¡Buscaño, eres policía!🍽♪✨\n\n`;
  txt += `Tienes mucho tiempo para comer.${cooked.name}* y sentir bien!\n`;
  txt += `❤️ HP Pulih: ${oldHealth} 📈 *${user.rpg.health}*\n\n`;
  txt += `¡Continúe con más aventuras, Gass!🚀🔥`;

  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
