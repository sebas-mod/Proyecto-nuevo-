"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }





var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _ourinwelcomecardjs = require('../../src/lib/ourin-welcome-card.js');

var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _ourin = require('ourin');
function resolvePlaceholders(
  template,
  username,
  groupName,
  groupDesc,
  memberCount,
  groupOwner,
  prefix,
) {
  const now = _momenttimezone2.default.call(void 0, ).tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Minggu",
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  return template
    .replace(/{user}/gi, `@${username}`)
    .replace(/{number}/gi, username)
    .replace(/{group}/gi, groupName || "Grupo")
    .replace(/{desc}/gi, groupDesc || "")
    .replace(/{count}/gi, _optionalChain([memberCount, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]) || "0")
    .replace(/{owner}/gi, groupOwner || "Administrador")
    .replace(/{date}/gi, now.format("DD/MM/YYYY"))
    .replace(/{time}/gi, now.format("HH:mm"))
    .replace(/{day}/gi, dayId)
    .replace(/{bot}/gi, _optionalChain([_configjs2.default, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || "Ourin")
    .replace(/{prefix}/gi, prefix);
}
const pluginConfig = {
  name: "goodbye",
  alias: ["bye", "leave"],
  category: "group",
  description: "Configarar el mensje de deseakpara grupo",
  usage: ".goodbye <on/off>",
  example: ".goodbye on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
// eslint-disable-next-line require-await
async function buildGoodbyeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const farewells = [
    `Sayonara`,
    `Hasta luego`,
    `Bye bye`,
    `Dadah`,
    `See you`,
    `Ten cuidado.`,
    `Oyasumi~`,
  ];
  const quotes = [
    `Sus pasos siempre son más fáciles de adelantar.`,
    `Gracias a usted, este grupo ya es parte de él.`,
    `Que nos reunamos alguna vez.`,
    `Puerta siempre abre cuando se va de regreso.`,
    `Cuida diri bien-bien si, tomodachi.`,
    `La memoria aquí sigue siendo una comida.`,
  ];
  const emojis = ["🌙", "👋", "🥀", "💫", "😢", "🤍"];
  const headers = [
    `🌙 Oyasumi~ minna-san...
Hoy hay que unir una tomodachi.
El viaje es pura bondad.`,
    `🥀 Minna-san...
Hoy hay un pequeño desglose.
Gracias a Dios por el viaje.`,
    `💫 Sayonara~
No el final, sólo hasta el final.
Que el día esté caliente.`,
    `🌌 Minna-san...
Una estrella que se mueve sonoramente está noche.
Los mejores deseos para ella.`,
  ];
  const farewell = farewells[Math.floor(Math.random() * farewells.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = _optionalChain([participant, 'optionalAccess', _5 => _5.split, 'call', _6 => _6("@"), 'access', _7 => _7[0]]) || "User";
  const now = _momenttimezone2.default.call(void 0, ).tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Minggu",
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  if (customMsg) {
    return resolvePlaceholders(
      customMsg,
      username,
      groupName,
      groupDesc,
      memberCount,
      groupOwner,
      prefix,
    );
  }
  let msg = `👋🏻 *SAYONARA MEMBER* 👋🏻\n\n`;
  msg += `${header}\n`;
  msg += `${emoji} ${farewell}, *@${username}* 🤍\n\n`;
  msg += `📌> 91; GRUPO INFO &#93;\n`;
  msg += `♪🏠*Nombre*:${groupName}\n`;
  msg += `♪👥* SUSA SUSA *${memberCount}\n`;
  msg += `♪📅 *Fecha*: ${now.format("DD/MM/YYYY")}\n\n`;
  msg += `💌*Mensaje*\n♪「 ${quote} 」\n\n🌸Te veré más tarde, tomodachi.🤍`;

  return msg;

  return msg;
}
async function sendGoodbyeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const groupData = db.getGroup(groupJid);
    if (_optionalChain([groupData, 'optionalAccess', _8 => _8.goodbye]) !== true && _optionalChain([groupData, 'optionalAccess', _9 => _9.leave]) !== true) return false;
    const goodbyeType = db.setting("goodbyeType") || 1;
    if (_optionalChain([groupMeta, 'optionalAccess', _10 => _10.participants])) {
      _ourinlidjs.cacheParticipantLids.call(void 0, groupMeta.participants);
    }
    let realParticipant = participant;
    const cachedJid = _ourinlidjs.getCachedJid.call(void 0, participant);
    if (cachedJid && !_ourinlidjs.isLidConverted.call(void 0, cachedJid)) {
      realParticipant = cachedJid;
    } else if (_ourinlidjs.isLid.call(void 0, participant)) {
      const lidFormat = participant;
      const cachedFromLid = _ourinlidjs.getCachedJid.call(void 0, lidFormat);
      if (cachedFromLid && !_ourinlidjs.isLidConverted.call(void 0, cachedFromLid)) {
        realParticipant = cachedFromLid;
      } else {
        realParticipant = _ourinlidjs.lidToJid.call(void 0, participant);
      }
    } else if (_ourinlidjs.isLidConverted.call(void 0, participant)) {
      const lidNumber = participant.replace("@s.whatsapp.net", "");
      const lidFormat = lidNumber + "@lid";
      const cachedFromLid = _ourinlidjs.getCachedJid.call(void 0, lidFormat);
      if (cachedFromLid && !_ourinlidjs.isLidConverted.call(void 0, cachedFromLid)) {
        realParticipant = cachedFromLid;
      }
    }
    const memberCount = _optionalChain([groupMeta, 'optionalAccess', _11 => _11.participants, 'optionalAccess', _12 => _12.length]) || 0;
    const groupName = _optionalChain([groupMeta, 'optionalAccess', _13 => _13.subject]) || "Grupo";
    let userName = _optionalChain([realParticipant, 'optionalAccess', _14 => _14.split, 'call', _15 => _15("@"), 'access', _16 => _16[0]]) || "User";
    let ppUrl =
      "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = (await sock.profilePictureUrl(realParticipant, "image")) || ppUrl;
    } catch (e2) { }
    const text = await buildGoodbyeMessage(
      realParticipant,
      _optionalChain([groupMeta, 'optionalAccess', _17 => _17.subject]),
      _optionalChain([groupMeta, 'optionalAccess', _18 => _18.descOwner]),
      memberCount,
      _optionalChain([groupData, 'optionalAccess', _19 => _19.goodbyeMsg]),
      _optionalChain([groupMeta, 'optionalAccess', _20 => _20.owner, 'optionalAccess', _21 => _21.split, 'call', _22 => _22("@"), 'access', _23 => _23[0]]) || "",
      _optionalChain([_configjs2.default, 'access', _24 => _24.command, 'optionalAccess', _25 => _25.prefix]) || ".",
    );
    const saluranId = _optionalChain([_configjs2.default, 'access', _26 => _26.saluran, 'optionalAccess', _27 => _27.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _28 => _28.saluran, 'optionalAccess', _29 => _29.name]) || _optionalChain([_configjs2.default, 'access', _30 => _30.bot, 'optionalAccess', _31 => _31.name]) || "Ourin-AI";
    if (goodbyeType === 2) {
      const cardBody = _optionalChain([groupData, 'optionalAccess', _32 => _32.goodbyeMsg])
        ? resolvePlaceholders(
          groupData.goodbyeMsg,
          userName,
          _optionalChain([groupMeta, 'optionalAccess', _33 => _33.subject]),
          _optionalChain([groupMeta, 'optionalAccess', _34 => _34.desc]),
          memberCount,
          _optionalChain([groupMeta, 'optionalAccess', _35 => _35.owner, 'optionalAccess', _36 => _36.split, 'call', _37 => _37("@"), 'access', _38 => _38[0]]) || "",
          _optionalChain([_configjs2.default, 'access', _39 => _39.command, 'optionalAccess', _40 => _40.prefix]) || ".",
        )
        : `Gracias por unirse a.${groupName}*\nSisa ${memberCount} member`;
      await sock.sendMessage(groupJid, {
        interactiveMessage: {
          body: {
            text: `👋 *Sayonara* *@${userName}*`,
          },
          footer: { text: _optionalChain([_configjs2.default, 'access', _41 => _41.bot, 'optionalAccess', _42 => _42.name]) || "Ourin-AI" },
          header: { title: "Goodbye", hasMediaAttachment: false },
          carouselMessage: {
            cards: [
              {
                header: {
                  imageMessage: { url: ppUrl },
                },
                body: {
                  text: cardBody,
                },
                footer: { text: _optionalChain([_configjs2.default, 'access', _43 => _43.bot, 'optionalAccess', _44 => _44.name]) || "Ourin-AI" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "👋Adios",
                        id: "bye",
                      }),
                    },
                  ],
                },
              },
            ],
            messageVersion: 1,
            carouselCardType: 1,
          },
          contextInfo: {
            ..._ourincontextjs.saluranCtx.call(void 0, ),
            mentionedJid: [realParticipant],
          },
        },
      });
    } else if (goodbyeType === 3) {
      const textOnly = _optionalChain([groupData, 'optionalAccess', _45 => _45.goodbyeMsg])
        ? resolvePlaceholders(
          groupData.goodbyeMsg,
          userName,
          _optionalChain([groupMeta, 'optionalAccess', _46 => _46.subject]),
          _optionalChain([groupMeta, 'optionalAccess', _47 => _47.desc]),
          memberCount,
          _optionalChain([groupMeta, 'optionalAccess', _48 => _48.owner, 'optionalAccess', _49 => _49.split, 'call', _50 => _50("@"), 'access', _51 => _51[0]]) || "",
          _optionalChain([_configjs2.default, 'access', _52 => _52.command, 'optionalAccess', _53 => _53.prefix]) || ".",
        )
        : `*Sayonara* @${userName} 👋`;
      await sock.sendMessage(groupJid, {
        text: textOnly,
        contextInfo: {
          ..._ourincontextjs.saluranCtx.call(void 0, ),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterName: _optionalChain([_configjs2.default, 'optionalAccess', _54 => _54.saluran, 'optionalAccess', _55 => _55.name]),
            newsletterJid: _optionalChain([_configjs2.default, 'optionalAccess', _56 => _56.saluran, 'optionalAccess', _57 => _57.id]),
          },
        },
      });
    } else if (goodbyeType === 4) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          ..._ourincontextjs.saluranCtx.call(void 0, ),
          mentionedJid: [realParticipant],
        },
      });
    } else if (goodbyeType === 5) {
      await sock.sendPreview(
        groupJid,
        {
          caption: "https://goodbye.guys " + text,
          url: "https://goodbye.guys",
          title: `Goodbye from ${groupName}`,
          description: `👋 Sayonara @${userName}!`,
          image: ppUrl,
          previewType: 1,
        },
        {
          contextInfo: {
            mentionedJid: [realParticipant],
          }
        }
      );
    } else if (goodbyeType === 6) {
      await sock.sendMessage(groupJid, {
        video: _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-mp4") || { url: "https://files.catbox.moe/k28dhp.mp4" },
        gifPlayback: true,
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
        }
      });
    } else if (goodbyeType === 7) {
      const qFake = {
        key: {
          fromMe: false,
          participant: realParticipant,
          remoteJid: realParticipant
        },
        message: {
          conversation: `¡Adiós a todos!👋`
        }
      };

      const media = await _ourin.prepareWAMessageMedia.call(void 0, {
        image: { url: ppUrl }
      }, { upload: sock.waUploadToServer });

      const msg = _ourin.generateWAMessageFromContent.call(void 0, groupJid, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage: {
              header: {
                title: "",
                subtitle: "",
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
              },
              body: {
                text: text
              },
              footer: {
                text: _optionalChain([_configjs2.default, 'access', _58 => _58.bot, 'optionalAccess', _59 => _59.name]) || "Ourin-AI"
              },
              contextInfo: {
                mentionedJid: [realParticipant],
                isForwarded: true,
                forwardingScore: 9,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: saluranId,
                  newsletterName: saluranName,
                  serverMessageId: 127,
                },
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "👋Adios",
                      id: "bye"
                    })
                  }
                ]
              }
            }
          }
        }
      }, { quoted: qFake, userJid: sock.user.jid });

      await sock.relayMessage(groupJid, msg.message, {
        messageId: msg.key.id,
      });
    } else if (goodbyeType === 8) {
      await sock.sendMessage(groupJid, {
        text: `Goodbye @${userName}, del grupo${groupName}`,
        mentions: [realParticipant],
      });
    } else {
      let canvasBuffer = null;
      try {
        canvasBuffer = await _ourinwelcomecardjs.createGoodbyeCard.call(void 0, 
          userName,
          ppUrl,
          groupName,
          memberCount.toLocaleString(),
        );
      } catch (e) {
        console.error("Goodbye Canvas Error:", e.message);
      }
      await sock.sendMessage(groupJid, {
        image: canvasBuffer,
        caption: text,
        mentions: [realParticipant],
        contextInfo: {
          ..._ourincontextjs.saluranCtx.call(void 0, ),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      });
    }
    return true;
  } catch (error) {
    console.error("Goodbye Error:", error);
    return false;
  }
}
async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const sub = _optionalChain([args, 'access', _60 => _60[0], 'optionalAccess', _61 => _61.toLowerCase, 'call', _62 => _62()]);
  const sub2 = _optionalChain([args, 'access', _63 => _63[1], 'optionalAccess', _64 => _64.toLowerCase, 'call', _65 => _65()]);
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.goodbye === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌¡Sólo el propietario puede usar está característica!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: true, leave: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
        `*Adiós activado en*${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌¡Sólo el propietario puede usar está característica!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: false, leave: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
        `*Adiós está desactivado*${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ɢᴏᴏᴅʙʏᴇ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
        `> Status: *✅ ON*\n` +
        `- Se ha activado el adiós en este grupo.\n\n` +
        `*Usarlo*\`${m.prefix}Adiós.\`para desactivando._`,
      );
    }
    db.setGroup(m.chat, { goodbye: true, leave: true });
    return m.reply(
      `✅ *ɢᴏᴏᴅʙʏᴇ ᴀᴋᴛɪꜰ*\n\n` +
      `*¡El mensaje de adiós se activa con éxito!*\n` +
      `La salida se dará un mensaje.\n\n` +
      `*Usarlo*\`${m.prefix}Adiós.\`para mensajes personalizados. _`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ɢᴏᴏᴅʙʏᴇ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
        `> Status: *❌ OFF*\n` +
        `- Adiós ha estado fuera de la red.\n\n` +
        `*Usarlo*\`${m.prefix}Adiós\`para activando._`,
      );
    }
    db.setGroup(m.chat, { goodbye: false, leave: false });
    return m.reply(
      `❌ *ɢᴏᴏᴅʙʏᴇ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
      `* Mensaje de adiós activado con éxito.*\n` +
      `La salida no se dará.`,
    );
  }
  m.reply(
    `👋 *ɢᴏᴏᴅʙʏᴇ sᴇᴛᴛɪɴɢs*\n\n` +
    `> Status: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
    `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
    `> \`${m.prefix}goodbye on\` → Aktifkan\n` +
    `> \`${m.prefix}goodbye off\` → Nonaktifkan\n` +
    `> \`${m.prefix}adiós a Alll\` →Global ON (propietario)\n` +
    `> \`${m.prefix}adiós\` →Global OFF (propietario)\n` +
    `> \`${m.prefix}setgoodbye\` → Custom pesan\n` +
    `> \`${m.prefix}resetgoodbye\` →Restablecer predeterminado`,
  );
}
exports.config = pluginConfig; exports.handler = handler; exports.sendGoodbyeMessage = sendGoodbyeMessage;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
