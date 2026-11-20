"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _filetype = require('file-type');
var _configjs = require('../../config.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
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
  name: "swgcv2all",
  alias: ["statusgrupv2all"],
  category: "owner",
  description: "Estado del grupo de Arnoos V2 a KKA grupo",
  usage: ".swgcv2all <teks> atau reply media",
  example: ".swgcv2all Halo semua grup!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text || "";

  let rawContent = null;

  if (m.isMedia || (m.quoted && m.quoted.isMedia)) {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      return m.reply("❌Gagaldogging los medios.");
    }

    const fileType = await _filetype.fileTypeFromBuffer.call(void 0, buffer);
    const mime = fileType ? fileType.mime : "application/octet-stream";

    if (mime.startsWith("image/")) {
      rawContent = { image: buffer, caption: text };
    } else if (mime.startsWith("video/")) {
      rawContent = { video: buffer, caption: text };
    } else if (mime.startsWith("audio/")) {
      rawContent = {
        audio: buffer,
        mimetype: "audio/mpeg",
        ptt: _optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.ptt]) || m.ptt || false,
      };
    } else {
      return m.reply("❌Los medios de formato no son compatibles para el intercambio GC.");
    }
  } else if (text) {
    rawContent = { text: text };
  } else {
    return m.reply(
      `👋 *sᴡɢᴄᴠ2 ᴀʟʟ ɢʟᴏʙᴀʟ*\n\n` +
      `Para enviar un mensaje al grupo de inmediato.\n\n` +
      `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
      `┃ ${m.prefix}¡Todo el swgcv2all Hola!\n` +
      `┃o respuesta / imágenes de vídeo con capción${m.prefix}swgcv2all\n` +
      `╰┈┈┈┈┈┈┈┈⬡`
    );
  }

  await m.react("🕕");

  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    if (groupIds.length === 0) {
      await m.react("❌");
      return m.reply("❌No en el grupo.");
    }

    await m.reply(`⏳* Estado de la cadena de radio Grupo V2 a${groupIds.length}Grupo...*\n\nEstá levadura Prosses podría tardar un tiempo.`);

    let successCount = 0;
    let failCount = 0;

    for (const targetGroupId of groupIds) {
      try {
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
              canBeSentToParticipants: true
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

        const messageId = genMsg.key.id;
        const finalMessage = buildSyntheticSwGcRawMessage(
          sock,
          targetGroupId,
          mediaMessage,
          messageId
        );

        await sock.relayMessage(targetGroupId, finalMessage.message, {
          messageId: messageId,
        });
        
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    await m.react("✅");
    await m.reply(
      `✅ *sᴡɢᴄᴠ2 ᴀʟʟ sᴇʟᴇsᴀɪ*\n\n` +
      `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
      `┃ 🌐Top Grupo: *${groupIds.length}*\n` +
      `┃ ✅Sukses: *${successCount}*\n` +
      `┃ ❌Fallido: *${failCount}*\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `El Grupo de Estado de la maleta V2 ( Ring Pink ) fue enviado con éxito a todo el grupo!`
    );

  } catch (error) {
    console.error("[SwgcV2All] Error:", error.message);
    await m.react("☢");
    await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
