"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekgamer',
    alias: ['gamer', 'pro'],
    category: 'cek',
    description: 'Mira cuánto tu jugador profesional',
    usage: '.cekgamer <nama>',
    example: '.cekgamer Budi',
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
        desc = 'PRO PLAYER! Esports level! 🏆'
    } else if (percent >= 70) {
        desc = 'Jago banget! 🎮'
    } else if (percent >= 50) {
        desc = 'Lumayan pro 👍'
    } else if (percent >= 30) {
        desc = 'Pobre novio.😅'
    } else {
        desc = 'Mending main masak-masakan 🍳'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu actuación es tan caliente${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar los niveles de alegría${mentioned.split('@')[0]} yak? 
    
Es tan alto como un hombre en su primer momento.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
