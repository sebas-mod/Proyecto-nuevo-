"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
function randomKarakter(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

function randomNomor(length) {
    const nums = '23456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += nums.charAt(Math.floor(Math.random() * nums.length))
    }
    return result
}

const LINODE_TYPES = {
    'linode2gb': { type: 'g6-standard-1', ram: '2GB', label: '2GB' },
    'linode4gb': { type: 'g6-standard-2', ram: '4GB', label: '4GB' },
    'linode8gb': { type: 'g6-standard-4', ram: '8GB', label: '8GB' },
    'linode16gb': { type: 'g6-standard-8', ram: '16GB', label: '16GB' }
}

const pluginConfig = {
    name: ['linode2gb', 'linode4gb', 'linode8gb', 'linode16gb', 'listlinode', 'onlinode', 'offlinode', 'rebootlinode', 'rebuildlinode', 'delinode', 'saldolinode', 'sisalinode', 'cekvpslinode'],
    alias: [],
    category: 'linode',
    description: 'Linode VPS Management',
    usage: '.linode2gb <label> | .listlinode | .onlinode <id> | dst',
    example: '.linode2gb myserver',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, command, args }) {
    const linodeToken = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.linode])
    
    if (!linodeToken) {
        return m.reply(`❌¡Linode Fuego Token no está configrado!\n\nAparance en el config.\n\`\`\`\nAPIkey: {\nLinode: ( SING) LINO DEEKEN\n}\n\`\`\``)
    }
    
    const cmd = command.toLowerCase()
    
    try {
        if (LINODE_TYPES[cmd]) {
            const label = args[0]
            if (!label) {
                return m.reply(`❌¡Pon la etiqueta para VPS!\n\nEjemplo:${m.prefix}${cmd} myserver`)
            }
            
            const spec = LINODE_TYPES[cmd]
            const rootPass = randomKarakter(5) + randomNomor(3)
            
            const linodeData = {
                label: label,
                region: 'ap-south',
                type: spec.type,
                image: 'linode/ubuntu20.04',
                root_pass: rootPass,
                stackscript_id: null,
                authorized_keys: null,
                backups_enabled: false
            }
            
            m.react('🚀')
            
            const createRes = await fetch('https://api.linode.com/v4/linode/instances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                },
                body: JSON.stringify(linodeData)
            })
            
            const createData = await createRes.json()
            
            if (!createRes.ok) {
                throw new Error(_optionalChain([createData, 'access', _3 => _3.errors, 'optionalAccess', _4 => _4[0], 'optionalAccess', _5 => _5.reason]) || 'Pegatina hace Linode')
            }
            
            const linodeId = createData.id
            await m.reply(`🕕Linode está siendo hecho... espera 60 segundos.`)
            
            await new Promise(resolve => setTimeout(resolve, 60000))
            
            const infoRes = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            const linodeInfo = await infoRes.json()
            const ipAddress = _optionalChain([linodeInfo, 'access', _6 => _6.ipv4, 'optionalAccess', _7 => _7[0]]) || 'Pending'
            
            const msg = `✅ *ʟɪɴᴏᴅᴇ ${spec.label} ʙᴇʀʜᴀsɪʟ ᴅɪʙᴜᴀᴛ*\n\n` +
                `> 🆔 ID: \`${linodeId}\`\n` +
                `> 🏷️ Label: \`${label}\`\n` +
                `> 🌐 IP: \`${ipAddress}\`\n` +
                `> 🔑 Password: \`${rootPass}\`\n` +
                `> 💾 RAM: ${spec.ram}\n` +
                `> 📍 Region: ap-south`
            
            await m.reply(msg)
            m.react('✅')
            return
        }
        
        if (cmd === 'listlinode') {
            m.react('📋')
            
            const res = await fetch('https://api.linode.com/v4/linode/instances', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            const data = await res.json()
            
            if (!res.ok) throw new Error('Stunner obtiene la lista de Linode')
            
            if (!data.data || data.data.length === 0) {
                return m.reply(`📋*ᴅᴀ♪ᴛᴀʀ ʟɪɴᴏᴅᴇ*\n\n- No hay VPS activa.`)
            }
            
            let msg = `📋 *ᴅᴀғᴛᴀʀ ʟɪɴᴏᴅᴇ ᴠᴘs*\n\n`
            data.data.forEach((l, i) => {
                msg += `*${i + 1}. ${l.label}*\n`
                msg += `> ID: \`${l.id}\`\n`
                msg += `> IP: \`${_optionalChain([l, 'access', _8 => _8.ipv4, 'optionalAccess', _9 => _9[0]]) || '-'}\`\n`
                msg += `> Status: ${l.status}\n\n`
            })
            
            await m.reply(msg.trim())
            m.react('✅')
            return
        }
        
        if (cmd === 'onlinode') {
            const linodeId = args[0]
            if (!linodeId) return m.reply(`❌¡Introdúzcase el Linode ID!\n\nEjemplo:${m.prefix}onlinode 12345`)
            
            m.react('🔌')
            
            const res = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}/boot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            if (res.ok) {
                await m.reply(`✅ Linode ID \`${linodeId}\`exito dihidupkan!`)
                m.react('✅')
            } else {
                const data = await res.json()
                throw new Error(_optionalChain([data, 'access', _10 => _10.errors, 'optionalAccess', _11 => _11[0], 'optionalAccess', _12 => _12.reason]) || 'Fallido menghidupkan')
            }
            return
        }
        
        if (cmd === 'offlinode') {
            const linodeId = args[0]
            if (!linodeId) return m.reply(`❌¡Introdúzcase el Linode ID!\n\nEjemplo:${m.prefix}offlinode 12345`)
            
            m.react('🔌')
            
            const res = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}/shutdown`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            if (res.ok) {
                await m.reply(`✅ Linode ID \`${linodeId}\`exito dimatikan!`)
                m.react('✅')
            } else {
                const data = await res.json()
                throw new Error(_optionalChain([data, 'access', _13 => _13.errors, 'optionalAccess', _14 => _14[0], 'optionalAccess', _15 => _15.reason]) || 'Fallido mematikan')
            }
            return
        }
        
        if (cmd === 'rebootlinode') {
            const linodeId = args[0]
            if (!linodeId) return m.reply(`❌¡Introdúzcase el Linode ID!\n\nEjemplo:${m.prefix}rebootlinode 12345`)
            
            m.react('🔄')
            
            const res = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}/reboot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            if (res.ok) {
                await m.reply(`✅ Linode ID \`${linodeId}\`con exito-reboot!`)
                m.react('✅')
            } else {
                const data = await res.json()
                throw new Error(_optionalChain([data, 'access', _16 => _16.errors, 'optionalAccess', _17 => _17[0], 'optionalAccess', _18 => _18.reason]) || 'Fallido reboot')
            }
            return
        }
        
        if (cmd === 'rebuildlinode') {
            const linodeId = args[0]
            const image = args[1] || 'linode/ubuntu20.04'
            if (!linodeId) return m.reply(`❌¡Introdúzcase el Linode ID!\n\nEjemplo:${m.prefix}rebuildlinode 12345 linode/ubuntu20.04`)
            
            const rootPass = randomKarakter(4) + randomNomor(3)
            
            m.react('🔧')
            
            const res = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}/rebuild`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                },
                body: JSON.stringify({
                    image: image,
                    root_pass: rootPass
                })
            })
            
            if (res.ok) {
                await m.reply(`✅ Linode ID \`${linodeId}\`con exito-rebuild!\n\n♪🔑Password nuevo:\`${rootPass}\`\n> 🖼️ Image: ${image}`)
                m.react('✅')
            } else {
                const data = await res.json()
                throw new Error(_optionalChain([data, 'access', _19 => _19.errors, 'optionalAccess', _20 => _20[0], 'optionalAccess', _21 => _21.reason]) || 'Fallido rebuild')
            }
            return
        }
        
        if (cmd === 'delinode') {
            const linodeId = args[0]
            if (!linodeId) return m.reply(`❌¡Introdúzcase el Linode ID!\n\nEjemplo:${m.prefix}delinode 12345`)
            
            m.react('🗑️')
            
            const res = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            if (res.ok) {
                await m.reply(`✅ Linode ID \`${linodeId}\`eliminado correctamente!`)
                m.react('✅')
            } else {
                const data = await res.json()
                throw new Error(_optionalChain([data, 'access', _22 => _22.errors, 'optionalAccess', _23 => _23[0], 'optionalAccess', _24 => _24.reason]) || 'No se pudo eliminar')
            }
            return
        }
        
        if (cmd === 'saldolinode') {
            m.react('💰')
            
            const res = await fetch('https://api.linode.com/v4/account', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            const data = await res.json()
            
            if (!res.ok) throw new Error('Steenner tiene un equilibrio.')
            
            const balance = (data.koin || 0) / 100
            const credit = (data.credit_remaining || 0) / 100
            
            const msg = `💰 *sᴀʟᴅᴏ ᴀᴋᴜɴ ʟɪɴᴏᴅᴇ*\n\n` +
                `> 💵 Balance: $${balance.toFixed(2)}\n` +
                `> 🎁 Credit: $${credit.toFixed(2)}`
            
            await m.reply(msg)
            m.react('✅')
            return
        }
        
        if (cmd === 'sisalinode') {
            m.react('📊')
            
            const res = await fetch('https://api.linode.com/v4/linode/instances', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            const data = await res.json()
            
            if (!res.ok) throw new Error('Gagalm obtiene datos')
            
            const total = _optionalChain([data, 'access', _25 => _25.data, 'optionalAccess', _26 => _26.length]) || 0
            await m.reply(`📊 *ᴛᴏᴛᴀʟ ʟɪɴᴏᴅᴇ ᴀᴋᴛɪғ*\n\n> ${total} VPS`)
            m.react('✅')
            return
        }
        
        if (cmd === 'cekvpslinode') {
            const linodeId = args[0]
            if (!linodeId) return m.reply(`❌¡Introdúzcase el Linode ID!\n\nEjemplo:${m.prefix}cekvpslinode 12345`)
            
            m.react('🔍')
            
            const res = await fetch(`https://api.linode.com/v4/linode/instances/${linodeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${linodeToken}`
                }
            })
            
            const l = await res.json()
            
            if (!res.ok) throw new Error('Agitado consigue detalles')
            
            const msg = `🔍 *ᴅᴇᴛᴀɪʟ ʟɪɴᴏᴅᴇ*\n\n` +
                `> 🆔 ID: \`${l.id}\`\n` +
                `> 🏷️ Label: \`${l.label}\`\n` +
                `> 📊 Status: ${l.status}\n` +
                `> 📍 Region: ${l.region}\n` +
                `> 💾 Type: ${l.type}\n` +
                `> 🌐 IP: \`${_optionalChain([l, 'access', _27 => _27.ipv4, 'optionalAccess', _28 => _28.join, 'call', _29 => _29(', ')]) || '-'}\``
            
            await m.reply(msg)
            m.react('✅')
            return
        }
        
        await m.reply(
            `☁️ *ʟɪɴᴏᴅᴇ ᴄᴏᴍᴍᴀɴᴅs*\n\n` +
            `> .linode2gb <label>- Campo VPS 2GB\n` +
            `> .linode4gb <label>- VPS Crea 4GB\n` +
            `> .linode8gb <label>- Campo VPS 8GB\n` +
            `> .linode16gb <label>- VPS burs 16GB\n` +
            `>.listlinode - Registrate VPS\n` +
            `> .onlinode <id> - Hidupkan VPS\n` +
            `> .offlinode <id> - Matikan VPS\n` +
            `> .rebootlinode <id> - Restart VPS\n` +
            `> .rebuildlinode <id> <image> - Rebuild\n` +
            `Dios mío.<id>- Feliz VPS.\n` +
            `*Oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh, oh\n` +
            `> .sisalinode - Total VPS\n` +
            `> .cekvpslinode <id> - Detail VPS`
        )
        
    } catch (err) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
