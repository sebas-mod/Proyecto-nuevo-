"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'fuckmylife',
    alias: ['fml'],
    category: 'fun',
    description: 'Random FML story',
    usage: '.fuckmylife',
    example: '.fuckmylife',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🕕')
    
    try {
        const data = await _ourinhttpjs.f.call(void 0, `https://api.neoxr.eu/api/fml?apikey=${NEOXR_APIKEY}`)
        
        if (!_optionalChain([data, 'optionalAccess', _3 => _3.status]) || !_optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.text])) {
            m.react('❌')
            return m.reply(`❌ Gagal mengambil FML story`)
        }    
        await m.reply(data.data.text)
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
