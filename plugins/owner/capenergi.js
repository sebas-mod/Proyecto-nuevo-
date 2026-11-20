"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "capenergi",
  alias: ["setenergi"],
  category: "owner",
  description: "Cambiar el corte energético de muchas características a la vez.",
  usage: ".capenergi <nama_fitur1> <nama_fitur2> ... <jumlah>",
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
      `⚙ SISTETS CAP Energía •\n\n` +
      `El sistema de modificación dinámica se dibuja en energía para muchas características a la vez.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}capenergi <nama_fitur1> <nama_fitur2> ... <jumlah>*\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}capenergi hd jpm 5 * ( FITR HD TO JPM para cortar 5 energías )\n` +
      `- *${m.prefix}capenergi n0 capenergi * (la fuente HD se convierte en energía gradiente )\n\n` +
      `*Explicación:*\n` +
      `Ponga una o varias características en la fuente que desea cambiar.\n` +
      `2. El fin debe ser un nuevo número de fragmentos de energía.`
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
