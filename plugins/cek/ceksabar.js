"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'ceksabar',
    alias: ['sabar', 'patience'],
    category: 'cek',
    description: 'Compruebe su nivel de paciencia.',
    usage: '.ceksabar <nama>',
    example: '.ceksabar Budi',
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
    if (percent >= 90) desc = 'Sabar level dewa! Zen master~ 🧘'
    else if (percent >= 70) desc = 'Sangat sabar! Terpuji 👏'
    else if (percent >= 50) desc = 'Cukup sabar 😊'
    else if (percent >= 30) desc = 'Kadang emosian dikit 😅'
    else desc = 'Gampang marah nih... 😤'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu paciencia es alta${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de paciencia${mentioned.split('@')[0]} yak? 
    
Es tan impaciente como uno grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
