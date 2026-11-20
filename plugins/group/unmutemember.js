"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinlidjs = require('../../src/lib/ourin-lid.js');

const pluginConfig = {
    name: 'unmutemember',
    alias: ['unmutmember', 'unsilentmember', 'unbisukanmember', 'listmutemember', 'listmute'],
    category: 'group',
    description: 'Membuka mute member tertentu',
    usage: '.unmutemember <@tag/reply/nomor>',
    example: '.unmutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (_ourinlidjs.isLid.call(void 0, raw)) raw = _ourinlidjs.lidToJid.call(void 0, raw)
    if (!raw.includes('@')) raw = raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    return raw
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    if (m.command === 'listmutemember' || m.command === 'listmute') {
        if (mutedMembers.length === 0) {
            return m.reply(`🔇* LIST MUTED MENBERS*\n\n# Nadie tiene una foto cortada en este grupo #`)
        }

        let txt = `🔇 *LIST MUTED MEMBERS*\n\n╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ* 」\n`
        mutedMembers.forEach((jid, i) => {
            const num = jid.replace(/@.+/g, '')
            txt += `┃ ${i + 1}. @${num}\n`
        })
        txt += `╰┈┈⬡\n\n> Total: \`${mutedMembers.length}\` member dimute`

        return m.reply(txt, { mentions: mutedMembers })
    }

    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `🔊 *UNMUTE MEMBER*\n\n` +
            `•Hacer una foto muda determinada\n\n` +
            `\`Contoh:\`\n` +
            `> ${m.prefix}unmutemember @user\n` +
            `> ${m.prefix}unmutemember 6281234567890\n` +
            `# Responder mensaje # +${m.prefix}unmutemember`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    const index = mutedMembers.findIndex(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Member @${targetNumber}no ser reprimido`, { mentions: [targetJid] })
    }

    mutedMembers.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔊')
    await m.reply(
        `🔊 *MEMBER DIUNMUTE*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴍᴇᴍʙᴇʀ: @${targetNumber}\n` +
        `┃ 🔊 sᴛᴀᴛᴜs: \`Unmuted\`\n` +
        `┃ 📊 sɪsᴀ ᴍᴜᴛᴇ: \`${mutedMembers.length}\` ᴍᴇᴍʙᴇʀ\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
