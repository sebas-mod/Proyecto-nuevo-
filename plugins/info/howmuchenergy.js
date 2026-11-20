"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "howmuchenergy",
  alias: ["cekenergi"],
  category: "info",
  description: "Comprobación del uso energético de muchas características a la vez",
  usage: ".howmuchenergy <nama_fitur1> <nama_fitur2> ...",
  example: ".howmuchenergy hd jpm",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (m.args.length === 0) {
    return m.reply(
      `🔍* INDIAN INVESTIGATING *\n\n` +
      `El sistema para saber qué es necesario un enorme pedazo de energía para usar una o varias características a la vez.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}howmuchenergy <nama_fitur1> <nama_fitur2> ...*\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}howmuchenergy hd jpm*\n\n` +
      `*Explicación:*\n` +
      `Insertar el comando con una o varias funciones que deseas comprobar.`
    );
  }

  await m.react("🕕");
  
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const overrides = db.setting("capenergi") || {};
  
  let responseText = `🔋* DETALLES ENTERIES FIR *\n\n`;
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = _ourinpluginsjs.getPlugin.call(void 0, targetCommand);
    
    if (!plugin) {
      responseText += `❌ *${targetCommand}* ¡Descubierto!\n\n`;
      continue;
    }
    
    const energiCost = overrides[plugin.config.name] !== undefined 
      ? overrides[plugin.config.name] 
      : (plugin.config.energi || 0);
      
    responseText += `✅ *${plugin.config.name}* : ${energiCost} Energi\n`;
  }

  await m.react("✅");
  return m.reply(responseText.trim());
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
