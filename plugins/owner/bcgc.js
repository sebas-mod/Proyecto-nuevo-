"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinjpmhelperjs = require('../../src/lib/ourin-jpm-helper.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "bcgc",
  alias: [
    "broadcastgc",
    "bcgroup",
    "jedabcgc",
    "delaybcgc",
    "setjedabcgc",
    "stopbcgc",
    "stopbroadcastgc",
  ],
  category: "owner",
  description:
    "Mensajes de radio a todos los grupos con apoyo de todos los genies de los medios",
  usage: ".bcgc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function parseDelay(input) {
  if (!input) return null;
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s":
      return val * 1000;
    case "m":
      return val * 60 * 1000;
    case "h":
      return val * 60 * 60 * 1000;
    case "d":
      return val * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)}el`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)}hora`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)}minuto`;
  return `${(ms / 1000).toFixed(0)}segundo`;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const command = _optionalChain([m, 'access', _ => _.command, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]) || "";
  const input = _optionalChain([m, 'access', _4 => _4.fullArgs, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()]) || _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]) || "";

  if (command === "stopbcgc" || command === "stopbroadcastgc") {
    if (!global.statusBcgc) {
      return m.reply(`❌No hay radio de televión grupo está caminando.`);
    }
    global.stopBcgc = true;
    m.react("⏹️");
    return m.reply(
      `⏹* Paleta de Grupo de Radiodifusión *\n\n- Proceso radiodifusión está siendo detenido.`,
    );
  }

  if (
    command === "jedabcgc" ||
    command === "delaybcgc" ||
    command === "setjedabcgc"
  ) {
    return handleSetDelay(m, db, input);
  }

  if (input.toLowerCase() === "on") {
    db.setting("bcgcEnabled", true);
    return m.reply(
      `✅Grup de maletas activadas\n\nAhora puedes enviar transmisiones a todos los grupos.`,
    );
  }

  if (input.toLowerCase() === "off") {
    db.setting("bcgcEnabled", false);
    return m.reply(
      `✅Malata Grupo Discapacitada\n\n* El grupo de radio ha sido sudo *`,
    );
  }

  if (!input && !m.quoted) {
    const enabled = db.setting("bcgcEnabled");
    const jeda = db.setting("jedaBcgc") || 5000;
    return m.reply(
      `📢*Broadcast Grupo*\n\n` +
        `Mensaje para todo el grupo en un solo orden.\n\n` +
        `* Estatus actuales: *\n` +
        `> Broadcast: *${enabled ? "✅ Aktif" : "❌ Nonaktif"}*\n` +
        `> Jeda: *${formatDelay(jeda)}* (*${jeda}ms*)\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}bcgc on *—Activa broadcast\n` +
        `> *${m.prefix}bcgc off *—Desactiva broadcast\n` +
        `> *${m.prefix}bcgc<pesan>*—Ksender broadcaster text\n` +
        `> *${m.prefix}bcgc * (respuesta foto / video / audio / documento )—Kseng con medios\n` +
        `> *${m.prefix}bcgc * ( mensaje de texto de respuesta )—Contenido del mensaje recuperado\n\n` +
        `*JEDA:*\n` +
        `> *${m.prefix}jedabcgc 5s* — Set jeda 5 detik\n` +
        `> *${m.prefix}jedabcgc 2m* — Set jeda 2 menit\n\n` +
        `*STOP:*\n` +
        `> *${m.prefix}stopbcgc *—Parar el largo transmisor caminando`,
    );
  }

  if (global.statusBcgc) {
    return m.reply(
      `❌Sesamo Caminata de radiodifusión\n\n# Tickety #${m.prefix}stopbcgc detener la primera.`,
    );
  }

  const enabled = db.setting("bcgcEnabled");
  if (!enabled) {
    return m.reply(
      `❌Bisturí de Aún no Active\n\n# Tickety #${m.prefix}bcgc on * usado para activar.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    let text = input || "";
    const qmsg = m.quoted || m;

    if (!text && m.quoted) {
      text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
    }

    if (qmsg.isImage) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "image";
      } catch (e2) {}
    } else if (qmsg.isVideo) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "video";
      } catch (e3) {}
    } else if (qmsg.isAudio || _optionalChain([qmsg, 'access', _10 => _10.mimetype, 'optionalAccess', _11 => _11.startsWith, 'call', _12 => _12("audio")])) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "audio";
      } catch (e4) {}
    } else if (qmsg.isSticker) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "sticker";
      } catch (e5) {}
    } else if (
      qmsg.isDocument ||
      (qmsg.mimetype && !qmsg.mimetype.startsWith("text/plain"))
    ) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "document";
      } catch (e6) {}
    }

    if (!text && !mediaBuffer) {
      m.react("❌");
      return m.reply(
        `❌No hay contenido\n\n` +
          `Mensaje de reenvío, foto, audio... video, o el documento más antiguo.\n\n` +
          `* True Cara *\n` +
          `1. Ksents / fotos / video / audio / documento\n` +
          `2. * Responder el mensaje${m.prefix}bcgc*\n` +
          `Tres.`,
      );
    }

    const allGroups = await _ourinjpmhelperjs.fetchGroupsSafe.call(void 0, sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blCount = groupIds.filter((id) => blacklist.includes(id)).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌No Grup\n\n*No puedo encontrar un grupo que pueda ser empujado*${blCount > 0 ? ` (${blCount} grup di-blacklist)` : ""}`,
      );
    }

    const jeda = db.setting("jedaBcgc") || 5000;
    const ctx = _ourincontextjs.saluranCtx.call(void 0, );

    await m.reply(
      `📢Grup de radiodifusión cargado\n\n` +
        `♪📝Mensaje: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "Tidak ada"}*\n` +
        `> 👥 Objetivo: *${groupIds.length}* grup\n` +
        `> ⏱️ Jeda: *${formatDelay(jeda)}*\n` +
        `> 📊 Estimasi: *${Math.ceil((groupIds.length * jeda) / 60000)}minuto*\n\n` +
        `- @ dang envía a todos grupo.`,
    );

    global.statusBcgc = true;
    let success = 0;
    let failed = 0;

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc;
        delete global.statusBcgc;
        await m.reply(
          `⏹* Paleta de Grupo de Radiodifusión *\n\n` +
            `♪✅Exito: *${success}*\n` +
            `♪❌Fallido: *${failed}*\n` +
            `♪⏸Restante: *${groupIds.length - success - failed}*`,
        );
        return;
      }

      try {
        if (mediaType === "sticker") {
          await sock.sendMessage(
            gid,
            { sticker: mediaBuffer, contextInfo: ctx },
            { quoted: m },
          );
        } else if (mediaType === "audio") {
          await sock.sendMessage(
            gid,
            {
              audio: mediaBuffer,
              mimetype: qmsg.mimetype || "audio/mpeg",
              ptt: qmsg.ptt || false,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaType === "document") {
          await sock.sendMessage(
            gid,
            {
              document: mediaBuffer,
              mimetype: qmsg.mimetype || "application/octet-stream",
              fileName: qmsg.fileName || "file",
              caption: text || undefined,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaBuffer) {
          await sock.sendMessage(
            gid,
            {
              [mediaType]: mediaBuffer,
              caption: text,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            gid,
            { text, contextInfo: ctx },
            { quoted: m },
          );
        }
        success++;
      } catch (e7) {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcgc;
    m.react("✅");
    await m.reply(
      `✅¡Grupo de radiodifusión está terminado!\n\n` +
        `♪✅Exito: *${success}*\n` +
        `♪❌Fallido: *${failed}*\n` +
        `> 📊 Total: *${groupIds.length}*`,
    );
  } catch (e) {
    delete global.statusBcgc;
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

async function handleSetDelay(m, db, input) {
  const current = db.setting("jedaBcgc") || 5000;

  if (!input) {
    return m.reply(
      `⏱♪Pahuda Grupo de la camara ancha♪\n\n` +
        `El tiempo @-@ viaje de los mensajes va a cada grupo.\n` +
        `Bastante largo para jeda, lo suficientamante seguro de la determinación del spam.\n\n` +
        `Pausa está vez:${formatDelay(current)}* (*${current}ms*)\n\n` +
        `*Como usarlo:*\n` +
        `> *${m.prefix}jedabcgc <angka><satuan>*\n\n` +
        `*SATUAN:*\n` +
        `♪ ♪—segundo•* m *—minuto•* h *—hora•* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *— el\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}jedabcgc 5s* → 5 detik\n` +
        `> *${m.prefix}jedabcgc 2m* → 2 menit\n` +
        `> *${m.prefix}jedabcgc 1h→1 hora`,
    );
  }

  const ms = parseDelay(input);
  if (!ms || ms < 1000) {
    return m.reply(`❌Incorrecto formal. * 5s *, * 2m *, * 1h *, * 1d *`);
  }

  db.setting("jedaBcgc", ms);
  return m.reply(
    `✅* Pausa radiodifusión Grupo Subido *\n\n` +
      `Anteriormente en Salem...${formatDelay(current)}* (*${current}ms*)\n` +
      `♪ Ahora ♪${formatDelay(ms)}* (*${ms}ms*)\n\n` +
      `Estigación 100 grupo:${Math.ceil((100 * ms) / 60000)}minuto*`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
