"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'delete',
    alias: ['del', 'hapus', 'd'],
    category: 'group',
    description: 'Hapus pesan dengan reply',
    usage: '.delete (reply pesan)',
    example: '.delete',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply('⚠️ *Reply pesan yang ingin dihapus!*')
    }

    const quotedSender = m.quoted.sender || _optionalChain([m, 'access', _ => _.quoted, 'access', _2 => _2.key, 'optionalAccess', _3 => _3.participant])
    const botJid = _optionalChain([sock, 'access', _4 => _4.user, 'optionalAccess', _5 => _5.id, 'optionalAccess', _6 => _6.split, 'call', _7 => _7(':'), 'access', _8 => _8[0]]) + '@s.whatsapp.net'
    const isOwnMessage = _optionalChain([m, 'access', _9 => _9.quoted, 'access', _10 => _10.key, 'optionalAccess', _11 => _11.fromMe]) || quotedSender === m.sender
    const isBotMessage = quotedSender === botJid || _optionalChain([m, 'access', _12 => _12.quoted, 'access', _13 => _13.key, 'optionalAccess', _14 => _14.fromMe])

    if (!isOwnMessage && !isBotMessage) {
        if (!m.isBotAdmin) {
            return m.reply('⚠️ *Bot harus jadi admin untuk hapus pesan orang lain!*')
        }
        if (!m.isAdmin && !m.isOwner) {
            return m.reply('⚠️ *Hanya admin yang bisa hapus pesan orang lain!*')
        }
    }

    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: quotedSender
        }

        await sock.sendMessage(m.chat, { delete: key })
        await m.react('✅')

    } catch (err) {
        if (_optionalChain([err, 'access', _15 => _15.message, 'optionalAccess', _16 => _16.includes, 'call', _17 => _17('not found')]) || _optionalChain([err, 'access', _18 => _18.message, 'optionalAccess', _19 => _19.includes, 'call', _20 => _20('forbidden')])) {
            await m.reply('❌ *Gagal menghapus!*\n> Pesan mungkin sudah dihapus atau terlalu lama.')
        } else {
            await m.react('❌')
        }
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
