"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikuschedulerjs = require('../../src/lib/almiku-scheduler.js');
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'cekschedule',
    alias: ['cekscheduler', 'schedulerstatus', 'schedstatus'],
    category: 'owner',
    description: 'Mira todo el estado del programador',
    usage: '.cekschedule',
    example: '.cekschedule',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const status = _almikuschedulerjs.getFullSchedulerStatus.call(void 0, );

        let text = `📊 *sᴄʜᴇᴅᴜʟᴇʀ sᴛᴀᴛᴜs*\n\n`;

        for (const sched of status.schedulers) {
            const statusIcon = sched.running ? '✅' : '❌';
            text += `${statusIcon} *${sched.name}*\n`;
            text += `   └ Key: \`${sched.key}\`\n`;
            text += `   └ ${sched.description}\n`;

            if (sched.lastRun && sched.lastRun !== '-' && sched.lastRun !== 'Never') {
                text += `   └ Last: ${sched.lastRun}\n`;
            }

            if (sched.stats) {
                if (sched.stats.totalResets) {
                    text += `   └ Total Resets: ${sched.stats.totalResets}\n`;
                }
                if (sched.stats.activeMessages !== undefined) {
                    text += `   └ Active: ${sched.stats.activeMessages} | Sent: ${sched.stats.totalSent}\n`;
                }
            }
            text += `\n`;
        }


        text += `\n`;
        text += `━━━━━━━━━━━━━━━━━━━\n`;
        text += `✅Activo: ${status.summary.totalActive}\n`;
        text += `❌Inactivo: ${status.summary.totalInactive}\n\n`;

        text += `> Usa\`- Detenga la hora.<key>\`para stop\n`;
        text += `> Usa\`- Horario.<key>\`para start`;

        await m.reply(text);
    } catch (error) {
        console.error('[CekSchedule Error]', error);
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
