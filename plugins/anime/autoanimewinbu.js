"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourinautoanimejs = require('../../src/lib/ourin-auto-anime.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'autoanimewinbu',
    alias: ['aaw', 'autoanime'],
    category: 'anime',
    description: 'Auto sube el anime en cursoxEldrin )',
    usage: '.autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>',
    example: '.autoanimewinbu start',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, args }) {
    const sub = m.text
    const state = _ourinautoanimejs.loadState.call(void 0, )


    switch (sub) {
        case 'start': {
            if (_ourinautoanimejs.isRunning.call(void 0, )) {
                return m.reply(`⚠¡El AutoAnime está en camino!`)
            }

            const groups = state.groups || []
            if (groups.length === 0) {
                return m.reply(
                    `❌¡No hay objetivo de grupo!\n\n` +
                    `# To include so grupo prima #\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup\`(en el objetivo del grupo )\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const interval = state.interval || 5
            _ourinautoanimejs.startAutoCheck.call(void 0, sock, interval)
            _ourinautoanimejs.saveState.call(void 0, { ...state, enabled: true })

            return sock.sendMessage(m.chat, {
                text: `✅ *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀʀᴛᴇᴅ*\n\n` +
                    `•📲Objetivos de grupo: *${groups.length}*\n` +
                    `> ⏱️ Interval: *${interval}minuto*\n` +
                    `> 🎞️ Filter: *Pixeldrain 720p+*\n` +
                    `•⏰Maxedad: * 24 horas *\n\n` +
                    `Se inició el primer cheque..`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Status',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🛑 Stop',
                            id: `${m.prefix}autoanimewinbu stop`
                        })
                    }
                ]
            }, { quoted: m })
        }

        case 'stop': {
            _ourinautoanimejs.stopAutoCheck.call(void 0, )
            _ourinautoanimejs.saveState.call(void 0, { ...state, enabled: false })
            return m.reply(`🛑*AutoAnime detenido*`)
        }

        case 'status': {
            const sent = _ourinautoanimejs.loadSent.call(void 0, )
            const running = _ourinautoanimejs.isRunning.call(void 0, )
            const groups = state.groups || []

            let txt = `📊 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀᴛᴜs*\n\n`
            txt += `> 🔄 Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n`
            txt += `> 💾 Auto-start: *${state.enabled ? 'Ya' : 'Tidak'}*\n`
            txt += `•📋## Sent: *${sent.size}* episode\n`
            txt += `> ⏱️ Interval: *${state.interval || 5}minuto*\n`
            txt += `•📲Objetivos de grupo: *${groups.length}*\n`

            if (groups.length > 0) {
                txt += `\n*Grupo:*\n`
                groups.forEach((g, i) => {
                    txt += `> ${i + 1}. \`${g}\`\n`
                })
            }

            return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
        }

        case 'cek':
        case 'check': {
            if (!_ourinautoanimejs.isRunning.call(void 0, )) {
                _ourinautoanimejs.startAutoCheck.call(void 0, sock, state.interval || 5)
            }
            await m.reply('🔍 Mengecek anime terbaru...')
            try {
                await _ourinautoanimejs.runCheck.call(void 0, )
                return m.reply('✅Comprobación terminado')
            } catch (e) {
                m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
            }
        }

        case 'list': {
            await m.reply('📺 Mengambil daftar anime...')
            try {
                const list = await _ourinautoanimejs.getOngoingAnimeList.call(void 0, )
                if (list.length === 0) return m.reply('❌No Anime encontrado')

                let txt = `📺 *ᴅᴀꜰᴛᴀʀ ᴀɴɪᴍᴇ ᴛᴇʀʙᴀʀᴜ*\n\n`
                txt += `> Total: *${list.length}* anime\n\n`
                list.slice(0, 15).forEach((a, i) => {
                    txt += `*${i + 1}.* ${a.title}\n`
                })
                if (list.length > 15) txt += `\n>...y${list.length - 15} otros`

                return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
            } catch (e) {
                m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
            }
        }

        case 'reset': {
            const sent = _ourinautoanimejs.loadSent.call(void 0, )
            const count = sent.size
            _ourinautoanimejs.saveSent.call(void 0, new Set())
            return m.reply(`✅Restablecer! *${count}* episodio fue interrumpido de la historia.\nY todos los episodios están siendo reentregados.`)
        }

        case 'addgrup':
        case 'addgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(addgrup|addgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            if (!grupId || !grupId.includes('@g.us')) {
                return m.reply(
                    `❌ID inválido grup\n\n` +
                    `El uso estará dentro de un grupo, o:\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const groups = state.groups || []
            if (groups.includes(grupId)) {
                return m.reply(`⚠Soop ya está en la lista de destino`)
            }

            groups.push(grupId)
            _ourinautoanimejs.saveState.call(void 0, { ...state, groups })
            return m.reply(`✅Grupo\`${grupId}\` anadido a target\n* Tital *${groups.length}* grupo`)
        }

        case 'delgrup':
        case 'delgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(delgrup|delgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            const groups = state.groups || []
            const idx = groups.indexOf(grupId)
            if (idx === -1) {
                return m.reply(`❌Grup no se encuentra en la lista de destino`)
            }

            groups.splice(idx, 1)
            _ourinautoanimejs.saveState.call(void 0, { ...state, groups })
            return m.reply(`✅Grupo\`${grupId}\`de la meta\nRestante: *${groups.length}* grupo`)
        }

        case 'interval': {
            const rest = (typeof args === 'string' ? args : '').replace(/^interval\s*/i, '').trim()
            const mins = parseInt(rest)
            if (!mins || mins < 1 || mins > 60) {
                return m.reply(`❌La intervalación debe ser de 1 a 60 minutos\n\n> Ejemplo:\`${m.prefix}autoanimewinbu interval 10\``)
            }

            _ourinautoanimejs.saveState.call(void 0, { ...state, interval: mins })

            if (_ourinautoanimejs.isRunning.call(void 0, )) {
                _ourinautoanimejs.stopAutoCheck.call(void 0, )
                _ourinautoanimejs.startAutoCheck.call(void 0, sock, mins)
            }

            return m.reply(`✅Interval se convierte a *${mins}minuto*`)
        }

        default: {
            const running = _ourinautoanimejs.isRunning.call(void 0, )
            return sock.sendMessage(m.chat, {
                text: `🎬 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ ᴡɪɴʙᴜ*\n\n` +
                    `> Status: *${running ? '🟢 ON' : '🔴 OFF'}*\n\n` +
                    `*ᴄᴏᴍᴍᴀɴᴅs:*\n` +
                    `> \`${m.prefix}aaw comienza\` —Empieza auto-check\n` +
                    `> \`${m.prefix}aaw stop\` — Hentikan\n` +
                    `> \`${m.prefix}aaw estado\` —Mira estado\n` +
                    `> \`${m.prefix}aaw comprueba\` —Control de manal ahora\n` +
                    `> \`${m.prefix}aaw de paredes\` —Nueva lista de Anime\n` +
                    `> \`${m.prefix}aaw addgrup\` —Añadir objetivo grup\n` +
                    `> \`${m.prefix}aaw delgrup\` —Quitar el objetivo del grupo\n` +
                    `> \`${m.prefix}aaw de espera 10\` —Cambia interval\n` +
                    `> \`${m.prefix}aaw restablecer\` —Registro enviado`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: running ? '🛑 Stop' : '▶️ Start',
                            id: `${m.prefix}autoanimewinbu ${running ? 'stop' : 'start'}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Status',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    }
                ]
            }, { quoted: m })
        }
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
