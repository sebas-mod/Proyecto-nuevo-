"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'dimana',
    alias: ['where', 'mana'],
    category: 'fun',
    description: 'Tanya bot dimana sesuatu',
    usage: '.dimana <pertanyaan>',
    example: '.dimana jodohku berada?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Di dekatmu!',
    'Jauh di sana.',
    'Di tempat yang tidak kamu duga.',
    'Di hatimu.',
    'Di sekitar sini.',
    'Hmm, coba cari di kamar.',
    'Di luar sana, menunggumu.',
    'Di tempat yang sama denganmu.',
    'Di suatu tempat yang indah.',
    'Di balik pintu.',
    'Di sebelah kirimu.',
    'Di depan matamu!',
    'Jauh banget, di luar negeri mungkin?',
    'Di tempat yang penuh kenangan.',
    'Di mana-mana!',
    'Di dunia maya.',
    'Di alam mimpi.',
    'Di tempat rahasia.',
    'Hmm, susah dijelaskan lokasinya.',
    'Di tempat yang akan membuatmu bahagia.'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`📍 *ᴅɪᴍᴀɴᴀ*\n\n> Masukkan pertanyaan!\n\n*Contoh:*\n> .dimana jodohku berada?`);
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
