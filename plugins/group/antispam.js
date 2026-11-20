"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: "antispam",
    alias: ["antispamgc"],
    category: "group",
    description: "Gestiona las características de protección grupo de mensajes de spam brutales",
    usage: ".antispam <on/off/action/delay>",
    example: ".antispam on\n.antispam warning\n.antispam 2",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const spamTracker = new Map()

async function handler(m, { sock, db }) {
    const args = m.args
    const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    const delayMatch = _optionalChain([action, 'optionalAccess', _4 => _4.match, 'call', _5 => _5(/^(\d+)(s|ms)?$/)])
    
    if (!action || (!["on", "off", "warning", "kick", "delete"].includes(action) && !delayMatch)) {
        return m.reply(
            `🛡*Y me alegraré de verte*\n\n` +
            `Está característica protege al grupo del miembro que envía mensajes una y otra vez muy rápido y brutalmente, así como perturbando la comodidad de otras fotos\n\n` +
            `*Como usarlo:*\n` +
            `> \`${m.prefix}antispam on\`( Activar características antispam )\n` +
            `> \`${m.prefix}antispam off\`(Suddering antispam )\n\n` +
            `* Elija el método de las sanciones: *\n` +
            `> \`${m.prefix}antispam warning\`(Dar un tiro duro de naranja 3 veces advertencia )\n` +
            `> \`${m.prefix}antispam patada\`( Upside @-@ up spammer automatización sin misericordia )\n` +
            `> \`${m.prefix}antispam delete\`(Todos los mensajes de spam enviados )\n\n` +
            `* Ajedrez de la pausa Sensitivitas ( Delay ):\n` +
            `> \`${m.prefix}antispam 2\`( El campo de juego ofrece máximo 2 segundos )\n` +
            `> \`${m.prefix}antispam 1500\` (Set jarak ke 1500 milidetik)`
        )
    }

    const groupData = db.getGroup(m.chat) || {}
    
    if (delayMatch) {
        let delayMs = parseInt(delayMatch[1])
        if (delayMatch[2] === "s" || (delayMs >= 1 && delayMs <= 10)) {
            delayMs = delayMs * 1000
        }
        
        if (delayMs < 500) delayMs = 500
        if (delayMs > 10000) delayMs = 10000
        
        groupData.antispamDelay = delayMs
        db.setGroup(m.chat, groupData)
        
        return m.reply(
            `🛡♪SENTIVITY AND SPAM STARTED♪\n\n` +
            `> Jeda Maksimal: *${delayMs} ms* (${(delayMs/1000).toFixed(1)}segundo)\n\n` +
            `El tagena selccionará un mensaje como spam si un miembro envía algunos mensajes con una jeda en el bawup *${(delayMs/1000).toFixed(1)}segundos para enviar el mensaje.`
        )
    }

    if (action === "on" || action === "off") {
        const isEnable = action === "on"
        if (groupData.antispam === isEnable) {
            return m.reply(`✅La característica antispam ya es${isEnable ? "aktif" : "nonaktif"}En este grupo, no se ha producido ningún cambio`)
        }
        
        groupData.antispam = isEnable
        db.setGroup(m.chat, groupData)
        
        await m.reply(
            `🛡*Y no voy a dejarte ir*\n\n` +
            `> Status: *${isEnable ? "AKTIF ✅" : "NONAKTIF ❌"}*\n\n` +
            `El sistema actual de bot será${isEnable ? "mengawasi secara ketat" : "berhenti mengawasi"}cada actividad de spam o ininunisción de mensajes realizados por el miembro dentro de ègrupo`
        )
    } else {
        groupData.antispamAction = action
        db.setGroup(m.chat, groupData)
        
        let textAction = ""
        if (action === "warning") textAction = "Memberikan peringatan keras secara bertahap"
        if (action === "kick") textAction = "Arrojándose a un miembro que golpea a un automático"
        if (action === "delete") textAction = "Borrar mensajes de spam perturbadores"
        
        await m.reply(
            `🛡️ *AKSI ANTI SPAM DIPERBARUI*\n\n` +
            `*Metodología penman*${action.toUpperCase()}*\n\n` +
            `El sistema de bots tomará egoístamente una acción rebotada *${textAction}* apala cualquier fotos modifidas realizan actos de spam ininterrumpdos`
        )
    }
}

async function checkSpam(m, sock, db) {
    if (!m.isGroup || m.isAdmin || m.isOwner || m.fromMe) return false
    
    const groupData = db.getGroup(m.chat)
    if (!groupData || !groupData.antispam) return false

    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const now = Date.now()
    const delayThreshold = groupData.antispamDelay || 2000

    const userData = spamTracker.get(chatKey) || { count: 0, lastMessage: 0, warnings: 0 }
    
    if (now - userData.lastMessage < delayThreshold) {
        userData.count += 1
    } else {
        if (now - userData.lastMessage > delayThreshold + 1000) {
            userData.count = 1
        } else {
            userData.count = Math.max(1, userData.count - 1)
        }
    }
    
    userData.lastMessage = now
    spamTracker.set(chatKey, userData)

    if (userData.count >= 5) {
        return true
    }
    
    return false
}

async function handleSpamAction(m, sock, db) {
    const groupData = db.getGroup(m.chat)
    const action = groupData.antispamAction || "warning"
    const senderId = m.sender
    const chatKey = `${m.chat}_${senderId}`
    const userData = spamTracker.get(chatKey)

    if (action === "warning") {
        userData.warnings += 1
        spamTracker.set(chatKey, userData)
        
        if (userData.warnings >= 3) {
            await m.reply(
                `⚠♪ MEMORIA ESPAÑOL MÁSICA ♪\n\n` +
                `> Teruntuk: @${senderId.split("@")[0]}\n\n` +
                `Usted ha recibido 3 disparos de advertencia para enviar un mensaje de texto tan pronto como demez el spam o el administrador puede tomar medidas contra esemanso!`,
                { mentions: [senderId] }
            )
            userData.warnings = 0 
            userData.count = 0
            spamTracker.set(chatKey, userData)
        } else {
            await m.reply(
                `⚠Amonestacion SPAM DETECTED\n\n` +
                `♪ A la advertencia${userData.warnings}desde el máximo 3 advertencias\n\n` +
                `Hola @${senderId.split("@")[0]}¡No repita este mensaje en el grupo inmediatamente!`,
                { mentions: [senderId] }
            )
            userData.count = 0 
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "kick") {
        if (m.isBotAdmin) {
            await m.reply(
                `🛑*SPAMMER Expulsado*\n\n` +
                `Lo siento mucho.${senderId.split("@")[0]}Usted será liberado por el dhaporque usted es dettado para el acto bratal de spam en ègrupo!`, 
                { mentions: [senderId] }
            )
            await sock.groupParticipantsUpdate(m.chat, [senderId], "remove")
            spamTracker.delete(chatKey)
        } else {
            await m.reply(
                `⚠* * * * * * * * * * 91; SPAM TAPPING * * 93;\n\n` +
                `La última actividad de spam brutal detectable de @${senderId.split("@")[0]}, pero su querido sistema de bots no puede ' t lanzar una foto como tal porque el bot actualmente no tiene una acción como administrador del grupo.`, 
                { mentions: [senderId] }
            )
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "delete") {
        if (m.isBotAdmin) {
            await sock.sendMessage(m.chat, { delete: m.key })
        } else {
            userData.count = 0
            spamTracker.set(chatKey, userData)
        }
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.checkSpam = checkSpam; exports.handleSpamAction = handleSpamAction;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
