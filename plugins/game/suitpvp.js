"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'suitpvp',
    alias: ['suit', 'rps', 'janken'],
    category: 'game',
    description: 'Traje principal (de corte de roca ) con otro jugador',
    usage: '.suit @tag',
    example: '.suit @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

if (!global.suitGames) global.suitGames = {}

const TIMEOUT = 90000
const WIN_REWARD = 1000

const EMOJI = {
    batu: '✊',
    gunting: '✌️',
    kertas: '✋'
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    const existingRoom = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(m.sender)
    )
    
    if (existingRoom) {
        return m.reply(
            `❌¡Todavía estás en el traje de juego!\n\n` +
            `Lo siento, terminé tu juego primero.`
        )
    }
    
    let target = null
    if (m.quoted) {
        target = m.quoted.sender
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]])) {
        target = m.mentionedJid[0]
    }
    
    if (!target) {
        return m.reply(
            `✊✌️✋ *sᴜɪᴛ ᴘᴠᴘ*\n\n` +
            `¡Al hombre que quieres desafiar!\n\n` +
            `*Ejemplo:*\n` +
            `> \`.suit @628xxx\``
        )
    }
    
    if (target === m.sender) {
        return m.reply('❌¡No se puede desafiar!')
    }
    
    const targetInGame = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(target)
    )
    
    if (targetInGame) {
        return m.reply('❌¡Ese tipo está jugando traje con alguien más!')
    }
    
    const roomId = 'suit_' + Date.now()
    
    global.suitGames[roomId] = {
        id: roomId,
        chat: m.chat,
        p: m.sender,
        p2: target,
        status: 'waiting',
        pilih: null,
        pilih2: null,
        createdAt: Date.now(),
        timeout: setTimeout(() => {
            if (global.suitGames[roomId]) {
                sock.sendMessage(m.chat, {
                    text: `⏱️ *TIMEOUT!*\n\n@${target.split('@')[0]}no merespon!\nSuit cancelado.`,
                    mentions: [target]
                })
                delete global.suitGames[roomId]
            }
        }, TIMEOUT)
    }
    
    await m.react('✊')
    await m.reply(`Estás desafiando a @${target.split('@')[0]}Para un traje de adu\n\n` +
            `╭┈┈⬡「 💬 *ʀᴇsᴘᴏɴ* 」\n` +
            `┃ ✅Choke en la piedra caliza.\n` +
            `┃ ❌ Escribe *tolak* / *gabisa*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `Tiempo: 90 segundos`, {  mentions: [target]})
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    
    const text = m.body.trim().toLowerCase()
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    let room = null
    let roomId = null
    
    for (const [id, r] of Object.entries(global.suitGames)) {
        if (r.chat === m.chat && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
        if (!m.isGroup && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
    }
    
    if (!room) return false
    
    if (room.status === 'waiting' && m.sender === room.p2 && m.chat === room.chat) {
        if (/^(acc(ept)?|terima|gas|oke?|ok|iya|yoi)$/i.test(text)) {
            clearTimeout(room.timeout)
            room.status = 'playing'
            
            await m.react('🎮')
            
            await m.reply(`✊✌️✋ *sᴜɪᴛ ᴅɪᴍᴜʟᴀɪ!*\n\n` +
                    `@${room.p.split('@')[0]} vs @${room.p2.split('@')[0]}\n\n` +
                    `♪📩¡Comprobar por Chat Privado!\n` +
                    `♪⏱AkeTimeout: 90 segundos`, {  mentions: [room.p, room.p2]})
            
            const pmMessage = `✊✌️✋ *sᴜɪᴛ - ᴘɪʟɪʜ ᴊᴀᴡᴀʙᴀɴ*\n\n` +
                `Escribe incorrecto uno:\n\n` +
                `┃ ✊*piedra*\n` +
                `┃ ✌️ *tijeras*\n` +
                `┃ ✋*papel*\n\n` +
                `Responder este mensaje con tus opciones!\n` +
                `Ejemplo: *piedra*`
            
            try {
                await sock.sendMessage(room.p, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Failed to PM player 1:', e.message)
            }
            
            try {
                await sock.sendMessage(room.p2, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Failed to PM player 2:', e.message)
            }
            
            room.timeout = setTimeout(async () => {
                if (global.suitGames[roomId]) {
                    if (!room.pilih && !room.pilih2) {
                        await sock.sendMessage(room.chat, { 
                            text: '⏱¡A los dos jugadores que no eligen, a ser dicho!' 
                        })
                    } else if (!room.pilih || !room.pilih2) {
                        const afk = !room.pilih ? room.p : room.p2
                        const winner = !room.pilih ? room.p2 : room.p
                        
                        db.updateKoin(winner, WIN_REWARD)
                        
                        await sock.sendMessage(room.chat, {
                            text: `⏱️ *TIMEOUT!*\n\n` +
                                `@${afk.split('@')[0]}no eligiendo!\n` +
                                `@${winner.split('@')[0]}ganaste! +Rp${WIN_REWARD.toLocaleString()}`,
                            mentions: [afk, winner]
                        })
                    }
                    delete global.suitGames[roomId]
                }
            }, TIMEOUT)
            
            return true
        }
        
        if (/^(tolak|gamau|nanti|ga(k.)?bisa|no|tidak)$/i.test(text)) {
            clearTimeout(room.timeout)
            
            await sock.sendMessage(room.chat, {
                text: `❌ @${room.p2.split('@')[0]}menolak desafio!\nSuit cancelado.`,
                mentions: [room.p2]
            })
            
            delete global.suitGames[roomId]
            return true
        }
    }
    
    if (room.status === 'playing' && !m.isGroup) {
        const choices = /^(batu|gunting|kertas)$/i
        
        if (!choices.test(text)) return false
        
        const choice = text.toLowerCase()
        
        if (m.sender === room.p && !room.pilih) {
            room.pilih = choice
            await m.reply(`✅Estás escogiendo.${choice}* ${EMOJI[choice]}\n\n* Waitin ' *`)
            
            if (!room.pilih2) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 @${room.p.split('@')[0]}ya eligiendo!\nWaitin '${room.p2.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }
        
        if (m.sender === room.p2 && !room.pilih2) {
            room.pilih2 = choice
            await m.reply(`✅Estás escogiendo.${choice}* ${EMOJI[choice]}\n\n* Waitin ' *`)
            
            if (!room.pilih) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 @${room.p2.split('@')[0]}ya eligiendo!\nWaitin '${room.p.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }
        
        if (room.pilih && room.pilih2) {
            clearTimeout(room.timeout)
            
            let winner = null
            let tie = false
            
            if (room.pilih === room.pilih2) {
                tie = true
            } else if (
                (room.pilih === 'batu' && room.pilih2 === 'gunting') ||
                (room.pilih === 'gunting' && room.pilih2 === 'kertas') ||
                (room.pilih === 'kertas' && room.pilih2 === 'batu')
            ) {
                winner = room.p
            } else {
                winner = room.p2
            }
            
            let resultTxt = `✊✌️✋ *ʜᴀsɪʟ sᴜɪᴛ*\n\n`
            resultTxt += `@${room.p.split('@')[0]} ${EMOJI[room.pilih]} ${room.pilih}\n`
            resultTxt += `@${room.p2.split('@')[0]} ${EMOJI[room.pilih2]} ${room.pilih2}\n\n`
            
            if (tie) {
                resultTxt += `🤝 *SERI!*`
            } else {
                db.updateKoin(winner, WIN_REWARD)
                
                resultTxt += `🏆 @${winner.split('@')[0]}ganaste!\n`
                resultTxt += `> +Rp ${WIN_REWARD.toLocaleString()}`
            }
            
            await sock.sendMessage(room.chat, {
                text: resultTxt,
                mentions: [room.p, room.p2]
            }, { quoted: m })
            
            delete global.suitGames[roomId]
        }
        
        return true
    }
    
    return false
}

exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
