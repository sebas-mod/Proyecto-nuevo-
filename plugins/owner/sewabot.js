"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "sewabot",
  alias: ["sewa"],
  category: "owner",
  description: "Toggle y gestionar el sistema de alquiler @-@ bot",
  usage: ".sewabot <on/off/leave/status>",
  example: ".sewabot on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const pendingConfirmations = new Map();
async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3(), 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }
  const currentStatus = db.db.data.sewa.enabled;
  const sewaGroups = Object.keys(db.db.data.sewa.groups || {});
  if (!args || args === "status") {
    return m.reply(
      `🔧* SISTETS RELIEF BOT *\n\n` +
        `Status: *${currentStatus ? "✅ AKTIF" : "❌ NONAKTIF"}*\n` +
        `Grupo de lista: *${sewaGroups.length}*\n\n` +
        `*Comando Disponible:*\n` +
        `• *${m.prefix}sewabot on *—Activar el sistema de alquiler\n` +
        `• *${m.prefix}sewabot off* —Desactivar el sistema de alquiler\n` +
        `• *${m.prefix}sewabot leave *—Dejar todo lo que no @-@ whitelist grup\n\n` +
        `*KELOLA Alquiler:*\n` +
        `• *${m.prefix}addsewa<link> <durasi>*—Añadir grupo + auto\n` +
        `• *${m.prefix}delsewa<link/id>*—Retirar el grupo de la lista blanca\n` +
        `• *${m.prefix}renewsewa<link/id> <durasi>*—Renovar alquiler\n` +
        `• *${m.prefix}listsewa *—Mira todos los grupos listados.\n` +
        `• *${m.prefix}checksewa—Verifique el alquiller de rettante ( en grupo )\n\n` +
        `*Formato Duración:*\n` +
        `30i (minuto)\u2022 12h ( reloj )\u2022 7d (día)\u2022 1m (mes)\u2022 1y (año)\u2022 Lifetyme\n\n` +
        `*CARA Trabaja:*\n` +
        `1. & Add grupo with *${m.prefix}addsewa*\n` +
        `4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,\n` +
        `3, activar con *${m.prefix}sewabot on*\n` +
        `Estarás fuera de todo el grupo no registrado.\n` +
        `Alquiler e.xPillada→Botas automatizadas fuera de grupo`,
    );
  }
  if (args === "off") {
    db.db.data.sewa.enabled = false;
    db.db.write();
    await m.react("✅");
    return m.reply(
      `✅Sistema de alquiler para discapacitados\n\nNo dejaría atrás a un grupo de ellos.`,
    );
  }
  if (args === "on") {
    const pending = pendingConfirmations.get(m.sender);
    if (
      pending &&
      pending.type === "sewabot_on" &&
      Date.now() - pending.timestamp < 60000
    ) {
      return m.reply(
        `🕕Ya hay una mención de un final\n\nEscribe *${m.prefix}sewabot confirma * para continuar\nEscribe *${m.prefix}sewabot cancelar * para baton`,
      );
    }
    pendingConfirmations.set(m.sender, {
      type: "sewabot_on",
      timestamp: Date.now(),
    });
    setTimeout(() => {
      if (_optionalChain([pendingConfirmations, 'access', _6 => _6.get, 'call', _7 => _7(m.sender), 'optionalAccess', _8 => _8.type]) === "sewabot_on")
        pendingConfirmations.delete(m.sender);
    }, 60000);
    return m.reply(
      `⚠El conflicto de activación de alquiler\n\n` +
        `Si activado:\n` +
        `• ✅ ${sewaGroups.length}grupo ter- whitelist remaining secure\n` +
        `• ❌¡Todos los demás grupos quedarán atrás!\n\n` +
        `Escribe *${m.prefix}sewabot confirma * para continuar\nEscribe *${m.prefix}sewabot cancelar * para baton\n\n` +
        `💡Asegúrese de que el grupo blanco ya es importante con:\n*${m.prefix}addsewa <link grup> <durasi>*`,
    );
  }
  if (args === "confirm" || args === "yes" || args === "y") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on") {
      return m.reply(
        `❌No hay mención de la pendiente\nEscribe *${m.prefix}sewabotía estar en basura`,
      );
    }
    pendingConfirmations.delete(m.sender);
    db.db.data.sewa.enabled = true;
    db.db.write();
    await m.react("🕕");
    await m.reply(`🕕Sistema de alquiler activado, auto @-@ Deja procesamiento..`);
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          try {
            await sock.sendText(
              groupId,
              `⛔Este grupo no está registrado en el sistema de alquileres.\nSiento dejar este grupo.\n\nLlame al propietario para alquilar bot.`,
              null,
              {
                contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
              },
            );
            await new Promise((r) => setTimeout(r, 2000));
          } catch (err) {
            //Errores de Ignora si no se envían mensajes ( administrador bloqueado missal grupo )
          }

          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 3000));
        } catch (e2) {
          failedCount++;
        }
      }
      await m.react("✅");
      return m.reply(
        `✅* RENT BOT ACTIVE *\n\n` +
          `Grupo whitelist: *${sewaGroups.length}*\n` +
          `Fuera de: *${leftCount}* grup\n` +
          `Fallido: *${failedCount}* grupo`,
      );
    } catch (e) {
      await m.react("✅");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (args === "leave") {
    if (!currentStatus)
      return m.reply(`❌Enable subterfuge primero con *${m.prefix}sewabot on*`);
    await m.react("🕕");
    await m.reply(`🕕Tomar la lista de grupos..`);
    global.sewaLeaving = true;
    try {
      global.isFetchingGroups = true;
      const allGroups = await sock.groupFetchAllParticipating();
      global.isFetchingGroups = false;
      const allGroupIds = Object.keys(allGroups);
      const unlistedGroups = allGroupIds.filter(
        (id) => !sewaGroups.includes(id),
      );
      if (unlistedGroups.length === 0) {
        delete global.sewaLeaving;
        await m.react("✅");
        return m.reply(`✅No hay grupo que dejar atrás.`);
      }
      await m.reply(
        `📊 Total: ${allGroupIds.length} grup\nWhitelist: ${sewaGroups.length}\nSaldré del auto.${unlistedGroups.length}grupo`,
      );
      let leftCount = 0;
      let failedCount = 0;
      for (const groupId of unlistedGroups) {
        try {
          try {
            await sock.sendText(
              groupId,
              `👋Este grupo no está registrado en el sistema de alquileres.\nSiento dejar este grupo.\n\nLlame al propietario para alquilar bot.`,
              null,
              {
                contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
              },
            );
            await new Promise((r) => setTimeout(r, 3000));
          } catch (err) {
            //Ignorar el mensaje de error la bota todavía puede salir
          }

          await sock.groupLeave(groupId);
          leftCount++;
          await new Promise((r) => setTimeout(r, 5000));
        } catch (e3) {
          failedCount++;
        }
      }
      delete global.sewaLeaving;
      await m.react("✅");
      return m.reply(
        `✅Terminado\n\nSesión cerrada: *${leftCount}* grup\nGagal: *${failedCount}* grupo`,
      );
    } catch (e) {
      delete global.sewaLeaving;
      await m.react("☢");
      await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (args === "cancel" || args === "no" || args === "n") {
    const pending = pendingConfirmations.get(m.sender);
    if (!pending || pending.type !== "sewabot_on")
      return m.reply(`❌No hay mención de la pendiente`);
    pendingConfirmations.delete(m.sender);
    await m.react("❌");
    return m.reply(
      `❌Activación de Cancelado\nWhitelist grupo prima con *${m.prefix}addsewa*`,
    );
  }
  return m.reply(
    `❌Comando inválido\n\nEscribe *${m.prefix}sewabot * para ver el realce completo`,
  );
}
exports.config = pluginConfig; exports.handler = handler; exports.pendingConfirmations = pendingConfirmations;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
