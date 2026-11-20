"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'resetgoodbye',
    alias: ['delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: 'Reset goodbye message ke default',
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat)
    
    if (!_optionalChain([groupData, 'optionalAccess', _ => _.goodbyeMsg])) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*El mensaje de adiós ha sido predeterminado*`)
    }
    
    db.setGroup(m.chat, { goodbyeMsg: null })
    
    m.react('✅')
    
    await m.reply(`✅*ɢᴏᴏᴅʙʏᴇ ᴅɪʀᴇSᴇᴛ*\nRegresar al mensaje desfavorable`)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
