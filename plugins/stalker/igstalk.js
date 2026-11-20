"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
    name: 'igstalk',
    alias: ['instagramstalk', 'stalking'],
    category: 'stalker',
    description: 'Stalk akun Instagram',
    usage: '.igstalk <username>',
    example: '.igstalk cristiano',
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
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + ' miliar'
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + ' jt'
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + ' rb'
    return num.toString()
}

async function handler(m, { sock }) {
    const username = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.replace, 'call', _4 => _4('@', '')])
    
    if (!username) {
        return m.reply(
            `📸 *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ*\n\n` +
            `*Pon el nombre de usuario Instagram*\n\n` +
            `\`Contoh: ${m.prefix}igstalk cristiano\``
        )
    }
    
    m.react('🔍')
    
    try {
        const res = await _axios2.default.get(
            `https://firefly.maiku.my.id/api/stalk-instagram?apikey=${_configjs2.default.APIkey.firefly}&username=${encodeURIComponent(username)}`,
            { timeout: 30000 }
        )
        
        const d = _optionalChain([res, 'access', _5 => _5.data, 'optionalAccess', _6 => _6.data])
        if (!_optionalChain([res, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.status]) || !_optionalChain([d, 'optionalAccess', _9 => _9.username])) {
            m.react('❌')
            return m.reply(`❌Cuenta *@${username}* not found`)
        }
        
        const caption = `📸 *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴀʟᴋ*\n\n` +
            `👤 *Username:* ${d.username}\n` +
            `📛*Nombre:*${d.full_name || '-'}\n` +
            `✅ *Verified:* ${d.is_verified ? 'Ya' : 'Tidak'}\n` +
            `🔒 *Private:* ${d.is_private ? 'Ya' : 'Tidak'}\n\n` +
            `👥*Seguidores:*${shortNum(_optionalChain([d, 'access', _10 => _10.stats, 'optionalAccess', _11 => _11.followers]))}\n` +
            `👤*Siguiendo:*${shortNum(_optionalChain([d, 'access', _12 => _12.stats, 'optionalAccess', _13 => _13.following]))}\n` +
            `📷 *Postingan:* ${shortNum(_optionalChain([d, 'access', _14 => _14.stats, 'optionalAccess', _15 => _15.posts]))}\n\n` +
            `📝 *Bio:*\n${d.bio || '-'}\n\n` +
            `🔗 https://instagram.com/${d.username}`
        
        m.react('✅')
        
        const profilePic = d.profile_pic
        if (profilePic) {
            await sock.sendMessage(m.chat, {
                image: { url: profilePic },
                caption
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }
        
    } catch (error) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
