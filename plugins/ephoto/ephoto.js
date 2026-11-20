"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const EFFECT_URLS = {
    glitchtext: 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    writetext: 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    advancedglow: 'https://en.ephoto360.com/advanced-glow-effects-74.html',
    typographytext: 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
    pixelglitch: 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html',
    neonglitch: 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    flagtext: 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html',
    flag3dtext: 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html',
    deletingtext: 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html',
    blackpinkstyle: 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html',
    glowingtext: 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html',
    underwatertext: 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html',
    logomaker: 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html',
    cartoonstyle: 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html',
    papercutstyle: 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html',
    watercolortext: 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html',
    effectclouds: 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html',
    blackpinklogo: 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html',
    gradienttext: 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html',
    summerbeach: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html',
    luxurygold: 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html',
    multicoloredneon: 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html',
    sandsummer: 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html',
    galaxywallpaper: 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html',
    '1917style': 'https://en.ephoto360.com/1917-style-text-effect-523.html',
    makingneon: 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html',
    royaltext: 'https://en.ephoto360.com/royal-text-effect-online-free-471.html',
    freecreate: 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html',
    galaxystyle: 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html',
    amongustext: 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
    rainytext: 'https://en.ephoto360.com/foggy-rainy-text-effect-75.html',
    lighteffects: 'https://en.ephoto360.com/light-effects-74.html'
}

const pluginConfig = {
    name: [
        'glitchtext', 'writetext', 'advancedglow', 'typographytext', 'pixelglitch',
        'neonglitch', 'flagtext', 'flag3dtext', 'deletingtext', 'blackpinkstyle',
        'glowingtext', 'underwatertext', 'logomaker', 'cartoonstyle', 'papercutstyle',
        'watercolortext', 'effectclouds', 'blackpinklogo', 'gradienttext', 'summerbeach',
        'luxurygold', 'multicoloredneon', 'sandsummer', 'galaxywallpaper', '1917style',
        'makingneon', 'royaltext', 'freecreate', 'galaxystyle', 'amongustext',
        'rainytext', 'lighteffects'
    ],
    alias: ['ephoto'],
    category: 'ephoto',
    description: '# Crea eeck text fresco con un estilo ',
    usage: '.<effect> <text>',
    example: '.glitchtext Ourin-AI',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function ephoto(url, textInput) {
    const formData = new (0, _formdata2.default)()
    
    const initialResponse = await _axios2.default.get(url, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
        }
    })
    
    const $ = cheerio.load(initialResponse.data)
    
    const token = $('input[name=token]').val()
    const buildServer = $('input[name=build_server]').val()
    const buildServerId = $('input[name=build_server_id]').val()
    
    formData.append('text[]', textInput)
    formData.append('token', token)
    formData.append('build_server', buildServer)
    formData.append('build_server_id', buildServerId)
    
    const postResponse = await _axios2.default.call(void 0, {
        url: url,
        method: 'POST',
        data: formData,
        headers: {
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'cookie': _optionalChain([initialResponse, 'access', _ => _.headers, 'access', _2 => _2['set-cookie'], 'optionalAccess', _3 => _3.join, 'call', _4 => _4('; ')]),
            ...formData.getHeaders()
        }
    })
    
    const $$ = cheerio.load(postResponse.data)
    const formValueInput = JSON.parse($$('input[name=form_value_input]').val())
    formValueInput['text[]'] = formValueInput.text
    delete formValueInput.text
    
    const { data: finalResponseData } = await _axios2.default.post('https://en.ephoto360.com/effect/create-image', new URLSearchParams(formValueInput), {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'cookie': initialResponse.headers['set-cookie'].join('; ')
        }
    })
    
    return buildServer + finalResponseData.image
}

async function handler(m, { sock }) {
    const command = m.command.toLowerCase()
    const text = _optionalChain([m, 'access', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()])
    
    if (command === 'ephoto') {
        const effectList = Object.keys(EFFECT_URLS).map(e => `• \`${m.prefix}${e}\``).join('\n')
        return m.reply(
            `🎨 *ᴇᴘʜᴏᴛᴏ ᴇꜰꜰᴇᴄᴛs*\n\n` +
            `# Beat eeck text genial!\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ ᴇꜰᴇᴋ* 」\n${effectList}\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> *Ejemplo:*${m.prefix}glitchtext Ourin-AI`
        )
    }
    
    if (!text) {
        return m.reply(`❌*ᴇʀʀᴏʀ*\n\n# Ponlo en tu boca #x¡T!\n> *Ejemplo:*${m.prefix}${command} Ourin-AI`)
    }
    
    const effectUrl = EFFECT_URLS[command]
    if (!effectUrl) {
        return m.reply(`❌Efectos no encontrados`)
    }
    
    await m.react('🕕')

    try {
        const imageUrl = await ephoto(effectUrl, text)
    
        await sock.sendMedia(m.chat, imageUrl, null, m, {
            type: 'image'
        })
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
