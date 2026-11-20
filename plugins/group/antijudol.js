"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');

const pluginConfig = {
    name: 'antijudol',
    alias: ['antijudi', 'nojudi', 'antislot'],
    category: 'group',
    description: 'Contenido Detective Juool en grupo',
    usage: '.antijudol <on/off/metode> [kick/remove]',
    example: '.antijudol on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat) || {}
    const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])

    if (!option) {
        const status = groupData.antijudol || 'off'
        const mode = groupData.antijudolMode || 'remove'
        return m.reply(
            `🎰 *ᴀɴᴛɪᴊᴜᴅᴏʟ*\n\n` +
            `> Status: *${status.toUpperCase()}*\n` +
            `> Mode: *${mode.toUpperCase()}*\n\n` +
            `# Detective Content Justul like judi, slots, acor, maxganar, togel, foto de bonificación, enlaces alternativos, y un pequeño pola lindo.\n\n` +
            `> \`${m.prefix}antijudol on\`\n` +
            `> \`${m.prefix}antijudol off\`\n` +
            `> \`${m.prefix}antijudol metode kick\`\n` +
            `> \`${m.prefix}antijudol metode remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antijudol: 'on' })
        return m.reply('✅ *AntiJudol diaktifkan*')
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antijudol: 'off' })
        return m.reply('❌ *AntiJudol dinonaktifkan*')
    }

    if (option.startsWith('metode')) {
        const method = _optionalChain([m, 'access', _6 => _6.args, 'optionalAccess', _7 => _7[1], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()])
        if (method === 'kick') {
            db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'kick' })
            return m.reply('✅ *AntiJudol mode KICK diaktifkan*')
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'remove' })
            return m.reply('✅ *AntiJudol mode DELETE diaktifkan*')
        }
        return m.reply(`❌Método inválido. Usa \`kick\` o \`remove\``)
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'kick' })
        return m.reply('✅ *AntiJudol mode KICK diaktifkan*')
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'remove' })
        return m.reply('✅ *AntiJudol mode DELETE diaktifkan*')
    }

    return m.reply('❌Opción inválida. Usa `on`, `off`, `metode kick` o `metode remove`')
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
