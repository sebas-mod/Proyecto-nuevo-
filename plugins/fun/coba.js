"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'coba',
    alias: ['try'],
    category: 'fun',
    description: 'Intenta le preguntó algo al bot',
    usage: '.coba <pertanyaan>',
    example: '.coba tebak apa yang aku pikirkan',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Bueno, intenté... ¡estabas pensando en comer!',
    'Supongo que no lo estás haciendo.',
    'Pruébame... ¡Pensé que eras feliz!',
    'Bueno, supongo que estás confundido.',
    'Estoy tratando de... ¿estás viendo a alguien?',
    'Supongo que sólo estás acostado.',
    'Supongo que sigues persiguiendo el HP.',
    'Hmm, pasti lagi bosan ya?',
    '¡Trate de que te disparen! ¡Vas a dar un paseo!',
    'Creo que estás de humor para el entretenimiento.',
    '¡Eres tan feliz!',
    '¡Debo tener curiosidad!',
    'Supongo que he vuelto.',
    'Bueno, podrías estar pensando en alguien especial.',
    'Estoy tratando de: ¿Está tratando de hablar?',
    'Estás jugando juegos, supongo!',
    'Bueno, supongo que estás escuchando música.',
    'Intente adivinar... ¡estás en la habitación!',
    'Creo que esperas algo.',
    'Hmm, adivina qué: necesitas un amigo con quien hablar!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`🎯*ᴄᴏʙᴀ*\n\n- Vamos.\n\n*Ejemplo:*\nSí, supongo que estaba pensando.`);
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
