"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekbucin',
    alias: ['bucin'],
    category: 'cek',
    description: 'Comprueba la dificultad que te ha costado.',
    usage: '.cekbucin <nama>',
    example: '.cekbucin Budi',
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
        desc = 'BUCIN AKUT! Udah gabisa diselamatkan 😭💔'
    } else if (percent >= 70) {
        desc = 'Bucin parah nih~ 🥺'
    } else if (percent >= 50) {
        desc = 'Lumayan bucin 💕'
    } else if (percent >= 30) {
        desc = 'Sedikit bucin 😊'
    } else {
        desc = 'Santai aja, gak bucin 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tus malos modales${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar los malos niveles${mentioned.split('@')[0]} yak? 
    
Nivel kebucinan el sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
