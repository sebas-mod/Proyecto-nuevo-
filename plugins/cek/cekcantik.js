"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekcantik',
    alias: ['cantik', 'beautiful'],
    category: 'cek',
    description: 'Mira qué bonita eres.',
    usage: '.cekcantik <nama>',
    example: '.cekcantik Ani',
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
        desc = 'Cantik banget kayak bidadari! 👸✨'
    } else if (percent >= 70) {
        desc = 'Cantik banget! 💕'
    } else if (percent >= 50) {
        desc = 'Dulce y bonita🌸'
    } else if (percent >= 30) {
        desc = 'Lumayan cantik 😊'
    } else {
        desc = 'Tetep cantik kok! 💖'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
*Tu belleza está actuando*${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel de belleza @${mentioned.split('@')[0]} yak? 
    
Es una mujer alta y hermosa${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
