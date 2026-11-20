"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekrezeki',
    alias: ['rezeki', 'fortune'],
    category: 'cek',
    description: 'Compruebe el nivel para proporcionarle hoy',
    usage: '.cekrezeki <nama>',
    example: '.cekrezeki Budi',
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
    if (percent >= 90) desc = 'Rezeki melimpah! Jackpot! 💰🎉'
    else if (percent >= 70) desc = 'El rezeki de hoy es tan alto ~💵'
    else if (percent >= 50) desc = 'Rezeki cukup, bersyukurlah 🙏'
    else if (percent >= 30) desc = 'Rezeki pas-pasan 😅'
    else desc = 'Me alegro de que hayas venido.🫂'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Su etapa cambio de imagen *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de la tienda${mentioned.split('@')[0]} yak? 
    
Es tan grande como un remolque.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
