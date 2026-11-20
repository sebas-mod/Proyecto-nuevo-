"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikucontextjs = require('../../src/lib/almiku-context.js');
const pluginConfig = {
  name: "delsewa",
  alias: ["sewadel", "hapussewa", "removesewa"],
  category: "owner",
  description: "Quitar grupo de la lista blanca de alquiller",
  usage: ".delsewa <link/id grup>",
  example: ".delsewa https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = _optionalChain([input, 'access', _ => _.split, 'call', _2 => _2("chat.whatsapp.com/"), 'access', _3 => _3[1], 'optionalAccess', _4 => _4.split, 'call', _5 => _5(/[\s?]/), 'access', _6 => _6[0]]);
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      if (_optionalChain([metadata, 'optionalAccess', _7 => _7.id])) return { id: metadata.id, name: metadata.subject };
    } catch (e) {}
    return null;
  }
  return { id: input.includes("@g.us") ? input : input + "@g.us", name: null };
}

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const input = _optionalChain([m, 'access', _8 => _8.text, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]);

  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  let groupId = null;
  let groupName = null;

  if (!input) {
    if (!m.isGroup) {
      return m.reply(
        `📝*Elimina Alquiler*\n\n` +
          `De primate: *${m.prefix}delsewa <link/id>*\n` +
          `De grupo: axila *${m.prefix}delsewa* langsung di grup\n\n` +
          `Ejemplo:\n` +
          `• ${m.prefix}delsewa https://chat.whatsapp.com/xxx\n` +
          `• ${m.prefix}delsewa 120363xxx\n\n` +
          `⚠Si el vehículo está activo, las botas se autogestionarán para salir del grupo en el que se ha metido.`,
      );
    }
    groupId = m.chat;
  } else {
    const result = await resolveGroupId(sock, input);
    if (!result)
      return m.reply(`❌El enlace no es válido o grupo no se encuentra`);
    groupId = result.id;
    groupName = result.name;
  }

  if (!groupId) return m.reply(`❌Incapacidad para establecer el grupo`);

  const sewaData = db.db.data.sewa.groups[groupId];
  if (!sewaData)
    return m.reply(
      `❌Grup no está registrado en el sistema de alquiler\n\nMira la lista: *${m.prefix}listsewa*`,
    );

  groupName = groupName || sewaData.name || groupId.split("@")[0];

  delete db.db.data.sewa.groups[groupId];
  db.db.write();

  await m.react("✅");
  await m.reply(
    `✅*Alquiler Eliminado*\n\nGrupo: *${groupName}*\nID: ${groupId.split("@")[0]}`,
  );

  if (db.db.data.sewa.enabled) {
    try {
      await sock.sendText(
        groupId,
        `⛔Este Grupo ha sido intercept de la lista blanca de alquiller.\nLamento haber dejado al grupo.\n\nLlamar al dueño para un renombrado.`,
        null,
        {
          contextInfo: _almikucontextjs.saluranCtx.call(void 0, ),
        },
      );
      await new Promise((r) => setTimeout(r, 2000));
      await sock.groupLeave(groupId);
    } catch (e2) {}
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
