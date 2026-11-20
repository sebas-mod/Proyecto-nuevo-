"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how'],
    category: 'fun',
    description: 'Pregunta bot ¿qué tal algo?',
    usage: '.bagaimana <pertanyaan>',
    example: '.bagaimana cara jadi sukses?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Caranya gampang, ya tinggal dilakuin aja!',
    'Hmm, susah dijelasin sih. Coba aja dulu!',
    'Con esfuerzo y pastas de doa.',
    'Ya begitulah caranya.',
    'Aku kurang tau sih, coba cari referensi lain.',
    'Tranquilízate, funcionará más tarde.',
    '¡Con trabajo duro y sin gruñir!',
    'Pertama, percaya sama diri sendiri dulu.',
    'Bueno, no es así.',
    'Ikutin kata hatimu aja.',
    'Una lección de ser experimentado.',
    'Paso a paso, no corra.',
    '¡Con una firme resolución!',
    'Es un poco de comienzo.',
    'Constante, más tarde.',
    '¡No pienses demasiado, acción lunsung!',
    'Gampang! Tinggal mulai aja!',
    'Caranya? Ya dicoba dulu!',
    'Con la estrategia correcta.',
    'Bueno, todavía estoy aprendiendo, también.'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`📋*ʙᴀɢᴀɪᴍᴀɴᴀ*\n\n¡Disfruta de la pregunta!\n\n*Ejemplo:*\nSí. ¿Cómo lo haces funcionar?`);
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
