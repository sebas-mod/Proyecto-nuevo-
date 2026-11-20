"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
const CPANEL_DIR = _path2.default.join(process.cwd(), 'database', 'cpanel')
const VALID_SERVERS = ['v1', 'v2', 'v3', 'v4', 'v5']

function ensureDir() {
    if (!_fs2.default.existsSync(CPANEL_DIR)) {
        _fs2.default.mkdirSync(CPANEL_DIR, { recursive: true })
    }
}

function getFilePath(version) {
    return _path2.default.join(CPANEL_DIR, `gcseller_${version}.json`)
}

function loadGcSeller(version) {
    ensureDir()
    const filePath = getFilePath(version)
    if (!_fs2.default.existsSync(filePath)) return null
    try {
        return JSON.parse(_fs2.default.readFileSync(filePath, 'utf8'))
    } catch (e) {
        return null
    }
}

function saveGcSeller(version, groupJid) {
    ensureDir()
    _fs2.default.writeFileSync(getFilePath(version), JSON.stringify(groupJid), 'utf8')
}

function isGcSeller(chatJid, version) {
    if (!_optionalChain([chatJid, 'optionalAccess', _ => _.endsWith, 'call', _2 => _2('@g.us')])) return false
    return loadGcSeller(version) === chatJid
}

function getGcSellerVersion(chatJid) {
    if (!_optionalChain([chatJid, 'optionalAccess', _3 => _3.endsWith, 'call', _4 => _4('@g.us')])) return null
    for (const ver of VALID_SERVERS) {
        if (loadGcSeller(ver) === chatJid) return ver
    }
    return null
}

const allCommands = []
VALID_SERVERS.forEach(ver => {
    allCommands.push(`addgcseller${ver}`, `resetgcseller${ver}`)
})

const pluginConfig = {
    name: allCommands,
    alias: [],
    category: 'panel',
    description: 'Lista grupo como panel de GC Vendedor ( comando de accities crear servatory )',
    usage: '.addgcsellerv1 (di dalam grup)',
    example: '.addgcsellerv1',
    isOwner: true,
    isGroup: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function hasAccess(senderJid, isOwner) {
    if (isOwner) return true
    let jid = senderJid
    if (_ourinlidjs.isLid.call(void 0, jid)) jid = _ourinlidjs.lidToJid.call(void 0, jid)
    const number = _optionalChain([jid, 'optionalAccess', _5 => _5.replace, 'call', _6 => _6(/@.*$/, '')])
    const ownerPanels = _optionalChain([_configjs2.default, 'access', _7 => _7.pterodactyl, 'optionalAccess', _8 => _8.ownerPanels]) || []
    return ownerPanels.includes(number)
}

function parseCommand(cmd) {
    const match = cmd.match(/^(addgcseller|resetgcseller)(v[1-5])$/i)
    if (!match) return null
    return {
        action: match[1].toLowerCase().startsWith('add') ? 'add' : 'reset',
        version: match[2].toLowerCase()
    }
}

function handler(m) {
    const parsed = parseCommand(m.command)
    if (!parsed) return m.reply('❌El mando no es válido.')

    if (!hasAccess(m.sender, m.isOwner)) {
        return m.reply('❌*ᴀᴋSᴇSᴅɪᴛᴏʟᴀᴋ*\n\nEstá cosa de Función es para el Propietario o Panel de Propietario.')
    }

    const { action, version } = parsed
    const serverLabel = version.toUpperCase()

    if (action === 'add') {
        const current = loadGcSeller(version)
        if (current === m.chat) {
            return m.reply(`❌Este grupo ya registrado como GC Vendedor *${serverLabel}*.`)
        }

        saveGcSeller(version, m.chat)
        m.react('✅')

        let txt = `✅ *ɢᴄ sᴇʟʟᴇʀ ${serverLabel} ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n`
        txt += `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n`
        txt += `┃ 🖥️ sᴇʀᴠᴇʀ: \`${serverLabel}\`\n`
        txt += `┃ 👥 ɢʀᴜᴘ: \`${m.groupName || m.chat}\`\n`
        txt += `┃ 🔓 ᴀᴋsᴇs: \`1gb${version}\` - \`10gb${version}\`, \`unli${version}\`\n`
        if (current) {
            txt += `┃ ⚠️ ᴘʀᴇᴠ: \`${current}\`(cambiado)\n`
        }
        txt += `╰┈┈⬡\n\n`
        txt += `Todas estas fotos de grupo ahora pueden crear servidor${serverLabel}.`
        return m.reply(txt)
    }

    if (action === 'reset') {
        const current = loadGcSeller(version)
        if (!current) {
            return m.reply(`❌Sin mencionar un GC Seller registrado a *${serverLabel}*.`)
        }

        saveGcSeller(version, null)
        m.react('✅')
        return m.reply(
            `✅ *ɢᴄ sᴇʟʟᴇʀ ${serverLabel} ᴅɪʀᴇsᴇᴛ*\n\n` +
            `> Grupo:\`${current}\`\n` +
            `♪ Servidor ♪${serverLabel}* ya no conectado a ningún grupo.`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.loadGcSeller = loadGcSeller; exports.saveGcSeller = saveGcSeller; exports.isGcSeller = isGcSeller; exports.getGcSellerVersion = getGcSellerVersion; exports.VALID_SERVERS = VALID_SERVERS;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
