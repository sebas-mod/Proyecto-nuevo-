"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekpelit',
    alias: ['pelit', 'kikir'],
    category: 'cek',
    description: 'Mira tu pelt.',
    usage: '.cekpelit <nama>',
    example: '.cekpelit Budi',
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
        desc = 'SUPER PELIT! Duit dijaga mati-matian! 💸'
    } else if (percent >= 70) {
        desc = 'Pelit banget! 🙊'
    } else if (percent >= 50) {
        desc = 'Lumayan pelit 😅'
    } else if (percent >= 30) {
        desc: 'Sedikit hemat 😊'
    } else {
        desc = 'Dermawan banget! 🎁'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de descuido${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de inseguridad${mentioned.split('@')[0]} yak? 
    
Es tan bajo como la altura de un hombre.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
