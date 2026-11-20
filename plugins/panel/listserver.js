"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const allCommands = [..._ourinrolescpaneljs.VALID_SERVERS.map(v => `listserver${v}`), 'listserver']
const allAliases = _ourinrolescpaneljs.VALID_SERVERS.map(v => `servers${v}`)

const pluginConfig = {
    name: allCommands,
    alias: allAliases,
    category: 'panel',
    description: 'List semua server di panel (v1-v5)',
    usage: '.listserverv1 atau .listserverv2',
    example: '.listserverv1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function parseServerVersion(cmd) {
    const match = String(cmd || '').match(/v([1-5])$/i)
    if (!match) return { server: 'v1', serverKey: 's1' }
    return { server: 'v' + match[1], serverKey: 's' + match[1] }
}

function getServerConfig(pteroConfig, serverKey) {
    if (!pteroConfig) return null
    const serverConfigs = {
        's1': pteroConfig.server1,
        's2': pteroConfig.server2,
        's3': pteroConfig.server3,
        's4': pteroConfig.server4,
        's5': pteroConfig.server5
    }
    return serverConfigs[serverKey] || null
}

function validateServerConfig(serverConfig) {
    const missing = []
    if (!_optionalChain([serverConfig, 'optionalAccess', _ => _.domain])) missing.push('domain')
    if (!_optionalChain([serverConfig, 'optionalAccess', _2 => _2.apikey])) missing.push('apikey (PTLA)')
    return missing
}

function getAvailableServers(pteroConfig) {
    const available = []
    if (!pteroConfig) return available
    for (let i = 1; i <= 5; i++) {
        const cfg = pteroConfig[`server${i}`]
        if (_optionalChain([cfg, 'optionalAccess', _3 => _3.domain]) && _optionalChain([cfg, 'optionalAccess', _4 => _4.apikey])) available.push(`v${i}`)
    }
    return available
}

function formatBytes(bytes) {
    if (bytes === 0) return 'Unlimited'
    const mb = bytes
    if (mb >= 1000) return `${(mb / 1000).toFixed(1)} GB`
    return `${mb} MB`
}

async function fetchAllServers(serverConfig) {
    let allServers = []
    let page = 1
    let totalPages = 1
    
    while (page <= totalPages) {
        const res = await _axios2.default.get(`${serverConfig.domain}/api/application/servers?page=${page}&per_page=50`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        const servers = res.data.data || []
        allServers = allServers.concat(servers)
        
        const meta = _optionalChain([res, 'access', _5 => _5.data, 'access', _6 => _6.meta, 'optionalAccess', _7 => _7.pagination])
        if (meta) {
            totalPages = meta.total_pages || 1
        }
        page++
    }
    
    return allServers
}

async function handler(m, { sock }) {
    const pteroConfig = _configjs2.default.pterodactyl
    
    const { server: serverVersion, serverKey } = parseServerVersion(m.command)
    const serverLabel = serverVersion.toUpperCase()
    
    if (!_ourinrolescpaneljs.hasFullAccess.call(void 0, m.sender, serverVersion, m.isOwner)) {
        const userRole = _ourinrolescpaneljs.getUserRole.call(void 0, m.sender, serverVersion)
        return m.reply(
            `❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*\n\n` +
            `Maaf ya, kamu tidak memiliki izin akses penuh ke panel *${serverLabel}* ini.\n` +
            `Status peran kamu saat ini: *${userRole || 'Tidak ada'}*`
        )
    }
    
    const serverConfig = getServerConfig(pteroConfig, serverKey)
    const missingConfig = validateServerConfig(serverConfig)
    
    if (missingConfig.length > 0) {
        const available = getAvailableServers(pteroConfig)
        let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverLabel} ʙᴇʟᴜᴍ ᴋᴏɴꜰɪɢ*\n\n`
        if (available.length > 0) {
            txt += `Sepertinya server ini belum dikonfigurasi. Berikut adalah server yang sudah tersedia dan bisa kamu gunakan: *${available.join(', ')}*\n`
            txt += `Kamu bisa mencoba mengeceknya dengan mengetik \`${m.prefix}listserver${available[0]}\``
        } else {
            txt += `Sepertinya konfigurasi server Pterodactyl di file \`config.js\` belum diatur dengan benar. Silakan periksa kembali ya!`
        }
        return m.reply(txt)
    }
    
    try {
        m.react("🕕")
        
        const servers = await fetchAllServers(serverConfig)
        
        if (servers.length === 0) {
            return m.reply(`📋 *ᴅᴀꜰᴛᴀʀ sᴇʀᴠᴇʀ ${serverLabel}*\n\nSaat ini belum ada server yang terdaftar di panel ini.`)
        }
        
        let txt = `📋 *ᴅᴀꜰᴛᴀʀ sᴇʀᴠᴇʀ ${serverLabel}*\n\n`
        txt += `Total keseluruhan ada *${servers.length}* server yang terdaftar.\n\n`
        
        servers.slice(0, 20).forEach((s) => {
            const attr = s.attributes
            const limits = attr.limits || {}
            txt += `- *${attr.name}*\n`
            txt += `   ├ ID: \`${attr.id}\`\n`
            txt += `   ├ RAM: \`${formatBytes(limits.memory)}\`\n`
            txt += `   └ CPU: \`${limits.cpu === 0 ? 'Unlimited' : limits.cpu + '%'}\`\n`
        })
        
        if (servers.length > 20) {
            txt += `\n... dan masih ada ${servers.length - 20} server lainnya yang tidak ditampilkan.`
        }
        
        const available = getAvailableServers(pteroConfig)
        if (available.length > 1) {
            txt += `\n\nServer lainnya yang tersedia: *${available.filter(s => s !== serverVersion).join(', ')}*`
        }
        
        return m.reply(txt)
        
    } catch (err) {
        console.error(err)
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
