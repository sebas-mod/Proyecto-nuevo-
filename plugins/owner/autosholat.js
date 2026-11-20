"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);




var _ourinsholatapijs = require('../../src/lib/ourin-sholat-api.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "autosholat",
  alias: ["sholat", "autoadzan"],
  category: "owner",
  description: "Toggle pengingat waktu sholat otomatis dengan audio adzan dan tutup grup",
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
    const closeGroup = database.setting("autoSholatCloseGroup") ? "Ya ✅" : "Tidak ❌";
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
      jadwalText = "- Gagal memuat jadwal dari MyQuran\n";
    }

    return m.reply(
      `🕌 **Auto Sholat - Sistem Pengingat Waktu Beribadah**\n\n` +
      `Sistem saat ini telah diatur untuk membantu kamu dan para anggota grup mengingat waktu beribadah secara otomatis. Berikut adalah pengaturan yang sedang berjalan:\n\n` +
      `- **Status Pengingat**: ${status}\n` +
      `- **Penutupan Grup Otomatis**: ${closeGroup}\n` +
      `- **Durasi Penutupan**: ${duration} menit\n` +
      `- **Lokasi Pengingat Saat Ini**: ${kotaSetting.nama}\n\n` +
      `**Jadwal Sholat Hari Ini:**\n` +
      jadwalText + `\n` +
      `**Panduan Pengaturan Fitur:**\n` +
      `- Ketik \`${m.prefix}autosholat on\` untuk mengaktifkan sistem pengingat.\n` +
      `- Ketik \`${m.prefix}autosholat off\` untuk mematikan sistem pengingat.\n` +
      `- Ketik \`${m.prefix}autosholat close on\` atau \`off\` untuk menyalakan/mematikan fitur tutup grup otomatis.\n` +
      `- Ketik \`${m.prefix}autosholat duration <angka>\` untuk menentukan berapa lama grup akan ditutup (dalam menit).\n` +
      `- Ketik \`${m.prefix}autosholat kota <nama daerah>\` untuk menyinkronkan waktu sholat dengan daerah yang kamu pilih.\n\n` +
      `_Semua jadwal diambil secara presisi dan langsung dari pusat data MyQuran API._`
    );
  }

  if (args === "on") {
    database.setting("autoSholat", true);
    await m.react("✅");
    const kota = database.setting("autoSholatKota") || { nama: "KOTA JAKARTA" };
    return m.reply(
      `✅ **Sistem Pengingat Sholat Berhasil Diaktifkan!**\n\n` +
      `Mulai sekarang, aku akan mengirimkan pesan pemberitahuan beserta rekaman audio adzan tepat saat waktu sholat tiba. Seluruh informasi disesuaikan dengan zona waktu di **${kota.nama}** ya!`
    );
  }

  if (args === "off") {
    database.setting("autoSholat", false);
    await m.react("❌");
    return m.reply(
      `❌ **Sistem Pengingat Sholat Dinonaktifkan.**\n\n` +
      `Baiklah, aku tidak akan lagi menyiarkan jadwal sholat dan memutarkan audio adzan secara otomatis ke grup-grup.`
    );
  }

  if (args === "close") {
    const subArg = _optionalChain([m, 'access', _5 => _5.args, 'access', _6 => _6[1], 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8()]);
    if (subArg === "on") {
      database.setting("autoSholatCloseGroup", true);
      await m.react("🔒");
      return m.reply(
        `🔒 **Fitur Tutup Grup Otomatis Diaktifkan!**\n\n` +
        `Saat waktu sholat tiba, aku akan secara otomatis menutup akses obrolan grup agar semuanya bisa fokus beribadah terlebih dahulu. Keren, kan?`
      );
    }
    if (subArg === "off") {
      database.setting("autoSholatCloseGroup", false);
      await m.react("🔓");
      return m.reply(
        `🔓 **Fitur Tutup Grup Otomatis Dimatikan.**\n\n` +
        `Sekarang grup tidak akan ditutup saat azan berkumandang, sehingga obrolan bisa terus berjalan tanpa hambatan.`
      );
    }
    return m.reply(`Oh, maaf. Formatnya sedikit keliru. Silakan gunakan \`${m.prefix}autosholat close on\` atau \`${m.prefix}autosholat close off\`.`);
  }

  if (args === "duration") {
    const duration = parseInt(m.args[1]);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return m.reply(`Tolong masukkan angka antara 1 sampai 60 untuk durasi penutupan grup (dalam menit).`);
    }
    database.setting("autoSholatDuration", duration);
    await m.react("⏱️");
    return m.reply(
      `⏱️ **Durasi Penutupan Grup Telah Diperbarui!**\n\n` +
      `Nantinya, akses obrolan di grup akan dikunci selama **${duration} menit** berturut-turut pada setiap jadwal sholat sebelum kubuka kembali secara otomatis.`
    );
  }

  if (args === "kota") {
    const kotaName = m.args.slice(1).join(" ").trim();
    if (!kotaName) {
      return m.reply(`Tolong sebutkan nama kotanya juga! Misalnya, \`${m.prefix}autosholat kota Surabaya\`.`);
    }
    await m.react("🔍");
    try {
      const result = await _ourinsholatapijs.searchKota.call(void 0, kotaName);
      if (!result) {
        return m.reply(`Aduh, aku sudah mencari di database MyQuran tapi nama daerah **${kotaName}** tidak dapat kutemukan. Coba nama kota yang lain?`);
      }
      database.setting("autoSholatKota", {
        id: result.id,
        nama: result.lokasi,
      });
      await m.react("📍");
      return m.reply(
        `📍 **Lokasi Pengingat Berhasil Diperbarui!**\n\n` +
        `Seluruh jadwal sholat sekarang telah dikalibrasi ulang untuk menyesuaikan dengan wilayah **${result.lokasi}**.`
      );
    } catch (e) {
      await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }

  return m.reply(`Perintah yang kamu masukkan kurang tepat. Kamu bisa menggunakan parameter seperti \`on\`, \`off\`, \`status\`, \`close\`, \`duration\`, atau \`kota\`.`);
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
              `🕌 **Pemberitahuan Waktu Sholat ${sholat.toUpperCase()}** 🕌\n\n` +
              `Sudah saatnya mengistirahatkan sejenak urusan duniamu! Waktu untuk menunaikan ibadah sholat **${sholat}** telah tiba untuk wilayah **${kotaSetting.nama}** dan sekitarnya (tepatnya pada pukul **${waktu} WIB**).\n\n` +
              `Mari segarkan pikiran, ambil air wudhu, dan hampiri panggilan suci-Nya. Selamat menunaikan ibadah sholat! 🤲\n\n` +
              (closeGroup ? `_Sebagai bentuk penghormatan, sistem akan menutup obrolan grup ini untuk sementara waktu (selama ${duration} menit)._` : "");
            
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
            console.log(`Gagal mengirim pesan sholat ke grup ${jid}:`, e.message);
          }
        }
        
        if (closeGroup) {
          setTimeout(async () => {
            for (const jid of groupList) {
              try {
                await sock.groupSettingUpdate(jid, "not_announcement");
                await sock.sendMessage(jid, {
                  text: `✅ **Waktu Penutupan Telah Berakhir**\n\nSesi ibadah sholat **${sholat}** telah usai. Obrolan grup sekarang sudah kubuka kembali secara otomatis. Selamat melanjutkan aktivitas kembali!`,
                });
                await new Promise((res) => setTimeout(res, 600));
              } catch (e) {
                console.log(`Gagal membuka obrolan grup ${jid}:`, e.message);
              }
            }
            console.log(`Selesai mereset pembukaan seluruh grup.`);
          }, duration * 60 * 1000);
        }
        
        console.log(`Penyiaran adzan ${sholat} berhasil dilakukan ke ${groupList.length} grup secara paralel.`);
      } catch (error) {
        global.isFetchingGroups = false;
        console.error("Terdapat kesalahan pada eksekutor:", error.message);
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
