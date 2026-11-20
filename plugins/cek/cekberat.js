"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: 'Cek berat badan random',
    usage: '.cekberat <nama>',
    example: '.cekberat Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const berat = Math.floor(Math.random() * 60) + 40
    const mentioned = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || m.sender
    
    let desc = ''
    if (berat >= 90) {
        desc = 'Big boy/girl! 💪'
    } else if (berat >= 70) {
        desc = 'Berisi dan sehat! 😊'
    } else if (berat >= 55) {
        desc = 'Ideal banget! 👍'
    } else if (berat >= 45) {
        desc = 'Langsing nih~ 🌸'
    } else {
        desc = 'Kurus banget, makan yang banyak! 🍔'
    }
    
    let txt = mentioned === m.sender ? `Hai @${mentioned.split('@')[0]}
    
Berat badan kamu *${berat} kg*
\`\`\`${desc}\`\`\`` : `Kamu ingin ngecek berat badan @${mentioned.split('@')[0]} yak? 
    
Berat badan dia sebesar *${berat} kg*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
