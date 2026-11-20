"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: 'ganti-asset',
    alias: ['gantiasset', 'setasset'],
    category: 'owner',
    description: 'Todas en una herramienta para reemplazar un activo interactivo',
    usage: '.ganti-asset (reply media)',
    example: '.ganti-asset',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

if (!global.gantiAssetSessions) {
    global.gantiAssetSessions = {};
}

async function handler(m, { sock }) {
    try {
        const isImage = m.isImage || (m.quoted && m.quoted.isImage);
        const isVideo = m.isVideo || (m.quoted && m.quoted.isVideo);
        const isAudio = m.isAudio || (m.quoted && m.quoted.isAudio);
        const isDocument = m.isDocument || (m.quoted && m.quoted.isDocument);

        const isMedia = isImage || isVideo || isAudio || isDocument;

        if (!isMedia) {
            return m.reply(`*GANTI ASSET*\n\nEnvía o responde con un archivo (imagen, video, audio o documento) usando \`${m.prefix}ganti-asset\``);
        }

        m.react('🕕');

        let buffer;
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download();
        } else if (m.isMedia) {
            buffer = await m.download();
        }

        if (!buffer) {
            return m.reply('❌Steennad descargando medios.');
        }

        const assets = _configjs2.default.assets || {};
        const keys = Object.keys(assets);
        if (keys.length === 0) {
            return m.reply('❌No hay activos en config.');
        }

        const imageKeys = [];
        const videoKeys = [];
        const audioKeys = [];
        const fontKeys = [];
        const otherKeys = [];

        keys.forEach(k => {
            const pathUrl = assets[k].toLowerCase();
            if (pathUrl.endsWith('.jpg') || pathUrl.endsWith('.png') || pathUrl.endsWith('.jpeg') || pathUrl.endsWith('.webp')) {
                imageKeys.push(k);
            } else if (pathUrl.endsWith('.mp4')) {
                videoKeys.push(k);
            } else if (pathUrl.endsWith('.mp3') || pathUrl.endsWith('.ogg') || pathUrl.endsWith('.wav')) {
                audioKeys.push(k);
            } else if (pathUrl.endsWith('.ttf') || pathUrl.endsWith('.otf')) {
                fontKeys.push(k);
            } else {
                otherKeys.push(k);
            }
        });

        const orderedKeys = [...imageKeys, ...videoKeys, ...audioKeys, ...fontKeys, ...otherKeys];

        let listText = `📂* OPTION ASSET JANG WHILE COPED *\n\n`;
        listText += `Silengreply este mensaje con un número ( 1 -${orderedKeys.length})_\n\n`;

        let idx = 1;
        if (imageKeys.length > 0) {
            listText += `*🖼️ Image Assets:*\n`;
            imageKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (videoKeys.length > 0) {
            listText += `*🎥 Video Assets:*\n`;
            videoKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (audioKeys.length > 0) {
            listText += `*🎵 Audio Assets:*\n`;
            audioKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (fontKeys.length > 0) {
            listText += `*🔤 Font Assets:*\n`;
            fontKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }
        if (otherKeys.length > 0) {
            listText += `*📁 Other Assets:*\n`;
            otherKeys.forEach(k => { listText += `> ${idx++}. ${k}\n`; });
            listText += `\n`;
        }

        global.gantiAssetSessions[m.chat] = {
            sender: m.sender,
            buffer,
            isImageUpload: isImage,
            isVideoUpload: isVideo,
            isAudioUpload: isAudio,
            isFontUpload: isDocument,
            keys: orderedKeys,
            imageKeys,
            videoKeys,
            audioKeys,
            fontKeys
        };

        await m.reply(listText.trim());

        setTimeout(() => {
            if (global.gantiAssetSessions[m.chat]) {
                delete global.gantiAssetSessions[m.chat];
            }
        }, 120000);

        m.react('✅');
    } catch (error) {
        m.react('☢');
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function gantiAssetAnswerHandler(m, sock) {
    if (!m.body) return false;
    if (!global.gantiAssetSessions) return false;

    const session = global.gantiAssetSessions[m.chat];
    if (!session) return false;
    if (session.sender !== m.sender) return false;

    const num = parseInt(m.body.trim());
    if (isNaN(num)) return false;

    if (num < 1 || num > session.keys.length) {
        if (m.quoted && m.quoted.fromMe) {
            await m.reply(`❌Número inválido. Seleccione entre 1 -${session.keys.length}.`);
        }
        return false;
    }

    const selectedKey = session.keys[num - 1];

    const isImageUpload = session.isImageUpload;
    const isVideoUpload = session.isVideoUpload;
    const isAudioUpload = session.isAudioUpload;
    const isFontUpload = session.isFontUpload;

    if (session.imageKeys && session.imageKeys.includes(selectedKey) && !isImageUpload) {
        await m.reply(`❌¡Formal no es algo!\n• Asset •${selectedKey}* Necesito un archivo de imagen.`);
        return true;
    }
    if (session.videoKeys && session.videoKeys.includes(selectedKey) && !isVideoUpload) {
        await m.reply(`❌¡Formal no es algo!\n• Asset •${selectedKey}* Necesito un archivo de vídeo.`);
        return true;
    }
    if (session.audioKeys && session.audioKeys.includes(selectedKey) && !isAudioUpload) {
        await m.reply(`❌¡Formal no es algo!\n• Asset •${selectedKey}* Necesito un audio de archivo.`);
        return true;
    }
    if (session.fontKeys && session.fontKeys.includes(selectedKey) && !isFontUpload) {
        await m.reply(`❌¡Formal no es algo!\n• Asset •${selectedKey}* Necesita un archivo de documento de fuente.`);
        return true;
    }

    let ext = '.jpg';
    if (isVideoUpload) ext = '.mp4';
    else if (isAudioUpload) ext = '.mp3';
    else if (isFontUpload) ext = '.ttf';

    const filename = selectedKey + ext;

    await m.react('🕕');

    try {
        const newPath = await _ourinuploaderjs.updateAssetUrl.call(void 0, selectedKey, session.buffer, filename);
        await m.reply(`✅*Exito*\n\n• Asset •${selectedKey}* ha sido cambiado a:\n•${newPath}\n" Config has been updated as a reality "!`);
        delete global.gantiAssetSessions[m.chat];
        await m.react('✅');
    } catch (e) {
        await m.react('❌');
        await m.reply(`❌Activo de los cambios de tensión:${e.message}`);
    }

    return true;
}

exports.config = pluginConfig; exports.handler = handler; exports.gantiAssetAnswerHandler = gantiAssetAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
