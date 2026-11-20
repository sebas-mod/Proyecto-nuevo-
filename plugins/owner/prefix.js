"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const PREF_DB_PATH = _path2.default.join(process.cwd(), 'database', 'prefix.json')

function loadPrefixes() {
    try {
        if (_fs2.default.existsSync(PREF_DB_PATH)) {
            return JSON.parse(_fs2.default.readFileSync(PREF_DB_PATH, 'utf8'))
        }
    } catch (e) {}
    return { prefixes: [], noprefix: false }
}

function savePrefixes(data) {
    const dir = _path2.default.dirname(PREF_DB_PATH)
    if (!_fs2.default.existsSync(dir)) {
        _fs2.default.mkdirSync(dir, { recursive: true })
    }
    _fs2.default.writeFileSync(PREF_DB_PATH, JSON.stringify(data, null, 2), 'utf8')
}

function getAllPrefixes() {
    const dbPrefixes = loadPrefixes().prefixes || []
    const configPrefix = _optionalChain([_configjs2.default, 'access', _ => _.command, 'optionalAccess', _2 => _2.prefix]) || '.'
    const combined = [configPrefix, ...dbPrefixes]
    return [...new Set(combined)]
}

function isNoPrefix() {
    const data = loadPrefixes()
    return data.noprefix === true
}

const pluginConfig = {
    name: ['addprefix', 'gantiprefix', 'setprefix', 'delprefix', 'listprefix', 'resetprefix'],
    alias: [],
    category: 'owner',
    description: 'Preficultores de MannemenxBot',
    usage: '.addprefix <prefix1> <prefix2>...',
    example: '.addprefix ! # $',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const cmd = _optionalChain([m, 'access', _3 => _3.command, 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()])
    const args = m.args || []
    
    const data = loadPrefixes()
    if (!data.prefixes) data.prefixes = []
    if (data.noprefix === undefined) data.noprefix = false
    
    switch (cmd) {
        case 'addprefix': {
            if (args.length === 0) {
                return m.reply(
                    `✏️ *ᴀᴅᴅ ᴘʀᴇғɪx*\n\n` +
                    `*Agrega el prefi*xnuevo para bot\n\n` +
                    `*Formato:*\n` +
                    `> \`${m.prefix}addprefix <prefix1> <prefix2> ...\`\n\n` +
                    `*Ejemplo:*\n` +
                    `> \`${m.prefix}addprefix ! # $ 😚\`\n\n` +
                    `*Special:*\n` +
                    `> \`${m.prefix}addprefix <noprefix>\`- Sin el prefijox`
                )
            }
            
            if (args.includes('<noprefix>') || args.includes('noprefix')) {
                data.noprefix = true
                savePrefixes(data)
                return m.reply(
                    `✅ *ɴᴏᴘʀᴇғɪx ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n` +
                    `*Ahora puede ser corre sin el prefi*x\n` +
                    `Para escribir el comando nombre ( missal:\`menú\`)`
                )
            }
            
            const newPrefixes = args.filter(p => {
                if (!p || p.length > 5) return false
                if (data.prefixes.includes(p)) return false
                return true
            })
            
            if (newPrefixes.length === 0) {
                return m.reply(`❌No hay preficiox¡Nuevo válido!`)
            }
            
            data.prefixes = [...new Set([...data.prefixes, ...newPrefixes])]
            savePrefixes(data)
            
            m.reply(
                `✅ *ᴘʀᴇғɪx ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
                `> Added: \`${newPrefixes.join('` `')}\`\n\n` +
                `*Todo prefixactivo:*\n` +
                `> \`${getAllPrefixes().join('` `')}\`` +
                `${data.noprefix ? '\n> + *noprefix* aktif' : ''}`
            )
            break
        }
        
        case 'setprefix':
        case 'gantiprefix': {
            if (args.length === 0) {
                return m.reply(
                    `🔄 *ɢᴀɴᴛɪ/sᴇᴛ ᴘʀᴇғɪx*\n\n` +
                    `• Todos los prefijosxcon una nueva\n\n` +
                    `*Formato:*\n` +
                    `> \`${m.prefix}${cmd} <prefix1> <prefix2> ...\`\n\n` +
                    `*Ejemplo:*\n` +
                    `> \`${m.prefix}${cmd} ! G #\`\n\n` +
                    `*Special:*\n` +
                    `> \`${m.prefix}${cmd} <noprefix>\`- Sin el prefijoxsolo\n` +
                    `> \`${m.prefix}${cmd} . <noprefix>\` - Prefix . + noprefix\n\n` +
                    `⚠Esto borrará todo el preficiox¡Largo tiempo sin ver!`
                )
            }
            
            const hasNoprefix = args.includes('<noprefix>') || args.includes('noprefix')
            const newPrefixes = args.filter(p => {
                if (!p || p.length > 5) return false
                if (p === '<noprefix>' || p === 'noprefix') return false
                return true
            })
            
            data.prefixes = [...new Set(newPrefixes)]
            data.noprefix = hasNoprefix
            savePrefixes(data)
            
            let replyText = `✅ *ᴘʀᴇғɪx ᴅɪɢᴀɴᴛɪ*\n\n`
            
            if (newPrefixes.length > 0) {
                replyText += `> New prefixes: \`${newPrefixes.join('` `')}\`\n`
            }
            
            if (hasNoprefix) {
                replyText += `*No prefi*x: Activo * (canulos de comandos cosquibles )\n`
            }
            
            replyText += `\n*Todo prefixactivo:*\n`
            replyText += `> \`${getAllPrefixes().join('` `')}\``
            if (data.noprefix) replyText += `\n> + *noprefix* activo`
            
            m.reply(replyText)
            break
        }
        
        case 'delprefix': {
            if (args.length === 0) {
                return m.reply(
                    `🗑️ *ᴅᴇʟᴇᴛᴇ ᴘʀᴇғɪx*\n\n` +
                    `*Prefi*xde base de datos\n\n` +
                    `*Formato:*\n` +
                    `> \`${m.prefix}delprefix <prefix1> <prefix2> ...\`\n\n` +
                    `*Ejemplo:*\n` +
                    `> \`${m.prefix}delprefix ! $\`\n` +
                    `> \`${m.prefix}delprefix <noprefix>\`- Desarmar al noprefix`
                )
            }
            
            if (args.includes('<noprefix>') || args.includes('noprefix')) {
                data.noprefix = false
                savePrefixes(data)
                return m.reply(`✅ *ɴᴏᴘʀᴇғɪx ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*`)
            }
            
            const toDelete = args
            const deleted = []
            
            data.prefixes = data.prefixes.filter(p => {
                if (toDelete.includes(p)) {
                    deleted.push(p)
                    return false
                }
                return true
            })
            
            savePrefixes(data)
            
            m.reply(
                `✅ *ᴘʀᴇғɪx ᴅɪʜᴀᴘᴜs*\n\n` +
                `> Deleted: \`${deleted.length > 0 ? deleted.join('` `') : 'None'}\`\n\n` +
                `*Todo prefixactivo:*\n` +
                `> \`${getAllPrefixes().join('` `')}\`` +
                `${data.noprefix ? '\n> + *noprefix* aktif' : ''}`
            )
            break
        }
        
        case 'listprefix': {
            const all = getAllPrefixes()
            const configPref = _optionalChain([_configjs2.default, 'access', _6 => _6.command, 'optionalAccess', _7 => _7.prefix]) || '.'
            
            let text = `📋 *ʟɪsᴛ ᴘʀᴇғɪx*\n\n`
            text += `╭┈┈⬡「 ⚙️ *ᴄᴏɴғɪɢ* 」\n`
            text += `┃Predeterminado:\`${configPref}\`\n`
            text += `┃ Noprefix: ${data.noprefix ? '✅ Aktif' : '❌ Nonaktif'}\n`
            text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
            
            if (data.prefixes.length > 0) {
                text += `╭┈┈⬡「 📁 *ᴅᴀᴛᴀʙᴀsᴇ* 」\n`
                data.prefixes.forEach((p, i) => {
                    text += `┃ ${i + 1}. \`${p}\`\n`
                })
                text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
            }
            
            text += `*Total prefixactivo:*${all.length}`
            if (data.noprefix) text += ` + noprefix`
            text += `\n> \`${all.join('` `')}\``
            
            m.reply(text)
            break
        }
        
        case 'resetprefix': {
            data.prefixes = []
            data.noprefix = false
            savePrefixes(data)
            
            m.reply(
                `✅ *ᴘʀᴇғɪx ᴅɪʀᴇsᴇᴛ*\n\n` +
                `Todos los preficiosx¡En disputa de base!\n` +
                `# No prefi #xdesactivado!\n` +
                `*Solo pon el prefi en.*xde config.js\n\n` +
                `* Prefixactivo:*\`${_optionalChain([_configjs2.default, 'access', _8 => _8.command, 'optionalAccess', _9 => _9.prefix]) || '.'}\``
            )
            break
        }
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.getAllPrefixes = getAllPrefixes; exports.loadPrefixes = loadPrefixes; exports.savePrefixes = savePrefixes; exports.isNoPrefix = isNoPrefix;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
