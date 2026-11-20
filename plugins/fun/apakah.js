"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'apakah',
    alias: ['apa'],
    category: 'fun',
    description: 'Pregunta bot es algo',
    usage: '.apakah <pertanyaan>',
    example: '.apakah aku bisa kaya?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Ya, tentu saja!',
    'No, no lo creo.',
    'Mungkin saja, coba lagi nanti.',
    'Hmm... aku rasa iya.',
    'Lo dudo, pero podría ser.',
    'Pasti! 100%!',
    'No quizas.',
    'Entonces, ¿quién sabe?',
    'Menurutku sih iya.',
    'Wah, kayaknya nggak deh.',
    'Claro, ¿por qué no?',
    'No lo sé, prueba otro.',
    '¡Dios mío, tiene que ser!',
    'Parece que no.',
    'Aku yakin iya!',
    'Nggak mungkin banget.',
    'Tal vez, pero no esperes ser demasiado alto.',
    'Iya dong!',
    'No, lo siento.',
    'Puede! Semangat!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`❓*ᴀᴘᴀᴋᴀʜ*\n\n¡Disfruta de la pregunta!\n\n* Elemento: *\nLo siento.¿¿Puedo ser rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
