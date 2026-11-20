"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekkarma',
    alias: ['karma'],
    category: 'cek',
    description: 'Revisa tu tarifa.',
    usage: '.cekkarma <nama>',
    example: '.cekkarma Budi',
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
    if (percent >= 80) desc = 'Karma baik! Surga menantimu~ ✨'
    else if (percent >= 60) desc = 'Cukup baik, terus tingkatkan! 🙏'
    else if (percent >= 40) desc = 'Netral, perbanyak kebaikan~ ⚖️'
    else if (percent >= 20) desc = '¡Cuidado con el karma malo!⚠'
    else desc = 'Uy, te hace falta mucha redención... 😱'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu rango personal.${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar los niveles de decencia${mentioned.split('@')[0]} yak? 
    
Es tan bueno como un hombre en su clase.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
