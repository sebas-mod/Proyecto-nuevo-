"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'resetdb',
    alias: ['cleardb', 'wipedb'],
    category: 'owner',
    description: 'Reset semua data database',
    usage: '.resetdb [confirm]',
    example: '.resetdb confirm',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

if (!global.resetDbPending) global.resetDbPending = {}

async function handler(m, { sock }) {
    if (!_configjs2.default.isOwner(m.sender)) {
        return m.reply('❌*Propietario Only!*')
    }
    
    const confirm = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()])
    
    if (confirm !== 'confirm') {
        global.resetDbPending[m.sender] = Date.now()
        
        return m.reply(
            `⚠️ *ᴘᴇʀɪɴɢᴀᴛᴀɴ!*\n\n` +
            `Esto borrará los datos:\n` +
            `> • Data user\n` +
            `> • Data group\n` +
            `> • Data clan\n` +
            `••Todas las estadísticas\n\n` +
            `╭┈┈⬡「 ⚠️ *ᴋᴏɴғɪʀᴍᴀsɪ* 」\n` +
            `┃Escribí: *.resetdb confirmar*\n` +
            `┃en 60 segundos\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `•❌¡Está acción está fuera de la mesa!`
        )
    }
    
    const pending = global.resetDbPending[m.sender]
    if (!pending || (Date.now() - pending) > 60000) {
        delete global.resetDbPending[m.sender]
        return m.reply(`❌¡Tiempo fuera!`)
    }
    
    delete global.resetDbPending[m.sender]
    
    try {
        const dbPath = _path2.default.join(process.cwd(), 'database', 'db.json')
        const backupPath = _path2.default.join(process.cwd(), 'database', `db_backup_${Date.now()}.json`)
        
        if (_fs2.default.existsSync(dbPath)) {
            _fs2.default.copyFileSync(dbPath, backupPath)
        }
        
        const db = _almikudatabasejs.getDatabase.call(void 0, )
        
        let userCount = 0
        let groupCount = 0
        let clanCount = 0
        
        if (_optionalChain([db, 'access', _5 => _5.db, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.users])) {
            userCount = Object.keys(db.db.data.users).length
            db.db.data.users = {}
        }
        
        if (_optionalChain([db, 'access', _8 => _8.db, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.groups])) {
            groupCount = Object.keys(db.db.data.groups).length
            db.db.data.groups = {}
        }
        
        if (_optionalChain([db, 'access', _11 => _11.db, 'optionalAccess', _12 => _12.data, 'optionalAccess', _13 => _13.clans])) {
            clanCount = Object.keys(db.db.data.clans).length
            db.db.data.clans = {}
        }
        
        await db.save()
        
        await m.reply(
            `✅ *ᴅᴀᴛᴀʙᴀsᴇ ᴅɪʀᴇsᴇᴛ!*\n\n` +
            `╭┈┈⬡「 📊 *ᴅᴀᴛᴀ ᴅɪʜᴀᴘᴜs* 」\n` +
            `┃ 👤 Users: ${userCount}\n` +
            `┃ 👥 Groups: ${groupCount}\n` +
            `┃ ⚔️ Clans: ${clanCount}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `*Retrocedido en:*\n` +
            `> \`${_path2.default.basename(backupPath)}\``
        )
        
    } catch (error) {
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
