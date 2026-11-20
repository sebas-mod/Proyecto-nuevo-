"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "autosambut",
  alias: ["sambutowner"],
  category: "group",
  description: "Ajuste de la respuesta automocional cuando el propietario aparece después de una larga vela",
  usage: ".autosambut on/off/delay/add/del/list",
  example: ".autosambut on",
  isOwner: true,
  isGroup: true,
  cooldown: 3,
  isEnabled: true,
};

function parseTime(str) {
  const match = str.match(/^([\d.]+)([a-zA-Z]+)$/);
  if (!match) return null;
  const val = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  if (unit.startsWith('s')) return val * 1000;
  if (unit.startsWith('m')) return val * 60 * 1000;
  if (unit.startsWith('h')) return val * 60 * 60 * 1000;
  if (unit.startsWith('d')) return val * 24 * 60 * 60 * 1000;
  if (unit.startsWith('w')) return val * 7 * 24 * 60 * 60 * 1000;
  if (unit.startsWith('y')) return val * 365 * 24 * 60 * 60 * 1000;
  return null;
}

function formatTime(ms) {
  if (ms < 60000) return `${ms / 1000}segundo`;
  if (ms < 3600000) return `${ms / 60000}minuto`;
  if (ms < 86400000) return `${ms / 3600000}hora`;
  if (ms < 604800000) return `${ms / 86400000}el`;
  return `${ms / 86400000}el`;
}

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const isGlobal = args.includes("--global");

  const database = _ourindatabasejs.getDatabase.call(void 0, );
  let groupData = database.getGroup(m.chat);
  if (!groupData.autoSambut) {
    groupData.autoSambut = {
      enabled: false,
      delayMs: 2 * 60 * 60 * 1000,
      pesanList: ["Hola{user}¡Bienvenido!🙇‍♂♪"],
      lastChats: {}
    };
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  if (groupData.autoSambut.pesan !== undefined) {
    if (!groupData.autoSambut.pesanList) {
      groupData.autoSambut.pesanList = [groupData.autoSambut.pesan];
    }
    delete groupData.autoSambut.pesan;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
  }
  // Fallback
  if (!Array.isArray(groupData.autoSambut.pesanList) || groupData.autoSambut.pesanList.length === 0) {
    groupData.autoSambut.pesanList = ["Hola{user}¡Bienvenido!🙇‍♂♪"];
  }

  if (!action) {
    const status = groupData.autoSambut.enabled ? "Aktif ✅" : "Nonaktif ❌";
    const delayMs = groupData.autoSambut.delayMs || 7200000;
    const totalPesan = groupData.autoSambut.pesanList.length;

    return m.reply(
      `⚠* SISTEM AUTO SAMBUT *\n\n` +
      `El sistema de automatización da la bienvenida al propietario al grupo de una manera aleatoria cuando el propietario aparece después de un largo ocio.\n` +
      `Status: *${status}*\n` +
      `Wastu Idle Brick: *${formatTime(delayMs)}*\n` +
      `Julio san Random: *${totalPesan}Saludo*\n\n` +
      `*Uso Principal:*\n` +
      `• *${m.prefix}autowelcome on / off *—Enciende la función en este grupo\n` +
      `• *${m.prefix}retraso de los autowelcome<waktu>*—Cambio de tiempo de ocio\n\n` +
      `* EXCICIÓN ACASADA *:\n` +
      `• *${m.prefix}lista de autowelcome *—Mira todos los saps que han sido registrados\n` +
      `• *${m.prefix}autowelcome add<teks>*—Añádase una nueva bienvenida a la lista\n` +
      `• *${m.prefix}autowelcome del<angka>*—Borrar mensajes en el número de secuencia absoluta\n\n` +
      `*Explicación Exclusivo para:*\n` +
      `1. Use el tiempo de formato: * s * ( segundos ), * m * ( minutos ), * h * ( reloj ), * d * ( día ).${m.prefix}autosambut delay 30m*\n` +
      `2 " Use.{name}* para llamarme propietario, y *{user}* para mí @-@ mencionista propietario.\n` +
      `3, el aggrega el attrant al final de cada comando, la anausción en èo grupo será copido directamente al bot de KlA grupo!`
    );
  }

  if (action === "on" || action === "off") {
    const isEnable = action === "on";
    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: isEnable,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`${isEnable ? '✅' : '❌'}* Fatur Auto Sambut Global${isEnable ? 'Diaktifkan' : 'Dinonaktifkan'}*\n\nTodos los grupos${count}) ahora utilizando el mismo sistema de barrido que este grupo.`);
    }

    groupData.autoSambut.enabled = isEnable;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(isEnable ? `✅[ Fatur Auto Sambut Activado!` : `❌* Automóvil de la Fular Sambut Disabled >`);
  }

  if (action === "delay") {
    const timeInput = args[1];
    if (!timeInput) return m.reply(`¡Ayuda con el tiempo!\`${m.prefix}autosambut delay 2h\``);

    const parsedMs = parseTime(timeInput);
    if (!parsedMs) {
      return m.reply(`No se juegan tiempos iguales.\`2h\`(2 hora),\`30m\`(30 minuto).`);
    }

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: parsedMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`⏱️ *Delay Auto Sambut Global Cambiado a ${formatTime(parsedMs)}para${count}grupo!*`);
    }

    groupData.autoSambut.delayMs = parsedMs;
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });
    return m.reply(`⏱# Delay Auto Sambut Reaped!\n\nAhora el bot le dará la bienvenida una vez que no le propina nada en este grupo para *${formatTime(parsedMs)}* berturut-turut.`);
  }

  if (action === "list") {
    let listText = `📜* AUTO SAMBUT PROTECTION LAND *\n\nTotales allí *${groupData.autoSambut.pesanList.length}* El chat scrabed limadodo en ègrupo:\n\n`;
    groupData.autoSambut.pesanList.forEach((text, index) => {
      listText += `*${index + 1}.* ${text}\n\n`;
    });
    listText += `*Usarlo*\`${m.prefix}autowelcome del<angka>\`para memorizar uno.`;
    return m.reply(listText);
  }

  if (action === "add") {
    const newMsg = args.slice(1).filter(v => v !== '--global').join(" ").trim();
    if (!newMsg) {
      return m.reply(`Ayúdame a entrar en el texto de bienvenida.\nEjemplo:\`${m.prefix}Aumenta Hola mi jefe{user}!\``);
    }

    groupData.autoSambut.pesanList.push(newMsg);
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`💬* Mensaje Nuevo Tammed to Global List (P.S.A.)${count}grupo)!*\n\nMensaje registrado:\n♪${newMsg}"`);
    }

    return m.reply(`💬* Sends Nuevo¡Trabaja en el parque!\nAhora existe${groupData.autoSambut.pesanList.length}El pienso al azar está en la lista.`);
  }

  if (action === "del") {
    const indexInput = parseInt(args[1]);
    if (isNaN(indexInput) || indexInput < 1 || indexInput > groupData.autoSambut.pesanList.length) {
      return m.reply(`Por favor, introduzca una secuencia válida de mensajes.\nVer la lista de números con\`${m.prefix}autosambut list\`.`);
    }
    if (groupData.autoSambut.pesanList.length <= 1) {
      return m.reply(`El debe tiene un pequeño mensaje en la lista de cubiertas de este grupo.`);
    }

    const removedMsg = groupData.autoSambut.pesanList.splice(indexInput - 1, 1)[0];
    database.setGroup(m.chat, { autoSambut: groupData.autoSambut });

    if (isGlobal) {
      const groups = await sock.groupFetchAllParticipating();
      let count = 0;
      for (const jid of Object.keys(groups)) {
        let gData = database.getGroup(jid) || {};
        gData.autoSambut = {
          enabled: groupData.autoSambut.enabled,
          delayMs: groupData.autoSambut.delayMs,
          pesanList: [...groupData.autoSambut.pesanList],
          lastChats: {}
        };
        database.setGroup(jid, { autoSambut: gData.autoSambut });
        count++;
      }
      return m.reply(`🗑Mensaje, el globo resultante @-@ como borrado${count}grupo)!*\n\nEliminado:\n♪${removedMsg}"`);
    }

    return m.reply(`🗑* Resultados de sentido eliminados*\n\nEliminado:\n♪${removedMsg}♪\nPor favor, enumera un saludo:${groupData.autoSambut.pesanList.length}`);
  }

  if (action === "pesan") {
    return m.reply(`⚠️ Comando\`mensaje\`ha sido hospedado y reemplazado por un sistema aleatorio.\nPor favor usa\`${m.prefix}autowelcome add<teks>\`Para agregar un saludo, o\`${m.prefix}lista de los productos de la máquina\`Para ver la lista de tarjetas.`);
  }

  return m.reply(`Comando inválido.\`${m.prefix}autowelcome\`Sin suerte para ver el libro de guía.`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
