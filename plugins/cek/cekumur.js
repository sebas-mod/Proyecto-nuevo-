"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekumur',
    alias: ['umur', 'age'],
    category: 'cek',
    description: 'Comprueba tu tenencia mental',
    usage: '.cekumur <nama>',
    example: '.cekumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 80) + 5
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 60) desc = '¡Esposa como gente vieja!🧓'
    else if (percent >= 40) desc = 'Adulto y maduro ~🧑'
    else if (percent >= 20) desc = 'Jiwa muda! 🧒'
    else desc = 'Pobre como un niño👶'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Nivel de su edad *${percent}%*
\`\`\`${desc}\`\`\`` : `Usted quiere comprobar los niveles del general${mentioned.split('@')[0]} yak? 
    
Es tan alto como un hombre en su vida temprana.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
