"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekprocastinator',
    alias: ['procrastinator', 'nunda'],
    category: 'cek',
    description: 'Nivel de comprobación como la pelada',
    usage: '.cekprocastinator <nama>',
    example: '.cekprocastinator Budi',
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
    if (percent >= 90) desc = 'Deadline? Besok aja deh~ 😴'
    else if (percent >= 70) desc = 'Master procrastination! 🦥'
    else if (percent >= 50) desc = 'Kadang nunda, kadang rajin 😅'
    else if (percent >= 30) desc = 'Cukup produktif! 💪'
    else desc = 'Disiplin tinggi! Salut! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de procinstinación *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el proccinador${mentioned.split('@')[0]} yak? 
    
Es tan alto como un procinstinador como un gran${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
