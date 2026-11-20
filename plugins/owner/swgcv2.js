"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _filetype = require('file-type');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ouringroupprotectionjs = require('../../src/lib/ourin-group-protection.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _ourin = require('ourin');

const botConfig = _configjs.config;

function buildSyntheticSwGcRawMessage(sock, remoteJid, innerMessage, messageId) {
  const botJid = _optionalChain([sock, 'access', _ => _.user, 'optionalAccess', _2 => _2.id, 'optionalAccess', _3 => _3.split, 'call', _4 => _4(":"), 'access', _5 => _5[0]]) + "@s.whatsapp.net";
  return {
    key: {
      remoteJid,
      fromMe: true,
      id: messageId,
      participant: botJid,
    },
    message: {
      groupStatusMessageV2: {
        message: innerMessage,
      },
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
  };
}

const pluginConfig = {
  name: "swgcv2",
  alias: ["statusgrupv2"],
  category: "owner",
  description: "Estado del grupo de correos V2 a opciones del grupo",
  usage: ".swgcv2 <teks> atau reply media",
  example: ".swgcv2 Halo semua!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const pendingSwgcV2 = new Map();

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const text = m.text || "";

  if (args[0] === "--confirm" && args[1]) {
    const targetGroupId = args[1];
    const pendingData = pendingSwgcV2.get(m.sender);

    if (!pendingData) {
      await m.reply(
        `⚠*No hay datos pendientes. Por favor, reenviar los medios +. swgcv2*`,
      );
      return;
    }

    try {
      let groupName = "Grupo";
      try {
        const meta = await sock.groupMetadata(targetGroupId);
        groupName = meta.subject;
      } catch (e) { }

      await m.react("🕕");

      const rawContent = pendingData.rawContent;

      let baseContent = {};
      if (rawContent.image) {
        baseContent = { image: rawContent.image, caption: rawContent.caption || "" };
      } else if (rawContent.video) {
        baseContent = { video: rawContent.video, caption: rawContent.caption || "" };
      } else if (rawContent.audio) {
        baseContent = { audio: rawContent.audio, mimetype: rawContent.mimetype || "audio/mpeg", ptt: rawContent.ptt || false };
      } else if (rawContent.text) {
        baseContent = { text: rawContent.text };
      }

      const genMsg = await _ourin.generateWAMessage.call(void 0, targetGroupId, baseContent, {
        userJid: sock.user.id,
        upload: sock.waUploadToServer
      });

      const msgType = Object.keys(genMsg.message).find(k => k.endsWith('Message') && k !== 'senderKeyDistributionMessage');

      let mediaMessage = {};
      if (msgType) {
        mediaMessage[msgType] = genMsg.message[msgType];
        const newContextInfo = {
          isGroupStatus: true,
          statusSourceType: rawContent.text ? 4 : rawContent.audio ? 3 : rawContent.video ? 1 : 0,
          featureEligibilities: {
            canBeReshared: true,
            canReceiveMultiReact: false
          },
          statusAttributions: [
            {
              type: 10
            }
          ],
          statusAudienceMetadata: {
            audienceType: 1
          }
        };

        if (mediaMessage[msgType].contextInfo) {
          Object.assign(mediaMessage[msgType].contextInfo, newContextInfo);
        } else {
          mediaMessage[msgType].contextInfo = newContextInfo;
        }
      }

      const payload = {
        groupStatusMessageV2: {
          message: mediaMessage
        }
      };

      const messageId = genMsg.key.id;

      await sock.relayMessage(targetGroupId, payload, { messageId });

      const syntheticRawMsg = buildSyntheticSwGcRawMessage(sock, targetGroupId, mediaMessage, messageId);
      await _ouringroupprotectionjs.handleAntiSwGc.call(void 0, syntheticRawMsg, sock, db);

      const mediaType = pendingData.rawContent.text
        ? "Teks"
        : pendingData.rawContent.image
          ? "Imagen"
          : pendingData.rawContent.video
            ? "Video"
            : pendingData.rawContent.audio
              ? "Audio"
              : "Media";

      const successMsg = `✅Resultado del meg2 ( V2 ) al grupo${groupName}`;

      await m.reply(successMsg);
      pendingSwgcV2.delete(m.sender);

      if (pendingData.tempFile && _fs2.default.existsSync(pendingData.tempFile)) {
        setTimeout(() => {
          try {
            _fs2.default.unlinkSync(pendingData.tempFile);
          } catch (e) { }
        }, 5000);
      }
    } catch (error) {
      await m.reply(
        `❌ *ᴇʀʀᴏʀ*\n\n` + `*Wah @-@ ho @-@ pom @-@ pom @-@ pom @-@ pom @-@ pom @-@ pom @-@ pom @-@@ pom @-@ pom @-@@ pom @-@ pom @-@ pom @-@ pom @-@\n` + `> _${error.message}_`,
      );
    }
    return;
  }

  let rawContent = {};
  let buffer, ext, tempFile;
  const tempDir = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });

  if (
    m.quoted &&
    (m.quoted.isImage ||
      m.quoted.isVideo ||
      m.quoted.isAudio ||
      _optionalChain([m, 'access', _6 => _6.quoted, 'access', _7 => _7.mimetype, 'optionalAccess', _8 => _8.startsWith, 'call', _9 => _9("audio")]))
  ) {
    try {
      buffer = await m.quoted.download();
      if (!buffer) {
        await m.reply(`❌Gagalm tomó medios.`);
        return;
      }
      const fileType = await _filetype.fileTypeFromBuffer.call(void 0, buffer);
      ext = _optionalChain([fileType, 'optionalAccess', _10 => _10.ext]) || "bin";
      tempFile = _path2.default.join(tempDir, `swgcv2_${Date.now()}.${ext}`);
      _fs2.default.writeFileSync(tempFile, buffer);

      if (m.quoted.isImage) {
        rawContent.image = buffer;
        rawContent.caption = text || "";
      } else if (m.quoted.isVideo) {
        rawContent.video = buffer;
        rawContent.caption = text || "";
      } else if (m.quoted.isAudio || _optionalChain([m, 'access', _11 => _11.quoted, 'access', _12 => _12.mimetype, 'optionalAccess', _13 => _13.startsWith, 'call', _14 => _14("audio")])) {
        rawContent.audio = buffer;
        rawContent.mimetype =
          _optionalChain([fileType, 'optionalAccess', _15 => _15.mime]) || m.quoted.mimetype || "audio/mpeg";
        rawContent.ptt = _optionalChain([m, 'access', _16 => _16.quoted, 'access', _17 => _17.msg, 'optionalAccess', _18 => _18.ptt]) || false;
      }
    } catch (e) {
      await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
      return;
    }
  } else if (
    m.isImage ||
    m.isVideo ||
    m.isAudio ||
    _optionalChain([m, 'access', _19 => _19.mimetype, 'optionalAccess', _20 => _20.startsWith, 'call', _21 => _21("audio")])
  ) {
    try {
      buffer = await m.download();
      if (!buffer) {
        await m.reply(`❌Gagalm tomó medios.`);
        return;
      }
      const fileType = await _filetype.fileTypeFromBuffer.call(void 0, buffer);
      ext = _optionalChain([fileType, 'optionalAccess', _22 => _22.ext]) || "bin";
      tempFile = _path2.default.join(tempDir, `swgcv2_${Date.now()}.${ext}`);
      _fs2.default.writeFileSync(tempFile, buffer);

      if (m.isImage) {
        rawContent.image = buffer;
        rawContent.caption = text || "";
      } else if (m.isVideo) {
        rawContent.video = buffer;
        rawContent.caption = text || "";
      } else if (m.isAudio || _optionalChain([m, 'access', _23 => _23.mimetype, 'optionalAccess', _24 => _24.startsWith, 'call', _25 => _25("audio")])) {
        rawContent.audio = buffer;
        rawContent.mimetype = _optionalChain([fileType, 'optionalAccess', _26 => _26.mime]) || m.mimetype || "audio/mpeg";
        rawContent.ptt = _optionalChain([m, 'access', _27 => _27.msg, 'optionalAccess', _28 => _28.ptt]) || false;
      }
    } catch (e) {
      await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
      return;
    }
  } else if (text && text.trim()) {
    rawContent.text = text;
    rawContent.font = 0;
    rawContent.backgroundColor = "#128C7E";
  } else {
    await m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
      `> \`${m.prefix}swgcv2 teks\` - Story teks\n` +
      `# Responder imagen / video / audio +\`${m.prefix}swgcv2\`\n` +
      `Para Consorver imágenes / video + leyenda\`${m.prefix}swgcv2\``,
    );
    return;
  }

  pendingSwgcV2.set(m.sender, {
    rawContent: rawContent,
    tempFile: tempFile,
    timestamp: Date.now(),
  });

  try {
    global.isFetchingGroups = true;
    const groups = await sock.groupFetchAllParticipating();
    global.isFetchingGroups = false;
    const groupList = Object.entries(groups);

    if (groupList.length === 0) {
      await m.reply(`⚠*Sí, no estoy en un grupo de comida.*`);
      return;
    }

    const groupRows = groupList.map(([id, meta]) => ({
      title: meta.subject || "Unknown Group",
      description: id,
      id: `${m.prefix}swgcv2 --confirm ${id}`,
    }));

    const prefix = m.prefix || ".";
    const mediaType = rawContent.text
      ? "Teks"
      : rawContent.image
        ? "Imagen"
        : rawContent.video
          ? "Video"
          : rawContent.audio
            ? "Audio"
            : "Media";

    let thumbnail = null;
    try {
      thumbnail = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin2");
    } catch (e) { }

    await sock.sendMessage(m.chat, {
      text:
        `📋 *ᴘɪʟɪʜ ɢʀᴜᴘ ᴜɴᴛᴜᴋ ᴘᴏsᴛ sᴛᴏʀʏ ᴠ2*\n\n` +
        `> Media: *${mediaType}*\n` +
        `* Total Grupo: *${groupList.length}*\n\n` +
        `Seleccionar grupo de la lista en el sótano: _`,
      contextInfo: {
        ..._ourincontextjs.saluranCtx.call(void 0, ),
        forwardedNewsletterMessageInfo: {
          newsletterJid: _optionalChain([botConfig, 'optionalAccess', _29 => _29.saluran, 'optionalAccess', _30 => _30.id]),
          newsletterName: _optionalChain([botConfig, 'optionalAccess', _31 => _31.saluran, 'optionalAccess', _32 => _32.name]),
        },
      },
      footer: "OURIN MD",
      interactiveButtons: [
        {
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "🏠Elige Grupo",
            sections: [
              {
                title: "Registrate Grupo",
                rows: groupRows,
              },
            ],
          }),
        },
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "❌ Batal",
            id: `${prefix}cancelswgcv2`,
          }),
        },
      ],
    });
  } catch (error) {
    await m.reply(
      `❌ *ᴇʀʀᴏʀ*\n\n` +
      `- ¿Qué pasa?\n` +
      `> _${error.message}_`,
    );
    if (tempFile && _fs2.default.existsSync(tempFile)) {
      try {
        _fs2.default.unlinkSync(tempFile);
      } catch (e) { }
    }
    pendingSwgcV2.delete(m.sender);
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.pendingSwgcV2 = pendingSwgcV2;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
