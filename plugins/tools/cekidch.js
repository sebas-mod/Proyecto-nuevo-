"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
    name: 'cekidch',
    alias: ['idch', 'channelid', 'infoch', 'channelinfo'],
    category: 'tools',
    description: 'Verificar ID e información completa Canal de enlaces',
    usage: '.cekidch <link channel>',
    example: '.cekidch https://whatsapp.com/channel/xxxxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatDate(timestamp) {
    if (!timestamp) return '—'
    const d = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : timestamp)
    const pad = n => String(n).padStart(2, '0')
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function formatSubs(count) {
    if (!count || count === 0) return '0'
    if (count >= 1000000) return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
    return String(count)
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!text) {
        return m.reply(
            `*Usando información*\n\n` +
            `Por favor, introduzca el enlace al Canal WhatsApp que desea comprobar la información en detalle.\n\n` +
            `*Ejemplo de uso:*\n` +
            `• \`${m.prefix}cekidch https://whatsapp.com/channel/xxxxx\``
        )
    }

    if (!text.includes('https://whatsapp.com/channel/')) {
        return m.reply(`❌* Enlaza el ruido*\n\nAsegúrese de que los enlaces que ha introducido son los enlaces de sash y de Channel ChanksApp verdaderos.`)
    }

    m.react('🕕')

    try {
        const metadata = await sock.cekIDSaluran(text)

        if (!_optionalChain([metadata, 'optionalAccess', _4 => _4.id])) {
            m.react('❌')
            return m.reply(`❌CHANNEL NO FOUND\n\nLo sentimos, el sistema no puede encontrar información del Canal. Tal vez los enlaces han pasado o el Canal ha sido hackeado.`)
        }

        const chName = metadata.name || 'Unknown'
        const chId = metadata.id
        const chSubs = _nullishCoalesce(_nullishCoalesce(metadata.subscribers, () => ( metadata.subscribers_count)), () => ( 0))
        const chDesc = metadata.description || '—'
        const chVerified = metadata.verification === 'VERIFIED' ? '✓ Verified' : 'Unverified'
        const chCreated = formatDate(metadata.creation_time)
        const chPicUrl = metadata.preview === "https://mmg.whatsapp.net" ? "https://files.catbox.moe/lp9tpd.jpg" : metadata.preview

        const descPreview = chDesc.length > 120 ? chDesc.slice(0, 120) + '...' : chDesc

        const infoText =
            `Aguit es un detalle completo de la información relativa al canal que buscas:\n\n` +
            `*RINCIAN CHANNEL:*\n` +
            `•Nombre: *${chName}*\n` +
            `• ID Channel: \`${chId}\`\n` +
            `• Subscriber: *${formatSubs(chSubs)}*\n` +
            `• Status: *${chVerified}*\n` +
            `• Creado En: *${chCreated}*\n\n` +
            `*Descripción:*\n` +
            `${descPreview}`

        const buttons = [
            {
                name: 'cta_copy',
                buttonParamsJson: JSON.stringify({
                    display_text: '📋Ambulad su identificación.',
                    copy_code: chId
                })
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔗Su canal Abre',
                    url: text
                })
            }
        ]

        await sock.sendButton(m.chat, chPicUrl, infoText, m, {
            buttons: buttons,
            footer: `© ${_optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || 'Al Miku-AI'}`,
        })

        m.react('✅')

    } catch (error) {
        console.error('[CekIdCh] Error:', error.message)
        m.react('❌')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
