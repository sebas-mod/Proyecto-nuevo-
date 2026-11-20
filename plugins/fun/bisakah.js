"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Pregunta bot puede hacer algo',
    usage: '.bisakah <pertanyaan>',
    example: '.bisakah aku lulus ujian?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Confíe en ti mismo!',
    'Hmm, kayaknya susah deh.',
    '¡Sí, puedes!',
    'No, lo siento.',
    'Tal vez podamos trabajar duro.',
    '¡Puedes hacerlo!',
    'Es difícil, pero vale la pena intentarlo.',
    'No digo que no voy a decirle nada.',
    'Kayaknya nggak deh.',
    '¡Veamos lo que tenemos!',
    'Hmm... aku ragu.',
    '¡El barril del flete!',
    'De ninguna manera, prueba algo más.',
    '¡Créanse en sí mismos!',
    'Es difícil, pero no está destinado a serlo.',
    '¡Por supuesto!',
    'Kayaknya perlu usaha ekstra nih.',
    'Puede, no te preocupes por ti mismo.',
    'Hmm, coba lagi nanti deh.',
    'Puede, ¡te creo!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`💪*ʙɪSᴀᴋᴀʜ*\n\n¡Disfruta de la pregunta!\n\n*Ejemplo:*\n¿Puedo tomar el examen?`);
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
