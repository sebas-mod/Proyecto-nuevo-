"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamedatajs = require('../../src/lib/ourin-game-data.js');
const pluginConfig = {
    name: 'bucin',
    alias: ['gombal', 'love', 'romantis'],
    category: 'fun',
    description: 'Random kata-kata bucin/romantis',
    usage: '.bucin',
    example: '.bucin',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const quote = _ouringamedatajs.getRandomItem.call(void 0, 'bucin.json');
    
    if (!quote) {
        await m.reply('❌¡Datos no disponibles!');
        return;
    }
    
    await m.reply(`\`\`\`"${quote}"\`\`\`\n\n`);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
