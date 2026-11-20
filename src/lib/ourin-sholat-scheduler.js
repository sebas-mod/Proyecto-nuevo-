"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('./ourin-database.js');
var _ourinloggerjs = require('./ourin-logger.js');
var _cron = require('cron');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourintimejs = require('./ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourincontextjs = require('./ourin-context.js');
var _ourinsholatapijs = require('./ourin-sholat-api.js');

const TZ = "Asia/Jakarta";

const SHOLAT_MESSAGES = {
  imsak:
    "🌙*Tiempo IMSAK*\n\n\" Hola, querida, ha llegado el momento. \"\nPara Pronto comer antes de que termine la hora.",
  subuh:
    "🌅*Tiempo Madrugada*\n\n\" Hi Brother, the time of Sholat Subush has come. \"\nDisfruta del wudhu y pronto.",
  terbit:
    "☀# El tiempo está cayendo #\n\nMathaari ha sido mordido.\n¡Feliz vida hoy!",
  dhuha:
    "🌤 DHUHA TIEMPO •\n\n\" Hi Brother, the time of Sholat Dhuha has come. \"\nNo olvides el shalaut Dhuha 2 8 Raakat.",
  dzuhur:
    "🌞*Tiempo DZUHUR*\n\n\" Hi Brother, the time of Sholat Dhuhur has come \".\nDisfruta del wudhu y pronto.",
  ashar:
    "🌇*Tiempo ASHAR*\n\n\" Hi brother, the time of Sholat Ashar 's arrival \".\nDisfruta del wudhu y pronto.",
  maghrib:
    "🌆*Tiempo MAGHRIB*\n\n\" Hi Brother, the time of Sholat Maghrib has come. \"\nDisfruta del wudhu y pronto.",
  isya: "🌙*Tiempo ISYA*\n\n\" Hi Brother, the time of Sholat Isya has come. \"\nDisfruta del wudhu y pronto.",
};

const GAMBAR_SUASANA = {
  imsak: "https://cdn.gimita.id/download/images_1769502277606_04d594fe.jfif",
  subuh: "https://cdn.gimita.id/download/images_1769502277606_04d594fe.jfif",
  terbit: "https://cdn.gimita.id/download/images_1769502277606_04d594fe.jfif",
  dhuha: "https://cdn.gimita.id/download/images_1769502277606_04d594fe.jfif",
  dzuhur:
    "https://cdn.gimita.id/download/qf2d6868_sheikh-zayed-grand-mosque_625x300_04_March_25_1769502237718_92212561.webp",
  ashar:
    "https://cdn.gimita.id/download/18537d69-a2e0-4dc2-a144-57dde0f359b5_1769502389063_5c004902.jpg",
  maghrib:
    "https://cdn.gimita.id/download/mosque-5950407_1280_1769502206553_660ae15c.webp",
  isya: "https://cdn.gimita.id/download/pngtree-nighttime-mosque-illustration-with-realistic-details-celebrating-ramadan-kareem-mubarak-image_3814083_1769502091988_e4cf3326.jpg",
};

const AUDIO_ADZAN = "https://files.catbox.moe/z2bj5s.mp3";

let sock = null;
let cachedSchedule = null;
let cacheDate = "";
const sholatCronJobs = new Map();
let dailyRefreshJob = null;

function getTodayDateString() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

async function loadTodaySchedule() {
  const todayStr = getTodayDateString();
  if (cachedSchedule && cacheDate === todayStr) return cachedSchedule;

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const kotaSetting = db.setting("autoSholatKota") || {
    id: "1301",
    nama: "KOTA JAKARTA",
  };

  try {
    const jadwalData = await _ourinsholatapijs.getTodaySchedule.call(void 0, kotaSetting.id);
    const schedule = _ourinsholatapijs.extractPrayerTimes.call(void 0, jadwalData);
    const daerah = jadwalData.daerah || "DKI JAKARTA";
    
    let cityTz = "Asia/Jakarta";
    const d = daerah.toUpperCase();
    if (d.includes("SULAWESI") || d.includes("BALI") || d.includes("NUSA TENGGARA") || d.includes("KALIMANTAN SELATAN") || d.includes("KALIMANTAN TIMUR") || d.includes("KALIMANTAN UTARA")) {
      cityTz = "Asia/Makassar";
    } else if (d.includes("MALUKU") || d.includes("PAPUA")) {
      cityTz = "Asia/Jayapura";
    }

    cachedSchedule = { schedule, cityTz };
    cacheDate = todayStr;
    return cachedSchedule;
  } catch (e) {
    _ourinloggerjs.logger.error("SholatScheduler", `Salto de la parrilla:${e.message}`);
    return null;
  }
}

function clearSholatCronJobs() {
  for (const [, job] of sholatCronJobs) job.stop();
  sholatCronJobs.clear();
}

async function schedulePrayerTimes() {
  clearSholatCronJobs();

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const globalEnabled = db.setting("autoSholat");
  if (!globalEnabled) return;

  const data = await loadTodaySchedule();
  if (!data) return;

  const { schedule, cityTz } = data;

  for (const [sholat, waktu] of Object.entries(schedule)) {
    if (waktu === "-") continue;

    const [hour, minute] = waktu.split(":").map(Number);
    const cronExpr = `${minute} ${hour} * * *`;

    const job = new (0, _cron.CronJob)(
      cronExpr,
      async () => {
        await sendSholatNotifications(sholat, waktu);
      },
      null,
      true,
      cityTz,
    );

    sholatCronJobs.set(sholat, job);
  }

  _ourinloggerjs.logger.info(
    "SholatScheduler",
    `Scheduled ${sholatCronJobs.size} prayer times (Timezone: ${cityTz})`,
  );
}

async function sendSholatNotifications(sholat, waktu) {
  try {
    const db = _ourindatabasejs.getDatabase.call(void 0, );

    const closeGroup = db.setting("autoSholatCloseGroup") || false;
    const duration = db.setting("autoSholatDuration") || 5;
    const sendAudio = db.setting("autoSholatAudio") !== false;
    const kotaSetting = db.setting("autoSholatKota") || {
      nama: "KOTA JAKARTA",
    };

    const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";

    let groupList = [];
    try {
      const groupsObj = await sock.groupFetchAllParticipating();
      groupList = Object.keys(groupsObj);
    } catch (e) {
      _ourinloggerjs.logger.error("SholatScheduler", `Failed to fetch groups: ${e.message}`);
      return;
    }

    if (groupList.length === 0) return;

    let sentCount = 0;
    const closedGroups = [];
    const isSholatTime = [
      "subuh",
      "dzuhur",
      "ashar",
      "maghrib",
      "isya",
    ].includes(sholat);

    let message = `${SHOLAT_MESSAGES[sholat] || `🕌 *HORA DE ${sholat.toUpperCase()}*`}\n\n⏰ *${waktu} WIB*\n📍 *${kotaSetting.nama}*`;

    if (closeGroup && isSholatTime) {
      message += `\n\n•🔒 Grupo cerrado •${duration}minutos para mostrar _`;
    }

    for (const groupId of groupList) {
      const groupData = _optionalChain([db, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.groups, 'optionalAccess', _9 => _9[groupId]]) || {};
      if (groupData.notifSholat === false) continue;

      try {
        if (sendAudio && isSholatTime) {
          try {
            await sock.sendMessage(groupId, {
              audio: { url: AUDIO_ADZAN },
              mimetype: "audio/mpeg",
              ptt: false,
              contextInfo: {
                ..._ourincontextjs.saluranCtx.call(void 0, ),
                forwardedNewsletterMessageInfo: {
                  newsletterJid: saluranId,
                  newsletterName: saluranName,
                  serverMessageId: 127,
                },
              },
            });
          } catch (audioErr) {
            _ourinloggerjs.logger.error("SholatScheduler", `Failed to send audio to ${groupId}: ${audioErr.message}`);
          }
        }

        await sock.sendMessage(groupId, {
          text: message,
          contextInfo: {
            ..._ourincontextjs.saluranCtx.call(void 0, ),
            forwardedNewsletterMessageInfo: {
              newsletterJid: saluranId,
              newsletterName: saluranName,
              serverMessageId: 127,
            },
          },
        });

        if (closeGroup && isSholatTime) {
          try {
            await sock.groupSettingUpdate(groupId, "announcement");
            closedGroups.push(groupId);
          } catch (e) {
            _ourinloggerjs.logger.error(
              "SholatScheduler",
              `Failed to close ${groupId}: ${e.message}`,
            );
          }
        }

        sentCount++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        _ourinloggerjs.logger.error(
          "SholatScheduler",
          `Failed to send to ${groupId}: ${err.message}`,
        );
      }
    }

    if (closeGroup && closedGroups.length > 0) {
      setTimeout(
        async () => {
          for (const groupId of closedGroups) {
            try {
              await sock.groupSettingUpdate(groupId, "not_announcement");
              await sock.sendMessage(groupId, {
                text: `✅Grup fue reabierto después de la sholat${sholat}.\n\nRecibimos nuestro Ojalá Sholat.🤲`,
                contextInfo: {
                  forwardingScore: 9999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
              });
              await new Promise((r) => setTimeout(r, 600));
            } catch (e) {
              _ourinloggerjs.logger.error(
                "SholatScheduler",
                `Failed to open ${groupId}: ${e.message}`,
              );
            }
          }
          _ourinloggerjs.logger.info(
            "SholatScheduler",
            `Opened ${closedGroups.length} groups after ${sholat}`,
          );
        },
        duration * 60 * 1000,
      );
    }

    if (sentCount > 0) {
      _ourinloggerjs.logger.info(
        "SholatScheduler",
        `Sent ${sholat} notification to ${sentCount} groups` +
          (closedGroups.length > 0 ? ` (${closedGroups.length} closed)` : ""),
      );
    }
  } catch (error) {
    _ourinloggerjs.logger.error("SholatScheduler", `Error: ${error.message}`);
  }
}

function initSholatScheduler(socketInstance) {
  sock = socketInstance;

  if (dailyRefreshJob) dailyRefreshJob.stop();

  dailyRefreshJob = new (0, _cron.CronJob)(
    "1 0 * * *",
    async () => {
      cachedSchedule = null;
      await schedulePrayerTimes();
    },
    null,
    true,
    TZ,
  );

  schedulePrayerTimes();
  _ourinloggerjs.logger.info(
    "SholatScheduler",
    "Programar el tiempo de la autodenominación por primera vez. Sí, mi jefe.",
  );
}

function stopSholatScheduler() {
  clearSholatCronJobs();
  if (dailyRefreshJob) {
    dailyRefreshJob.stop();
    dailyRefreshJob = null;
  }
  _ourinloggerjs.logger.info("SholatScheduler", "Programar una fecha de retraso para el retraso de la ya");
}







exports.initSholatScheduler = initSholatScheduler; exports.stopSholatScheduler = stopSholatScheduler; exports.SHOLAT_MESSAGES = SHOLAT_MESSAGES; exports.GAMBAR_SUASANA = GAMBAR_SUASANA; exports.AUDIO_ADZAN = AUDIO_ADZAN;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}
