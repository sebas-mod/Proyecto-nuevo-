"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'benefitpremium',
    alias: ['premiumbenefits', 'premiumfitur', 'benefitprem'],
    category: 'main',
    description: 'Mira la explicación y la lista de especiales Premium',
    usage: '.benefitpremium',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = _ourinpluginsjs.getAllPlugins.call(void 0, )
    const premiumCommands = plugins.filter(p => p.config.isPremium && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of premiumCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${_optionalChain([_configjs2.default, 'access', _ => _.command, 'optionalAccess', _2 => _2.prefix]) || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    const defaultLimit = _optionalChain([_configjs2.default, 'access', _3 => _3.limits, 'optionalAccess', _4 => _4.default]) || 25
    const premiumLimit = _optionalChain([_configjs2.default, 'access', _5 => _5.limits, 'optionalAccess', _6 => _6.premium]) || 100
    
    const message = 
        `⭐ *ᴀᴘᴀ ɪᴛᴜ ᴘʀᴇᴍɪᴜᴍ?*\n\n` +
        `Premium es un usuario pagado que consigue la acci ón en características exclusivas y más beneficios.\n\n` +
        `╭┈┈⬡「 💎 *ᴋᴇᴜɴᴛᴜɴɢᴀɴ ᴘʀᴇᴍɪᴜᴍ* 」\n` +
        `┃ ✦ \`\`\`Limit harian: ${premiumLimit}x (vs ${defaultLimit}xusuario regular )\`\`\`\n` +
        `┃ ✦ \`\`\`La refrigeración es menor\`\`\`\n` +
        `┃ ✦ \`\`\`Acción exclusiva de características\`\`\`\n` +
        `┃ ✦ \`\`\`Prioritas response\`\`\`\n` +
        `┃ ✦ \`\`\`No hay marca de agua en alguna característica\`\`\`\n` +
        `┃ ✦ \`\`\`Support prioritas\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *ᴄᴀʀᴀ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ* 」\n` +
        `┃ \`Premium se adquiere a través de:\`\n` +
        `┃ •El dueño de la llamada bot\n` +
        `┃ • \`\`\`${_optionalChain([_configjs2.default, 'access', _7 => _7.command, 'optionalAccess', _8 => _8.prefix]) || '.'}addprem <nomor> <durasi>\`\`\`\n` +
        `┃ • Ejemplo:.addprem 628xxx30d\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ ᴄᴏᴍᴍᴀɴᴅ ᴘʀᴇᴍɪᴜᴍ* 」\n` +
        `┃ \`Total: ${totalCommands} command\`\n` +
        `┃\n` +
        (totalCommands > 0 
            ? commandList.map(cmd => `┃ ${cmd}`).join('\n')
            : `┃Todos los comandos pueden ser tratados por un usuario regular`) +
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `¿Quieres actualizar?\n${_configjs2.default.owner.number.map(num => `- wa.me/${num}`).join('\n') }`
    
    await m.reply(message)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
