"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'acc',
    alias: ['accall', 'joinrequest', 'reqjoin'],
    category: 'group',
    description: 'Kelola input grupo ( accept / return )',
    usage: '.acc <list|approve|reject> [all|nomor]',
    example: '.acc approve all',
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

function formatDate(timestamp) {
    return new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(timestamp * 1000))
}

async function handler(m, { sock }) {
    const args = m.args || []
    const sub = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    const option = _optionalChain([args, 'access', _4 => _4.slice, 'call', _5 => _5(1), 'access', _6 => _6.join, 'call', _7 => _7(' '), 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()])

    if (!sub || !['list', 'approve', 'reject'].includes(sub)) {
        return m.reply(
            `📋 *ᴊᴏɪɴ ʀᴇQᴜᴇsᴛ ᴍᴀɴᴀɢᴇʀ*\n\n` +
            `╭┈┈⬡「 📌 *ᴄᴏᴍᴍᴀɴᴅ* 」\n` +
            `┃ ${m.prefix}acc list\n` +
            `┃ ${m.prefix}acc approve all\n` +
            `┃ ${m.prefix}acc reject all\n` +
            `┃ ${m.prefix}acc approve 1|2|3\n` +
            `┃ ${m.prefix}acc reject 1|2|3\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }

    await m.react('🕕')

    try {
        const pendingList = await sock.groupRequestParticipantsList(m.chat)

        if (!_optionalChain([pendingList, 'optionalAccess', _10 => _10.length])) {
            await m.react('📭')
            return m.reply(`📭No se retrasa la solicitud de entrada.`)
        }

        if (sub === 'list') {
            let text = `📋 *ᴅᴀꜰᴛᴀʀ ᴘᴇʀᴍɪɴᴛᴀᴀɴ ᴍᴀsᴜᴋ*\n\n`
            text += `> Total: ${pendingList.length} permintaan\n\n`

            for (let i = 0; i < pendingList.length; i++) {
                const req = pendingList[i]
                const number = _optionalChain([req, 'access', _11 => _11.jid, 'optionalAccess', _12 => _12.split, 'call', _13 => _13('@'), 'access', _14 => _14[0]]) || 'Unknown'
                const method = req.request_method || '-'
                const time = req.request_time ? formatDate(req.request_time) : '-'

                text += `*${i + 1}.* @${number}\n`
                text += `   📱 ${number}\n`
                text += `   📨 ${method}\n`
                text += `   🕐 ${time}\n\n`
            }

            text += `> Usa \`${m.prefix}acc acerca de todos\`o\`${m.prefix}acc reject all\``

            const mentions = pendingList.map(r => r.jid)
            await m.react('📋')
            return m.reply(text, { mentions })
        }

        const action = sub

        if (option === 'all') {
            const jids = pendingList.map(r => r.jid)

            const results = await sock.groupRequestParticipantsUpdate(m.chat, jids, action)

            const success = results.filter(r => r.status === '200' || !r.status || r.status === 200).length
            const failed = results.length - success

            const label = action === 'approve' ? 'Diterima' : 'Ditolak'
            await m.react('✅')
            return m.reply(
                `✅ *${label.toUpperCase()}Todo*\n\n` +
                `•✅Exito:${success}\n` +
                `•❌Fallido:${failed}\n` +
                `> 📊 Total: ${results.length}`
            )
        }

        const indices = option.split('|').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < pendingList.length)

        if (!indices.length) {
            await m.react('❌')
            return m.reply(
                `❌El número no es válido.\n\n` +
                `> Usa \`${m.prefix}acc lista\`para ver la lista.\n` +
                `> Ejemplo:\`${m.prefix}acc ${action} 1|2|3\``
            )
        }

        const targets = indices.map(i => pendingList[i])
        let text = ''
        const label = action === 'approve' ? 'Diterima' : 'Ditolak'
        let successCount = 0

        for (const target of targets) {
            try {
                const result = await sock.groupRequestParticipantsUpdate(m.chat, [target.jid], action)
                const status = _optionalChain([result, 'access', _15 => _15[0], 'optionalAccess', _16 => _16.status])
                const ok = status === '200' || !status || status === 200

                const number = target.jid.split('@')[0]
                text += `${ok ? '✅' : '❌'} ${number} — ${ok ? label : 'Gagal'}\n`
                if (ok) successCount++
            } catch (e) {
                const number = target.jid.split('@')[0]
                text += `❌ ${number} — Error\n`
            }
        }

        await m.react('✅')
        return m.reply(
            `📋 *ʜᴀsɪʟ ${label.toUpperCase()}*\n\n` +
            text + `\n` +
            `> ✅ ${successCount}/${targets.length}exito`
        )
    } catch (error) {
        await m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
