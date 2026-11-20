"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "capprem",
  alias: ["cappremium", "setprem"],
  category: "owner",
  description: "Rocíe muchas características a la vez para ser una prima",
  usage: ".capprem <nama_fitur1> <nama_fitur2> ...",
  example: ".capprem hd jpm warn",
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
      `💎* PREMUM DE LA CAPITUACIÓN SISTEMA >\n\n` +
      `Systemaxclusivos para cimiar el estado de las acones muchas características se subsidertieron en Premium.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}capprem<nama_fitur1> <nama_fitur2>...—Las semillas son muchas de ellas.\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}capprem hd jpm warn*\n\n` +
      `*Explicación:*\n` +
      `Ponga una o más características que Premium quiere umar.`
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
      overrides[plugin.config.name] = true;
      successList.push(plugin.config.name);
    }
  }
  
  db.setting("capprem", overrides);
  await db.save();

  await m.react("✅");
  
  let msg = `✅* SITUACIÓN DE LA HEAVILY *\n\n`;
  if (successList.length > 0) {
    msg += `*Exito (Premium💎\n${successList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  if (failedList.length > 0) {
    msg += `* Impresionantemente (no se encuentra ):\n${failedList.map(f => `- ${f}`).join("\n")}\n\n`;
  }
  
  msg += `La característica actual es sólo accionable por el miembro Premium.`;
  
  return m.reply(msg.trim());
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
