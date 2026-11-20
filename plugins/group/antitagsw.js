"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Mengaktifkan/menonaktifkan anti tag status di grup',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ sᴇᴛᴛɪɴɢs*\n\n` +
            `> Status: *${status === 'on' ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `> Fitur ini menghapus pesan tag status\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Aktifkan\n` +
            `> \`${m.prefix}antitagsw off\` → Nonaktifkan`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *ᴀɴᴛɪᴛᴀɢsᴡ ᴀᴋᴛɪꜰ*\n\n` +
            `> Anti tag status berhasil diaktifkan!\n` +
            `> Pesan tag status akan dihapus otomatis.`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *ᴀɴᴛɪᴛᴀɢsᴡ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
            `> Anti tag status berhasil dinonaktifkan.`
        )
        return
    }

    await m.reply(
        `❌ *ᴘɪʟɪʜᴀɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
        `> Gunakan: on atau off`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
