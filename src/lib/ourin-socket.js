"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } function _optionalChainDelete(ops) { const result = _optionalChain(ops); return result == null ? true : result; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
let _sharp = null;
async function getSharp() {
  if (!_sharp) _sharp = (await Promise.resolve().then(() => _interopRequireWildcard(require("sharp")))).default;
  return _sharp;
}
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _archiver = require('archiver'); var _archiver2 = _interopRequireDefault(_archiver);








var _ourin = require('ourin');





var _ourinlidjs = require('./ourin-lid.js');

var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

var _ourinexifjs = require('./ourin-exif.js');
var _ffmpeg = require('@ffmpeg-installer/ffmpeg'); var _ffmpeg2 = _interopRequireDefault(_ffmpeg);
var _fluentffmpeg = require('fluent-ffmpeg'); var _fluentffmpeg2 = _interopRequireDefault(_fluentffmpeg);
_fluentffmpeg2.default.setFfmpegPath(_ffmpeg2.default.path);
var _configjs = require('./../../config.js');
var _mimetypes = require('mime-types'); var _mimetypes2 = _interopRequireDefault(_mimetypes);
var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);



var _ourinprofilepicturejs = require('./ourin-profile-picture.js');

function getTempDir() {
  const tmpDir = _path2.default.join(process.cwd(), "tmp");
  if (!_fs2.default.existsSync(tmpDir)) _fs2.default.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

async function downloadBuffer(url) {
  const response = await _axios2.default.get(url, {
    responseType: "arraybuffer",
    timeout: 60000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });
  return Buffer.from(response.data);
}

async function resolveInput(input) {
  if (Buffer.isBuffer(input)) return input;
  if (typeof input === "string") {
    if (/^https?:\/\//.test(input)) return await downloadBuffer(input);
    if (_fs2.default.existsSync(input)) return _fs2.default.readFileSync(input);
  }
  throw new Error("Invalid input: expected Buffer, URL string, or file path");
}

async function imageToWebp(buffer) {
  try {
    return await (
      await getSharp()
    )(buffer)
      .resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 80 })
      .toBuffer();
  } catch (error) {
    throw new Error("Failed to convert image to webp: " + error.message);
  }
}

function videoToWebp(buffer) {
  return new Promise((resolve, reject) => {
    const tmpDir = getTempDir();
    const isGif = buffer.slice(0, 4).toString("hex") === "47494638";
    const ext = isGif ? "gif" : "mp4";
    const inputPath = _path2.default.join(tmpDir, `input_${Date.now()}.${ext}`);
    const outputPath = _path2.default.join(tmpDir, `output_${Date.now()}.webp`);
    if (!buffer || buffer.length < 1000)
      return reject(new Error("Invalid video buffer"));
    _fs2.default.writeFileSync(inputPath, buffer);
    const cleanup = () => {
      try {
        if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
      } catch (e2) {}
      try {
        if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
      } catch (e3) {}
    };
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Video conversion timeout"));
    }, 60000);
    _fluentffmpeg2.default.call(void 0, inputPath)
      .inputOptions(["-y", "-t", "6"])
      .outputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "fps=12,scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,setsar=1",
        "-loop",
        "0",
        "-preset",
        "default",
        "-an",
        "-vsync",
        "0",
        "-q:v",
        "50",
      ])
      .toFormat("webp")
      .on("end", () => {
        clearTimeout(timeout);
        try {
          if (
            !_fs2.default.existsSync(outputPath) ||
            _fs2.default.statSync(outputPath).size < 100
          ) {
            cleanup();
            return reject(new Error("Output file is empty or invalid"));
          }
          const webpBuffer = _fs2.default.readFileSync(outputPath);
          cleanup();
          resolve(webpBuffer);
        } catch (err) {
          cleanup();
          reject(err);
        }
      })
      .on("error", (err) => {
        clearTimeout(timeout);
        cleanup();
        reject(new Error("FFmpeg error: " + err.message));
      })
      .save(outputPath);
  });
}

async function simpleImageToWebp(buffer) {
  const tmpDir = getTempDir();
  const inputPath = _path2.default.join(tmpDir, `img_${Date.now()}.png`);
  const outputPath = _path2.default.join(tmpDir, `sticker_${Date.now()}.webp`);
  _fs2.default.writeFileSync(inputPath, buffer);
  return new Promise((resolve, reject) => {
    _fluentffmpeg2.default.call(void 0, inputPath)
      .outputOptions([
        "-vcodec",
        "libwebp",
        "-vf",
        "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
        "-loop",
        "0",
        "-preset",
        "default",
        "-an",
        "-vsync",
        "0",
      ])
      .toFormat("webp")
      .on("end", () => {
        try {
          const webpBuffer = _fs2.default.readFileSync(outputPath);
          if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
          if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
          resolve(webpBuffer);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath);
        if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath);
        reject(err);
      })
      .save(outputPath);
  });
}

async function extendSocket(sock) {
  const _originalSendMessage = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    try {
      return await _originalSendMessage(jid, content, options);
    } catch (err) {
      const isPrivate =
        jid &&
        !jid.endsWith("@g.us") &&
        !jid.endsWith("@broadcast") &&
        !jid.endsWith("@newsletter");
      const isSessionError =
        _optionalChain([err, 'optionalAccess', _ => _.message, 'optionalAccess', _2 => _2.includes, 'call', _3 => _3("encrypt")]) ||
        _optionalChain([err, 'optionalAccess', _4 => _4.message, 'optionalAccess', _5 => _5.includes, 'call', _6 => _6("session")]) ||
        _optionalChain([err, 'optionalAccess', _7 => _7.message, 'optionalAccess', _8 => _8.includes, 'call', _9 => _9("pkmsg")]) ||
        _optionalChain([err, 'optionalAccess', _10 => _10.message, 'optionalAccess', _11 => _11.includes, 'call', _12 => _12("No Signal")]) ||
        _optionalChain([err, 'optionalAccess', _13 => _13.output, 'optionalAccess', _14 => _14.statusCode]) === 500;

      if (isPrivate && isSessionError) {
        try {
          if (sock.assertSessions) {
            await sock.assertSessions([jid], true);
          }
          if (sock.uploadPreKeys) {
            await sock.uploadPreKeys(5);
          }
          return await _originalSendMessage(jid, content, options);
        } catch (e4) {
          throw err;
        }
      }
      throw err;
    }
  };

  sock.sendImageAsSticker = async (jid, input, m, options = {}) => {
    const buffer = await resolveInput(input);
    const isWebp = buffer.slice(0, 4).toString("hex") === "52494646";
    let webpBuffer;
    
    if (isWebp) {
      webpBuffer = buffer;
    } else {
      try {
        webpBuffer = await (
          await getSharp()
        )(buffer)
          .resize(512, 512, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: 80 })
          .toBuffer();
      } catch (err) {
        throw new Error("Failed to convert image: " + err.message);
      }
    }
    try {
      webpBuffer = await _ourinexifjs.addExifToWebp.call(void 0, webpBuffer, {
        packname: _nullishCoalesce(options.packname, () => ( _ourinexifjs.DEFAULT_METADATA.packname)),
        author: _nullishCoalesce(options.author, () => ( _ourinexifjs.DEFAULT_METADATA.author)),
        emojis: options.emojis || _ourinexifjs.DEFAULT_METADATA.emojis,
      });
    } catch (e) {
      console.log("[Sticker] EXIF error:", e.message);
    }
    return sock.sendMessage(
      jid,
      {
        sticker: webpBuffer,
        isAiSticker: true,
        isAvatar: true,
        contextInfo: { isForwarded: true, forwardingScore: 1, premium: 1 },
      },
      { quoted: m },
    );
  };

  sock.sendVideoAsSticker = async (jid, input, m, options = {}) => {
    const buffer = await resolveInput(input);
    const isWebp = buffer.slice(0, 4).toString("hex") === "52494646";
    let webpBuffer;
    
    if (isWebp) {
      webpBuffer = buffer;
    } else {
      webpBuffer = await videoToWebp(buffer);
    }
    try {
      webpBuffer = await _ourinexifjs.addExifToWebp.call(void 0, webpBuffer, {
        packname: _nullishCoalesce(options.packname, () => ( _ourinexifjs.DEFAULT_METADATA.packname)),
        author: _nullishCoalesce(options.author, () => ( _ourinexifjs.DEFAULT_METADATA.author)),
        emojis: options.emojis || _ourinexifjs.DEFAULT_METADATA.emojis,
      });
    } catch (e) {
      console.log("[Sticker] EXIF error:", e.message);
    }
    return sock.sendMessage(
      jid,
      {
        sticker: webpBuffer,
        contextInfo: { isForwarded: true, forwardingScore: 999 },
      },
      { quoted: m },
    );
  };

  sock.sendStickerPack = async (jid, stickers, m, options = {}) => {
    if (!stickers || !stickers.length) throw new Error("No stickers provided");

    const packname = _nullishCoalesce(_nullishCoalesce(options.name, () => ( options.packname)), () => ( "Sticker Pack"));
    const publisher = _nullishCoalesce(_nullishCoalesce(options.publisher, () => ( options.author)), () => ( "Ourin-AI"));
    const packDescription = options.description || "";
    const stickerPackId = options.id || _crypto2.default.randomUUID();
    const emojis = options.emojis || ["\uD83C\uDFA8"];

    const stickerList = [];
    let coverBuffer = null;

    for (let i = 0; i < stickers.length; i++) {
      try {
        let stickerBuffer = stickers[i];
        if (typeof stickerBuffer === "string") {
          if (stickerBuffer.startsWith("http"))
            stickerBuffer = await downloadBuffer(stickerBuffer);
          else if (_fs2.default.existsSync(stickerBuffer))
            stickerBuffer = _fs2.default.readFileSync(stickerBuffer);
        }
        if (!Buffer.isBuffer(stickerBuffer) || stickerBuffer.length < 100)
          continue;

        const isGif = stickerBuffer.slice(0, 4).toString("hex") === "47494638";
        const isWebp = stickerBuffer.slice(0, 4).toString("hex") === "52494646";
        const isPng =
          stickerBuffer.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
        const isJpeg = stickerBuffer.slice(0, 2).toString("hex") === "ffd8";

        let webpBuffer;
        if (isGif) webpBuffer = await videoToWebp(stickerBuffer);
        else if (isWebp) webpBuffer = stickerBuffer;
        else if (isPng || isJpeg) webpBuffer = await imageToWebp(stickerBuffer);
        else {
          try {
            webpBuffer = await imageToWebp(stickerBuffer);
          } catch (e5) {
            webpBuffer = await videoToWebp(stickerBuffer);
          }
        }

        if (!coverBuffer) coverBuffer = webpBuffer;

        stickerList.push({
          sticker: webpBuffer,
          emojis,
          accessibilityLabel: "",
        });
      } catch (e) {
        console.log(`[StickerPack] Failed sticker ${i + 1}:`, e.message);
      }
    }

    if (stickerList.length === 0)
      throw new Error("No stickers could be prepared");

    return sock.sendMessage(
      jid,
      {
        stickerPack: {
          packId: stickerPackId,
          name: packname,
          publisher,
          description: packDescription,
          cover: coverBuffer,
          stickers: stickerList,
        },
      },
      m ? { quoted: m } : {},
    );
  };

  if (!global.stickerPackCache) global.stickerPackCache = new Map();

  sock.saveStickerPack = (packId, messageContent, packName = "Unknown") => {
    global.stickerPackCache.set(packId, {
      message: messageContent,
      name: packName,
      savedAt: Date.now(),
    });
  };
  sock.getSavedPacks = () => {
    const packs = [];
    for (const [id, data] of global.stickerPackCache.entries())
      packs.push({ id, name: data.name, savedAt: data.savedAt });
    return packs;
  };

  sock.forwardStickerPack = async (jid, packIdOrMessage, m) => {
    let messageContent;
    if (typeof packIdOrMessage === "string") {
      const cached = global.stickerPackCache.get(packIdOrMessage);
      if (!cached)
        throw new Error(`Sticker pack "${packIdOrMessage}" not found`);
      messageContent = cached.message;
    } else if (_optionalChain([packIdOrMessage, 'optionalAccess', _15 => _15.stickerPackMessage]))
      messageContent = packIdOrMessage;
    else throw new Error("Invalid sticker pack message format");
    const message = _ourin.generateWAMessageFromContent.call(void 0, jid, messageContent, {
      quoted: m,
      userJid: _optionalChain([sock, 'access', _16 => _16.user, 'optionalAccess', _17 => _17.id]),
      messageId: _crypto2.default.randomBytes(8).toString("hex").toUpperCase(),
    });
    await sock.relayMessage(jid, message.message, {
      messageId: message.key.id,
    });
    return message;
  };

  sock.sendFile = async (jid, input, options = {}) => {
    let buffer;
    let filename = options.filename || "file";
    let mimetype = options.mimetype;
    if (Buffer.isBuffer(input)) {
      buffer = input;
    } else if (typeof input === "string") {
      if (/^https?:\/\//.test(input)) {
        buffer = await downloadBuffer(input);
        filename =
          options.filename || _path2.default.basename(new URL(input).pathname) || "file";
      } else if (_fs2.default.existsSync(input)) {
        buffer = _fs2.default.readFileSync(input);
        filename = options.filename || _path2.default.basename(input);
      } else throw new Error("Invalid input");
    } else throw new Error("Invalid input type");
    if (!mimetype) {
      const ext = _path2.default.extname(filename).toLowerCase();
      const mt = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
        ".ogg": "audio/ogg",
        ".pdf": "application/pdf",
        ".zip": "application/zip",
      };
      mimetype = mt[ext] || "application/octet-stream";
    }
    let mc = {};
    if (mimetype.startsWith("image/")) {
      mc.image = buffer;
      if (options.caption) mc.caption = options.caption;
    } else if (mimetype.startsWith("video/")) {
      mc.video = buffer;
      mc.mimetype = mimetype;
      if (options.caption) mc.caption = options.caption;
    } else if (mimetype.startsWith("audio/")) {
      mc.audio = buffer;
      mc.mimetype = mimetype;
      mc.ptt = options.ptt || false;
    } else {
      mc.document = buffer;
      mc.mimetype = mimetype;
      mc.fileName = filename;
      if (options.caption) mc.caption = options.caption;
    }
    return sock.sendMessage(jid, mc, { quoted: options.quoted });
  };

  sock.sendMedia = async function (
    jid,
    source,
    caption = "",
    quoted,
    options = {},
  ) {
    function isUrlObject(v) {
      return (
        v &&
        typeof v === "object" &&
        !Buffer.isBuffer(v) &&
        typeof v.url === "string"
      );
    }
    if (
      source &&
      typeof source === "object" &&
      (source.image || source.video || source.audio || source.document)
    )
      return this.sendMessage(jid, source, options);
    let data = source;
    let mimeType = options.mimetype || "application/octet-stream";
    let fileName = options.fileName || "file";
    if (Buffer.isBuffer(source)) {
    } else if (typeof source === "string" && /^https?:\/\//.test(source))
      data = { url: source };
    else if (typeof source === "string" && _fs2.default.existsSync(source)) {
      mimeType = _mimetypes2.default.lookup(source) || "application/octet-stream";
      fileName = _path2.default.basename(source);
      data = _fs2.default.readFileSync(source);
    } else if (isUrlObject(source)) data = { url: source.url };
    else
      throw new Error(
        "Source harus berupa Buffer, URL string, path file, object { url }, atau payload media",
      );
    const mediaType = options.type || options.mediaType;
    const captionField = caption != null ? { caption } : {};
    let payload = {};
    if (mediaType === "image")
      payload = { image: data, ...captionField, ...options };
    else if (mediaType === "video")
      payload = { video: data, ...captionField, ...options };
    else if (mediaType === "audio") {
      const audioMime =
        mimeType && mimeType !== "application/octet-stream"
          ? mimeType
          : "audio/mpeg";
      payload = {
        audio: data,
        mimetype: audioMime,
        ptt: options.ptt || false,
        ...options,
      };
    } else
      payload = {
        document: data,
        mimetype: mimeType || "application/octet-stream",
        fileName,
        ...captionField,
        ...options,
      };
    delete payload.type;
    delete payload.mediaType;
    return sock.sendMessage(jid, payload, { quoted });
  };

  sock.sendButton = async function (
    jid,
    source,
    text = null,
    quoted,
    options = {},
  ) {
    const msg = {};
    if (options.header) msg.header = options.header;
    if (options.contextInfo) msg.contextInfo = options.contextInfo;
    if (text !== null) msg.caption = text;
    if (options.footer) msg.footer = options.footer;
    if (options.buttons) msg.interactiveButtons = options.buttons;
    if (!options.footer) msg.footer = _optionalChain([_configjs.config, 'access', _18 => _18.bot, 'optionalAccess', _19 => _19.name]) || "Ourin-AI";
    if (source) {
      let data = source;
      const mediaType = options.type || options.mediaType || "image";
      if (Buffer.isBuffer(source)) {
      } else if (typeof source === "string" && /^https?:\/\//.test(source))
        data = { url: source };
      else if (typeof source === "string" && _fs2.default.existsSync(source))
        data = _fs2.default.readFileSync(source);
      else if (source === null) data = null;
      if (mediaType === "image" && data) msg.image = data;
      else if (mediaType === "video" && data) {
        msg.video = data;
        msg.mimetype = options.mimetype || "video/mp4";
      } else if (mediaType === "audio" && data) {
        msg.audio = data;
        msg.mimetype = options.mimetype || "audio/mpeg";
      } else if (mediaType === "document" && data) {
        msg.document = data;
        msg.mimetype = options.mimetype || "application/octet-stream";
        if (options.fileName) msg.fileName = options.fileName;
      }
    }
    return sock.sendMessage(jid, msg, { quoted });
  };

  const _originalProfilePictureUrl = sock.profilePictureUrl.bind(sock);
  sock.profilePictureUrl = async function (jid) {
    return await _ourinprofilepicturejs.getProfilePicture.call(void 0, 
      { profilePictureUrl: _originalProfilePictureUrl },
      jid,
    );
  };
  sock.profileBuffer = async function (jid) {
    return await _ourinprofilepicturejs.getProfileBuffer.call(void 0, 
      { profilePictureUrl: _originalProfilePictureUrl },
      jid,
    );
  };
  sock.sendText = async function (jid, text, quoted, options = {}) {
    return await sock.sendMessage(jid, { text, ...options }, { quoted });
  };

  sock.sendContact = async (jid, contacts, options = {}) => {
    const contactArray = Array.isArray(contacts) ? contacts : [contacts];
    const vcards = contactArray.map((c) => {
      const name = c.name || "Unknown";
      const number = _optionalChain([c, 'access', _20 => _20.number, 'optionalAccess', _21 => _21.replace, 'call', _22 => _22(/[^0-9]/g, "")]) || "";
      const org = c.org || "";
      let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n`;
      if (org) vcard += `ORG:${org}\n`;
      vcard += `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;
      return { vcard };
    });
    const displayName =
      contactArray.length === 1
        ? contactArray[0].name || "Contact"
        : `${contactArray.length} Contacts`;
    return sock.sendMessage(
      jid,
      { contacts: { displayName, contacts: vcards } },
      { quoted: options.quoted },
    );
  };

  sock.downloadAndSaveMediaMessage = async (msg, savePath = null) => {
    const message = msg.message || msg;
    const type = _ourin.getContentType.call(void 0, message);
    if (!type) throw new Error("No media found in message");
    const buffer = await _ourin.downloadMediaMessage.call(void 0, 
      { message },
      "buffer",
      {},
      { logger: console, reuploadRequest: sock.updateMediaMessage },
    );
    let savedPath = null;
    if (savePath) {
      const dir = _path2.default.dirname(savePath);
      if (!_fs2.default.existsSync(dir)) _fs2.default.mkdirSync(dir, { recursive: true });
      _fs2.default.writeFileSync(savePath, buffer);
      savedPath = savePath;
    }
    return { buffer, path: savedPath, type };
  };

  sock.getName = async (jid, groupJid = null) => {
    if (!jid) return "Unknown";
    let id = jid;
    if (_ourinlidjs.isLid.call(void 0, jid) || _ourinlidjs.isLidConverted.call(void 0, jid)) {
      const cached = _ourinlidjs.getCachedJid.call(void 0, jid);
      if (cached) id = cached;
      else if (groupJid) {
        try {
          const gm = await sock.groupMetadata(groupJid);
          id = _ourinlidjs.resolveAnyLidToJid.call(void 0, jid, gm.participants || []);
        } catch (e6) {
          id = jid.replace("@lid", "@s.whatsapp.net");
        }
      } else id = jid.replace("@lid", "@s.whatsapp.net");
    }
    if (id.endsWith("@g.us")) {
      try {
        let v = _optionalChain([sock, 'access', _23 => _23.store, 'optionalAccess', _24 => _24.contacts, 'optionalAccess', _25 => _25[id]]) || {};
        if (!(v.name || v.subject))
          v = await sock.groupMetadata(id).catch(() => ({}));
        return v.name || v.subject || id.split("@")[0];
      } catch (e7) {
        return id.split("@")[0];
      }
    }
    if (id === "0@s.whatsapp.net") return "WhatsApp";
    const botId = _optionalChain([sock, 'access', _26 => _26.user, 'optionalAccess', _27 => _27.id, 'optionalAccess', _28 => _28.split, 'call', _29 => _29(":"), 'access', _30 => _30[0]]) + "@s.whatsapp.net";
    if (id === botId)
      return _optionalChain([sock, 'access', _31 => _31.user, 'optionalAccess', _32 => _32.name]) || _optionalChain([sock, 'access', _33 => _33.user, 'optionalAccess', _34 => _34.verifiedName]) || "Bot";
    let v = _optionalChain([sock, 'access', _35 => _35.store, 'optionalAccess', _36 => _36.contacts, 'optionalAccess', _37 => _37[id]]) || {};
    if (v.name) return v.name;
    if (v.notify) return v.notify;
    if (v.pushName) return v.pushName;
    if (v.verifiedName) return v.verifiedName;
    if (v.subject) return v.subject;
    if (groupJid) {
      try {
        const gm = await sock.groupMetadata(groupJid);
        const tn = id.replace(/[^0-9]/g, "");
        const p = _optionalChain([gm, 'access', _38 => _38.participants, 'optionalAccess', _39 => _39.find, 'call', _40 => _40(
          (pt) => (pt.jid || pt.id || "").replace(/[^0-9]/g, "") === tn,
        )]);
        if (p) {
          const pj = p.jid || p.id || "";
          if (_optionalChain([sock, 'access', _41 => _41.store, 'optionalAccess', _42 => _42.contacts, 'optionalAccess', _43 => _43[pj]])) {
            const ct = sock.store.contacts[pj];
            if (ct.name) return ct.name;
            if (ct.notify) return ct.notify;
            if (ct.pushName) return ct.pushName;
          }
        }
      } catch (e8) {}
    }
    try {
      if (sock.getBusinessProfile) {
        const profile = await sock.getBusinessProfile(id).catch(() => null);
        if (_optionalChain([profile, 'optionalAccess', _44 => _44.wid, 'optionalAccess', _45 => _45.user])) {
          const pn = profile.name || profile.pushname || profile.verifiedName;
          if (pn) {
            if (_optionalChain([sock, 'access', _46 => _46.store, 'optionalAccess', _47 => _47.contacts]))
              sock.store.contacts[id] = {
                ...sock.store.contacts[id],
                name: pn,
              };
            return pn;
          }
        }
      }
    } catch (e9) {}
    try {
      if (sock.onWhatsApp) {
        const [result] = await sock.onWhatsApp(id).catch(() => []);
        if (
          _optionalChain([result, 'optionalAccess', _48 => _48.exists]) &&
          _optionalChain([result, 'optionalAccess', _49 => _49.jid]) &&
          _optionalChain([sock, 'access', _50 => _50.store, 'optionalAccess', _51 => _51.contacts, 'optionalAccess', _52 => _52[result.jid]])
        ) {
          const ct = sock.store.contacts[result.jid];
          if (ct.name) return ct.name;
          if (ct.notify) return ct.notify;
        }
      }
    } catch (e10) {}
    const number = id.replace(/@.+/g, "");
    if (number && number.length > 0) {
      if (number.startsWith("62")) return "+62" + number.slice(2);
      return "+" + number;
    }
    return "Unknown";
  };

  sock.getNameFromParticipants = (jid, participants = []) => {
    if (!jid) return "Unknown";
    let resolvedJid = jid;
    if (_ourinlidjs.isLid.call(void 0, jid) || _ourinlidjs.isLidConverted.call(void 0, jid))
      resolvedJid = _ourinlidjs.resolveAnyLidToJid.call(void 0, jid, participants);
    const targetNum = resolvedJid.replace(/[^0-9]/g, "");
    const participant = participants.find(
      (p) => (p.jid || p.id || "").replace(/[^0-9]/g, "") === targetNum,
    );
    if (participant) {
      const pJid = participant.jid || participant.id || "";
      if (_optionalChain([sock, 'access', _53 => _53.store, 'optionalAccess', _54 => _54.contacts, 'optionalAccess', _55 => _55[pJid]])) {
        const c = sock.store.contacts[pJid];
        if (c.name) return c.name;
        if (c.notify) return c.notify;
      }
    }
    const number = resolvedJid.replace(/@.+/g, "");
    if (number.startsWith("62")) return "0" + number.slice(2);
    return number || "Unknown";
  };

  sock.parseMention = (text = "") =>
    [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );

  sock.reply = (jid, text = "", quoted, options = {}) => {
    return Buffer.isBuffer(text)
      ? sock.sendMessage(jid, { document: text, ...options }, { quoted })
      : sock.sendMessage(
          jid,
          { ...options, text, mentions: sock.parseMention(text) },
          { quoted },
        );
  };

  sock.cMod = async (
    jid,
    message,
    text = "",
    sender = _optionalChain([sock, 'access', _56 => _56.user, 'optionalAccess', _57 => _57.id]),
    options = {},
  ) => {
    if (options.mentions && !Array.isArray(options.mentions))
      options.mentions = [options.mentions];
    let copy = message.toJSON
      ? message.toJSON()
      : JSON.parse(JSON.stringify(message));
     _optionalChainDelete([copy, 'access', _58 => _58.message, 'optionalAccess', _59 => delete _59.messageContextInfo]);
     _optionalChainDelete([copy, 'access', _60 => _60.message, 'optionalAccess', _61 => delete _61.senderKeyDistributionMessage]);
    let mtype = Object.keys(copy.message || {})[0];
    let msg = copy.message;
    let content = _optionalChain([msg, 'optionalAccess', _62 => _62[mtype]]);
    if (typeof content === "string") msg[mtype] = text || content;
    else if (_optionalChain([content, 'optionalAccess', _63 => _63.caption])) content.caption = text || content.caption;
    else if (_optionalChain([content, 'optionalAccess', _64 => _64.text])) content.text = text || content.text;
    if (typeof content !== "string" && content) {
      msg[mtype] = { ...content, ...options };
      msg[mtype].contextInfo = {
        ...(content.contextInfo || {}),
        mentionedJid:
          options.mentions || _optionalChain([content, 'access', _65 => _65.contextInfo, 'optionalAccess', _66 => _66.mentionedJid]) || [],
      };
    }
    if (copy.participant)
      sender = copy.participant = sender || copy.participant;
    else if (_optionalChain([copy, 'access', _67 => _67.key, 'optionalAccess', _68 => _68.participant]))
      sender = copy.key.participant = sender || copy.key.participant;
    if (_optionalChain([copy, 'access', _69 => _69.key, 'optionalAccess', _70 => _70.remoteJid, 'optionalAccess', _71 => _71.includes, 'call', _72 => _72("@s.whatsapp.net")]))
      sender = sender || copy.key.remoteJid;
    else if (_optionalChain([copy, 'access', _73 => _73.key, 'optionalAccess', _74 => _74.remoteJid, 'optionalAccess', _75 => _75.includes, 'call', _76 => _76("@broadcast")]))
      sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = _ourin.areJidsSameUser.call(void 0, sender, _optionalChain([sock, 'access', _77 => _77.user, 'optionalAccess', _78 => _78.id])) || false;
    return _ourin.proto.WebMessageInfo.create(copy);
  };

  sock.cMods = (
    jid,
    message,
    text = "",
    sender = _optionalChain([sock, 'access', _79 => _79.user, 'optionalAccess', _80 => _80.id]),
    options = {},
  ) => {
    let copy = message.toJSON
      ? message.toJSON()
      : JSON.parse(JSON.stringify(message));
    let mtype = Object.keys(copy.message || {})[0];
    let msg = copy.message;
    let content = _optionalChain([msg, 'optionalAccess', _81 => _81[mtype]]);
    if (typeof content === "string") msg[mtype] = text || content;
    else if (_optionalChain([content, 'optionalAccess', _82 => _82.caption])) content.caption = text || content.caption;
    else if (_optionalChain([content, 'optionalAccess', _83 => _83.text])) content.text = text || content.text;
    if (typeof content !== "string" && content)
      msg[mtype] = { ...content, ...options };
    if (copy.participant)
      sender = copy.participant = sender || copy.participant;
    else if (_optionalChain([copy, 'access', _84 => _84.key, 'optionalAccess', _85 => _85.participant]))
      sender = copy.key.participant = sender || copy.key.participant;
    if (_optionalChain([copy, 'access', _86 => _86.key, 'optionalAccess', _87 => _87.remoteJid, 'optionalAccess', _88 => _88.includes, 'call', _89 => _89("@s.whatsapp.net")]))
      sender = sender || copy.key.remoteJid;
    else if (_optionalChain([copy, 'access', _90 => _90.key, 'optionalAccess', _91 => _91.remoteJid, 'optionalAccess', _92 => _92.includes, 'call', _93 => _93("@broadcast")]))
      sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = _ourin.areJidsSameUser.call(void 0, sender, _optionalChain([sock, 'access', _94 => _94.user, 'optionalAccess', _95 => _95.id])) || false;
    return _ourin.proto.WebMessageInfo.create(copy);
  };

  sock.copyNForward = async (
    jid,
    message,
    forwardingScore = true,
    options = {},
  ) => {
    let m = _ourin.generateForwardMessageContent.call(void 0, message, !!forwardingScore);
    let mtype = Object.keys(m)[0];
    if (
      forwardingScore &&
      typeof forwardingScore === "number" &&
      forwardingScore > 1
    ) {
      m[mtype].contextInfo = m[mtype].contextInfo || {};
      m[mtype].contextInfo.forwardingScore =
        (m[mtype].contextInfo.forwardingScore || 0) + forwardingScore;
    }
    if (options.quoted) {
      m[mtype].contextInfo = m[mtype].contextInfo || {};
      m[mtype].contextInfo.quotedMessage = options.quoted.message;
      m[mtype].contextInfo.stanzaId = _optionalChain([options, 'access', _96 => _96.quoted, 'access', _97 => _97.key, 'optionalAccess', _98 => _98.id]);
      m[mtype].contextInfo.participant =
        _optionalChain([options, 'access', _99 => _99.quoted, 'access', _100 => _100.key, 'optionalAccess', _101 => _101.participant]) || _optionalChain([options, 'access', _102 => _102.quoted, 'access', _103 => _103.key, 'optionalAccess', _104 => _104.remoteJid]);
      m[mtype].contextInfo.remoteJid = _optionalChain([options, 'access', _105 => _105.quoted, 'access', _106 => _106.key, 'optionalAccess', _107 => _107.remoteJid]);
    }
    m = _ourin.generateWAMessageFromContent.call(void 0, jid, m, {
      ...options,
      userJid: _optionalChain([sock, 'access', _108 => _108.user, 'optionalAccess', _109 => _109.id]),
    });
    await sock.relayMessage(jid, m.message, {
      messageId: m.key.id,
      additionalAttributes: { ...options },
    });
    return m;
  };

  sock.fakeReply = async (
    jid,
    text = "",
    fakeJid = _optionalChain([sock, 'access', _110 => _110.user, 'optionalAccess', _111 => _111.id]),
    fakeText = "",
    fakeGroupJid,
    options = {},
  ) => {
    return sock.reply(jid, text, {
      key: {
        fromMe: _ourin.areJidsSameUser.call(void 0, fakeJid, _optionalChain([sock, 'access', _112 => _112.user, 'optionalAccess', _113 => _113.id])),
        participant: fakeJid,
        ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}),
      },
      message: { conversation: fakeText },
      ...options,
    });
  };

  return sock;
}








exports.extendSocket = extendSocket; exports.downloadBuffer = downloadBuffer; exports.imageToWebp = imageToWebp; exports.videoToWebp = videoToWebp; exports.simpleImageToWebp = simpleImageToWebp; exports.getTempDir = getTempDir;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
