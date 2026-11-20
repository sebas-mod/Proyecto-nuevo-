"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
    name: 'tiktokstalk',
    alias: ['ttstalk', 'stalktt'],
    category: 'stalker',
    description: 'Stalk akun TikTok',
    usage: '.tiktokstalk <username>',
    example: '.tiktokstalk mrbeast',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function shortNum(num) {
    if (!num) return '0'
    num = parseInt(num)
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K'
    return num.toString()
}

async function handler(m, { sock }) {
    const username = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.replace, 'call', _4 => _4('@', '')])
    
    if (!username) {
        return m.reply(`🎵*ᴛɪᴋᴛᴏᴋSᴛᴀʟᴋ*\n\n*Pon el nombre de usuario TikTok*\n\n\`Ejemplo:${m.prefix}tiktokstalk mrbeast\``)
    }
    
    m.react('🔍')
    
    try {
        const res = await _axios2.default.get(`https://firefly.maiku.my.id/api/stalk-tiktok?apikey=${_configjs2.default.APIkey.firefly}&username=${encodeURIComponent(username)}`, {
            timeout: 30000
        })
        
        if (!_optionalChain([res, 'access', _5 => _5.data, 'optionalAccess', _6 => _6.status]) || !_optionalChain([res, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.data])) {
            m.react('❌')
            return m.reply(`❌ Username *@${username}* not found`)
        }
        
        const d = res.data.data
        const s = d.stats
        
        const caption = `🎵 *ᴛɪᴋᴛᴏᴋ sᴛᴀʟᴋ*\n\n` +
            `👤 *Username:* @${d.username}\n` +
            `📛*Nombre:*${d.nickname}\n` +
            `✅ *Verified:* ${d.verified ? 'Ya' : 'Tidak'}\n` +
            `🔒 *Private:* ${d.private ? 'Ya' : 'Tidak'}\n\n` +
            `👥 *Followers:* ${shortNum(s.followers)}\n` +
            `👤 *Following:* ${shortNum(s.following)}\n` +
            `❤️ *Likes:* ${shortNum(s.hearts)}\n` +
            `🎬 *Videos:* ${shortNum(s.videos)}\n\n` +
            `📝 *Bio:*\n${d.signature || '-'}\n\n` +
            `🔗 https://tiktok.com/@${d.username}`
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: { url: d.avatar },
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
