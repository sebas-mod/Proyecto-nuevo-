"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const MUSIC_LIST = []
for (let i = 1; i <= 52; i++) {
    MUSIC_LIST.push(`music${i}`)
}

const pluginConfig = {
    name: 'music',
    alias: MUSIC_LIST,
    category: 'media',
    description: 'Koleksi musik 1-65',
    usage: '.music1 sampai .music65',
    example: '.music1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, command }) {
    const musicNum = _optionalChain([m, 'optionalAccess', _ => _.command, 'access', _2 => _2.replace, 'call', _3 => _3('music', '')])
    const num = parseInt(musicNum)
    
    if (isNaN(num) || num < 1 || num > 65) {
        return m.reply(`🎵*ᴍᴜSɪᴄ ᴄᴏʟʟᴇᴄᴛɪᴏɴ*\n\n> Disponible:.music1 -.music65`)
    }
    
    m.react('🕕')
    
    const musicUrl = `https://raw.githubusercontent.com/Rez4-3yz/Music-rd/master/music/music${num}.mp3`
    try {
        await sock.sendMedia(m.chat, musicUrl, null, m, {
            type: 'audio',
            mimetype: 'audio/mpeg',
            ptt: false
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('❌')
        m.reply(`❌*ᴇʀʀᴏʀ*\n\nMusik 's not found or failed to be taken.`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
