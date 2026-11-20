"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
const pluginConfig = {
    name: 'asupan',
    alias: ['asupanrandom'],
    category: 'asupan',
    description: 'Random video asupan',
    usage: '.asupan',
    example: '.asupan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function loadJsonData() {
    const tiktokDir = _path2.default.join(process.cwd(), 'src', 'tiktok')
    const files = ['bocil.json', 'gheayubi.json', 'kayes.json', 'notnot.json', 'panrika.json', 'santuy.json', 'tiktokgirl.json', 'ukhty.json']
    let allUrls = []
    
    for (const file of files) {
        try {
            const filePath = _path2.default.join(tiktokDir, file)
            if (_fs2.default.existsSync(filePath)) {
                const data = JSON.parse(_fs2.default.readFileSync(filePath, 'utf-8'))
                allUrls = allUrls.concat(data.map(d => d.url))
            }
        } catch (e) {}
    }
    
    return allUrls
}

async function handler(m, { sock }) {
    m.react('🕕')
    
    try {
        const urls = loadJsonData()
        
        if (urls.length === 0) {
            m.react('❌')
            return m.reply(`❌ Data asupan tidak tersedia`)
        }
        
        const url = urls[Math.floor(Math.random() * urls.length)]
        
        const res = await _ourinhttpjs.f.call(void 0, url, 'arrayBuffer')
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, Buffer.from(res), null, m, {
            type: 'video'
        })
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Video asupan tidak ditemukan`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
