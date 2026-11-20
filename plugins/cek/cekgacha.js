"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekgacha',
    alias: ['gacha', 'luck'],
    category: 'cek',
    description: 'Mira tu gacha de hockey',
    usage: '.cekgacha <nama>',
    example: '.cekgacha Budi',
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
    if (percent >= 90) desc = 'HOKI PARAH! SSR GUARANTEED! ✨💎'
    else if (percent >= 70) desc = 'Lucky! Pasti dapet SR keatas! 🍀'
    else if (percent >= 50) desc = 'Hoki-hoki dikit 😊'
    else if (percent >= 30) desc = 'Hmm... pray harder! 🙏'
    else desc = 'SIAL! Nanti aja gachanya! 💔'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de gibberish${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de chatter${mentioned.split('@')[0]} yak? 
    
Es tan grande como un aumento.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
