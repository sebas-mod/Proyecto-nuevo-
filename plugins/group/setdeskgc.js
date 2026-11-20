"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'setdeskgc',
    alias: ['setdesc', 'setdescgc', 'setdeskripsi', 'setdesk'],
    category: 'group',
    description: 'Mengubah deskripsi grup',
    usage: '.setdeskgc <deskripsi baru>',
    example: '.setdeskgc Grup untuk diskusi',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newDesc = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || ''
    if (!m.text && _optionalChain([m, 'access', _4 => _4.args, 'optionalAccess', _5 => _5.length]) === 0) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}setdeskgc Deskripsi baru\`\n` +
            `> \`${m.prefix}setdeskgc clear\` - Hapus deskripsi`
        )
        return
    }
    const descToSet = newDesc.toLowerCase() === 'clear' ? '' : newDesc
    
    if (descToSet.length > 2048) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `> Deskripsi maksimal 2048 karakter.`
        )
        return
    }
    
    try {
        await sock.groupUpdateDescription(m.chat, descToSet)
        
        if (descToSet) {
            await m.reply(
                `✅ Deskripsi grup berhasil diperbarui!`
            )
        } else {
            await m.reply(
                `✅ Deskripsi grup berhasil dihapus!`
            )
        }
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> Tidak dapat mengubah deskripsi grup.\n` +
            `> _${error.message}_`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
