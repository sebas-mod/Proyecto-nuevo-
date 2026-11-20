"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'savedb',
    alias: ['backupdb', 'downloaddb', 'getdb'],
    category: 'owner',
    description: 'Download file database',
    usage: '.savedb',
    example: '.savedb',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}
async function handler(m, { sock }) {
    if (!_configjs2.default.isOwner(m.sender)) {
        return m.reply('❌*Propietario Only!*')
    }
    const dbPath = _path2.default.join(process.cwd(), 'database', 'db.json')
    if (!_fs2.default.existsSync(dbPath)) {
        return m.reply(`❌¡No se encuentra la base de datos de archivos!`)
    }
    try {
        const stats = _fs2.default.statSync(dbPath)
        const data = _fs2.default.readFileSync(dbPath)
        const now = _momenttimezone2.default.call(void 0, ).tz('America/Argentina/Buenos_Aires')
        const timestamp = now.format('YYYY-MM-DD_HH-mm-ss')
        const fileName = `db_backup_${timestamp}.json`
        await sock.sendMessage(m.chat, {
            document: data,
            fileName: fileName,
            mimetype: 'application/json',
            caption: `📦 *ᴅᴀᴛᴀʙᴀsᴇ ʙᴀᴄᴋᴜᴘ*\n\n` +
                `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
                `┃ 📁Archivo:\`Db. json\`\n` +
                `┃ 📊 Size: \`${(stats.size / 1024).toFixed(2)} KB\`\n` +
                `┃ 📅 Date: \`${now.format('DD/MM/YYYY')}\`\n` +
                `┃ ⏰ Time: \`${now.format('HH:mm:ss')}\`\n` +
                `╰┈┈┈┈┈┈┈┈⬡`
        }, { quoted: m })
    } catch (error) {
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}
exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
