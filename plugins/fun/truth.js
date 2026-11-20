"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamedatajs = require('../../src/lib/ourin-game-data.js');
const pluginConfig = {
    name: 'truth',
    alias: ['truthq'],
    category: 'fun',
    description: 'Random pertanyaan truth',
    usage: '.truth',
    example: '.truth',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const question = _ouringamedatajs.getRandomItem.call(void 0, 'truth.json');
    if (!question) {
        await m.reply('❌ Data tidak tersedia!');
        return;
    }
    await m.reply(`\`\`\`${question}\`\`\``);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
