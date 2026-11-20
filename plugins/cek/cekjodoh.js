"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'cekjodoh',
    alias: ['jodoh', 'match'],
    category: 'cek',
    description: 'Cek kecocokan jodoh',
    usage: '.cekjodoh <nama1> & <nama2>',
    example: '.cekjodoh Budi & Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const input = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || ''
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)
    
    if (parts.length < 2) {
        return m.reply(`💕 *ᴄᴇᴋ ᴊᴏᴅᴏʜ*\n\n> Masukkan 2 nama!\n\n> Contoh: ${m.prefix}cekjodoh Budi & Ani`)
    }
    
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = 'Jodoh banget! Langsung nikah aja! 💍'
    } else if (percent >= 70) {
        desc = 'Cocok banget! 💕'
    } else if (percent >= 50) {
        desc = 'Lumayan cocok~ 😊'
    } else if (percent >= 30) {
        desc = 'Hmm, perlu usaha lebih 🤔'
    } else {
        desc = 'Mungkin cari yang lain? 😅'
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tingkat kejodohan kamu *${percent}%*
\`\`\`${desc}\`\`\`` : `Kamu ingin ngecek tingkat kejodohan @${mentioned.split('@')[0]} yak? 
    
Tingkat kejodohan dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
