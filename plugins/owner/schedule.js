"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
/**
* @ llenar plugins / propietario / programa.
* @ descripción Mando para reubicar mensajes programados
 * @author Lucky Archz, Keisya, hyuuSATAN
 * @version 1.1.0
 */








var _ourinschedulerjs = require('../../src/lib/ourin-scheduler.js');
/**
* Configuración de los plugins
 */
const pluginConfig = {
  name: "schedule",
  alias: ["sched", "jadwal", "timer"],
  category: "owner",
  description: "Bikin recuerda o gratis @-@ rango con text personalizado",
  usage:
    ".schedule <add/edit/list/kategori/preset/detail/del/status> [options]",
  example: ".schedule preset sekolah 06:30",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const repeatKeywords = new Set(["repeat", "daily", "harian", "ulang"]);
const repeatOffKeywords = new Set([
  "once",
  "sekali",
  "off",
  "false",
  "no",
  "tidak",
  "0",
]);

const presetTemplates = {
  sekolah: {
    category: "sekolah",
    title: "Berangkat sekolah",
    customText: "Mandi, desayuno, chequea el autobús, y muévelo en un poco.",
    repeat: true,
    target: "me",
  },
  kerja: {
    category: "kerja",
    title: "Mulai kerja",
    customText: "Prepare dispositivos, compruebe tareas y comience a trabajar a tiempo.",
    repeat: true,
    target: "me",
  },
  turnamen: {
    category: "turnamen",
    title: "Persiapan turnamen",
    customText: "Listas de verificación, habitación, conexiones, y espera antes de que el partido sea cargado.",
    repeat: false,
    target: "here",
  },
  date: {
    category: "date",
    title: "Jadwal date",
    customText: "- Listo, mira la ubicación, y sube enseguida.",
    repeat: false,
    target: "me",
  },
};

const presetAliases = {
  school: "sekolah",
  sekolah: "sekolah",
  work: "kerja",
  kerja: "kerja",
  tournament: "turnamen",
  turnamen: "turnamen",
  scrim: "turnamen",
  date: "date",
  ngedate: "date",
  dating: "date",
};

const formatClock = (hour, minute) =>
  `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

const truncateText = (text = "", max = 90) =>
  text.length > max ? `${text.slice(0, max)}...` : text;

const normalizeCategory = (value = "") => String(value).trim().toLowerCase();

const getTaskCategory = (task) => normalizeCategory(task.category) || "umum";

const getTaskTitle = (task) => task.title || "Pengingat";

const getTaskText = (task, fallback = "-") =>
  task.customText || _optionalChain([task, 'access', _ => _.message, 'optionalAccess', _2 => _2.text]) || fallback;

const getTaskTargetLabel = (task) => task.targetLabel || task.jid;

function parseTimeString(value = "") {
  const normalized = String(value).trim().replace(/\./g, ":");
  const parts = normalized.split(":");

  if (parts.length !== 2) return null;

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return { hour, minute, label: formatClock(hour, minute) };
}

function isRepeatToken(value = "") {
  return repeatKeywords.has(String(value).trim().toLowerCase());
}

function isRepeatOffToken(value = "") {
  return repeatOffKeywords.has(String(value).trim().toLowerCase());
}

function parseRepeatValue(value = "") {
  if (isRepeatToken(value)) return true;
  if (isRepeatOffToken(value)) return false;
  throw new Error(
    "❌Repetición de Valor debe ser uno: repetir, lácteos, diarios, una vez, una vez, apagado",
  );
}

function looksLikeTarget(value = "") {
  const normalized = String(value).trim().toLowerCase();
  const digits = normalized.replace(/[^0-9]/g, "");
  return (
    ["me", "self", "here", "this"].includes(normalized) ||
    normalized.includes("@") ||
    digits.length >= 5
  );
}

function resolveTarget(targetValue, m) {
  const raw = String(targetValue || "here").trim();
  const normalized = raw.toLowerCase();

  if (!raw || normalized === "here" || normalized === "this") {
    return {
      jid: m.chat,
      label: m.isGroup ? "here (chat ini)" : "aquí (presente de la charla primate)",
    };
  }

  if (normalized === "me" || normalized === "self") {
    return {
      jid: m.sender,
      label: "me",
    };
  }

  if (raw.includes("@")) {
    return {
      jid: raw,
      label: raw,
    };
  }

  const digits = raw.replace(/[^0-9]/g, "");

  if (!digits) {
    return {
      jid: m.chat,
      label: m.isGroup ? "here (chat ini)" : "aquí (presente de la charla primate)",
    };
  }

  return {
    jid: `${digits}@s.whatsapp.net`,
    label: `${digits}@s.whatsapp.net`,
  };
}

function extractTailOptions(
  m,
  parts,
  defaultTargetToken = "here",
  defaultRepeat = false,
) {
  const tail = [...parts];
  let targetToken = defaultTargetToken;
  let repeat = defaultRepeat;

  while (tail.length > 1) {
    const last = tail[tail.length - 1];

    if (isRepeatToken(last)) {
      repeat = true;
      tail.pop();
      continue;
    }

    if (isRepeatOffToken(last)) {
      repeat = false;
      tail.pop();
      continue;
    }

    if (looksLikeTarget(last)) {
      targetToken = tail.pop();
      continue;
    }

    break;
  }

  return {
    content: tail.join(" | ").trim(),
    target: resolveTarget(targetToken, m),
    repeat,
  };
}

function resolvePresetTemplate(name = "") {
  const normalized = normalizeCategory(name);
  const key = presetAliases[normalized] || normalized;

  if (!key || !presetTemplates[key]) {
    return { key: "", config: null };
  }

  return { key, config: presetTemplates[key] };
}

function getTaskState(task) {
  return {
    hour: task.hour,
    minute: task.minute,
    label: formatClock(task.hour, task.minute),
    category: getTaskCategory(task),
    title: getTaskTitle(task),
    customText: getTaskText(task, ""),
    repeat: Boolean(task.repeat),
    target: {
      jid: task.jid,
      label: getTaskTargetLabel(task),
    },
    mode: task.mode || "planner",
  };
}

function buildTaskPayload(id, parsed, extra = {}) {
  return {
    id,
    jid: parsed.target.jid,
    message: { text: parsed.customText },
    hour: parsed.hour,
    minute: parsed.minute,
    repeat: parsed.repeat,
    category: normalizeCategory(parsed.category) || "umum",
    title: parsed.title || "Pengingat",
    customText: parsed.customText,
    targetLabel: parsed.target.label,
    mode: parsed.mode || "planner",
    createdAt: extra.createdAt || null,
    ...(extra.meta || {}),
  };
}

function buildHelpText(m) {
  return `📅 *SCHEDULE PLANNER*

Está función hace para resoles gratuitos o remotos.
Las semillas se utilizan para la escuela, estudio, trabajo, reunión, etiquetado, nombre de la excursión, o cualquier agente.

El pedido de entrega seguirá.xEs un regalo.

*Formato principal:*
\`.schedule add <HH:MM> | <kategori> | <judul> | <pesan> | [objetivo] | [repeat]\`

*Edit jadwal:*
\`.schedule edit <id> <HH:MM> | <kategori> | <judul> | <pesan> | [objetivo] | [repeat]\`
\`.schedule edit <id> time=08:00 | text=angkat rapat | repeat=off\`

*Filter categoría:*
\`.schedule kategori\`
\`. Programa de la escuela cathori\`

*Quick preset:*
\`.schedule preset list\`
\`. Escuela preestablecida de la Lista 06: 30\`
\`. Trabajo predefinido programa 09: 00 Tenga un mañana estándar\`

*Objetivo opcional:*
• \`Aquí.\`= enviar un èchat
• \`me\`= envihama al dueño de cit usted mismo
• \`628xxx@ s. whatsapp.\`= enviar a un número determinado

* Modo de repetición opcional: *
• \`repeat\`
• \`daily\`
• \`harian\`

*Ejemplo:*
\`.schedule add 06:30 | escuela | berangkat escuela | mandi, sarapan, comprueba buku | me | repeat\`
\`.schedule add 12:00 | trabaja | standup team | entrar room meeting hora 12 exacto | here | repeat\`
\`*No olvides venir a mi cama* *y quedarme en mi habitación*\`
\`. horario añadir 20: 00 p.m. Para la noche de los xenrooms abrir 15 minutos antes del comienzo de la hoeI\`

*Subcommand:*
• \`.schedule list\`
• \`.schedule categoría<nama>\`
• \`.schedule preset <nama> <HH:MM>\`
• \`.schedule edit <id> ...\`
• \`.schedule detail <id>\`
• \`.schedule del <id>\`
• \`.schedule status\`

* La vieja grasa todavía está soportada: *
\`. horario añadir 8: 00 am 628xxxEquipo de repita Samat mañana\``;
}

function parsePlannerInput(m, args) {
  const timeInfo = parseTimeString(args[1]);

  if (!timeInfo) {
    throw new Error(
      "❌Formado en mal tiempo. use HH: MM o HH.",
    );
  }

  const raw = args.slice(2).join(" ").trim();

  if (!raw) {
    throw new Error(
      "❌Formato:`. Calendario añadido.<HH:MM>♪<kategori>♪<judul>♪<pesan>*Apunto* *repetúa*`",
    );
  }

  if (!raw.includes("|")) {
    const target = resolveTarget(args[2], m);
    let repeat = false;
    let messageStart = 3;

    if (isRepeatToken(args[3])) {
      repeat = true;
      messageStart = 4;
    }

    const customText = args.slice(messageStart).join(" ").trim();

    if (!customText) {
      throw new Error("❌Mensaje ARMANGING NO ES KOONG");
    }

    return {
      ...timeInfo,
      category: "umum",
      title: "Pengingat",
      customText,
      repeat,
      target,
      mode: "legacy",
    };
  }

  const segments = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (segments.length < 3) {
    throw new Error(
      "❌Nuevo plano es mínimo:`. Calendario añadido.<HH:MM>♪<kategori>♪<judul>♪<pesan>`",
    );
  }

  const category = normalizeCategory(segments[0]) || "umum";
  const title = segments[1];
  const parsedTail = extractTailOptions(m, segments.slice(2));
  const customText = parsedTail.content;

  if (!customText) {
    throw new Error("❌ISI remtner can 't be empty");
  }

  return {
    ...timeInfo,
    category,
    title,
    customText,
    repeat: parsedTail.repeat,
    target: parsedTail.target,
    mode: "planner",
  };
}

function parsePresetInput(m, args) {
  const { key, config } = resolvePresetTemplate(args[1]);

  if (!config) {
    throw new Error(
      "❌Preset desconocido. Uso`. Lista de preconfiguración de los programas`para ver los presets disponibles.",
    );
  }

  const timeInfo = parseTimeString(args[2]);

  if (!timeInfo) {
    throw new Error(
      "❌Formato:`Predeterminado del programa.<nama> <HH:MM>♪<judul>♪<pesan>*Apunto* *repetúa*`",
    );
  }

  const raw = args.slice(3).join(" ").trim();
  let title = config.title;
  let customText = config.customText;
  let repeat = config.repeat;
  let target = resolveTarget(config.target, m);

  if (raw) {
    const segments = raw
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);

    if (segments.length === 1) {
      customText = segments[0];
    } else if (segments.length > 1) {
      title = segments[0] || title;
      const parsedTail = extractTailOptions(
        m,
        segments.slice(1),
        config.target,
        config.repeat,
      );

      customText = parsedTail.content || customText;
      repeat = parsedTail.repeat;
      target = parsedTail.target;
    }
  }

  return {
    ...timeInfo,
    category: config.category,
    title,
    customText,
    repeat,
    target,
    mode: "preset",
    presetKey: key,
  };
}

function parseEditInput(m, args, task) {
  const raw = args.slice(2).join(" ").trim();

  if (!raw) {
    throw new Error(
      "❌Formato edit:`. edición de horario.<id> <HH:MM>♪<kategori>♪<judul>♪<pesan>*Apunto* *repetúa*`o`. edición de horario.<id>Timme = 8: 00 p.m.x- Oye, repite.`",
    );
  }

  if (!raw.includes("=")) {
    const parsed = parsePlannerInput(m, ["add", ...args.slice(2)]);
    return {
      ...parsed,
      mode: task.mode || parsed.mode,
    };
  }

  const state = getTaskState(task);
  const segments = raw
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error("❌No se puede editar ningún campo.");
  }

  for (const segment of segments) {
    const separatorIndex = segment.indexOf("=");

    if (separatorIndex === -1) {
      throw new Error(
        "❌Formato de edición parcial debe`campo = valor`, ejemplo:`Timme = 8: 00 p.m.xt = ascensor juntos`",
      );
    }

    const field = normalizeCategory(segment.slice(0, separatorIndex));
    const value = segment.slice(separatorIndex + 1).trim();

    if (!value) {
      throw new Error(`❌Nili para el campo\`${field}\`puede no estar vacío`);
    }

    switch (field) {
      case "time":
      case "waktu":
      case "jam": {
        const timeInfo = parseTimeString(value);

        if (!timeInfo) {
          throw new Error(
            "❌Formato de tiempo de edición inválido. Uso HH: MM o HH.",
          );
        }

        state.hour = timeInfo.hour;
        state.minute = timeInfo.minute;
        state.label = timeInfo.label;
        break;
      }
      case "category":
      case "kategori":
        state.category = normalizeCategory(value) || "umum";
        break;
      case "title":
      case "judul":
        state.title = value;
        break;
      case "text":
      case "pesan":
      case "message":
      case "msg":
        state.customText = value;
        break;
      case "target":
      case "tujuan":
      case "jid":
        state.target = resolveTarget(value, m);
        break;
      case "repeat":
      case "ulang":
        state.repeat = parseRepeatValue(value);
        break;
      default:
        throw new Error(
          "❌Edición de campo no reconocida.xt, objetivo, repetir",
        );
    }
  }

  if (!state.customText) {
    throw new Error("❌ISI remtner can 't be empty");
  }

  return state;
}

function findTaskById(taskId) {
  return _ourinschedulerjs.getScheduledMessages.call(void 0, ).find((task) => task.id === taskId) || null;
}

function buildCategoryListText(tasks) {
  const categoryCounts = tasks.reduce((accumulator, task) => {
    const category = getTaskCategory(task);
    accumulator.set(category, (accumulator.get(category) || 0) + 1);
    return accumulator;
  }, new Map());

  const entries = [...categoryCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );

  let text = "🏷️ *KATEGORI JADWAL AKTIF*\n\n";

  for (const [category, total] of entries) {
    text += `• ${category} (${total})\n`;
  }

  text += "\nUsa`.schedule categoría<nama>`para el filtro de lista.";
  return text;
}

function buildPresetListText() {
  let text = "⚡ *QUICK PRESET SCHEDULE*\n\n";

  for (const [name, preset] of Object.entries(presetTemplates)) {
    text += `• *${name}*\n`;
    text += `  📝 ${preset.title}\n`;
    text += `  🔄 ${preset.repeat ? "Harian" : "Sekali"}\n`;
    text += `  📍Predeterminado objetivo:${preset.target}\n`;
    text += `  💬 ${truncateText(preset.customText, 100)}\n\n`;
  }

  text += "Pakai:\n";
  text += "`.schedule preset sekolah 06:30`\n";
  text +=
    "`.schedule preset kerja 09:00 | standup pagi | masuk room meeting | here | repeat`";
  return text;
}

function buildListText(tasks, header = null) {
  const sorted = [...tasks].sort(
    (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
  );
  let text = `${header || `📅 *SCHEDULE PLANNER (${sorted.length})*`}\n\n`;

  for (const task of sorted) {
    const msUntil = _ourinschedulerjs.getMsUntilTime.call(void 0, task.hour, task.minute);
    text += `• *${getTaskTitle(task)}*\n`;
    text += `  🆔 ${task.id}\n`;
    text += `  🏷️ ${getTaskCategory(task)}\n`;
    text += `  ⏰ ${formatClock(task.hour, task.minute)} WIB\n`;
    text += `  📍 ${getTaskTargetLabel(task)}\n`;
    text += `  🔄 ${task.repeat ? "Harian" : "Sekali"}\n`;
    text += `  🕕 ${_ourinschedulerjs.formatTimeRemaining.call(void 0, msUntil)} lagi\n`;
    text += `  📝 ${truncateText(getTaskText(task))}\n\n`;
  }

  return text.trim();
}

function buildDetailText(task) {
  const msUntil = _ourinschedulerjs.getMsUntilTime.call(void 0, task.hour, task.minute);
  return `📌 *DETAIL JADWAL*

🆔 ID: \`${task.id}\`
🏷️ Categoría:${getTaskCategory(task)}
📝 Judul: ${getTaskTitle(task)}
⏰Tiempo:${formatClock(task.hour, task.minute)} WIB
📍 Objetivo: ${getTaskTargetLabel(task)}
🔄 Mode: ${task.repeat ? "Harian" : "Sekali"}
🕕 Next run: ${_ourinschedulerjs.formatTimeRemaining.call(void 0, msUntil)}otra vez
🗓️ Creado:${task.createdAt || "-"}

Mensaje custom:
${getTaskText(task)}`;
}

/**
* Handler for comando schedule
 */
async function handler(m, { sock, args }) {
  const subCommand = _optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);

  if (!subCommand || ["help", "menu"].includes(subCommand)) {
    await m.reply(buildHelpText(m));
    return;
  }

  switch (subCommand) {
    case "add": {
      try {
        const parsed = parsePlannerInput(m, args);
        const id = `sched_${Date.now()}`;

        await _ourinschedulerjs.scheduleMessage.call(void 0, buildTaskPayload(id, parsed), sock);

        const msUntil = _ourinschedulerjs.getMsUntilTime.call(void 0, parsed.hour, parsed.minute);

        await m.reply(`✅* JADWAL MAKES PRETTY*

🆔 ID: \`${id}\`
🏷️ Categoría:${parsed.category}
📝 Judul: ${parsed.title}
⏰Tiempo:${parsed.label} WIB
📍 Objetivo: ${parsed.target.label}
🔄 Mode: ${parsed.repeat ? "Harian" : "Sekali"}
🕕 Next run: ${_ourinschedulerjs.formatTimeRemaining.call(void 0, msUntil)}otra vez

Text custom:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          _optionalChain([error, 'access', _6 => _6.message, 'optionalAccess', _7 => _7.startsWith, 'call', _8 => _8("❌")])
            ? error.message
            : _ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "preset": {
      if (!args[1] || ["list", "all"].includes(normalizeCategory(args[1]))) {
        await m.reply(buildPresetListText());
        return;
      }

      try {
        const parsed = parsePresetInput(m, args);
        const id = `sched_${Date.now()}`;

        await _ourinschedulerjs.scheduleMessage.call(void 0, 
          buildTaskPayload(id, parsed, {
            meta: { presetKey: parsed.presetKey },
          }),
          sock,
        );

        const msUntil = _ourinschedulerjs.getMsUntilTime.call(void 0, parsed.hour, parsed.minute);

        await m.reply(`✅* PRESET JADWAL MADE *

🆔 ID: \`${id}\`
⚡ Preset: ${parsed.presetKey}
🏷️ Categoría:${parsed.category}
📝 Judul: ${parsed.title}
⏰Tiempo:${parsed.label} WIB
📍 Objetivo: ${parsed.target.label}
🔄 Mode: ${parsed.repeat ? "Harian" : "Sekali"}
🕕 Next run: ${_ourinschedulerjs.formatTimeRemaining.call(void 0, msUntil)}otra vez

Text custom:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          _optionalChain([error, 'access', _9 => _9.message, 'optionalAccess', _10 => _10.startsWith, 'call', _11 => _11("❌")])
            ? error.message
            : _ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "edit": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Format: `.schedule edit <id> ...`");
        return;
      }

      const task = findTaskById(taskId);

      if (!task) {
        await m.reply(`❌Programa con id\`${taskId}\`no encontrado`);
        return;
      }

      try {
        const parsed = parseEditInput(m, args, task);

        await _ourinschedulerjs.scheduleMessage.call(void 0, 
          buildTaskPayload(task.id, parsed, {
            createdAt: task.createdAt,
            meta: { presetKey: task.presetKey || null },
          }),
          sock,
        );

        const msUntil = _ourinschedulerjs.getMsUntilTime.call(void 0, parsed.hour, parsed.minute);

        await m.reply(`✅* JADWAL TRABAJO EN EL DOE *

🆔 ID: \`${task.id}\`
🏷️ Categoría:${parsed.category}
📝 Judul: ${parsed.title}
⏰Tiempo:${parsed.label} WIB
📍 Objetivo: ${parsed.target.label}
🔄 Mode: ${parsed.repeat ? "Harian" : "Sekali"}
🕕 Next run: ${_ourinschedulerjs.formatTimeRemaining.call(void 0, msUntil)}otra vez

Text custom:
${truncateText(parsed.customText, 180)}`);
      } catch (error) {
        await m.reply(
          _optionalChain([error, 'access', _12 => _12.message, 'optionalAccess', _13 => _13.startsWith, 'call', _14 => _14("❌")])
            ? error.message
            : _ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName),
        );
      }
      break;
    }

    case "list": {
      const tasks = _ourinschedulerjs.getScheduledMessages.call(void 0, );

      if (tasks.length === 0) {
        await m.reply(
          "📅Aún no es activo. Uso`Horario.`Para ver al planificador de fortes.",
        );
        return;
      }

      await m.reply(buildListText(tasks));
      break;
    }

    case "kategori":
    case "category": {
      const tasks = _ourinschedulerjs.getScheduledMessages.call(void 0, );

      if (tasks.length === 0) {
        await m.reply(
          "📅Aún no es activo. Uso`Horario.`Para ver al planificador de fortes.",
        );
        return;
      }

      const categoryName = normalizeCategory(args.slice(1).join(" "));

      if (!categoryName) {
        await m.reply(buildCategoryListText(tasks));
        return;
      }

      const filteredTasks = tasks.filter(
        (task) => getTaskCategory(task) === categoryName,
      );

      if (!filteredTasks.length) {
        await m.reply(
          `❌No hay control activo para el category\`${categoryName}\``,
        );
        return;
      }

      await m.reply(
        buildListText(
          filteredTasks,
          `🏷️ *Categoría:${categoryName.toUpperCase()} (${filteredTasks.length})*`,
        ),
      );
      break;
    }

    case "detail":
    case "show":
    case "view": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Format: `.schedule detail <id>`");
        return;
      }

      const task = findTaskById(taskId);

      if (!task) {
        await m.reply(`❌Programa con id\`${taskId}\`no encontrado`);
        return;
      }

      await m.reply(buildDetailText(task));
      break;
    }

    case "del":
    case "delete":
    case "remove": {
      const taskId = args[1];

      if (!taskId) {
        await m.reply("❌ Format: `.schedule del <id>`");
        return;
      }

      const existingTask = findTaskById(taskId);
      const cancelled = _ourinschedulerjs.cancelScheduledMessage.call(void 0, taskId);

      if (cancelled) {
        await m.reply(
          `✅ Jadwal \`${taskId}\`eliminado${_optionalChain([existingTask, 'optionalAccess', _15 => _15.title]) ? `\n\n📝 ${existingTask.title}` : ""}`,
        );
      } else {
        await m.reply(`❌ Jadwal \`${taskId}\`no encontrado`);
      }
      break;
    }

    case "status": {
      const status = _ourinschedulerjs.getSchedulerStatus.call(void 0, );
      const tasks = _ourinschedulerjs.getScheduledMessages.call(void 0, );
      const categories = [
        ...new Set(tasks.map((task) => getTaskCategory(task))),
      ];

      const text = `📊 *SCHEDULE PLANNER STATUS*

📝Jadwal activo:${status.scheduledMessagesCount}
🏷️ Categoría activo: ${categories.length ? categories.join(", ") : "-"}
📨Reminder enviado:${status.totalMessagesSent}
🔄Reajuste límite de la láctea:${status.dailyResetEnabled ? "✅ Active" : "❌ Inactive"}
📅Last restablecer:${status.lastLimitReset}

Usa\`Lista de horarios.\`para ver todo el control activo.`;

      await m.reply(text);
      break;
    }

    default:
      await m.reply(
        "❌Subcomandancia no reconocida. Uso: añadir, editar, lista, cathegori, preset, detalles, del, estadísticas",
      );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
