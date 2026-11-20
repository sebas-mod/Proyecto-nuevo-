"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinjadibotmanagerjs = require('../../src/lib/ourin-jadibot-manager.js');

const pluginConfig = {
    name: 'jadibot',
    alias: ['jadibotqr', 'becomebot', 'bot'],
    category: 'main',
    description: 'Jadikan nomor kamu menjadi bot (Pairing Code / QR)',
    usage: '.jadibot atau .jadibot qr',
    example: '.jadibot',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ Gagal mengidentifikasi nomor kamu')

    if (_ourinjadibotmanagerjs.isJadibotActive.call(void 0, sender)) {
        return m.reply(
            `⚠️ *ᴊᴀᴅɪʙᴏᴛ ꜱᴜᴅᴀʜ ᴀᴋᴛɪꜰ*\n\n` +
            `> Nomor kamu sudah menjadi bot\n` +
            `> Ketik \`${m.prefix}stopjadibot\` untuk menghentikan`
        )
    }

    const arg = (_optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0]]) || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴍᴏᴅᴇ*\n\n` +
            `> Menyiapkan koneksi...\n` +
            `> Scan QR Code yang akan dikirim`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
            `> Menyiapkan koneksi...`
        )
    }

    try {
        await _ourinjadibotmanagerjs.startJadibot.call(void 0, sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ*\n\n` +
            `> ${e.message || 'Terjadi kesalahan'}\n\n` +
            `Coba lagi dalam beberapa menit.`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
