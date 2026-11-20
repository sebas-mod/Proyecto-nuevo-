"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'levelup',
    alias: ['lvlup', 'levelnotif'],
    category: 'user',
    description: 'Toggle notifikasi level up',
    usage: '.levelup <on/off>',
    example: '.levelup on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)
    const args = m.args || []
    const sub = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    
    if (!user.settings) user.settings = {}
    
    if (sub === 'on') {
        user.settings.levelupNotif = true
        db.save()
        return m.reply(
            `✅ *ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
            `> Status: *ON* ✅\n` +
            `- ¡Recibirá notificaciones cuando llegue al nivel!`
        )
    }
    
    if (sub === 'off') {
        user.settings.levelupNotif = false
        db.save()
        return m.reply(
            `❌ *ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
            `> Status: *OFF* ❌\n` +
            `*Notificaciones nivelan discapacitadas.*`
        )
    }
    
    const status = user.settings.levelupNotif !== false ? 'ON ✅' : 'OFF ❌'
    return m.reply(
        `🔔 *ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
        `• A Status this moment: •${status}*\n\n` +
        `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
        `┃ > \`.levelup on\` - Aktifkan\n` +
        `┃ > \`.levelup off\` - Nonaktifkan\n` +
        `╰┈┈┈┈┈┈┈┈⬡`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
