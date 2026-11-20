"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'ceksexy',
    alias: ['sexy', 'hot'],
    category: 'cek',
    description: 'Compruebe cuántas vecesxy tu',
    usage: '.ceksexy <nama>',
    example: '.ceksexy Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = 'SEXY ABIS! 🔥🔥🔥'
    } else if (percent >= 70) {
        desc = 'Hot banget! 😏'
    } else if (percent >= 50) {
        desc = 'Lumayan menggoda~ 😊'
    } else if (percent >= 30) {
        desc = 'Biasa aja sih 🙂'
    } else {
        desc = 'Mungkin cute bukan sexy 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Nivel kesexTú${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar el nivelxYan @${mentioned.split('@')[0]} yak? 
    
Nivel kesexY es tan grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
