"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekwibu',
    alias: ['wibu', 'weeb'],
    category: 'cek',
    description: 'Mira tu por qué demu',
    usage: '.cekwibu <nama>',
    example: '.cekwibu Budi',
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
        desc = '¡OTAKU DE VERDAD! Ara ara~ 🎌'
    } else if (percent >= 70) {
        desc = 'Otaku total, qué nivel~ 😍'
    } else if (percent >= 50) {
        desc = 'Bastante otaku 🌸'
    } else if (percent >= 30) {
        desc = 'Un poco otaku 😊'
    } else {
        desc = 'No eres otaku, eres normal 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Su nivel de otaku es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres ver el nivel de otaku de @${mentioned.split('@')[0]}? 
    
Su nivel de otaku es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
