"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekkece',
    alias: ['kece', 'cool'],
    category: 'cek',
    description: 'Mira cuánto te odio.',
    usage: '.cekkece <nama>',
    example: '.cekkece Budi',
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
        desc = 'KECE BADAI! 😎🔥'
    } else if (percent >= 70) {
        desc = 'Kece banget! ✨'
    } else if (percent >= 50) {
        desc = 'Lumayan kece~ 👍'
    } else if (percent >= 30) {
        desc = 'Sedikit kece 😊'
    } else {
        desc = 'Es normal, pero sigue siendo genial!🙂'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Nivele su decepción *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de decepción${mentioned.split('@')[0]} yak? 
    
Tasa de su decepción como grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
