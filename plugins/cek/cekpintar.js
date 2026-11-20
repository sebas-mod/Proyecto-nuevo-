"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekpintar',
    alias: ['pintar', 'iq', 'smart'],
    category: 'cek',
    description: 'Mira lo inteligente que eres.',
    usage: '.cekpintar <nama>',
    example: '.cekpintar Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const iq = Math.floor(Math.random() * 100) + 70
    
    let desc = ''
    if (iq >= 150) {
        desc = 'JENIUS! Einstein level! 🧠✨'
    } else if (iq >= 130) {
        desc = 'Sangat cerdas! 🎓'
    } else if (iq >= 110) {
        desc = 'Di atas rata-rata! 👍'
    } else if (iq >= 90) {
        desc = 'Normal, rata-rata 😊'
    } else {
        desc = 'Tetap semangat belajar! 📚'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Inteligencia (I)Q*${iq}*
\`\`\`${desc}\`\`\`` : `¿Quieres echar un vistazo a la inteligencia @${mentioned.split('@')[0]} yak? 
    
Inteligencia (I)Q) he 's as big${iq}*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
