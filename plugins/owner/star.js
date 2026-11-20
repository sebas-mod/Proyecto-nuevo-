"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: ['star', 'bintang'],
    alias: [],
    category: 'owner',
    description: 'Agregar / Eliminar estrellas a mensajes',
    usage: '.star (responde a un mensaje) o .star eliminar (responde a un mensaje)',
    example: '.star',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            '⭐ *sᴛᴀʀ ᴍᴇssᴀɢᴇ*\n\n' +
            '•`Estrella.`(responder mensaje)—Da estrella\n' +
            '•`.star elimina`(responder mensaje)—Elimina estrella'
        )
    }

    const unstar = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()]) === 'hapus' || _optionalChain([m, 'access', _5 => _5.args, 'access', _6 => _6[0], 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8()]) === 'unstar'
    const key = m.quoted.key

    try {
        await sock.chatModify({
            star: {
                messages: [{ id: key.id, fromMe: key.fromMe }],
                star: !unstar
            }
        }, m.chat)

        await m.react('⭐')
        return m.reply(
            unstar
                ? '❌* Los flecos se desmontan del mensaje *'
                : '⭐* Mensaje está marcado por las estrellas *'
        )
    } catch (err) {
        return m.reply(`❌Fallido:${err.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
