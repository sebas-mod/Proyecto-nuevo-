"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const JADIBOT_AUTH_FOLDER = _path2.default.join(process.cwd(), 'session', 'jadibot')

const jadibotDatabases = new Map()

function getJadibotDbPath(jadibotId) {
    const id = jadibotId.replace(/@.+/g, '')
    return _path2.default.join(JADIBOT_AUTH_FOLDER, id, 'data.json')
}

function loadJadibotDb(jadibotId) {
    const id = jadibotId.replace(/@.+/g, '')
    
    if (jadibotDatabases.has(id)) {
        return jadibotDatabases.get(id)
    }
    
    const dbPath = getJadibotDbPath(id)
    const dir = _path2.default.dirname(dbPath)
    
    if (!_fs2.default.existsSync(dir)) {
        _fs2.default.mkdirSync(dir, { recursive: true })
    }
    
    let data = {
        owners: [],
        premiums: [],
        settings: {},
        users: {},
        groups: {}
    }
    
    if (_fs2.default.existsSync(dbPath)) {
        try {
            const content = _fs2.default.readFileSync(dbPath, 'utf8')
            data = JSON.parse(content)
        } catch (e) {}
    }
    
    jadibotDatabases.set(id, data)
    return data
}

function saveJadibotDb(jadibotId) {
    const id = jadibotId.replace(/@.+/g, '')
    const data = jadibotDatabases.get(id)
    if (!data) return
    
    const dbPath = getJadibotDbPath(id)
    const dir = _path2.default.dirname(dbPath)
    
    if (!_fs2.default.existsSync(dir)) {
        _fs2.default.mkdirSync(dir, { recursive: true })
    }
    
    _fs2.default.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

function isJadibotOwner(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    const senderNum = _optionalChain([jid, 'optionalAccess', _ => _.replace, 'call', _2 => _2(/[^0-9]/g, '')]) || ''
    return db.owners.some(o => o.replace(/[^0-9]/g, '') === senderNum)
}

function addJadibotOwner(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    const num = jid.replace(/[^0-9]/g, '')
    if (!db.owners.includes(num)) {
        db.owners.push(num)
        saveJadibotDb(jadibotId)
        return true
    }
    return false
}

function removeJadibotOwner(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    const num = jid.replace(/[^0-9]/g, '')
    const idx = db.owners.indexOf(num)
    if (idx !== -1) {
        db.owners.splice(idx, 1)
        saveJadibotDb(jadibotId)
        return true
    }
    return false
}

function getJadibotOwners(jadibotId) {
    const db = loadJadibotDb(jadibotId)
    return db.owners
}

function isJadibotPremium(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    const senderNum = _optionalChain([jid, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/[^0-9]/g, '')]) || ''
    return db.premiums.some(p => {
        const premNum = typeof p === 'string' ? p.replace(/[^0-9]/g, '') : _optionalChain([p, 'access', _5 => _5.jid, 'optionalAccess', _6 => _6.replace, 'call', _7 => _7(/[^0-9]/g, '')]) || ''
        return premNum === senderNum
    })
}

function addJadibotPremium(jadibotId, jid, expiry = null) {
    const db = loadJadibotDb(jadibotId)
    const num = jid.replace(/[^0-9]/g, '')
    const existing = db.premiums.find(p => {
        const premNum = typeof p === 'string' ? p : _optionalChain([p, 'access', _8 => _8.jid, 'optionalAccess', _9 => _9.replace, 'call', _10 => _10(/[^0-9]/g, '')]) || ''
        return premNum === num
    })
    
    if (!existing) {
        db.premiums.push({ jid: num, expiry: expiry || null })
        saveJadibotDb(jadibotId)
        return true
    }
    return false
}

function removeJadibotPremium(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    const num = jid.replace(/[^0-9]/g, '')
    const idx = db.premiums.findIndex(p => {
        const premNum = typeof p === 'string' ? p : _optionalChain([p, 'access', _11 => _11.jid, 'optionalAccess', _12 => _12.replace, 'call', _13 => _13(/[^0-9]/g, '')]) || ''
        return premNum === num
    })
    
    if (idx !== -1) {
        db.premiums.splice(idx, 1)
        saveJadibotDb(jadibotId)
        return true
    }
    return false
}

function getJadibotPremiums(jadibotId) {
    const db = loadJadibotDb(jadibotId)
    return db.premiums
}

function getJadibotSetting(jadibotId, key) {
    const db = loadJadibotDb(jadibotId)
    return db.settings[key]
}

function setJadibotSetting(jadibotId, key, value) {
    const db = loadJadibotDb(jadibotId)
    db.settings[key] = value
    saveJadibotDb(jadibotId)
}

function getJadibotUser(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    return db.users[jid] || null
}

function setJadibotUser(jadibotId, jid, data) {
    const db = loadJadibotDb(jadibotId)
    db.users[jid] = { ...db.users[jid], ...data }
    saveJadibotDb(jadibotId)
}

function getJadibotGroup(jadibotId, jid) {
    const db = loadJadibotDb(jadibotId)
    return db.groups[jid] || null
}

function setJadibotGroup(jadibotId, jid, data) {
    const db = loadJadibotDb(jadibotId)
    db.groups[jid] = { ...db.groups[jid], ...data }
    saveJadibotDb(jadibotId)
}

function getAllJadibotData(jadibotId) {
    return loadJadibotDb(jadibotId)
}

exports.loadJadibotDb = loadJadibotDb; exports.saveJadibotDb = saveJadibotDb; exports.isJadibotOwner = isJadibotOwner; exports.addJadibotOwner = addJadibotOwner; exports.removeJadibotOwner = removeJadibotOwner; exports.getJadibotOwners = getJadibotOwners; exports.isJadibotPremium = isJadibotPremium; exports.addJadibotPremium = addJadibotPremium; exports.removeJadibotPremium = removeJadibotPremium; exports.getJadibotPremiums = getJadibotPremiums; exports.getJadibotSetting = getJadibotSetting; exports.setJadibotSetting = setJadibotSetting; exports.getJadibotUser = getJadibotUser; exports.setJadibotUser = setJadibotUser; exports.getJadibotGroup = getJadibotGroup; exports.setJadibotGroup = setJadibotGroup; exports.getAllJadibotData = getAllJadibotData;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
