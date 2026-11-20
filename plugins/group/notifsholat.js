"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'notifsholat',
    alias: ['notifsolat'],
    category: 'group',
    description: 'Notificaciones de pulverización para este grupo',
    usage: '.notifsholat on/off',
    example: '.notifsholat on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌Sólo el administrador del grupo puede usar está característica`);
    }

    const args = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()]);
    const group = db.getGroup(m.chat) || {};
    const globalDb = _ourindatabasejs.getDatabase.call(void 0, );
    const kotaSetting = globalDb.setting('autoSholatKota') || { nama: 'KOTA JAKARTA' };

    if (!['on', 'off'].includes(args)) {
        const isGlobalActive = globalDb.setting('autoSholat') || false;
        const statusGlobal = isGlobalActive ? '✅ AKTIF' : '❌ NONAKTIF';
        const statusGrup = group.notifSholat !== false ? '✅ AKTIF' : '❌ NONAKTIF';
        
        return m.reply(
            `🕌* REMEMBER SHOLAT *\n\n` +
            `Status Global: *${statusGlobal}* (De Propietario)\n` +
            `Sellos de grupo: *${statusGrup}*\n` +
            `Ubicación: *${kotaSetting.nama}*\n\n` +
            `*Ajustes Grupo:*\n` +
            `• *${m.prefix}# Nada es holac #—Activar notivo en este grupo\n` +
            `• *${m.prefix}notifsholat off* — Desactiva las notificaciones en este grupo\n\n` +
            `*CARA Trabaja:*\n` +
            `1. Envío de mp3 adzan pasado de la entrada de imagen en el momento de la sesión\n` +
            `Siga el verdadero @-@ manejador de tiempo de myquran.\n` +
            `Si el NoACTIF del Personal Global, el grupo no será enviado al personal, incluso si el Grupo del Personal está en la línea.\n` +
            `4.`
        );
    }

    if (args === 'on') {
        group.notifSholat = true;
        db.setGroup(m.chat, group);
        return m.reply(`✅*ɴᴏᴛɪꜰSʜᴏʟᴀᴛ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\nEste Grupo recibirá un recodatorio nocturno @.\n- Ubicación:${kotaSetting.nama}`);
    }

    if (args === 'off') {
        group.notifSholat = false;
        db.setGroup(m.chat, group);
        return m.reply(`❌ *ɴᴏᴛɪꜰ sʜᴏʟᴀᴛ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*`);
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
