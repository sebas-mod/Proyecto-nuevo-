"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekkaya',
    alias: ['kaya', 'rich'],
    category: 'cek',
    description: 'Compruebe cuánto está mirando.',
    usage: '.cekkaya <nama>',
    example: '.cekkaya Budi',
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
    let emoji = ''
    if (percent >= 90) {
        desc = 'Sultan! Crazy rich! 💎'
        emoji = '👑'
    } else if (percent >= 70) {
        desc = 'Tajir melintir! 💰'
        emoji = '💎'
    } else if (percent >= 50) {
        desc = 'Lumayan berada 💵'
        emoji = '💰'
    } else if (percent >= 30) {
        desc = 'Sólo ganarse la vida.😊'
        emoji = '💵'
    } else {
        desc = 'Semangat nabung! 🙏'
        emoji = '🪙'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Su alto @-@ ranking.${percent}%*
\`\`\`${desc}\`\`\`` : `Quieres revisar los altos niveles de riqueza${mentioned.split('@')[0]} yak? 
    
Es tan rico como la fama del hombre${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
