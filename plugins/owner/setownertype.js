"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const pluginConfig = {
    name: 'setownertype',
    alias: ['ownertype', 'ownervariant', 'ownerstyle'],
    category: 'owner',
    description: 'Mengatur variant tampilan owner message',
    usage: '.setownertype',
    example: '.setownertype',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    1: { name: 'Current Design', desc: 'Tampilan default saat ini' },
    2: { name: 'Multiple Contact', desc: 'Kirim contact card semua owner' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    const current = db.setting('ownerType') || 1

    if (variant && /^v?[1-3]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('ownerType', id)
        await db.save()

        await m.reply(
            `✅ Owner type diubah ke *V${id}*\n\n` +
            `> *${VARIANTS[id].name}*\n` +
            `> _${VARIANTS[id].desc}_`
        )
        return
    }

    const buttons = []
    for (const [id, val] of Object.entries(VARIANTS)) {
        const mark = parseInt(id) === current ? ' ✓' : ''
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `V${id}${mark} - ${val.name}`,
                id: `${m.prefix}setownertype v${id}`
            })
        })
    }

    await sock.sendMessage(m.chat, {
        text: `🎨 *sᴇᴛ ᴏᴡɴᴇʀ ᴛʏᴘᴇ*\n\n> Type saat ini: *V${current}*\n> _${VARIANTS[current].name}_\n\n> Pilih variant owner:`,
        footer: _optionalChain([_configjs2.default, 'access', _4 => _4.bot, 'optionalAccess', _5 => _5.name]) || 'Ourin-AI',
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999
        },
        interactiveButtons: buttons
    }, { quoted: m })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
