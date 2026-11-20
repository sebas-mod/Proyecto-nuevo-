"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'lahelu',
    alias: ['randommeme'],
    category: 'random',
    description: 'Random gambar lahelu',
    usage: '.lahelu',
    example: '.lahelu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const api = 'https://api.cuki.biz.id/api/random/lahelu?apikey=cuki-x'
    await m.react('🕕')
    
    try {
        const res = (await _axios2.default.get(api)).data
        const random = res.data[Math.floor(Math.random() * res.data.length)]
        if(random.media.includes('.mp4')) {
            await sock.sendMedia(m.chat, random.media, random.title, m, {
                type: 'video'
            })
        } else {
            await sock.sendMedia(m.chat, random.media, random.title, m, {
                type: 'image'
            })
        }
        await m.react('✅')
    } catch (e) {
        await m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
