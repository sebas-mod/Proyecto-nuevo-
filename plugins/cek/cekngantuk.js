"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekngantuk',
    alias: ['ngantuk', 'sleepy'],
    category: 'cek',
    description: 'Mira tu culo somnoliento.',
    usage: '.cekngantuk <nama>',
    example: '.cekngantuk Budi',
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
    if (percent >= 90) desc = 'ZZZZZ... Tidur sana! 😴💤'
    else if (percent >= 70) desc = 'Mata 5 watt nih~ 😪'
    else if (percent >= 50) desc = 'Agak ngantuk dikit 🥱'
    else if (percent >= 30) desc = 'Aún fresh!☕'
    else desc = 'Melek banget! Insomnia? 👀'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Su grado de compromiso${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres revisar los niveles caballerosos @${mentioned.split('@')[0]} yak? 
    
Es tan grande como un perro.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
