"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['turnon', 'turnoff', 'restartvps', 'rebootvps'],
    alias: [],
    category: 'vps',
    description: 'Kontrol VPS (on/off/restart)',
    usage: '.turnon <id>',
    example: '.turnon 123456789',
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
        return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`${m.prefix}${m.command} <droplet_id>\``)
    }
    
    const actions = {
        'turnon': { type: 'power_on', emoji: '🟢', text: 'menghidupkan' },
        'turnoff': { type: 'power_off', emoji: '🔴', text: 'mematikan' },
        'restartvps': { type: 'reboot', emoji: '🔄', text: 'merestart' },
        'rebootvps': { type: 'reboot', emoji: '🔄', text: 'merestart' }
    }
    
    const action = actions[m.command]
    if (!action) {
        return m.reply(`❌No hay acción.`)
    }
    
    await m.reply(`${action.emoji} *sᴇᴅᴀɴɢ ${action.text.toUpperCase()} ᴠᴘs...*\n\n> ID: \`${dropletId}\``)
    
    try {
        const response = await _axios2.default.post(
            `https://api.digitalocean.com/v2/droplets/${dropletId}/actions`,
            { type: action.type },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        )
        
        const actionResult = response.data.action
        
        m.react('✅')
        await m.reply(`✅ *ᴀᴋsɪ ʙᴇʀʜᴀsɪʟ*\n\n> ${action.emoji}VPS está en el...${action.text}\n> Status: ${actionResult.status}`)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
