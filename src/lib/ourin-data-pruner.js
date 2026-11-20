"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinloggerjs = require('./ourin-logger.js');
const INACTIVE_THRESHOLD = 14 * 24 * 60 * 60 * 1000
const PRUNE_INTERVAL = 6 * 60 * 60 * 1000

let prunerTimer = null

function startDailyPruner() {
    if (prunerTimer) return

    prunerTimer = setInterval(() => {
        try {
            
            const db = getDatabase()
            if (!db || !_optionalChain([db, 'access', _ => _.db, 'optionalAccess', _2 => _2.data])) return

            const now = Date.now()
            const threshold = now - INACTIVE_THRESHOLD
            let prunedUsers = 0
            let prunedGroups = 0

            const users = db.db.data.users
            if (users && typeof users === 'object') {
                for (const [jid, user] of Object.entries(users)) {
                    const isProtected =
                        user.premium ||
                        user.owner ||
                        user.partner ||
                        user.banned

                    if (!isProtected && user.lastSeen && user.lastSeen < threshold) {
                        delete users[jid]
                        prunedUsers++
                    }
                }
            }

            const groups = db.db.data.groups
            if (groups && typeof groups === 'object') {
                for (const [jid, group] of Object.entries(groups)) {
                    if (group.lastActivity && group.lastActivity < threshold) {
                        delete groups[jid]
                        prunedGroups++
                    }
                }
            }

            if (prunedUsers > 0 || prunedGroups > 0) {
                db.save()
                _ourinloggerjs.logger.system('pruner', `removed ${prunedUsers} users, ${prunedGroups} groups (>${INACTIVE_THRESHOLD / 86400000}d inactive)`)
            }
        } catch (error) {
            _ourinloggerjs.logger.error('pruner', error.message)
        }
    }, PRUNE_INTERVAL)

    if (prunerTimer.unref) prunerTimer.unref()
    _ourinloggerjs.logger.success('pruner', `Pembersih data usang jalan (> ${INACTIVE_THRESHOLD / 86400000} hari nonaktif, tiap ${PRUNE_INTERVAL / 3600000} jam)`)
}

function stopDailyPruner() {
    if (prunerTimer) {
        clearInterval(prunerTimer)
        prunerTimer = null
    }
}

exports.startDailyPruner = startDailyPruner; exports.stopDailyPruner = stopDailyPruner;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
