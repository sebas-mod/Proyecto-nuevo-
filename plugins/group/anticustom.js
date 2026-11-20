"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "anticustom",
  alias: ["antiaddcustom", "customanti"],
  category: "group",
  description: "Bikin AntiCustom lewat sesi tanya jawab per langkah",
  usage: ".anticustom <on/off/list/add/del/metode/cancel>",
  example: ".anticustom",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

if (!global.anticustomSessions) global.anticustomSessions = new Map();

const SESSION_TIMEOUT = 10 * 60 * 1000;

function normalizeRules(rules) {
  return Array.isArray(rules)
    ? rules.filter((rule) => rule && rule.pattern)
    : [];
}

function formatRule(rule, index) {
  const type = rule.type === "regex" ? "regex" : "contains";
  const action = rule.action || "remove";
  const title = rule.groupName || rule.name || "-";
  return `${index + 1}. *${title}*\n> pattern: \`${rule.pattern}\`\n> type: *${type}*\n> action: *${action}*`;
}

function getSessionKey(m) {
  return `${m.chat}:${m.sender}`;
}

function clearSession(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (_optionalChain([session, 'optionalAccess', _ => _.timeout])) clearTimeout(session.timeout);
  global.anticustomSessions.delete(sessionKey);
}

function refreshSessionTimeout(sessionKey) {
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return;
  if (session.timeout) clearTimeout(session.timeout);
  session.timeout = setTimeout(() => {
    const current = global.anticustomSessions.get(sessionKey);
    if (_optionalChain([current, 'optionalAccess', _2 => _2.startedAt]) === session.startedAt) {
      global.anticustomSessions.delete(sessionKey);
    }
  }, SESSION_TIMEOUT);
}

function normalizeAction(action, fallback = "remove") {
  const value = String(action || fallback).toLowerCase();
  if (["kick", "remove", "delete", "hapus"].includes(value)) {
    return value === "delete" || value === "hapus" ? "remove" : value;
  }
  return fallback;
}

function formatAction(action) {
  return action === "kick" ? "kick member" : "elimina mensaje";
}

function parsePatternAnswer(text) {
  const raw = String(text || "").trim();
  if (!raw) return { error: "La respuesta sigue vacía." };

  if (/^regex\s*:/i.test(raw)) {
    const pattern = raw.replace(/^regex\s*:/i, "").trim();
    if (!pattern) return { error: "Regex kosong. Isi setelah `regex:` ya." };
    try {
      new RegExp(pattern, "i");
    } catch (e) {
      return { error: "RegexNo válido." };
    }
    return {
      type: "regex",
      patterns: [pattern],
    };
  }

  const cleaned = raw.replace(/^contains\s*:/i, "").trim();
  const patterns = [
    ...new Set(
      cleaned
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  if (patterns.length === 0) {
    return { error: "Aún no tengo una palabra de que quiero ser decodificado." };
  }

  return {
    type: "contains",
    patterns,
  };
}

function buildSummary(session) {
  return (
    `> Judul: *${session.title}*\n` +
    `> Tipe deteksi: *${session.type}*\n` +
    `> Pattern: ${session.patterns.map((item) => `\`${item}\``).join(", ")}\n` +
    `> Action: *${formatAction(session.action)}*`
  );
}

async function sendPrompt(sock, m, text) {
  const sent = await sock.sendMessage(m.chat, { text }, { quoted: m });
  return _optionalChain([sent, 'optionalAccess', _3 => _3.key, 'optionalAccess', _4 => _4.id]) || null;
}

async function startWizard(m, sock, mode, isFirstSetup = false) {
  const sessionKey = getSessionKey(m);
  const existing = global.anticustomSessions.get(sessionKey);

  if (existing) {
    await m.reply(
      `⚠Todavía tienes tu sesión inacabada AntiCutom.\n\n` +
        `*La última pregunta sobre el bot para otro*\n` +
        `*O limitarlo a*\`${m.prefix}anticustom cancel\``,
    );
    return;
  }

  const session = {
    chat: m.chat,
    sender: m.sender,
    step: "title",
    title: "",
    type: "contains",
    patterns: [],
    action: normalizeAction(mode, "remove"),
    promptId: null,
    startedAt: Date.now(),
    timeout: null,
  };

  global.anticustomSessions.set(sessionKey, session);
  refreshSessionTimeout(sessionKey);

  const intro = isFirstSetup
    ? `🛡Bienvenidos a la punta del AntiCumpl\n\n` +
      `Le ayudaré a obtener AntiCumpt per sesi, paso a paso.\n\n` +
      `*Alurnya:*\n` +
      `1. Tentukan judul rule\n` +
      `2.\n` +
      `3. Seleccione la acción durante la detección\n` +
      `4. Konfirmasi detail akhir\n\n`
    : `🛡*Agreguemos una regla de nuevo AntiCutom*\n\n`;

  session.promptId = await sendPrompt(
    sock,
    m,
    intro +
      `*Pregunta 1/4*\n` +
      `Judulnya que?\n\n` +
      `Responder este mensaje con cualquier regla que quieras\n` +
      `> Ejemplo:\`Anti @-@ Word Kotor\``,
  );
}

function buildGuideMessage(m, status, mode, rules) {
  return (
    `🛡️ *ᴀɴᴛɪᴄᴜsᴛᴏᴍ*\n\n` +
    `> Status: *${status.toUpperCase()}*\n` +
    `*Modo predeterminado:*${normalizeAction(mode).toUpperCase()}*\n` +
    `> Total rule: *${rules.length}*\n\n` +
    `Quieres llamar a AntiCumpt de nuevo:\n` +
    `> \`${m.prefix}anticustom add\`\n\n` +
    `Usted quiere establecer el estado:\n` +
    `> \`${m.prefix}anticustom on\`\n` +
    `> \`${m.prefix}anticustom off\`\n\n` +
    `Quieres ver o eliminar la regla:\n` +
    `> \`${m.prefix}anticustom list\`\n` +
    `> \`${m.prefix}anticustom del <judul>\`\n\n` +
    `Usted quiere cambiar el modo predeterminado:\n` +
    `> \`${m.prefix}anticuoto método patada\`\n` +
    `> \`${m.prefix}método anticustoto eliminar\``
  );
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const sub = _optionalChain([args, 'access', _5 => _5[0], 'optionalAccess', _6 => _6.toLowerCase, 'call', _7 => _7()]);
  const groupData = db.getGroup(m.chat) || {};
  const rules = normalizeRules(groupData.anticustomRules);
  const mode = groupData.anticustomMode || "remove";
  const status = groupData.anticustom || "off";
  const sessionKey = getSessionKey(m);

  if (!sub) {
    if (rules.length === 0) {
      await startWizard(m, sock, mode, true);
      return;
    }

    await m.reply(buildGuideMessage(m, status, mode, rules));
    return;
  }

  if (sub === "add" || sub === "baru" || sub === "new" || sub === "buat") {
    await startWizard(m, sock, mode);
    return;
  }

  if (sub === "cancel" || sub === "batal") {
    if (!global.anticustomSessions.has(sessionKey)) {
      await m.reply("⚠No hay ningún anticumulto sesi caminando por ahí.");
      return;
    }
    clearSession(sessionKey);
    await m.reply("✅ Sesi AntiCustom dibatalkan.");
    return;
  }

  if (sub === "on") {
    db.setGroup(m.chat, { anticustom: "on" });
    await m.reply("✅ *AntiCustom diaktifkan*");
    return;
  }

  if (sub === "off") {
    db.setGroup(m.chat, { anticustom: "off" });
    await m.reply("❌ *AntiCustom dinonaktifkan*");
    return;
  }

  if (sub === "metode") {
    const action = normalizeAction(args[1], "");
    if (!action) {
      await m.reply(
        "❌Usa: `.anticustom metode kick` o `.anticustom metode remove`",
      );
      return;
    }
    db.setGroup(m.chat, { anticustom: "on", anticustomMode: action });
    await m.reply(
      `✅* Modo predeterminado AntiCumpt ahora${action.toUpperCase()}*`,
    );
    return;
  }

  if (sub === "list") {
    if (rules.length === 0) {
      await m.reply("📋Aún no hay una regla de AntiCumpt en este grupo.");
      return;
    }
    await m.reply(
      `📋 *ʟɪsᴛ ᴀɴᴛɪᴄᴜsᴛᴏᴍ*\n\n${rules.map(formatRule).join("\n\n")}`,
    );
    return;
  }

  if (sub === "del" || sub === "delete" || sub === "remove") {
    const name = args.slice(1).join(" ").trim().toLowerCase();
    if (!name) {
      await m.reply("❌ Format: `.anticustom del <judul>`");
      return;
    }

    const nextRules = rules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === name ||
        groupName === name ||
        ruleName.startsWith(`${name} #`)
      );
    });

    if (nextRules.length === rules.length) {
      await m.reply(`❌Regla por cabecera\`${name}\`no encontrado.`);
      return;
    }

    db.setGroup(m.chat, { anticustomRules: nextRules });
    await m.reply(`✅Regla por cabecera\`${name}\`eliminado correctamente.`);
    return;
  }

  await m.reply(
    "❌Subcomando inválido. Uso: on, off, list, add, del, metode, cancel",
  );
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;
  if (m.isCommand) return false;

  const sessionKey = getSessionKey(m);
  const session = global.anticustomSessions.get(sessionKey);
  if (!session) return false;
  if (session.chat !== m.chat || session.sender !== m.sender) return false;

  const quotedId = _optionalChain([m, 'access', _8 => _8.quoted, 'optionalAccess', _9 => _9.id]) || _optionalChain([m, 'access', _10 => _10.quoted, 'optionalAccess', _11 => _11.key, 'optionalAccess', _12 => _12.id]);
  if (!quotedId || quotedId !== session.promptId) return false;

  const text = String(m.body || "").trim();
  if (!text) return false;

  refreshSessionTimeout(sessionKey);

  if (session.step === "title") {
    if (text.length < 2 || text.length > 40) {
      await m.reply("❌Judul debe ser 2 @-@ 40 caracteres sí.");
      return true;
    }

    session.title = text;
    session.step = "patterns";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡Pregunta 2 / 4\n\n` +
        `Oke, judulnya *${session.title}*.\n\n` +
        `Ahora, dame las palabras que quiero leer.\n\n` +
        `Usted puede elegir uno de los fuertes:\n` +
        `♪ Contiene ♪: Enviar palabra separada un coma o un nuevo barril\n` +
        `*Rege*x*: comienza la respuesta con\`regex:\`\n\n` +
        `Ejemplo contains:\n` +
        `> \`anjing, goblok, tolol\`\n\n` +
        `Ejemplo regex:\n` +
        `♪\`regex: (anj|perro|a+n+j+)\`\n\n` +
        `* Responder ordene esto con su respuesta *`,
    );
    return true;
  }

  if (session.step === "patterns") {
    const parsed = parsePatternAnswer(text);
    if (parsed.error) {
      await m.reply(`❌ ${parsed.error}`);
      return true;
    }

    session.type = parsed.type;
    session.patterns = parsed.patterns;
    session.step = "action";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡* Pregunta 3 / 4*\n\n` +
        `Significa que quieres esto:\n` +
        `${session.patterns.map((item, index) => `${index + 1}. \`${item}\``).join("\n")}\n\n` +
        `> Tipe deteksi: *${session.type}*\n\n` +
        `* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *\n\n` +
        `* Responder este mensaje con: *\`elimina\`o\`Patito\``,
    );
    return true;
  }

  if (session.step === "action") {
    const action = normalizeAction(text, "");
    if (!action) {
      await m.reply("❌Responde con`elimina`o`Patito`si.");
      return true;
    }

    session.action = action;
    session.step = "confirm";
    session.promptId = await sendPrompt(
      sock,
      m,
      `🛡* Pregunta 4 / 4*\n\n` +
        `Bien, listo, el próximo detalle que deseas:\n\n` +
        `${buildSummary(session)}\n\n` +
        `¿Está funcionando?\n\n` +
        `* Responder este mensaje con: *\`si\`para salvar o\`cancelar\`para cancelando`,
    );
    return true;
  }

  if (session.step === "confirm") {
    if (/^(batal|cancel|tidak|nggak|ga|gak|no)$/i.test(text)) {
      clearSession(sessionKey);
      await m.reply(
        "✅Está bien, AntiCutom sesi está fuera de los libros.`- Anticosto añadir.`.",
      );
      return true;
    }

    if (!/^(ya|iya|y|yes|oke|ok|setuju|gas|lanjut|sip|siap)$/i.test(text)) {
      await m.reply(
        "❌Responde con`si`para salvar o`cancelar`para cancelando.",
      );
      return true;
    }

    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const groupData = db.getGroup(m.chat) || {};
    const currentRules = normalizeRules(groupData.anticustomRules);
    const titleKey = session.title.toLowerCase();
    const filteredRules = currentRules.filter((rule) => {
      const ruleName = String(rule.name || "").toLowerCase();
      const groupName = String(rule.groupName || "").toLowerCase();
      return !(
        ruleName === titleKey ||
        groupName === titleKey ||
        ruleName.startsWith(`${titleKey} #`)
      );
    });

    const createdAt = new Date().toISOString();
    const generatedRules = session.patterns.map((pattern, index) => ({
      name:
        session.patterns.length === 1
          ? session.title
          : `${session.title} #${index + 1}`,
      groupName: session.title,
      pattern,
      type: session.type,
      action: session.action,
      flags: "i",
      createdAt,
    }));

    db.setGroup(m.chat, {
      anticustom: "on",
      anticustomMode: session.action,
      anticustomRules: [...filteredRules, ...generatedRules],
    });

    clearSession(sessionKey);

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅* los anticuerpos tienen éxito en la elaboración del documento#93;\n\n` +
          `${buildSummary(session)}\n\n` +
          `* Automática de estado: * *\n` +
          `*La nueva regla total*${generatedRules.length}*\n\n` +
          `¿Quieres ver más árboles, amigo?\`${m.prefix}anticustom\``,
      },
      { quoted: m },
    );
    return true;
  }

  return false;
}

exports.config = pluginConfig; exports.handler = handler; exports.replyHandler = replyHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
