"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'cmdvn',
    alias: ['voicecommand', 'vncmd'],
    category: 'owner',
    description: 'Aktifkan command via voice note',
    usage: '.cmdvn <on/off>',
    example: '.cmdvn on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const subCmd = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])

    const current = db.setting('cmdVn') || false

    if (!subCmd || subCmd === 'status') {
        const status = current ? '✅ ON' : '❌ OFF'
        return m.reply(
            `🎤 *ᴄᴍᴅ ᴠᴏɪᴄᴇ ɴᴏᴛᴇ*\n\n` +
            `> Status: *${status}*\n\n` +
            `> \`${m.prefix}cmdvn on\` —Comando vía VN\n` +
            `> \`${m.prefix}cmdvn off\` —Comando a través de text (predeterminado)\n\n` +
            `EzSaat On, enviar VN con un nombre de comandante\n` +
            `•→dispara. menú`
        )
    }

    if (subCmd === 'on') {
        db.setting('cmdVn', true)
        return m.reply(
            `✅ *ᴄᴍᴅ ᴠɴ ᴀᴋᴛɪꜰ*\n\n` +
            `La nota de voz de Kseni contiene un nombre de comandante\n` +
            `• • •\n` +
            `•→dispara. menú`
        )
    }

    if (subCmd === 'off') {
        db.setting('cmdVn', false)
        return m.reply(`❌ CMD VN *desactivado*. Comando via texEs normal.`)
    }

    return m.reply(`❌ Usa \`${m.prefix}cmdvn on\`o\`${m.prefix}cmdvn off\``)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
