"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinschedulerjs = require('../../src/lib/ourin-scheduler.js');
var _ourinsholatschedulerjs = require('../../src/lib/ourin-sholat-scheduler.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'startschedule',
    alias: ['startscheduler', 'schedstart', 'resumeschedule'],
    category: 'owner',
    description: 'Memulai ulang scheduler tertentu atau semua',
    usage: '.startschedule <nama|all>',
    example: '.startschedule sholat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
        
        if (!target) {
            const helpText = `▶️ *sᴛᴀʀᴛ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.startschedule <nama>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`sholat\` - Sholat Scheduler
• \`all\` - Semua scheduler

*Example:*
\`.startschedule sholat\`
\`.startschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = _ourindatabasejs.getDatabase.call(void 0, );
            const wasEnabled = db.setting('autoSholat');
            
            if (wasEnabled) {
                await m.reply(`ℹ️ Sholat Scheduler sudah dalam keadaan aktif`);
                return;
            }
            
            _ourinsholatschedulerjs.initSholatScheduler.call(void 0, sock);
            db.setting('autoSholat', true);
            
            await m.reply(`▶️ *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪᴍᴜʟᴀɪ*

> Scheduler: *Sholat Scheduler*
> Status: ✅ Aktif

_Notifikasi waktu sholat akan dikirim ke grup yang mengaktifkan fitur ini_`);
            return;
        }
        
        if (target === 'all') {
            _ourinsholatschedulerjs.initSholatScheduler.call(void 0, sock);
            const db = _ourindatabasejs.getDatabase.call(void 0, );
            db.setting('autoSholat', true);
        }
        
        const result = _ourinschedulerjs.startSchedulerByName.call(void 0, target, sock);
        
        if (result.started) {
            await m.reply(`▶️ *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪᴍᴜʟᴀɪ*

> Scheduler: *${result.name}*
> Status: ✅ Aktif

_Scheduler telah dimulai kembali_`);
        } else {
            await m.reply(`❌ Scheduler tidak ditemukan atau sudah aktif

Gunakan \`.startschedule\` untuk melihat daftar scheduler`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
