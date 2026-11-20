"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
/**
* @ llenar plugins / propietario / público. js
* @ descripción Plugin para habilitar el modo público (todo puede ser actuado )
 */
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'public',
    alias: ['publicmode', 'open'],
    category: 'owner',
    description: 'Modo público habilitado (todos los usuarios pueden ser actuados )',
    usage: '.public',
    example: '.public',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

/**
* Manejador para el mando público
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫*ᴀᴋSᴇSᴅɪᴛᴏʟᴀᴋ*\n\n- ¡Sólo el dueño puede cambiar el bot de modo!');
        }
        const currentMode = _configjs2.default.mode;
        if (currentMode === 'public') {
            return await m.reply('Ya en estado de ánimo público');
        }
        _configjs2.default.mode = 'public';
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        db.setting('botMode', 'public');
        
        const responseText = `🌐 *ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ ᴀᴋᴛɪꜰ*\n\n` +
            `¡Y ahora respondes a todos los usuarios!\n\n` +
            `Uso. auto para cerrar el acceso`;
        await m.reply(responseText);
        console.log(`[Mode] Changed to PUBLIC by ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Public Command Error]', error);
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

/**
* Propietario de validaciones con múltiples cheques
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = _optionalChain([m, 'access', _ => _.sender, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/[^0-9]/g, '')]) || '';
    const ownerNumbers = _optionalChain([_configjs2.default, 'access', _4 => _4.owner, 'optionalAccess', _5 => _5.number]) || [];
    
    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });
    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
