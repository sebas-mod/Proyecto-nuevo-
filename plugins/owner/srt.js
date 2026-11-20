"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourin = require('ourin');

const pluginConfig = {
    name: 'srt',
    alias: ['shufflereplythumb', 'shufflereply'],
    category: 'owner',
    description: 'Shuffle Respuesta Thumb ( SRT ) sistema de respuesta aleatoria imágenes interactivas',
    usage: '.srt on',
    example: '.srt on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
};

if (!global.srtSession) {
    global.srtSession = {};
}

const SHUFFLE_DIR = _path2.default.join(process.cwd(), 'assets', 'image', 'shuffle');

function countShuffleImages() {
    if (!_fs2.default.existsSync(SHUFFLE_DIR)) return 0;
    const files = _fs2.default.readdirSync(SHUFFLE_DIR);
    return files.filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg')).length;
}

async function handler(m, { sock, args }) {
    try {
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

        if (!action) {
            return m.reply(`🛠♪SYSTETLES SHUFFLE Responder THUMB ( SRT )♪\n\nBienvenido al menóde reprogramming ón de auto @ - @. Este permite que el bot reemplace con imágenes * minivuira * revuelto por automatización de la colección que guardas.\n\nAgut es una lista de commanños disperibles:\n- *. srt on *: Activando el shuffle @ - @ como fumbles.\n- *. srt off *: desactivar las características de la mucama y volver a la cohermentinsción tempprana.\n- *. srt c *: Bloquear captura de imagen para añadir nuevas coros a la base de datos.\n- *. srt d *: Cubre el sesi de captura de la imagen.\n- *. srt list *: Adjuntar toda la colección de imágenes almacenadas en la base de datos de arranque.\nRemoción de la imagen de la base de datos romana.`);
        }

        if (action === 'on') {
            db.setting('srtEnabled', true);
            await m.reply('✅* CUENTAS DE LA TRIBUNAL FUTURO *\n\nEstá característica ha sido globalizada. Cada peso @-@ basado bot consolidado ahora mostrará una imagen aleatoria de la carpeta de shuffle que se ha recogido.');
        } 
        else if (action === 'off') {
            db.setting('srtEnabled', false);
            await m.reply('❌* FIRECCIÓN DE SPT PRETTY DINONACTIVE *\n\nLa miniatura aleatoria ha sido presionada. Todo el robot revierte utilizará la imagen * predeterminado con el sistema.');
        } 
        else if (action === 'c' || action === 'capture') {
            global.srtSession[m.chat] = { sender: m.sender, count: 0 };
            const totalImages = countShuffleImages();
            await m.reply(`📸* El período de sesiones provisional*\n\nPor favor envíe las imágenes una a una para seguir difundando en este chat. Esto mostrará cada imagen y delgado para almacenarlas en un sistema automatal.\n\n- La imagen total se guarda: hoy *${totalImages}*\n- Cuando todas las fotos estén terminadas, deténgase con las órdenes.\`${m.prefix}srt d\`.`);
        } 
        else if (action === 'd' || action === 'done') {
            if (!global.srtSession[m.chat] || global.srtSession[m.chat].sender !== m.sender) {
                return m.reply('❌No está en la sesión de captura activa por ahora.');
            }
            const count = global.srtSession[m.chat].count;
            delete global.srtSession[m.chat];
            const totalImages = countShuffleImages();
            await m.reply(`✅* SEGUNDA DE LA GAMBARA CLEAR*\n\nSesi ha sido suspendido y toda la imagen ha sido procesada.\n- Parte superior de la nueva imagen minada: *${count}*\n- El cuadro total del sistema: *${totalImages}*`);
        } 
        else if (action === 'list') {
            if (!_fs2.default.existsSync(SHUFFLE_DIR)) return m.reply('❌No hay una sola imagen almacenada en el directorio shuffle. Por favor, haga la captura más preventiva.');
            const files = _fs2.default.readdirSync(SHUFFLE_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
            if (files.length === 0) return m.reply('❌El directorio * shuffle sigue vacío. Por favor, utilice el comando de captura para añadir la imagen.');
            
            await m.reply(`📂* Registrate Imagen SHUFFLE*\n\nEl sistema encontrado *${files.length}&#91; imagen guardada. Pitch procesamiento y secuencia de disco para mostrar, por favor espere un momento.`);
            
            try {
                const opener = _ourin.generateWAMessageFromContent.call(void 0, 
                    m.chat,
                    {
                        messageContextInfo: { messageSecret: _crypto2.default.randomBytes(32) },
                        albumMessage: {
                            expectedImageCount: files.length,
                            expectedVideoCount: 0,
                        },
                    },
                    {
                        userJid: _ourin.jidNormalizedUser.call(void 0, sock.user.id),
                        quoted: m,
                        upload: sock.waUploadToServer,
                    }
                );

                await sock.relayMessage(opener.key.remoteJid, opener.message, {
                    messageId: opener.key.id,
                });

                for (let i = 0; i < files.length; i++) {
                    const imgPath = _path2.default.join(SHUFFLE_DIR, files[i]);
                    const imgBuffer = _fs2.default.readFileSync(imgPath);

                    const msg = await _ourin.generateWAMessage.call(void 0, opener.key.remoteJid, { image: imgBuffer }, {
                        upload: sock.waUploadToServer,
                    });

                    msg.message.messageContextInfo = {
                        messageSecret: _crypto2.default.randomBytes(32),
                        messageAssociation: {
                            associationType: 1,
                            parentMessageKey: opener.key,
                        },
                    };

                    await sock.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id,
                    });
                }
            } catch (albumErr) {
                console.error('Album Error:', albumErr);
                return m.reply('❌Fue un error hacer un álbum.');
            }
        } 
        else if (action === 'del' || action === 'delete') {
            const isImage = m.isImage || (m.quoted && m.quoted.isImage);
            if (!isImage) {
                return m.reply('❌* CARA APPLAUDING Imagen: *\n\n1. Escribe`Lista de la srt.`para mostrar toda la colección de imágenes.\n2.`Srt del.`.');
            }
            
            await m.react('🕕');
            let buffer;
            try {
                if (m.quoted && m.quoted.isImage) {
                    buffer = await m.quoted.download();
                } else if (m.isImage) {
                    buffer = await m.download();
                }
            } catch (e) {
                return m.reply('❌Steenhead descarga una imagen para capturar.');
            }

            if (buffer) {
                const hash = _crypto2.default.createHash('md5').update(buffer).digest('hex').substring(0, 10);
                const filename = `srt_${hash}.jpg`;
                const filepath = _path2.default.join(SHUFFLE_DIR, filename);

                if (_fs2.default.existsSync(filepath)) {
                    _fs2.default.unlinkSync(filepath);
                    await m.reply(`✅* El más trabajado para ser desprendido *\n\nImagen logró ser hackeado de la base de datos.`);
                } else {
                    await m.reply('❌> 91; EL MEJOR NO SON TERRENO > 93;\n\nEstá imagen no está familiarizada con el contenido de la base de datos shuffle.');
                }
            }
            await m.react('✅');
        }
        else {
            await m.reply(`❌Comando de frente${action}No puede ser interpretado por el sistema.`);
        }
        
    } catch (error) {
        console.error('SRT List Error:', error);
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function srtAnswerHandler(m, sock) {
    if (!global.srtSession) return false;
    const session = global.srtSession[m.chat];
    if (!session || session.sender !== m.sender) return false;

    if (m.isCommand) return false;

    const isImage = m.isImage || (m.quoted && m.quoted.isImage);
    if (!isImage) return false;

    try {
        await m.react('🕕');
        let buffer;
        if (m.quoted && m.quoted.isImage) {
            buffer = await m.quoted.download();
        } else if (m.isImage) {
            buffer = await m.download();
        }

        if (buffer) {
            if (!_fs2.default.existsSync(SHUFFLE_DIR)) _fs2.default.mkdirSync(SHUFFLE_DIR, { recursive: true });
            
            const hash = _crypto2.default.createHash('md5').update(buffer).digest('hex').substring(0, 10);
            const ext = '.jpg';
            const filename = `srt_${hash}${ext}`;
            const filepath = _path2.default.join(SHUFFLE_DIR, filename);

            if (_fs2.default.existsSync(filepath)) {
                await m.reply('⚠El mismo color se almacena en la base de datos.');
            } else {
                _fs2.default.writeFileSync(filepath, buffer);
                session.count++;
                await m.reply(`✅*El más fuerte de la luz *\n\nEl Imagen ha sido puesto en bots de almacenamiento local.\n- Los totales de la imagen se miden en está sesión: *${session.count}*`);
            }
        }
        await m.react('✅');
        return true;
    } catch (e) {
        await m.react('❌');
        await m.reply('❌Fue una fatalidad para intentar descargar y contener la imagen.');
        return true;
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.srtAnswerHandler = srtAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
