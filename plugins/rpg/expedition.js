"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "expedition",
  alias: ["ekspedisi", "exp", "explore"],
  category: "rpg",
  description: "Expedición autodimensional para el artículo",
  usage: ".expedition <start/claim/status>",
  example: ".expedition start forest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const EXPEDITIONS = {
  forest: { name: "🌲 Hutan Laba-laba", duration: 1800000, rewards: ["wood", "herb", "mushroom"], exp: 100, minLevel: 1 },
  cave: { name: "🏔️ Gua Kelelawar", duration: 3600000, rewards: ["iron", "gold", "gem"], exp: 200, minLevel: 5 },
  volcano: { name: "🌋 Gunung Naga", duration: 7200000, rewards: ["lava", "dragonscale", "titancore"], exp: 400, minLevel: 15 },
  ocean: { name: "🌊 Samudra Kraken", duration: 5400000, rewards: ["fish", "pearl", "seagem"], exp: 300, minLevel: 10 },
  ruins: { name: "🏛️ Reruntuhan Kuno", duration: 10800000, rewards: ["ancientcoin", "relic", "mysterybox"], exp: 600, minLevel: 20 },
};

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};
  if (!user.rpg.expeditions) user.rpg.expeditions = [];

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const expType = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);

  const maxExpeditions = Math.min(5, 1 + Math.floor((user.level || 1) / 10));

  if (!action || !["start", "claim", "status", "list"].includes(action)) {
    let txt = `🗺️ *MARKAS EKSPEDISI* 🗺️\n\n`;
    txt += `La compañía de expedición para el comercio raro después de romper hermano!\n\n`;
    txt += `*Lista de comandos:*\n`;
    txt += `📜 \`${m.prefix}exLista de expedición\`(Comprueba Area)\n`;
    txt += `🚀 \`${m.prefix}expediión de inicio<area>\`(Empieza Ekspedisi)\n`;
    txt += `⏳ \`${m.prefix}expedition estado\`(Comprueba Timer)\n`;
    txt += `💰 \`${m.prefix}expedition claim\`(Retirar Resultado)\n\n`;
    txt += `📊Capacidad de expedición Usted: *${user.rpg.expeditions.length}/${maxExpeditions} Rombongan*`;
    return m.reply(txt);
  }

  if (action === "list") {
    let txt = `📜* EXPECCIONES DE Mundo PETA *📜\n\n`;

    for (const [key, exp] of Object.entries(EXPEDITIONS)) {
      const canGo = (user.level || 1) >= exp.minLevel;
      txt += `📍 ${exp.name} ${canGo ? "🔓" : "🔒"}\n`;
      txt += `   ├ ⏳Tiempo:${formatTime(exp.duration)}\n`;
      txt += `   ├ 🎁 Potensi Loot: ${exp.rewards.join(", ")}\n`;
      txt += `   ├ 📈 EXP: ${exp.exp} (Min Lv. ${exp.minLevel})\n`;
      txt += `   └ 🚀Código Area:\`${key}\`\n\n`;
    }
    return m.reply(txt);
  }

  if (action === "start") {
    if (user.rpg.expeditions.length >= maxExpeditions) {
      return m.reply(`¡Adiós, hermana, tu capacidad de ex¡La pedición está en pis!${user.rpg.expeditions.length}/${maxExpeditions})\n¡Espera a que vuelva otro lote!`);
    }

    if (!expType) {
      return m.reply(`Elige la zona de expedición, hermana!\nEjemplo:\`${m.prefix}expedition start forest\``);
    }

    const exp = EXPEDITIONS[expType];
    if (!exp) {
      return m.reply(`Lo siento, hermana, área${expType}- No, no, no. - ¡En el mapa!`);
    }

    if ((user.level || 1) < exp.minLevel) {
      return m.reply(`Mi hermano, Nivel, aún eres corto.${exp.minLevel}¡Haga la expedición ahí!`);
    }

    user.rpg.expeditions.push({
      type: expType,
      startedAt: Date.now(),
      duration: exp.duration,
    });
    db.save();

    let txt = `🚀 *EKSPEDISI DIBERANGKATKAN!* 🚀\n\n`;
    txt += `¡Su grupo de expedición ya se ha movido hacia el objetivo!\n`;
    txt += `📍 Tujuan: *${exp.name}*\n`;
    txt += `⏱Estigación del tiempo:${formatTime(exp.duration)}*\n\n`;
    txt += `Por favor, relájese, hermano. Tome los resultados con pedidos.\`${m.prefix}expedition claim\`!`;

    return m.reply(txt);
  }

  if (action === "status") {
    if (user.rpg.expeditions.length === 0) {
      return m.reply(`Hay una expedición en marcha.🏕♪`);
    }

    let txt = `⏳ *RADAR EKSPEDISI* ⏳\n\n`;

    for (let i = 0; i < user.rpg.expeditions.length; i++) {
      const exp = user.rpg.expeditions[i];
      const expInfo = EXPEDITIONS[exp.type];
      const elapsed = Date.now() - exp.startedAt;
      const remaining = Math.max(0, exp.duration - elapsed);
      const done = remaining <= 0;

      txt += `🗺️ *Rombongan ${i + 1}* -> ${expInfo.name}\n`;
      txt += `   └ Status: ${done ? "✅ SELESAI! (Siap Claim)" : `🕒 Sisa ${formatTime(remaining)}`}\n\n`;
    }
    return m.reply(txt);
  }

  if (action === "claim") {
    const completedExps = user.rpg.expeditions.filter((e) => {
      return Date.now() - e.startedAt >= e.duration;
    });

    if (completedExps.length === 0) {
      return m.reply(`No se hace expedición primero\`${m.prefix}expedition status\` ya!`);
    }

    let totalExp = 0;
    let allRewards = [];

    for (const exp of completedExps) {
      const expInfo = EXPEDITIONS[exp.type];
      totalExp += expInfo.exp;

      for (const rewardItem of expInfo.rewards) {
        if (Math.random() > 0.4) {
          const qty = Math.floor(Math.random() * 5) + 1;
          user.inventory[rewardItem] = (user.inventory[rewardItem] || 0) + qty;
          allRewards.push(`${rewardItem} x${qty}`);
        }
      }
    }

    user.rpg.expeditions = user.rpg.expeditions.filter((e) => {
      return Date.now() - e.startedAt < e.duration;
    });

    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, totalExp);
    db.save();

    await m.react("✅");

    let txt = `🎉*EKSPEDISI Terminado!*🎉\n\n`;
    txt += `Reagrupar y traer resultados de *${completedExps.length} ekspedisi*!\n\n`;
    txt += `*🎁Resultado Búsqueda:*\n`;
    txt += `✨ EXP: *+${totalExp}*\n`;
    if (allRewards.length > 0) {
      txt += `📦 Items:\n`;
      for (const r of allRewards) {
        txt += `  • ${r}\n`;
      }
    } else {
      txt += `📦Temas: * Aw, querido, está vez no es nada.. *😭\n`;
    }

    return m.reply(txt);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
