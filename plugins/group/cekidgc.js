"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourin = require('ourin');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "cekidgc",
  alias: ["idgc", "idgrup", "groupid", "infogc", "groupinfo"],
  category: "group",
  description: "Identificación compleja e información cheque grupo",
  usage: ".cekidgc [link grup]",
  example: ".cekidgc https://chat.whatsapp.com/xxxxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const d = new Date(
    typeof timestamp === "number" && timestamp < 1e12
      ? timestamp * 1000
      : timestamp,
  );
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function handler(m, { sock }) {
  await m.react("⏳");

  try {
    const input = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
    let groupJid = null;
    let groupMeta = null;

    if (input && input.includes("chat.whatsapp.com/")) {
      const inviteCode = _optionalChain([input
, 'access', _4 => _4.split, 'call', _5 => _5("chat.whatsapp.com/"), 'access', _6 => _6[1]
, 'optionalAccess', _7 => _7.split, 'call', _8 => _8(/[\s?]/), 'access', _9 => _9[0]]);

      if (!inviteCode) {
        m.react("✘");
        return m.reply(`──.✦ ──\n\nEl enace grupo no es válido.☘˖`);
      }

      try {
        groupMeta = await sock.groupGetInviteInfo(inviteCode);
        groupJid = _optionalChain([groupMeta, 'optionalAccess', _10 => _10.id]);
      } catch (e) {
        m.react("✘");
        return m.reply(
          `──.✦ ──\n\nEnlace grupo no es válido o si exCerrada.☘˖`,
        );
      }
    } else if (input && input.endsWith("@g.us")) {
      groupJid = input;
      try {
        groupMeta = await sock.groupMetadata(groupJid);
      } catch (e2) {
        m.react("✘");
        return m.reply(
          `──.✦ ──\n\nNo puede acceder al grupo.☘˖`,
        );
      }
    } else if (m.isGroup) {
      groupJid = m.chat;
      groupMeta = await sock.groupMetadata(groupJid);
    } else {
      return m.reply(
        `── .✦ 𝗖𝗘𝗞 𝗜𝗗 𝗚𝗥𝗨𝗣 ✦. ── 𝜗ৎ\n\n` +
          `Uso para grupo o igual el registro\n\n` +
          `> \`${m.prefix}cekidgc\` —dentro del grupo\n` +
          `> \`${m.prefix}cekidgc https://chat.whatsapp.com/xxx\``,
      );
    }

    if (!groupMeta || !groupJid) {
      m.react("✘");
      return m.reply(`──.✦ ──\n\nNo se puede encontrar la inforación grupo.☘˖`);
    }

    const groupName = groupMeta.subject || "Unknown";
    const participants = groupMeta.participants || [];
    const memberCount = participants.length || groupMeta.size || 0;
    const admins = participants.filter(
      (p) => p.admin === "admin" || p.admin === "superadmin",
    );
    const adminCount = admins.length;
    const groupOwner = groupMeta.owner || groupMeta.subjectOwner || "—";
    const createdAt = formatDate(groupMeta.creation);
    const groupDesc = groupMeta.desc || "—";
    const descPreview =
      groupDesc.length > 120 ? groupDesc.slice(0, 120) + "..." : groupDesc;
    const isRestrict = groupMeta.restrict ? "Solo admins" : "Todos los miembros";
    const isAnnounce = groupMeta.announce ? "Aktif" : "Nonaktif";
    const isCommunity = groupMeta.isCommunity ? "✓ Ya" : "✘No";
    const joinMode = groupMeta.joinApprovalMode ? "Perlu Approval" : "Bebas";

    let ppBuffer = null;
    try {
      const ppUrl = await sock.profilePictureUrl(groupJid, "image");
      if (ppUrl) {
        ppBuffer = Buffer.from(
          (
            await _axios2.default.get(ppUrl, {
              responseType: "arraybuffer",
              timeout: 10000,
            })
          ).data,
        );
      }
    } catch (e3) {}

    const saluranId = _optionalChain([_configjs2.default, 'access', _11 => _11.saluran, 'optionalAccess', _12 => _12.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _13 => _13.saluran, 'optionalAccess', _14 => _14.name]) || _optionalChain([_configjs2.default, 'access', _15 => _15.bot, 'optionalAccess', _16 => _16.name]) || "Ourin-AI";

    const infoText =
      `── .✦ 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢 ✦. ── 𝜗ৎ\n\n` +
      `╭─〔 ${groupName} 〕───⬣\n` +
      `│  ✦ ɴᴀᴍᴀ        : *${groupName}*\n` +
      `│  ✦ ɪᴅ             : \`${groupJid}\`\n` +
      `│  ✦ ᴍᴇᴍʙᴇʀ     : *${memberCount}*\n` +
      `│  ✦ ᴀᴅᴍɪɴ        : *${adminCount}*\n` +
      `│  ✦ ᴏᴡɴᴇʀ       : @${groupOwner.replace(/@.+/g, "")}\n` +
      `│  ✦ ᴅɪʙᴜᴀᴛ       : *${createdAt}*\n` +
      `│  ✦ ᴋᴏᴍᴜɴɪᴛᴀs : *${isCommunity}*\n` +
      `│  ✦ ᴇᴅɪᴛ ɪɴꜰᴏ   : *${isRestrict}*\n` +
      `│  ✦ ᴀɴɴᴏᴜɴᴄᴇ : *${isAnnounce}*\n` +
      `│  ✦ ᴊᴏɪɴ ᴍᴏᴅᴇ  : *${joinMode}*\n` +
      `│  ✦ ᴅᴇsᴋʀɪᴘsɪ  : ${descPreview}\n` +
      `╰──────────────⬣\n\n` +
      `.☘︎ ݁˖ © ${_optionalChain([_configjs2.default, 'access', _17 => _17.bot, 'optionalAccess', _18 => _18.name]) || "Ourin-AI"}`;

    const buttons = [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "✦Copiar el Grupo ID",
          copy_code: groupJid,
        }),
      },
    ];

    if (ppBuffer) {
      let headerMedia = null;
      try {
        const resized = await _sharp2.default.call(void 0, ppBuffer)
          .resize(300, 300, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toBuffer();
        headerMedia = await prepareWAMessageMedia(
          { image: resized },
          { upload: sock.waUploadToServer },
        );
      } catch (e4) {}

      const msg = _ourin.generateWAMessageFromContent.call(void 0, 
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: _ourin.proto.Message.InteractiveMessage.fromObject({
                body: _ourin.proto.Message.InteractiveMessage.Body.fromObject({
                  text: infoText,
                }),
                footer: _ourin.proto.Message.InteractiveMessage.Footer.fromObject({
                  text: `© ${_optionalChain([_configjs2.default, 'access', _19 => _19.bot, 'optionalAccess', _20 => _20.name]) || "Ourin-AI"}`,
                }),
                header: _ourin.proto.Message.InteractiveMessage.Header.fromObject({
                  hasMediaAttachment: !!headerMedia,
                  ...(headerMedia || {}),
                }),
                nativeFlowMessage:
                  _ourin.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
                    { buttons },
                  ),
                contextInfo: {
                  mentionedJid: [m.sender, groupOwner],
                  forwardingScore: 9999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
              }),
            },
          },
        },
        { userJid: m.sender, quoted: m },
      );

      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      const msg = _ourin.generateWAMessageFromContent.call(void 0, 
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: _ourin.proto.Message.InteractiveMessage.fromObject({
                body: _ourin.proto.Message.InteractiveMessage.Body.fromObject({
                  text: infoText,
                }),
                footer: _ourin.proto.Message.InteractiveMessage.Footer.fromObject({
                  text: `© ${_optionalChain([_configjs2.default, 'access', _21 => _21.bot, 'optionalAccess', _22 => _22.name]) || "Ourin-AI"}`,
                }),
                nativeFlowMessage:
                  _ourin.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
                    { buttons },
                  ),
                contextInfo: {
                  mentionedJid: [m.sender, groupOwner],
                  forwardingScore: 9999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
              }),
            },
          },
        },
        { userJid: m.sender, quoted: m },
      );

      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    await m.react("✓");
  } catch (error) {
    console.error("[CekIdGc] Error:", error.message);
    await m.react("✘");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
