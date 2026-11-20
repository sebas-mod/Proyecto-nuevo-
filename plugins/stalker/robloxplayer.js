"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'robloxplayer',
    alias: ['robloxsearch', 'searchroblox', 'robloxfind'],
    category: 'stalker',
    description: 'Search Roblox player by username',
    usage: '.robloxplayer <username>',
    example: '.robloxplayer linkmon',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = _optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])
    
    if (!query) {
        return m.reply(
            `🎮 *ʀᴏʙʟᴏx ᴘʟᴀʏᴇʀ sᴇᴀʀᴄʜ*\n\n` +
            `* Ponga un nombre de usuario a buscar*\n\n` +
            `\`${m.prefix}robloxplayer linkmon\``
        )
    }
    
    m.react('🔍')
    
    try {
        const res = await _axios2.default.get(`https://api.neoxr.eu/api/roblox-search?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`, {
            timeout: 30000
        })
        
        if (!_optionalChain([res, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.status]) || !_optionalChain([res, 'access', _8 => _8.data, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.length])) {
            m.react('❌')
            return m.reply(`❌No se encuentra ningún jugador con nombre de usuario:${query}`)
        }
        
        const players = res.data.data.slice(0, 10)
        
        let text = `🎮 *ʀᴏʙʟᴏx ᴘʟᴀʏᴇʀ sᴇᴀʀᴄʜ*\n\n`
        text += `> Query: \`${query}\`\n`
        text += `*Encontrado*${players.length}* player\n\n`
        
        players.forEach((player, i) => {
            text += `╭┈┈⬡「 ${i + 1}. *${player.displayName}* 」\n`
            text += `┃ 🆔 ID: \`${player.id}\`\n`
            text += `┃ 👤 Username: \`${player.name}\`\n`
            text += `┃ 📛 Display: *${player.displayName}*\n`
            text += `┃ ✅ Verified: ${player.hasVerifiedBadge ? 'Ya' : 'Tidak'}\n`
            if (_optionalChain([player, 'access', _11 => _11.previousUsernames, 'optionalAccess', _12 => _12.length]) > 0) {
                text += `┃ 📜 Previous: ${player.previousUsernames.join(', ')}\n`
            }
            text += `╰┈┈⬡\n\n`
        })
        
        text += `*La pistola será*\`- Robin.xtallo<username>\`para una introducción detallada`
        
        await m.reply(text)
        m.react('✅')
        
    } catch (err) {
        console.error('[RobloxPlayer] Error:', err.message)
        m.react('☢')
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
