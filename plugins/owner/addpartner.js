"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'addpartner',
    alias: ['delpartner', 'listpartner'],
    category: 'owner',
    description: 'Kellola bot partner list',
    usage: '.addpartner <número/@tag> [días]\n.delpartner <número/@tag>\n.listpartner\n.cekpartner <número/@tag>',
    example: '.addpartner 6281234567890 30',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function extractNumber(m) {
    if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) return m.mentionedJid[0]
    if (_optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender])) return m.quoted.sender

    const text = _optionalChain([m, 'access', _5 => _5.args, 'optionalAccess', _6 => _6.join, 'call', _7 => _7(' '), 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]) || ''
    const match = text.match(/(\d{10,15})/)
    if (match) return `${match[1]}@s.whatsapp.net`

    return null
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const cmd = _optionalChain([m, 'access', _10 => _10.command, 'optionalAccess', _11 => _11.toLowerCase, 'call', _12 => _12()])
    if (!db.data.partner) db.data.partner = []
    if (cmd === 'addpartner') {
        const target = await extractNumber(m)
        if (!target) {
            return m.reply(
                `🤝 *ᴀᴅᴅ ᴘᴀʀᴛɴᴇʀ*\n\n` +
                `Cara llevas\n` +
                `> \`${m.prefix}addpartner\`\n` +
                `> \`${m.prefix}addpartner 6281xxx 30\`\n\n` +
                `* Predeterminado: 30 días *`
            )
        }
        let targetNumber = target.replace(/@.+/g, '')
        if (targetNumber.startsWith('08')) {
            targetNumber = '62' + targetNumber.slice(1)
        }
        if (_configjs2.default.isOwner(targetNumber)) {
            return m.reply(`⚠️ @${targetNumber}¡Se está convirtiendo en un propietario!`, { mentions: [target] })
        }
        const existingIndex = db.data.partner.findIndex(p => p.id === targetNumber)
        const days = parseInt(_optionalChain([m, 'access', _13 => _13.args, 'optionalAccess', _14 => _14.find, 'call', _15 => _15(a => /^\d+$/.test(a) && a.length <= 4)])) || 30
        const pushName = _optionalChain([m, 'access', _16 => _16.quoted, 'optionalAccess', _17 => _17.pushName]) || m.pushName || 'Unknown'
        const now = Date.now()
        let newExpired
        let message = ''
        if (existingIndex !== -1) {
            const currentExpired = db.data.partner[existingIndex].expired || now
            const baseTime = currentExpired > now ? currentExpired : now
            newExpired = baseTime + (days * 24 * 60 * 60 * 1000)
            
            db.data.partner[existingIndex].expired = newExpired
            db.data.partner[existingIndex].name = pushName
            message = `Partner diperpanjang`
        } else {
            newExpired = now + (days * 24 * 60 * 60 * 1000)
            db.data.partner.push({
                id: targetNumber,
                expired: newExpired,
                name: pushName,
                addedAt: now
            })
            message = `Anadido correctamente`
        }

        db.save()

        const expDate = new Date(newExpired).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

        await m.reply(
            `✅Exito${existingIndex !== -1 ? 'memperpanjang' : 'menambahkan'} partner @${targetNumber}mientras *${days}el*\nEx# Pired #${expDate}*`,
            { mentions: [target] }
        )
        return
    }

    if (cmd === 'delpartner') {
        const target = await extractNumber(m)
        if (!target) {
            return m.reply(`⚠Para la etiqueta o el usuario de respuesta que los socios quieren recoger.`)
        }
        let targetNumber = target.replace(/@.+/g, '')
        if (targetNumber.startsWith('08')) {
            targetNumber = '62' + targetNumber.slice(1)
        }

        const initialLength = db.data.partner.length
        db.data.partner = db.data.partner.filter(p => p.id !== targetNumber)
        
        if (db.data.partner.length < initialLength) {
            db.save()
            await m.reply(`✅Resultado en memoria @${targetNumber}de partner`, { mentions: [target] })
        } else {
            return m.reply(`⚠Ese Usuario no era un socio.`)
        }
        return
    }

    if (cmd === 'listpartner') {
        const partners = db.data.partner
        if (!partners.length) {
            return m.reply(`🤝*ᴅᴀꜰᴛᴀʀ ᴘᴀʀᴛɴᴇʀ*\n\nPara verlo como socio.`)
        }

        let txt = `🤝*Registrate PARTNER*\n\n`
        const mentions = []
        partners.forEach((p, i) => {
            const num = p.id
            const expDate = new Date(p.expired).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
            const remaining = Math.ceil((p.expired - Date.now()) / (1000 * 60 * 60 * 24))
            txt += `${i + 1}. @${num} — ${expDate} (${remaining > 0 ? remaining + 'd' : 'Expired'})\n`
            mentions.push(`${num}@s.whatsapp.net`)
        })
        txt += `\nTotal: *${partners.length}* partner`
        await m.reply(txt, { mentions })
        return
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
