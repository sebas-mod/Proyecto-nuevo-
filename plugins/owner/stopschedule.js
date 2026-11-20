"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinschedulerjs = require('../../src/lib/ourin-scheduler.js');
var _ourinsholatschedulerjs = require('../../src/lib/ourin-sholat-scheduler.js');
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Menghentikan scheduler tertentu atau semua',
    usage: '.stopschedule <nama|all>',
    example: '.stopschedule sholat',
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
            const helpText = `🛑 *sᴛᴏᴘ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.stopschedule <nama>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checker
• \`messages\` - Scheduled Messages
• \`sholat\` - Sholat Scheduler
• \`all\` - Semua scheduler

*Example:*
\`.stopschedule sholat\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'sholat') {
            const db = _ourindatabasejs.getDatabase.call(void 0, );
            const wasEnabled = db.setting('autoSholat');
            
            if (!wasEnabled) {
                await m.reply(`ℹ️ Sholat Scheduler sudah dalam keadaan nonaktif`);
                return;
            }
            
            _ourinsholatschedulerjs.stopSholatScheduler.call(void 0, );
            db.setting('autoSholat', false);
            
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *Sholat Scheduler*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule sholat\` untuk mengaktifkan kembali_`);
            return;
        }
        
        if (target === 'all') {
            _ourinsholatschedulerjs.stopSholatScheduler.call(void 0, );
            const db = _ourindatabasejs.getDatabase.call(void 0, );
            db.setting('autoSholat', false);
        }
        
        const result = _ourinschedulerjs.stopSchedulerByName.call(void 0, target);
        
        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Gunakan \`.startschedule ${target}\` untuk mengaktifkan kembali_`);
        } else {
            await m.reply(`❌ Scheduler tidak ditemukan atau sudah nonaktif

Gunakan \`.stopschedule\` untuk melihat daftar scheduler`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
