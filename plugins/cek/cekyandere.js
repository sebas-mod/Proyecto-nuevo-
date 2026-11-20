"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekyandere',
    alias: ['yandere'],
    category: 'cek',
    description: 'Revisa tus niveles de yandere.',
    usage: '.cekyandere <nama>',
    example: '.cekyandere Budi',
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
    if (percent >= 90) desc = 'Eres mía para siempre ~🔪💕'
    else if (percent >= 70) desc = 'No se acerque a él.👁♪'
    else if (percent >= 50) desc = 'Overprotective sedikit~ 🫂'
    else if (percent >= 30) desc = 'Agak posesif 😅'
    else desc = 'Normal kok, santai~ 😊'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de keyanderean *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar el nivel keyanderean @${mentioned.split('@')[0]} yak? 
    
El nivel de Keyanderean es tan grande${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
