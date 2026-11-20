"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekoverpower',
    alias: ['overpower', 'op'],
    category: 'cek',
    description: 'Compruebe su nivel de energía',
    usage: '.cekoverpower <nama>',
    example: '.cekoverpower Budi',
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
    if (percent >= 90) desc = 'OVERPOWER BANGET! LEGEND! 👑🔥'
    else if (percent >= 70) desc = 'Kuat banget nih! 💪'
    else if (percent >= 50) desc = 'Lumayan strong~ 😎'
    else if (percent >= 30) desc = 'Biasa aja sih 🤔'
    else desc = 'Es muy malo que necesites practicar.📝'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de sobrepoderamiento *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar el nivel de potencia${mentioned.split('@')[0]} yak? 
    
Nivel keoverpoweran el sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
