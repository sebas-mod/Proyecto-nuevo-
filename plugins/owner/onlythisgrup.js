"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: 'onlythisgrup',
    alias: ['onlythisgroup', 'lockgrup', 'lockgroup'],
    category: 'owner',
    description: 'Bot hanya aktif di grup ini saja',
    usage: '.onlythisgrup',
    example: '.onlythisgrup',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const db = _ourindatabasejs.getDatabase.call(void 0, )
        const current = db.setting('onlyThisGroup') || null

        if (current && (current === m.chat || current.jid === m.chat)) {
            db.setting('onlyThisGroup', null)
            db.save()
            return m.reply(`🔓 *UNLOCKED*\n\nBot kembali aktif di semua grup secara publik.`)
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)
        
        if (!groupMetadata) {
            return m.reply(`❌ Gagal mendapatkan metadata grup.`)
        }

        const participants = groupMetadata.participants
        const isBotAdmin = _optionalChain([participants, 'access', _ => _.find, 'call', _2 => _2(p => p.id === botNumber), 'optionalAccess', _3 => _3.admin]) !== null

        if (!isBotAdmin) {
            return m.reply(`❌ *AKSES DITOLAK*\n\nBot harus menjadi admin di grup ini terlebih dahulu agar bisa mengambil tautan undangan (link grup).`)
        }

        const inviteCode = await sock.groupInviteCode(m.chat).catch(() => null)
        
        if (!inviteCode) {
            return m.reply(`❌ Gagal mengambil tautan undangan grup. Pastikan bot adalah admin yang sah.`)
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
        const groupName = groupMetadata.subject

        db.setting('onlyThisGroup', {
            jid: m.chat,
            name: groupName,
            link: inviteLink
        })
        db.save()

        await m.reply(
            `🔒 *LOCKED BERHASIL*\n\n` +
            `Mulai sekarang, bot hanya bisa digunakan secara eksklusif di grup:\n` +
            `*${groupName}*\n\n` +
            `Pengguna di grup lain akan diarahkan untuk bergabung melalui tautan:\n` +
            `${inviteLink}\n\n` +
            `Ketik \`.onlythisgrup\` lagi untuk membuka kunci.`
        )
    } catch (error) {
        console.error(error)
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
