"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekjahat',
    alias: ['jahat', 'evil'],
    category: 'cek',
    description: 'Comprueba lo difícil que vas a conseguir.',
    usage: '.cekjahat <nama>',
    example: '.cekjahat Budi',
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
        desc = 'VILLAIN LEVEL! 😈👿'
    } else if (percent >= 70) {
        desc = 'Jahat banget! 💀'
    } else if (percent >= 50) {
        desc = 'Lumayan jahat 😏'
    } else if (percent >= 30) {
        desc = 'Sedikit nakal 😊'
    } else {
        desc = 'Baik kok, gak jahat! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Su tasa de criminalidad *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar el nivel del crimen${mentioned.split('@')[0]} yak? 
    
Es tan grande como un criminal.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
