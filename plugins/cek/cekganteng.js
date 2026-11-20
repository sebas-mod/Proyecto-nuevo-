"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekganteng',
    alias: ['ganteng', 'handsome'],
    category: 'cek',
    description: 'Compruebe cuánto está mirando.',
    usage: '.cekganteng <nama>',
    example: '.cekganteng Budi',
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
        desc = 'Ganteng maksimal! 😍🔥'
    } else if (percent >= 70) {
        desc = 'Ganteng banget! 😎'
    } else if (percent >= 50) {
        desc = 'Lumayan ganteng~ 👍'
    } else if (percent >= 30) {
        desc = 'Biasa aja sih 😅'
    } else {
        desc = 'Mungkin inner beauty? 🤭'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu duro @-@ en @-@ el nivel @-@ spot${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de ferocidad${mentioned.split('@')[0]} yak? 
    
Es tan alto como un hombre en sus brazos${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
