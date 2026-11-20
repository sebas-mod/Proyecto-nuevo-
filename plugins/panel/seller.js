"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _botmodejs = require('../group/botmode.js');
const pluginConfig = {
    name: 'addseller',
    alias: ['addreseller', 'delseller', 'delreseller', 'listseller', 'listreseller'],
    category: 'panel',
    description: 'Kelola seller/reseller panel',
    usage: '.addseller @user atau .delseller @user',
    example: '.addseller @user',
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

function getLegacyData() {
    const p = _path2.default.join(process.cwd(), 'database', 'cpanel', 'legacy_sellers.json')
    if (_fs2.default.existsSync(p)) {
        try { return JSON.parse(_fs2.default.readFileSync(p, 'utf8')) } catch (e2) { return { sellers: [], ownerPanels: [] } }
    }
    return { sellers: [], ownerPanels: [] }
}

function saveLegacyData(data) {
    try {
        const dir = _path2.default.join(process.cwd(), 'database', 'cpanel')
        if (!_fs2.default.existsSync(dir)) _fs2.default.mkdirSync(dir, { recursive: true })
        const p = _path2.default.join(dir, 'legacy_sellers.json')
        _fs2.default.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8')
        return true
    } catch (e) {
        console.error('[Panel] Failed to save legacy data:', e.message)
        return false
    }
}

function hasAccess(senderJid, isOwner, legacyData) {
    if (isOwner) return true
    const cleanSender = _optionalChain([cleanJid, 'call', _ => _(senderJid), 'optionalAccess', _2 => _2.split, 'call', _3 => _3('@'), 'access', _4 => _4[0]])
    if (!cleanSender) return false
    const ownerPanels = _optionalChain([legacyData, 'optionalAccess', _5 => _5.ownerPanels]) || []
    return ownerPanels.includes(cleanSender)
}

function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const cmd = m.command.toLowerCase()
    
    let legacyData = getLegacyData()
    if (_configjs2.default.pterodactyl) {
        _configjs2.default.pterodactyl.sellers = legacyData.sellers
        _configjs2.default.pterodactyl.ownerPanels = legacyData.ownerPanels
    }
    
    if (!hasAccess(m.sender, m.isOwner, legacyData)) {
        return m.reply(`❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*\n\n> Fitur ini hanya untuk Owner atau Owner Panel.`)
    }
    
    if (!legacyData.sellers) {
        legacyData.sellers = []
    }
    
    const isAdd = ['addseller', 'addreseller'].includes(cmd)
    const isDel = ['delseller', 'delreseller'].includes(cmd)
    const isList = ['listseller', 'listreseller'].includes(cmd)
    
    if (isList) {
        if (legacyData.sellers.length === 0) {
            return m.reply(`📋 *ᴅᴀꜰᴛᴀʀ sᴇʟʟᴇʀ/ʀᴇsᴇʟʟᴇʀ*\n\n> Belum ada seller terdaftar.`)
        }
        
        let txt = `📋 *ᴅᴀꜰᴛᴀʀ sᴇʟʟᴇʀ/ʀᴇsᴇʟʟᴇʀ*\n\n`
        txt += `> Total: *${legacyData.sellers.length}* seller\n\n`
        legacyData.sellers.forEach((s, i) => {
            txt += `${i + 1}. \`${s}\`\n`
        })
        txt += `\n> _Seller bisa create server (1gb-10gb v1/v2/v3)_`
        return m.reply(txt)
    }
    
    let targetUser = null
    if (_optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.sender])) {
        targetUser = getNumber(m.quoted.sender)
    } else if (_optionalChain([m, 'access', _8 => _8.mentionedJid, 'optionalAccess', _9 => _9.length]) > 0) {
        targetUser = getNumber(m.mentionedJid[0])
    } else if (_optionalChain([m, 'access', _10 => _10.text, 'optionalAccess', _11 => _11.trim, 'call', _12 => _12()])) {
        targetUser = m.text.trim().replace(/[^0-9]/g, '')
    } else {
        targetUser = getNumber(m.sender)
    }
    
    if (!targetUser) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}${cmd} @user\`\n` +
            `> \`${m.prefix}${cmd} 628xxx\`\n` +
            `> Reply pesan user`
        )
    }
    
    if (isAdd) {
        if (legacyData.sellers.includes(targetUser)) {
            return m.reply(`❌ \`${targetUser}\` sudah menjadi seller.`)
        }
        
        let roleChanged = ''
        const ownerIdx = (legacyData.ownerPanels || []).indexOf(targetUser)
        if (ownerIdx !== -1) {
            legacyData.ownerPanels.splice(ownerIdx, 1)
            roleChanged = `\n> ⚡ Auto-downgrade dari Owner Panel ke Seller`
        }
        
        legacyData.sellers.push(targetUser)
        
        if (saveLegacyData(legacyData)) {
            m.react('✅')
            return m.reply(
                `✅ *sᴇʟʟᴇʀ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📱 ɴᴏᴍᴏʀ: \`${targetUser}\`\n` +
                `┃ 🏷️ sᴛᴀᴛᴜs: \`Seller/Reseller\`\n` +
                `┃ 🔓 ᴀᴋsᴇs: \`Create Server (1gb-10gb v1-v3)\`\n` +
                `┃ 📊 ᴛᴏᴛᴀʟ: \`${legacyData.sellers.length}\` seller\n` +
                `╰┈┈⬡${roleChanged}`
            )
        } else {
            return m.reply(`❌ Gagal menyimpan ke database`)
        }
    }
    
    if (isDel) {
        if (!legacyData.sellers.includes(targetUser)) {
            return m.reply(`❌ \`${targetUser}\` bukan seller.`)
        }
        
        legacyData.sellers = legacyData.sellers.filter(s => s !== targetUser)
        
        if (saveLegacyData(legacyData)) {
            m.react('✅')
            return m.reply(
                `✅ *sᴇʟʟᴇʀ ᴅɪʜᴀᴘᴜs*\n\n` +
                `> Nomor: \`${targetUser}\`\n` +
                `> Total: *${legacyData.sellers.length}* seller`
            )
        } else {
            return m.reply(`❌ Gagal menyimpan ke database`)
        }
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
