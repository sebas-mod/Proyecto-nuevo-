"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: "setaudioallmenu",
    alias: ["setaudioam", "audioallmenu"],
    category: "owner",
    description: "Gestiona audios para todo el menú",
    usage: ".setaudioallmenu <1-4>",
    example: ".setaudioallmenu 1",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const args = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

    if (!args) {
        return m.reply(
            `⚠*El juez del día*\n\n` +
            `Manager Gestor Gaya audio especiales para toda la pantalla de menús.\n\n` +
            `*Uso:*\n` +
            `• *${m.prefix}% s—Nota de voz de PTT con respuesta de un mensaje de asli\n` +
            `• *${m.prefix}*O un 2*—Nota de voz PTT con respuesta encuesta falsa\n` +
            `• *${m.prefix}*O un mundo de menús @-@ tres*—Música de audio regular con respuesta falsa texn\n` +
            `• *${m.prefix}% s—Música de audio regular con respuesta falso troli\n\n` +
            `*Explicación VARIAN:*\n` +
            `- * Variante 1 yup2 * convertirá automáticamente el archivo MP3 en Opus ( Nota de voz ) murni utiliza ffmpeg, tanto como el esquema más natural de la voz original.\n` +
            `- * Variante 3 para 4 * envía un archivo en formato MP3 regular sin conversiones, pero usando faxQUoted el elegante y fresco en la pantalla de chatter.\n\n` +
            `Está vez Todo el menú utiliza la variante: *${db.setting("allmenuAudioStyle") || 1}*`
        );
    }

    const newStyle = parseInt(args);
    if (isNaN(newStyle) || newStyle < 1 || newStyle > 4) {
        return m.reply(`❌*Fallido*\n\nVarios audiovoto debe ser de 1 a 4.\nEjemplo: *${m.prefix}setaudioallmenu 2*`);
    }

    await m.react("🕕");
    db.setting("allmenuAudioStyle", newStyle);
    await m.reply(`✅*Exito*\n\nTodo el audiostyle de menú se ha convertido con éxito a * Variantes${newStyle}Por favor, prueba escribiendo.${m.prefix}allmenu*.`);
    await m.react("✅");
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
