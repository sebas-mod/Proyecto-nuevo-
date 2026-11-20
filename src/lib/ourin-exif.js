"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }/**
 * Credits & Thanks to
* Desarrollo = Lucchy Archz ( Zann )
* Propietario principal: PESUSUATAN
* Propietario = Keisya
 * Designer = Danzzz
 * Wileys = Penyedia baileys
 * Penyedia APIs
 * Penyedia Scrapers
 * 
* DEFENSE Elimina / GANIT CREDITS TO THANKS
* DORNESS SALE YA MEK
 * 
* Oficial Ourin Saluran:
 * https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t 
 * 
 */
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _ffmpeg = require('@ffmpeg-installer/ffmpeg'); var _ffmpeg2 = _interopRequireDefault(_ffmpeg);
var _fluentffmpeg = require('fluent-ffmpeg'); var _fluentffmpeg2 = _interopRequireDefault(_fluentffmpeg);
_fluentffmpeg2.default.setFfmpegPath(_ffmpeg2.default.path);
let webpmux;

async function initWebpmux() {
    if (!webpmux) {
        try {
            const mod = await Promise.resolve().then(() => _interopRequireWildcard(require('node-webpmux')));
            webpmux = mod.default || mod;
        } catch (e) {
            console.error('[EXIF] Failed to load node-webpmux:', e.message);
        }
    }
    return webpmux;
}

function getTempDir() {
    const tmpDir = _path2.default.join(process.cwd(), 'tmp');
    if (!_fs2.default.existsSync(tmpDir)) {
        _fs2.default.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpDir;
}

const DEFAULT_METADATA = {
    packname: 'Ourin-AI',
    author: 'Bot',
    packId: 'com.ourin.sticker',
    emojis: ['🤖']
};

function createExif(options = {}) {
    const packname = _nullishCoalesce(options.packname, () => ( DEFAULT_METADATA.packname));
    const author = _nullishCoalesce(options.author, () => ( DEFAULT_METADATA.author));
    const packId = _nullishCoalesce(options.packId, () => ( DEFAULT_METADATA.packId));
    const emojis = _nullishCoalesce(options.emojis, () => ( DEFAULT_METADATA.emojis));
    
    const json = {
        'sticker-pack-id': packId,
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'emojis': emojis,
        'is-avatar-sticker': 0,
        'android-app-store-link': '',
        'ios-app-store-link': ''
    };
    
    let exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00,
        0x00, 0x00
    ]);
    
    let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    let exif = Buffer.concat([exifAttr, jsonBuffer]);
    
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    
    return exif;
}

function imageToWebpFFmpeg(buffer) {
    return new Promise((resolve, reject) => {
        const tmpDir = getTempDir();
        const inputPath = _path2.default.join(tmpDir, `img_${Date.now()}_${_crypto2.default.randomBytes(4).toString('hex')}.png`);
        const outputPath = _path2.default.join(tmpDir, `sticker_${Date.now()}_${_crypto2.default.randomBytes(4).toString('hex')}.webp`);
        
        _fs2.default.writeFileSync(inputPath, buffer);
        
        _fluentffmpeg2.default.call(void 0, inputPath)
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1",
                '-loop', '0',
                '-preset', 'default',
                '-an',
                '-vsync', '0',
                '-quality', '80'
            ])
            .toFormat('webp')
            .on('end', () => {
                try {
                    const webpBuffer = _fs2.default.readFileSync(outputPath);
                    if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
                    if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
                    resolve(webpBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
                if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
                reject(err);
            })
            .save(outputPath);
    });
}

function videoToWebpFFmpeg(buffer, options = {}) {
    return new Promise((resolve, reject) => {
        const tmpDir = getTempDir();
        const isGif = buffer.slice(0, 4).toString("hex") === "47494638";
        const ext = isGif ? "gif" : "mp4";
        const inputPath = _path2.default.join(tmpDir, `vid_${Date.now()}_${_crypto2.default.randomBytes(4).toString('hex')}.${ext}`);
        const outputPath = _path2.default.join(tmpDir, `animated_${Date.now()}_${_crypto2.default.randomBytes(4).toString('hex')}.webp`);
        
        _fs2.default.writeFileSync(inputPath, buffer);
        
        const duration = options.duration || 5;
        const fps = options.fps || 15;
        
        _fluentffmpeg2.default.call(void 0, inputPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-vcodec', 'libwebp',
                '-vf', `fps=${fps},scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1`,
                '-loop', '0',
                '-ss', '0',
                '-t', String(duration),
                '-preset', 'default',
                '-an',
                '-vsync', '0'
            ])
            .toFormat('webp')
            .on('end', () => {
                try {
                    const webpBuffer = _fs2.default.readFileSync(outputPath);
                    if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
                    if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
                    resolve(webpBuffer);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err) => {
                if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
                if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
                reject(err);
            })
            .save(outputPath);
    });
}

async function addExifToWebp(webpBuffer, options = {}) {
    await initWebpmux();
    
    if (!webpmux) {
        return addExifToWebpFallback(webpBuffer, options);
    }
    
    try {
        const exif = createExif(options);
        const img = new webpmux.Image();
        
        await img.load(webpBuffer);
        img.exif = exif;
        
        return await img.save(null);
    } catch (error) {
        console.error('[EXIF] webpmux error:', error.message);
        return addExifToWebpFallback(webpBuffer, options);
    }
}

async function createStickerFromImage(imageBuffer, options = {}) {
    const isWebp = imageBuffer.slice(0, 4).toString("hex") === "52494646";
    const webpBuffer = isWebp ? imageBuffer : await imageToWebpFFmpeg(imageBuffer);
    return await addExifToWebp(webpBuffer, options);
}

async function createStickerFromVideo(videoBuffer, options = {}) {
    const isWebp = videoBuffer.slice(0, 4).toString("hex") === "52494646";
    let webpBuffer;
    
    if (isWebp) {
        webpBuffer = videoBuffer;
    } else {
        webpBuffer = await videoToWebpFFmpeg(videoBuffer, {
            duration: options.duration || 5,
            fps: options.fps || 15
        });
    }
    return await addExifToWebp(webpBuffer, {
        packname: options.packname,
        author: options.author,
        emojis: options.emojis
    });
}

function addExifToWebpFallback(webpBuffer, options = {}) {
    const exif = createExif(options);
    const hasExif = webpBuffer.indexOf(Buffer.from('EXIF')) !== -1;
    
    if (hasExif) {
        return replaceExifInWebp(webpBuffer, exif);
    }
    const riffHeader = webpBuffer.slice(0, 4);
    const webpSignature = webpBuffer.slice(8, 12);
    const webpData = webpBuffer.slice(12);
    const exifChunkId = Buffer.from('EXIF');
    const exifSize = Buffer.alloc(4);
    exifSize.writeUInt32LE(exif.length);
    
    const exifChunk = Buffer.concat([exifChunkId, exifSize, exif]);
    const padding = exif.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
    const newWebpData = Buffer.concat([webpData, exifChunk, padding]);
    const newFileSize = Buffer.alloc(4);
    newFileSize.writeUInt32LE(4 + newWebpData.length);
    
    return Buffer.concat([riffHeader, newFileSize, webpSignature, newWebpData]);
}

function replaceExifInWebp(webpBuffer, newExif) {
    const exifIndex = webpBuffer.indexOf(Buffer.from('EXIF'));
    
    if (exifIndex === -1) {
        return addExifToWebpFallback(webpBuffer, {});
    }
    
    const oldExifSize = webpBuffer.readUInt32LE(exifIndex + 4);
    const padding = oldExifSize % 2 === 1 ? 1 : 0;
    
    const beforeExif = webpBuffer.slice(0, exifIndex);
    const afterExif = webpBuffer.slice(exifIndex + 8 + oldExifSize + padding);
    
    const exifChunkId = Buffer.from('EXIF');
    const exifSize = Buffer.alloc(4);
    exifSize.writeUInt32LE(newExif.length);
    
    const newPadding = newExif.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
    
    const newWebp = Buffer.concat([beforeExif, exifChunkId, exifSize, newExif, newPadding, afterExif]);
    
    const newFileSize = newWebp.length - 8;
    newWebp.writeUInt32LE(newFileSize, 4);
    
    return newWebp;
}

function readExifFromWebp(webpBuffer) {
    const exifIndex = webpBuffer.indexOf(Buffer.from('EXIF'));
    
    if (exifIndex === -1) {
        return null;
    }
    
    const exifSize = webpBuffer.readUInt32LE(exifIndex + 4);
    const exifData = webpBuffer.slice(exifIndex + 8, exifIndex + 8 + exifSize);
    
    try {
        const jsonStart = 22;
        const jsonData = exifData.slice(jsonStart);
        return JSON.parse(jsonData.toString('utf8'));
    } catch (e2) {
        return null;
    }
}

function isValidWebp(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return false;
    }
    
    const riff = buffer.slice(0, 4).toString('ascii');
    const webp = buffer.slice(8, 12).toString('ascii');
    
    return riff === 'RIFF' && webp === 'WEBP';
}

async function isAnimatedWebp(buffer) {
    if (!isValidWebp(buffer)) {
        return false;
    }
    
    return buffer.indexOf(Buffer.from('ANIM')) !== -1 || 
           buffer.indexOf(Buffer.from('ANMF')) !== -1;
}

function getWebpDimensions(buffer) {
    if (!isValidWebp(buffer)) {
        return null;
    }
    
    try {
        const vp8Index = buffer.indexOf(Buffer.from('VP8 '));
        if (vp8Index !== -1) {
            const width = buffer.readUInt16LE(vp8Index + 14) & 0x3FFF;
            const height = buffer.readUInt16LE(vp8Index + 16) & 0x3FFF;
            return { width, height };
        }
        const vp8lIndex = buffer.indexOf(Buffer.from('VP8L'));
        if (vp8lIndex !== -1) {
            const bits = buffer.readUInt32LE(vp8lIndex + 9);
            const width = (bits & 0x3FFF) + 1;
            const height = ((bits >> 14) & 0x3FFF) + 1;
            return { width, height };
        }
        const vp8xIndex = buffer.indexOf(Buffer.from('VP8X'));
        if (vp8xIndex !== -1) {
            const width = (buffer.readUIntLE(vp8xIndex + 12, 3) + 1);
            const height = (buffer.readUIntLE(vp8xIndex + 15, 3) + 1);
            return { width, height };
        }
        
        return null;
    } catch (e3) {
        return null;
    }
}

function generateStickerId() {
    return `sticker_${Date.now()}_${_crypto2.default.randomBytes(4).toString('hex')}`;
}

function cleanTempFiles(maxAge = 3600000) {
    const tmpDir = _path2.default.join(process.cwd(), 'tmp');
    
    if (!_fs2.default.existsSync(tmpDir)) {
        return;
    }
    
    const now = Date.now();
    const files = _fs2.default.readdirSync(tmpDir);
    
    for (const file of files) {
        if (file.startsWith('exif_') || file.startsWith('input_') || 
            file.startsWith('output_') || file.startsWith('img_') || 
            file.startsWith('vid_') || file.startsWith('sticker_') ||
            file.startsWith('animated_')) {
            const filePath = _path2.default.join(tmpDir, file);
            try {
                const stat = _fs2.default.statSync(filePath);
                if (now - stat.mtimeMs > maxAge) {
                    _fs2.default.unlinkSync(filePath);
                }
            } catch (e4) {
            }
        }
    }
}

const PRESETS = {
    default: {
        packname: 'Ourin-AI',
        author: 'Bot',
        emojis: ['🤖']
    },
    meme: {
        packname: 'Meme Pack',
        author: 'Ourin-AI',
        emojis: ['😂', '🤣']
    },
    love: {
        packname: 'Love Pack',
        author: 'Ourin-AI',
        emojis: ['❤️', '💕', '💖']
    },
    sad: {
        packname: 'Sad Pack',
        author: 'Ourin-AI',
        emojis: ['😢', '😭', '💔']
    },
    angry: {
        packname: 'Angry Pack',
        author: 'Ourin-AI',
        emojis: ['😠', '😡', '💢']
    }
};









exports.createExif = createExif; exports.addExifToWebp = addExifToWebp; exports.addExifToWebpFallback = addExifToWebpFallback; exports.replaceExifInWebp = replaceExifInWebp; exports.readExifFromWebp = readExifFromWebp; exports.initWebpmux = initWebpmux; exports.imageToWebpFFmpeg = imageToWebpFFmpeg; exports.videoToWebpFFmpeg = videoToWebpFFmpeg; exports.createStickerFromImage = createStickerFromImage; exports.createStickerFromVideo = createStickerFromVideo; exports.isValidWebp = isValidWebp; exports.isAnimatedWebp = isAnimatedWebp; exports.getWebpDimensions = getWebpDimensions; exports.generateStickerId = generateStickerId; exports.cleanTempFiles = cleanTempFiles; exports.getTempDir = getTempDir; exports.ffmpeg = _fluentffmpeg2.default; exports.DEFAULT_METADATA = DEFAULT_METADATA; exports.PRESETS = PRESETS;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
