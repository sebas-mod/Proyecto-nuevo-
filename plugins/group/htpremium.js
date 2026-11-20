"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['htpremium', 'hidetagpremium', 'htprem'],
    category: 'group',
    description: 'Escondite con respuesta de soporte ( texto / medios )',
    usage: '.htprem [mensaje] o responde a un mensaje',
    example: '.htprem o responde a un mensaje y luego .htprem',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const mentions = _ourinlidjs.getParticipantJids.call(void 0, participants)
        const quoted = m.quoted
        const [cmd, text] = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.split, 'call', _3 => _3('|')])
        if (quoted) {
            const qMsg = quoted.message || {}
            const type = Object.keys(qMsg)[0]
            if (type === 'imageMessage') {
                const media = await quoted.download()
                const caption = _optionalChain([qMsg, 'access', _4 => _4.imageMessage, 'optionalAccess', _5 => _5.caption]) || text || ''
                return sock.sendMessage(m.chat, {
                    image: media,
                    caption,
                    mentions
                })
            }
            if (type === 'videoMessage') {
                const media = await quoted.download()
                const caption = _optionalChain([qMsg, 'access', _6 => _6.videoMessage, 'optionalAccess', _7 => _7.caption]) || text || ''
                return sock.sendMessage(m.chat, {
                    video: media,
                    caption,
                    mentions
                })
            }
            if (type === 'stickerMessage') {
                const media = await quoted.download()
                await sock.sendMessage(m.chat, {
                    sticker: media,
                    mentions
                })
                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }
            if (type === 'audioMessage') {
                const media = await quoted.download()
                const audioMsg = qMsg.audioMessage || {}

                await sock.sendMessage(m.chat, {
                    audio: media,
                    mimetype: audioMsg.mimetype,
                    ptt: audioMsg.ptt || false,
                    mentions
                })

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }
            if (type === 'documentMessage') {
                const media = await quoted.download()
                const docMsg = qMsg.documentMessage || {}

                await sock.sendMessage(m.chat, {
                    document: media,
                    mimetype: docMsg.mimetype,
                    fileName: docMsg.fileName || 'file',
                    mentions
                })

                if (text) {
                    await sock.sendMessage(m.chat, {
                        text,
                        mentions
                    })
                }
                return
            }
            const quotedText =
                quoted.text ||
                qMsg.conversation ||
                _optionalChain([qMsg, 'access', _8 => _8.extendedTextMessage, 'optionalAccess', _9 => _9.text]) ||
                ''

            const finalText = text || quotedText

            if (!finalText) {
                return m.reply('❌*Mensaje vacio*')
            }

            return sock.sendMessage(m.chat, {
                text: finalText,
                mentions
            })
        }
        if (!text) {
            return m.reply(
                `📢* PREMUM DE HIDETAG *\n\n` +
                `•Responder mensaje y haga clic\`${m.prefix}ht\`\n` +
                `•O escribe\`${m.prefix}ht <custom tag> | <pesan>\`\n\n` +
                `•Ejemplo:\`${m.prefix}*Todo el mundo es tú*\`\n\n` +
                `Soporte: texto, imagen, vídeo, pegatina, audio, documento`
            )
        }

        await sock.sendMessage(m.chat, {
            text: `@${m.chat} ${text} `,
            contextInfo: {
                groupMentions: [{
                    groupJid: m.chat,
                    groupSubject: cmd
                }],
                mentionedJid: mentions
            }
        }, { quoted: m })

    } catch (err) {
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
