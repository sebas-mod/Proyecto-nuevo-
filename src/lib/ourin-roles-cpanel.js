"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const CPANEL_DIR = _path2.default.join(process.cwd(), 'database', 'cpanel')
const VALID_SERVERS = ['v1', 'v2', 'v3', 'v4', 'v5']
const VALID_ROLES = ['owner', 'ceo', 'reseller']

function ensureDir() {
    if (!_fs2.default.existsSync(CPANEL_DIR)) {
        _fs2.default.mkdirSync(CPANEL_DIR, { recursive: true })
    }
}

function getFilePath(role, server) {
    return _path2.default.join(CPANEL_DIR, `${role}_${server}.json`)
}

function loadRoleFile(role, server) {
    ensureDir()
    const filePath = getFilePath(role, server)
    if (!_fs2.default.existsSync(filePath)) {
        _fs2.default.writeFileSync(filePath, '[]', 'utf8')
        return []
    }
    try {
        return JSON.parse(_fs2.default.readFileSync(filePath, 'utf8'))
    } catch (e) {
        return []
    }
}

function saveRoleFile(role, server, data) {
    ensureDir()
    const filePath = getFilePath(role, server)
    _fs2.default.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

function cleanNumber(jid) {
    if (!jid) return null
    return jid.replace(/@.*$/, '').replace(/[^0-9]/g, '')
}

function getRoles(server) {
    if (!VALID_SERVERS.includes(server)) return null
    return {
        owners: loadRoleFile('owner', server),
        ceos: loadRoleFile('ceo', server),
        resellers: loadRoleFile('reseller', server)
    }
}

function hasRole(jid, server, allowedRoles = ['owner', 'ceo', 'reseller']) {
    if (!VALID_SERVERS.includes(server)) return false
    const number = cleanNumber(jid)
    if (!number) return false
    
    for (const role of allowedRoles) {
        if (!VALID_ROLES.includes(role)) continue
        const list = loadRoleFile(role, server)
        if (list.includes(number)) return true
    }
    return false
}

function getUserRole(jid, server) {
    if (!VALID_SERVERS.includes(server)) return null
    const number = cleanNumber(jid)
    if (!number) return null
    
    for (const role of VALID_ROLES) {
        const list = loadRoleFile(role, server)
        if (list.includes(number)) return role
    }
    return null
}

function addRole(jid, server, role) {
    if (!VALID_SERVERS.includes(server)) return { success: false, error: 'Server tidak valid' }
    if (!VALID_ROLES.includes(role)) return { success: false, error: 'Role tidak valid' }
    
    const number = cleanNumber(jid)
    if (!number) return { success: false, error: 'Nomor tidak valid' }
    
    const existingRole = getUserRole(jid, server)
    if (existingRole) {
        return { success: false, error: `Sudah memiliki role ${existingRole} di ${server.toUpperCase()}` }
    }
    
    const list = loadRoleFile(role, server)
    if (list.includes(number)) {
        return { success: false, error: 'Sudah terdaftar' }
    }
    
    list.push(number)
    saveRoleFile(role, server, list)
    return { success: true, number, role, server }
}

function removeRole(jid, server, role) {
    if (!VALID_SERVERS.includes(server)) return { success: false, error: 'Server tidak valid' }
    if (!VALID_ROLES.includes(role)) return { success: false, error: 'Role tidak valid' }
    
    const number = cleanNumber(jid)
    if (!number) return { success: false, error: 'Nomor tidak valid' }
    
    const list = loadRoleFile(role, server)
    const idx = list.indexOf(number)
    if (idx === -1) {
        return { success: false, error: 'Tidak terdaftar' }
    }
    
    list.splice(idx, 1)
    saveRoleFile(role, server, list)
    return { success: true, number, role, server }
}

function listByRole(server, role) {
    if (!VALID_SERVERS.includes(server)) return []
    if (!VALID_ROLES.includes(role)) return []
    return loadRoleFile(role, server)
}

function getAccessibleServers(jid) {
    const number = cleanNumber(jid)
    if (!number) return []
    
    const accessible = []
    for (const server of VALID_SERVERS) {
        for (const role of VALID_ROLES) {
            const list = loadRoleFile(role, server)
            if (list.includes(number)) {
                accessible.push({ server, role })
                break
            }
        }
    }
    return accessible
}

function hasAccessToServer(jid, server, isOwner = false) {
    if (isOwner) return true
    return hasRole(jid, server, ['owner', 'ceo', 'reseller'])
}

function hasFullAccess(jid, server, isOwner = false) {
    if (isOwner) return true
    return hasRole(jid, server, ['owner', 'ceo'])
}

function canManageRole(jid, server, targetRole, isOwner = false) {
    if (isOwner) return true
    
    const userRole = getUserRole(jid, server)
    if (!userRole) return false
    
    if (userRole === 'owner') return true
    if (userRole === 'ceo') return true
    
    return false
}

function getAllRolesForUser(jid) {
    const number = cleanNumber(jid)
    if (!number) return []
    
    const roles = []
    for (const server of VALID_SERVERS) {
        const role = getUserRole(number, server)
        if (role) {
            roles.push({ server, role })
        }
    }
    return roles
}

function initializeFiles() {
    ensureDir()
    for (const server of VALID_SERVERS) {
        for (const role of VALID_ROLES) {
            const filePath = getFilePath(role, server)
            if (!_fs2.default.existsSync(filePath)) {
                _fs2.default.writeFileSync(filePath, '[]', 'utf8')
            }
        }
    }
}

initializeFiles()

exports.VALID_SERVERS = VALID_SERVERS; exports.VALID_ROLES = VALID_ROLES; exports.getRoles = getRoles; exports.hasRole = hasRole; exports.getUserRole = getUserRole; exports.addRole = addRole; exports.removeRole = removeRole; exports.listByRole = listByRole; exports.getAccessibleServers = getAccessibleServers; exports.hasAccessToServer = hasAccessToServer; exports.hasFullAccess = hasFullAccess; exports.canManageRole = canManageRole; exports.getAllRolesForUser = getAllRolesForUser; exports.cleanNumber = cleanNumber;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
