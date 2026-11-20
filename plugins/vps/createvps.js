"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const VPS_SPECS = {
    'vps1g1c': { size: 's-1vcpu-1gb', ram: '1GB', cpu: '1 vCPU' },
    'vps2g1c': { size: 's-1vcpu-2gb', ram: '2GB', cpu: '1 vCPU' },
    'vps2g2c': { size: 's-2vcpu-2gb', ram: '2GB', cpu: '2 vCPU' },
    'vps4g2c': { size: 's-2vcpu-4gb', ram: '4GB', cpu: '2 vCPU' },
    'vps8g4c': { size: 's-4vcpu-8gb', ram: '8GB', cpu: '4 vCPU' }
}

const vpsCommands = Object.keys(VPS_SPECS)

const pluginConfig = {
    name: vpsCommands,
    alias: [],
    category: 'vps',
    description: 'Create DigitalOcean VPS',
    usage: '.vps1g1c <hostname>',
    example: '.vps1g1c myserver',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

function generatePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
    let password = ''
    for (let i = 0; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)]
    }
    return password
}

function hasAccess(sender, isOwner) {
    if (isOwner) return true
    const cleanSender = _optionalChain([sender, 'optionalAccess', _ => _.split, 'call', _2 => _2('@'), 'access', _3 => _3[0]])
    if (!cleanSender) return false
    const doConfig = _configjs2.default.digitalocean || {}
    const sellers = doConfig.sellers || []
    const ownerPanels = doConfig.ownerPanels || []
    return sellers.includes(cleanSender) || ownerPanels.includes(cleanSender)
}

async function handler(m, { sock }) {
    const doConfig = _configjs2.default.digitalocean || {}
    const token = doConfig.token
    
    if (!token) {
        return m.reply(`⚠️ *ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ ʙᴇʟᴜᴍ ᴅɪsᴇᴛᴜᴘ*\n\n> Isi \`digitalocean.token\` di config.js`)
    }
    
    if (!hasAccess(m.sender, m.isOwner)) {
        return m.reply(`❌*ᴀᴋSᴇSᴅɪᴛᴏʟᴀᴋ*\n\nEstá característica es sólo para el propietario / vendedor.`)
    }
    
    const hostname = _optionalChain([m, 'access', _4 => _4.text, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()])
    if (!hostname) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}${m.command} <hostname>\`\n\n` +
            `> Ejemplo:\`${m.prefix}${m.command} myserver\`\n\n` +
            `📦 *ᴘᴀᴋᴇᴛ ᴛᴇʀsᴇᴅɪᴀ:*\n` +
            Object.entries(VPS_SPECS).map(([cmd, spec]) => 
                `> \`${m.prefix}${cmd}\` - ${spec.ram} RAM, ${spec.cpu}`
            ).join('\n')
        )
    }
    
    if (!/^[a-zA-Z0-9-]+$/.test(hostname)) {
        return m.reply(`❌El nombre de la anfitriona es simplemente bien Letra, números, y dash.`)
    }
    
    const spec = VPS_SPECS[m.command]
    if (!spec) {
        return m.reply(`❌Los paquetes VPS no se encuentran.`)
    }
    
    const password = generatePassword()
    const region = doConfig.region || 'sgp1'
    
    const dropletData = {
        name: hostname,
        region: region,
        size: spec.size,
        image: 'ubuntu-22-04-x64',
        ssh_keys: null,
        backups: false,
        ipv6: true,
        user_data: `#cloud-config
password: ${password}
chpasswd: { expire: False }
ssh_pwauth: True`,
        private_networking: null,
        volumes: null,
        tags: ['ourin-bot']
    }
    
    await m.reply(`🛠️ *ᴍᴇᴍʙᴜᴀᴛ ᴠᴘs...*\n\n> Hostname: \`${hostname}\`\n> Spec: ${spec.ram} RAM, ${spec.cpu}\n> Region: ${region}`)
    
    try {
        const response = await _axios2.default.post('https://api.digitalocean.com/v2/droplets', dropletData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        
        const droplet = response.data.droplet
        const dropletId = droplet.id
        
        await m.reply(`🕕 *ᴍᴇɴᴜɴɢɢᴜ ᴠᴘs sɪᴀᴘ...*\n\n> ID: \`${dropletId}\`\nEstimaciones: 60 segundos`)
        
        await new Promise(resolve => setTimeout(resolve, 60000))
        
        const infoRes = await _axios2.default.get(`https://api.digitalocean.com/v2/droplets/${dropletId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        const dropletInfo = infoRes.data.droplet
        const ipv4 = _optionalChain([dropletInfo, 'access', _7 => _7.networks, 'optionalAccess', _8 => _8.v4, 'optionalAccess', _9 => _9.find, 'call', _10 => _10(n => n.type === 'public')])
        const ip = _optionalChain([ipv4, 'optionalAccess', _11 => _11.ip_address]) || 'No disponible'
        
        const detailTxt = `✅ *ᴠᴘs ʙᴇʀʜᴀsɪʟ ᴅɪʙᴜᴀᴛ*\n\n` +
            `╭─「 📋 *ᴅᴇᴛᴀɪʟ ᴠᴘs* 」\n` +
            `┃ 🆔 \`ɪᴅ\`: *${dropletId}*\n` +
            `┃ 🏷️ \`ʜᴏsᴛɴᴀᴍᴇ\`: *${hostname}*\n` +
            `┃ 🌐 \`ɪᴘ\`: *${ip}*\n` +
            `┃ 👤 \`ᴜsᴇʀ\`: *root*\n` +
            `┃ 🔐 \`ᴘᴀss\`: *${password}*\n` +
            `╰───────────────\n\n` +
            `╭─「 🧠 *sᴘᴇᴄ* 」\n` +
            `┃ 💾 \`ʀᴀᴍ\`: *${spec.ram}*\n` +
            `┃ ⚡ \`ᴄᴘᴜ\`: *${spec.cpu}*\n` +
            `┃ 🌍 \`ʀᴇɢɪᴏɴ\`: *${region}*\n` +
            `┃ 💿 \`ᴏs\`: *Ubuntu 22.04*\n` +
            `╰───────────────\n\n` +
            `♪⚠Disfrute de estos datos Guardar bien!`
        
        await sock.sendMessage(m.sender, { text: detailTxt })
        await m.reply(`✅*ᴠᴘSʙᴇʀʜᴀSɪʟ ᴅɪʙᴜᴀᴛ*\n\nDatos enviados a la charla primaria.`)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
