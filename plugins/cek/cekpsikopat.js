"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekpsikopat',
    alias: ['psikopat', 'psycho'],
    category: 'cek',
    description: 'Mira cómo eres psicopata.',
    usage: '.cekpsikopat <nama>',
    example: '.cekpsikopat Budi',
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
        desc = 'PSIKOPAT AKUT! Jauhi! 😈'
    } else if (percent >= 70) {
        desc = 'Cuidado con este tipo.👀'
    } else if (percent >= 50) {
        desc = 'Ada sisi gelapnya 🌑'
    } else if (percent >= 30) {
        desc = 'Sedikit misterius 🤔'
    } else {
        desc = 'Moral y amable.😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel psicótico *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel psicótico @${mentioned.split('@')[0]} yak? 
    
Nivel kepsikopatan el sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
