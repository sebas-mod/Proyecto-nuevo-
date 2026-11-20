"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: 'Pregunta bot debe ser algo',
    usage: '.haruskah <pertanyaan>',
    example: '.haruskah aku menyatakan cinta?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Si, debe!',
    'No usah.',
    'Eres tan mala.',
    '¡Debe Mucho!',
    'Nggak también debería.',
    '¡Crees que necesitas hacerlo!',
    'Pikir dulu baik-baik.',
    'Debe! Ahora!',
    'No, espera un minuto.',
    'Debe, pero ten cuidado.',
    'No, tengo que hacerlo, pero estoy bien.',
    'Wajib!',
    'Hmm, skip aja deh.',
    'Hazlo si estás seguro.',
    'Debe, tu futuro!',
    'No hay necesidad de relajarse.',
    'Go for it!',
    'No tengas tanta prisa, piensa de nuevo.',
    'Claro debe!',
    'Lihat situasinya dulu.'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`⚖ʜᴀʀᴜSᴋᴀʜ*\n\n¡Disfruta de la pregunta!\n\n*Ejemplo:*\nLo siento. ¿Debo decir amor?`);
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
