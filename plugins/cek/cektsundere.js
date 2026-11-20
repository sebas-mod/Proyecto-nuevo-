"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cektsundere',
    alias: ['tsundere'],
    category: 'cek',
    description: 'Revisa tus niveles de trusca',
    usage: '.cektsundere <nama>',
    example: '.cektsundere Budi',
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
    if (percent >= 90) desc = 'B @-@ don \'t mean I love it!😤💢'
    else if (percent >= 70) desc = '¡No me malinterpretes!😳'
    else if (percent >= 50) desc = 'Y @-@ yah!👉👈'
    else if (percent >= 30) desc = 'Agak tsundere dikit~ 😊'
    else desc = 'Bukan tsundere, jujur aja kok 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel bajo @-@ *${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres comprobar el nivel de inseguridad${mentioned.split('@')[0]} yak? 
    
Es tan grande como una dingleberry.${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
