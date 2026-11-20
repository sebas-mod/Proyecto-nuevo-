"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'clearsessions',
    alias: ['clearsession', 'delsession', 'delsessions'],
    category: 'owner',
    description: 'Menghapus semua session di storage/sessions/',
    usage: '.clearsessions',
    example: '.clearsessions',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m)  {
    const sessionsPath = _path2.default.join(process.cwd(), 'storage', 'sessions')
    
    if (!_fs2.default.existsSync(sessionsPath)) {
        return m.reply(`❌ Folder sessions tidak ditemukan!`)
    }
    
    await m.react('🗑️')
    
    try {
        const files = _fs2.default.readdirSync(sessionsPath)
        
        if (files.length === 0) {
            return m.reply(`📁 Folder sessions sudah kosong!`)
        }
        
        let deleted = 0
        let skipped = 0
        
        for (const file of files) {
            if (file === 'creds.json') {
                skipped++
                continue
            }
            
            const filePath = _path2.default.join(sessionsPath, file)
            try {
                const stat = _fs2.default.statSync(filePath)
                if (stat.isDirectory()) {
                    _fs2.default.rmSync(filePath, { recursive: true, force: true })
                } else {
                    _fs2.default.unlinkSync(filePath)
                }
                deleted++
            } catch (e) {}
        }
        
        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 🗑️ *ᴄʟᴇᴀʀ sᴇssɪᴏɴs* 」
┃
┃ ㊗ ᴅᴇʟᴇᴛᴇᴅ: *${deleted}* file
┃ ㊗ sᴋɪᴘᴘᴇᴅ: *${skipped}* file
┃ ㊗ ɴᴏᴛᴇ: creds.json tidak dihapus
┃
╰┈┈⬡

> _Session files berhasil dibersihkan!_
> _Restart bot jika diperlukan._`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
