"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);




var _ourinsholatapijs = require('../../src/lib/ourin-sholat-api.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "autosholat",
  alias: ["sholat", "autoadzan"],
  category: "owner",
  description: "Revolver el cronograma autotics con audio adzan y tup grupo",
  usage: ".autosholat on/off/status/kota <nama>",
  example: ".autosholat on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const AUDIO_ADZAN = "https://media.vocaroo.com/mp3/1ofLT2YUJAjQ";

async function handler(m, { sock, db }) {
  const args = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()]);
  const database = _ourindatabasejs.getDatabase.call(void 0, );
  
  if (!args || args === "status") {
    const status = database.setting("autoSholat") ? "Aktif ✅" : "Nonaktif ❌";
    const closeGroup = database.setting("autoSholatCloseGroup") ? "Ya ✅" : "No❌";
    const duration = database.setting("autoSholatDuration") || 5;
    const kotaSetting = database.setting("autoSholatKota") || { id: "1301", nama: "KOTA JAKARTA" };
    
    let jadwalText = "";
    try {
      const jadwalData = await _ourinsholatapijs.getTodaySchedule.call(void 0, kotaSetting.id);
      const times = _ourinsholatapijs.extractPrayerTimes.call(void 0, jadwalData);
      for (const [nama, waktu] of Object.entries(times)) {
        jadwalText += `- **${nama.charAt(0).toUpperCase() + nama.slice(1)}**: ${waktu}\n`;
      }
    } catch (e2) {
      jadwalText = "- El desluido de MiQUrano\n";
    }

    return m.reply(
      `🕌" Auto Sholat - Time Memory System Confused "\n\n` +
      `El sistema actual está establecido para ayudarle y sus miembros del grupo recordar el tiempo de su ciclo automocional. Este es un control de caminar:\n\n` +
      `- **Status Pengingat**: ${status}\n` +
      `* * Grupo Enhancement Autotics *${closeGroup}\n` +
      `* Duración Enhancing * *${duration} menit\n` +
      `" Este localizador de memoria de Cuando ".${kotaSetting.nama}\n\n` +
      `* Jadwal Sholat Today: *\n` +
      jadwalText + `\n` +
      `* * Guía de Contención de Fuentes: *\n` +
      `- Escribe\`${m.prefix}autosholat on\`Para activar el sistema de alerta.\n` +
      `- Escribe\`${m.prefix}autosholat off\`Para detener el sistema de memoria.\n` +
      `- Escribe\`${m.prefix}autosholat close on\` o \`off\`Para copiar las fases de la automatización del grupo de arranque.\n` +
      `- Escribe\`${m.prefix}autosholat duration <angka>\`Para determinar cuánto tiempo estará cerrado el grupo ( minutos ).\n` +
      `- Escribe\`${m.prefix}autosholat kota <nama kota>\`Para sincronizar el tiempo sholat con el área que elija.\n\n` +
      `Todos los elementos son preseminales y delgados de Mi centro de datosQuran Fuego._`
    );
  }

  if (args === "on") {
    database.setting("autoSholat", true);
    await m.react("✅");
    const kota = database.setting("autoSholatKota") || { nama: "KOTA JAKARTA" };
    return m.reply(
      `✅* * * Sholat Warmer 's System Resulting Activated! *\n\n` +
      `A partir de ahora, enviaré una notificación con el adzan de audio de grabación justo cuando llegue el enfrentamiento.${kota.nama}** ya!`
    );
  }

  if (args === "off") {
    database.setting("autoSholat", false);
    await m.react("❌");
    return m.reply(
      `❌* * Sholat Warmer 's System desactivated. * *\n\n` +
      `Bueno, no voy a desperdiciar otra oportunida y convertir el audio adzan en un grupo @ - @ grupo.`
    );
  }

  if (args === "close") {
    const subArg = _optionalChain([m, 'access', _5 => _5.args, 'access', _6 => _6[1], 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8()]);
    if (subArg === "on") {
      database.setting("autoSholatCloseGroup", true);
      await m.react("🔒");
      return m.reply(
        `🔒*Fular Shuffle Grupo Automatise Activado!\n\n` +
        `Cuando llegue el zócalo, podré cerrar la conversación del grupo entero primero.`
      );
    }
    if (subArg === "off") {
      database.setting("autoSholatCloseGroup", false);
      await m.react("🔓");
      return m.reply(
        `🔓♪ Fumble Shuffle Grupo Automático Dislabel. ♪\n\n` +
        `Ahora el grupo no será cerrado mientras lucha aviar, por lo que los ramblings pueden continuar sin servicio.`
      );
    }
    return m.reply(`Lo siento, las formalidades están un poco fuera de control.\`${m.prefix}autosholat más cerca\`o\`${m.prefix}autosholat close off\`.`);
  }

  if (args === "duration") {
    const duration = parseInt(m.args[1]);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return m.reply(`Entrada de los números de uno a seis para la duación del grupo (en minutos ).`);
    }
    database.setting("autoSholatDuration", duration);
    await m.react("⏱️");
    return m.reply(
      `⏱" Dución del diseño de la broca envolvida "\n\n` +
      `Nantinya, la acción de chatter en el grupo será bloqueada para *${duration}minutos * * ordenar cada cambio de sholar antes de reabrir la automatización.`
    );
  }

  if (args === "kota") {
    const kotaName = m.args.slice(1).join(" ").trim();
    if (!kotaName) {
      return m.reply(`¡Por favor, también nombre la caja!\`${m.prefix}autosholat kota <nama kota>\`.`);
    }
    await m.react("🔍");
    try {
      const result = await _ourinsholatapijs.searchKota.call(void 0, kotaName);
      if (!result) {
        return m.reply(`Ouch, he estado mirando mi base de datosQ*${kotaName}" No puedo encontrar nada ".`);
      }
      database.setting("autoSholatKota", {
        id: result.id,
        nama: result.lokasi,
      });
      await m.react("📍");
      return m.reply(
        `📍" The Memory Locations are Refurbished! "\n\n` +
        `Un montón de programas controlados por sholar @-@ se recalibran ahora para conformarse con la * región${result.lokasi}**.`
      );
    } catch (e) {
      await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }

  return m.reply(`Las órdenes que entras son inmediatas.\`on\`.\`apagado\`.\`estado\`.\`cerrado\`.\`duración\`, o\`ciudad\`.`);
}

async function runAutoSholat(sock) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  if (!db.setting("autoSholat")) return;
  
  const kotaSetting = db.setting("autoSholatKota") || {
    id: "1301",
    nama: "KOTA JAKARTA",
  };
  
  let times;
  try {
    const jadwalData = await _ourinsholatapijs.getTodaySchedule.call(void 0, kotaSetting.id);
    times = _ourinsholatapijs.extractPrayerTimes.call(void 0, jadwalData);
  } catch (e3) {
    return;
  }
  
  const JADWAL = {
    subuh: times.subuh,
    dzuhur: times.dzuhur,
    ashar: times.ashar,
    maghrib: times.maghrib,
    isya: times.isya,
  };
  
  const timeNow = timeHelper.getCurrentTimeString();
  if (!global.autoSholatLock) global.autoSholatLock = {};
  
  for (const [sholat, waktu] of Object.entries(JADWAL)) {
    if (waktu === "-") continue;
    
    if (timeNow === waktu && !global.autoSholatLock[sholat]) {
      global.autoSholatLock[sholat] = true;
      try {
        global.isFetchingGroups = true;
        const groupsObj = await sock.groupFetchAllParticipating();
        global.isFetchingGroups = false;
        
        const groupList = Object.keys(groupsObj);
        const closeGroup = db.setting("autoSholatCloseGroup") || false;
        const duration = db.setting("autoSholatDuration") || 5;

        for (const jid of groupList) {
          const groupData = _optionalChain([db, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.groups, 'optionalAccess', _11 => _11[jid]]) || {};
          if (groupData.notifSholat === false) continue;
          
          try {
            const caption =
              `🕌* * El anuncio de Time tu Sholat${sholat.toUpperCase()}** 🕌\n\n` +
              `¡Hora de romper el rumbo del mundo!${sholat}* * ha llegado a la región *${kotaSetting.nama}* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *${waktu} WIB**).\n\n` +
              `Vamos a aclarar nuestras mentes, conseguir un poco de agua, y llegar a la llamada santa.🤲\n\n` +
              (closeGroup ? `Como cortesía, el sistema cerrará la charla de este grupo durante un tiempo (en tanto que${duration}minuto)._` : "");
            
            const msgTeks = await sock.sendMessage(jid, {
              text: caption,
            });

            await sock.sendMessage(jid, {
              audio: { url: AUDIO_ADZAN },
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: msgTeks });

            if (closeGroup) {
              await sock.groupSettingUpdate(jid, "announcement");
            }
            await new Promise((res) => setTimeout(res, 500));
          } catch (e) {
            console.log(`Sticky envía mensajes de sholt a grupo${jid}:`, e.message);
          }
        }
        
        if (closeGroup) {
          setTimeout(async () => {
            for (const jid of groupList) {
              try {
                await sock.groupSettingUpdate(jid, "not_announcement");
                await sock.sendMessage(jid, {
                  text: `✅" Time Ending End "\n\n" Sesi ibadah shlat "${sholat}He reabierto la autoética.`,
                });
                await new Promise((res) => setTimeout(res, 600));
              } catch (e) {
                console.log(`Gaglous blabber grupo${jid}:`, e.message);
              }
            }
            console.log(`Terminar reiniciando todo el grupo.`);
          }, duration * 60 * 1000);
        }
        
        console.log(`Penyiaran adzan ${sholat}Con éxito${groupList.length}Un montón de paralelo @-@ como grupos.`);
      } catch (error) {
        global.isFetchingGroups = false;
        console.error("Tengo un fallo en el verdugo:", error.message);
      }
      
      setTimeout(() => {
        delete global.autoSholatLock[sholat];
      }, 2 * 60 * 1000);
    }
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.runAutoSholat = runAutoSholat; exports.AUDIO_ADZAN = AUDIO_ADZAN;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
