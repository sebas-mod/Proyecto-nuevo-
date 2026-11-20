"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'mengapa',
    alias: ['kenapa', 'why'],
    category: 'fun',
    description: '¿Por qué lo que pasa?',
    usage: '.mengapa <pertanyaan>',
    example: '.mengapa langit biru?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Porque ya tiene esa mirada.',
    'Bueno, buena pregunta, también.',
    'Porque así es como funciona.',
    'Porque Dios está decidido a hacerlo.',
    'Aku nggak tau, cari di Google aja.',
    'Porque eso es todo.',
    '¿Tal vez sea una coincidencia?',
    'Porque el mundo está lleno de misterio.',
    'Hmm, sulit dijelaskan sih.',
    'Porque el universo trabaja de maneras misteriosas.',
    'También tengo curiosidad, ¿por qué es eso?',
    'Porque las cosas que se supone que deben suceder.',
    'Me temo que tengo una respuesta.',
    'Porque eso es lo único que hay en la vida.',
    'Porque cada cosa tiene sus razones.',
    'Necesito tiempo para pensarlo.',
    'Porque esa es la lógica.',
    'Supongo que es porque tiene que ser.',
    'Porque todo está en el comercio.',
    '¡He estado pensando!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`🤔*ᴍᴇɴɢᴀᴘᴀ*\n\n¡Disfruta de la pregunta!\n\n*Ejemplo:*\n¿Por qué es tan brillante?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
