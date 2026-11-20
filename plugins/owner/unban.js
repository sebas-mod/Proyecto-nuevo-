"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinlidjs = require('../../src/lib/ourin-lid.js');

const pluginConfig = {
    name: 'unban',
    alias: ['delban', 'unblock'],
    category: 'owner',
    description: 'Borrar el usuario de la lista prohibida',
    usage: '.unban <nomor/@tag>',
    example: '.unban 6281234567890',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (_ourinlidjs.isLid.call(void 0, raw)) raw = _ourinlidjs.lidToJid.call(void 0, raw)
    let num = raw.replace(/[^0-9]/g, '')
    if (num.startsWith('08')) num = '62' + num.slice(1)
    if (num.startsWith('0')) num = '62' + num.slice(1)

    return num
}

async function handler(m, { sock }) {
    const targetNumber = resolveTarget(m)

    if (!targetNumber || targetNumber.length < 10 || targetNumber.length > 15) {
        return m.reply(
            `✅ *ᴜɴʙᴀɴ ᴜsᴇʀ*\n\n` +
            `* Ponga un número o una etiqueta de usuario*\n\n` +
            `\`Contoh: ${m.prefix}unban 6281234567890\``
        )
    }

    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const bannedList = db.setting('bannedUsers') || []

    const index = bannedList.findIndex(b => {
        const c = String(b).replace(/[^0-9]/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n> Número\`${targetNumber}\`no en la lista de bandas`)
    }

    bannedList.splice(index, 1)
    db.setting('bannedUsers', bannedList)
    _configjs2.default.bannedUsers = bannedList

    await m.react('✅')

    await m.reply(
        `✅ *ᴜsᴇʀ ᴅɪᴜɴʙᴀɴ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📱 ɴᴏᴍᴏʀ: \`${targetNumber}\`\n` +
        `┃ ✅ sᴛᴀᴛᴜs: \`Unbanned\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${bannedList.length}\` ᴜsᴇʀ\n` +
        `╰┈┈⬡`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
