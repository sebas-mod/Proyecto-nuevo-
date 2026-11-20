"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekgabut',
    alias: ['gabut', 'bored'],
    category: 'cek',
    description: 'Comprueba tu tenacidad',
    usage: '.cekgabut <nama>',
    example: '.cekgabut Budi',
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
    if (percent >= 90) desc = 'Vayamos a la sala de policía.🥱'
    else if (percent >= 70) desc = 'Gabut parah nih! 😴'
    else if (percent >= 50) desc = 'Lumayan gabut 😅'
    else if (percent >= 30) desc = 'Agak sibuk dikit 📝'
    else desc = 'Sibuk banget! Produktif! 💼'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Estás actuando como una loca${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres ver el nivel de fusibles${mentioned.split('@')[0]} yak? 
    
Es tan grande como un hombre con prisa.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
