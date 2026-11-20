"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuhttpjs = require('../../src/lib/almiku-http.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || 'Milik-Bot-OurinMD'

const pluginConfig = {
    name: 'puisi',
    alias: ['puisiku', 'sajak'],
    category: 'fun',
    description: 'Random puisi Indonesia',
    usage: '.puisi',
    example: '.puisi',
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
        const res = await _almikuhttpjs.f.call(void 0, `https://api.neoxr.eu/api/puisi?apikey=${NEOXR_APIKEY}`)
        
        if (!res.status || !_optionalChain([res, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.text])) {
            m.react('❌')
            return m.reply(`❌La catorcea toma el poema`)
        }
        
        const text = res.data.text
        await m.reply(text)
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
