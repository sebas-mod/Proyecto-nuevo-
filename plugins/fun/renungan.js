"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamedatajs = require('../../src/lib/ourin-game-data.js');
var _ourinutilsjs = require('../../src/lib/ourin-utils.js');
const pluginConfig = {
    name: 'renungan',
    alias: ['motivasi', 'mutiara'],
    category: 'fun',
    description: 'Reducción de imagen aleatoria / motivación',
    usage: '.renungan',
    example: '.renungan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    m.react('🕕')
    try {
        await sock.sendMedia(m.chat, _ouringamedatajs.getRandomItem.call(void 0, 'renungan.json'), null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('❌')
        await m.reply('❌Gagaltook imágenes.');
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
