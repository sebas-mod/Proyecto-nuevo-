"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }/**
 * @file plugins/tools/imgtoprompt.js
 * @description Plugin untuk mengubah gambar menjadi prompt AI
 */

var _img2promptjs = require('../../src/scraper/img2prompt.js'); var _img2promptjs2 = _interopRequireDefault(_img2promptjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'imgtoprompt',
    alias: ['img2prompt', 'imagetoprompt', 'i2p'],
    category: 'tools',
    description: 'Mengubah gambar menjadi prompt AI',
    usage: '.imgtoprompt (reply gambar)',
    example: '.imgtoprompt',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const isImage = m.isImage || (m.quoted && m.quoted.isImage);
        if (!isImage) {
            return await m.reply('❌ *ɢᴀᴍʙᴀʀ ᴅɪʙᴜᴛᴜʜᴋᴀɴ*\n\n> Reply atau kirim gambar dengan caption .imgtoprompt');
        }
        
        await m.reply('🕕 *ᴍᴇᴍᴘʀᴏsᴇs ɢᴀᴍʙᴀʀ...*\n\n> Menganalisis gambar untuk menghasilkan prompt');
        let mediaBuffer;
        if (m.isImage && m.download) {
            mediaBuffer = await m.download();
        } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
            mediaBuffer = await m.quoted.download();
        } else {
            return await m.reply('❌ Gagal mengunduh gambar');
        }
        
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            return await m.reply('❌ Buffer gambar tidak valid');
        }
        const tmpDir = _path2.default.join(process.cwd(), 'temp');
        if (!_fs2.default.existsSync(tmpDir)) {
            _fs2.default.mkdirSync(tmpDir, { recursive: true });
        }
        
        const tmpFile = _path2.default.join(tmpDir, `img2prompt_${Date.now()}.webp`);
        _fs2.default.writeFileSync(tmpFile, mediaBuffer);
        const result = await _img2promptjs2.default.call(void 0, tmpFile);
        try {
            _fs2.default.unlinkSync(tmpFile);
        } catch (e) {}
        if (result.status === 'eror' || !result.prompt) {
            return await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.msg || 'Tidak dapat menghasilkan prompt dari gambar ini'}`);
        }
        const responseText = `🎨 *ɪᴍᴀɢᴇ ᴛᴏ ᴘʀᴏᴍᴘᴛ*\n\n` +
            `\`\`\`${result.prompt}\`\`\`\n\n` +
            `> _Generated at: ${result.generatedAt || new Date().toISOString()}_`;
        await m.reply(responseText);
    } catch (error) {
        console.error('[ImgToPrompt Error]', error);
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
