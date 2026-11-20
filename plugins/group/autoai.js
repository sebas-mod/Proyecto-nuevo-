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
    "Toggle auto AI se abstiene de grupo con te selecciónx# O voz",
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
      "You 're Furina from Genshin Impact, speak of a relaxed but elegant, a little dramatic, proud but still warm, don 't be too long, lil @-@ limber to the core like a chat, and sometimes you can hit a straight or a stray theme.",
  },
  zeta: {
    name: "Zeta",
    instruction:
      "Usted es el Zeta de Spy.xFamilia, hablar serius y calma, pero siempre una cosa curiosa como grande una conspiración, pero la naturaleza es como un chattering común, corto y delgado hasta el punto.",
  },
  kobo: {
    name: "Kobo Kanaeru",
    instruction:
      "Usted es Kobo Kanaeru, hablar de relatii, cerea, estilo nariz, chats regulares, charla pequeña o diversión, don 't overreact with the capes or the emojis, don 't say it like the AI.",
  },
  elaina: {
    name: "Elaina",
    instruction:
      "You 're Ekona, talk softly, calm, confident, a little bit of a sutil narcissism, a short face, rapi, and langali to the core like a normal chat.",
  },
  waguri: {
    name: "Waguri",
    instruction:
      "You 're a waguri, you 're talking about a shorty, you 're getting cold, but you actually care, a little bit of a sundere, to the point, like a regular chat.",
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
    return m.reply(`❌¡¡Está característica es para grupo!`);
  }

  if (!m.isAdmin && !m.isOwner) {
    return m.reply(`❌¡Sólo el administrador puede usar está característica!`);
  }

  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_personas) db.db.data.autoai_personas = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  const subcmd = _optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);

  if (subcmd === "tambahpersona") {
    if (!m.isOwner)
      return m.reply(`❌¡Sólo el propietario puede añadir a su persona!`);
    const personaArgs = fullArgs
      .replace(/^tambahpersona\s*/i, "")
      .split("|")
      .map((s) => s.trim());
    if (personaArgs.length < 2 || !personaArgs[0] || !personaArgs[1])
      return m.reply(
        `❌Formato incorrecto!\n\n*Sí. * * Auto @-@ ai add up*\n\n> 91; Hombre > 93;:x¡Te odio!xai,..`,
      );
    const pName = personaArgs[0].toLowerCase().replace(/\s+/g, "_");
    const pInstruction = personaArgs.slice(1).join("|").trim();
    if (characters[pName])
      return m.reply(
        `❌Nombre "${pName}¡Llevo a mi persona!\n\nElija otro nombre`,
      );
    db.db.data.autoai_personas[pName] = {
      name: personaArgs[0],
      instruction: pInstruction,
      createdBy: m.sender,
      createdAt: new Date().toISOString(),
    };
    db.save();
    return m.reply(
      `✅*Persona anadido*\n\n> Nombre:${personaArgs[0]}\n> Key: ${pName}\n> Logic: ${pInstruction.substring(0, 80)}${pInstruction.length > 80 ? "..." : ""}\n\nGunwill: autoai on - - - ourinmode =${pName}`,
    );
  }

  if (subcmd === "hapuspersona") {
    if (!m.isOwner)
      return m.reply(`❌¡Sólo el propietario puede memorizar persona!`);
    const pKey = (args[1] || "").toLowerCase().trim();
    if (!pKey)
      return m.reply(
        `❌Formato incorrecto!\n\nAutoai eliminar persona.<nama>\n\n> 91; Hombre > > 91; Hombre > 93; Deshazte de eso.xa`,
      );
    if (!db.db.data.autoai_personas[pKey])
      return m.reply(
        `❌ Persona "${pKey}¡La fiesta descubierta!\n\nEscoge para ver la lista`,
      );
    delete db.db.data.autoai_personas[pKey];
    db.save();
    return m.reply(`✅ Persona "${pKey}♪ Trabajar mi camino a través ♪`);
  }

  if (subcmd === "enablecommand" || subcmd === "enablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌¡Sólo el administrador puede manejar esto!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!_optionalChain([cfg, 'optionalAccess', _6 => _6.enabled])) return m.reply(`❌AutoAI no está activo en este grupo!`);
    if (cfg.enableCommands)
      return m.reply(`- El comando está en - habilitar

Para usar un comentario AutoAI de todos modos`);
    cfg.enableCommands = true;
    db.save();
    return m.reply(
      `✅ *ᴇɴᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅ*

` +
        `Ez Usuario ahora puede utilizar el comando autoAI wawau activo
` +
        `* Sigue respondiendo cuando está en -tag / respuesta*

` +
        `*Usarlo*${m.prefix}autoai deshabilitado para desactivar _`,
    );
  }

  if (subcmd === "disablecommand" || subcmd === "disablecmd") {
    if (!m.isAdmin && !m.isOwner)
      return m.reply(`❌¡Sólo el administrador puede manejar esto!`);
    const cfg = db.db.data.autoai[m.chat];
    if (!_optionalChain([cfg, 'optionalAccess', _7 => _7.enabled])) return m.reply(`❌AutoAI no está activo en este grupo!`);
    if (!cfg.enableCommands)
      return m.reply(`El comando ya está en - Desactivar

Todos los comandos (excepto el propietario ) están bloqueados cuando AutoAI está activo`);
    cfg.enableCommands = false;
    db.save();
    return m.reply(
      `🔒 *ᴅɪsᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅ*

` +
        `Todos los comandos (excepto el propietario ) están bloqueados cuando AutoAI está activo
` +
        `*Solo responde cuando te etiquetan o responden*

` +
        `*Usarlo*${m.prefix}autoai habilitado para reactivar _`,
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
      : "  ▸(sin persona personalizada )";
    let txt = `🤖 *ᴅᴀғᴛᴀʀ ᴘᴇʀsᴏɴᴀ*\n\n`;
    txt += `*Predeterminado:*\n${builtIn}\n\n`;
    txt += `*Custom:*\n${custom}\n\n`;
    txt += `*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}\n\n`;
    txt += `> .autoai on --ourinmode=<key>\n`;
    txt += `> 91; Hombre > > 91; Hombre > 93; Sí.\n`;
    txt += `> .autoai hapuspersona nama\n`;
    txt += `> .autoai global on/off`;
    return m.reply(txt);
  }

  if (subcmd === "global") {
    if (!m.isOwner) return m.reply(`❌¡Sólo el propietario puede cambiar de opinión!`);
    const globalMode = (args[1] || "").toLowerCase();
    if (!["on", "off"].includes(globalMode))
      return m.reply(
        `❌Formato incorrecto!\n\nSí. Autoai global en / off\n\n" Global current:${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}`,
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
            `❌Aún no, tenemos un personaje global que está enganchado!\n\n- Autoai global on\nAutoai global en.`,
          );
        }
      } else {
        const charList = [
          ...Object.keys(characters),
          ...Object.keys(db.db.data.autoai_personas),
          "custom",
        ].join(", ");
        return m.reply(`❌¡El personaje no es válido!\n\n> Disponible:${charList}`);
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
          `┃ 🎭Caracter: *${characterName}*\n` +
          `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `AutoAI activo en todo el grupo\n` +
          `*Grupo que ya tiene un config* *sigue usando tu propio config*\n` +
          `Para apagarlo.`,
      );
    } else {
      db.db.data.autoai_global.enabled = false;
      db.save();
      return m.reply(
        `🌐*ᴀᴜᴛᴏ ᴀɪ ɢʟᴏʙᴀʟ ᴅɪɴᴏɴᴀᴋᴛɪ♪ᴋᴀɴ*\n\nAKUAI sólo está activo en el set @ - @ up grupo`,
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
    txt += `> Activando/desactivando auto AI response\n\n`;
    txt += `*Uso:*\n`;
    txt += `> .autoai on --ourinmode=<karakter|custom> --type=<text|voice> --mode=<onlychat|assistant>\n`;
    txt += `> .autoai off\n`;
    txt += `> 91; Hombre > > 91; Hombre > 93; Sí.\n`;
    txt += `> .autoai hapuspersona nama\n`;
    txt += `> .autoai listpersona\n`;
    txt += `> .autoai global on/off\n`;
    txt += `> .autoai enablecommand / disablecommand\n\n`;
    txt += `*Caracter predeterminado:*\n${charList}\n`;
    if (customList) txt += `\n*Caracter custom:*\n${customList}\n`;
    txt += `\n*Global:* ${db.db.data.autoai_global.enabled ? "✅ Aktif" : "❌ Nonaktif"}\n\n`;
    txt += `*Response Type:*\n`;
    txt += `# Y voy a estar de vuelta #x- Responder con texordinario\n`;
    txt += `* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n\n`;
    txt += `*Mode AutoAI:*\n`;
    txt += `- *No puedo caminar la acción* *el cinturón* *el cinturón* *el cinturón*\n`;
    txt += `♪Sólo un chat normal♪\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> .autoai on --ourinmode=furina --type=text\n`;
    txt += `- Eres un maldito ne.xA\n`;
    txt += `Dios mío.x¡Te odio!xA\n`;
    txt += `> .autoai global on --ourinmode=furina`;
    return m.reply(txt);
  }

  if (mode === "off") {
    db.db.data.autoai[m.chat] = { enabled: false };
    db.save();
    const globalStatus = _optionalChain([db, 'access', _8 => _8.db, 'access', _9 => _9.data, 'access', _10 => _10.autoai_global, 'optionalAccess', _11 => _11.enabled])
      ? `\n\n* Global sigue activo, pero este grupo optó... fuera\n# Vete al infierno # # ve al rizo #`
      : "";
    return m.reply(
      `🤖*ᴀᴜᴛᴏ ᴀɪ ᴅɪɴᴏɴᴀᴋᴛɪ♪ᴋᴀɴ*\n\nEl grupo ha sido jugado\nTodo el comando está de vuelta en.${globalStatus}`,
    );
  }

  if (!charKey) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌¡El personaje no es válido!\n\n*El amor solitario*${charList}\n\n- &#91; Hombre &#93; &#91; Hombre &#93; &#91; Hombre &#93; Hombre:\n- Eres un ne.xA`,
    );
  }

  if (charKey === "custom") {
    if (!customLogic) {
      return m.reply(
        `❌El modo personalizado necesita... - Logic!\n\n- Eres un ne.xai,..`,
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
    txt += `┃ 🎭Caracter: *Custom*\n`;
    txt += `┃ 🧠 Logic: ${customLogic.substring(0, 100)}${customLogic.length > 100 ? "..." : ""}\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤Activado: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `* Todos los comandos (excepto el propietario) deshabilitados\n`;
    txt += `* Resed when on - responder or - tag\n`;
    txt +=
      responseType === "voice" ? `Disfruta en la necesidad de una nota\n` : "";
    txt += `Para apagarlo.`;
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
    txt += `┃ 🎭Caracter: *${customPersona.name}* (custom)\n`;
    txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
    txt += `┃ 👤Activado: @${m.sender.split("@")[0]}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    txt += `* Todos los comandos (excepto el propietario) deshabilitados\n`;
    txt += `* Resed when on - responder or - tag\n`;
    txt +=
      responseType === "voice" ? `Disfruta en la necesidad de una nota\n` : "";
    txt += `Para apagarlo.`;
    return m.reply(txt, { mentions: [m.sender] });
  }

  if (!characters[charKey]) {
    const charList = [
      ...Object.keys(characters),
      ...Object.keys(db.db.data.autoai_personas),
      "custom",
    ].join(", ");
    return m.reply(
      `❌¡El personaje no es válido!\n\n*El amor solitario*${charList}\n\n> Ejemplo:.autoai on --ourinmode=furina --type=voice`,
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
  txt += `┃ 🎭Caracter: *${characters[charKey].name}*\n`;
  txt += `┃ 📢 Response: *${responseType === "voice" ? "🎤 Voice Note" : "💬 Text"}*\n`;
  txt += `┃ 👤Activado: @${m.sender.split("@")[0]}\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `* Todos los comandos (excepto el propietario) deshabilitados\n`;
  txt += `* Resed when on - responder or - tag\n`;
  txt +=
    responseType === "voice" ? `Disfruta en la necesidad de una nota\n` : "";
  txt += `Para apagarlo.`;

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
      throw new Error("Peleas audio general de API Firefly");
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
