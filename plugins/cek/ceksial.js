"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'ceksial',
    alias: ['sial', 'apes'],
    category: 'cek',
    description: 'Mira lo mal que eres.',
    usage: '.ceksial <nama>',
    example: '.ceksial Budi',
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
        desc = 'SIAL BANGET! Mending di rumah aja! 😭'
    } else if (percent >= 70) {
        desc = 'Lagi apes nih~ 😢'
    } else if (percent >= 50) {
        desc = 'Lumayan sial 😓'
    } else if (percent >= 30) {
        desc = 'Sedikit sial 😕'
    } else {
        desc = 'Gak sial, hoki dong! 🍀'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tus malos modales${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver a los malos.${mentioned.split('@')[0]} yak? 
    
Es tan grande como un mal tipo.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
