"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'rate',
    alias: ['nilai', 'rating'],
    category: 'fun',
    description: 'El robot tiene algo en él.',
    usage: '.rate <sesuatu>',
    example: '.rate wajahku',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: 'Sempurna! Nggak ada duanya!' },
    { score: '9/10', comment: 'Hampir sempurna! Keren banget!' },
    { score: '8/10', comment: 'Bagus banget! Mantap!' },
    { score: '7/10', comment: 'Cukup bagus, di atas rata-rata!' },
    { score: '6/10', comment: 'Lumayan, podría ser mejor.' },
    { score: '5/10', comment: 'Biasa aja sih, standar.' },
    { score: '4/10', comment: 'Hmm, kurang sedikit.' },
    { score: '3/10', comment: 'Perlu banyak perbaikan.' },
    { score: '2/10', comment: 'Ouch, está lejos de ser bueno.' },
    { score: '1/10', comment: 'Lo siento, pero esto es una olla.' },
    { score: '100/10', comment: 'LEGEND! Beyond perfect!' },
    { score: '11/10', comment: 'Melebihi ekspektasi!' },
    { score: '69/100', comment: 'Nice...' },
    { score: '420/10', comment: 'BLAZING!' },
    { score: '∞/10', comment: 'Gacor kang' },
    { score: '7.5/10', comment: 'Solid! Good job!' },
    { score: '8.5/10', comment: 'Impressive!' },
    { score: '9.5/10', comment: 'Near perfection!' },
    { score: '-1/10', comment: 'No sé qué decir.' },
    { score: '???/10', comment: 'Error 404: Rating not found.' }
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`⭐*ʀᴀᴛᴇ*\n\n¡Esto es algo para afilar!\n\n*Ejemplo:*\nDios mío. ¡Calta mi cara!`);
    }
    
    const rating = ratings[Math.floor(Math.random() * ratings.length)];
    
    await m.reply(`Valoración de mí: *${rating.score}*
${rating.comment}`);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
