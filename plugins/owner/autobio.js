"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "autobio",
  alias: ["autostatus"],
  category: "owner",
  description: "Gestiona la actualización bio WhatsApp bot automatally",
  usage: ".autobio on/off\n.autobio <teks>",
  example: ".autobio on\n.autobio Bot by Owner | 🕒 {clock} | ⏳ {runtime}",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, db }) {
  const arg = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  
  if (!arg) {
    const status = db.setting("autobio_status") || false;
    const text = db.setting("autobio_text") || "♪🕒 {clock}♪⏳ {runtime}";
    const intervalMs = db.setting("autobio_interval") || 60000;
    
    return m.reply(
      `📝 *AUTO BIO SETTINGS*\n\n` +
      `> Status: *${status ? "Aktif ✅" : "Nonaktif ❌"}*\n` +
      `> Interval: *${intervalMs / 1000}segundo*\n` +
      `Tanques${text}\n\n` +
      `*Uso:*\n` +
      `- *${m.prefix}autobio on/off* — Menyalakan/mematikan fitur\n` +
      `- *${m.prefix}autobio cambia cada<waktu>*—Administra intervalo.\`Autobio cambia cada 30 segundos.\`o\`1 hora\`\n` +
      `- *${m.prefix}autobio<teks>*—Gestionar bio @-@ texto\n\n` +
      `*PLACEHOLDER Disponible:*\n` +
      `-\`{clock}\` —Adjuntar reloj actual\n` +
      `-\`{runtime}\` —Mostrar largo @-@ term tanning bot\n` +
      `-\`{botname}\` —Adjuntar el nombre de bot de config\n` +
      `-\`{version}\` —Adjuntar la versión bot -`
    );
  }

  const option = arg.toLowerCase();
  
  if (option === "on") {
    db.setting("autobio_status", true);
    await m.react("✅");
    try {
      const { startAutoBioChecker } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/ourin-scheduler.js")));
      startAutoBioChecker(sock);
    } catch (e) {}
    return m.reply(`✅* AUTO BIO ACCENT *\n\n* WhatsApp bot ahora se actualiza en un automático cada minuto.*`);
  }
  
  if (option === "off") {
    db.setting("autobio_status", false);
    await m.react("❌");
    return m.reply(`❌* AUTO BIO DINONACTIFIT *\n\n*Qué pasa* *no se actualizará más*`);
  }

  if (option.startsWith("ganti_setiap")) {
    const timeStr = arg.replace(/ganti_setiap/i, "").trim().toLowerCase();
    if (!timeStr) {
      return m.reply("❌*Formato Incorrecto*\n\nEjemplo:`Autobio cambia cada 30 segundos.`o`1 hora`");
    }

    let ms = 0;
    const value = parseInt(timeStr);
    if (isNaN(value)) {
      return m.reply("❌*Formato Incorrecto*\n\nInserte el número válido.`Autobio cambia cada 30 segundos.`");
    }

    if (timeStr.includes("d") || timeStr.includes("detik")) ms = value * 1000;
    else if (timeStr.includes("m") || timeStr.includes("menit")) ms = value * 60000;
    else if (timeStr.includes("j") || timeStr.includes("jam")) ms = value * 3600000;
    else ms = value * 60000; //♪ Predeterminado to minutes ♪

    if (ms < 10000) {
      return m.reply("❌*Fallido*\n\nEl intervalo mínimo es de 10 segundos de para que unhit spam de WhatsApp servidor.");
    }

    db.setting("autobio_interval", ms);
    await m.react("✅");
    
    // Restart scheduler
    try {
      const { startAutoBioChecker } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/ourin-scheduler.js")));
      startAutoBioChecker(sock);
    } catch (e) {}

    return m.reply(`✅*Interval Cambiado*\n\n*Estará en cada actualización*${value} ${timeStr.replace(/[0-9\s]/g, "")}* (o${ms / 1000}segundo).`);
  }

  db.setting("autobio_text", arg);
  await m.react("✅");
  
  // Restart scheduler to apply new text immediately
  try {
    const { startAutoBioChecker } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/ourin-scheduler.js")));
    startAutoBioChecker(sock);
  } catch (e) {}
  
  return m.reply(
    `✅* Tekes azules cubiertos *\n\n` +
    `Nuevos formatos autobiobio guardados:\n` +
    `> ${arg}`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
