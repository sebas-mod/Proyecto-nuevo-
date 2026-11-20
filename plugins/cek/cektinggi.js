"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cektinggi',
    alias: ['tinggi', 'tall'],
    category: 'cek',
    description: 'Cek tinggi badan random',
    usage: '.cektinggi <nama>',
    example: '.cektinggi Budi',
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

        const tinggi = Math.floor(Math.random() * 50) + 150
    
    let desc = ''
    if (tinggi >= 190) {
        desc = 'TINGGI BANGET! Model basketball! 🏀'
    } else if (tinggi >= 175) {
        desc = 'Tinggi ideal! 😎'
    } else if (tinggi >= 165) {
        desc = 'Lumayan tinggi 👍'
    } else if (tinggi >= 155) {
        desc = 'Standard kok 🙂'
    } else {
        desc = '¡Qué lindo y lindo!🥺'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
*Para amarte*${tinggi} cm*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar la altura del nivel @${mentioned.split('@')[0]} yak? 
    
Dale una bolsa grande.${tinggi} cm*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
