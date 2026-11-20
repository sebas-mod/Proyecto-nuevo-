"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'coba',
    alias: ['try'],
    category: 'fun',
    description: 'Coba tanyakan sesuatu ke bot',
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
    'Hmm, aku coba ya... Kamu lagi mikirin makanan!',
    'Aku tebak... Kamu lagi gabut!',
    'Coba ya... Kayaknya kamu lagi seneng!',
    'Hmm, aku rasa kamu lagi bingung.',
    'Aku coba nebak... Kamu lagi kangen seseorang?',
    'Kayaknya kamu lagi santai deh.',
    'Aku tebak kamu lagi scroll HP terus.',
    'Hmm, pasti lagi bosan ya?',
    'Coba ditebak... Kamu lagi pengen jalan-jalan!',
    'Aku rasa kamu lagi butuh hiburan.',
    'Hmm, kayaknya kamu lagi happy!',
    'Aku coba... Kamu pasti lagi penasaran!',
    'Tebakan aku: kamu lagi rebahan.',
    'Hmm, kamu mungkin lagi mikirin seseorang spesial.',
    'Aku coba: kamu lagi mau curhat?',
    'Kayaknya kamu lagi pengen main game!',
    'Hmm, aku tebak kamu lagi dengerin musik.',
    'Coba aku tebak... Kamu lagi di kamar!',
    'Aku rasa kamu lagi waiting for something.',
    'Hmm, tebakan aku: kamu butuh temen ngobrol!'
];

async function handler(m) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    
    if (!text) {
        return m.reply(`🎯 *ᴄᴏʙᴀ*\n\n> Masukkan sesuatu!\n\n*Contoh:*\n> .coba tebak apa yang aku pikirkan`);
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
