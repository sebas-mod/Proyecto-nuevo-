"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _child_process = require('child_process');
var _util = require('util');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const execAsync = _util.promisify.call(void 0, _child_process.exec)

const pluginConfig = {
    name: 'sticker',
    alias: ['s', 'stiker', 'stickergif'],
    category: 'sticker',
    description: 'Crea un sticker desde una imagen o vídeo (recorte, tamaño o forma)',
    usage: '.s [--crop] [--resize WxH] [--circle] [--rounded]',
    example: '.s --crop\n.s --resize 256x256\n.s --circle\n.s --rounded',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

function parseOptions(args) {
    const options = {
        crop: false,
        resize: null,
        circle: false,
        rounded: false,
        packname: null,
        author: null
    }
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--crop' || arg === '-c') {
            options.crop = true
        } else if (arg === '--resize' || arg === '-r') {
            if (args[i + 1] && /^\d+x\d+$/i.test(args[i + 1])) {
                options.resize = args[i + 1]
                i++
            }
        } else if (arg === '--circle') {
            options.circle = true
        } else if (arg === '--rounded') {
            options.rounded = true
        } else if (!arg.startsWith('-') && !options.packname) {
            options.packname = arg
        } else if (!arg.startsWith('-') && options.packname && !options.author) {
            options.author = arg
        }
    }
    
    return options
}

async function processImage(inputPath, outputPath, options) {
    let filters = []
    
    if (options.resize) {
        const [width, height] = options.resize.split('x').map(Number)
        filters.push(`scale=${width}:${height}:force_original_aspect_ratio=decrease`)
        filters.push(`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`)
    }
    
    if (options.crop) {
        filters.push(`crop='min(iw,ih)':'min(iw,ih)'`)
        filters.push(`scale=512:512`)
    }
    
    if (options.circle) {
        filters.push(`format=rgba`)
        filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gt(pow(X-W/2,2)+pow(Y-H/2,2),pow(min(W,H)/2,2)),0,255)'`)
    }
    
    if (options.rounded) {
        const radius = 50
        filters.push(`format=rgba`)
        filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,${radius})*lt(Y,${radius})*gt(pow(${radius}-X,2)+pow(${radius}-Y,2),pow(${radius},2)),0,if(gt(X,W-${radius})*lt(Y,${radius})*gt(pow(X-W+${radius},2)+pow(${radius}-Y,2),pow(${radius},2)),0,if(lt(X,${radius})*gt(Y,H-${radius})*gt(pow(${radius}-X,2)+pow(Y-H+${radius},2),pow(${radius},2)),0,if(gt(X,W-${radius})*gt(Y,H-${radius})*gt(pow(X-W+${radius},2)+pow(Y-H+${radius},2),pow(${radius},2)),0,255))))'`)
    }
    
    if (filters.length === 0) {
        _fs2.default.copyFileSync(inputPath, outputPath)
        return
    }
    
    const filterStr = filters.join(',')
    await execAsync(`ffmpeg -i "${inputPath}" -vf "${filterStr}" -y "${outputPath}"`)
}

async function processVideo(inputPath, outputPath, options) {
    let filters = []
    
    if (options.resize) {
        const [width, height] = options.resize.split('x').map(Number)
        filters.push(`scale=${width}:${height}:force_original_aspect_ratio=decrease`)
        filters.push(`pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`)
    }
    
    if (options.crop) {
        filters.push(`crop='min(iw,ih)':'min(iw,ih)'`)
        filters.push(`scale=512:512`)
    }
    
    if (filters.length === 0) {
        _fs2.default.copyFileSync(inputPath, outputPath)
        return
    }
    
    const filterStr = filters.join(',')
    await execAsync(`ffmpeg -i "${inputPath}" -vf "${filterStr}" -c:a copy -y "${outputPath}"`)
}

async function handler(m, { sock, config: botConfig }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    const isVideo = m.isVideo || (m.quoted && m.quoted.type === 'videoMessage')
    
    if (!isImage && !isVideo) {
        await m.reply(
            `🖼️ *sᴛɪᴄᴋᴇʀ ᴍᴀᴋᴇʀ*\n\n` +
            `Responde a una imagen o vídeo (o envíalo con el texto):\n` +
            `\`${m.prefix}s\`\n\n` +
            `*ᴏᴘᴄɪᴏɴᴇs:*\n` +
            `> \`--crop\` - Recorta al centro\n` +
            `> \`--resize WxH\` - Redimensiona al tamaño indicado\n` +
            `> \`--circle\` - Forma circular\n` +
            `> \`--rounded\` - Esquinas redondeadas\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
            `> \`${m.prefix}s --crop\`\n` +
            `> \`${m.prefix}s --resize 256x256\`\n` +
            `> \`${m.prefix}s --circle\`\n` +
            `> \`${m.prefix}s PackName Author\``
        )
        return
    }
    
    await m.react('🕕')
    
    const options = parseOptions(m.args || [])
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.reply('❌ ¡Falta el medio! Responde a una imagen o vídeo.')
            await m.react('❌')
            return
        }
        
        if (isVideo) {
            const tempDir = _path2.default.join(process.cwd(), 'temp')
            if (!_fs2.default.existsSync(tempDir)) {
                _fs2.default.mkdirSync(tempDir, { recursive: true })
            }
            
            const tempVideo = _path2.default.join(tempDir, `duration_check_${Date.now()}.mp4`)
            _fs2.default.writeFileSync(tempVideo, buffer)
            
            try {
                const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempVideo}"`)
                const duration = parseFloat(stdout.trim())
                
                if (duration > 10) {
                    await m.reply(`❌ ¡El vídeo es demasiado largo!\n\n> Duración: ${duration.toFixed(1)} s\n> Máximo: 10 segundos`)
                    await m.react('☢')
                    if (_fs2.default.existsSync(tempVideo)) _fs2.default.unlinkSync(tempVideo)
                    return
                }
            } catch (e) {}
            
            if (_fs2.default.existsSync(tempVideo)) _fs2.default.unlinkSync(tempVideo)
        }
        
        const packname = options.packname || _optionalChain([botConfig, 'access', _ => _.sticker, 'optionalAccess', _2 => _2.packname]) || _optionalChain([botConfig, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || 'Ourin-AI'
        const author = options.author || _optionalChain([botConfig, 'access', _5 => _5.sticker, 'optionalAccess', _6 => _6.author]) || _optionalChain([botConfig, 'access', _7 => _7.owner, 'optionalAccess', _8 => _8.name]) || 'Bot'
        
        const hasProcessing = options.crop || options.resize || options.circle || options.rounded
        
        if (hasProcessing) {
            const tempDir = _path2.default.join(process.cwd(), 'temp')
            if (!_fs2.default.existsSync(tempDir)) {
                _fs2.default.mkdirSync(tempDir, { recursive: true })
            }
            
            const ext = isVideo ? 'mp4' : 'png'
            const inputPath = _path2.default.join(tempDir, `sticker_in_${Date.now()}.${ext}`)
            const outputPath = _path2.default.join(tempDir, `sticker_out_${Date.now()}.${ext}`)
            
            _fs2.default.writeFileSync(inputPath, buffer)
            
            try {
                if (isImage) {
                    await processImage(inputPath, outputPath, options)
                } else if (isVideo) {
                    await processVideo(inputPath, outputPath, options)
                }
                buffer = _fs2.default.readFileSync(outputPath)
            } catch (e) {}
            
            if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath)
            if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath)
        }
        
        if (isImage) {
            await sock.sendImageAsSticker(m.chat, buffer, m, { packname, author })
        } else if (isVideo) {
            await sock.sendVideoAsSticker(m.chat, buffer, m, { packname, author })
        }
        
        await m.react('✅')
        
    } catch (error) {
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
        await m.react('❌')
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
