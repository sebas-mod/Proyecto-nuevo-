"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
    name: 'onlythisgrup',
    alias: ['onlythisgroup', 'lockgrup', 'lockgroup'],
    category: 'owner',
    description: 'Para estar activo en este grupo sólo',
    usage: '.onlythisgrup',
    example: '.onlythisgrup',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const db = _almikudatabasejs.getDatabase.call(void 0, )
        const current = db.setting('onlyThisGroup') || null

        if (current && (current === m.chat || current.jid === m.chat)) {
            db.setting('onlyThisGroup', null)
            db.save()
            return m.reply(`🔓* UNLOCKED *\n\nPara volver a la actividad en todos los grupos públicos.`)
        }

        const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net'
        const groupMetadata = await sock.groupMetadata(m.chat).catch(() => null)
        
        if (!groupMetadata) {
            return m.reply(`❌Stemstick consigue un metadato grupo.`)
        }

        const participants = groupMetadata.participants
        const isBotAdmin = _optionalChain([participants, 'access', _ => _.find, 'call', _2 => _2(p => p.id === botNumber), 'optionalAccess', _3 => _3.admin]) !== null

        if (!isBotAdmin) {
            return m.reply(`❌* Cumplimiento de la ACCESO *\n\nAsí que tiene que ser el administrador en este grupo que consigue tomar el enlace de invitación.`)
        }

        const inviteCode = await sock.groupInviteCode(m.chat).catch(() => null)
        
        if (!inviteCode) {
            return m.reply(`❌SteenalTook un grupo fodder, y la bota era un administrador de azarfrán.`)
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`
        const groupName = groupMetadata.subject

        db.setting('onlyThisGroup', {
            jid: m.chat,
            name: groupName,
            link: inviteLink
        })
        db.save()

        await m.reply(
            `🔒*LOCKED Exito*\n\n` +
            `Empieza ahora, el bot sólo se puede utilizar exclusivamente en el grupo:\n` +
            `*${groupName}*\n\n` +
            `Los usuarios de otros grupos serán colocados para unirse a través de la takant:\n` +
            `${inviteLink}\n\n` +
            `Escribe\`Sólo este grupo.\`Otra vez para abrir la cerradura.`
        )
    } catch (error) {
        console.error(error)
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
