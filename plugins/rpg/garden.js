"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "garden",
  alias: ["kebun", "farm", "tanam"],
  category: "rpg",
  description: "Jardinería y cultivos",
  usage: ".garden <plant/harvest/status>",
  example: ".garden plant carrot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const CROPS = {
  carrot: { name: "🥕 Wortel", growTime: 300000, exp: 50, sellPrice: 30, seedPrice: 10 },
  tomato: { name: "🍅 Tomat", growTime: 600000, exp: 80, sellPrice: 50, seedPrice: 20 },
  corn: { name: "🌽 Jagung", growTime: 900000, exp: 120, sellPrice: 80, seedPrice: 35 },
  potato: { name: "🥔 Kentang", growTime: 1200000, exp: 150, sellPrice: 100, seedPrice: 45 },
  strawberry: { name: "🍓 Stroberi", growTime: 1800000, exp: 200, sellPrice: 150, seedPrice: 60 },
  watermelon: { name: "🍉 Semangka", growTime: 3600000, exp: 350, sellPrice: 300, seedPrice: 100 },
  pumpkin: { name: "🎃 Labu", growTime: 7200000, exp: 500, sellPrice: 500, seedPrice: 150 },
  herb: { name: "🌿 Herba", growTime: 1500000, exp: 180, sellPrice: 120, seedPrice: 50 },
};

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};
  if (!user.rpg.garden) user.rpg.garden = { plots: [], maxPlots: 3 };

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const cropName = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);

  if (!action || !["plant", "harvest", "status", "buy"].includes(action)) {
    let txt = `¡Hao Juagan Soil!👨‍🌾🌻\n`;
    txt += `Enfóquese en su información personal del jardín.\n\n`;
    
    txt += `* Menú de soledad: *\n`;
    txt += `• \`${m.prefix}garden estado\`- Revisa el clima de jardín\n`;
    txt += `• \`${m.prefix}jardín comprar<tanaman> <jumlah>\`- Compra algunas judías.\n`;
    txt += `• \`${m.prefix}planta de jardín<tanaman>\`- Jabón en el campo acogedor.\n`;
    txt += `• \`${m.prefix}cosecha de jardín\`- Cosecha a todos los elegantes.\n\n`;

    txt += `* Lista de Biblings enviados: *\n`;
    for (const [key, crop] of Object.entries(CROPS)) {
      txt += `\n*${crop.name}*\n`;
      txt += `⏳Tiempo Tumbuh:${formatTime(crop.growTime)}\n`;
      txt += `💰Precio Vende: Rp${crop.sellPrice}♪🌱Bial Precio:${crop.seedPrice}\n`;
      txt += `👉Compra:\`- Comprar jardín.${key}\`\n`;
    }
    return m.reply(txt);
  }

  if (action === "status") {
    const garden = user.rpg.garden;
    let txt = `" Chest Land of Solitude ".🚜🌱\n\n`;
    txt += `* Capacidad solar: *${garden.plots.length}de${garden.maxPlots} terisi.\n\n`;

    if (garden.plots.length === 0) {
      txt += `¡Todavía eres un jardín, hermano!🏜♪\nBuruan compra el bibit y sigue adelante\`${m.prefix}planta de jardín<nama>\`¡Déjame volver a ver!`;
    } else {
      txt += `*Registrate Lahan:*\n`;
      for (let i = 0; i < garden.plots.length; i++) {
        const plot = garden.plots[i];
        const crop = CROPS[plot.crop];
        const elapsed = Date.now() - plot.plantedAt;
        const remaining = Math.max(0, crop.growTime - elapsed);
        const ready = remaining <= 0;

        txt += `\n📍 Plot ${i + 1}: *${crop.name}*\n`;
        txt += `└ Status: ${ready ? "✨ SIAP PANEN! ✨" : `Tumbuh dalam ⏳ ${formatTime(remaining)}`}\n`;
      }
    }
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!cropName) {
      return m.reply(`Hayo, ¿qué estás haciendo?😂\nEjemplo:\`${m.prefix}garden buy carrot 5\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`Esa semilla no se vende en nuestra tienda de bronceado, hermana!❌\nLa lista de verificación está llegando.\`${m.prefix}garden\``);
    }

    const qty = Math.max(1, parseInt(args[2]) || 1);
    const totalCost = crop.seedPrice * qty;

    if ((user.koin || 0) < totalCost) {
      return m.reply(`Eits, no estás cortado.😭\nEl artículo de la compra es Rp${totalCost.toLocaleString()}, pero tu tela sigue siendo Rp${(user.koin || 0).toLocaleString()}.`);
    }

    user.koin -= totalCost;
    const seedKey = `${cropName}seed`;
    user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty;
    db.save();

    return m.reply(`¡Está comprando en Tienda Tani!🛒🌱\n\nCompras${qty}x Bibit ${crop.name}*\nTOTAL Bayard: * Rp${totalCost.toLocaleString()}*\n\nNo olvides ponerte en el suelo,\`${m.prefix}garden plant ${cropName}\`!`);
  }

  if (action === "plant") {
    if (!cropName) {
      return m.reply(`El útero está listo, pero ¿qué semillas te gustaría plantar?🌱\nEjemplo:\`${m.prefix}garden plant carrot\``);
    }

    const crop = CROPS[cropName];
    if (!crop) {
      return m.reply(`¡Está planta no está en el puesto de mi madre!❌`);
    }

    if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
      return m.reply(`El viento, el viento está lleno de ellos!🚜💨\n¡Tienes que calentar o más tu jardín!`);
    }

    const seedKey = `${cropName}seed`;
    if ((user.inventory[seedKey] || 0) < 1) {
      return m.reply(`No tienes frijoles.${crop.name}¡Hermano!😭\nComprar primero vamos in\`${m.prefix}garden buy ${cropName}\``);
    }

    user.inventory[seedKey]--;
    if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey];

    user.rpg.garden.plots.push({
      crop: cropName,
      plantedAt: Date.now(),
    });
    db.save();

    return m.reply(`Sipp! Bibit *${crop.name}* ¡El suelo está sembrado!🌱💦\nNo se olvide de que se utilice ( eh, automatización ), sólo espere *${formatTime(crop.growTime)}¡Hazlo una cosecha!`);
  }

  if (action === "harvest") {
    const garden = user.rpg.garden;
    const readyPlots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt >= crop.growTime;
    });

    if (readyPlots.length === 0) {
      return m.reply(`Hadeh, nadie es demasiado tarde todavía!😂\nCompruebe el tiempo @-@ out,\`${m.prefix}garden status\``);
    }

    let totalExp = 0;
    let harvestedItems = [];

    for (const plot of readyPlots) {
      const crop = CROPS[plot.crop];
      const qty = Math.floor(Math.random() * 3) + 2;
      user.inventory[plot.crop] = (user.inventory[plot.crop] || 0) + qty;
      totalExp += crop.exp;
      harvestedItems.push(`• ${crop.name} x${qty}`);
    }

    garden.plots = garden.plots.filter((p) => {
      const crop = CROPS[p.crop];
      return Date.now() - p.plantedAt < crop.growTime;
    });

    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, totalExp);
    db.save();

    await m.react("✅");
    return m.reply(
      `HOREE! PANEN Llegar! 🚜🌾✨\n\n` +
        `Tu trabajo duro se paga.\n` +
        harvestedItems.join("\n") +
        `\n\n` +
        `📈Bono EXP Tani: * +${totalExp}*\n\n` +
        `¡Más buruanes de granja para hacer comida!💸`
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
