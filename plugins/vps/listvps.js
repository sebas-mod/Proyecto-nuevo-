"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['listvps', 'listdroplet', 'vpslist'],
    alias: [],
    category: 'vps',
    description: 'List semua VPS DigitalOcean',
    usage: '.listvps',
    example: '.listvps',
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
    
    await m.reply(`🕕 *ᴍᴇɴɢᴀᴍʙɪʟ ᴅᴀᴛᴀ ᴠᴘs...*`)
    
    try {
        const response = await _axios2.default.get('https://api.digitalocean.com/v2/droplets', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const droplets = response.data.droplets || []
        
        if (droplets.length === 0) {
            return m.reply(`📋*ʟɪSᴛ ᴠᴘs •\n\nNo hay VPS disponible.`)
        }
        
        let txt = `📋 *ʟɪsᴛ ᴠᴘs ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ*\n`
        txt += `> Total: ${droplets.length} droplet\n\n`
        
        for (const droplet of droplets) {
            const ip = _optionalChain([droplet, 'access', _6 => _6.networks, 'optionalAccess', _7 => _7.v4, 'optionalAccess', _8 => _8.find, 'call', _9 => _9(n => n.type === 'public'), 'optionalAccess', _10 => _10.ip_address]) || '-'
            const status = droplet.status === 'active' ? '🟢' : '🔴'
            
            txt += `╭─────────────\n`
            txt += `┃ ${status} *${droplet.name}*\n`
            txt += `┃ 🆔 ID: \`${droplet.id}\`\n`
            txt += `┃ 🌐 IP: \`${ip}\`\n`
            txt += `┃ 💾 RAM: ${droplet.memory} MB\n`
            txt += `┃ ⚡ CPU: ${droplet.vcpus} vCPU\n`
            txt += `┃ 💿 Disk: ${droplet.disk} GB\n`
            txt += `┃ 📍 Region: ${_optionalChain([droplet, 'access', _11 => _11.region, 'optionalAccess', _12 => _12.slug]) || '-'}\n`
            txt += `╰─────────────\n\n`
        }
        
        await m.reply(txt)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
