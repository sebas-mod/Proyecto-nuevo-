"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikugamedatajs = require('../../src/lib/almiku-game-data.js');
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
    const question = _almikugamedatajs.getRandomItem.call(void 0, 'truth.json');
    if (!question) {
        await m.reply('❌¡Datos no disponibles!');
        return;
    }
    await m.reply(`\`\`\`${question}\`\`\``);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
