"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _child_process = require('child_process');
var _util = require('util');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const execAsync = _util.promisify.call(void 0, _child_process.exec);

const pluginConfig = {
  name: "autoai",
  alias: ["aai"],
  category: "group",
  description:
    "Toggle auto AI response untuk grup dengan pilihan text atau voice",
  usage:
    ".autoai on/off --ourinmode=<character|custom> --logic=<custom instruction> --type=<text|voice> --mode=<onlychat|assistant>",
  example: ".autoai on --ourinmode=furina --type=voice --mode=onlychat",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const characters = {
  furina: {
    name: "Furina",
    instruction:
      "Kamu adalah Furina dari Genshin Impact. Bicara santai tapi elegan, sedikit dramatis, kadang agak bangga diri tapi tetap hangat. Jangan terlalu panjang, jawab langsung ke inti seperti chat biasa. Sesekali boleh nyenggol tema panggung atau laut. Jangan mengaku sebagai AI.",
  },
  zeta: {
    name: "Zeta",
    instruction:
      "Kamu adalah Zeta dari Spy x Family. Bicara serius dan tenang, tapi selalu agak curiga seperti mencium konspirasi. Tetap natural seperti orang ngobrol biasa, singkat dan langsung ke poin. Jangan mengaku sebagai AI.",
  },
  kobo: {
    name: "Kobo Kanaeru",
    instruction:
      "Kamu adalah Kobo Kanaeru. Bicara santai, ceria, agak usil. Gaya chat biasa, tidak terlalu panjang. Boleh sedikit random atau lucu. Jangan berlebihan pakai caps atau emoji. Jangan mengaku sebagai AI.",
  },
  elaina: {
    name: "Elaina",
    instruction:
      "Kamu adalah Elaina. Bicara lembut, tenang, percaya diri, sedikit narsis halus. Jawab singkat, rapi, dan langsung ke inti seperti chat normal. Jangan mengaku sebagai AI.",
  },
  waguri: {
    name: "Waguri",
    instruction:
      "Kamu adalah Waguri. Bicara singkat, agak dingin tapi sebenarnya peduli. Sedikit tsundere, to the point, seperti chat biasa. Jangan mengaku sebagai AI.",
  },
  bell409: {
    name: "Bell409",
    instruction: _optionalChain([_configjs2.default, 'access', _ => _.autoaiPersonas, 'optionalAccess', _2 => _2.Bell409]) || "",
  },
};
async function convertToOggOpus(inputPath) {
  const outputPath = inputPath.replace(/\.[^.]+$/, ".ogg");
  const cmd = `ffmpeg -y -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputPath}"`;

  try {
    await execAsync(cmd, { timeout: 60000 });
    if (_fs2.default.existsSync(outputPath)) {
      return outputPath;
    }
  } catch (e) {
    console.log("[AutoAI] FFmpeg error:", e.message);
  }
  return null;
}

async function handler(m) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const fullArgs = m.fullArgs || "";

  if (!m.isGroup) {
    return m.reply(`❌ Fitur ini hanya untuk grup!`);
  }

  if (!m.isAdmin && !m.isOwner) {
    return m.reply(`❌ Hanya admin yang bisa menggunakan fitur ini!`);
  }

  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_personas) db.db.data.autoai_personas = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  const subcmd = _optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);

  if (subcmd === "tambahpersona") {
    if (!m.isOwner)
      return m.reply(`❌ Hanya owner yang bisa menambah persona!`);
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1])
      return m.reply(
        `❌ Format salah!\n\n> .autoai tambahpersona nama | instruction\n\n> Contoh: .autoai tambahpersona nexa | kamu adalah nexa ai, ...`,
      );
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName])
      return m.reply(
        `❌ Nama "${pName}" sudah dipakai persona bawaan!\n\n> Pilih nama lain`,
      );
    db.db.data.autoai_personas[pName] = {
      name: personaArgs[0],
      instruction: pInstruction,
      createdBy: m.sender,
      createdAt: new Date().toISOString(),
    };
    db.save();
    return m.reply(
      `✅ *Persona ditambahkan*\n\n> Nama: ${personaArgs[0]}\n> Key: ${pName}\n> Logic: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}\n\n> Gunakan: .autoai on --ourinmode=${pName}`,
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner)
      return m.reply(`❌ Hanya owner yang bisa menghapus persona!`);
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey)
      return m.reply(
        `❌ Format salah!\n\n> .autoai hapuspersona <nama>\n\n> Contoh: .autoai hapuspersona nexa`,
      );
    if (!db.db.data.autoai_personas[pKey])
      return m.reply(
        `❌ Persona "${pKey}" tidak ditemukan!\n\n> Ketik .autoai listpersona untuk melihat daftar`,
      );
    delete db.db.data.autoai_personas[pKey];
    db.save();
    return m.reply(`✅ Persona "${pKey}" berhasil dihapus`);
  }

  if (subcmd === "enablecommand" || subcmd === "enablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌ Hanya admin yang bisa mengatur ini!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!_optionalChain([cfg, 'optionalAccess', _6 => _6.enabled])) return m.reply(`❌ AutoAI belum aktif di grup ini!`);
    if (cfg.enableCommands)
      return m.reply(`ℹ️ *Command sudah di-enable*

> User tetap bisa pakai command walau AutoAI aktif`);
    cfg.enableCommands = true;
    db.save();
    return m.reply(
      `✅ *ᴇɴᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅ*

` +
        `> User sekarang bisa menggunakan command walau AutoAI aktif
` +
        `> Bot tetap merespon saat di-tag/reply

` +
        `_Gunakan ${m.prefix}autoai disablecommand untuk menonaktifkan_`,
    );
  }

  if (subcmd === "disablecommand" || subcmd === "disablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌ Hanya admin yang bisa mengatur ini!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!_optionalChain([cfg, 'optionalAccess', _7 => _7.enabled])) return m.reply(`❌ AutoAI belum aktif di grup ini!`);
    if (!cfg.enableCommands)
      return m.reply(`ℹ️ *Command sudah di-disable*

> Semua command (kecuali owner) diblokir saat AutoAI aktif`);
    cfg.enableCommands = false;
    db.save();
    return m.reply(
      `🔒 *ᴅɪsᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅ*

` +
        `> Semua command (kecuali owner) diblokir saat AutoAI aktif
` +
        `> Bot hanya merespon saat di-tag atau di-reply

` +
        `_Gunakan ${m.prefix}autoai enablecommand untuk mengaktifkan kembali_`,
    );
  }

  if (subcmd === "listpersona") {
    const builtIn = Object.entries(characters)
      .map(([k, v]) => `  ▸ ${k} - ${v.name}`)
      .join("\n");
    const customEntries = Object.entries(db.db.data.autoai_personas);
    const custom = customEntries.length
      ? customEntries
          .map(
            ([k, v]) =>
              `  ▸ ${k} - ${v.name} (${v.instruction.substring(0, 40)}${v.instruction.length > 40 ? "..." : ""})`,
          )
          .join("\n")
      : "  ▸ (belum ada custom persona)";
    let txt = `🤖 *ᴅᴀғᴛᴀʀ ᴘᴇʀsᴏɴᴀ*\n\n`;
    txt += `*Bawaan:*\n${builtIn}\n\n`;
    txt += `*Custom:*\n${custom}\n\n`;
    txt += `*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}\n\n`;
    txt += `> .autoai on --ourinmode=<key>\n`;
    txt += `> .autoai tambahpersona nama | logic\n`;
    txt += `> .autoai hapuspersona nama\n`;
    txt += `> .autoai global on/off`;
    return m.reply(txt);
  }

  if (subcmd === "global") {
    if (!m.isOwner) return m.reply(`❌ Hanya owner yang bisa toggle global!`);
    const globalMode = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalMode))
      return m.reply(
        `❌ Format salah!\n\n> .autoai global on/off\n\n> Global saat ini: ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}`,
      );
    if (globalMode === "on") {
      const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
      const typeMatch = fullArgs.match(/--type=(text|voice)/i);
      const aimodeMatch = fullArgs.match(/--mode=(onlychat|assistant)/i);
      const logicMatch = fullArgs.match(
        /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic|mode)|$)/i,
      );
      const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
      const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
      const aiMode = aimodeMatch ? aimodeMatch[1].toLowerCase() : "assistant";
      const customLogic = logicMatch ? logicMatch[1].trim() : null;

      let instruction = "";
      let characterName = "Global";
      let character = "global";

      if (charKey === "custom" && customLogic) {
        instruction = customLogic;
        character = "custom";
        characterName = "Custom";
      } else if (charKey && characters[charKey]) {
        instruction = characters[charKey].instruction;
        character = charKey;
        characterName = characters[charKey].name;
      } else if (charKey && db.db.data.autoai_personas[charKey]) {
        instruction = db.db.data.autoai_personas[charKey].instruction;
        character = charKey;
        characterName = db.db.data.autoai_personas[charKey].name;
      } else if (!charKey) {
        const existingGlobal = db.db.data.autoai_global;
        if (existingGlobal.instruction) {
          instruction = existingGlobal.instruction;
          character = existingGlobal.character || "global";
          characterName = existingGlobal.characterName || "Global";
        } else {
          return m.reply(
            `❌ Belum ada persona global yang diset!\n\n> .autoai global on --ourinmode=furina\n> .autoai global on --ourinmode=custom --logic=...`,
          );
        }
      } else {
        const charList = [
          ...Object.keys(characters),
          ...Object.keys(db.db.data.autoai_personas),
          "custom",
        ].join(", ");
        return m.reply(`❌ Karakter tidak valid!\n\n> Tersedia: ${charList}`);
      }

      db.db.data.autoai_global = {
        enabled: true,
        character,
        characterName,
        instruction,
        responseType,
        mode: aiMode,
      };
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n` +
          `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
          `┃ 🎭 Karakter: *${characterName}*\n` +
          `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> ℹ️ AutoAI aktif di seluruh grup\n` +
          `> ℹ️ Grup yang sudah punya config tetap pakai config sendiri\n` +
          `> ℹ️ Ketik *.autoai global off* untuk menonaktifkan`,
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      return m.reply(
        `🌐 *ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*\n\n> AutoAI hanya aktif di grup yang sudah di-set`,
      );
    }
  }

  const mode = subcmd;
  const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i);
  const typeMatch = fullArgs.match(/--type=(text|voice)/i);
  const aimodeMatch = fullArgs.match(/--mode=(onlychat|assistant)/i);
  const logicMatch = fullArgs.match(
    /--logic=(.+?)(?=\s+--(?:ourinmode|type|logic|mode)|$)/i,
  );
  const charKey = modeMatch ? modeMatch[1].toLowerCase() : null;
  const responseType = typeMatch ? typeMatch[1].toLowerCase() : "text";
  const aiMode = aimodeMatch ? aimodeMatch[1].toLowerCase() : "assistant";
  const customLogic = logicMatch ? logicMatch[1].trim() : null;

  if (!mode || !["on", "off"].includes(mode)) {
    const charList = Object.entries(characters)
      .map(([key, val]) => `> ${key} - ${val.name}`)
      .join("\n");
    const customP = Object.entries(db.db.data.autoai_personas);
    const customList = customP.length
      ? customP.map(([k, v]) => `> ${k} - ${v.name} (custom)`).join("\n")
      : "";
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ*\n\n`;
    txt += `> Mengaktifkan/menonaktifkan auto AI response\n\n`;
    txt += `*Penggunaan:*\n`;
    txt += `> .autoai on --ourinmode=<karakter|custom> --type=<text|voice> --mode=<onlychat|assistant>\n`;
    txt += `> .autoai off\n`;
    txt += `> .autoai tambahpersona nama | logic\n`;
    txt += `> .autoai hapuspersona nama\n`;
    txt += `> .autoai listpersona\n`;
    txt += `> .autoai global on/off\n`;
    txt += `> .autoai enablecommand / disablecommand\n\n`;
    txt += `*Karakter bawaan:*\n${charList}\n`;
    if (customList) txt += `\n*Karakter custom:*\n${customList}\n`;
    txt += `\n*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}\n\n`;
    txt += `*Response Type:*\n`;
    txt += `> text - Reply dengan text biasa\n`;
    txt += `> voice - Reply dengan voice note (TTS)\n\n`;
    txt += `*Mode AutoAI:*\n`;
    txt += `> assistant - Bot bisa jalankan aksi (buka tutup grup, kick, rich message)\n`;
    txt += `> onlychat - Bot hanya murni chat santai biasa\n\n`;
    txt += `*Contoh:*\n`;
    txt += `> .autoai on --ourinmode=furina --type=text\n`;
    txt += `> .autoai on --ourinmode=custom --logic=kamu adalah nexa ai\n`;
    txt += `> .autoai tambahpersona nexa | kamu adalah nexa ai\n`;
    txt += `> .autoai global on --ourinmode=furina`;
    return m.reply(txt);
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    const globalStatus = _optionalChain([db, 'access', _8 => _8.db, 'access', _9 => _9.data, 'access', _10 => _10.autoai_global, 'optionalAccess', _11 => _11.enabled])
      ? `\n\n> ℹ️ Global masih aktif, tapi grup ini opted-out\n> ℹ️ Ketik *.autoai global off* untuk matikan global`
      : "";
    return m.reply(
      `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪɴᴏɴᴀᴋᴛɪғᴋᴀɴ*\n\n> Auto AI untuk grup ini telah dimatikan\n> Semua command kembali aktif${globalStatus}`,
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ Karakter tidak valid!\n\n> Karakter tersedia: ${charList}\n\n> Contoh: .autoai on --ourinmode=furina --type=voice\n> Custom: .autoai on --ourinmode=custom --logic=kamu adalah nexa ai`,
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `❌ Mode custom membutuhkan --logic!\n\n> Contoh: .autoai on --ourinmode=custom --logic=kamu adalah nexa ai, ...`,
      );
    }
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: "custom",
      characterName: "Custom",
      instruction: customLogic,
      responseType: responseType,
      mode: aiMode,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Karakter: *Custom*\n`;
    txt += `┃ 🧠 Logic: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤 Diaktifkan: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Semua command (kecuali owner) dinonaktifkan\n`;
    txt += `> ℹ️ Bot respond ketika di-reply atau di-tag\n`;
    txt +=
      responseType === "voice" ? `> ℹ️ Response dalam bentuk voice note\n` : "";
    txt += `> ℹ️ Ketik *.autoai off* untuk menonaktifkan`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  const customPersona = db.db.data.autoai_personas[charKey];
  if (customPersona) {
    db.db.data.autoai[m.chat] = {
      enabled: true,
      character: charKey,
      characterName: customPersona.name,
      instruction: customPersona.instruction,
      responseType: responseType,
      mode: aiMode,
      enableCommands: false,
      sessions: {},
      activatedBy: m.sender,
      activatedAt: new Date().toISOString(),
    };
    db.save();
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
    txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
    txt += `┃ 🎭 Karakter: *${customPersona.name}* (custom)\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤 Diaktifkan: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `> ℹ️ Semua command (kecuali owner) dinonaktifkan\n`;
    txt += `> ℹ️ Bot respond ketika di-reply atau di-tag\n`;
    txt +=
      responseType === "voice" ? `> ℹ️ Response dalam bentuk voice note\n` : "";
    txt += `> ℹ️ Ketik *.autoai off* untuk menonaktifkan`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌ Karakter tidak valid!\n\n> Karakter tersedia: ${charList}\n\n> Contoh: .autoai on --ourinmode=furina --type=voice`,
    );
  }

  db.db.data.autoai[m.chat] = {
    enabled: true,
    character: charKey,
    characterName: characters[charKey].name,
    instruction: characters[charKey].instruction,
    responseType: responseType,
    mode: aiMode,
    enableCommands: false,
    sessions: {},
    activatedBy: m.sender,
    activatedAt: new Date().toISOString(),
  };
  db.save();

  let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅɪᴀᴋᴛɪғᴋᴀɴ*\n\n`;
  txt += `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n`;
  txt += `┃ 🎭 Karakter: *${characters[charKey].name}*\n`;
  txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
  txt += `┃ 👤 Diaktifkan: @${m.sender.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `> ℹ️ Semua command (kecuali owner) dinonaktifkan\n`;
  txt += `> ℹ️ Bot respond ketika di-reply atau di-tag\n`;
  txt +=
    responseType === "voice" ? `> ℹ️ Response dalam bentuk voice note\n` : "";
  txt += `> ℹ️ Ketik *.autoai off* untuk menonaktifkan`;

  await m.reply(txt, { mentions: [m.sender] });
}

async function generateVoiceResponse(text, sock, chatId, quotedMsg) {
  const tempDir = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tempDir)) {
    _fs2.default.mkdirSync(tempDir, { recursive: true });
  }

  try {
    const mp3Path = _path2.default.join(tempDir, `tts_${Date.now()}.mp3`);
    
    const apiUrl = `https://firefly.maiku.my.id/api/crikk?apikey=${_configjs2.default.APIkey.firefly}&text=${encodeURIComponent(text)}&voice=id-ID-ArdiNeural`;
    const response = await _axios2.default.get(apiUrl);
    
    if (!_optionalChain([response, 'access', _12 => _12.data, 'optionalAccess', _13 => _13.status]) || !_optionalChain([response, 'access', _14 => _14.data, 'optionalAccess', _15 => _15.data, 'optionalAccess', _16 => _16.audio])) {
      throw new Error("Gagal generate audio dari API Firefly");
    }
    
    const audioRes = await _axios2.default.get(response.data.data.audio, {
      responseType: "arraybuffer",
      timeout: 30000
    });
    
    _fs2.default.writeFileSync(mp3Path, Buffer.from(audioRes.data));

    const oggPath = await convertToOggOpus(mp3Path);

    if (oggPath && _fs2.default.existsSync(oggPath)) {
      const audioBuffer = _fs2.default.readFileSync(oggPath);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/ogg; codecs=opus",
          ptt: true,
        },
        { quoted: quotedMsg },
      );

      _fs2.default.unlinkSync(mp3Path);
      _fs2.default.unlinkSync(oggPath);

      return true;
    } else {
      const audioBuffer = _fs2.default.readFileSync(mp3Path);

      await sock.sendMessage(
        chatId,
        {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          ptt: true,
        },
        { quoted: quotedMsg },
      );

      _fs2.default.unlinkSync(mp3Path);

      return true;
    }
  } catch (e) {
    console.log("[AutoAI Voice] Error:", e.message);
    return false;
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.characters = characters; exports.generateVoiceResponse = generateVoiceResponse;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
