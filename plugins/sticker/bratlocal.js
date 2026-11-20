"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _canvas = require('@napi-rs/canvas');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _promises = require('fs/promises'); var _promises2 = _interopRequireDefault(_promises);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _child_process = require('child_process');
var _util = require('util');
var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const execFileAsync = _util.promisify.call(void 0, _child_process.execFile);

const pluginConfig = {
  name: "bratlocal",
  alias: ["bratgojo", "bratgojovid", "bratvermeil", "bratvermeilvid"],
  category: "canvas",
  description: "Bikin brat versi lokal (Gojo & Vermeil)",
  usage: ".bratgojo <teks>",
  example: ".bratgojo Halo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

const BRAT_FONT_URL = "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Poppins.ttf";
let isFontLoaded = false;

const TEMPLATES = {
  vermeil: {
    url: "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Vermile.jpg",
    safeZone: { a: 655, b: 1118, c: 282, d: 993 }
  },
  gojo: {
    url: "https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Gojo.jpeg",
    safeZone: { a: 660, b: 1180, c: 270, d: 990 }
  }
};

const CANVAS = { width: 1254, height: 1254 };

const TEXT_STYLE = {
  fontFamily: "Poppins",
  maxFontSize: 90,
  minFontSize: 22,
  lineHeight: 1.18,
  color: "#111111",
  align: "center"
};

const VIDEO_CONFIG = {
  outputFormat: "mp4",
  fast_progress: true,
  fps: 15,
  width: 512,
  height: 512,
  lyric: {
    maxWordPerLayer: 5,
    frameDuration: 0.7,
    lastFrameDuration: 1.5
  }
};

async function downloadBuffer(url) {
  const res = await _nodefetch2.default.call(void 0, url);
  if (!res.ok) {
    throw new Error(`Fallido download:${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tokenize(text) {
  return normalizeText(text)
    .replace(/[,，]/g, " ")
    .split(/\s+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function splitIntoLayers(tokens, maxWordPerLayer) {
  if (!Number.isFinite(maxWordPerLayer) || maxWordPerLayer <= 0) {
    return [tokens];
  }
  const layers = [];
  for (let i = 0; i < tokens.length; i += maxWordPerLayer) {
    layers.push(tokens.slice(i, i + maxWordPerLayer));
  }
  return layers;
}

function resolveDurations(frames, lyric) {
  return frames.map((frame) => {
    return frame.isLastInLayer
      ? Math.max(0.05, lyric.lastFrameDuration)
      : Math.max(0.05, lyric.frameDuration);
  });
}

function buildRevealFrames(text, configObj) {
  const tokens = tokenize(text);
  const layers = splitIntoLayers(tokens, configObj.lyric.maxWordPerLayer);
  const frames = [];

  for (const layer of layers) {
    let current = "";
    for (let i = 0; i < layer.length; i++) {
      current += (current ? " " : "") + layer[i];
      frames.push({
        text: current,
        isLastInLayer: i === layer.length - 1
      });
    }
  }

  const durations = resolveDurations(frames, configObj.lyric);
  return frames.map((frame, index) => ({
    ...frame,
    duration: durations[index]
  }));
}

function getSafeRect(zone) {
  return {
    x: zone.c,
    y: zone.a,
    w: zone.d - zone.c,
    h: zone.b - zone.a,
    centerX: (zone.c + zone.d) / 2,
    centerY: (zone.a + zone.b) / 2
  };
}

function setFont(ctx, size) {
  ctx.font = `${size}px ${TEXT_STYLE.fontFamily}`;
}

function splitLongWord(ctx, word, maxWidth) {
  const chars = [...word];
  const parts = [];
  let current = "";

  for (const char of chars) {
    const test = current + char;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
    } else {
      parts.push(current);
      current = char;
    }
  }

  if (current) {
    parts.push(current);
  }
  return parts;
}

function wrapParagraph(ctx, paragraph, maxWidth) {
  const words = paragraph.split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
      continue;
    }

    if (current) {
      lines.push(current);
      current = "";
    }

    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
    } else {
      const parts = splitLongWord(ctx, word, maxWidth);
      lines.push(...parts.slice(0, -1));
      current = parts.at(-1) || "";
    }
  }

  if (current) {
    lines.push(current);
  }
  return lines;
}

function wrapText(ctx, text, maxWidth) {
  return text
    .split("\n")
    .flatMap((paragraph) => {
      const clean = paragraph.trim();
      if (!clean) {
        return [""];
      }
      return wrapParagraph(ctx, clean, maxWidth);
    });
}

function fitText(ctx, text, rect) {
  for (let size = TEXT_STYLE.maxFontSize; size >= TEXT_STYLE.minFontSize; size--) {
    setFont(ctx, size);
    const lineHeight = Math.ceil(size * TEXT_STYLE.lineHeight);
    const lines = wrapText(ctx, text, rect.w);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= rect.h) {
      return { size, lines, lineHeight, totalHeight };
    }
  }

  const size = TEXT_STYLE.minFontSize;
  setFont(ctx, size);
  const lineHeight = Math.ceil(size * TEXT_STYLE.lineHeight);
  const lines = wrapText(ctx, text, rect.w);
  const maxLines = Math.max(1, Math.floor(rect.h / lineHeight));
  const clipped = lines.slice(0, maxLines);

  if (lines.length > maxLines && clipped.length) {
    let last = clipped[clipped.length - 1];
    while (last.length > 0 && ctx.measureText(`${last}...`).width > rect.w) {
      last = last.slice(0, -1);
    }
    clipped[clipped.length - 1] = `${last}...`;
  }

  return {
    size,
    lines: clipped,
    lineHeight,
    totalHeight: clipped.length * lineHeight
  };
}

function drawCenteredText(ctx, text, zone) {
  const rect = getSafeRect(zone);
  const fitted = fitText(ctx, text, rect);
  const startY = rect.y + (rect.h - fitted.totalHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();

  setFont(ctx, fitted.size);
  ctx.fillStyle = TEXT_STYLE.color;
  ctx.textAlign = TEXT_STYLE.align;
  ctx.textBaseline = "top";

  fitted.lines.forEach((line, index) => {
    const y = startY + index * fitted.lineHeight;
    ctx.fillText(line, rect.centerX, y);
  });

  ctx.restore();
}

async function createBratImage(text, template) {
  if (!isFontLoaded) {
    const fontBuffer = await downloadBuffer(BRAT_FONT_URL);
    _canvas.GlobalFonts.register(fontBuffer, TEXT_STYLE.fontFamily);
    isFontLoaded = true;
  }

  const imageBuffer = await downloadBuffer(template.url);
  const image = await _canvas.loadImage.call(void 0, imageBuffer);
  const canvas = _canvas.createCanvas.call(void 0, CANVAS.width, CANVAS.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0, CANVAS.width, CANVAS.height);
  drawCenteredText(ctx, text, template.safeZone);

  return await canvas.encode("png");
}

async function createFrame(image, text, filePath, template) {
  const canvas = _canvas.createCanvas.call(void 0, CANVAS.width, CANVAS.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0, CANVAS.width, CANVAS.height);
  drawCenteredText(ctx, text, template.safeZone);

  _fs2.default.writeFileSync(filePath, await canvas.encode("png"));
}

function escapeConcatPath(filePath) {
  return filePath.replace(/'/g, "'\\''");
}

function buildManifest(frames, framePaths) {
  const lines = [];
  for (let i = 0; i < frames.length; i++) {
    lines.push(`archivo '${escapeConcatPath(framePaths[i])}'`);
    lines.push(`duration ${frames[i].duration}`);
  }
  lines.push(`archivo '${escapeConcatPath(framePaths[framePaths.length - 1])}'`);
  return lines.join("\n");
}

async function encodeVideo(concatPath, outputPath, configObj) {
  if (configObj.outputFormat !== "mp4") {
    throw new Error("Está vez sólo genera soporte mp4");
  }

  const args = [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concatPath,
    "-vf", `fps=${configObj.fps},scale=${configObj.width}:${configObj.height}:flags=lanczos`,
    "-c:v", "libx264",
    "-preset", "veryfast",
    "-crf", "32",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outputPath
  ];

  await execFileAsync("ffmpeg", args, { maxBuffer: 1024 * 1024 * 10 });
}

async function createBratVideo(text, template) {
  const frames = buildRevealFrames(text, VIDEO_CONFIG);
  if (!frames.length) {
    throw new Error("Teks kosong");
  }

  const tmpDir = await _promises2.default.mkdtemp(_path2.default.join(_os2.default.tmpdir(), "bratvid-"));
  const outputPath = _path2.default.join(tmpDir, "output.mp4");

  try {
    if (!isFontLoaded) {
      const fontBuffer = await downloadBuffer(BRAT_FONT_URL);
      _canvas.GlobalFonts.register(fontBuffer, TEXT_STYLE.fontFamily);
      isFontLoaded = true;
    }

    const imageBuffer = await downloadBuffer(template.url);
    const image = await _canvas.loadImage.call(void 0, imageBuffer);

    const framePaths = frames.map((_, index) => {
      return _path2.default.join(tmpDir, `frame-${String(index + 1).padStart(4, "0")}.png`);
    });

    if (VIDEO_CONFIG.fast_progress) {
      const batchSize = 5;
      for (let start = 0; start < frames.length; start += batchSize) {
        const batch = frames.slice(start, start + batchSize);
        await Promise.all(batch.map((frame, i) => {
          const index = start + i;
          return createFrame(image, frame.text, framePaths[index], template);
        }));
      }
    } else {
      for (let i = 0; i < frames.length; i++) {
        await createFrame(image, frames[i].text, framePaths[i], template);
      }
    }

    const concatPath = _path2.default.join(tmpDir, "concat.txt");
    _fs2.default.writeFileSync(concatPath, buildManifest(frames, framePaths));

    await encodeVideo(concatPath, outputPath, VIDEO_CONFIG);

    const videoBuffer = _fs2.default.readFileSync(outputPath);
    return videoBuffer;
  } finally {
    await _promises2.default.rm(tmpDir, { recursive: true, force: true }).catch(() => { });
  }
}

async function handler(m, { sock }) {
  const text = m.text;
  if (!text) {
    return m.reply(`⚠️ Por favor introduce teksnya!\nEjemplo:\`${m.prefix}${m.command}Hola a todos.\``);
  }

  await m.react("🕕");

  try {
    const cmd = m.command.toLowerCase();
    let template;
    let isVideo = false;

    if (cmd === "bratgojo") {
      template = TEMPLATES.gojo;
    } else if (cmd === "bratgojovid") {
      template = TEMPLATES.gojo;
      isVideo = true;
    } else if (cmd === "bratvermeil") {
      template = TEMPLATES.vermeil;
    } else if (cmd === "bratvermeilvid") {
      template = TEMPLATES.vermeil;
      isVideo = true;
    } else {
      throw new Error("Comando inválido");
    }

    const inputText = normalizeText(text);

    if (isVideo) {
      const videoBuffer = await createBratVideo(inputText, template);
      const tempPath = _path2.default.join(_os2.default.tmpdir(), `bratvid-${Date.now()}.mp4`);
      _fs2.default.writeFileSync(tempPath, videoBuffer);

      await sock.sendVideoAsSticker(m.chat, tempPath, m, {
        packname: _configjs2.default.sticker.packname,
        author: _configjs2.default.sticker.author
      });

      try { _fs2.default.unlinkSync(tempPath); } catch (e) { }
    } else {
      const imageBuffer = await createBratImage(inputText, template);
      await sock.sendImageAsSticker(m.chat, imageBuffer, m, {
        packname: _configjs2.default.sticker.packname,
        author: _configjs2.default.sticker.author
      });
    }

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
