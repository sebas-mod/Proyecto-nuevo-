"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _filetype = require('file-type');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const botConfig = _configjs.config;

const pluginConfig = {
  name: "swgcall",
  alias: ["swgcsemua", "swgcbroadcast", "swgcbc", "groupstoryall"],
  category: "owner",
  description: "Estado del grupo de nichos / Historia del club. grupo a veces ( frontera verde )",
  usage: ".swgcall <teks> atau reply media",
  example: ".swgcall Pengumuman penting!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function sendGroupStatus(sock, jid, content) {
  return await sock.sendMessage(jid, { groupStatusMessage: content });
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const text = m.text || "";

  if (args[0] === "--yes") {
    const pending = _optionalChain([global, 'access', _ => _._swgcallPending, 'optionalAccess', _2 => _2.get, 'call', _3 => _3(m.sender)]);
    if (!pending) {
      return m.reply(
        `⚠No hay datos pendientes. Reconectar medios +. swgcall`,
      );
    }

    const { rawContent, groups, tempFile } = pending;

    await m.react("🔄");

    let content = {};
    if (rawContent.image)
      content = { image: rawContent.image, caption: rawContent.caption || "" };
    else if (rawContent.video)
      content = { video: rawContent.video, caption: rawContent.caption || "" };
    else if (rawContent.audio)
      content = {
        audio: rawContent.audio,
        mimetype: rawContent.mimetype || "audio/mpeg",
        ptt: rawContent.ptt || false,
      };
    else if (rawContent.text) content = { text: rawContent.text };

    let success = 0;
    let failed = 0;
    const failedGroups = [];
    const total = groups.length;
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    for (let i = 0; i < groups.length; i++) {
      const [groupId, meta] = groups[i];
      try {
        await sendGroupStatus(sock, groupId, content);
        success++;
      } catch (e) {
        failed++;
        failedGroups.push(meta.subject || groupId);
      }

      if ((i + 1) % 5 === 0) {
        await delay(2000);
      } else {
        await delay(500);
      }
    }

    global._swgcallPending.delete(m.sender);
    if (tempFile && _fs2.default.existsSync(tempFile)) {
      try {
        _fs2.default.unlinkSync(tempFile);
      } catch (e2) {}
    }

    let report =
      `✅ *ʙʀᴏᴀᴅᴄᴀsᴛ sᴡɢᴄ sᴇʟᴇsᴀɪ*\n\n` +
      `> Total: *${total}* grupos\n` +
      `*Con éxito*${success}* ✅\n` +
      `(Sumperando)${failed}* ❌`;

    if (failedGroups.length > 0) {
      report +=
        `\n\n*Grupo fallido:*\n` + failedGroups.map((g) => `> • ${g}`).join("\n");
    }

    await m.reply(report);
    await m.react("✅");
    return;
  }

  let rawContent = {};
  let buffer, ext, tempFile;
  const tempDir = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });

  const source =
    m.quoted &&
    (m.quoted.isImage ||
      m.quoted.isVideo ||
      m.quoted.isAudio ||
      _optionalChain([m, 'access', _4 => _4.quoted, 'access', _5 => _5.mimetype, 'optionalAccess', _6 => _6.startsWith, 'call', _7 => _7("audio")]))
      ? m.quoted
      : m.isImage || m.isVideo || m.isAudio || _optionalChain([m, 'access', _8 => _8.mimetype, 'optionalAccess', _9 => _9.startsWith, 'call', _10 => _10("audio")])
        ? m
        : null;

  if (source) {
    try {
      buffer = await source.download();
      if (!buffer) return m.reply(`❌Gagalm tomó medios.`);

      const fileType = await _filetype.fileTypeFromBuffer.call(void 0, buffer);
      ext = _optionalChain([fileType, 'optionalAccess', _11 => _11.ext]) || "bin";
      tempFile = _path2.default.join(tempDir, `swgcall_${Date.now()}.${ext}`);
      _fs2.default.writeFileSync(tempFile, buffer);

      const isImage = source.isImage || _optionalChain([fileType, 'optionalAccess', _12 => _12.mime, 'optionalAccess', _13 => _13.startsWith, 'call', _14 => _14("image")]);
      const isVideo = source.isVideo || _optionalChain([fileType, 'optionalAccess', _15 => _15.mime, 'optionalAccess', _16 => _16.startsWith, 'call', _17 => _17("video")]);
      const isAudio =
        source.isAudio ||
        _optionalChain([fileType, 'optionalAccess', _18 => _18.mime, 'optionalAccess', _19 => _19.startsWith, 'call', _20 => _20("audio")]) ||
        _optionalChain([source, 'access', _21 => _21.mimetype, 'optionalAccess', _22 => _22.startsWith, 'call', _23 => _23("audio")]);

      if (isImage) {
        rawContent.image = buffer;
        rawContent.caption = text || "";
      } else if (isVideo) {
        rawContent.video = buffer;
        rawContent.caption = text || "";
      } else if (isAudio) {
        rawContent.audio = buffer;
        rawContent.mimetype = _optionalChain([fileType, 'optionalAccess', _24 => _24.mime]) || source.mimetype || "audio/mpeg";
        rawContent.ptt = _optionalChain([source, 'access', _25 => _25.msg, 'optionalAccess', _26 => _26.ptt]) || false;
      }
    } catch (e3) {
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  } else if (text && text.trim()) {
    rawContent.text = text;
    rawContent.font = 0;
    rawContent.backgroundColor = "#128C7E";
  } else {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}swgcall texto\`- Amor a todos los grupos\n` +
        `# Responder imagen / video / audio +\`${m.prefix}swgcall\`\n` +
        `Para Consorver imágenes / video + leyenda\`${m.prefix}swgcall\`\n\n` +
        `⚠Está característica enviará una tormenta a la montaña!`,
    );
  }

  try {
    global.isFetchingGroups = true;
    const groups = await sock.groupFetchAllParticipating();
    global.isFetchingGroups = false;
    const groupList = Object.entries(groups);

    if (groupList.length === 0) {
      return m.reply(`⚠*Sí, no estoy en un grupo de comida.*`);
    }

    if (!global._swgcallPending) global._swgcallPending = new Map();
    global._swgcallPending.set(m.sender, {
      rawContent,
      groups: groupList,
      tempFile,
      timestamp: Date.now(),
    });

    const mediaType = rawContent.text
      ? "Teks"
      : rawContent.image
        ? "Imagen"
        : rawContent.video
          ? "Video"
          : rawContent.audio
            ? rawContent.ptt
              ? "Voice Note"
              : "Audio"
            : "Unknown";

    let thumbnail = null;
    try {
      thumbnail = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin2");
    } catch (e4) {}

    const estimatedTime = Math.ceil(groupList.length * 1.5);

    await sock.sendMessage(m.chat, {
      text:
        `📢 *ᴋᴏɴꜰɪʀᴍᴀsɪ ʙʀᴏᴀᴅᴄᴀsᴛ sᴡɢᴄ*\n\n` +
        `> Media: *${mediaType}*\n` +
        `* Total Grupo: *${groupList.length}*\n` +
        `> Estimasi: *~${estimatedTime}segundo*\n\n` +
        `⚠* Smallville: " Smallville: " Storybrooke está a punto de ser enviado al grupo "\n` +
        `¿Qué?`,
      contextInfo: {
        ..._ourincontextjs.saluranCtx.call(void 0, ),
        forwardedNewsletterMessageInfo: {
          newsletterJid: _optionalChain([botConfig, 'optionalAccess', _27 => _27.saluran, 'optionalAccess', _28 => _28.id]),
          newsletterName: _optionalChain([botConfig, 'optionalAccess', _29 => _29.saluran, 'optionalAccess', _30 => _30.name]),
        },
      },
      footer: "OURIN MD",
      interactiveButtons: [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: `✅Envia a${groupList.length}Grupo`,
            id: `${m.prefix}swgcall --yes`,
          }),
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "❌ Batal",
            id: `${m.prefix}cancelswgcall`,
          }),
        },
      ],
    });
  } catch (error) {
    await m.reply(
      `❌*ᴇʀʀᴏʀ*\n\n- ¿Qué pasa?\n¿Qué?${error.message}_`,
    );
    if (tempFile && _fs2.default.existsSync(tempFile)) {
      try {
        _fs2.default.unlinkSync(tempFile);
      } catch (e5) {}
    }
    _optionalChain([global, 'access', _31 => _31._swgcallPending, 'optionalAccess', _32 => _32.delete, 'call', _33 => _33(m.sender)]);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
