"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _archiver = require('archiver'); var _archiver2 = _interopRequireDefault(_archiver);
var _ourintimejs = require('./ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
const DATABASE_DIR = _path2.default.join(process.cwd(), 'database')
const TEMP_DIR = _path2.default.join(process.cwd(), 'temp')

const SCHEMA_VERSION = '1.0.0'

function getBackupMetadata() {
    return {
        schemaVersion: SCHEMA_VERSION,
        createdAt: new Date().toISOString(),
botVersion: '1.0.0',
        nodeVersion: process.version,
        platform: process.platform,
        files: 0
    }
}

function ensureDir(dir) {
    if (!_fs2.default.existsSync(dir)) {
        _fs2.default.mkdirSync(dir, { recursive: true })
    }
}

async function createDatabaseBackup() {
    return new Promise((resolve, reject) => {
        ensureDir(TEMP_DIR)
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const backupPath = _path2.default.join(TEMP_DIR, `store_backup_${timestamp}.zip`)
        
        const output = _fs2.default.createWriteStream(backupPath)
        const archive = _archiver2.default.call(void 0, 'zip', { zlib: { level: 9 } })
        
        const metadata = getBackupMetadata()
        let fileCount = 0
        
        output.on('close', () => {
            metadata.files = fileCount
            metadata.size = archive.pointer()
            resolve({
                path: backupPath,
                size: archive.pointer(),
                fileCount,
                timestamp,
                metadata
            })
        })
        
        archive.on('error', reject)
        archive.on('entry', () => fileCount++)
        archive.pipe(output)
        
        archive.append(JSON.stringify(metadata, null, 2), { name: 'backup_metadata.json' })
        
        if (_fs2.default.existsSync(DATABASE_DIR)) {
            _fs2.default.promises.readdir(DATABASE_DIR, { withFileTypes: true }).then(entries => {
                for (const entry of entries) {
                    const fullPath = _path2.default.join(DATABASE_DIR, entry.name)
                    
                    if (entry.name.endsWith('.zip')) continue
                    
                    if (entry.isDirectory()) {
                        archive.directory(fullPath, `database/${entry.name}`)
                    } else if (entry.isFile()) {
                        archive.file(fullPath, { name: `database/${entry.name}` })
                    }
                }
                
                const storageDir = _path2.default.join(process.cwd(), 'storage')
                if (_fs2.default.existsSync(storageDir)) {
                    const dbFile = _path2.default.join(storageDir, 'database.json')
                    if (_fs2.default.existsSync(dbFile)) {
                        archive.file(dbFile, { name: 'storage/database.json' })
                    }
                }
                
                const rootDbFile = _path2.default.join(process.cwd(), 'db.json')
                if (_fs2.default.existsSync(rootDbFile)) {
                    archive.file(rootDbFile, { name: 'db.json' })
                }
                
                const mainDbFile = _path2.default.join(process.cwd(), 'database', 'main', 'db.json')
                if (_fs2.default.existsSync(mainDbFile)) {
                    archive.file(mainDbFile, { name: 'database/main/db.json' })
                }
                
                archive.finalize()
            }).catch(reject)
        } else {
            archive.finalize()
        }
    })
}

async function sendStoreBackup(sock) {
    if (!sock) {
        console.error('[StoreBackup] Socket not provided')
        return { success: false, error: 'Socket not initialized' }
    }
    
    
    const ownerNumbers = _optionalChain([config, 'access', _ => _.owner, 'optionalAccess', _2 => _2.number]) || []
    
    if (ownerNumbers.length === 0) {
        return { success: false, error: 'No hay configuración de número de propietario' }
    }
    
    const ownerNumber = String(ownerNumbers[0]).replace(/[^0-9]/g, '')
    if (!ownerNumber) {
        return { success: false, error: 'Número de propietario inválido' }
    }
    
    const ownerJid = `${ownerNumber}@s.whatsapp.net`
    
    try {
        console.log('[StoreBackup] Creating database backup...')
        const backupInfo = await createDatabaseBackup()
        
        const sizeInKB = (backupInfo.size / 1024).toFixed(2)
        const sizeDisplay = backupInfo.size > 1024 * 1024 
            ? `${(backupInfo.size / (1024 * 1024)).toFixed(2)} MB`
            : `${sizeInKB} KB`
        
        const caption = 
            `🗃️ *ꜱᴛᴏʀᴇ ʙᴀᴄᴋᴜᴘ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📅Tiempo:${timeHelper.formatDateTime('DD MMMM YYYY HH:mm:ss')} WIB\n` +
            `┃ 📦 Size: ${sizeDisplay}\n` +
            `┃ 📁 Files: ${backupInfo.fileCount}\n` +
            `┃ 🔖 Schema: v${SCHEMA_VERSION}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `*Tipo @-@ respaldo seguro Compatible con versiones futuras*\n` +
            `> ${_optionalChain([config, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || 'Ourin-AI'} Store Backup System`
        
        await sock.sendMessage(ownerJid, {
            document: { url: backupInfo.path },
            mimetype: 'application/zip',
            fileName: _path2.default.basename(backupInfo.path),
            caption
        })
        
        try {
            await _fs2.default.promises.unlink(backupInfo.path)
        } catch (e) {}
        
        console.log(`*Backup Store* *Retrocedido al propietario*${sizeDisplay})`)
        return { success: true, size: sizeDisplay, files: backupInfo.fileCount }
        
    } catch (error) {
        console.error('[StoreBackup] Error:', error.message)
        return { success: false, error: error.message }
    }
}

exports.createDatabaseBackup = createDatabaseBackup; exports.sendStoreBackup = sendStoreBackup; exports.getBackupMetadata = getBackupMetadata; exports.SCHEMA_VERSION = SCHEMA_VERSION;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
