"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'buyfitur',
    alias: ['belifitur', 'purchasefeature', 'buyfeature'],
    category: 'user',
    description: 'Comprar una característica premium ( 1 característica = 30,000 monedas )',
    usage: '.buyfitur [nama_fitur]',
    example: '.buyfitur',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_FEATURE = 3000

const PREMIUM_FEATURES = [
    { id: 'sticker', name: 'Sticker Unlimited', desc: 'Unlimited sticker commands' },
    { id: 'downloader', name: 'Downloader Pro', desc: 'Descargas sin límite' },
    { id: 'ai', name: 'AI Access', desc: 'Las acciones cuentan con prima AI' },
    { id: 'tools', name: 'Advanced Tools', desc: 'Tools eksklusif' },
    { id: 'game', name: 'Game Bonus', desc: '2x rewards game' }
]

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    const featureName = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()])
    
    if (user.isPremium || _configjs2.default.isPremium(m.sender)) {
        return m.reply(
            `✨ *ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ*\n\n` +
            `¡Eres una prima!\n` +
            `¡Todas las características están desbloqueadas!`
        )
    }
    
    if (!featureName) {
        const unlockedFeatures = user.unlockedFeatures || []
        
        let text = `╭━━━━━━━━━━━━━━━━━╮\n`
        text += `┃  🛒 *ʙᴜʏ ꜰɪᴛᴜʀ*\n`
        text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
        
        text += `• Precio: •${formatNumber(PRICE_PER_FEATURE)}* bal/fitur\n`
        text += `> Monedas: *${formatNumber(user.koin || 0)}*\n\n`
        
        text += `╭┈┈⬡「 📋 *ꜰɪᴛᴜʀ* 」\n`
        
        for (const feature of PREMIUM_FEATURES) {
            const isUnlocked = unlockedFeatures.includes(feature.id)
            const status = isUnlocked ? '✅' : '🔒'
            text += `┃ ${status} *${feature.name}*\n`
            text += `┃    _${feature.desc}_\n`
            text += `┃    ID: \`${feature.id}\`\n`
            text += `┃\n`
        }
        
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `> Usa: \`. buyfinitur.<id>\`\n`
        text += `El ser una Premium.`
        
        await m.reply(text)
        return
    }
    
    const feature = PREMIUM_FEATURES.find(f => f.id === featureName)
    
    if (!feature) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> Función\`${featureName}\`no encontrado\n` +
            `> Escribe\`. buyfinitur.\`para ver la lista`
        )
    }
    
    const unlockedFeatures = user.unlockedFeatures || []
    
    if (unlockedFeatures.includes(feature.id)) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n> Función\`${feature.name}\`ya ter-unlock!`)
    }
    
    if ((user.koin || 0) < PRICE_PER_FEATURE) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `Ser Tela no es suficiente!\n` +
            `Mierda.${formatNumber(PRICE_PER_FEATURE)}*\n` +
            `# You 've got:${formatNumber(user.koin || 0)}*`
        )
    }
    
    db.updateKoin(m.sender, -PRICE_PER_FEATURE)
    unlockedFeatures.push(feature.id)
    db.setUser(m.sender, { unlockedFeatures })
    
    const newKoin = db.getUser(m.sender).koin
    
    m.react('✅')
    
    await m.reply(
        `✅ *ꜰɪᴛᴜʀ ᴅɪ-ᴜɴʟᴏᴄᴋ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 🎁 ꜰɪᴛᴜʀ: *${feature.name}*\n` +
        `┃ 💵 ʜᴀʀɢᴀ: *-${formatNumber(PRICE_PER_FEATURE)}* bal\n` +
        `┃ 💰 sɪsᴀ: *${formatNumber(newKoin)}*\n` +
        `╰┈┈⬡\n\n` +
        `> _${feature.desc}_\n\n` +
        `•💡Consejo: Así * Premium * para desbloquear tata!`
    )
}

exports.config = pluginConfig; exports.handler = handler; exports.PREMIUM_FEATURES = PREMIUM_FEATURES;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
