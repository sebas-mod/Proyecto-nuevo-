"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekbaik',
    alias: ['baik', 'kind'],
    category: 'cek',
    description: 'Mira lo bueno que eres',
    usage: '.cekbaik <nama>',
    example: '.cekbaik Budi',
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
        desc = '¡Eres la persona más hermosa del mundo!😇✨'
    } else if (percent >= 70) {
        desc = '¡Qué bien y no arrogante!💝'
    } else if (percent >= 50) {
        desc = 'Lumayan baik 😊'
    } else if (percent >= 30) {
        desc = 'Sedikit baik 🙂'
    } else {
        desc = 'Hmm, perlu introspeksi ?? 🤔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tarifa de tipo${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de bondad${mentioned.split('@')[0]} yak? 
    
Es tan bueno como un hombre.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
