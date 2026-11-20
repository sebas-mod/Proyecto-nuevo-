"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'aktifaudiomenu',
    alias: ['audiomenu', 'setaudiomenu', 'toggleaudiomenu'],
    category: 'owner',
    description: 'Toggle audio mientras muestra el menú',
    usage: '.aktifaudiomenu ya/gak',
    example: '.aktifaudiomenu ya',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *ᴀᴜᴅɪᴏ ᴍᴇɴᴜ sᴇᴛᴛɪɴɢ*\n\n` +
            `> Status: *${current ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `*Como usarlo:*\n` +
            `> \`${m.prefix}aktifaudiomenu ya\`- Activar los audios.\n` +
            `> \`${m.prefix}aktifaudiomenu gak\`- Desactivar los audios.`
        )
    }

    if (option === 'ya' || option === 'on' || option === '1' || option === 'aktif') {
        if (current) {
            return m.reply(`⚠¡El menú Audio está encendido!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`✅¡El menú de audio está habilitado!\n\nAhora cuando hay una axila\`. menú\`El público aparecerá.`)
    }

    if (option === 'gak' || option === 'off' || option === '0' || option === 'nonaktif') {
        if (!current) {
            return m.reply(`⚠¡El menú Audio está fuera de la línea @-@!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`❌¡El menú de audio está deshabilitado!\n\n> Ahora\`. menú\`No habrá audiencia.`)
    }

    return m.reply(`❌¡Opsi inválido!\n\nUsa:\`si\`o\`Gak\``)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
