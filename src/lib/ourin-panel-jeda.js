"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const DEFAULT_JEDA = 5 * 60 * 1000

function formatTime(ms) {
    if (ms <= 0) return '0 detik'
    
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours} jam ${minutes % 60} menit`
    if (minutes > 0) return `${minutes} menit ${seconds % 60} detik`
    return `${seconds} detik`
}

function checkPanelJeda(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    const storedJeda = db.setting('panelCreateJeda')
    const jedaMs = storedJeda !== undefined && storedJeda !== null ? storedJeda : DEFAULT_JEDA
    
    if (jedaMs === 0) return { allowed: true }
    
    const lastUsed = db.setting('panelCreateLastUsed') || 0
    const now = Date.now()
    const elapsed = now - lastUsed
    
    if (elapsed < jedaMs) {
        const remaining = jedaMs - elapsed
        return {
            allowed: false,
            remaining: remaining,
            message: `⏱️ *ᴊᴇᴅᴀ ᴀᴋᴛɪꜰ*\n\n` +
                `> Mohon tunggu *${formatTime(remaining)}* sebelum membuat panel lagi.\n\n` +
                `> _Jeda ini berlaku untuk semua user._\n` +
                `> _Gunakan \`.cekjeda\` untuk cek status._`
        }
    }
    
    return { allowed: true }
}

async function setPanelLastUsed() {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    db.setting('panelCreateLastUsed', Date.now())
    await db.save()
}

function getJedaInfo() {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const storedJeda = db.setting('panelCreateJeda')
    const jedaMs = storedJeda !== undefined && storedJeda !== null ? storedJeda : DEFAULT_JEDA
    const lastUsed = db.setting('panelCreateLastUsed') || 0
    const now = Date.now()
    const elapsed = now - lastUsed
    const remaining = Math.max(0, jedaMs - elapsed)
    
    return {
        jedaMs,
        lastUsed,
        elapsed,
        remaining,
        isReady: remaining === 0 || jedaMs === 0
    }
}

exports.checkPanelJeda = checkPanelJeda; exports.setPanelLastUsed = setPanelLastUsed; exports.formatTime = formatTime; exports.getJedaInfo = getJedaInfo; exports.DEFAULT_JEDA = DEFAULT_JEDA;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
