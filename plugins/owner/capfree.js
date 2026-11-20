"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "capfree",
  alias: ["capgratis", "setfree"],
  category: "owner",
  description: "Rocíe muchas características una vez un gradiente",
  usage: ".capfree <nama_fitur1> <nama_fitur2> ...",
  example: ".capfree hd jpm warn",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🆓91; SISTETAS CAP Gratis\n\n` +
      `El sistema para restaurar el estado de acción de muchas características a la vez se convierte en un público gradiente.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}sin gorra<nama_fitur1> <nama_fitur2>...—Las semillas son muchas de ellas.\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}capfree hd jpm warn*\n\n` +
      `*Explicación:*\n` +
      `Introduzca una o más características que quieren ser libres.`
    );
  }

  await m.react("🕕");
  
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const overrides = db.setting("capprem") || {};
  
  let successList = [];
  let failedList = [];
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = _ourinpluginsjs.getPlugin.call(void 0, targetCommand);
    if (!plugin) {
      failedList.push(targetCommand);
    } else {
      overrides[plugin.config.name] = false;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capprem", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅* SITUACIÓN DE LA HEAVILY *\n\n`;
  if (successList.length > 0) {
    msg += `*Exito (FREE🆓♪\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `* Impresionantemente (no se encuentra ):\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `Las atas Función son amora libele e inalcanzables por todas las fotos.`;
  
  return m.reply(msg.trim());
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
