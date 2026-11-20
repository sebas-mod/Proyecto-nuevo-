"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'akankah',
    alias: ['akan', 'will'],
    category: 'fun',
    description: 'Pregunta bot tendría que haber pasado algo',
    usage: '.akankah <pertanyaan>',
    example: '.akankah aku sukses?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, lo hará!',
    'No, no lo creo.',
    'Tal vez lo haga, tal vez no lo haga.',
    '¡La voluntad de Dios se hace!',
    'Hmm, sulit diprediksi.',
    'Pasti! Yakin saja!',
    'Kayaknya nggak deh.',
    'Ocurrirá si lo intentas.',
    'Suatu saat nanti, pasti.',
    'No, lo siento.',
    '¡Espérame!',
    'Hmm, aku ragu.',
    '¡Cree en el proceso!',
    'Kemungkinannya kecil.',
    '¡Lo haré, estoy seguro!',
    'No, busca otro.',
    'Lo haré, pero tomará tiempo.',
    'InsyaAllah!',
    'Usted es un partido, lo hará.',
    '¡Mercadoá en el nick del tiempo!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`🔮*ᴀᴋᴀɴᴋᴀʜ*\n\n¡Disfruta de la pregunta!\n\n*Ejemplo:*\nLo siento. ¿Lo lograré?`);
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
