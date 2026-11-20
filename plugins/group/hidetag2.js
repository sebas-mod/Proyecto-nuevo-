"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikulidjs = require('../../src/lib/almiku-lid.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'hidetag2',
    alias: ['h2', 'ht2'],
    category: 'group',
    description: 'Escondite con faxQuoted styling',
    usage: '.h2 <text> atau reply pesan',
    example: '.h2 Pengumuman penting!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.fullArgs, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!text && !m.quoted) {
        return m.reply(
            `📢 *HIDETAG 2*\n\n` +
            `• \`${m.prefix}h2 <text>\`\n` +
            `•Responder mensaje +\`${m.prefix}h2\``
        )
    }
    try {
        m.react('📢')
        const groupMeta = m.groupMetadata
        const users = _almikulidjs.getParticipantJids.call(void 0, groupMeta.participants || [])
        const fakeQuoted = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                conversation: _optionalChain([_configjs2.default, 'access', _4 => _4.bot, 'optionalAccess', _5 => _5.name]) || 'Al Miku MD'
            }
        }
        if (m.quoted) {
            const q = m.quoted
            const qMsg = q.message || {}
            const type = Object.keys(qMsg)[0]
            if (type === 'imageMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        image: media,
                        caption: _optionalChain([qMsg, 'access', _6 => _6.imageMessage, 'optionalAccess', _7 => _7.caption]) || '',
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }
            if (type === 'videoMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        video: media,
                        caption: _optionalChain([qMsg, 'access', _8 => _8.videoMessage, 'optionalAccess', _9 => _9.caption]) || '',
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }
            if (type === 'stickerMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    { sticker: media, mentions: users },
                    { quoted: fakeQuoted }
                )
            }
            if (type === 'audioMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        audio: media,
                        mimetype: _optionalChain([qMsg, 'access', _10 => _10.audioMessage, 'optionalAccess', _11 => _11.mimetype]),
                        ptt: _optionalChain([qMsg, 'access', _12 => _12.audioMessage, 'optionalAccess', _13 => _13.ptt]) || false,
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }
            if (type === 'documentMessage') {
                const media = await q.download()
                return sock.sendMessage(
                    m.chat,
                    {
                        document: media,
                        fileName: _optionalChain([qMsg, 'access', _14 => _14.documentMessage, 'optionalAccess', _15 => _15.fileName]) || 'file',
                        mimetype: _optionalChain([qMsg, 'access', _16 => _16.documentMessage, 'optionalAccess', _17 => _17.mimetype]),
                        mentions: users
                    },
                    { quoted: fakeQuoted }
                )
            }
            const quotedText =
                q.text ||
                qMsg.conversation ||
                _optionalChain([qMsg, 'access', _18 => _18.extendedTextMessage, 'optionalAccess', _19 => _19.text]) ||
                ''

            return sock.sendMessage(
                m.chat,
                { text: quotedText, mentions: users },
                { quoted: fakeQuoted }
            )
        }

        // ===== TEXT MODE =====
        await sock.sendMessage(
            m.chat,
            {
                text,
                mentions: users
            },
            { quoted: fakeQuoted }
        )

        m.react('✅')

    } catch (err) {
        m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
