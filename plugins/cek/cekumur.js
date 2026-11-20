"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekumur',
    alias: ['umur', 'age'],
    category: 'cek',
    description: 'Cek umur mental kamu',
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
    if (percent >= 60) desc = 'Bijaksana seperti orang tua! 🧓'
    else if (percent >= 40) desc = 'Dewasa dan matang~ 🧑'
    else if (percent >= 20) desc = 'Jiwa muda! 🧒'
    else desc = 'Masih seperti anak kecil~ 👶'
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Tingkat keumuran kamu *${percent}%*
\`\`\`${desc}\`\`\`` : `Kamu ingin ngecek tingkat keumuran @${mentioned.split('@')[0]} yak? 
    
Tingkat keumuran dia sebesar *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
