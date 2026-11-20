"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekintrovert',
    alias: ['introvert'],
    category: 'cek',
    description: 'Compruebe su nivel de introvertido',
    usage: '.cekintrovert <nama>',
    example: '.cekintrovert Budi',
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
    if (percent >= 90) desc = 'Quédate en casa🏠'
    else if (percent >= 70) desc = 'Social battery terbatas 🔋'
    else if (percent >= 50) desc = 'Ambivert, balance~ ⚖️'
    else if (percent >= 30) desc = 'Cukup social butterfly 🦋'
    else desc = 'Extrovert mode ON! 🎉'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa introvertida *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de introvertido${mentioned.split('@')[0]} yak? 
    
Es tan grande como un introvertido.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
