"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikutimejs = require('../../src/lib/almiku-time.js'); var timeHelper = _interopRequireWildcard(_almikutimejs);
var _cron = require('cron');
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikujpmhelperjs = require('../../src/lib/almiku-jpm-helper.js');

function generateGiveawayId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "GA-";
  for (let i = 0; i < 6; i++)
    id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function parseTime(str) {
  if (!str) return null;
  const match = str.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const num = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return num * (multipliers[unit] || 0);
}

function formatDuration(ms) {
  if (ms < 60000) return `${Math.floor(ms / 1000)}segundo`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}minuto`;
  if (ms < 86400000) return `${Math.floor(ms / 3600000)}hora`;
  return `${Math.floor(ms / 86400000)}el`;
}

function getCtx() {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "";
  const ctx = { forwardingScore: 1, isForwarded: true };
  if (saluranId && saluranId !== "-@newsletter") {
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: Math.floor(Math.random() * 1000) + 1,
    };
  }
  return ctx;
}

if (!global.giveawaySessions) global.giveawaySessions = new Map();
const createSessions = global.giveawaySessions;

function hasActiveSession(senderJid) {
  return createSessions.has(senderJid);
}

async function handleSession(m, sock) {
  const session = createSessions.get(m.sender);
  if (!session) return false;

  const text = (m.body || m.text || "").trim();
  if (!text) return false;

  if (session.step === "q1") {
    const parts = text.split("|").map((s) => s.trim());
    if (parts.length < 3) return true;

    const [title, durationStr, winnersStr] = parts;
    const duration = parseTime(durationStr);
    if (!duration) return true;

    const winners = parseInt(winnersStr);
    if (isNaN(winners) || winners < 1) return true;

    session.title = title;
    session.duration = duration;
    session.winners = winners;
    session.step = "q2";

    await m.reply(
      `✅Detail guardado!\n┃ 🎁 ${title}\n┃ ⏱️ ${formatDuration(duration)}\n┃ 👥 ${winners}ganador\n\n- Toma la lista de grupos.`,
    );

    try {
      const rawGroups = await _almikujpmhelperjs.fetchGroupsSafe.call(void 0, sock);
      const groups = Array.isArray(rawGroups)
        ? rawGroups
        : Object.values(rawGroups);
      const currentGroup = session.chatId;
      const otherGroups = groups.filter((g) => g.id !== currentGroup);

      const buttons = [
        {
          name: "quick_reply",
          buttonParamsJson: JSON.stringify({
            display_text: "📍En este grupo",
            id: `.giveaway selectgroup ${currentGroup}`,
          }),
        },
      ];

      if (otherGroups.length > 0) {
        const sections = [
          {
            title: "Elige Grupo",
            rows: otherGroups.slice(0, 10).map((g) => ({
              title: g.subject || g.id,
              id: `.giveaway selectgroup ${g.id}`,
            })),
          },
        ];
        buttons.push({
          name: "single_select",
          buttonParamsJson: JSON.stringify({
            title: "Seleccionar Grupo Otro",
            sections,
          }),
        });
      }

      await sock.sendButton(
        m.chat,
        null,
        "🎁* GIVEO CREATOR*\n\nPregunta 2/3:\n¿Quieres correr regalos en este grupo u otro grupo?",
        m,
        { buttons, footer: "Seleccione grupo para regalo" },
      );
    } catch (e) {
      session.groupId = currentGroup;
      session.step = "q3";
      await m.reply("⚠Gagal lleva una lista de grupos.");
      await askPrizeDetails(m, sock, session);
    }
    return true;
  }

  if (session.step === "q3") {
    const parts = text.split("|").map((s) => s.trim());
    if (parts.length < 2) return true;

    const [prizeName, ...detailParts] = parts;
    session.prizeName = prizeName;
    session.prizeDetails = detailParts.join(" | ");

    await m.reply("✅ Detail hadiah tersimpan! Membuat giveaway...");

    await createGiveaway(session, sock, m);
    createSessions.delete(m.sender);
    return true;
  }

  return false;
}

async function askPrizeDetails(m, sock, session) {
  try {
    const adminJid = session.adminJid;
    await sock.sendMessage(
      adminJid,
      {
        text:
          "🎁 *GIVEAWAY CREATOR*\n\n" +
          "Pregunta 3/3:\nDar detalles presentes con forma:\n" +
          "El nombre del presente.\n\n" +
          "Contoh: Premium Account | Email: xxx@gmail.com | Password: xxx",
        contextInfo: getCtx(),
      },
      { quoted: m },
    );
  } catch (e) {
    await m.reply("⚠\" Por favor, sólo coja las botas y repita. \"");
    createSessions.delete(session.adminJid);
  }
}

async function createGiveaway(session, sock, m) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const giveaways = db.setting("giveaways") || {};
  const giveawayId = generateGiveawayId();

  const giveaway = {
    giveawayId,
    chatId: session.groupId,
    title: session.title,
    duration: session.duration,
    endTime: Date.now() + session.duration,
    winners: session.winners,
    prizeName: session.prizeName,
    prizeDetails: session.prizeDetails,
    participants: [],
    winnerList: [],
    ended: false,
    giveawayMsgId: null,
    createdBy: session.adminJid,
    createdAt: Date.now(),
  };

  giveaways[giveawayId] = giveaway;
  db.setting("giveaways", giveaways);

  const endTimeFormatted = timeHelper.fromTimestamp(
    giveaway.endTime,
    "DD/MM/YYYY HH:mm",
  );
  const remaining = formatDuration(giveaway.duration);

  const giveawayText =
    "🎉 *G I V E A W A Y*\n\n" +
    `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
    `┃ 🎁 ᴛɪᴛʟᴇ: *${giveaway.title}*\n` +
    `┃ 🏆 ʜᴀᴅɪᴀʜ: *${giveaway.prizeName}*\n` +
    `┃ 👥 ᴘᴇᴍᴇɴᴀɴɢ: ${giveaway.winners}\n` +
    `┃ ⏰ ʙᴇʀᴀᴋʜɪʀ: ${endTimeFormatted}\n` +
    `┃ ⏱️ ᴅᴜʀᴀsɪ: ${remaining}\n` +
    `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
    `╰┈┈⬡\n\n` +
    `¡Para montar en el sorteo!`;

  const joinButton = [
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "🎉 Join",
        id: `.giveaway join ${giveawayId}`,
      }),
    },
  ];

  try {
    const sentMsg = await sock.sendButton(
      giveaway.chatId,
      null,
      giveawayText,
      null,
      {
        buttons: joinButton,
        footer: "Klik Únete para participar",
        contextInfo: getCtx(),
      },
    );

    giveaway.giveawayMsgId = _optionalChain([sentMsg, 'optionalAccess', _7 => _7.key, 'optionalAccess', _8 => _8.id]) || null;
    giveaways[giveawayId] = giveaway;
    db.setting("giveaways", giveaways);
  } catch (e) {
    giveaway.giveawayMsgId = null;
    giveaways[giveawayId] = giveaway;
    db.setting("giveaways", giveaways);
  }

  await sock.sendMessage(
    session.adminJid,
    {
      text: "✅¡Dulces creados con éxito! Compruebe los mensajes de regalo en grupo seleccionado.",
      contextInfo: getCtx(),
    },
    { quoted: m },
  );
}

async function endGiveaway(giveawayId, sock, db) {
  const giveaways = db.setting("giveaways") || {};
  const giveaway = giveaways[giveawayId];
  if (!giveaway || giveaway.ended) return;

  giveaway.ended = true;

  if (giveaway.participants.length === 0) {
    giveaway.winnerList = [];
    db.setting("giveaways", giveaways);

    await sock.sendMessage(giveaway.chatId, {
      text:
        `😔 *GIVEAWAY BERAKHIR*\n\n` +
        `Giveaway *${giveaway.title}Termina sin una participante.\n\n` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
        `┃ 👥 ᴘᴇsᴇʀᴛᴀ: 0\n` +
        `╰┈┈⬡`,
      contextInfo: getCtx(),
    });
    return;
  }

  const winnerCount = Math.min(giveaway.winners, giveaway.participants.length);
  const shuffled = [...giveaway.participants].sort(() => Math.random() - 0.5);
  giveaway.winnerList = shuffled.slice(0, winnerCount);
  db.setting("giveaways", giveaways);

  const winnerText = giveaway.winnerList
    .map((w, i) => `${i + 1}. @${w.split("@")[0]}`)
    .join("\n");

  const firstWinner = giveaway.winnerList[0];
  const fakeQuoted = {
    key: {
      id: `${Date.now()}@ bot`,
      remoteJid: giveaway.chatId,
      participant: firstWinner,
      fromMe: false,
    },
    message: {
      conversation: "Yeyy aku menang",
    },
  };

  await sock.sendMessage(
    giveaway.chatId,
    {
      text:
        `🎊 *GIVEAWAY BERAKHIR!*\n\n` +
        `╭┈┈⬡「 🏆 *ᴘᴇᴍᴇɴᴀɴɢ* 」\n` +
        `${winnerText}\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 🎁 ᴛɪᴛʟᴇ: *${giveaway.title}*\n` +
        `┃ 🏆 ʜᴀᴅɪᴀʜ: *${giveaway.prizeName}*\n` +
        `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
        `┃ 👥 ᴘᴇsᴇʀᴛᴀ: ${giveaway.participants.length}\n` +
        `╰┈┈⬡\n\n` +
        `¡El gran espectáculo se envía al gráfico primate!`,
      contextInfo: { ...getCtx(), mentionedJid: giveaway.winnerList },
    },
    { quoted: fakeQuoted },
  );

  for (const winnerJid of giveaway.winnerList) {
    try {
      const winnerFakeQuoted = {
        key: {
          id: `${Date.now()}@ bot`,
          remoteJid: giveaway.chatId,
          participant: winnerJid,
          fromMe: false,
        },
        message: {
          conversation: "Yeyy aku menang",
        },
      };
      const ctx = getCtx();
      ctx.mentionedJid = [winnerJid];
      await sock.sendMessage(
        winnerJid,
        {
          text:
            `🎉 *sᴇʟᴀᴍᴀᴛ!*\n\n` +
            `¡Para verte ganar el regalo!\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 🎁 ᴛɪᴛʟᴇ: \`${giveaway.title}\`\n` +
            `┃ 🏆 ʜᴀᴅɪᴀʜ: *${giveaway.prizeName}*\n` +
            `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🎁 *ᴅᴇᴛᴀɪʟ ʜᴀᴅɪᴀʜ* 」\n` +
            `${giveaway.prizeDetails || "Hubungi admin untuk detail"}\n` +
            `╰┈┈⬡\n\n` +
            `Está es la información oficial del bot.`,
          contextInfo: ctx,
        },
        { quoted: winnerFakeQuoted },
      );
    } catch (e) {}
  }
}

function startGiveawayChecker(sock, db) {
  new (0, _cron.CronJob)(
    "* * * * *",
    async () => {
      try {
        const { getDatabase } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/almiku-database.js")));
        const currentDb = getDatabase();
        const { getSocket } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/connection.js")));
        const currentSock = getSocket();
        if (!currentSock) return;

        const giveaways = currentDb.setting("giveaways") || {};
        const now = Date.now();
        for (const [id, ga] of Object.entries(giveaways)) {
          if (!ga.ended && ga.endTime && now >= ga.endTime) {
            await endGiveaway(id, currentSock, currentDb);
          }
        }
      } catch (e) {}
    },
    null,
    true,
    "America/Argentina/Buenos_Aires",
  );
}

const createCmds = ["giveawaycreate", "gacreate", "buatgiveaway"];
const listCmds = ["giveawaylist", "galist", "listgiveaway"];
const deleteCmds = ["giveawaydelete", "gadelete", "hapusgiveaway"];
const rerollCmds = ["giveawayreroll", "gareroll", "ulangigiveaway"];

const plugin = {
  name: ["giveaway", ...createCmds, ...listCmds, ...deleteCmds, ...rerollCmds],
  alias: "ga",
  category: "group",
  description: "Sistema de desmontado con botones interactivos",
  admin: false,
};

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const cmd = _optionalChain([m, 'access', _9 => _9.command, 'optionalAccess', _10 => _10.toLowerCase, 'call', _11 => _11()]) || "";
  const prefix = m.prefix || ".";
  const args = m.args || [];

  if (createCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner)
      return m.reply("⚠¡Sólo el administrador puede hacer el regalo!");
    if (!m.isGroup) return m.reply("⚠¡Las responde están siendo folladas!");
    if (createSessions.has(m.sender))
      return m.reply("⚠- ¡Todavía tienes las líneas de energía!");

    createSessions.set(m.sender, {
      step: "q1",
      chatId: m.chat,
      adminJid: m.sender,
      title: null,
      duration: null,
      winners: null,
      groupId: null,
      prizeName: null,
      prizeDetails: null,
    });

    await m.reply(
      "🎁 *GIVEAWAY CREATOR*\n\n" +
        "Pregunta 1/3:\nConfigurar un regalo detallado con formaldec:\n" +
        "*nombre del ganador*\n\n" +
        "Contoh: Premium Account | 5m | 1\n" +
        "Durasi: 30s, 5m, 1h, 1d\n\n" +
        "*Sería silencioso si el fuerte estuviera equivocado*",
    );
    return;
  }

  if (cmd === "giveaway" && _optionalChain([args, 'access', _12 => _12[0], 'optionalAccess', _13 => _13.toLowerCase, 'call', _14 => _14()]) === "selectgroup") {
    const session = createSessions.get(m.sender);
    if (!session || session.step !== "q2") return;

    const groupId = args[1];
    if (!groupId) return;

    session.groupId = groupId;
    session.step = "q3";

    await m.reply(
      "✅Grupo seleccionado! Consultar chat de privacidad para más preguntas.",
    );
    await askPrizeDetails(m, sock, session);
    return;
  }

  if (cmd === "giveaway" && _optionalChain([args, 'access', _15 => _15[0], 'optionalAccess', _16 => _16.toLowerCase, 'call', _17 => _17()]) === "join") {
    const giveawayId = args[1];
    if (!giveawayId) return;

    const giveaways = db.setting("giveaways") || {};
    const giveaway = giveaways[giveawayId];
    if (!giveaway) return m.reply("⚠- Hola, no lo encontraron.");
    if (giveaway.ended) return m.reply("⚠¡Dios mío!");
    if (giveaway.participants.includes(m.sender))
      return m.reply("⚠¡Ya te has unido!");

    giveaway.participants.push(m.sender);
    db.setting("giveaways", giveaways);

    await m.react("✅");
    await m.reply(
      `✅ @${m.sender.split("@")[0]}No soy un gran fan del mundo.${giveaway.participants.length}participante)`,
    );
    return;
  }

  if (listCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner) return m.reply("⚠¡Sólo admin!");
    const giveaways = db.setting("giveaways") || {};
    const entries = Object.values(giveaways);
    if (entries.length === 0) return m.reply("📋No hay regalos.");

    const active = entries.filter((g) => !g.ended);
    const ended = entries.filter((g) => g.ended);

    let text = "📋 *DAFTAR GIVEAWAY*\n\n";
    if (active.length > 0) {
      text += "🟢 *Aktif:*\n";
      for (const g of active) {
        const endFmt = timeHelper.fromTimestamp(g.endTime, "DD/MM/YYYY HH:mm");
        text += `┃ 🆔 \`${g.giveawayId}\` — ${g.title} (${g.participants.length}participante, berakhir${endFmt})\n`;
      }
      text += "\n";
    }
    if (ended.length > 0) {
      text += "🔴 *Berakhir:*\n";
      for (const g of ended.slice(-5)) {
        text += `┃ 🆔 \`${g.giveawayId}\` — ${g.title} (${_optionalChain([g, 'access', _18 => _18.winnerList, 'optionalAccess', _19 => _19.length]) || 0}ganador)\n`;
      }
    }

    await m.reply(text);
    return;
  }

  if (deleteCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner) return m.reply("⚠¡Sólo admin!");
    const giveawayId = args[0];
    if (!giveawayId) return m.reply(`⚠️ Formato:${prefix}${cmd} GA-XXXXXX`);

    const giveaways = db.setting("giveaways") || {};
    if (!giveaways[giveawayId]) return m.reply("⚠- Hola, no lo encontraron.");

    delete giveaways[giveawayId];
    db.setting("giveaways", giveaways);
    await m.reply(`✅ Giveaway \`${giveawayId}\`eliminado correctamente!`);
    return;
  }

  if (rerollCmds.includes(cmd)) {
    if (!m.isAdmin && !m.isOwner) return m.reply("⚠¡Sólo admin!");
    const giveawayId = args[0];
    if (!giveawayId) return m.reply(`⚠️ Formato:${prefix}${cmd} GA-XXXXXX`);

    const giveaways = db.setting("giveaways") || {};
    const giveaway = giveaways[giveawayId];
    if (!giveaway) return m.reply("⚠- Hola, no lo encontraron.");
    if (!giveaway.ended) return m.reply("⚠- ¡Dios mío!");
    if (giveaway.participants.length === 0)
      return m.reply("⚠¡No participante!");

    const winnerCount = Math.min(
      giveaway.winners,
      giveaway.participants.length,
    );
    const shuffled = [...giveaway.participants].sort(() => Math.random() - 0.5);
    giveaway.winnerList = shuffled.slice(0, winnerCount);
    db.setting("giveaways", giveaways);

    const winnerText = giveaway.winnerList
      .map((w, i) => `${i + 1}. @${w.split("@")[0]}`)
      .join("\n");

    await sock.sendMessage(giveaway.chatId, {
      text:
        `🔄 *GIVEAWAY REROLL!*\n\n` +
        `╭┈┈⬡「 🏆 *ᴘᴇᴍᴇɴᴀɴɢ ʙᴀʀᴜ* 」\n` +
        `${winnerText}\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 🎁 ᴛɪᴛʟᴇ: *${giveaway.title}*\n` +
        `┃ 🏆 ʜᴀᴅɪᴀʜ: *${giveaway.prizeName}*\n` +
        `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
        `╰┈┈⬡`,
      contextInfo: { ...getCtx(), mentionedJid: giveaway.winnerList },
    });

    for (const winnerJid of giveaway.winnerList) {
      try {
        const ctx = getCtx();
        ctx.mentionedJid = [winnerJid];
        await sock.sendMessage(winnerJid, {
          text:
            `🎉 *sᴇʟᴀᴍᴀᴛ!*\n\n` +
            `¡Para verte ganar un regalo!\n\n` +
            `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
            `┃ 🎁 ᴛɪᴛʟᴇ: \`${giveaway.title}\`\n` +
            `┃ 🏆 ʜᴀᴅɪᴀʜ: *${giveaway.prizeName}*\n` +
            `┃ 🆔 ɪᴅ: \`${giveawayId}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🎁 *ᴅᴇᴛᴀɪʟ ʜᴀᴅɪᴀʜ* 」\n` +
            `${giveaway.prizeDetails || "Hubungi admin untuk detail"}\n` +
            `╰┈┈⬡\n\n` +
            `Está es la información oficial del bot.`,
          contextInfo: ctx,
        });
      } catch (e) {}
    }
    return;
  }

  if (cmd === "giveaway") {
    await m.reply(
      "🎁* GIVEWAKE MINUTE *\n\n" +
        `┃ ${prefix}dar un largo término crear—Crea giveaway\n` +
        `┃ ${prefix}Lista de distribución—Mira registrate\n` +
        `┃ ${prefix}• dame un descanso •—Elimina giveaway\n` +
        `┃ ${prefix}giveawayreroll — Reroll pemenang\n\n` +
        `> Alias: ga, gacreate, galist, gadelete, gareroll`,
    );
    return;
  }
}







exports.config = plugin; exports.handler = handler; exports.startGiveawayChecker = startGiveawayChecker; exports.hasActiveSession = hasActiveSession; exports.handleSession = handleSession;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
