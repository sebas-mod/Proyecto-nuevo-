"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: [
        'bego', 'goblok', 'janda', 'perawan', 'babi', 'tolol', 'pekok', 
        'jancok', 'pinter', 'pintar', 'asu', 'bodoh', 'gay', 'lesby',
        'bajingan', 'anjing', 'anjg', 'anjj', 'anj', 'ngentod', 'ngentot',
        'monyet', 'mastah', 'newbie', 'bangsat', 'bangke', 'sange', 'sangean',
        'dakjal', 'horny', 'wibu', 'puki', 'puqi', 'peak', 'pantex', 'pantek',
        'setan', 'iblis', 'cacat', 'yatim', 'piatu', 'ganteng', 'cantik',
        'jelek', 'keren', 'cupu', 'noob', 'pro', 'sultan', 'miskin', 'kaya', 'siapa'
    ],
    alias: [],
    category: 'fun',
    description: 'Random pilih member untuk kategori tertentu',
    usage: '.<kategori>',
    example: '.ganteng',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const command = _optionalChain([m, 'access', _ => _.command, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    m.react('🕕')
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const members = participants
            .map(p => p.jid)
            .filter(id => id && id !== _optionalChain([sock, 'access', _4 => _4.user, 'optionalAccess', _5 => _5.id, 'optionalAccess', _6 => _6.split, 'call', _7 => _7(':'), 'access', _8 => _8[0]]) + '@s.whatsapp.net')
        if (members.length === 0) {
            return m.reply(`❌ Tidak ada member di grup!`)
        }
        const randomMember = members[Math.floor(Math.random() * members.length)]
        const positiveWords = ['ganteng', 'cantik', 'keren', 'pro', 'sultan', 'kaya', 'pinter', 'pintar', 'mastah']
        const isPositive = positiveWords.includes(command)
        const emoji = isPositive ? '✨' : '😏'
        const label = isPositive ? 'Yang paling' : 'Anak'
        await m.reply(`*${label} ${command} di sini adalah* @${randomMember.split('@')[0]}`, { mentions: [randomMember] })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
