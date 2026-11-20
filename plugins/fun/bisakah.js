"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'bisakah',
    alias: ['bisa'],
    category: 'fun',
    description: 'Tanya bot bisakah sesuatu',
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
    'Bisa banget! Percaya diri aja!',
    'Hmm, kayaknya susah deh.',
    'Tentu bisa! Semangat!',
    'Nggak bisa, maaf.',
    'Mungkin bisa, kalau usaha keras.',
    'Pasti bisa! Jangan menyerah!',
    'Agak susah sih, tapi bisa dicoba.',
    'Bisa kok! Yakin deh!',
    'Kayaknya nggak deh.',
    'Bisa! Ayo buktikan!',
    'Hmm... aku ragu.',
    'Bisa banget! Gas terus!',
    'Nggak bisa, coba yang lain.',
    'Bisa! Percaya sama diri sendiri!',
    'Susah, tapi bukan berarti nggak mungkin.',
    'Absolutely! Kamu pasti bisa!',
    'Kayaknya perlu usaha ekstra nih.',
    'Bisa! Jangan ragukan dirimu!',
    'Hmm, coba lagi nanti deh.',
    'Bisa! Aku percaya kamu!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`💪 *ʙɪsᴀᴋᴀʜ*\n\n> Masukkan pertanyaan!\n\n*Contoh:*\n> .bisakah aku lulus ujian?`);
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
