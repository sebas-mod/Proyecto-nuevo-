"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikugamedatajs = require('../../src/lib/almiku-game-data.js');
const pluginConfig = {
    name: 'dare',
    alias: ['dareq', 'tantang'],
    category: 'fun',
    description: 'Random tantangan dare',
    usage: '.dare',
    example: '.dare',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const challenge = _almikugamedatajs.getRandomItem.call(void 0, 'dare.json');
    
    if (!challenge) {
        await m.reply('❌¡Datos no disponibles!');
        return;
    }
    
    await m.reply(`\`\`\`${challenge}\`\`\``);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
