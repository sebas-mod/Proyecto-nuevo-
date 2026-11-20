"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "capprem",
  alias: ["cappremium", "setprem"],
  category: "owner",
  description: "Rocíe muchas características a la vez para ser una prima",
  usage: ".capprem <comando1> <comando2> ...",
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
      `💎 SISTEMA DE COMANDOS PREMIUM\n\n` +
      `Marca varios comandos como exclusivos de Premium a la vez.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}capprem <comando1> <comando2> ...*\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}capprem hd jpm warn*\n\n` +
      `*Explicación:*\n` +
      `Escribe uno o varios comandos que quieras limitar a Premium.`
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
