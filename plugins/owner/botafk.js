"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'botafk',
    alias: ['afkbot', 'afkmode'],
    category: 'owner',
    description: 'El modo AFK para el bot - el bot no responde al comando, sólo responde el mensaje AFK',
    usage: '.botafk <alasan>',
    example: '.botafk Lagi istirahat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const currentAfk = db.setting('botAfk')
    
    if (currentAfk && currentAfk.active) {
        db.setting('botAfk', { active: false })
        await m.react('✅')
        
        const afkDuration = Date.now() - currentAfk.since
        const duration = formatDuration(afkDuration)
        
        return m.reply(
            `✅ *ʙᴏᴛ ᴋᴇᴍʙᴀʟɪ ᴏɴʟɪɴᴇ*\n\n` +
            `╭┈┈⬡「 📊 *sᴛᴀᴛɪsᴛɪᴋ ᴀꜰᴋ* 」\n` +
            `┃ ⏱️ ᴅᴜʀᴀsɪ: \`${duration}\`\n` +
            `┃ 📝 ᴀʟᴀsᴀɴ: \`${currentAfk.reason || '-'}\`\n` +
            `╰┈┈⬡\n\n` +
            `- ¡Prepárate para tomar el mando!`
        )
    } else {
        const reason = m.args.join(' ') || 'AFK'
        
        db.setting('botAfk', {
            active: true,
            reason: reason,
            since: Date.now()
        })
        
        await m.react('💤')
        return m.reply(
            `💤 *ʙᴏᴛ ᴀꜰᴋ ᴀᴋᴛɪꜰ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 ᴀʟᴀsᴀɴ: \`${reason}\`\n` +
            `┃ ⏰ sᴇᴊᴀᴋ: \`${_momenttimezone2.default.call(void 0, ).tz('America/Argentina/Buenos_Aires').format('HH:mm:ss')}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n` +
            `┃ ✅Propietario bot\n` +
            `┃ ✅Vive por ti mismo (de mí)\n` +
            `┃ ❌Todos los demás usuarios\n` +
            `╰┈┈⬡\n\n` +
            `Ez otro usuario recibirá un mensaje AFK\n` +
            `> Escribe\`${m.prefix}botafk\`Para volver a la línea.`
        )
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}el${hours % 24}hora`
    if (hours > 0) return `${hours}hora${minutes % 60}minuto`
    if (minutes > 0) return `${minutes}minuto${seconds % 60}segundo`
    return `${seconds}segundo`
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
