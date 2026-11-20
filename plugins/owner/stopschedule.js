"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuschedulerjs = require('../../src/lib/almiku-scheduler.js');
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Parar el programador absoluto o todo',
    usage: '.stopschedule <nombre|all>',
    example: '.stopschedule alquiler',
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
• \`límite\`- Investigación de Límites de Dairy
• \`groupschedule\` - Group Schedule
• \`alquiler\`- Alquiler de cheques
• \`messages\` - Scheduled Messages
• \`ahl\`- Todo el schedler

*Example:*
\`.stopschedule alquiler\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        const result = _almikuschedulerjs.stopSchedulerByName.call(void 0, target);
        
        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪʜᴇɴᴛɪᴋᴀɴ*

> Scheduler: *${result.name}*
> Estado:❌Detenido

*Usarlo*\`.startschedule ${target}\`para reactivar _`);
        } else {
            await m.reply(`❌No se encuentra o ya está deshabilitado

Usa\`- Detenga la hora.\`para ver la lista de programadores`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
