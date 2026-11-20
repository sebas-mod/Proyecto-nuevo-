"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekmalas',
    alias: ['malas', 'lazy'],
    category: 'cek',
    description: 'Compruebe su tiempo.',
    usage: '.cekmalas <nama>',
    example: '.cekmalas Budi',
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
        desc = 'SUPER MALAS! Raja rebahan! 🛏️'
    } else if (percent >= 70) {
        desc = 'Malas banget! 😴'
    } else if (percent >= 50) {
        desc = 'Lumayan malas 🥱'
    } else if (percent >= 30) {
        desc = 'Sedikit malas 😊'
    } else {
        desc = 'Rajin banget! 💪'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu clase${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de pereza${mentioned.split('@')[0]} yak? 
    
Su nivel de pereza es tan grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
