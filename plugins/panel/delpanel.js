"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'delpanel',
    alias: ['hapuspanel', 'deletepanel'],
    category: 'panel',
    description: 'Hapus panel (server + user)',
    usage: '.delpanel [s1/s2/s3] serverid [full]',
    example: '.delpanel 5 atau .delpanel s2 5 full',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function getServerConfig(pteroConfig, serverKey) {
    const serverConfigs = {
        's1': pteroConfig.server1,
        's2': pteroConfig.server2,
        's3': pteroConfig.server3
    }
    return serverConfigs[serverKey] || pteroConfig.server1
}

function validateServerConfig(serverConfig) {
    const missing = []
    if (!_optionalChain([serverConfig, 'optionalAccess', _ => _.domain])) missing.push('domain')
    if (!_optionalChain([serverConfig, 'optionalAccess', _2 => _2.apikey])) missing.push('apikey (PTLA)')
    return missing
}

function getAvailableServers(pteroConfig) {
    const available = []
    if (_optionalChain([pteroConfig, 'access', _3 => _3.server1, 'optionalAccess', _4 => _4.domain]) && _optionalChain([pteroConfig, 'access', _5 => _5.server1, 'optionalAccess', _6 => _6.apikey])) available.push('s1')
    if (_optionalChain([pteroConfig, 'access', _7 => _7.server2, 'optionalAccess', _8 => _8.domain]) && _optionalChain([pteroConfig, 'access', _9 => _9.server2, 'optionalAccess', _10 => _10.apikey])) available.push('s2')
    if (_optionalChain([pteroConfig, 'access', _11 => _11.server3, 'optionalAccess', _12 => _12.domain]) && _optionalChain([pteroConfig, 'access', _13 => _13.server3, 'optionalAccess', _14 => _14.apikey])) available.push('s3')
    return available
}

async function handler(m, { sock }) {
    const pteroConfig = _configjs2.default.pterodactyl
    
    const args = _optionalChain([m, 'access', _15 => _15.text, 'optionalAccess', _16 => _16.trim, 'call', _17 => _17(), 'access', _18 => _18.split, 'call', _19 => _19(' ')]) || []
    let serverKey = 's1'
    let restArgs = args
    
    if (args[0] && ['s1', 's2', 's3'].includes(args[0].toLowerCase())) {
        serverKey = args[0].toLowerCase()
        restArgs = args.slice(1)
    }
    
    const serverConfig = getServerConfig(pteroConfig, serverKey)
    const missingConfig = validateServerConfig(serverConfig)
    
    if (missingConfig.length > 0) {
        const available = getAvailableServers(pteroConfig)
        let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverKey.toUpperCase()} ʙᴇʟᴜᴍ ᴋᴏɴꜰɪɢ*\n\n`
        if (available.length > 0) {
            txt += `*El servidor está disponible*${available.join(', ')}*`
        }
        return m.reply(txt)
    }
    
    const serverId = restArgs[0]
    const option = _optionalChain([restArgs, 'access', _20 => _20[1], 'optionalAccess', _21 => _21.toLowerCase, 'call', _22 => _22()])
    const serverLabel = serverKey.toUpperCase()
    
    if (!serverId) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}delpeel id\`- Sólo quita el servidor\n` +
            `> \`${m.prefix}ID de descabellado completo\`- Servidor Elimina + usuario\n` +
            `> \`${m.prefix}delpanel s2 id\`- Del servidor 2.\n\n` +
            `* Mira ID con\`${m.prefix}listserver\``
        )
    }
    
    if (isNaN(serverId)) {
        return m.reply(`❌El servidor de identificación debe tener un número.`)
    }
    
    try {
        const serverRes = await _axios2.default.get(`${serverConfig.domain}/fuego/application/servers/${serverId}`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        const server = serverRes.data.attributes
        const userId = server.user
        
        let userInfo = null
        let isUserAdmin = false
        try {
            const userRes = await _axios2.default.get(`${serverConfig.domain}/fuego/application/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${serverConfig.apikey}` }
            })
            userInfo = userRes.data.attributes
            isUserAdmin = userInfo.root_admin
        } catch (e) {}
        
        await m.reply(`🗑♪ᴍᴇɴɢʜᴀᴘᴜSᴘᴀɴᴇʟ...\n\n♪ Servidor: ♪${serverLabel}*\n> Panel: \`${server.name}\`\n> Mode: *${option === 'full' ? 'Server + User' : 'Server saja'}*`)
        
        await _axios2.default.delete(`${serverConfig.domain}/fuego/application/servers/${serverId}`, {
            headers: {
                'Authorization': `Bearer ${serverConfig.apikey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json'
            }
        })
        
        let result = `✅ *sᴇʀᴠᴇʀ ᴅɪʜᴀᴘᴜs [${serverLabel}]*\n\n`
        result += `> Nombre:\`${server.name}\`\n`
        result += `> ID: \`${serverId}\`\n`
        
        if (option === 'full' && userInfo && !isUserAdmin) {
            try {
                await _axios2.default.delete(`${serverConfig.domain}/fuego/application/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${serverConfig.apikey}`,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json'
                    }
                })
                result += `\n✅ *ᴜsᴇʀ ᴅɪʜᴀᴘᴜs*\n`
                result += `> Username: \`${userInfo.username}\`\n`
                result += `> ID: \`${userId}\``
            } catch (userErr) {
                result += `\n⚠Ez Usuario falló en la disputa (probablemente todavía tiene otro servidor )`
            }
        } else if (option === 'full' && isUserAdmin) {
            result += `\n⚠El usuario es Admin, no está cubierto.`
        }
        
        return m.reply(result)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
