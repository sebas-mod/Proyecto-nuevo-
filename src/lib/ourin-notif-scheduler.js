"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('./ourin-database.js');
var _ourinloggerjs = require('./ourin-logger.js');
var _cron = require('cron');

const TZ = 'Asia/Jakarta'

let sock = null
const notifCronJobs = new Map()
let refreshJob = null

const MAKAN_MESSAGES = [
    '🍽# Hora de comer #{label}*\n\n⏰*{jam}¿Qué demonios?\n\nNo omitas tu comida, necesitas consumo de energía para mantenerla productiva.💪\n{menu}\n\n📌♪ Establecer por @{sender}¿Qué?',
    '🥗* Heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee{sender}, las horas han terminado{jam}aquí!*\n\nEs hora de un cuerpo completo.🍛\n¡La comida nutritiva es mantener el calcetín!\n{menu}',
    '🍜*Reminder come{label}*\n\n⏰*{jam}¿Qué demonios?\n\nPareja vacio bikin humor feo lho😤\nComamos antes de continuar la actividad.\n{menu}\n\n📌♪ Establecer por @{sender}¿Qué?',
    '🍜 *Come Antes WOYY @{sender}*\n\nUsar?{menu}',
]

const TIDUR_MESSAGES = [
    '🌙¡El tiempo es el descanso!\n\n⏰*{jam}¿Qué demonios?\n\nBaja el teléfono. Cierra los ojos.😴\n¡Pon suficiente aliento fresco en la cama!\n*Feliz noche*🌟\n\n📌♪ Establecer por @{sender}¿Qué?',
    '💤*Ya hora{jam}aquí @{sender}*\n\nDescanse, no siga luchando🛏♪\nEs la inversión más preciosa\nSueño en, sí✨',
    '😴*Noches deslumbrantes*\n\n⏰*{jam}¿Qué demonios?\n\nEl HP es un enemigo dormido.📵\n¡Apague las notificaciones y los cambios ahora!\n*Buenas noches*🌜\n\n📌♪ Establecer por @{sender}¿Qué?',
    '*TURU WOYY @{sender}*\n\n⏰ Udah jam *{jam}*',
]

function getRandomMessage(templates, jam, menu, label, senderJid) {
    const idx = Math.floor(Math.random() * templates.length)
    const senderMention = senderJid ? senderJid.split('@')[0] : ''
    let msg = templates[idx]
        .replace(/\{jam\}/g, jam)
        .replace(/\{label\}/g, label || '')
        .replace(/\{menu\}/g, menu ? `🍴 _${menu}_` : '')
        .replace(/\{sender\}/g, senderMention)
    return msg.trim()
}

function getMealLabel(jam) {
    const hour = parseInt(jam.split(':')[0], 10)
    if (hour >= 4 && hour < 10) return 'pagi'
    if (hour >= 10 && hour < 15) return 'siang'
    if (hour >= 15 && hour < 18) return 'sore'
    return 'malam'
}

function clearNotifCronJobs() {
    for (const [, job] of notifCronJobs) job.stop()
    notifCronJobs.clear()
}

function buildCronJobs() {
    clearNotifCronJobs()
    if (!sock) return

    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const makanData = db.setting('notifMakan') || {}
    const tidurData = db.setting('notifTidur') || {}
    const todayStr = new Date(new Date().toLocaleString('en-US', { timeZone: TZ })).toISOString().slice(0, 10)

    for (const [key, entry] of Object.entries(makanData)) {
        if (!entry.enabled || !entry.jadwal) continue
        for (const jam of entry.jadwal) {
            const [h, m] = jam.split(':').map(Number)
            const cronKey = `Comer${key}_${jam}`
            if (notifCronJobs.has(cronKey)) continue

            const job = new (0, _cron.CronJob)(`${m} ${h} * * *`, async () => {
                await processEntry(entry, jam, 'makan', key, db, todayStr)
            }, null, true, TZ)

            notifCronJobs.set(cronKey, job)
        }
    }

    for (const [key, entry] of Object.entries(tidurData)) {
        if (!entry.enabled || !entry.jadwal) continue
        for (const jam of entry.jadwal) {
            const [h, m] = jam.split(':').map(Number)
            const cronKey = `Duerme.${key}_${jam}`
            if (notifCronJobs.has(cronKey)) continue

            const job = new (0, _cron.CronJob)(`${m} ${h} * * *`, async () => {
                await processEntry(entry, jam, 'tidur', key, db, todayStr)
            }, null, true, TZ)

            notifCronJobs.set(cronKey, job)
        }
    }

    _ourinloggerjs.logger.info('NotifScheduler', `Ahí está.${notifCronJobs.size}La alarma es la otra salida.${TZ})`)
}

async function processEntry(entry, jam, type, key, db, dateStr) {
    const lastSent = entry.lastSent || {}
    const sentKey = `${jam}_${dateStr}`
    if (lastSent[sentKey]) return

    try {
        const templates = type === 'makan' ? MAKAN_MESSAGES : TIDUR_MESSAGES
        const label = type === 'makan' ? getMealLabel(jam) : ''
        const menu = entry.menu || ''
        const text = getRandomMessage(templates, jam, menu, label, entry.sender)

        const isGroup = entry.chatJid.endsWith('@g.us')
        let mentions = [entry.sender]

        if (isGroup) {
            try {
                const meta = await sock.groupMetadata(entry.chatJid)
                const participants = (meta.participants || []).map(p => p.id)
                mentions = [...new Set([entry.sender, ...participants])]
            } catch (e) {}
        }

        await sock.sendMessage(entry.chatJid, { text, mentions })

        lastSent[sentKey] = true
        entry.lastSent = lastSent

        const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
        const allData = db.setting(settingKey) || {}
        allData[key] = entry
        db.setting(settingKey, allData)

        cleanOldSentKeys(lastSent)
        _ourinloggerjs.logger.info('NotifScheduler', `Sukses envía asuma${type} ke ${entry.chatJid} (${jam})`)

        await new Promise(r => setTimeout(r, 300))
    } catch (err) {
        _ourinloggerjs.logger.error('NotifScheduler', `Alarma de emisión de gagalm${type} ke ${entry.chatJid}: ${err.message}`)
    }
}

function cleanOldSentKeys(lastSent) {
    const keys = Object.keys(lastSent)
    if (keys.length <= 20) return
    const sorted = keys.sort()
    const toRemove = sorted.slice(0, sorted.length - 10)
    for (const k of toRemove) delete lastSent[k]
}

function getNotifKey(sender, chatJid) {
    return `${sender}_${chatJid}`
}

function setNotifMakan(sender, chatJid, jadwal, menu) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const data = db.setting('notifMakan') || {}
    const key = getNotifKey(sender, chatJid)
    data[key] = {
        sender, chatJid, jadwal,
        menu: menu || '',
        enabled: true,
        lastSent: _optionalChain([data, 'access', _ => _[key], 'optionalAccess', _2 => _2.lastSent]) || {},
        createdAt: _optionalChain([data, 'access', _3 => _3[key], 'optionalAccess', _4 => _4.createdAt]) || Date.now()
    }
    db.setting('notifMakan', data)
    buildCronJobs()
    return data[key]
}

function setNotifTidur(sender, chatJid, jadwal) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const data = db.setting('notifTidur') || {}
    const key = getNotifKey(sender, chatJid)
    data[key] = {
        sender, chatJid, jadwal,
        enabled: true,
        lastSent: _optionalChain([data, 'access', _5 => _5[key], 'optionalAccess', _6 => _6.lastSent]) || {},
        createdAt: _optionalChain([data, 'access', _7 => _7[key], 'optionalAccess', _8 => _8.createdAt]) || Date.now()
    }
    db.setting('notifTidur', data)
    buildCronJobs()
    return data[key]
}

function toggleNotif(type, sender, chatJid, enabled) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
    const data = db.setting(settingKey) || {}
    const key = getNotifKey(sender, chatJid)
    if (!data[key]) return null
    data[key].enabled = enabled
    db.setting(settingKey, data)
    buildCronJobs()
    return data[key]
}

function getNotif(type, sender, chatJid) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
    const data = db.setting(settingKey) || {}
    return data[getNotifKey(sender, chatJid)] || null
}

function deleteNotif(type, sender, chatJid) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const settingKey = type === 'makan' ? 'notifMakan' : 'notifTidur'
    const data = db.setting(settingKey) || {}
    const key = getNotifKey(sender, chatJid)
    if (!data[key]) return false
    delete data[key]
    db.setting(settingKey, data)
    buildCronJobs()
    return true
}

function parseJadwal(input) {
    const times = input.split(',').map(t => t.trim()).filter(Boolean)
    const valid = []
    for (const t of times) {
        const match = t.match(/^(\d{1,2})[.:](\d{2})$/)
        if (!match) continue
        const h = parseInt(match[1], 10)
        const m = parseInt(match[2], 10)
        if (h < 0 || h > 23 || m < 0 || m > 59) continue
        valid.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
    return [...new Set(valid)].sort()
}

function initNotifScheduler(socketInstance) {
    sock = socketInstance

    if (refreshJob) refreshJob.stop()
    refreshJob = new (0, _cron.CronJob)('1 0 * * *', () => {
        buildCronJobs()
    }, null, true, TZ)

    buildCronJobs()
    _ourinloggerjs.logger.info('NotifScheduler', 'Sistem alarm makan & tidur otomatis udah jalan mantap')
}

function stopNotifScheduler() {
    clearNotifCronJobs()
    if (refreshJob) {
        refreshJob.stop()
        refreshJob = null
    }
    _ourinloggerjs.logger.info('NotifScheduler', 'Sistem alarm udah dimatiin')
}





exports.initNotifScheduler = initNotifScheduler; exports.stopNotifScheduler = stopNotifScheduler; exports.setNotifMakan = setNotifMakan; exports.setNotifTidur = setNotifTidur; exports.toggleNotif = toggleNotif; exports.getNotif = getNotif; exports.deleteNotif = deleteNotif; exports.parseJadwal = parseJadwal;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
