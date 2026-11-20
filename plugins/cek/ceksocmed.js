"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'ceksocmed',
    alias: ['sosmed', 'medsos'],
    category: 'cek',
    description: 'Cek tingkat kecanduan sosmed',
    usage: '.ceksocmed <nama>',
    example: '.ceksocmed Budi',
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
    if (percent >= 90) desc = 'Kecanduan parah! Detox needed! 📱💀'
    else if (percent >= 70) desc = 'Scroll terus tanpa henti~ 📲'
    else if (percent >= 50) desc = 'Normal usage 👍'
    else if (percent >= 30) desc = 'Cukup sehat nih 🌿'
    else desc = 'Digital detox master! 🧘'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Nivel a su socmedan${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de soja @${mentioned.split('@')[0]} yak? 
    
El nivel de socmedan es tan grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
