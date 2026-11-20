"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const DB_PATH = _path2.default.join(process.cwd(), 'src', 'database')
const OWNER_FILE = _path2.default.join(DB_PATH, 'owner.json')
const PREMIUM_FILE = _path2.default.join(DB_PATH, 'premium.json')
const PARTNER_FILE = _path2.default.join(DB_PATH, 'partner.json')

const CACHE_TTL = 30000
const cache = { owners: null, ownerTs: 0, premium: null, premiumTs: 0, partners: null, partnerTs: 0 }

function ensureDbPath() {
    if (!_fs2.default.existsSync(DB_PATH)) {
        _fs2.default.mkdirSync(DB_PATH, { recursive: true })
    }
}

function loadOwners() {
    const now = Date.now()
    if (cache.owners && (now - cache.ownerTs) < CACHE_TTL) return cache.owners
    ensureDbPath()
    if (!_fs2.default.existsSync(OWNER_FILE)) {
        _fs2.default.writeFileSync(OWNER_FILE, JSON.stringify({ owners: [] }, null, 2))
    }
    try {
        const data = JSON.parse(_fs2.default.readFileSync(OWNER_FILE, 'utf-8'))
        cache.owners = data.owners || []
        cache.ownerTs = now
        return cache.owners
    } catch (e) {
        return []
    }
}

function saveOwners(owners) {
    ensureDbPath()
    _fs2.default.writeFileSync(OWNER_FILE, JSON.stringify({ owners, updatedAt: new Date().toISOString() }, null, 2))
    cache.owners = owners
    cache.ownerTs = Date.now()
}

function loadPremium() {
    const now = Date.now()
    if (cache.premium && (now - cache.premiumTs) < CACHE_TTL) return cache.premium
    ensureDbPath()
    if (!_fs2.default.existsSync(PREMIUM_FILE)) {
        _fs2.default.writeFileSync(PREMIUM_FILE, JSON.stringify({ premium: [] }, null, 2))
    }
    try {
        const data = JSON.parse(_fs2.default.readFileSync(PREMIUM_FILE, 'utf-8'))
        cache.premium = data.premium || []
        cache.premiumTs = now
        return cache.premium
    } catch (e2) {
        return []
    }
}

function savePremium(premium) {
    ensureDbPath()
    _fs2.default.writeFileSync(PREMIUM_FILE, JSON.stringify({ premium, updatedAt: new Date().toISOString() }, null, 2))
    cache.premium = premium
    cache.premiumTs = Date.now()
}

function loadPartners() {
    const now = Date.now()
    if (cache.partners && (now - cache.partnerTs) < CACHE_TTL) return cache.partners
    ensureDbPath()
    if (!_fs2.default.existsSync(PARTNER_FILE)) {
        _fs2.default.writeFileSync(PARTNER_FILE, JSON.stringify({ partners: [] }, null, 2))
    }
    try {
        const data = JSON.parse(_fs2.default.readFileSync(PARTNER_FILE, 'utf-8'))
        cache.partners = data.partners || []
        cache.partnerTs = now
        return cache.partners
    } catch (e3) {
        return []
    }
}

function savePartners(partners) {
    ensureDbPath()
    _fs2.default.writeFileSync(PARTNER_FILE, JSON.stringify({ partners, updatedAt: new Date().toISOString() }, null, 2))
    cache.partners = partners
    cache.partnerTs = Date.now()
}

function matchJid(cleanA, cleanB) {
    return cleanA === cleanB || cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA)
}

function isOwner(jid) {
    if (!jid) return false
    const cleanJid = jid.replace(/@.+/g, '')
    if (!cleanJid) return false

    const owners = loadOwners()
    return owners.some(o => {
        if (typeof o === 'string') return matchJid(cleanJid, o.replace(/[^0-9]/g, ''))
        const ownerNum = (o.number || o.jid || '').replace(/[^0-9]/g, '')
        return matchJid(cleanJid, ownerNum)
    })
}

function isPremium(jid) {
    if (!jid) return false
    const cleanJid = jid.replace(/@.+/g, '')
    if (!cleanJid) return false

    const premiumList = loadPremium()
    const user = premiumList.find(p => {
        if (typeof p === 'string') return matchJid(cleanJid, p.replace(/[^0-9]/g, ''))
        const premiumNum = (p.number || p.jid || '').replace(/[^0-9]/g, '')
        return matchJid(cleanJid, premiumNum)
    })

    if (!user) return false
    if (typeof user === 'string') return true
    if (user.expiredAt && new Date(user.expiredAt) < new Date()) {
        removePremium(cleanJid)
        return false
    }
    return true
}

function isPartner(jid) {
    if (!jid) return false
    const cleanJid = jid.replace(/@.+/g, '')
    if (!cleanJid) return false

    const partnerList = loadPartners()
    const user = partnerList.find(p => {
        if (typeof p === 'string') return matchJid(cleanJid, p.replace(/[^0-9]/g, ''))
        const partnerNum = (p.number || p.jid || '').replace(/[^0-9]/g, '')
        return matchJid(cleanJid, partnerNum)
    })

    if (!user) return false
    if (typeof user === 'string') return true
    if (user.expiredAt && new Date(user.expiredAt) < new Date()) {
        removePartner(cleanJid)
        return false
    }
    return true
}

function addOwner(jid, name = 'Unknown') {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _ => _.replace, 'call', _2 => _2(/@.+/g, '')]) || ''
    if (isOwner(cleanJid)) return { success: false, message: 'Se está convirtiendo en un propietario.' }

    const owners = loadOwners()
    owners.push({
        jid: cleanJid,
        number: cleanJid,
        name,
        addedAt: new Date().toISOString()
    })
    saveOwners(owners)
    return { success: true, message: 'Resultado como propietario' }
}

function removeOwner(jid) {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/@.+/g, '')]) || ''
    const owners = loadOwners()
    const index = owners.findIndex(o => o.number === cleanJid || o.jid === cleanJid)
    if (index === -1) return { success: false, message: 'No se encuentra en la lista de propietarios' }

    owners.splice(index, 1)
    saveOwners(owners)
    return { success: true, message: 'Es un corte del propietario.' }
}

function addPremium(jid, days = 30, name = 'Unknown') {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _5 => _5.replace, 'call', _6 => _6(/@.+/g, '')]) || ''
    const premiumList = loadPremium()

    const existing = premiumList.findIndex(p => p.number === cleanJid || p.jid === cleanJid)
    const expiredAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString()

    if (existing !== -1) {
        const currentExpiry = new Date(premiumList[existing].expiredAt || 0)
        const baseTime = currentExpiry > new Date() ? currentExpiry : new Date()
        premiumList[existing].expiredAt = new Date(baseTime.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString()
        premiumList[existing].name = name || premiumList[existing].name
        savePremium(premiumList)
        return { success: true, message: `Ampliación de la prima${days}el`, expiredAt: premiumList[existing].expiredAt }
    }

    premiumList.push({
        jid: cleanJid,
        number: cleanJid,
        name,
        addedAt: new Date().toISOString(),
        expiredAt
    })
    savePremium(premiumList)
    return { success: true, message: `Resultado para ser cosido como una prima${days}el`, expiredAt }
}

function removePremium(jid) {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _7 => _7.replace, 'call', _8 => _8(/@.+/g, '')]) || ''
    const premiumList = loadPremium()
    const index = premiumList.findIndex(p => p.number === cleanJid || p.jid === cleanJid)
    if (index === -1) return { success: false, message: 'No se encuentra en la lista de primas' }

    premiumList.splice(index, 1)
    savePremium(premiumList)
    return { success: true, message: 'Es un corte de la prima.' }
}

function addPartner(jid, days = 30, name = 'Unknown') {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _9 => _9.replace, 'call', _10 => _10(/@.+/g, '')]) || ''
    const partnerList = loadPartners()

    const existing = partnerList.findIndex(p => p.number === cleanJid || p.jid === cleanJid)
    const expiredAt = new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toISOString()

    if (existing !== -1) {
        const currentExpiry = new Date(partnerList[existing].expiredAt || 0)
        const baseTime = currentExpiry > new Date() ? currentExpiry : new Date()
        partnerList[existing].expiredAt = new Date(baseTime.getTime() + (days * 24 * 60 * 60 * 1000)).toISOString()
        partnerList[existing].name = name || partnerList[existing].name
        savePartners(partnerList)
        return { success: true, message: `Partner diperpanjang ${days}el`, expiredAt: partnerList[existing].expiredAt }
    }

    partnerList.push({
        jid: cleanJid,
        number: cleanJid,
        name,
        addedAt: new Date().toISOString(),
        expiredAt
    })
    savePartners(partnerList)
    return { success: true, message: `Funciona como socio.${days}el`, expiredAt }
}

function removePartner(jid) {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _11 => _11.replace, 'call', _12 => _12(/@.+/g, '')]) || ''
    const partnerList = loadPartners()
    const index = partnerList.findIndex(p => p.number === cleanJid || p.jid === cleanJid)
    if (index === -1) return { success: false, message: 'No se encuentra en la lista de socios' }

    partnerList.splice(index, 1)
    savePartners(partnerList)
    return { success: true, message: 'Vale la pena que un socio se desprenda.' }
}

function getOwnerList() {
    return loadOwners()
}

function getPremiumList() {
    const premiumList = loadPremium()
    const now = new Date()
    return premiumList.filter(p => {
        if (p.expiredAt && new Date(p.expiredAt) < now) {
            removePremium(p.number || p.jid)
            return false
        }
        return true
    })
}

function getPremiumInfo(jid) {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _13 => _13.replace, 'call', _14 => _14(/@.+/g, '')]) || ''
    const premiumList = loadPremium()
    return premiumList.find(p => p.number === cleanJid || p.jid === cleanJid) || null
}

function getPartnerList() {
    const partnerList = loadPartners()
    const now = new Date()
    return partnerList.filter(p => {
        if (p.expiredAt && new Date(p.expiredAt) < now) {
            removePartner(p.number || p.jid)
            return false
        }
        return true
    })
}

function getPartnerInfo(jid) {
    const cleanJid = _optionalChain([jid, 'optionalAccess', _15 => _15.replace, 'call', _16 => _16(/@.+/g, '')]) || ''
    const partnerList = loadPartners()
    return partnerList.find(p => p.number === cleanJid || p.jid === cleanJid) || null
}

exports.loadOwners = loadOwners; exports.saveOwners = saveOwners; exports.loadPremium = loadPremium; exports.savePremium = savePremium; exports.loadPartners = loadPartners; exports.savePartners = savePartners; exports.isOwner = isOwner; exports.isPremium = isPremium; exports.isPartner = isPartner; exports.addOwner = addOwner; exports.removeOwner = removeOwner; exports.addPremium = addPremium; exports.removePremium = removePremium; exports.addPartner = addPartner; exports.removePartner = removePartner; exports.getOwnerList = getOwnerList; exports.getPremiumList = getPremiumList; exports.getPremiumInfo = getPremiumInfo; exports.getPartnerList = getPartnerList; exports.getPartnerInfo = getPartnerInfo;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
