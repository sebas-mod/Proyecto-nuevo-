"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _util = require('util'); var _util2 = _interopRequireDefault(_util);
const pluginConfig = {
    name: 'eval',
    alias: ['$', 'ev', 'evaluate', '=>'],
    category: 'owner',
    description: 'Corre Javazipt ( Propietario Sólo ) código',
    usage: '=> <code> atau .$ <code>',
    example: '=> m.chat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true,
    noPrefix: ['=>'],
    customTrigger: (body) => _optionalChain([body, 'optionalAccess', _ => _.startsWith, 'call', _2 => _2('=>')])
}

async function handler(m, { sock, store }) {
    if (!_configjs2.default.isOwner(m.sender)) {
        return m.reply('❌*Propietario Only!*')
    }

    const code = _optionalChain([m, 'access', _3 => _3.fullArgs, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]) || _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()])

    if (!code) {
        return m.reply(
            `⚙️ *ᴇᴠᴀʟ*\n\n` +
            `¡Pon el código jeriguito!\n\n` +
            `*Ejemplo:*\n` +
            `> .$ 1 + 1\n` +
            `> .$ m.chat\n` +
            `> .$ db.getUser(m.sender)`
        )
    }

    const db = _ourindatabasejs.getDatabase.call(void 0, )

    let result
    let isError = false

    try {
        result = await eval(`(async () => { ${code} })()`)
    } catch (e) {
        isError = true
        result = e
    }

    let output
    if (typeof result === 'undefined') {
        output = 'undefined'
    } else if (result === null) {
        output = 'null'
    } else if (typeof result === 'object') {
        try {
            output = _util2.default.inspect(result, { depth: 2, maxArrayLength: 50 })
        } catch (e2) {
            output = String(result)
        }
    } else {
        output = String(result)
    }

    if (output.length > 3000) {
        output = output.slice(0, 3000) + '\n\n... (truncated)'
    }

    const status = isError ? '❌ Error' : '✅ Success'
    const type = isError ? _optionalChain([result, 'optionalAccess', _9 => _9.name]) || 'Error' : typeof result

    await m.reply(
        `⚙️ *ᴇᴠᴀʟ ʀᴇsᴜʟᴛ*\n\n` +
        `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
        `┃ ${status}\n` +
        `┃ Type: ${type}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `\`\`\`${output}\`\`\``
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
