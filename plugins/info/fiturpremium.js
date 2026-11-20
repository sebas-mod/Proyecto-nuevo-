"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "fiturpremium",
  alias: ["listprem", "listpremium", "fiturprem"],
  category: "info",
  description: "Melihat daftar seluruh fitur premium bot",
  usage: ".fiturpremium",
  example: ".fiturpremium",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.react("🕕");

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const overrides = db.setting("capprem") || {};
  const allPlugins = _ourinpluginsjs.getAllPlugins.call(void 0, );
  
  let premiumFeatures = [];
  
  for (const plugin of allPlugins) {
    if (plugin && plugin.config && plugin.config.name) {
      const isPremium = overrides[plugin.config.name] !== undefined 
        ? overrides[plugin.config.name] 
        : plugin.config.isPremium;
        
      if (isPremium) {
        premiumFeatures.push(plugin.config.name);
      }
    }
  }
  
  if (premiumFeatures.length === 0) {
    await m.react("✅");
    return m.reply(
      `📝 *DAFTAR FITUR PREMIUM*\n\n` +
      `Saat ini belum ada fitur yang terdaftar sebagai fitur premium eksklusif.`
    );
  }
  
  premiumFeatures.sort(); // Urutkan sesuai abjad
  
  let listText = premiumFeatures.map((f) => `- ${f}`).join("\n");
  
  await m.react("✅");
  return m.reply(
    `💎 *DAFTAR FITUR PREMIUM*\n\n` +
    `Berikut adalah seluruh daftar fitur eksklusif yang hanya bisa diakses oleh member berstatus Premium:\n\n` +
    `${listText}\n\n` +
    `_Untuk berlangganan premium, silakan hubungi owner._`
  );
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
