"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikupluginsjs = require('../../src/lib/almiku-plugins.js');
var _almikudatabasejs = require('../../src/lib/almiku-database.js');

const config = {
  name: "whatrolethis",
  alias: ["whatrole", "cekrole", "cekakses"],
  category: "info",
  description: "Compruebe los términos de las acciones muchas características veces",
  usage: ".whatrolethis <comando1> <comando2> ...",
  example: ".whatrolethis hd jpm",
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
      `🔍 CONSULTAR ACCESO\n\n` +
      `Muestra qué rol (owner, premium o free) requiere uno o varios comandos.\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}whatrolethis <comando1> <comando2> ...*\n\n` +
      `*Ejemplo de uso:*\n` +
      `- *${m.prefix}whatrolethis hd jpm warn*\n\n` +
      `*Explicación:*\n` +
      `Insertar el comando con una o varias funciones que deseas comprobar.`
    );
  }

  await m.react("🕕");
  
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const overrides = db.setting("capprem") || {};
  
  let responseText = `🔍* DETALLES ACCESO FIR *\n\n`;
  
  for (const cmd of m.args) {
    const targetCommand = cmd.toLowerCase();
    const plugin = _almikupluginsjs.getPlugin.call(void 0, targetCommand);
    
    if (!plugin) {
      responseText += `❌ *${targetCommand}* ¡Descubierto!\n\n`;
      continue;
    }
    
    const isPremium = overrides[plugin.config.name] !== undefined 
      ? overrides[plugin.config.name] 
      : plugin.config.isPremium;
    
    let roles = [];
    
    if (plugin.config.isOwner) roles.push("Propietario Only👑");
    if (plugin.config.isAdmin) roles.push("Administrador del grupo👮");
    if (plugin.config.isBotAdmin) roles.push("*Aminencia*🤖");
    if (plugin.config.isGroup) roles.push("Grupo Only👥");
    if (plugin.config.isPrivate) roles.push("Private Chat 📱");
    if (isPremium) roles.push("Premium 💎");
    
    if (roles.length === 0) {
      roles.push("Libres / Todos🆓");
    }
    
    let listRoles = roles.map(r => `  - ${r}`).join("\n");
    responseText += `✅ *${plugin.config.name}*\n${listRoles}\n\n`;
  }

  await m.react("✅");
  return m.reply(responseText.trim());
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
