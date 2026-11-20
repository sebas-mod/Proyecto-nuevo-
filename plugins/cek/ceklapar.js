"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'ceklapar',
    alias: ['lapar', 'hungry'],
    category: 'cek',
    description: 'Mira tu nivel de hambre.',
    usage: '.ceklapar <nama>',
    example: '.ceklapar Budi',
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
    if (percent >= 90) desc = '¡Come ahora!🍔🍕🍜'
    else if (percent >= 70) desc = 'Perut keroncongan~ 😋'
    else if (percent >= 50) desc = 'Sólo come algo de pan.🍿'
    else if (percent >= 30) desc = 'Aún kenyang😊'
    else desc = 'Kekenyangan! 🤰'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de hambre${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar el nivel de la prisión${mentioned.split('@')[0]} yak? 
    
Es tan grande como un parías.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
