"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const allCommands = _ourinrolescpaneljs.VALID_SERVERS.map(v => `listadmin${v}`)
const allAliases = _ourinrolescpaneljs.VALID_SERVERS.map(v => `admins${v}`)

const pluginConfig = {
    name: allCommands,
    alias: allAliases,
    category: 'panel',
    description: 'List semua admin panel (v1-v5)',
    usage: '.listadminv1 atau .listadminv2',
    example: '.listadminv1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function parseServerVersion(cmd) {
    const match = cmd.match(/v([1-5])$/i)
    if (!match) return { server: 'v1', serverKey: 's1' }
    return { server: 'v' + match[1], serverKey: 's' + match[1] }
}

function getServerConfig(pteroConfig, serverKey) {
    const serverConfigs = {
        's1': pteroConfig.server1,
        's2': pteroConfig.server2,
        's3': pteroConfig.server3,
        's4': pteroConfig.server4,
        's5': pteroConfig.server5
    }
    return serverConfigs[serverKey] || null
}

function validateConfig(serverConfig) {
    const missing = []
    if (!_optionalChain([serverConfig, 'optionalAccess', _ => _.domain])) missing.push('domain')
    if (!_optionalChain([serverConfig, 'optionalAccess', _2 => _2.apikey])) missing.push('apikey (PTLA)')
    return missing
}

function getAvailableServers(pteroConfig) {
    const available = []
    for (let i = 1; i <= 5; i++) {
        const cfg = pteroConfig[`server${i}`]
        if (_optionalChain([cfg, 'optionalAccess', _3 => _3.domain]) && _optionalChain([cfg, 'optionalAccess', _4 => _4.apikey])) available.push(`v${i}`)
    }
    return available
}

async function handler(m, { sock }) {
    const pteroConfig = _configjs2.default.pterodactyl
    
    const { server: serverVersion, serverKey } = parseServerVersion(m.command)
    const serverLabel = serverVersion.toUpperCase()
    
    if (!_ourinrolescpaneljs.hasFullAccess.call(void 0, m.sender, serverVersion, m.isOwner)) {
        const userRole = _ourinrolescpaneljs.getUserRole.call(void 0, m.sender, serverVersion)
        return m.reply(
            `❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*\n\n` +
            `> Kamu tidak punya akses ke *${serverLabel}*\n` +
            `> Role kamu: *${userRole || 'Tidak ada'}*`
        )
    }
    
    const serverConfig = getServerConfig(pteroConfig, serverKey)
    const missingConfig = validateConfig(serverConfig)
    
    if (missingConfig.length > 0) {
        const available = getAvailableServers(pteroConfig)
        let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverLabel} ʙᴇʟᴜᴍ ᴋᴏɴꜰɪɢ*\n\n`
        if (available.length > 0) {
            txt += `> Server tersedia: *${available.join(', ')}*`
        } else {
            txt += `> Isi di \`config.js\` bagian \`pterodactyl.server1\``
        }
        return m.reply(txt)
    }
    
    try {
        const res = await _axios2.default.get(`${serverConfig.domain}/api/application/users`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        const users = res.data.data || []
        const admins = users.filter(u => u.attributes.root_admin)
        
        if (admins.length === 0) {
            return m.reply(`📋 *ᴅᴀꜰᴛᴀʀ ᴀᴅᴍɪɴ [${serverLabel}]*\n\n> Tidak ada admin terdaftar.`)
        }
        
        let txt = `📋 *ᴅᴀꜰᴛᴀʀ ᴀᴅᴍɪɴ [${serverLabel}]*\n\n`
        txt += `> Total: *${admins.length}* admin\n\n`
        
        admins.forEach((u, i) => {
            const attr = u.attributes
            txt += `${i + 1}. *${attr.username}*\n`
            txt += `   └ ID: \`${attr.id}\` | Email: \`${attr.email}\`\n`
        })
        
        return m.reply(txt)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
