"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'sampah',
    alias: ['clearsampah', 'cleartemp', 'deltemp'],
    category: 'owner',
    description: 'Menghapus semua sampah di temp',
    usage: '.sampah',
    example: '.sampah',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const tempPath = _path2.default.join(process.cwd(), 'temp')

    if (!_fs2.default.existsSync(tempPath)) {
        return m.reply('❌¡Torreta de la flor no encontrada!')
    }

    await m.react('🗑️')

    try {
        const files = _fs2.default.readdirSync(tempPath)

        if (!files.length) {
            return m.reply('📁¡La tempestad de la carpeta está vacía!')
        }

        let deleted = 0

        for (const file of files) {
            const filePath = _path2.default.join(tempPath, file)

            _fs2.default.rmSync(filePath, { recursive: true, force: true })
            deleted++
        }

        await m.react('✅')
        await m.reply(
            `🗑️ *TEMP CLEANED!*\n\n` +
            `* Total archivo / carpeta diupus:*${deleted}*`
        )

    } catch (error) {
        await m.react('☢')
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
