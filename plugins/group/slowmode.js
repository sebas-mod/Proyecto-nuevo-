"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'slowmode',
    alias: ['slow', 'setslowmode'],
    category: 'group',
    description: 'Slowmode grupo—límite de entrada de mensaje de carga',
    usage: '.slowmode <on/off/onlycommand> [detik]',
    example: '.slowmode on 30',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const lastMessageTime = new Map()

const PRESETS = {
    santai: 10,
    normal: 30,
    ketat: 60,
    superketat: 120,
    max: 300,
}

const MODES = {
    all: 'Todos los mensajes + comando están cifrados',
    onlycommand: 'Command di-silent, chat biasa tetap jalan',
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const subCmd = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    let groupData = db.getGroup(m.chat) || {}

    if (!subCmd || subCmd === 'status') {
        const sm = groupData.slowmode || {}
        const enabled = sm.enabled
        const delay = sm.delay || 30
        const mode = sm.mode || 'all'
        const presetList = Object.entries(PRESETS)
            .map(([name, sec]) => `  *.slowmode ${name}* — ${sec}s`)
            .join('\n')

        return m.reply(
            `🐢 *SLOWMODE*\n\n` +
            `Status: ${enabled ? `✅ ON (${delay}s)` : '❌ OFF'}\n` +
            `Mode: *${mode}*\n\n` +
            `*Uso:*\n` +
            `*Voy a estar bien* *Voy a estar bien*—todos los mensajes + comando\n` +
            `*. lentomode only comandard 30 *—comando only\n` +
            `*.slowmode off* — nonaktifkan\n\n` +
            `*Preset:*\n${presetList}\n\n` +
            `*Mode:*\n` +
            `* ahl *—eliminar todos los mensajes en demora\n` +
            `* Solo commando *—silenciosa orden, chat gratuito\n\n` +
            `*Aminencia* *El dueño no está afectado*`
        )
    }

    if (subCmd === 'off') {
        db.setGroup(m.chat, { ...groupData, slowmode: { enabled: false } })
        return m.reply(`✅Slowmode *desactivado*`)
    }

    let mode = 'all'
    let delay
    let delayArg

    if (subCmd === 'onlycommand' || subCmd === 'oc') {
        mode = 'onlycommand'
        delayArg = args[1]
    } else if (subCmd === 'on' || subCmd === 'set') {
        delayArg = args[1]
    } else if (PRESETS[subCmd]) {
        delay = PRESETS[subCmd]
        mode = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]) === 'onlycommand' || _optionalChain([args, 'access', _7 => _7[1], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()]) === 'oc'
            ? 'onlycommand' : 'all'
    } else {
        delay = parseInt(subCmd)
        if (isNaN(delay)) {
            return m.reply(`❌Uso *. lento en 30 * o *. lentomode sólo comandd 30 *`)
        }
    }

    if (!delay) {
        if (delayArg && PRESETS[delayArg]) {
            delay = PRESETS[delayArg]
        } else {
            delay = parseInt(delayArg) || 30
        }
    }

    if (delay < 5 || delay > 600) {
        return m.reply(`❌El retraso debe estar en la quinta.–600 segundo`)
    }

    db.setGroup(m.chat, {
        ...groupData,
        slowmode: { enabled: true, delay, mode }
    })

    const presetName = _optionalChain([Object, 'access', _10 => _10.entries, 'call', _11 => _11(PRESETS), 'access', _12 => _12.find, 'call', _13 => _13(([, v]) => v === delay), 'optionalAccess', _14 => _14[0]])
    const label = presetName ? ` (${presetName})` : ''
    const modeDesc = MODES[mode]

    await m.reply(
        `✅Slowmode *activo*\n\n` +
        `Delay: *${delay}segundo*${label}\n` +
        `Mode: *${mode}*\n` +
        `${modeDesc}\n\n` +
        `*Aminencia* *El dueño no está afectado*`
    )
}

function checkSlowmode(m, sock, db) {
    if (!m.isGroup) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!_optionalChain([groupData, 'access', _15 => _15.slowmode, 'optionalAccess', _16 => _16.enabled])) return false

    const sm = groupData.slowmode
    const mode = sm.mode || 'all'

    if (mode === 'onlycommand' && !m.isCommand) return false

    const delay = sm.delay || 30
    const key = `${m.chat}_${m.sender}`
    const now = Date.now()

    const lastTime = lastMessageTime.get(key) || 0
    const timePassed = (now - lastTime) / 1000

    if (timePassed < delay) {
        return { remaining: Math.ceil(delay - timePassed), mode }
    }

    lastMessageTime.set(key, now)

    if (lastMessageTime.size > 5000) {
        const cutoff = now - 600000
        for (const [k, v] of lastMessageTime) {
            if (v < cutoff) lastMessageTime.delete(k)
        }
    }

    return false
}

exports.config = pluginConfig; exports.handler = handler; exports.checkSlowmode = checkSlowmode;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
