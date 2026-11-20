"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'haruskah',
    alias: ['harus', 'should'],
    category: 'fun',
    description: 'Tanya bot haruskah sesuatu',
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
    'Ya, harus!',
    'Tidak usah.',
    'Hmm, terserah kamu sih.',
    'Harus banget! Jangan ragu!',
    'Nggak harus juga.',
    'Kalau menurutmu perlu, lakukan!',
    'Pikir dulu baik-baik.',
    'Harus! Sekarang!',
    'Jangan, mending tunggu dulu.',
    'Harus, tapi hati-hati.',
    'Nggak harus, tapi boleh.',
    'Wajib!',
    'Hmm, skip aja deh.',
    'Lakukan kalau sudah yakin.',
    'Harus, demi masa depanmu!',
    'Nggak harus, santai aja.',
    'Go for it!',
    'Jangan buru-buru, pikir lagi.',
    'Tentu harus!',
    'Lihat situasinya dulu.'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`⚖️ *ʜᴀʀᴜsᴋᴀʜ*\n\n> Masukkan pertanyaan!\n\n*Contoh:*\n> .haruskah aku menyatakan cinta?`);
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
