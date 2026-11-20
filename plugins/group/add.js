"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'add',
    alias: ['addmember', 'invite'],
    category: 'group',
    description: 'Añadir un miembrob a grupo ( soporte múltile )',
    usage: '.add <número1> [número2] [número3]... [enlace_grupo]',
    example: '.add 6281234567890 6281234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    
    if (args.length === 0) {
        return m.reply(
            `👥 *ᴀᴅᴅ ᴍᴇᴍʙᴇʀ*\n\n` +
            `Cara llevas\n` +
            `DALTON 1.\`${m.prefix}add <nomor>\`\n` +
            `> 2. Multiple: \`${m.prefix}add <nomor1> <nomor2> ...\`\n` +
            `> 3. En privado: \`${m.prefix}add <número> <enlace_grupo>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}add 6281234567890\`\n` +
            `> \`${m.prefix}add 628123 628456 628789\`\n` +
            `> \`${m.prefix}add 628123 https://chat.whatsapp.com/xxx\`\n\n` +
            `> Requisito:\n` +
            `*Debería ser admin en objetivos de grupo\n` +
            `- La forma del comandante debe ser administrada`
        )
    }
    
    let targetGroup = m.isGroup ? m.chat : null
    let targetNumbers = []
    
    for (const arg of args) {
        const linkMatch = arg.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/)
        if (linkMatch) {
            try {
                const groupInfo = await sock.groupGetInviteInfo(linkMatch[1])
                targetGroup = groupInfo.id
            } catch (e) {
                return m.reply(`❌*ɢᴀɢᴀʟ*\n\nEnlace grupo no es válido o si ex¡¡Pedaleado!`)
            }
        } else if (arg.includes('@g.us')) {
            targetGroup = arg
        } else {
            let num = arg.replace(/[^0-9]/g, '')
            if (num.startsWith('0')) {
                num = '62' + num.slice(1)
            }
            if (num.length >= 10) {
                targetNumbers.push(num)
            }
        }
    }
    
    if (targetNumbers.length === 0) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Aquí viene el número válido!`)
    }
    
    if (!targetGroup) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\nAsí que, ¡puedes ir al grupo o puedes ir al grupo!\n\n\`${m.prefix}add <nomor> <link_grup>\``)
    }
    
    try {
        const groupMeta = await sock.groupMetadata(targetGroup)
        const botId = _optionalChain([sock, 'access', _ => _.user, 'optionalAccess', _2 => _2.id, 'optionalAccess', _3 => _3.split, 'call', _4 => _4(':'), 'access', _5 => _5[0]]) + '@s.whatsapp.net'
        const botParticipant = groupMeta.participants.find(p => 
            p.id === botId || p.jid === botId || _optionalChain([p, 'access', _6 => _6.id, 'optionalAccess', _7 => _7.includes, 'call', _8 => _8(_optionalChain([sock, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.id, 'optionalAccess', _11 => _11.split, 'call', _12 => _12(':'), 'access', _13 => _13[0]]))])
        )
        
        if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*No un administrador en un grupo*${groupMeta.subject}*!`)
        }
        
        if (!m.isGroup) {
            const senderId = _optionalChain([m, 'access', _14 => _14.sender, 'optionalAccess', _15 => _15.split, 'call', _16 => _16('@'), 'access', _17 => _17[0]])
            const senderParticipant = groupMeta.participants.find(p => 
                _optionalChain([p, 'access', _18 => _18.id, 'optionalAccess', _19 => _19.includes, 'call', _20 => _20(senderId)]) || _optionalChain([p, 'access', _21 => _21.jid, 'optionalAccess', _22 => _22.includes, 'call', _23 => _23(senderId)])
            )
            
            if (!senderParticipant || !['admin', 'superadmin'].includes(senderParticipant.admin)) {
                return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*No eres un administrador en un grupo*${groupMeta.subject}*!`)
            }
        }
        
        const validNumbers = []
        const alreadyInGroup = []
        
        for (const num of targetNumbers) {
            const existingMember = groupMeta.participants.find(p => 
                _optionalChain([p, 'access', _24 => _24.id, 'optionalAccess', _25 => _25.includes, 'call', _26 => _26(num)]) || _optionalChain([p, 'access', _27 => _27.jid, 'optionalAccess', _28 => _28.includes, 'call', _29 => _29(num)])
            )
            
            if (existingMember) {
                alreadyInGroup.push(num)
            } else {
                validNumbers.push(num + '@s.whatsapp.net')
            }
        }
        
        if (validNumbers.length === 0) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Todos los números están en el grupo!`)
        }
        
        m.react('🕕')
        
        const results = await sock.groupParticipantsUpdate(targetGroup, validNumbers, 'add')
        
        let successList = []
        let invitedList = []
        let failedList = []
        
        for (const res of results) {
            const num = _optionalChain([res, 'access', _30 => _30.content, 'optionalAccess', _31 => _31.attrs, 'optionalAccess', _32 => _32.phone_number, 'optionalAccess', _33 => _33.replace, 'call', _34 => _34('@s.whatsapp.net', '')]) || ''
            
            if (res.status === '200') {
                successList.push(num)
            } else if (res.status === '408') {
                invitedList.push(num)
            } else {
                failedList.push({ num, status: res.status })
            }
        }
        
        let resultText = `🥗 @${m.sender.split('@')[0]}ha añadido un miembro al grupo\n\n`
        
        if (successList.length > 0) {
            resultText += `Ahí está.${successList.length}* La foto con éxito extraída:\n`
            successList.forEach(n => resultText += `• @${n}\n`)
            resultText += `\n`
        }
        
        if (invitedList.length > 0) {
            resultText += `📨Y allí también.${invitedList.length}* foto invalidada: *\n`
            invitedList.forEach(n => resultText += `• @${n}\n`)
            resultText += `\n`
        }
        
        if (failedList.length > 0) {
            resultText += `❌ *ɢᴀɢᴀʟ (${failedList.length}):*\n`
            failedList.forEach(f => resultText += `• @${f.num} (${f.status})\n`)
            resultText += `\n`
        }
        
        if (alreadyInGroup.length > 0) {
            resultText += `⏭️ *sᴜᴅᴀʜ ᴅɪ ɢʀᴜᴘ (${alreadyInGroup.length}):*\n`
            alreadyInGroup.forEach(n => resultText += `• @${n}\n`)
        }
        
        m.react(successList.length > 0 || invitedList.length > 0 ? '✅' : '❌')
        await m.reply(resultText, { mentions: [ ...successList.map(n => n + '@s.whatsapp.net'), ...invitedList.map(n => n + '@s.whatsapp.net'), ...failedList.map(f => f.num + '@s.whatsapp.net'), ...alreadyInGroup.map(n => n + '@s.whatsapp.net'), m.sender ] })
        
    } catch (error) {
        m.react('❌')
        
        if (_optionalChain([error, 'access', _35 => _35.message, 'optionalAccess', _36 => _36.includes, 'call', _37 => _37('not-authorized')])) {
            await m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Escucha, no tengo permiso para añadir una foto!`)
        } else if (_optionalChain([error, 'access', _38 => _38.message, 'optionalAccess', _39 => _39.includes, 'call', _40 => _40('forbidden')])) {
            await m.reply(`❌*ɢᴀɢᴀʟ*\n\n*No tengas el acento de este grupo*`)
        } else {
            m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
        }
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
