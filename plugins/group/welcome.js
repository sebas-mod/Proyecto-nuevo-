"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinwelcomecardjs = require('../../src/lib/ourin-welcome-card.js');
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
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
  name: "welcome",
  alias: ["wc"],
  category: "group",
  description: "Gessionar el mensaje de bienvenida para grupo",
  usage: ".welcome <on/off>",
  example: ".welcome on",
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
async function buildWelcomeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const greetings = [
    `El fin también está llegando.`,
    `Bienvenido`,
    `Welcome`,
    `Hola`,
    `Hola`,
    `Yokoso~`,
    `Ohayou~`,
  ];
  const quotes = [
    `¡No seas un lector silencioso!`,
    `¡Relájate, toma tu propia casa!`,
    `Yuk langsung gas ngobrol!`,
    `- ¡Prepárate para revivir el barco!`,
    `¡No seas tímido, todos somos amigos!`,
    `Estás confundido, hazlo primero.😄`,
  ];
  const emojis = ["🎐", "🌸", "✨", "💫", "🪸", "🔥", "💖"];
  const headers = [
    `🎐 Ohayou~ minna-san!
Hoy tenemos un nuevo tomodachi que viene.🌱
Yuk sambut bareng-bareng~`,
    `🌸 Ohayou minna-san!
Un nuevo amigo finalmente se une✨
Ojalá @ - @ risa y tangsung nmbang si ~`,
    `✨ Ohayou~!
Tomodachi acaba de entrar con una nueva vibración.💫
Yoroshiku ne~ mari seru-seruan bareng!`,
    `🪸 Ohayou minna-san!
Grupo 's tiene una familia más🤍
Tanoshii jikan o issho ni sugoso ne~`,
  ];
  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
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
  let msg = `👋🏻* Bienvenido a enviarnos nuevos *👋🏻\n\n`;
  msg += `${header}\n`;
  msg += `${emoji} ${greeting}, *@${username}* 💫\n\n`;
  msg += `📌* GRUPO INFO ]\n`;
  msg += `♪🏠*Nombre*:${groupName}\n`;
  msg += `> 👥 *Member* : ${memberCount}\n`;
  msg += `♪📅 *Fecha*: ${_momenttimezone2.default.call(void 0, ).tz("Asia/Jakarta").format("DD/MM/YYYY")}\n`;

  if (groupDesc) {
    msg += `\n📝*Descripción*\n♪❝ ${groupDesc.slice(0, 120)}${groupDesc.length > 120 ? "..." : ""} ❞\n`;
  }

  msg += `\n✨Consejo de hoy\n♪「 ${quote} 」\n\n🌸Mi Yoroshiku ne ~ ojalá tau si!🤍`;

  return msg;
}
async function sendWelcomeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const groupData = db.getGroup(groupJid);
    if (_optionalChain([groupData, 'optionalAccess', _8 => _8.welcome]) !== true) return false;
    const welcomeType = db.setting("welcomeType") || 1;
    const realParticipant = _ourinlidjs.resolveAnyLidToJid.call(void 0, 
      participant,
      _optionalChain([groupMeta, 'optionalAccess', _9 => _9.participants]) || [],
    );
    const memberCount = _optionalChain([groupMeta, 'optionalAccess', _10 => _10.participants, 'optionalAccess', _11 => _11.length]) || 0;
    const groupName = _optionalChain([groupMeta, 'optionalAccess', _12 => _12.subject]) || "Grupo";
    let userName = _optionalChain([realParticipant, 'optionalAccess', _13 => _13.split, 'call', _14 => _14("@"), 'access', _15 => _15[0]]) || "User";
    let ppUrl =
      "https://cdn.gimita.id/download/pp%20kosong%20wa%20default%20(1)_1769506608569_52b57f5b.jpg";
    try {
      ppUrl = await sock.profilePictureUrl(realParticipant, "image");
    } catch (e) { }
    const text = await buildWelcomeMessage(
      realParticipant,
      _optionalChain([groupMeta, 'optionalAccess', _16 => _16.subject]),
      _optionalChain([groupMeta, 'optionalAccess', _17 => _17.descOwner]),
      memberCount,
      _optionalChain([groupData, 'optionalAccess', _18 => _18.welcomeMsg]),
      _optionalChain([groupMeta, 'optionalAccess', _19 => _19.owner, 'optionalAccess', _20 => _20.split, 'call', _21 => _21("@"), 'access', _22 => _22[0]]) || "",
      _optionalChain([_configjs2.default, 'access', _23 => _23.command, 'optionalAccess', _24 => _24.prefix]) || ".",
    );
    const saluranId = _optionalChain([_configjs2.default, 'access', _25 => _25.saluran, 'optionalAccess', _26 => _26.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _27 => _27.saluran, 'optionalAccess', _28 => _28.name]) || _optionalChain([_configjs2.default, 'access', _29 => _29.bot, 'optionalAccess', _30 => _30.name]) || "Ourin-AI";
    if (welcomeType === 2) {
      const cardBody = _optionalChain([groupData, 'optionalAccess', _31 => _31.welcomeMsg])
        ? resolvePlaceholders(
          groupData.welcomeMsg,
          userName,
          _optionalChain([groupMeta, 'optionalAccess', _32 => _32.subject]),
          _optionalChain([groupMeta, 'optionalAccess', _33 => _33.desc]),
          memberCount,
          _optionalChain([groupMeta, 'optionalAccess', _34 => _34.owner, 'optionalAccess', _35 => _35.split, 'call', _36 => _36("@"), 'access', _37 => _37[0]]) || "",
          _optionalChain([_configjs2.default, 'access', _38 => _38.command, 'optionalAccess', _39 => _39.prefix]) || ".",
        )
        : `Bienvenido al grupo *${groupName}* 🎉\nMember ke-${memberCount}`;
      await sock.sendMessage(groupJid, {
        interactiveMessage: {
          body: {
            text: `👋 Welcome *@${userName}*`,
          },
          footer: { text: _optionalChain([_configjs2.default, 'access', _40 => _40.bot, 'optionalAccess', _41 => _41.name]) || "Ourin-AI" },
          header: { title: "Welcome", hasMediaAttachment: false },
          carouselMessage: {
            cards: [
              {
                header: {
                  imageMessage: { url: ppUrl },
                },
                body: {
                  text: cardBody,
                },
                footer: { text: _optionalChain([_configjs2.default, 'access', _42 => _42.bot, 'optionalAccess', _43 => _43.name]) || "Ourin-AI" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "👋 Halo @" + userName,
                        id: "hi",
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
    } else if (welcomeType === 3) {
      const textOnly = _optionalChain([groupData, 'optionalAccess', _44 => _44.welcomeMsg])
        ? resolvePlaceholders(
          groupData.welcomeMsg,
          userName,
          _optionalChain([groupMeta, 'optionalAccess', _45 => _45.subject]),
          _optionalChain([groupMeta, 'optionalAccess', _46 => _46.desc]),
          memberCount,
          _optionalChain([groupMeta, 'optionalAccess', _47 => _47.owner, 'optionalAccess', _48 => _48.split, 'call', _49 => _49("@"), 'access', _50 => _50[0]]) || "",
          _optionalChain([_configjs2.default, 'access', _51 => _51.command, 'optionalAccess', _52 => _52.prefix]) || ".",
        )
        : `*Hola* @${userName} 👋\nBienvenido al grupo *${groupName}* 🌸`;
      await sock.sendMessage(groupJid, {
        text: textOnly,
        contextInfo: {
          ..._ourincontextjs.saluranCtx.call(void 0, ),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterName: _optionalChain([_configjs2.default, 'optionalAccess', _53 => _53.saluran, 'optionalAccess', _54 => _54.name]),
            newsletterJid: _optionalChain([_configjs2.default, 'optionalAccess', _55 => _55.saluran, 'optionalAccess', _56 => _56.id]),
          },
        },
      });
    } else if (welcomeType === 4) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          ..._ourincontextjs.saluranCtx.call(void 0, ),
          mentionedJid: [realParticipant],
        },
      });
    } else if (welcomeType === 5) {
      await sock.sendPreview(
        groupJid,
        {
          caption: "https://welcome.guys " + text,
          url: "https://welcome.guys",
          title: `Welcome to ${groupName}`,
          description: `👋Hola${userName}!`,
          image: ppUrl,
          previewType: 0,
        },
        {
          contextInfo: {
            mentionedJid: [realParticipant],
          }
        }
      );
    } else if (welcomeType === 6) {
      await sock.sendMessage(groupJid, {
        video: _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-mp4") || { url: "https://files.catbox.moe/k28dhp.mp4" },
        gifPlayback: true,
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
        }
      });
    } else if (welcomeType === 7) {
      const qFake = {
        key: {
          fromMe: false,
          participant: realParticipant,
          remoteJid: realParticipant
        },
        message: {
          conversation: `¡Hola a todos!👋`
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
                text: _optionalChain([_configjs2.default, 'access', _57 => _57.bot, 'optionalAccess', _58 => _58.name]) || "Ourin-AI"
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
                      display_text: "👋 Halo",
                      id: "hi"
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
    } else if (welcomeType === 8) {
      await sock.sendMessage(groupJid, {
        text: `Hola @${userName}, bienvenidos al grupo${groupName}`,
        mentions: [realParticipant],
      });
    } else {
      await sock.sendMessage(groupJid, {
        text: text,
        mentions: [realParticipant],
      });
    }
    return true;
  } catch (error) {
    console.error("Welcome Error:", error);
    return false;
  }
}
async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const sub = _optionalChain([args, 'access', _59 => _59[0], 'optionalAccess', _60 => _60.toLowerCase, 'call', _61 => _61()]);
  const sub2 = _optionalChain([args, 'access', _62 => _62[1], 'optionalAccess', _63 => _63.toLowerCase, 'call', _64 => _64()]);
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.welcome === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(_configjs2.default.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
        `Bienvenido activado en${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(_configjs2.default.messages.ownerOnly);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { welcome: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
        `# Welcomme desactivated in #${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ᴡᴇʟᴄᴏᴍᴇ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
        `> Status: *✅ ON*\n` +
        `Ez Welcomme está activo en este grupo.\n\n` +
        `*Usarlo*\`${m.prefix}Bienvenido.\`para desactivando._`,
      );
    }
    db.setGroup(m.chat, { welcome: true });
    return m.reply(
      `✅ *ᴡᴇʟᴄᴏᴍᴇ ᴀᴋᴛɪꜰ*\n\n` +
      `¡Ezecomme mensaje activado con éxito!\n` +
      `Seremos capaces de conseguir uno nuevo.\n\n` +
      `*Usarlo*\`${m.prefix}setwelcome\`para mensajes personalizados. _`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ᴡᴇʟᴄᴏᴍᴇ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
        `> Status: *❌ OFF*\n` +
        `Ez Welcomme ha sido deshabilitado en este grupo.\n\n` +
        `*Usarlo*\`${m.prefix}Bienvenidos\`para activando._`,
      );
    }
    db.setGroup(m.chat, { welcome: false });
    return m.reply(
      `❌ *ᴡᴇʟᴄᴏᴍᴇ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
      `El mensaje de Welcomme es con éxito deshabilitado.\n` +
      `Eso no va a mercado.`,
    );
  }
  m.reply(
    `👋 *ᴡᴇʟᴄᴏᴍᴇ sᴇᴛᴛɪɴɢs*\n\n` +
    `> Status: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
    `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
    `> \`${m.prefix}welcome on\` → Aktifkan\n` +
    `> \`${m.prefix}welcome off\` → Nonaktifkan\n` +
    `> \`${m.prefix}bienvenidos a Al\` →Global ON (propietario)\n` +
    `> \`${m.prefix}Bienvenido a Al\` →Global OFF (propietario)\n` +
    `> \`${m.prefix}setwelcome\` → Custom pesan\n` +
    `> \`${m.prefix}resetwelcome\` →Restablecer predeterminado`,
  );
}
exports.config = pluginConfig; exports.handler = handler; exports.sendWelcomeMessage = sendWelcomeMessage;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
