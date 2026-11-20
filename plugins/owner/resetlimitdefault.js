"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'resetlimitdefault',
    alias: ['defaultlimitreset'],
    category: 'owner',
    description: 'Reiniciar el límite predeterminado a asli config',
    usage: '.resetlimitdefault',
    example: '.resetlimitdefault',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const configDefault = _optionalChain([_configjs2.default, 'access', _ => _.limits, 'optionalAccess', _2 => _2.default]) || 25
    
    db.setting('defaultLimit', null)
    
    await m.reply(
        `✅ *ʙᴇʀʜᴀsɪʟ*\n\n` +
        `* Límite predeterminado reajuste a config:\`${configDefault}\`\n` +
        `*Nuevo usuario obtendrá límite de config*`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
