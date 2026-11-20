"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const pluginConfig = {
    name: 'autoreply',
    alias: ['smarttrigger', 'smarttriggers', 'ar'],
    category: 'group',
    description: 'Establecer los desencadenantes de forma automática / inteligente por grupo',
    usage: '.autoreply on/off/add/del/list/private',
    example: '.autoreply on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

const AUTOREPLY_MEDIA_DIR = _path2.default.join(process.cwd(), 'database', 'autoreply_media')

if (!_fs2.default.existsSync(AUTOREPLY_MEDIA_DIR)) {
    _fs2.default.mkdirSync(AUTOREPLY_MEDIA_DIR, { recursive: true })
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    
    const privateAutoreply = _nullishCoalesce(db.setting('autoreplyPrivate'), () => ( false))
    
    if (action === 'private') {
        if (!m.isOwner) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Sólo el propietario puede manejar un primate autoreply!`)
        }
        
        const subAction = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()])
        
        if (subAction === 'on') {
            db.setting('autoreplyPrivate', true)
            m.react('✅')
            return m.reply(`✅*ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴛᴇ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n*Responderá a la automatización en el gráfico primario*`)
        }
        
        if (subAction === 'off') {
            db.setting('autoreplyPrivate', false)
            m.react('❌')
            return m.reply(`❌*ᴀᴜᴛᴏʀᴇᴘʟʏ ᴘʀɪᴠᴀᴛᴇ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\nNo responderá a la tasación en el chat primario`)
        }
        
        const currentStatus = _nullishCoalesce(db.setting('autoreplyPrivate'), () => ( false))
        return m.reply(
            `📱 *AUTOREPLY PRIVATE*\n\n` +
            `Status: *${currentStatus ? '✅ AKTIF' : '❌ NONAKTIF'}*\n\n` +
            `*Comando Disponible:*\n` +
            `• *${m.prefix}autoreply private on* — Activa el autoreply en privado\n` +
            `• *${m.prefix}autoreply private off* — Desactiva el autoreply en privado`
        )
    }
    
    if (action === 'global') {
        if (!m.isOwner) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Sólo el propietario puede manejar el mundo autorírico!`)
        }
        
        const subAction = _optionalChain([args, 'access', _7 => _7[1], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()])
        const globalCustomReplies = db.setting('globalCustomReplies') || []
        
        if (subAction === 'add') {
            const fullBody = m.body || ''
            const pipeIdx = fullBody.indexOf('|')
            if (pipeIdx === -1) {
                return m.reply(
                    `❌ *ꜰᴏʀᴍᴀᴛ sᴀʟᴀʜ*\n\n` +
                    `*La pistola fortificará:\`trigger|responder\`\n\n` +
                    `> Ejemplo:\n` +
                    `> \`${m.prefix}* autorecientemente global* *agregar hola*{name}!\``
                )
            }
            
            const triggerStart = fullBody.toLowerCase().indexOf('global add ') + 'global add '.length
            const triggerEnd = pipeIdx
            const trigger = fullBody.substring(triggerStart, triggerEnd).trim()
            const reply = fullBody.substring(pipeIdx + 1)
            
            if (!trigger.trim() || !reply) {
                return m.reply(`❌*ɢᴀɢᴀʟ*\n\n# El desencadenante y la respuesta no pueden estar vacíos #`)
            }
            
            const existingIndex = globalCustomReplies.findIndex(r => r.trigger.toLowerCase() === trigger.trim().toLowerCase())
            if (existingIndex !== -1) {
                globalCustomReplies[existingIndex].reply = reply
            } else {
                globalCustomReplies.push({ trigger: trigger.trim().toLowerCase(), reply: reply })
            }
            
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('✅')
            return m.reply(
                `✅ *GLOBAL AUTOREPLY Anadido*\n\n` +
                `• Trigger: *${trigger.trim()}*\n` +
                `• Total: *${globalCustomReplies.length}* replies\n\n` +
                `Activo en todos los chats grupo y primate`
            )
        }
        
        if (subAction === 'del' || subAction === 'rm') {
            const trigger = args.slice(2).join(' ').toLowerCase().trim()
            if (!trigger) {
                return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Aquí hay un truco para entrar!`)
            }
            
            const index = globalCustomReplies.findIndex(r => r.trigger === trigger)
            if (index === -1) {
                return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Trigger \`${trigger}\`no encontrado!`)
            }
            
            globalCustomReplies.splice(index, 1)
            db.setting('globalCustomReplies', globalCustomReplies)
            await db.save()
            
            m.react('🗑️')
            return m.reply(`🗑 GLOBAL AUTOREPLY SHOPPUS •\n\n# Los desencadenantes #${trigger}* ¡Interrumpido exitosamente!`)
        }
        
        if (subAction === 'list' || !subAction) {
            if (globalCustomReplies.length === 0) {
                return m.reply(
                    `📋 *GLOBAL AUTOREPLY*\n\n` +
                    `Estado: *❌NO DATOS\n\n` +
                    `*Comando Disponible:*\n` +
                    `• *${m.prefix}autoreply global add <trigger>|<reply>*`
                )
            }
            
            let text = `📋 *GLOBAL AUTOREPLY*\n\n`
            text += `Total: *${globalCustomReplies.length}* replies\n`
            text += `Begging at: * All Grupo To Private Chat *\n\n`
            text += `*Registrate TRIGGER:*\n`
            globalCustomReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `${i + 1}. *${r.trigger}* ${hasImage}\n   ↳ ${r.reply.substring(0, 30)}${r.reply.length > 30 ? '...' : ''}\n\n`
            })
            return m.reply(text.trim())
        }
        
        return m.reply(
            `📱 *ɢʟᴏʙᴀʟ ᴀᴜᴛᴏʀᴇᴘʟʏ*\n\n` +
            `> \`${m.prefix}autoreply global add trigger|reply\`\n` +
            `> \`${m.prefix}autoreply global del trigger\`\n` +
            `> \`${m.prefix}autoreply global list\``
        )
    }
    
    if (!m.isGroup) {
        return m.reply(
            `📱* SISTTHERS AUTOOREPLY *\n\n` +
            `Autoreply Private: *${privateAutoreply ? '✅ AKTIF' : '❌ NONAKTIF'}*\n\n` +
            `*Comando Disponible:*\n` +
            `• *${m.prefix}autoreply private on/off* — Toggle private\n` +
            `• *${m.prefix}autoreply global add/del/list* — Global triggers\n\n` +
            `Para configuraciones de grupos autoreply, utilice este comando dentro del grupo. _`
        )
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Sólo el administrador puede manejarlo de forma automática en un grupo!`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const globalSmartTriggers = _nullishCoalesce(_nullishCoalesce(db.setting('smartTriggers'), () => ( _optionalChain([_configjs2.default, 'access', _10 => _10.features, 'optionalAccess', _11 => _11.smartTriggers]))), () => ( false))
    
    if (!action || action === 'status') {
        const groupStatus = groupData.autoreply
        const effectiveStatus = _nullishCoalesce(groupStatus, () => ( globalSmartTriggers))
        const customReplies = groupData.customReplies || []
        
        let text = `🤖* SISTTHERS OUTOREPLY GRUPP ]\n\n`
        text += `Status Global: *${globalSmartTriggers ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
        text += `Este estado de la quiebra: *${groupStatus === undefined ? 'DEFAULT' : (groupStatus ? '✅ AKTIF' : '❌ NONAKTIF')}*\n`
        text += `Status Private: *${privateAutoreply ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
        text += `Efectiva en Grupo: *${effectiveStatus ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
        text += `REPOSENTANTES PERALIZNO Total (Grupo ): *${customReplies.length}*\n\n`
        text += `*MANAJEMEN Grupo:*\n`
        text += `• *${m.prefix}autoreply on* — Activar en este grupo\n`
        text += `• *${m.prefix}autoreply off* — Desactivar en este grupo\n`
        text += `• *${m.prefix}autoreply add <trigger>|<reply>* — Añadir respuesta personalizada\n`
        text += `• *${m.prefix}autoreply del <trigger>* — Elimina respuesta personalizada\n`
        text += `• *${m.prefix}autoreply list* — Mira todos los triggers de este grupo.\n`
        text += `• *${m.prefix}autoreply reset* — Elimina TODOS los triggers personalizados de este grupo\n\n`
        
        if (m.isOwner) {
            text += `* Manajemen GLOBAL ( Propietario):\n`
            text += `• *${m.prefix}autoreply global add <trigger>|<reply>*\n`
            text += `• *${m.prefix}autoreply global del <trigger>*\n`
            text += `• *${m.prefix}autoreply global list* — Triggers globales activos\n`
            text += `• *${m.prefix}autoreply private on/off* — Activa o desactiva las respuestas del bot en privado\n\n`
        }
        
        text += `* CARA EXPLOSIONS:\n`
        text += `1. * Imagen de contenido con capción: *${m.prefix}autoreply add trigger|responder*\n`
        text += `2. & lt; i & gt; O responder fotos con: *${m.prefix}autoreply add trigger|responder*\n\n`
        text += `*Puede Usando PLACEHOLDER:*\n`
        text += `{name} • {tag} • {sender} • {botname} • {time} • {date}`
        
        return m.reply(text)
    }
    
    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, autoreply: true })
        m.react('✅')
        return m.reply(`✅*ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n*Responderá a la automatización en este grupo*`)
    }
    
    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, autoreply: false })
        m.react('❌')
        return m.reply(`❌*ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n*No responderá a la automatización en este grupo*`)
    }
    
    if (action === 'add') {
        const fullBody = m.body || ''
        const pipeIdx = fullBody.indexOf('|')
        
        if (pipeIdx === -1) {
            return m.reply(
                `❌*Formato Incorrecto*\n\n` +
                `Forte de uso: * desencadena xyreply *\n\n` +
                `*Text Only:*\n` +
                `• ${m.prefix}ar add hola|Hola {name}! 👋\n\n` +
                `*Con Imagen:*\n` +
                `1. Responder imagen +${m.prefix}ar add trigger|caption\n` +
                `2. Imagen xenol + leyenda${m.prefix}ar add trigger|caption\n\n` +
                `*Placeholder:*\n` +
                `• {name}- Nombre de usuario.\n` +
                `• {tag} - Tag @user\n` +
                `• {sender}- Número de usuario\n` +
                `• {botname}- El nombre del bot.\n` +
                `• {time}- El tiempo es ahora.\n` +
                `• {date}- Despegue ahora.`
            )
        }
        
        const addIdx = fullBody.toLowerCase().indexOf('add ')
        const triggerStart = addIdx + 'add '.length
        const trigger = fullBody.substring(triggerStart, pipeIdx).trim()
        const reply = fullBody.substring(pipeIdx + 1)
        
        if (!trigger) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Un trigger no puede ser un vacio!`)
        }
        
        let imageBuffer = null
        let imagePath = null
        
        const hasQuotedImage = m.quoted && (m.quoted.mtype === 'imageMessage' || m.quoted.type === 'image')
        const hasDirectImage = m.mtype === 'imageMessage' || m.type === 'image'
        
        if (hasQuotedImage) {
            try {
                imageBuffer = await m.quoted.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download quoted image:', e.message)
            }
        } else if (hasDirectImage) {
            try {
                imageBuffer = await m.download()
            } catch (e) {
                console.error('[Autoreply] Failed to download direct image:', e.message)
            }
        }
        
        if (imageBuffer) {
            const filename = `${m.chat.replace('@g.us', '')}_${trigger.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`
            imagePath = _path2.default.join(AUTOREPLY_MEDIA_DIR, filename)
            _fs2.default.writeFileSync(imagePath, imageBuffer)
        }
        
        const customReplies = groupData.customReplies || []
        const existingIndex = customReplies.findIndex(r => r.trigger.toLowerCase() === trigger.toLowerCase())
        
        const replyData = {
            trigger: trigger.toLowerCase(),
            reply: reply || '',
            image: imagePath || null,
            createdAt: Date.now()
        }
        
        if (existingIndex !== -1) {
            if (customReplies[existingIndex].image && customReplies[existingIndex].image !== imagePath) {
                try {
                    if (_fs2.default.existsSync(customReplies[existingIndex].image)) {
                        _fs2.default.unlinkSync(customReplies[existingIndex].image)
                    }
                } catch (e2) {}
            }
            customReplies[existingIndex] = replyData
        } else {
            customReplies.push(replyData)
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('✅')
        
        let successMsg = `✅*AUTOREPLY Anadido*\n\n`
        successMsg += `*DETAIL:*\n`
        successMsg += `• Trigger: *${trigger.trim()}*\n`
        if (reply) {
            successMsg += `•Responder:${reply.substring(0, 50)}${reply.length > 50 ? '...' : ''}\n`
        }
        if (imagePath) {
            successMsg += `• Image: ✅ Tersimpan\n`
        }
        successMsg += `\nTotal: *${customReplies.length}* respuestas en este grupo`
        
        return m.reply(successMsg)
    }
    
    if (action === 'del' || action === 'rm' || action === 'remove') {
        const trigger = args.slice(1).join(' ').toLowerCase().trim()
        
        if (!trigger) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡Aquí hay un truco para entrar!\n\n\`${m.prefix}autoreply del halo\``)
        }
        
        const customReplies = groupData.customReplies || []
        const index = customReplies.findIndex(r => r.trigger === trigger)
        
        if (index === -1) {
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Trigger \`${trigger}\`no encontrado!`)
        }
        
        if (customReplies[index].image) {
            try {
                if (_fs2.default.existsSync(customReplies[index].image)) {
                    _fs2.default.unlinkSync(customReplies[index].image)
                }
            } catch (e3) {}
        }
        
        customReplies.splice(index, 1)
        db.setGroup(m.chat, { ...groupData, customReplies })
        
        m.react('🗑️')
        return m.reply(
            `🗑 AUTOREPLY TO Elimina •\n\n` +
            `Trigger *${trigger}* ¡Interrumpido exitosamente!\n` +
            `Restante: *${customReplies.length}* replies`
        )
    }
    
    if (action === 'list') {
        const customReplies = groupData.customReplies || []
        
        const defaultTriggers = [
            { trigger: '@mention', reply: '👋¿Hay un tipo con nombre?' },
            { trigger: 'p', reply: '💬 Budayakan salam sebelum percakapan!' },
            { trigger: 'bot / almiku', reply: '🤖- ¡Vamos, vamos, vamos!' },
            { trigger: 'assalamualaikum', reply: 'Waalaikumsalam saudaraku' }
        ]
        
        let text = `📋* SIGN AUTOREPLY GRUPP *\n\n`
        
        text += `*Predeterminado TRIGGERS:*\n`
        defaultTriggers.forEach((r, i) => {
            text += `• *${r.trigger}*\n`
            text += `  ↳ ${r.reply}\n`
        })
        text += `\n`
        
        if (customReplies.length > 0) {
            text += `*CUSTOM TRIGGERS:*\n`
            customReplies.forEach((r, i) => {
                const hasImage = r.image ? '🖼️' : ''
                text += `• *${r.trigger}* ${hasImage}\n`
                if (r.reply) {
                    text += `  ↳ ${r.reply.substring(0, 35)}${r.reply.length > 35 ? '...' : ''}\n`
                }
            })
            text += `\n`
        } else {
            text += `*CUSTOM TRIGGERS:*\n`
            text += `*Hay una costumbre de desencadenar en este grupo*\n\n`
        }
        
        text += `Nota: Los desencadenantes predeterminados bajo la bota no pueden ser editados. _`
        
        return m.reply(text)
    }
    
    if (action === 'reset' || action === 'clear') {
        const customReplies = groupData.customReplies || []
        for (const r of customReplies) {
            if (r.image) {
                try {
                    if (_fs2.default.existsSync(r.image)) _fs2.default.unlinkSync(r.image)
                } catch (e4) {}
            }
        }
        
        db.setGroup(m.chat, { ...groupData, customReplies: [] })
        m.react('🗑️')
        return m.reply(`🗑ᴀᴜᴛᴏʀᴇᴘʟʏ ᴅɪʀᴇSᴇᴛ*\n\n¡Todo el diupus personalizado!`)
    }
    
    return m.reply(`❌*ᴀᴄᴛɪᴏɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Usa: \`on\`.\`apagado\`.\`privacidad en / apagado\`.\`añadir\`.\`del\`.\`lista\`.\`restablecer\``)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
