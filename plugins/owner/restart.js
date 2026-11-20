"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _child_process = require('child_process');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'restart',
    alias: ['reset', 'reboot', 'restartbot'],
    category: 'owner',
    description: 'Restart bot process (real restart)',
    usage: '.restart',
    example: '.restart',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        await m.react('🔄')
        
        const startTime = Date.now()
        
        await sock.sendMessage(m.chat, {
            text: `🔄 *ʀᴇsᴛᴀʀᴛɪɴɢ ʙᴏᴛ...*\n\n` +
                  `╭┈┈⬡「 📊 *ɪɴꜰᴏ* 」\n` +
                  `┃ ⏰ Time: ${new Date().toLocaleTimeString('id-ID')}\n` +
                  `┃ 🔧 Method: Process Spawn\n` +
                  `┃ 📦 PID: ${process.pid}\n` +
                  `╰┈┈⬡\n\n` +
                  `> Bot akan restart dalam 2 detik...\n` +
                  `> Proses mungkin memakan waktu 10-30 detik`
        }, { quoted: m })
        
        console.log('[Restart] Command triggered by:', m.sender)
        console.log('[Restart] Initiating graceful restart...')
        
        setTimeout(() => {
            const cwd = process.cwd()
            const isWindows = process.platform === 'win32'
            
            let command, args
            
            if (isWindows) {
                command = 'cmd.exe'
                args = ['/c', 'start', '/b', 'node', 'index.js']
            } else {
                command = 'node'
                args = ['index.js']
            }
            
            const child = _child_process.spawn.call(void 0, command, args, {
                cwd: cwd,
                detached: true,
                stdio: 'ignore',
                shell: isWindows,
                env: { ...process.env, RESTARTED: 'true', RESTART_TIME: startTime.toString() }
            })
            
            child.unref()
            
            console.log('[Restart] New process spawned, exiting current process...')
            
            setTimeout(() => {
                process.exit(0)
            }, 500)
            
        }, 2000)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
