"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almiku = require('almiku');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikucontextjs = require('./almiku-context.js');
var _almikuutilsjs = require('./almiku-utils.js');
/**
 * @typedef {Object} MessageOptions
* @ proprie{Object}Mensaje a
* @ proprie{boolean}•
*Voy a morir* *voy a morir*
 */

/**
 * @typedef {Object} ButtonData
 * @property {string} text - Text button
 * @property {string} id - ID button
 */

/**
 * @typedef {Object} ListSection
 * @property {string} title - Judul section
 * @property {Array<{title: string, rowId: string, description?: string}>} rows - Array rows
 */

/**
* Mensajes Ksender texn
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param{string}texT Text para enviar
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 * @example
 * await sendText(sock, jid, 'Hello World!', { quoted: m });
 */
async function sendText(sock, jid, text, options = {}) {
  return sock.sendMessage(
    jid,
    {
      text,
      mentions: options.mentions || [],
    },
    {
      quoted: options.quoted,
      ephemeralExpiration: options.ephemeral ? 86400 : undefined,
    },
  );
}

/**
* Mensaje Ksender con respuesta
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param{string}texT Text para enviar
* @ param{Object}- La cita de Mensaje se hace en respuesta
 * @returns {Promise<Object>} Sent message
 */
async function sendReply(sock, jid, text, quoted) {
  return sendText(sock, jid, text, { quoted });
}

/**
* Imagen de la caja
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param { Buffer { Buffer} Takstring } image
* @ param{string}*Capción* *Capción dibujo de la Capción*
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 * @example
 * await sendImage(sock, jid, imageBuffer, 'Caption here', { quoted: m });
 * await sendImage(sock, jid, 'https://example.com/image.png');
 */
async function sendImage(sock, jid, image, caption = "", options = {}) {
  let buffer;

  if (typeof image === "string") {
    if (image.startsWith("http")) {
      buffer = await _almikuutilsjs.fetchBuffer.call(void 0, image);
    } else if (_fs2.default.existsSync(image)) {
      buffer = _fs2.default.readFileSync(image);
    } else {
      throw new Error("Invalid image source");
    }
  } else {
    buffer = image;
  }

  return sock.sendMessage(
    jid,
    {
      image: buffer,
      caption,
      mentions: options.mentions || [],
    },
    {
      quoted: options.quoted,
      ephemeralExpiration: options.ephemeral ? 86400 : undefined,
    },
  );
}

/**
* Ksentvideo
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param { Buffer Takenstring } video - Buffer video o URL
 * @param {string} [caption=''] - Caption video
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendVideo(sock, jid, video, caption = "", options = {}) {
  let buffer;

  if (typeof video === "string") {
    if (video.startsWith("http")) {
      buffer = await _almikuutilsjs.fetchBuffer.call(void 0, video);
    } else if (_fs2.default.existsSync(video)) {
      buffer = _fs2.default.readFileSync(video);
    } else {
      throw new Error("Invalid video source");
    }
  } else {
    buffer = video;
  }

  return sock.sendMessage(
    jid,
    {
      video: buffer,
      caption,
      mentions: options.mentions || [],
    },
    {
      quoted: options.quoted,
      ephemeralExpiration: options.ephemeral ? 86400 : undefined,
    },
  );
}

/**
* Ksender audigo
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param { Buffer Takenstring } audio - Buffer audio o URL
* @ param{boolean}Es como nota de voicce
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendAudio(sock, jid, audio, ptt = false, options = {}) {
  let buffer;

  if (typeof audio === "string") {
    if (audio.startsWith("http")) {
      buffer = await _almikuutilsjs.fetchBuffer.call(void 0, audio);
    } else if (_fs2.default.existsSync(audio)) {
      buffer = _fs2.default.readFileSync(audio);
    } else {
      throw new Error("Invalid audio source");
    }
  } else {
    buffer = audio;
  }

  return sock.sendMessage(
    jid,
    {
      audio: buffer,
      ptt,
      mimetype: "audio/mpeg",
    },
    {
      quoted: options.quoted,
    },
  );
}

/**
* Ksentsticker
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendSticker(sock, jid, sticker, options = {}) {
  let buffer;

  if (typeof sticker === "string") {
    if (sticker.startsWith("http")) {
      buffer = await _almikuutilsjs.fetchBuffer.call(void 0, sticker);
    } else if (_fs2.default.existsSync(sticker)) {
      buffer = _fs2.default.readFileSync(sticker);
    } else {
      throw new Error("Invalid sticker source");
    }
  } else {
    buffer = sticker;
  }

  return sock.sendMessage(
    jid,
    {
      sticker: buffer,
    },
    {
      quoted: options.quoted,
    },
  );
}

/**
* Documentos clericales / archivos
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param
* @ param{string}Nombre del archivo - Nombre del archivo
* @ param{string}*A mimetipo* *Mimetipo archivo*
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendDocument(sock, jid, file, fileName, mimetype, options = {}) {
  let buffer;

  if (typeof file === "string") {
    if (file.startsWith("http")) {
      buffer = await _almikuutilsjs.fetchBuffer.call(void 0, file);
    } else if (_fs2.default.existsSync(file)) {
      buffer = _fs2.default.readFileSync(file);
    } else {
      throw new Error("Invalid file source");
    }
  } else {
    buffer = file;
  }

  const mime = mimetype || _almikuutilsjs.getMimeType.call(void 0, buffer);

  return sock.sendMessage(
    jid,
    {
      document: buffer,
      fileName,
      mimetype: mime,
      caption: options.caption || "",
    },
    {
      quoted: options.quoted,
    },
  );
}

/**
* Persecutor constante
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param{string}Número uno en
* @ param{string}nombre - Nombre de Conn
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendContact(sock, jid, number, name, options = {}) {
  const cleanNumber = number.replace(/[^0-9]/g, "");

  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}
END:VCARD`;

  return sock.sendMessage(
    jid,
    {
      contacts: {
        displayName: name,
        contacts: [{ vcard }],
      },
    },
    {
      quoted: options.quoted,
    },
  );
}

/**
* Container de localización
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
* @ param{string}- Nombre de la ubicación.
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendLocation(
  sock,
  jid,
  latitude,
  longitude,
  name = "",
  options = {},
) {
  return sock.sendMessage(
    jid,
    {
      location: {
        degreesLatitude: latitude,
        degreesLongitude: longitude,
        name,
      },
    },
    {
      quoted: options.quoted,
    },
  );
}

/**
* Kpersreact emoji
 * @param {Object} sock - Socket connection
* @ param{string}Jid - JID CHATTER
* @ param{string}emoji - Emoji para reacciones
* @ param{Object}- Llave de mensaje para leer
 * @returns {Promise<Object>} Result
 */
async function sendReact(sock, jid, emoji, key) {
  return sock.sendMessage(jid, {
    react: {
      text: emoji,
      key,
    },
  });
}

/**
* Mensaje de Ksender con incinerador de escribir
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param{string}texT Text para enviar
* @ param{number}Delay
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendWithTyping(sock, jid, text, delay = 1000, options = {}) {
  await sock.sendPresenceUpdate("composing", jid);
  await new Promise((r) => setTimeout(r, delay));
  await sock.sendPresenceUpdate("paused", jid);
  return sendText(sock, jid, text, options);
}

/**
* Mensaje Ksender a múltiples JID
 * @param {Object} sock - Socket connection
 * @param {string[]} jids - Array JID tujuan
* @ param{Object}contenido - Mensaje de contenido
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object[]>} Array sent messages
 */
async function sendToMultiple(sock, jids, content, options = {}) {
  const results = [];

  for (const jid of jids) {
    try {
      const result = await sock.sendMessage(jid, content, options);
      results.push({ jid, success: true, result });
    } catch (error) {
      results.push({ jid, success: false, error: error.message });
    }
  }

  return results;
}

/**
* Mensaje previo a otro JID
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param{Object}mensaje - pence to be--forred
* @ param{boolean}*Para una fuerza hacia adelante* *fuera* *fuera hacia adelante con etiqueta*
 * @returns {Promise<Object>} Forwarded message
 */
async function forwardMessage(sock, jid, message, forceForward = false) {
  return sock.sendMessage(jid, {
    forward: message,
    force: forceForward,
  });
}

/**
* Eliminar el mensaje
 * @param {Object} sock - Socket connection
* @ param{string}Jid - JID CHATTER
 * @param {Object} key - Message key
 * @returns {Promise<Object>} Result
 */
async function deleteMessage(sock, jid, key) {
  return sock.sendMessage(jid, {
    delete: key,
  });
}

/**
* He hecho el mensaje de citas tonto para respuesta falsa
 * @param {string} jid - JID pengirim
* @ param{string}texT Text mensaje
* @ param{string}- El nombre del remitente
 * @returns {Object} Dummy quoted message
 */
function createQuotedDummy(jid, text, pushName = "•") {
  return {
    key: {
      fromMe: false,
      participant: jid,
      remoteJid: jid,
    },
    message: {
      conversation: text,
    },
    pushName,
  };
}

/**
* Mensaje de persecución con vista previa de enlace de miniatura
 * @param {Object} sock - Socket connection
 * @param {string} jid - JID tujuan
* @ param{string}texT Text mensaje
 * @param {Object} preview - Preview data
 * @param {string} preview.title - Judul preview
 * @param {string} preview.body - Body preview
* @ param{string}texT Texmenú
• Los diarios del vampiro •
* @ param{MessageOptions}* Echotions *{}- Opsia de mensaje
 * @returns {Promise<Object>} Sent message
 */
async function sendWithPreview(sock, jid, text, preview, options = {}) {
  const ctx = _almikucontextjs.saluranCtx.call(void 0, );
  ctx.mentionedJid = options.mentions || [];
  return sock.sendMessage(
    jid,
    {
      text,
      contextInfo: ctx,
    },
    {
      quoted: options.quoted,
    },
  );
}

async function sendMenu(sock, jid, text, image = null, options = {}) {
  if (image) {
    return sendImage(sock, jid, image, text, options);
  }
  return sendText(sock, jid, text, options);
}



















exports.sendText = sendText; exports.sendReply = sendReply; exports.sendImage = sendImage; exports.sendVideo = sendVideo; exports.sendAudio = sendAudio; exports.sendSticker = sendSticker; exports.sendDocument = sendDocument; exports.sendContact = sendContact; exports.sendLocation = sendLocation; exports.sendReact = sendReact; exports.sendWithTyping = sendWithTyping; exports.sendToMultiple = sendToMultiple; exports.forwardMessage = forwardMessage; exports.deleteMessage = deleteMessage; exports.createQuotedDummy = createQuotedDummy; exports.sendWithPreview = sendWithPreview; exports.sendMenu = sendMenu;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
