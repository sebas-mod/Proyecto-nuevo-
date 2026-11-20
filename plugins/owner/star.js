"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: ['star', 'bintang'],
    alias: [],
    category: 'owner',
    description: 'Beri/hapus bintang pada pesan',
    usage: '.star (reply pesan) atau .star hapus (reply pesan)',
    example: '.star',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            '⭐ *sᴛᴀʀ ᴍᴇssᴀɢᴇ*\n\n' +
            '> `.star` (reply pesan) — Beri bintang\n' +
            '> `.star hapus` (reply pesan) — Hapus bintang'
        )
    }

    const unstar = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()]) === 'hapus' || _optionalChain([m, 'access', _5 => _5.args, 'access', _6 => _6[0], 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8()]) === 'unstar'
    const key = m.quoted.key

    try {
        await sock.chatModify({
            star: {
                messages: [{ id: key.id, fromMe: key.fromMe }],
                star: !unstar
            }
        }, m.chat)

        await m.react('⭐')
        return m.reply(
            unstar
                ? '❌ *Bintang dihapus dari pesan*'
                : '⭐ *Pesan ditandai bintang*'
        )
    } catch (err) {
        return m.reply(`❌ Gagal: ${err.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
