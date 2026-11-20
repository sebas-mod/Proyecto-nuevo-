"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'peringatan'],
    category: 'group',
    description: 'Memberi peringatan kepada member',
    usage: '.warn @user <alasan>',
    example: '.warn @user spam',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `⚠♪SISTEM WARNING GRUPP♪\n\n` +
            `El hasia de gutión es un fracaso para la foto grupo.\n` +
            `Base de advertencia: *${maxWarns}veces * (Automatización de Kickk )\n\n` +
            `*Uso:*\n` +
            `• *${m.prefix}warn @user <alasan>* — Memberi warning\n` +
            `• *${m.prefix}advierte a mamáx <angka>*—Cambio de límite máximo de advertencia\n` +
            `• *${m.prefix}listwarn *—Ver lista de fotos con problemas\n` +
            `• *${m.prefix}resetwarn @user* —Eliminar todas las fotos de advertencia\n\n` +
            `*Explicación ALUR Uso:*\n` +
            `Uno, la primera vez que haces una brecha, darles SP1:${m.prefix}mensaje de usuario de Spam *\n` +
            `Dos, utilizarán su mensaje como advertencia número uno.\n` +
            `3, si repite el ataque, advertir la próxima vez con una nueva razón:${m.prefix}warn @user Berkata grosero*\n` +
            `4. Si el total de alerta de vídeo alcanza límite máximo (actual *${maxWarns}* ), el bot automanezar el kickk @-@ pistola.\n` +
            `Cinco, la brecha se puede ver completamente escribiendo.${m.prefix}listwarn @user*.`
        )
    }
    if (_optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]) === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(`❌*Fallido*\n\nEl límite de referencia de las advertencias debe ser 1 @-@ 20.\nEjemplo: *${m.prefix}warn max 5*`)
        }
        groupData.maxWarnings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(`✅* Límite WARNING USED*\n\nEl grupo de alerta máxima ha sido actualizado a *${newMax} kali*.`)
    }

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠♪ CARA PACKAI ♪\n\n` +
            `# Responder orden #\`${m.prefix}warn alasan\`\n` +
            `> O:\`${m.prefix}warn @user alasan\``
        )
        return
    }
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => _ourinlidjs.getParticipantJid.call(void 0, p) === targetUser)
        if (_optionalChain([participant, 'optionalAccess', _4 => _4.admin])) {
            await m.reply(`❌No puede dar avangua un administrador grupo.`)
            return
        }
    } catch (e) {}
    
    const botJid = _optionalChain([sock, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.id, 'optionalAccess', _7 => _7.split, 'call', _8 => _8(':'), 'access', _9 => _9[0]]) + '@s.whatsapp.net'
    if (targetUser === botJid) {
        await m.reply(`❌No sah avito, yo dham cuma bot.`)
        return
    }
    
    const reasonArg = m.quoted ? _optionalChain([m, 'access', _10 => _10.text, 'optionalAccess', _11 => _11.trim, 'call', _12 => _12()]) : _optionalChain([m, 'access', _13 => _13.text, 'optionalAccess', _14 => _14.replace, 'call', _15 => _15(/@\d+/g, ''), 'access', _16 => _16.replace, 'call', _17 => _17(/^\s*warn\s*/i, ''), 'access', _18 => _18.trim, 'call', _19 => _19()])
    const reason = reasonArg || 'No hay razón.'
    
    let userWarnings = warnings[targetUser] || []
    userWarnings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })
    
    warnings[targetUser] = userWarnings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    const warnCount = userWarnings.length
    const targetName = targetUser.split('@')[0]
    
    if (warnCount >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
            await m.reply(
                `🚨 *MAX WARNING TERCAPAI*\n\n` +
                `@${targetName}Se ha eliminado del grupo por haber alcanzado el límite de incumplimiento!\n\n` +
                `*Rincian:*\n` +
                `> Warning: *${warnCount}/${maxWarns}*\n` +
                `Última razón: *${reason}*`,
                { mentions: [targetUser] }
            )
            delete warnings[targetUser]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `⚠️ *Advertencia Dado*\n\n` +
            `@${targetName}ha recibido el Carta de Advertencia (SPP${warnCount})!\n\n` +
            `*Rincian:*\n` +
            `> Warning ke: *${warnCount}/${maxWarns}*\n` +
            `Asilo: *${reason}*\n\n` +
            `_${maxWarns - warnCount}advertencia de nuevo = KICCK AUTOMATISS _`,
            { mentions: [targetUser] }
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
