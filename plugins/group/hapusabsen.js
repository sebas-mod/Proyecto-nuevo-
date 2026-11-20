"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'hapusabsen',
    alias: ['deleteabsen', 'tutupabsen', 'closeabsen', 'resetabsen'],
    category: 'group',
    description: 'Elimina / tup sesi absen ( admin solamente )',
    usage: '.hapusabsen',
    example: '.hapusabsen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

if (!global.absensi) global.absensi = {}

async function handler(m) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴀʙsᴇɴ*\n\n` +
            `No hay abseness sesi en este grupo!`
        )
    }
    
    const absen = global.absensi[chatId]
    const totalPeserta = absen.peserta.length
    
    delete global.absensi[chatId]
    
    await m.reply(
        `✅*ABSEN Cerrado!*\n\n` +
        `Penyebab?\n` +
        `📝 ${absen.keterangan}\n` +
        `👥Parte superior de la lista:${totalPeserta}\n\n` +
        `La ausencia de la señal ha sido comprometida.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
