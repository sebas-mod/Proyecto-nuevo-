"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "capenergi",
  alias: ["setenergi"],
  category: "owner",
  description: "Cambiar el corte energético de muchas características a la vez.",
  usage: ".capenergi <comando1> <comando2> ... <cantidad>",
  example: ".capenergi hd fakedev 5",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length < 2) {
    return m.reply(
      `⚙ SISTEMA DE ENERGÍA POR COMANDO\n\n` +
      `Cambia el consumo de energía de varios comandos a la vez.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}capenergi <comando1> <comando2> ... <cantidad>*\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}capenergi hd jpm 5* (hd y jpm pasan a costar 5 de energía)\n` +
      `- *${m.prefix}capenergi hd 0* (hd pasa a ser gratis)\n\n` +
      `*Explicación:*\n` +
      `1. Escribe uno o varios comandos cuyo coste quieres cambiar.\n` +
      `2. Al final debe ir el nuevo número de energía.`
    );
  }

  const rawCost = m.args[m.args.length - 1];
  const cost = parseInt(rawCost);
  
  if (isNaN(cost) || cost < 0) {
    return m.reply(`❌*Fallido*\n\nLa cantidad de energía (en el último argumento ) debe ser cero o más.`);
  }

  const commands = m.args.slice(0, -1);

  await m.react("🕕");
  
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const overrides = db.setting("capenergi") || {};
  
  let successList = [];
  let failedList = [];
  
  for (const cmd of commands) {
    const targetCommand = cmd.toLowerCase();
    const plugin = _ourinpluginsjs.getPlugin.call(void 0, targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = cost;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capenergi", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅* Descuento ENTIVE STATONS DEPRECATE *\n\n`;
  if (successList.length > 0) {
    msg += `* Vale la pena convertirlo en${cost}Energía:*\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `* Impresionantemente (no se encuentra ):\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `Para dejar toda la base de datos y la gestión de datos.`;
  return m.reply(msg.trim());
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
