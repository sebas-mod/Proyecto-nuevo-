"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'readmore',
    alias: ['selengkapnya', 'spoiler'],
    category: 'tools',
    description: 'Membuat teks baca selengkapnya (spoiler)',
    usage: '.readmore <text_awal>|<text_akhir>',
    example: '.readmore Hai|Ini adalah pesan rahasia',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

function handler(m, { sock }) {
    const text = m.text;
    
    if (!text) {
        return m.reply(`⚠ Hazlo fácil en mí •x¡T!\nEjemplo:\`${m.prefix}${m.command}Hola, es el texto oculto.\``);
    }
    
    let [l, r] = text.split('|');
    if (!l) l = '';
    if (!r) r = '';
    
    const readmore = String.fromCharCode(8206).repeat(4001);
    
    m.reply(l + readmore + r);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
