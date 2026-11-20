"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'kapan',
    alias: ['when'],
    category: 'fun',
    description: 'Tanya bot kapan sesuatu',
    usage: '.kapan <pertanyaan>',
    example: '.kapan aku nikah?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Besok mungkin?',
    'Tahun depan kayaknya.',
    '3 hari lagi!',
    'Hmm, masih lama sih.',
    'Sebentar lagi kok!',
    'Kalau sudah waktunya, pasti terjadi.',
    'Bulan depan!',
    'Entah kapan, yang penting sabar.',
    'Dalam waktu dekat!',
    '10 tahun lagi mungkin?',
    'Nggak lama lagi!',
    'Kalau jodoh, pasti ketemu.',
    'Hmm, susah diprediksi.',
    'Minggu depan!',
    'Kalau usahanya lebih keras, lebih cepat!',
    'Pas waktunya tepat.',
    'Secepatnya, tenang aja.',
    'Ntar kalo udah siap.',
    'Dalam hitungan hari!',
    'Saat kamu sudah siap menerimanya.'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`⏰ *ᴋᴀᴘᴀɴ*\n\n> Masukkan pertanyaan!\n\n*Contoh:*\n> .kapan aku nikah?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
