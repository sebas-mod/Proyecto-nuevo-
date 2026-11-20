"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['delvps', 'deldroplet', 'deletevps'],
    alias: [],
    category: 'vps',
    description: 'Hapus VPS DigitalOcean',
    usage: '.delvps <id>',
    example: '.delvps 123456789',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function hasAccess(sender, isOwner) {
    if (isOwner) return true
    const cleanSender = _optionalChain([sender, 'optionalAccess', _ => _.split, 'call', _2 => _2('@'), 'access', _3 => _3[0]])
    if (!cleanSender) return false
    const doConfig = _configjs2.default.digitalocean || {}
    return (doConfig.sellers || []).includes(cleanSender) || 
           (doConfig.ownerPanels || []).includes(cleanSender)
}

async function handler(m, { sock }) {
    const token = _optionalChain([_configjs2.default, 'access', _4 => _4.digitalocean, 'optionalAccess', _5 => _5.token])
    
    if (!token) {
        return m.reply(`⚠️ *ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ ʙᴇʟᴜᴍ ᴅɪsᴇᴛᴜᴘ*`)
    }
    
    if (!hasAccess(m.sender, m.isOwner)) {
        return m.reply(`❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*`)
    }
    
    const dropletId = _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()])
    if (!dropletId) {
        return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`${m.prefix}delvps <droplet_id>\`\n\n> Gunakan \`${m.prefix}listvps\` untuk melihat ID`)
    }
    
    await m.reply(`🗑️ *ᴍᴇɴɢʜᴀᴘᴜs ᴠᴘs...*\n\n> ID: \`${dropletId}\``)
    
    try {
        await _axios2.default.delete(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        m.react('✅')
        await m.reply(`✅ *ᴠᴘs ʙᴇʀʜᴀsɪʟ ᴅɪʜᴀᴘᴜs*\n\n> ID: \`${dropletId}\``)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
