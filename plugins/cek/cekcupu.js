"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekcupu',
    alias: ['cupu', 'noob'],
    category: 'cek',
    description: 'Compruebe su nivel excepto',
    usage: '.cekcupu <nama>',
    example: '.cekcupu Budi',
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
    if (percent >= 90) desc = 'CUPU PARAH! NOOB DETECTED! 🤡'
    else if (percent >= 70) desc = 'Misa newbie aquí😅'
    else if (percent >= 50) desc = 'Ya sabes, está bien.🤔'
    else if (percent >= 30) desc = 'Cukup jago! 💪'
    else desc = 'PRO PLAYER! GG! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Su tasa de ahorros *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres echar un vistazo al coño?${mentioned.split('@')[0]} yak? 
    
Tasa excepto que es tan grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
