"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'ceksisaumur',
    alias: ['sisaumur', 'umur'],
    category: 'cek',
    description: 'Revisa tu sutura habitual',
    usage: '.ceksisaumur <nama>',
    example: '.ceksisaumur Budi',
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

        
    const tahun = Math.floor(Math.random() * 80) + 20
    const bulan = Math.floor(Math.random() * 12)
    const hari = Math.floor(Math.random() * 30)
    
    let desc = ''
    if (tahun > 80) {
        desc = 'Panjang umur banget! 🎉'
    } else if (tahun > 60) {
        desc = 'Lumayan panjang~ ✨'
    } else if (tahun > 40) {
        desc = 'Descansa.😊'
    } else {
        desc = 'Jaga kesehatan ya! 🙏'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Eres tan viejo.${tahun}Año${bulan}Mes${hari}El*
\`\`\`${desc}\`\`\`` : `Quieres revisar el nivel de ansiedad${mentioned.split('@')[0]} yak? 
    
El mismo viejo que él${tahun}Año${bulan}Mes${hari}El*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
