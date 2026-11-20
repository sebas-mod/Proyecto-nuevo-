"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'antisticker',
    alias: ['as', 'nosticker'],
    category: 'group',
    description: 'Maneja antiadherentes en grupo',
    usage: '.antisticker <on/off>',
    example: '.antisticker on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antisticker: '⚠ *AntiSticker* — Se eliminó un sticker de @%user%.',
    }
    let text = _optionalChain([_configjs2.default, 'access', _ => _.groupProtection, 'optionalAccess', _2 => _2[key]]) || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function checkAntisticker(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antisticker) return false

    const isSticker = m.isSticker || m.type === 'stickerMessage'
    if (!isSticker) return false

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch (e) {}

    await sock.sendMessage(m.chat, {
        text: gpMsg('antisticker', { user: m.sender.split('@')[0] }),
        mentions: [m.sender],
    })

    return true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const action = _optionalChain([(m.args || []), 'access', _3 => _3[0], 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()])
    const groupData = db.getGroup(m.chat) || {}

    if (!action) {
        const status = groupData.antisticker ? '✅ ON' : '❌ OFF'
        await m.reply(`🎭 *AntiSticker*\n\n> Status: *${status}*\n\n> \`.antisticker on/off\``)
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { antisticker: true })
        m.react('✅')
        await m.reply(`✅*AntiSticker activado*`)
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { antisticker: false })
        m.react('❌')
        await m.reply(`❌*AntiSticker desactivado*`)
        return
    }

    await m.reply(`❌Usa\`- Antiadherentes en.\`o\`- Antiadherentes apagados.\``)
}

exports.config = pluginConfig; exports.handler = handler; exports.checkAntisticker = checkAntisticker;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
