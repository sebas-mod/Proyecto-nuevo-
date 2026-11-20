"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekkpopers',
    alias: ['kpopers', 'kpop'],
    category: 'cek',
    description: 'Compruebe su nivel de kpopers',
    usage: '.cekkpopers <nama>',
    example: '.cekkpopers Budi',
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
    if (percent >= 90) desc = 'ARMY/BLINK level max! 💜💗'
    else if (percent >= 70) desc = 'Stan berat nih! 🎤'
    else if (percent >= 50) desc = 'Casual listener~ 🎵'
    else if (percent >= 30) desc = 'Tau dikit-dikit aja 😅'
    else desc = 'Bukan kpopers 🤷'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Califica tu onda *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de estreno @${mentioned.split('@')[0]} yak? 
    
Nivel kekpopersan el sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
