"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'benefitowner',
    alias: ['ownerbenefits', 'ownerfitur'],
    category: 'main',
    description: 'Lihat penjelasan dan daftar fitur khusus Owner',
    usage: '.benefitowner',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = _ourinpluginsjs.getAllPlugins.call(void 0, )
    const ownerCommands = plugins.filter(p => p.config.isOwner && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of ownerCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${_optionalChain([_configjs2.default, 'access', _ => _.command, 'optionalAccess', _2 => _2.prefix]) || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    
    const message = 
    `✦ *ᴀʙᴏᴜᴛ ᴏᴡɴᴇʀ*\n\n` +
        `ᴏᴡɴᴇʀ ᴀᴅᴀʟᴀʜ *ᴘᴇᴍɪʟɪᴋ ʙᴏᴛ* ʏᴀɴɢ ᴍᴇᴍɪʟɪᴋɪ ᴀᴋsᴇs ᴘᴇɴᴜʜ ᴛᴇʀʜᴀᴅᴀᴘ sᴇʟᴜʀᴜʜ ғɪᴛᴜʀ ᴅᴀɴ ᴋᴏɴᴛʀᴏʟ sɪsᴛᴇᴍ.\n\n` +
        `┌───「 ᴏᴡɴᴇʀ ᴘʀɪᴠɪʟᴇɢᴇs 」\n` +
        `├ ᴀᴄᴄᴇss ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs\n` +
        `├ ᴜɴʟɪᴍɪᴛᴇᴅ ʟɪᴍɪᴛ (-1)\n` +
        `├ ᴄᴏᴏʟᴅᴏᴡɴ ʙʏᴘᴀss\n` +
        `├ ғᴜʟʟ sʏsᴛᴇᴍ ᴄᴏɴᴛʀᴏʟ\n` +
        `├ ᴜsᴇʀ & ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ\n` +
        `└ ᴘᴀɴᴇʟ & sᴇʀᴠᴇʀ ᴀᴄᴄᴇss\n\n` +
        `┌───「 ʜᴏᴡ ɪᴛ ᴡᴏʀᴋs 」\n` +
        `├ ᴀᴅᴅ ᴏᴡɴᴇʀ ᴜsɪɴɢ:\n` +
        `├ ${_configjs2.default.command?.prefix || '.'}addowner <nomor>\n` +
        `└ ᴏʀ ᴅɪʀᴇᴄᴛʟʏ ᴠɪᴀ config.js\n\n` +
        `┌───「 ᴏᴡɴᴇʀ ᴄᴏᴍᴍᴀɴᴅs 」\n` +
        `├ ᴛᴏᴛᴀʟ : ${totalCommands} ᴄᴏᴍᴍᴀɴᴅs\n` +
        `│\n` +
        commandList.map(cmd => `├ ${cmd}`).join('\n') +
        `\n└────────────────────\n\n` +
        `✦ ᴄᴏɴᴛᴀᴄᴛ ᴛʜᴇ ᴏᴡɴᴇʀ ᴛᴏ ʀᴇǫᴜᴇsᴛ ᴀᴄᴄᴇss.`
    
    await m.reply(message)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
