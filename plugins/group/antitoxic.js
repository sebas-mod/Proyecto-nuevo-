"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'antitoxic',
    alias: ['toxic', 'antitoxik'],
    category: 'group',
    description: 'Configando antitoxic en grupo',
    usage: '.antitoxic <on/off/warn/metode>',
    example: '.antitoxic on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const DEFAULT_TOXIC_WORDS = [
    'anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'babi', 'tolol',
    'goblok', 'idiot', 'bodoh', 'kampret', 'asu', 'jancok', 'bajingan',
    'keparat', 'setan', 'iblis', 'tai', 'brengsek', 'sialan'
]

function isToxic(text, toxicList) {
    if (!text || typeof text !== 'string') return { toxic: false, word: null }

    const lowerText = text.toLowerCase().trim()
    if (!lowerText) return { toxic: false, word: null }

    const words = (toxicList && toxicList.length > 0) ? toxicList : DEFAULT_TOXIC_WORDS

    for (const word of words) {
        if (!word) continue
        const lowerWord = word.toLowerCase().trim()
        if (!lowerWord) continue

        const escapedWord = lowerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escapedWord}($|\\s|[^a-zA-Z0-9])`, 'i')

        if (regex.test(lowerText)) {
            return { toxic: true, word }
        }
    }

    return { toxic: false, word: null }
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antitoxicWarn: '⚠ @%user% dijo palabras ofensivas.\nAdvertencia %warn% de %max%; la próxima infracción puede terminar en %method%.',
        antitoxicAction: '🚫 @%user% fue %method% por ser tóxico. (%warn%/%max%)',
    }
    let text = _optionalChain([_configjs2.default, 'access', _ => _.groupProtection, 'optionalAccess', _2 => _2[key]]) || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function handleToxicMessage(m, sock, db, toxicWord) {
    const groupData = db.getGroup(m.chat) || {}
    const maxWarn = groupData.toxicMaxWarn || 3
    const method = groupData.toxicMethod || 'kick'
    const warnCount = (_optionalChain([groupData, 'access', _3 => _3.toxicWarns, 'optionalAccess', _4 => _4[m.sender]]) || 0) + 1

    if (!groupData.toxicWarns) groupData.toxicWarns = {}
    groupData.toxicWarns[m.sender] = warnCount
    db.setGroup(m.chat, groupData)

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch (e) {}

    const senderTag = m.sender.split('@')[0]

    if (warnCount >= maxWarn) {
        if (method === 'kick') {
            try {
                await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            } catch (e2) {}
        }

        groupData.toxicWarns[m.sender] = 0
        db.setGroup(m.chat, groupData)

        await sock.sendMessage(m.chat, {
            text: gpMsg('antitoxicAction', {
                user: senderTag,
                warn: String(warnCount),
                max: String(maxWarn),
                method
            }),
            mentions: [m.sender],
        })
    } else {
        await sock.sendMessage(m.chat, {
            text: gpMsg('antitoxicWarn', {
                user: senderTag,
                warn: String(warnCount),
                max: String(maxWarn),
                method
            }),
            mentions: [m.sender],
        })
    }

    return true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const subCommand = _optionalChain([args, 'access', _5 => _5[0], 'optionalAccess', _6 => _6.toLowerCase, 'call', _7 => _7()])

    const groupData = db.getGroup(m.chat) || {}

    if (!subCommand) {
        const status = groupData.antitoxic ? '✅ ON' : '❌ OFF'
        const toxicCount = _optionalChain([groupData, 'access', _8 => _8.toxicWords, 'optionalAccess', _9 => _9.length]) || DEFAULT_TOXIC_WORDS.length
        const maxWarn = groupData.toxicMaxWarn || 3
        const method = groupData.toxicMethod || 'kick'

        let txt = `🛡️ *ᴀɴᴛɪᴛᴏxɪᴄ*\n\n`
        txt += `> Status: *${status}*\n`
        txt += `> Kata: *${toxicCount}*\n`
        txt += `> Max Warn: *${maxWarn}*\n`
        txt += `Medan de:${method}*\n\n`
        txt += `*Comando:*\n`
        txt += `> \`.antitoxic on/off\`\n`
        txt += `> \`.antitoxic warn <1-10>\`\n`
        txt += `♪\`antito.xic método kick / delete\`\n`
        txt += `> \`.addtoxic <kata>\`\n`
        txt += `> \`.deltoxic <kata>\`\n`
        txt += `> \`.listtoxic\``

        await m.reply(txt)
        return
    }

    if (subCommand === 'on') {
        db.setGroup(m.chat, { antitoxic: true })
        m.react('✅')
        await m.reply(`✅* Antitoxic activado*`)
        return
    }

    if (subCommand === 'off') {
        db.setGroup(m.chat, { antitoxic: false })
        m.react('❌')
        await m.reply(`❌* Antitoxic desactivado*`)
        return
    }

    if (subCommand === 'warn') {
        const count = parseInt(args[1])
        if (!count || count < 1 || count > 10) {
            return m.reply(`❌ Introduce número 1-10\n> Ejemplo:\`antito.xic warn 5\``)
        }
        db.setGroup(m.chat, { toxicMaxWarn: count })
        m.react('✅')
        await m.reply(`✅MaxAdvertencia girada a *${count}*`)
        return
    }

    if (subCommand === 'metode' || subCommand === 'method' || subCommand === 'mode') {
        const method = _optionalChain([args, 'access', _10 => _10[1], 'optionalAccess', _11 => _11.toLowerCase, 'call', _12 => _12()])
        if (!method || !['kick', 'delete'].includes(method)) {
            return m.reply(`❌Elija método: * patada * o * eliminar *\n> Ejemplo:\`antito.xic método kick\``)
        }
        db.setGroup(m.chat, { toxicMethod: method })
        m.react('✅')
        await m.reply(`✅Metodología cambiada a *${method}*`)
        return
    }

    await m.reply(`❌Sub @-@ comando unknown.\n> Escribe\`antito.xic\`para ver la lista de comandos.`)
}

exports.config = pluginConfig; exports.handler = handler; exports.isToxic = isToxic; exports.handleToxicMessage = handleToxicMessage; exports.DEFAULT_TOXIC_WORDS = DEFAULT_TOXIC_WORDS;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
