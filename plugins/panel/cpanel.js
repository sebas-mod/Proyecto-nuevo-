"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
const pluginConfig = {
    name: 'cpanel',
    alias: ['panelmenu', 'menupanel'],
    category: 'panel',
    description: 'Panel de menú de Pterodactilo ( v1 - v5 )',
    usage: '.cpanel',
    example: '.cpanel',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const pteroConfig = _configjs2.default.pterodactyl
    const prefix = m.prefix || '.'
    
    const getStatus = (cfg) => (_optionalChain([cfg, 'optionalAccess', _ => _.domain]) && _optionalChain([cfg, 'optionalAccess', _2 => _2.apikey])) ? '✅' : '❌'
    
    const serverStatuses = {
        v1: getStatus(_optionalChain([pteroConfig, 'optionalAccess', _3 => _3.server1])),
        v2: getStatus(_optionalChain([pteroConfig, 'optionalAccess', _4 => _4.server2])),
        v3: getStatus(_optionalChain([pteroConfig, 'optionalAccess', _5 => _5.server3])),
        v4: getStatus(_optionalChain([pteroConfig, 'optionalAccess', _6 => _6.server4])),
        v5: getStatus(_optionalChain([pteroConfig, 'optionalAccess', _7 => _7.server5]))
    }
    
    const userServers = _ourinrolescpaneljs.getAccessibleServers.call(void 0, m.sender)
    const userRoleList = userServers.map(s => `${s.server.toUpperCase()}:${s.role}`).join(', ') || 'No hay'
    
    let txt = `🖥️ *ᴄᴘᴀɴᴇʟ ᴍᴇɴᴜ v2.0*\n\n`
    txt += `> V1: ${serverStatuses.v1} | V2: ${serverStatuses.v2} | V3: ${serverStatuses.v3} | V4: ${serverStatuses.v4} | V5: ${serverStatuses.v5}\n`
    txt += `# Role you #${m.isOwner ? 'Bot Owner' : userRoleList}*\n\n`
    
    txt += `╭─「 📦 *ᴄʀᴇᴀᴛᴇ sᴇʀᴠᴇʀ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}1gb${ver}\` - \`${prefix}10gb${ver}\` | \`${prefix}unli${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 👑 *ᴏᴡɴᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}addowner${ver}\` | \`${prefix}delowner${ver}\` | \`${prefix}listowner${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 🎯 *ᴄᴇᴏ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}addceo${ver}\` | \`${prefix}delceo${ver}\` | \`${prefix}listceo${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 👥 *ʀᴇsᴇʟʟᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}addreseller${ver}\` | \`${prefix}delreseller${ver}\` | \`${prefix}listreseller${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 🔐 *ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}cadmin${ver}\` | \`${prefix}deladmin${ver}\` | \`${prefix}listadmin${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 🖥️ *sᴇʀᴠᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}listserver${ver}\` | \`${prefix}delserver${ver}\` | \`${prefix}serverinfo${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 👤 *ᴜsᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}listuser${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 🏪 *ɢᴄ sᴇʟʟᴇʀ ᴘᴀɴᴇʟ* 」\n`
    for (const ver of _ourinrolescpaneljs.VALID_SERVERS) {
        txt += `┃ \`${prefix}addgcseller${ver}\` | \`${prefix}resetgcseller${ver}\`\n`
    }
    txt += `╰───────────────\n\n`
    
    const doConfig = _configjs2.default.digitalocean || {}
    const doHasToken = doConfig.token ? '✅' : '❌'
    
    txt += `╭─「 🌊 *ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ ᴠᴘs* 」\n`
    txt += `┃ Status: ${doHasToken} Token\n`
    txt += `┃\n`
    txt += `┃ 📦 *ᴄʀᴇᴀᴛᴇ ᴠᴘs:*\n`
    txt += `┃ \`${prefix}vps1g1c\` - 1GB/1CPU\n`
    txt += `┃ \`${prefix}vps2g1c\` - 2GB/1CPU\n`
    txt += `┃ \`${prefix}vps4g2c\` - 4GB/2CPU\n`
    txt += `┃ \`${prefix}vps8g4c\` - 8GB/4CPU\n`
    txt += `┃\n`
    txt += `┃ 🔧 *ᴍᴀɴᴀɢᴇ:*\n`
    txt += `┃ \`${prefix}listvps\` | \`${prefix}cekvps\` | \`${prefix}delvps\` | \`${prefix}sisavps\`\n`
    txt += `┃\n`
    txt += `┃ ⚡ *ᴋᴏɴᴛʀᴏʟ:*\n`
    txt += `┃ \`${prefix}turnon\` | \`${prefix}turnoff\` | \`${prefix}restartvps\`\n`
    txt += `╰───────────────\n\n`
    
    txt += `> _Powered by ${_optionalChain([_configjs2.default, 'access', _8 => _8.info, 'optionalAccess', _9 => _9.website]) || 'OurinAI'}_`
    
    await m.reply(txt)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
