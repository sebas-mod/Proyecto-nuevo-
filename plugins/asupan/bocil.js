"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
const pluginConfig = {
    name: 'bocil',
    alias: ['bocilvid'],
    category: 'asupan',
    description: 'Video bocil',
    usage: '.bocil',
    example: '.bocil',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function loadJsonData(filename) {
    try {
        const filePath = _path2.default.join(process.cwd(), 'src', 'tiktok', filename)
        if (_fs2.default.existsSync(filePath)) {
            return JSON.parse(_fs2.default.readFileSync(filePath, 'utf-8'))
        }
    } catch (e) {}
    return []
}

async function handler(m, { sock }) {
    m.react('🕕')
    
    try {
        const data = loadJsonData('bocil.json')
        
        if (data.length === 0) {
            m.react('❌')
            return m.reply(`❌ Data tidak tersedia`)
        }
        
        const item = data[Math.floor(Math.random() * data.length)]
        
        await sock.sendMedia(m.chat, item.url, null, m, {
            type: 'video'
        })
        m.react('✅')
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Video tidak ditemukan`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
