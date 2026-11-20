"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
    name: "antispam",
    alias: ["antispamgc"],
    category: "group",
    description: "Gestiona la protección del grupo contra el spam",
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
            `🛡 *ANTISPAM*\n\n` +
            `Esta función protege al grupo de miembros que envían el mismo mensaje muchas veces o muy rápido, molestando a los demás.\n\n` +
            `*Cómo usarlo:*\n` +
            `> \`${m.prefix}antispam on\` - Activa el antispam\n` +
            `> \`${m.prefix}antispam off\` - Desactiva el antispam\n\n` +
            `*Elige el método de sanción:*\n` +
            `> \`${m.prefix}antispam warning\` - 3 avisos antes de expulsar\n` +
            `> \`${m.prefix}antispam kick\` - Expulsa al spammer automáticamente\n` +
            `> \`${m.prefix}antispam delete\` - Borra los mensajes de spam\n\n` +
            `*Sensibilidad de la pausa (delay):*\n` +
            `> \`${m.prefix}antispam 2\` - Pausa máxima de 2 segundos\n` +
            `> \`${m.prefix}antispam 1500\`  - Pausa de 1500 milisegundos`
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
            `🛡 *ANTISPAM ACTIVADO*\n\n` +
            `> Pausa máxima: *${delayMs} ms* (${(delayMs/1000).toFixed(1)} s)\n\n` +
            `El bot marcará un mensaje como spam si un miembro envía varios mensajes con menos de *${(delayMs/1000).toFixed(1)} segundos* entre ellos.`
        )
    }

    if (action === "on" || action === "off") {
        const isEnable = action === "on"
        if (groupData.antispam === isEnable) {
            return m.reply(`✅ El antispam ya está ${isEnable ? "activado" : "desactivado"} en este grupo. No se ha cambiado nada.`)
        }
        
        groupData.antispam = isEnable
        db.setGroup(m.chat, groupData)
        
        await m.reply(
            `🛡 *ESTADO DEL ANTISPAM*\n\n` +
            `> Estado: *${isEnable ? "ACTIVO ✅" : "INACTIVO ❌"}*\n\n` +
            `El bot ${isEnable ? "vigila" : "ha dejado de vigilar"} los mensajes repetidos o spam de los miembros de este grupo.`
        )
    } else {
        groupData.antispamAction = action
        db.setGroup(m.chat, groupData)
        
        let textAction = ""
        if (action === "warning") textAction = "Avisa progresivamente (3 avisos)"
        if (action === "kick") textAction = "Expulsa automáticamente al spammer"
        if (action === "delete") textAction = "Borra los mensajes de spam"
        
        await m.reply(
            `🛡️ *ACCIÓN ANTISPAM ACTUALIZADA*\n\n` +
            `*Método actual:* ${action.toUpperCase()}*\n\n` +
            `El bot aplicará automáticamente la acción *${textAction}* a cualquier miembro que haga spam repetido.`
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
                `⚠ *AVISO DE SPAM*\n\n` +
                `> Para: @${senderId.split("@")[0]}\n\n` +
                `Has recibido 3 avisos por enviar mensajes repetidos tan rápido. Si continúas, el administrador puede tomar medidas.`,
                { mentions: [senderId] }
            )
            userData.warnings = 0 
            userData.count = 0
            spamTracker.set(chatKey, userData)
        } else {
            await m.reply(
                `⚠ *SPAM DETECTADO*\n\n` +
                `> Aviso ${userData.warnings} de un máximo de 3\n\n` +
                `Hola @${senderId.split("@")[0]}¡No repitas este mensaje en el grupo!`,
                { mentions: [senderId] }
            )
            userData.count = 0 
            spamTracker.set(chatKey, userData)
        }
    } else if (action === "kick") {
        if (m.isBotAdmin) {
            await m.reply(
                `🛑 *SPAMMER EXPULSADO*\n\n` +
                `Lo siento, ${senderId.split("@")[0]}. Has sido expulsado por hacer spam repetido en el grupo.`, 
                { mentions: [senderId] }
            )
            await sock.groupParticipantsUpdate(m.chat, [senderId], "remove")
            spamTracker.delete(chatKey)
        } else {
            await m.reply(
                `⚠ *SPAM DETECTADO*\n\n` +
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
