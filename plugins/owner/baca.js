"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
  name: ["baca", "read", "markread"],
  alias: [],
  category: "owner",
  description: "Mensajes de alta resolución como ya en el archivo",
  usage: ".baca",
  example: ".baca",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.readMessages([m.key]);
    await m.react("✅");
    return m.reply("📖* Mensaje marcado ya con pantano *");
  } catch (err) {
    return m.reply(`❌Fallido:${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
