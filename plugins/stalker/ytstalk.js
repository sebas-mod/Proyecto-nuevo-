"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
    name: 'ytstalk',
    alias: ['youtubestalk', 'stalkyt'],
    category: 'stalker',
    description: 'Stalk channel YouTube',
    usage: '.ytstalk <username>',
    example: '.ytstalk mrbeast',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const username = m.args[0]
    
    if (!username) {
        return m.reply(`📺*ʏᴏᴜᴛᴜʙᴇSᴛᴀʟᴋ*\n\n*Pon un nombre de usuario en YouTube*\n\n\`Ejemplo:${m.prefix}ytstalk mrbeast\``)
    }
    
    m.react('🔍')
    
    try {
        const res = await _axios2.default.get(`https://firefly.maiku.my.id/api/stalk-youtube?apikey=${_configjs2.default.APIkey.firefly}&username=${encodeURIComponent(username)}`, {
            timeout: 30000
        })
        
        if (!_optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.status]) || !_optionalChain([res, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.data])) {
            m.react('❌')
            return m.reply(`❌ Channel *${username}* not found`)
        }
        
        const c = res.data.data
        
        let caption = `📺 *ʏᴏᴜᴛᴜʙᴇ sᴛᴀʟᴋ*\n\n` +
            `👤*Nombre:*${c.name}\n` +
            `🔗 *Username:* @${username}\n` +
            `✅ *Verified:* ${c.verified ? 'Ya' : 'Tidak'}\n\n` +
            `👥 *Subscribers:* ${c.subscribers}\n` +
            `🎬 *Total Video:* ${c.video_count}\n\n` +
            `📝*Descripción:*\n${c.about || '-'}\n\n` +
            `🔗 ${c.url}`
            
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: { url: c.thumbnail },
            caption
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
