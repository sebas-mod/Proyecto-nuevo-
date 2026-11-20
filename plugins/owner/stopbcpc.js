"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
  name: 'stopbcpc',
  alias: ['stopbroadcastpc'],
  category: 'owner',
  description: 'Detenga la radiodifusión primate corriendo',
  usage: '.stopbcpc',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  if (!global.statusBcpc) {
    return m.reply('❌No hay una radio de radio primate está caminando.')
  }
  global.stopBcpc = true
  return m.reply('⏹️ Menghentikan broadcast private...')
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
