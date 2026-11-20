"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: ['buatgrup', 'creategroup', 'newgroup'],
    alias: [],
    category: 'owner',
    description: 'Nuevo campo de grupo',
    usage: '.buatgrup <nombre>|<número1,número2,...>|<duración_minutos>',
    example: '.buatgrup Grup Baru|628xxx,628yyy|60',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || ''
    const args = text.split('|')

    if (args.length < 2) {
        let txt = `👥* Nuevo GRUPP Crea *👥\n\n`
        txt += `¿Vas a comprar un nuevo grupo de personas?\n\n`
        txt += `*Como usarlo:*\n`
        txt += `👉 \`${m.prefix}buatgrup Nuevo Grupo | 628xxx,628yyy | 60\`\n\n`
        txt += `*Detail:*\n`
        txt += `•Usa\`|\`para separar el nombre, la participante, y la duración\n`
        txt += `•Dividir el número de la participante con coma.\n`
        txt += `•Si el duassis está cargado, el bot pateará todas las fotos y borrará el grupo al final del tiempo!\n`
        txt += `•*Para automatizar a admin*\n\n`
        txt += `*Ejemplo Sin Duración:*\n`
        txt += `\`${m.prefix}buatgrup Equipo Beta | 628123,628456\`\n\n`
        txt += `* Con Duración ( 60 Minuto Active Age ):\n`
        txt += `\`${m.prefix}buatgrup Equipo Beta | 628123,628456 | 60\``
        return m.reply(txt)
    }

    const name = args[0].trim()
    const participantsStr = args[1].trim()
    const durationStr = args[2] ? args[2].trim() : ''

    if (!name || name.length < 2) {
        return m.reply('❌Hermano, el nombre del grupo es corto!')
    }

    const participants = participantsStr
        .split(/[,;\s]+/)
        .map(n => n.replace(/[^0-9]/g, ''))
        .filter(n => n.length >= 5)
        .map(n => n + '@s.whatsapp.net')

    if (participants.length === 0) {
        return m.reply('❌¿Dónde están los mil hombres?')
    }

    let durationMs = 0
    let durationMins = 0
    if (durationStr) {
        durationMins = parseInt(durationStr.replace(/[^0-9]/g, ''))
        if (!isNaN(durationMins) && durationMins > 0) {
            durationMs = durationMins * 60 * 1000
        }
    }

    try {
        await m.react('🕕')
        const group = await sock.groupCreate(name, participants)
        
        let successTxt = `👥* GRUPP DEPENDS *👥\n\n`
        successTxt += `✨*Nombre:*${name}\n`
        successTxt += `🆔 *ID:* ${group.id}\n`
        successTxt += `👤*Participante:*${participants.length} orang\n`
        
        if (durationMs > 0) {
            successTxt += `⏳*Periodo activo:*${durationMins} Menit\n`
            successTxt += `\n⚠Este Grupo será automatizado y todas las fotos serán liadus durante los tiempos activos!\n`
        }

        successTxt += `\n¡Para ser un grupo de administradores de estos, hermana!`
        await m.reply(successTxt)

        if (durationMs > 0) {
            setTimeout(async () => {
                try {
                    const groupMeta = await sock.groupMetadata(group.id)
                    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
                    
                    const membersToKick = groupMeta.participants
                        .map(p => p.id)
                        .filter(id => id !== botJid)

                    if (membersToKick.length > 0) {
                        await sock.sendMessage(group.id, { text: `⏳* MASA ACTIVE GRUPS AGOTADO *⏳\n\nTodo el tiempo el grupo se había ido, el sayonara!👋` })
                        await sock.groupParticipantsUpdate(group.id, membersToKick, 'remove')
                    }
                    
                    await sock.groupLeave(group.id)
                } catch (e) {
                    console.log(`Steenalis borró los autofonos (${group.id}):`, e)
                }
            }, durationMs)
        }

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(`❌Lo siento hermano, no logró hacer un grupo!😭\nError:${err.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
