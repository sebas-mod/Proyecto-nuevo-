"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'owner',
    description: 'Configurar el bot modelo ( md / cpanel / tormenta / pushkonak / al )',
    usage: '.botmode <mode>',
    example: '.botmode store',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VALID_MODES = ['md', 'cpanel', 'store', 'pushkontak', 'otp', 'all']

const MODE_DESCRIPTIONS = {
    md: 'Modo predeterminado, todas las características excepto para panel / tormenta / pushkontak',
    cpanel: 'Panel de modo, principal + grupo + pegatina + propietario + herramientas + panel',
    store: 'Manual de almacenamiento de modo, principal + grupo + pegatina + propietario + tormenta',
    pushkontak: 'Modo de pushkongak, principal + grupo + pegatina + propietario + pushkontak',
    otp: 'OTP modo de servicio, principal + grupo + pegatina + propietario + otp',
    all: 'Modo completo, las características de ablución de todos los modos se pueden actuar'
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    
    let mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    const globalMode = db.setting('botMode') || 'all'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupMode = groupData.botMode || null
    
    if (!mode) {
        let txt = `╭┈┈⬡「 🤖 *ʙᴏᴛ ᴍᴏᴅᴇ* 」\n`
        txt += `┃ ㊗ ɢʟᴏʙᴀʟ: *${globalMode.toUpperCase()}*\n`
        
        if (m.isGroup) {
            txt += `┃ ㊗ ɢʀᴜᴘ: *${(groupMode || 'INHERIT').toUpperCase()}*\n`
        }
        txt += `╰┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 📋 *ᴀᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs* 」\n`
        
        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode
        
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡\n\n`
        
        txt += `*ꜰʟᴀɢ sᴛᴏʀᴇ:*\n`
        txt += `> \`${m.prefix}tormenta de botmodas\`- Orden manual\n`
        txt += `> \`${m.prefix}botmode md\` → Mode default\n`
        txt += `> \`${m.prefix}botmode alll\` →Todo función`
        
        await m.reply(txt)
        return
    }

    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *ᴍᴏᴅᴇ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
            `* El modo está disponible: *\`${VALID_MODES.join(', ')}\``
        )
    }

    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botMode: mode
        }

        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                products: _optionalChain([groupData, 'access', _ => _.storeConfig, 'optionalAccess', _2 => _2.products]) || []
            }
        }

        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botMode', mode)
    }

    db.save()
    await m.react('✅')

    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        extraInfo = `\n\n📋♪Modo de Manal♪\nAkemin necesita un manual de conaffción ón de anciano`
    }

    await m.reply(
        `✅ *ᴍᴏᴅᴇ ᴅɪᴜʙᴀʜ*\n\n` +
        `> Mode: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `Este grupo también fue cambiado.` : `*Modo global cambiado.*`)
    )

    console.log(`[BotMode] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}

exports.config = pluginConfig; exports.handler = handler; exports.VALID_MODES = VALID_MODES; exports.MODE_DESCRIPTIONS = MODE_DESCRIPTIONS;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
