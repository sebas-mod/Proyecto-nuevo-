"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'ganti-namabot',
    alias: ['setnamabot', 'setnamebot', 'gantibot'],
    category: 'owner',
    description: 'Cambia nombre bot en config.',
    usage: '.ganti-namabot <nama baru>',
    example: '.ganti-namabot Al Miku MD',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, config }) {
    const newName = m.args.join(' ')
    
    if (!newName) {
        return m.reply(`🤖*ɢᴀɴᴛɪ ɴᴀᴍᴀ ʙᴏᴛ*\n\nNombre actual: *${_optionalChain([config, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || '-'}*\n\n*Uso:*\n\`${m.prefix}ganti-namabot<nama baru>\``)
    }
    
    try {
        const configPath = _path2.default.join(process.cwd(), 'config.js')
        let configContent = _fs2.default.readFileSync(configPath, 'utf8')
        
        configContent = configContent.replace(
            /bot:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
            (match, oldName) => match.replace(`'${oldName}'`, `'${newName}'`).replace(`"${oldName}"`, `'${newName}'`)
        )
        
        _fs2.default.writeFileSync(configPath, configContent)
        
        config.bot.name = newName
        
        m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nEl nombre del bot cambió a: *${newName}*`)
        
    } catch (error) {
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
