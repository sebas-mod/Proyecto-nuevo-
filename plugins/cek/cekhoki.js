"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekhoki',
    alias: ['hoki', 'lucky'],
    category: 'cek',
    description: 'Mira cuántos hockey eres.',
    usage: '.cekhoki <nama>',
    example: '.cekhoki Budi',
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
        desc = 'HOKI DEWA! Main gacha pasti menang! 🍀✨'
    } else if (percent >= 70) {
        desc = 'Hoki banget! 🎰'
    } else if (percent >= 50) {
        desc = 'Lumayan hoki 🍀'
    } else if (percent >= 30) {
        desc = 'Sedikit hoki 😊'
    } else {
        desc = 'Sabar ya, lagi apes 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de hipódromo *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de hobby${mentioned.split('@')[0]} yak? 
    
Es tan grande como un pasatiempo.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
