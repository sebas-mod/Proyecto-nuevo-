"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekjomblo',
    alias: ['jomblo', 'single'],
    category: 'cek',
    description: 'Revisa tu nivel de la culata.',
    usage: '.cekjomblo <nama>',
    example: '.cekjomblo Budi',
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
    if (percent >= 90) desc = 'Jomblo abadi! Single is happiness~ 💔😎'
    else if (percent >= 70) desc = 'Strong independent person! 💪'
    else if (percent >= 50) desc = 'MasihPDKT mode ON 😍'
    else if (percent >= 30) desc = 'Alguien ha estado trabajando en ello ~👀'
    else desc = 'Soon taken! 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de pumloan *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de obsceno${mentioned.split('@')[0]} yak? 
    
Es tan grande como un tomboy${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
