"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _perf_hooks = require('perf_hooks');
var _child_process = require('child_process');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
    name: 'ping2',
    alias: ['speed2', 'p2', 'latency2', 'sys2', 'status2'],
    category: 'main',
    description: 'Compruebe la entrada y el estado de los verdaderos sistemas de bot ',
    usage: '.ping2',
    example: '.ping2',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const fmtSize = (b) => {
    if (!b || b === 0) return '0 B'
    const u = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(b) / Math.log(1024))
    return (b / Math.pow(1024, i)).toFixed(1) + ' ' + u[i]
}

const fmtUp = (s) => {
    s = Number(s)
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sc = Math.floor(s % 60)
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m ${sc}s`
    return `${m}m ${sc}s`
}

function getNetwork() {
    try {
        const ifaces = _os2.default.networkInterfaces()
        let active = 'N/A'
        for (const [name, addrs] of Object.entries(ifaces)) {
            if (name.toLowerCase().includes('lo')) continue
            for (const a of addrs) {
                if (a.family === 'IPv4' && !a.internal) {
                    active = name
                    break
                }
            }
        }
        return { iface: active }
    } catch (e) {
        return { iface: 'N/A' }
    }
}

async function handler(m, { sock }) {
    const execStart = _perf_hooks.performance.now()
    await m.react('🕕')

    try {
        const t0 = m.messageTimestamp ? (m.messageTimestamp * 1000) : Date.now()
        const waRoundtrip = Math.max(1, Date.now() - t0)

        const cpus = _os2.default.cpus()
        const totalMem = _os2.default.totalmem()
        const freeMem = _os2.default.freemem()

        let cpuPct = Math.max(1, Math.min(100, _os2.default.loadavg()[0] / cpus.length * 100)).toFixed(1)

        let diskTotal = 0, diskUsed = 0
        try {
            if (process.platform === 'win32') {
                const w = _child_process.execSync.call(void 0, "wmic logicaldisk where \"DeviceID='C:'\" get Size,FreeSpace /format:value", { encoding: 'utf-8' })
                const fm = w.match(/FreeSpace=(\d+)/), sm = w.match(/Size=(\d+)/)
                if (sm && fm) {
                    diskTotal = parseInt(sm[1])
                    diskUsed = diskTotal - parseInt(fm[1])
                }
            } else {
                const df = _child_process.execSync.call(void 0, 'df -k --output=size,used /').toString().trim().split('\n')
                if (df.length > 1) {
                    const p = df[1].trim().split(/\s+/).map(Number)
                    if (p.length >= 2) {
                        diskTotal = p[0] * 1024
                        diskUsed = p[1] * 1024
                    }
                }
            }
        } catch (e2) {}

        const heap = process.memoryUsage()
        const net = await getNetwork()

        let dbUsers = 0, dbGroups = 0, dbPremium = 0
        try {
            const db = _almikudatabasejs.getDatabase.call(void 0, )
            if (_optionalChain([db, 'optionalAccess', _ => _.data])) {
                dbUsers = Object.keys(db.data.users || {}).length
                dbGroups = Object.keys(db.data.groups || {}).length
                dbPremium = Object.values(db.data.users || {}).filter(u => u.isPremium).length
            }
        } catch (e3) {}

        const totalExec = Math.round(_perf_hooks.performance.now() - execStart)

        const tableData = [
            ['WA Roundtrip', `${waRoundtrip} ms`],
            ['Su velocidad respuesta bot.', `${totalExec} ms`],
            ['Status', 'Online'],
            ['Hostname', _os2.default.hostname()],
            ['Platform', `${_os2.default.platform()} ${_os2.default.arch()}`],
            ['Node', process.version],
            ['CPU', `${_optionalChain([cpus, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.model, 'optionalAccess', _4 => _4.slice, 'call', _5 => _5(0, 25)])}`],
            ['Cores', `${cpus.length}`],
            ['CPU Load', `${cpuPct}%`],
            ['RAM', `${fmtSize(totalMem - freeMem)} / ${fmtSize(totalMem)}`],
            ['Heap', `${fmtSize(heap.heapUsed)} / ${fmtSize(heap.heapTotal)}`],
            ['Disk', `${fmtSize(diskUsed)} / ${fmtSize(diskTotal)}`],
            ['Network', net.iface],
            ['Users', `${dbUsers}`],
            ['Premium', `${dbPremium}`],
            ['Groups', `${dbGroups}`],
            ['Hora de subir', fmtUp(process.uptime())],
            ['Uptime Server', fmtUp(_os2.default.uptime())],
        ]

        await sock.sendTable(
            m.chat,
            '⚡ System Performance',
            ['Metric', 'Value'],
            tableData,
            m,
            {
                headerText: `${_optionalChain([_configjs2.default, 'access', _6 => _6.bot, 'optionalAccess', _7 => _7.name]) || 'Al Miku-AI'}*Estado*\n\n-🎄Está es la estática de nuestras botas.`,
                footer: '🍃 Realtime Monitoring'
            }
        )

        await m.react('✅')
    } catch (error) {
        await m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
