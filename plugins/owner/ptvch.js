"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'ptvch',
    alias: ['ptvchanel', 'ptvstory'],
    category: 'owner',
    description: 'Kirim video sebagai PTV ke channel',
    usage: '.ptvch (reply video)',
    example: '.ptvch',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let video = null
    
    if (m.quoted && m.quoted.isVideo) {
        try {
            video = await m.quoted.download()
        } catch (e) {
            return m.reply(`❌Stempelldownloads video de citado.`)
        }
    } else if (m.isVideo) {
        try {
            video = await m.download()
        } catch (e) {
            return m.reply(`❌Steenaldownloads video.`)
        }
    }
    
    if (!video) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `*Klido * video * o * video de las ballas * y luego las axilas:\n` +
            `> \`${m.prefix}ptvch\``
        )
    }
    
    const channelId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || '120363404849776664@newsletter'
    
    await m.reply(`🕕 *ᴍᴇɴɢɪʀɪᴍ ᴘᴛᴠ ᴋᴇ ᴄʜᴀɴɴᴇʟ...*`)
    
    try {
        await sock.sendMessage(channelId, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        })
        
        await m.react('✅')
        return m.reply(`✅*ᴜᴋSᴇs ♪\n\n- Así que, es un éxito.`)
        
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
