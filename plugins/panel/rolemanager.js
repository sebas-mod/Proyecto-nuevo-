"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
const ROLES = ['owner', 'ceo', 'reseller']
const allCommands = []

ROLES.forEach(role => {
    _ourinrolescpaneljs.VALID_SERVERS.forEach(ver => {
        allCommands.push(`add${role}${ver}`)
        allCommands.push(`del${role}${ver}`)
        allCommands.push(`list${role}${ver}`)
    })
})

const pluginConfig = {
    name: allCommands,
    alias: [],
    category: 'panel',
    description: 'Kelola propietario / ceo / revendedor por servidor',
    usage: '.addownerv1 @user atau .listceov2',
    example: '.addresellerv1 @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function cleanJid(jid) {
    if (!jid) return null
    if (_ourinlidjs.isLid.call(void 0, jid)) jid = _ourinlidjs.lidToJid.call(void 0, jid)
    return jid.includes('@') ? jid : jid + '@s.whatsapp.net'
}

function getNumber(jid) {
    const clean = cleanJid(jid)
    return clean ? clean.split('@')[0] : null
}

function parseCommand(cmd) {
    const match = cmd.match(/^(add|del|list)(owner|ceo|reseller)(v[1-5])$/i)
    if (!match) return null
    return {
        action: match[1].toLowerCase(),
        role: match[2].toLowerCase(),
        server: match[3].toLowerCase()
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function handler(m, { sock }) {
    const parsed = parseCommand(m.command)
    if (!parsed) {
        return m.reply(`❌El mando no es válido.`)
    }
    
    const { action, role, server } = parsed
    const serverLabel = server.toUpperCase()
    const roleLabel = capitalize(role)
    
    if (action === 'list') {
        const list = _ourinrolescpaneljs.listByRole.call(void 0, server, role)
        if (list.length === 0) {
            return m.reply(`📋 *ᴅᴀꜰᴛᴀʀ ${roleLabel.toUpperCase()} ${serverLabel}*\n\n*No hay*${role}registrado.`)
        }
        
        let txt = `📋 *ᴅᴀꜰᴛᴀʀ ${roleLabel.toUpperCase()} ${serverLabel}*\n\n`
        txt += `> Total: *${list.length}* ${role}\n\n`
        list.forEach((num, i) => {
            txt += `${i + 1}. \`${num}\`\n`
        })
        txt += `\n> _Role: ${roleLabel}| Servidor:${serverLabel}_`
        return m.reply(txt)
    }
    
    if (!_ourinrolescpaneljs.canManageRole.call(void 0, m.sender, server, role, m.isOwner)) {
        const userRole = _ourinrolescpaneljs.getUserRole.call(void 0, m.sender, server)
        return m.reply(
            `❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*\n\n` +
            `*No puedes manejarlo*${roleLabel}* di *${serverLabel}*\n` +
            `# Role you #${userRole ? capitalize(userRole) : 'Tidak ada'}*\n\n` +
            `Propietario Hei`
        )
    }
    
    let targetUser = null
    if (_optionalChain([m, 'access', _ => _.quoted, 'optionalAccess', _2 => _2.sender])) {
        targetUser = getNumber(m.quoted.sender)
    } else if (_optionalChain([m, 'access', _3 => _3.mentionedJid, 'optionalAccess', _4 => _4.length]) > 0) {
        targetUser = getNumber(m.mentionedJid[0])
    } else if (_optionalChain([m, 'access', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()])) {
        targetUser = m.text.trim().replace(/[^0-9]/g, '')
    }
    
    if (!targetUser) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}${m.command} @user\`\n` +
            `> \`${m.prefix}${m.command} 628xxx\`\n` +
            `Responder mensaje usuario`
        )
    }
    
    if (action === 'add') {
        const result = _ourinrolescpaneljs.addRole.call(void 0, targetUser, server, role)
        if (!result.success) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.error}`)
        }
        
        m.react('✅')
        return m.reply(
            `✅ *${roleLabel.toUpperCase()} ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 📱 ɴᴏᴍᴏʀ: \`${targetUser}\`\n` +
            `┃ 🏷️ ʀᴏʟᴇ: \`${roleLabel}\`\n` +
            `┃ 🖥️ sᴇʀᴠᴇʀ: \`${serverLabel}\`\n` +
            `┃ 📊 ᴛᴏᴛᴀʟ: \`${_ourinrolescpaneljs.listByRole.call(void 0, server, role).length}\` ${role}\n` +
            `╰┈┈⬡`
        )
    }
    
    if (action === 'del') {
        const result = _ourinrolescpaneljs.removeRole.call(void 0, targetUser, server, role)
        if (!result.success) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.error}`)
        }
        
        m.react('✅')
        return m.reply(
            `✅ *${roleLabel.toUpperCase()} ᴅɪʜᴀᴘᴜs*\n\n` +
            `> Número:\`${targetUser}\`\n` +
            `♪ Servidor: ♪${serverLabel}*\n` +
            `> Total: *${_ourinrolescpaneljs.listByRole.call(void 0, server, role).length}* ${role}`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
